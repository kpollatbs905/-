import React, { useState } from 'react';
import {
  WasteAnalysisResult,
} from '../types';
import {
  CheckCircle2,
  Trash2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  Share2,
  Bookmark,
  Check,
  ShieldAlert,
  BarChart3,
  Leaf,
  Info
} from 'lucide-react';

interface AnalysisResultProps {
  result: WasteAnalysisResult;
  capturedImage: string;
  onRescan: () => void;
  onSaveHistory: (result: WasteAnalysisResult, image: string) => void;
  isSaved: boolean;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  capturedImage,
  onRescan,
  onSaveHistory,
  isSaved,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(
    new Array(result.sortingSteps.length).fill(false)
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Toggle checklist item
  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const completedStepsCount = checkedSteps.filter(Boolean).length;
  const isAllStepsCompleted = completedStepsCount === result.sortingSteps.length && result.sortingSteps.length > 0;

  // Web Speech API - Text to Speech in Thai
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('เบราว์เซอร์ของคุณไม่รองรับระบบเสียงอ่านภาษาไทย');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const stepsText = result.sortingSteps.join('. ');
    const textToSpeak = `ขยะชิ้นนี้คือ ${result.itemName} จัดอยู่ในประเภท ${result.categoryName} ควรทิ้งลง${result.binColor} ขั้นตอนการแยกขยะมีดังนี้ ${stepsText}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'th-TH';
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsPlayingAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Copy Summary to Clipboard
  const handleCopyShare = () => {
    const text = `🌱 EcoScan AI - ผลวิเคราะห์ขยะ:
📦 วัตถุ: ${result.itemName}
🗑️ ทิ้งลง: ${result.binColor} (${result.categoryName})
🧪 วัสดุ: ${result.material}
📋 วิธีเตรียม: ${result.sortingSteps.join(' > ')}
⭐ แต้มรักษ์โลก: +${result.ecoPoints} แต้ม`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Main Classification Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-emerald-100 relative overflow-hidden">
        {/* Bin Color Accent Top Border */}
        <div
          className="absolute top-0 left-0 right-0 h-3"
          style={{ backgroundColor: result.binHexColor }}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
          {/* Left: Image Snapshot */}
          <div className="md:col-span-5 relative group rounded-2xl overflow-hidden border border-slate-200 shadow-sm aspect-square bg-slate-900">
            <img
              src={capturedImage}
              alt={result.itemName}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md rounded-xl p-2.5 text-white text-xs flex items-center justify-between">
              <span className="font-semibold truncate pr-2">{result.itemName}</span>
              <span className="bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full shrink-0">
                {result.confidence}% มั่นใจ
              </span>
            </div>
          </div>

          {/* Right: AI Analysis Breakdown */}
          <div className="md:col-span-7 space-y-4">
            {/* Category & Bin Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: result.binHexColor }}
                >
                  {result.binColor}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                  {result.categoryName}
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  +{result.ecoPoints} แต้มรักษ์โลก
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {result.itemName}
              </h2>
            </div>

            {/* Official Thai Bin Indicator Box */}
            <div
              className="p-4 rounded-2xl border-2 flex items-center gap-4 transition-all"
              style={{
                borderColor: `${result.binHexColor}80`,
                backgroundColor: `${result.binHexColor}12`,
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
                style={{ backgroundColor: result.binHexColor }}
              >
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  ถังขยะที่ถูกต้อง (Thailand Bin Standard)
                </span>
                <h4
                  className="text-lg font-black"
                  style={{ color: result.binHexColor === '#EAB308' ? '#B45309' : result.binHexColor }}
                >
                  {result.binColor} - {result.categoryName}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  {result.categoryKey === 'recyclable' && 'ขยะประเภทนี้สามารถนำไปรีไซเคิลขายหรือแปรรูปต่อได้'}
                  {result.categoryKey === 'organic' && 'สามารถนำไปหมักทำปุ๋ยชีวภาพได้ง่ายตามธรรมชาติ'}
                  {result.categoryKey === 'general' && 'ขยะย่อยสลายยากและไม่อยู่ในกลุ่มรีไซเคิล'}
                  {result.categoryKey === 'hazardous' && 'มีสารเคมีหรือพิษอันตราย ต้องคัดแยกเฉพาะอย่างระมัดระวัง'}
                  {result.categoryKey === 'ewaste' && 'อุปกรณ์อิเล็กทรอนิกส์ มีชิ้นส่วนโลหะที่สกัดได้'}
                </p>
              </div>
            </div>

            {/* Material Specification & Trade Value */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block mb-0.5">ประเภทวัสดุ (Material):</span>
                <span className="font-bold text-slate-800">{result.material}</span>
              </div>
              {result.recyclableValue && (
                <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                  <span className="text-amber-700 font-medium block mb-0.5">มูลค่าการขาย/รีไซเคิล:</span>
                  <span className="font-bold text-amber-900">{result.recyclableValue}</span>
                </div>
              )}
            </div>

            {/* Voice Audio Reader Control */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleToggleVoice}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isPlayingAudio
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'หยุดเสียงอ่าน' : 'ฟังเสียงอ่านคำแนะนำ'}</span>
              </button>

              <button
                onClick={handleCopyShare}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกเรียบร้อย' : 'แชร์ผลลัพธ์'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Sorting Instructions Checklist */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ขั้นตอนเตรียมขยะก่อนทิ้ง (Sorting Checklist)
              </h3>
              <p className="text-xs text-slate-500">
                เช็กตามขั้นตอนเพื่อให้มั่นใจว่าคัดแยกถูกต้อง
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {completedStepsCount} / {result.sortingSteps.length} ทำแล้ว
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{
              width: `${(completedStepsCount / Math.max(result.sortingSteps.length, 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-2.5">
          {result.sortingSteps.map((step, idx) => (
            <label
              key={idx}
              onClick={() => toggleStep(idx)}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                checkedSteps[idx]
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                  : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <input
                type="checkbox"
                checked={checkedSteps[idx]}
                onChange={() => {}}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  checkedSteps[idx]
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {checkedSteps[idx] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className={`text-xs font-medium leading-relaxed ${checkedSteps[idx] ? 'line-through opacity-80' : ''}`}>
                {step}
              </span>
            </label>
          ))}
        </div>

        {isAllStepsCompleted && (
          <div className="mt-4 p-3 bg-emerald-100/80 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-bold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>ยอดเยี่ยมมาก! คุณทำครบทุกขั้นตอนพร้อมทิ้งลงถังแล้ว 🎉</span>
          </div>
        )}
      </div>

      {/* Environmental Impact & Creative Upcycling Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Environmental Impact */}
        <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-emerald-300">
            <Leaf className="w-5 h-5" />
            <h4 className="text-sm font-bold">ผลกระทบต่อสิ่งแวดล้อม</h4>
          </div>
          <p className="text-xs text-emerald-100 leading-relaxed font-normal">
            {result.environmentalImpact}
          </p>
        </div>

        {/* Upcycling Creative Idea or Warning */}
        {result.warningNote ? (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-rose-900">
            <div className="flex items-center gap-2 mb-2 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-sm font-bold">ข้อระวังเพื่อความปลอดภัย</h4>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed font-medium">
              {result.warningNote}
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-amber-900">
            <div className="flex items-center gap-2 mb-2 text-amber-700">
              <Lightbulb className="w-5 h-5" />
              <h4 className="text-sm font-bold">ไอเดีย D.I.Y. รีไซเคิลสร้างสรรค์</h4>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              {result.creativeUpcyclingTip || 'สามารถนำส่วนที่สะอาดไปทำเป็ชิ้นงานประดิษฐ์ D.I.Y. หรือนำไปบริจาคโครงการวน/เปลี่ยนขยะเป็นบุญได้'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={onRescan}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ถ่ายรูป/สแกนขยะชิ้นใหม่</span>
        </button>

        <button
          onClick={() => onSaveHistory(result, capturedImage)}
          disabled={isSaved}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
            isSaved
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-emerald-700" />
              <span>บันทึกเข้าประวัติแล้ว</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              <span>บันทึกประวัติ (+{result.ecoPoints} แต้ม)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
