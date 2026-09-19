import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameraView } from './components/CameraView';
import { AnalysisResult } from './components/AnalysisResult';
import { BinGuideView } from './components/BinGuideView';
import { HistoryLog } from './components/HistoryLog';
import { EcoQuiz } from './components/EcoQuiz';
import { WasteAnalysisResult, ScanHistoryItem } from './types';
import { Leaf, Award, Recycle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'guide' | 'history' | 'quiz'>('scan');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    result: WasteAnalysisResult;
    image: string;
  } | null>(null);

  // LocalStorage state for history & eco points
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ecoscan_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [totalEcoPoints, setTotalEcoPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ecoscan_points');
      return saved ? parseInt(saved, 10) : 50; // Starting bonus 50 points
    } catch (e) {
      return 50;
    }
  });

  const [savedScanIds, setSavedScanIds] = useState<Set<string>>(new Set());

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecoscan_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Save points to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecoscan_points', totalEcoPoints.toString());
    } catch (e) {
      console.error('Failed to save points to localStorage', e);
    }
  }, [totalEcoPoints]);

  // Handle Analyze Image via Server Endpoint
  const handleAnalyzeImage = async (imageDataUrl: string, userPrompt?: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageDataUrl,
          userPrompt,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          throw new Error('ไม่สามารถอ่านข้อมูล JSON จากระบบวิเคราะห์ได้');
        }
      } else {
        const rawText = await response.text();
        if (response.status === 404) {
          throw new Error(
            'ไม่พบ API /api/analyze-waste (404 Not Found) หากใช้งานบน Vercel กรุณาตรวจสอบว่ามีไฟล์ api/analyze-waste.ts และตั้งค่า Environment Variables เรียบร้อยแล้ว'
          );
        } else if (response.status === 413) {
          throw new Error('ขนาดรูปภาพใหญ่เกินขีดจำกัด (413 Payload Too Large) ระบบจะทำการบีบอัดรูปภาพให้อัตโนมัติ โปรดลองเลือกรูปภาพใหม่อีกครั้ง');
        } else {
          throw new Error(
            `เซิร์ฟเวอร์ตอบกลับรหัส ${response.status}: ${rawText.slice(0, 150)}`
          );
        }
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพขยะ');
      }

      setCurrentAnalysis({
        result: data.data,
        image: imageDataUrl,
      });
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'ไม่สามารถติดต่อระบบวิเคราะห์ได้ โปรดลองอีกครั้ง');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save current scan to history
  const handleSaveHistory = (result: WasteAnalysisResult, image: string) => {
    const newId = `scan-${Date.now()}`;
    const newHistoryItem: ScanHistoryItem = {
      id: newId,
      timestamp: new Date().toISOString(),
      imageDataUrl: image,
      result,
    };

    setHistory((prev) => [newHistoryItem, ...prev]);
    setTotalEcoPoints((prev) => prev + (result.ecoPoints || 10));
    setSavedScanIds((prev) => new Set(prev).add(newId));
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all history
  const handleClearAllHistory = () => {
    if (window.confirm('คุณต้องการลบประวัติการสแกนทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
    }
  };

  // Select scan from history
  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    setCurrentAnalysis({
      result: item.result,
      image: item.imageDataUrl,
    });
    setActiveTab('scan');
  };

  // Add bonus points from quiz
  const handleAddEcoPoints = (points: number) => {
    setTotalEcoPoints((prev) => prev + points);
  };

  // Rescan / Reset current view
  const handleRescan = () => {
    setCurrentAnalysis(null);
    setError(null);
    setActiveTab('scan');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'scan') {
            // Keep analysis if tab switched back
          }
        }}
        totalEcoPoints={totalEcoPoints}
        scanCount={history.length}
      />

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Tab 1: Camera Scan & Analysis */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {currentAnalysis ? (
              <AnalysisResult
                result={currentAnalysis.result}
                capturedImage={currentAnalysis.image}
                onRescan={handleRescan}
                onSaveHistory={handleSaveHistory}
                isSaved={false}
              />
            ) : (
              <CameraView
                onAnalyzeImage={handleAnalyzeImage}
                isAnalyzing={isAnalyzing}
                error={error}
                clearError={() => setError(null)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Bin Guide */}
        {activeTab === 'guide' && <BinGuideView />}

        {/* Tab 3: History Log */}
        {activeTab === 'history' && (
          <HistoryLog
            history={history}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearAllHistory={handleClearAllHistory}
            onSelectScan={handleSelectHistoryItem}
          />
        )}

        {/* Tab 4: Eco Quiz */}
        {activeTab === 'quiz' && (
          <EcoQuiz onAddEcoPoints={handleAddEcoPoints} />
        )}
      </main>

      {/* Persistent Eco Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">EcoScan AI</span>
            <span>— ร่วมสร้างประเทศไทยไร้ขยะ เริ่มต้นที่การแยกขยะถูกถัง</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>มาตรฐานถังขยะประเทศไทย 5 สี</span>
            <span>•</span>
            <span>Gemini 3.6 Flash Vision</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
