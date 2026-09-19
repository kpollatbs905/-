import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/binGuide';
import { Award, CheckCircle2, XCircle, RotateCcw, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';

interface EcoQuizProps {
  onAddEcoPoints: (points: number) => void;
}

export const EcoQuiz: React.FC<EcoQuizProps> = ({ onAddEcoPoints }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null) return;

    const isCorrect = selectedOptionIndex === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      // Award 20 points per correct answer
      const earnedPoints = score * 20;
      onAddEcoPoints(earnedPoints);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-3xl p-6 text-white shadow-lg text-center relative overflow-hidden">
        <Sparkles className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
        <h2 className="text-2xl font-black mb-1">ควิซท้าทายเซียนแยกขยะ</h2>
        <p className="text-xs text-emerald-200">
          ทดสอบความรู้การทิ้งขยะลงถังมาตรฐานไทย รับแต้มสะสมรักษ์โลกฟรี!
        </p>
      </div>

      {!isQuizCompleted ? (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
            <span>คำถามที่ {currentQuestionIndex + 1} จาก {QUIZ_QUESTIONS.length}</span>
            <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              คะแนนปัจจุบัน: {score} / {QUIZ_QUESTIONS.length}
            </span>
          </div>

          {/* Question Title */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              Q{currentQuestionIndex + 1}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-relaxed pt-1">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let optionStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                } else if (isSelected) {
                  optionStyle = 'bg-rose-100 border-rose-400 text-rose-900 font-bold';
                } else {
                  optionStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              } else if (isSelected) {
                optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white/80 border text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt.text}</span>
                  </span>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next Button */}
          {isAnswerSubmitted ? (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  selectedOptionIndex === currentQuestion.correctIndex
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                <span className="font-bold block mb-1">
                  {selectedOptionIndex === currentQuestion.correctIndex ? '🎉 คำตอบถูกต้อง!' : '💡 เฉลยคำอธิบาย:'}
                </span>
                <p>{currentQuestion.explanation}</p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'คำถามถัดไป' : 'ดูสรุปคะแนน'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOptionIndex === null}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
            >
              ส่งคำตอบ
            </button>
          )}
        </div>
      ) : (
        /* Quiz Completed Screen */
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-black text-2xl animate-bounce">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900">เก่งมาก! ทำควิซเสร็จสิ้นแล้ว</h3>
            <p className="text-xs text-slate-500 mt-1">
              คุณได้คะแนน {score} / {QUIZ_QUESTIONS.length} ข้อ
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl max-w-xs mx-auto">
            <span className="text-xs text-emerald-800 font-medium block">รับรางวัลแต้มสะสม:</span>
            <span className="text-2xl font-black text-emerald-900">+{score * 20} แต้มรักษ์โลก</span>
          </div>

          <button
            onClick={handleRestartQuiz}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ทำควิซใหม่อีกครั้ง</span>
          </button>
        </div>
      )}
    </div>
  );
};
