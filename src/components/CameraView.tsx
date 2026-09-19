import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, SwitchCamera, Upload, Sparkles, RefreshCw, AlertCircle, HelpCircle, Image as ImageIcon, Zap, CheckCircle2 } from 'lucide-react';
import { SAMPLE_WASTE_ITEMS, SampleWasteItem } from '../data/sampleImages';

interface CameraViewProps {
  onAnalyzeImage: (imageDataUrl: string, userPrompt?: string) => Promise<void>;
  isAnalyzing: boolean;
  error: string | null;
  clearError: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onAnalyzeImage,
  isAnalyzing,
  error,
  clearError,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cycling loading message phrases
  const loadingMessages = [
    'กำลังวิเคราะห์พิกเซลและลักษณะของขยะ...',
    'กำลังตรวจสอบประเภทวัสดุและรหัสรีไซเคิล...',
    'กำลังระบุสีถังขยะตามมาตรฐานประเทศไทย...',
    'กำลังสร้างขั้นตอนการคัดแยกขยะที่ถูกต้อง...'
  ];

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('ไม่สามารถเข้าถึงกล้องถ่ายรูปได้ โปรดตรวจสอบการอนุญาตใช้งานกล้อง หรือใช้การอัปโหลดรูปภาพแทน');
      setCameraActive(false);
    }
  }, [facingMode]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Toggle Facing Mode
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode, cameraActive, startCamera]);

  // Helper to resize & compress image to ensure fast upload and avoid Vercel 4.5MB payload limit
  const resizeAndCompressImage = (dataUrlOrFile: string | File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
          resolve(typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = tempCanvas.toDataURL('image/jpeg', 0.85);
        resolve(compressed);
      };

      img.onerror = () => reject(new Error('ไม่สามารถประมวลผลรูปภาพได้'));

      if (typeof dataUrlOrFile === 'string') {
        img.src = dataUrlOrFile;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = (e.target?.result as string) || '';
        };
        reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
        reader.readAsDataURL(dataUrlOrFile);
      }
    });
  };

  // Capture Photo from Camera
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.88);
      try {
        const optimized = await resizeAndCompressImage(rawDataUrl);
        setSelectedImage(optimized);
      } catch {
        setSelectedImage(rawDataUrl);
      }
      stopCamera();
    }
  };

  // Handle File Upload with auto-compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('โปรดเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)');
      return;
    }

    try {
      const optimized = await resizeAndCompressImage(file);
      setSelectedImage(optimized);
      stopCamera();
      clearError();
    } catch (err) {
      console.error('Image compression failed, falling back to raw reader', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        stopCamera();
        clearError();
      };
      reader.readAsDataURL(file);
    }
  };

  // Select Sample Waste Image
  const handleSelectSample = (sample: SampleWasteItem) => {
    setSelectedImage(sample.dataUrl);
    stopCamera();
    clearError();
  };

  // Trigger Analysis
  const handleAnalyze = async () => {
    if (!selectedImage) return;
    await onAnalyzeImage(selectedImage, userPrompt.trim() || undefined);
  };

  // Reset Image Selection
  const handleReset = () => {
    setSelectedImage(null);
    clearError();
  };

  return (
    <div className="space-[#space] space-y-6">
      {/* Hidden canvas & file input */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Scanner Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-emerald-100/80 overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              AI Waste Detector Camera
            </span>
          </div>
          {cameraActive && (
            <button
              onClick={toggleFacingMode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
              <span>สลับกล้อง</span>
            </button>
          )}
        </div>

        {/* Display Area: Video Feed OR Selected Image OR Camera Prompt */}
        <div className="relative aspect-4/3 sm:aspect-16/9 bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          {/* 1. Camera Active View */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
          />

          {/* Camera Scanning Laser Overlay when active */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/40 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-[bounce_2s_infinite]" />
              <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-12 h-12 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0 rounded-tl-lg" />
                <div className="w-12 h-12 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0 rounded-tr-lg" />
                <div className="w-12 h-12 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0 rounded-bl-lg" />
                <div className="w-12 h-12 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0 rounded-br-lg" />
                <span className="text-xs font-medium text-white/70 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs">
                  วางขยะไว้ตรงกลางกรอบ
                </span>
              </div>
            </div>
          )}

          {/* 2. Selected Captured / Uploaded Image View */}
          {!cameraActive && selectedImage && (
            <div className="relative w-full h-full group">
              <img
                src={selectedImage}
                alt="Selected waste item"
                className="w-full h-full object-contain bg-slate-950/90"
              />
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all text-xs flex items-center gap-1 px-3"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>เปลี่ยนรูป</span>
              </button>

              {/* Scanning Animation Overlay when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
                  <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping" />
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                    <Sparkles className="w-8 h-8 text-emerald-400 absolute" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-300 mb-1">
                    AI กำลังวิเคราะห์ขยะ...
                  </h3>
                  <p className="text-sm text-slate-300 font-medium h-6 transition-all duration-300">
                    {loadingMessages[loadingStep]}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. Initial Empty State View */}
          {!cameraActive && !selectedImage && (
            <div className="p-6 text-center text-slate-300 flex flex-col items-center justify-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                ถ่ายภาพหรืออัปโหลดขยะที่ต้องการแยก
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                ระบบ AI จะวิเคราะห์ประเภทขยะ ระบุสีถังขยะ และแนะนำวิธีจัดการอย่างถูกวิธี
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  id="btn-open-camera"
                  onClick={startCamera}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>เปิดกล้องถ่ายรูป</span>
                </button>

                <button
                  id="btn-upload-image"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>เลือกรูปในเครื่อง</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls for Active Camera */}
        {cameraActive && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              id="btn-capture-photo"
              onClick={capturePhoto}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
            >
              <Zap className="w-5 h-5 fill-white text-emerald-600" />
              <span>ถ่ายภาพวิเคราะห์</span>
            </button>
          </div>
        )}

        {/* Camera Access Error Alert */}
        {cameraError && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>{cameraError}</p>
          </div>
        )}

        {/* Selected Image Analysis Bar */}
        {selectedImage && !isAnalyzing && (
          <div className="mt-4 space-y-3 pt-3 border-t border-slate-100">
            {/* Optional Custom Question */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="มีข้อสงสัยเพิ่มเติม? (เช่น ทิ้งขยะนี้ขายได้กี่บาท?)"
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                เลือกรูปใหม่
              </button>
              <button
                id="btn-start-analyze"
                onClick={handleAnalyze}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>วิเคราะห์ด้วย AI</span>
              </button>
            </div>
          </div>
        )}

        {/* General Error Banner */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 font-bold shrink-0 underline"
            >
              ปิด
            </button>
          </div>
        )}
      </div>

      {/* Preset Sample Waste Gallery for Immediate Testing */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              หรือเลือกรูปตัวอย่างขยะทดสอบระบบสแกน
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            คลิกเลือกเพื่อทดสอบ AI ทันที
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {SAMPLE_WASTE_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectSample(item)}
              disabled={isAnalyzing}
              className="group flex flex-col items-center bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-2xl p-2.5 transition-all text-left hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-200/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 w-full text-center">
                {item.name}
              </span>
              <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor}`}>
                {item.category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
