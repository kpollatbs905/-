import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload size limit for camera base64 images
  app.use(express.json({ limit: "20mb" }));

  // Initialize Gemini API client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน Environment Variables กรุณาระบุ GEMINI_API_KEY ก่อนเริ่มใช้งาน");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: Analyze Waste Image
  app.post("/api/analyze-waste", async (req, res) => {
    try {
      const { image, userPrompt } = req.body;

      if (!image) {
        return res.status(400).json({ error: "โปรดระบุรูปภาพขยะเพื่อทำการวิเคราะห์ (Image is required)" });
      }

      // Format base64 image data
      let base64Data = image;
      let mimeType = "image/jpeg";

      if (image.includes(";base64,")) {
        const parts = image.split(";base64,");
        mimeType = parts[0].replace("data:", "");
        base64Data = parts[1];
      }

      const ai = getGeminiClient();

      const systemInstruction = `คุณคือวิศวกรและผู้เชี่ยวชาญด้านการจัดการขยะและการรีไซเคิลตามมาตรฐานประเทศไทย (Thai Waste Management & Recycling Specialist)
หน้าที่ของคุณคือวิเคราะห์รูปภาพขยะที่ส่งมาอย่างละเอียด ระบุประเภทของขยะ จัดหมวดหมู่เข้าถังขยะสีที่ถูกต้องของไทย และให้ขั้นตอนการเตรียมขยะก่อนทิ้งที่ชัดเจนที่สุด

หมวดหมู่ถังขยะมาตรฐานประเทศไทย:
1. recyclable (ขยะรีไซเคิล): สีเหลือง (#EAB308) - เช่น ขวดพลาสติก PET, กระป๋องอลูมิเนียม, กล่องกระดาษ, ขวดแก้ว, โลหะ
2. organic (ขยะย่อยสลาย / ขยะอินทรีย์): สีเขียว (#16A34A) - เช่น เศษอาหาร, เปลือกผลไม้, เศษผัก, เศษใบไม้, ซากพืช
3. general (ขยะทั่วไป): สีน้ำเงิน (#2563EB) - เช่น ถุงพลาสติกเปื้อนอาหาร, ซองขนมขบเคี้ยว, ซองซอส, กล่องโฟมเปื้อน, กระดาษทิชชู่ใช้แล้ว
4. hazardous (ขยะอันตราย): สีแดง (#DC2626) - เช่น ถ่านไฟฉาย, หลอดไฟ, กระป๋องสเปรย์, ขวดยาพ่น, สารเคมี, แบตเตอรี่
5. ewaste (ขยะอิเล็กทรอนิกส์): สีม่วง/เทา (#7C3AED) - เช่น โทรศัพท์เก่า, สายชาร์จ, แผงวงจร, พาวเวอร์แบงก์, อุปกรณ์คอมพิวเตอร์

ให้คำตอบเป็นภาษาไทยที่สุภาพ เข้าใจง่าย ถูกต้อง แม่นยำ`;

      const prompt = userPrompt
        ? `ระบุชนิดขยะในภาพนี้ และคำถามเพิ่มเติมจากผู้ใช้: "${userPrompt}"`
        : "จำแนกชนิดขยะในรูปภาพนี้ บอกประเภทถังขยะ สีถังขยะ และวิธีคัดเตรียมก่อนทิ้งอย่างถูกต้อง";

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              itemName: {
                type: Type.STRING,
                description: "ชื่อวัตถุหรือขยะที่พบในภาพ เช่น ขวดพลาสติก PET, กระป๋องน้ำอัดลมอลูมิเนียม",
              },
              categoryKey: {
                type: Type.STRING,
                description: "รหัสหมวดหมู่: recyclable, organic, general, hazardous, ewaste",
              },
              categoryName: {
                type: Type.STRING,
                description: "ชื่อหมวดหมู่ภาษาไทย เช่น ขยะรีไซเคิล, ขยะย่อยสลาย, ขยะทั่วไป, ขยะอันตราย, ขยะอิเล็กทรอนิกส์",
              },
              binColor: {
                type: Type.STRING,
                description: "สีถังขยะตามมาตรฐานไทย เช่น ถังสีเหลือง, ถังสีเขียว, ถังสีน้ำเงิน, ถังสีแดง, ถังสีม่วง/เทา",
              },
              binHexColor: {
                type: Type.STRING,
                description: "รหัสสี Hex code สำหรับ UI เช่น #EAB308 (เหลือง), #16A34A (เขียว), #2563EB (น้ำเงิน), #DC2626 (แดง), #7C3AED (ม่วง)",
              },
              confidence: {
                type: Type.NUMBER,
                description: "ระดับความมั่นใจในการจำแนกเป็นเปอร์เซ็นต์ (0 - 100)",
              },
              material: {
                type: Type.STRING,
                description: "ชนิดของวัสดุหลัก เช่น พลาสติก PET #1, อลูมิเนียม, เศษอาหาร, พลาสติกปนเปื้อน Multi-layer",
              },
              recyclableValue: {
                type: Type.STRING,
                description: "มูลค่ารีไซเคิลหรือศักยภาพในการขาย เช่น สามารถขายให้ร้านรับซื้อของเก่าได้ประมาณ 8-12 บาท/กก. หรือ ไม่มีมูลค่าทางการค้า",
              },
              sortingSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "ขั้นตอนการจัดการเตรียมขยะก่อนทิ้งเรียงเป็นข้อๆ เช่น 1. เทน้ำออก 2. ล้างให้สะอาด 3. บีบอัดให้แบน 4. แยกฝาออกจากขวด",
              },
              environmentalImpact: {
                type: Type.STRING,
                description: "ข้อมูลผลกระทบต่อสิ่งแวดล้อม เช่น ใช้เวลาย่อยสลาย 450 ปี หากนำมารีไซเคิลจะช่วยลดการปล่อยก๊าซเรือนกระจก",
              },
              ecoPoints: {
                type: Type.NUMBER,
                description: "คะแนนพฤติกรรมสีเขียวสำหรับการทิ้งถูกต้อง เช่น 10, 20, 30",
              },
              creativeUpcyclingTip: {
                type: Type.STRING,
                description: "ไอเดียประดิษฐ์หรือนำกลับมาใช้ใหม่ (ถ้ามี) เช่น นำไปตัดทำเป็นกระถางต้นไม้ D.I.Y.",
              },
              warningNote: {
                type: Type.STRING,
                description: "คำเตือนข้อระวังด้านความปลอดภัย (ถ้ามี) เช่น ห้ามเผาเด็ดขาด, ระวังสารเคมีรั่วซึม",
              },
            },
            required: [
              "itemName",
              "categoryKey",
              "categoryName",
              "binColor",
              "binHexColor",
              "confidence",
              "material",
              "sortingSteps",
              "environmentalImpact",
              "ecoPoints",
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("ไม่ได้รับข้อมูลการวิเคราะห์จาก AI");
      }

      const result = JSON.parse(responseText);
      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error analyzing waste image:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "เกิดข้อผิดพลาดในการวิเคราะห์ขยะ กรุณาลองใหม่อีกครั้ง",
      });
    }
  });

  // Vite development middleware vs Static Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
