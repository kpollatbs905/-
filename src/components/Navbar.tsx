import React from 'react';
import { Camera, BookOpen, History, Award, Sparkles, Leaf } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scan' | 'guide' | 'history' | 'quiz';
  setActiveTab: (tab: 'scan' | 'guide' | 'history' | 'quiz') => void;
  totalEcoPoints: number;
  scanCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  totalEcoPoints,
  scanCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => setActiveTab('scan')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Leaf className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
                    EcoScan AI
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" /> AI Vision
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  ระบบคัดแยกขยะด้วยกล้องถ่ายรูป & AI อัจฉริยะ
                </p>
              </div>
            </div>

            {/* Mobile Eco Points badge */}
            <div className="flex md:hidden items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-semibold text-emerald-800">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{totalEcoPoints} คะแนน</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between md:justify-end gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              id="nav-tab-scan"
              onClick={() => setActiveTab('scan')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                activeTab === 'scan'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>สแกนขยะ</span>
            </button>

            <button
              id="nav-tab-guide"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                activeTab === 'guide'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>คู่มือถังขยะ</span>
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shrink-0 relative ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
              }`}
            >
              <History className="w-4 h-4" />
              <span>ประวัติ ({scanCount})</span>
            </button>

            <button
              id="nav-tab-quiz"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                activeTab === 'quiz'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>ควิซแยกขยะ</span>
            </button>

            {/* Desktop Eco Points Badge */}
            <div className="hidden md:flex items-center gap-2 ml-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-emerald-600 uppercase tracking-wider">คะแนนรักษ์โลก</span>
                <span className="text-sm font-extrabold leading-tight text-emerald-800">{totalEcoPoints} แต้ม</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
