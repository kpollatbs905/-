export interface SampleWasteItem {
  id: string;
  name: string;
  category: string;
  badgeColor: string;
  description: string;
  svgIcon: string;
  dataUrl: string; // Base64 data URL representation
}

// Generate lightweight base64 SVG data URLs for sample testing
function createSvgDataUrl(bgGradStart: string, bgGradEnd: string, emoji: string, title: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradStart}" />
        <stop offset="100%" stop-color="${bgGradEnd}" />
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)" rx="24"/>
    <circle cx="200" cy="180" r="100" fill="white" opacity="0.25"/>
    <text x="200" y="210" font-size="110" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    <rect x="30" y="310" width="340" height="60" rx="16" fill="rgba(255,255,255,0.92)"/>
    <text x="200" y="348" font-size="22" font-weight="bold" font-family="sans-serif" fill="#1e293b" text-anchor="middle">${title}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const SAMPLE_WASTE_ITEMS: SampleWasteItem[] = [
  {
    id: 'sample-1',
    name: 'ขวดพลาสติกน้ำดื่ม (PET)',
    category: 'ขยะรีไซเคิล',
    badgeColor: 'bg-yellow-500 text-white',
    description: 'ขวดพลาสติกใส PET #1 สำหรับบรรจุน้ำดื่ม',
    svgIcon: '🍾',
    dataUrl: createSvgDataUrl('#FBBF24', '#D97706', '🍾', 'ขวดพลาสติก PET')
  },
  {
    id: 'sample-2',
    name: 'กระป๋องอลูมิเนียมน้ำอัดลม',
    category: 'ขยะรีไซเคิล',
    badgeColor: 'bg-yellow-500 text-white',
    description: 'กระป๋องอลูมิเนียมเครื่องดื่ม สามารถรีไซเคิลได้ไม่จำกัดครั้ง',
    svgIcon: '🥫',
    dataUrl: createSvgDataUrl('#F59E0B', '#B45309', '🥫', 'กระป๋องอลูมิเนียม')
  },
  {
    id: 'sample-3',
    name: 'เปลือกกล้วย & เศษอาหาร',
    category: 'ขยะย่อยสลาย',
    badgeColor: 'bg-green-600 text-white',
    description: 'เศษอินทรีย์วัตถุที่เน่าเสียและย่อยสลายได้ง่าย',
    svgIcon: '🍌',
    dataUrl: createSvgDataUrl('#34D399', '#059669', '🍌', 'เปลือกกล้วย/เศษอาหาร')
  },
  {
    id: 'sample-4',
    name: 'ซองขนมบิสกิต/ถุงพลาสติก',
    category: 'ขยะทั่วไป',
    badgeColor: 'bg-blue-600 text-white',
    description: 'ถุงซองขนมฟอยล์หลากชั้น ย่อยสลายและรีไซเคิลยาก',
    svgIcon: '🍿',
    dataUrl: createSvgDataUrl('#60A5FA', '#2563EB', '🍿', 'ซองขนม/ถุงพลาสติก')
  },
  {
    id: 'sample-5',
    name: 'ถ่านไฟฉาย AA ใช้แล้ว',
    category: 'ขยะอันตราย',
    badgeColor: 'bg-red-600 text-white',
    description: 'มีโลหะหนักและเคมีอันตราย ต้องแยกทิ้งถังสีแดง',
    svgIcon: '🔋',
    dataUrl: createSvgDataUrl('#F87171', '#DC2626', '🔋', 'ถ่านไฟฉาย AA')
  },
  {
    id: 'sample-6',
    name: 'โทรศัพท์มือถือชำรุด (E-Waste)',
    category: 'ขยะอิเล็กทรอนิกส์',
    badgeColor: 'bg-purple-600 text-white',
    description: 'ขยะอิเล็กทรอนิกส์ มีแผงวงจรและชิ้นส่วนโลหะสกัดได้',
    svgIcon: '📱',
    dataUrl: createSvgDataUrl('#C084FC', '#7C3AED', '📱', 'สมาร์ตโฟนเก่า E-Waste')
  }
];
