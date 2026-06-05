"use client";

import React from "react";
import { Trophy, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

interface ResultViewProps {
  score: number;
  selectedStage: number;
  selectedLevel: "basic" | "intermediate" | "advanced";
  driverName: string;
  isSubmittingScore: boolean;
  navigateTo: (view: string) => void;
}

export default function ResultView({
  score,
  selectedStage,
  selectedLevel,
  driverName,
  isSubmittingScore,
  navigateTo,
}: ResultViewProps) {
  return (
    <div className="w-full max-w-md animate-fade-in z-10 flex flex-col items-center">
      <div className="paddock-card rounded-2xl p-8 w-full text-center border-t-4 border-t-f1-red relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-f1-red/20 via-transparent to-transparent pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2 relative z-10">RACE CLASSIFICATION</h2>
        <p className="text-slate-600 text-sm font-bold uppercase tracking-widest mb-10 relative z-10">Telemetry Analysis Complete</p>
        
        <div className="relative w-40 h-40 mx-auto mb-10 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-dashed border-f1-red/30 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-2 border-4 border-f1-red rounded-full shadow-[0_0_30px_rgba(225,6,0,0.5)]"></div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-slate-900">{score}</span>
            <span className="text-[10px] text-f1-red font-black uppercase tracking-widest">Points</span>
          </div>
        </div>
        
        {/* Unlock / Certificate Notification Area */}
        {score >= 50 ? (
          selectedStage === 3 ? (
            <div className="mb-8 bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl animate-pulse">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h3 className="text-amber-400 font-black tracking-wide uppercase">CAMPAIGN COMPLETED!</h3>
              <p className="text-xs text-amber-400/80 mt-1">You have successfully cleared Stage 3.</p>
              <div className="mt-4 w-full bg-amber-500/20 text-amber-600 font-black text-[10px] uppercase tracking-widest py-2 rounded-lg border border-amber-500/30 relative z-10">
                SUBMIT NAME BELOW TO CLAIM OFFICIAL LICENSE
              </div>
            </div>
          ) : (
            <div className="mb-8 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-emerald-400 font-black tracking-wide uppercase">STAGE CLEARED</h3>
              <p className="text-xs text-emerald-400/80 mt-1">Next stage unlocked successfully.</p>
            </div>
          )
        ) : (
          <div className="mb-8 bg-f1-red/10 border border-f1-red/30 p-4 rounded-xl">
            <AlertCircle className="w-6 h-6 text-f1-red mx-auto mb-2" />
            <h3 className="text-f1-red font-black tracking-wide uppercase">STAGE FAILED</h3>
            <p className="text-xs text-f1-red/80 mt-1">Score must be &gt;= 50 to unlock next stage.</p>
          </div>
        )}

        <div className="relative z-10 text-center border-t border-slate-200 pt-6 mt-4">
          {isSubmittingScore ? (
            <div className="flex flex-col items-center justify-center gap-3 py-6 animate-pulse">
               <div className="w-10 h-10 border-4 border-f1-red border-t-transparent rounded-full animate-spin" />
               <p className="text-xs font-black text-slate-600 uppercase tracking-widest">AUTO-SAVING TELEMETRY...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full animate-fade-in">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50/80 backdrop-blur-sm py-3 rounded-xl border border-emerald-200/60 mb-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                Skor Berhasil Disimpan di Leaderboard!
              </div>
              
              {selectedStage === 3 && score >= 50 ? (
                 <button 
                   onClick={() => navigateTo("certificate")}
                   className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_10px_25px_rgba(15,23,42,0.3)] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 relative overflow-hidden group"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Trophy className="w-5 h-5 text-amber-400" />
                   Buka Lisensi Paddock
                 </button>
              ) : (
                 <button 
                   onClick={() => navigateTo("leaderboard")}
                   className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-4 rounded-xl font-black uppercase tracking-widest transition shadow-[0_4px_15px_rgba(15,23,42,0.3)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                 >
                   Cek Ranking Klasemen
                   <ChevronRight className="w-4 h-4" />
                 </button>
              )}

              <button 
                 onClick={() => navigateTo("stage-selection")}
                 className="text-slate-500 hover:text-f1-red font-bold text-[10px] uppercase tracking-widest py-2 transition mt-1"
              >
                 ← Kembali Pilih Level
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
