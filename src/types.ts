export type WasteCategoryKey = 'recyclable' | 'organic' | 'general' | 'hazardous' | 'ewaste';

export interface WasteAnalysisResult {
  itemName: string;
  categoryKey: WasteCategoryKey;
  categoryName: string;
  binColor: string;
  binHexColor: string;
  confidence: number;
  material: string;
  recyclableValue?: string;
  sortingSteps: string[];
  environmentalImpact: string;
  ecoPoints: number;
  creativeUpcyclingTip?: string;
  warningNote?: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  imageDataUrl: string;
  result: WasteAnalysisResult;
}

export interface BinCategoryInfo {
  key: WasteCategoryKey;
  name: string;
  binColorName: string;
  hexColor: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
  description: string;
  acceptedItems: string[];
  prohibitedItems: string[];
  tips: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  imageUrl?: string;
  options: {
    text: string;
    categoryKey: WasteCategoryKey;
  }[];
  correctIndex: number;
  explanation: string;
}
