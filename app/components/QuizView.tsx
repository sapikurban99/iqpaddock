"use client";

import React from "react";
import { AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { Question } from "@/lib/db";

interface QuizViewProps {
  quizQuestions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  hasAnswered: boolean;
  score: number;
  selectedLevel: "basic" | "intermediate" | "advanced";
  selectedStage: number;
  handleSelectAnswer: (option: string) => void;
  handleNextQuestion: () => void;
  navigateTo: (view: string) => void;
  fullscreenImage: string | null;
  setFullscreenImage: (img: string | null) => void;
}

export default function QuizView({
  quizQuestions,
  currentQuestionIndex,
  selectedAnswer,
  hasAnswered,
  score,
  selectedLevel,
  selectedStage,
  handleSelectAnswer,
  handleNextQuestion,
  navigateTo,
  fullscreenImage,
  setFullscreenImage,
}: QuizViewProps) {
  if (quizQuestions.length === 0) {
    return (
      <div className="w-full max-w-md animate-fade-in z-10 flex flex-col items-center text-center py-20">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No Questions Loaded</h2>
        <p className="text-slate-500 mb-6">Could not load questions for this stage. Please try again.</p>
        <button onClick={() => navigateTo("landing")} className="bg-f1-red text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-f1-red-hover transition">Return to Hub</button>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestionIndex];
  if (!currentQ) {
    return (
      <div className="w-full max-w-md animate-fade-in z-10 flex flex-col items-center text-center py-20">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Invalid Question</h2>
        <p className="text-slate-500 mb-6">Something went wrong with this quiz session.</p>
        <button onClick={() => navigateTo("landing")} className="bg-f1-red text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-f1-red-hover transition">Return to Hub</button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-3xl animate-fade-in z-10">
        {/* Quiz Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-f1-red/10 border border-f1-red/30 px-2 py-1 rounded mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-f1-red">
                Compound: {selectedLevel} | Stage {selectedStage}
              </span>
            </div>
            <h2 className="text-3xl font-black text-slate-900">TELEMETRY SECTOR {currentQuestionIndex + 1}</h2>
          </div>
          <div className="text-right">
            <span className="text-slate-600 text-sm font-bold uppercase tracking-widest">Progress</span>
            <div className="text-2xl font-black text-slate-900">{currentQuestionIndex + 1} <span className="text-slate-600">/ {quizQuestions.length}</span></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-8">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(225,6,0,0.5)]"
            style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
          ></div>
        </div>

        <div className="paddock-card rounded-2xl p-6 md:p-8 f1-corner-clip relative z-0 border border-slate-200">
          {/* Question Image Visualizer */}
          {currentQ.imageUrl && (
            <div 
              className="w-full rounded-xl overflow-hidden mb-8 border border-slate-200 relative group bg-slate-100 flex items-center justify-center cursor-zoom-in aspect-[16/9] max-h-80 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setFullscreenImage(currentQ.imageUrl || null)}
            >
              <img 
                src={currentQ.imageUrl} 
                alt="Telemetry Visual" 
                className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="bg-white/90 backdrop-blur-md text-[10px] text-slate-600 px-2 py-1 rounded font-mono uppercase tracking-widest border border-slate-200 shadow-sm flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                  Click to Enlarge
                </span>
              </div>
            </div>
          )}

          {/* Question Text */}
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
            {currentQ.questionText}
          </h3>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {currentQ.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQ.correctAnswer;
              
              let optionStateClass = "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700";
              
              if (hasAnswered) {
                if (isCorrectAnswer) {
                  optionStateClass = "bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-slate-900";
                } else if (isSelected && !isCorrectAnswer) {
                  optionStateClass = "bg-f1-red/20 border-f1-red text-slate-900";
                } else {
                  optionStateClass = "bg-slate-100 border-slate-100 text-slate-600 opacity-50";
                }
              } else if (isSelected) {
                optionStateClass = "bg-slate-200 border-slate-900 text-slate-900";
              }

              const letter = String.fromCharCode(65 + index);

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(option)}
                  disabled={hasAnswered}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 text-left ${optionStateClass}`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-black text-sm shrink-0 ${
                    hasAnswered && isCorrectAnswer ? 'bg-emerald-500 text-slate-900' : 
                    hasAnswered && isSelected && !isCorrectAnswer ? 'bg-f1-red text-slate-900' :
                    'bg-slate-100'
                  }`}>
                    {hasAnswered && isCorrectAnswer ? <CheckCircle2 className="w-5 h-5" /> : letter}
                  </div>
                  <span className="font-semibold text-sm md:text-base">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <button 
              onClick={() => {
                if(confirm("Abort current telemetry session? All progress will be lost.")) navigateTo("landing");
              }}
              className="text-slate-500 hover:text-slate-900 text-xs font-bold uppercase tracking-widest transition"
            >
              Abort Session
            </button>
            
            <button 
              onClick={handleNextQuestion}
              disabled={!hasAnswered}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm transition-all duration-300 ${
                hasAnswered 
                  ? "glowing-red-btn bg-slate-900 text-white hover:bg-slate-800" 
                  : "bg-slate-50 text-slate-500 cursor-not-allowed border border-slate-200"
              }`}
            >
              {currentQuestionIndex < quizQuestions.length - 1 ? "NEXT LAP" : "CHEQUERED FLAG"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL SCREEN IMAGE MODAL */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
            onClick={(e) => { e.stopPropagation(); setFullscreenImage(null); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen Preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
