"use client";

import React from "react";
import { Flag, Trophy, CheckCircle2, ChevronRight, Lock, AlertCircle, UserCircle } from "lucide-react";
import { Question, LeaderboardEntry } from "@/lib/db";

interface StageSelectionViewProps {
  selectedLevel: "basic" | "intermediate" | "advanced";
  completedLicenses: Record<string, {score: number, timeTaken: number}>;
  driverName: string;
  setDriverName: (name: string) => void;
  debouncedSaveDriverName: (name: string) => void;
  unlockedStages: Record<string, number>;
  viewStoredCertificate: (level: "basic" | "intermediate" | "advanced") => void;
  startStageQuiz: (level: "basic" | "intermediate" | "advanced", stageNum: number) => Promise<void>;
  navigateTo: (view: string) => void;
}

export default function StageSelectionView({
  selectedLevel,
  completedLicenses,
  driverName,
  setDriverName,
  debouncedSaveDriverName,
  unlockedStages,
  viewStoredCertificate,
  startStageQuiz,
  navigateTo,
}: StageSelectionViewProps) {
  return (
    <div className="w-full max-w-5xl animate-fade-in z-10 flex flex-col h-full mt-10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-f1-red/10 border border-f1-red/30 px-3 py-1 rounded-full mb-4">
          <Flag className="w-4 h-4 text-f1-red" />
          <span className="text-xs font-bold uppercase tracking-widest text-f1-red">Campaign Selection</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900">
          RACING TIER <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-500">SELECTION</span>
        </h2>
      </div>

      {/* A. View stored certificate shortcut (Level complete) */}
      {completedLicenses[selectedLevel] && (
        <div className="mb-5 max-w-3xl mx-auto w-full bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between backdrop-blur-md animate-fade-in shadow-sm border-t-4 border-t-amber-500">
          <div className="flex items-center gap-4 mb-4 sm:mb-0 text-center sm:text-left flex-col sm:flex-row">
            <div className="bg-amber-500/20 p-3 rounded-xl shrink-0 border border-amber-500/30">
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 uppercase text-base tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                Level Certified
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </h4>
              <p className="text-xs text-slate-600 font-bold mt-0.5">Kamu sudah menamatkan level ini. Klik di sini untuk melihat lisensi resmimu.</p>
            </div>
          </div>
          <button 
            onClick={() => viewStoredCertificate(selectedLevel)}
            className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_4px_10px_rgba(15,23,42,0.3)] flex items-center gap-2 hover:scale-[1.02] active:scale-95"
          >
            View Official License
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* B. MANDATORY GLOBAL DRIVER IDENTIFICATION (Blocking Gate) */}
      <div className={`mb-10 max-w-3xl mx-auto w-full rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between backdrop-blur-md transition-all duration-500 border shadow-sm relative z-20 overflow-hidden ${
         !driverName.trim() 
           ? 'bg-white border-f1-red/40 shadow-[0_0_20px_rgba(225,6,0,0.1)] animate-pulse-subtle' 
           : 'bg-white/80 border-slate-200'
      }`}>
         <div className={`absolute inset-y-0 left-0 w-1.5 transition-colors duration-500 ${!driverName.trim() ? 'bg-f1-red' : 'bg-emerald-500'}`} />
         <div className="flex items-center gap-4 mb-4 sm:mb-0 pl-2">
            <div className={`p-3 rounded-xl transition-all duration-500 border ${
              !driverName.trim() 
                ? 'bg-f1-red/10 text-f1-red border-f1-red/20 animate-bounce-subtle' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
               {!driverName.trim() ? <AlertCircle className="w-5 h-5" /> : <UserCircle className="w-5 h-5" />}
            </div>
            <div>
               <h4 className="font-black text-slate-900 uppercase text-sm tracking-wider flex items-center gap-2">
                  {!driverName.trim() ? "Identifikasi Pembalap Diperlukan" : "Driver Aktif"}
                  {driverName.trim() && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
               </h4>
               <p className="text-[10px] text-slate-500 font-bold mt-0.5 max-w-xs">
                  {!driverName.trim() 
                    ? "Masukkan Alias Anda di samping untuk membuka akses tombol start balapan." 
                    : "Siap membalap! Statistik dan leaderboard otomatis disimpan atas nama ini."}
               </p>
            </div>
         </div>
         <div className="flex w-full sm:w-auto gap-2 relative">
            <input 
               id="global-driver-alias-input"
               type="text" 
               value={driverName}
               onChange={(e) => {
                  const val = e.target.value;
                  setDriverName(val);
                  debouncedSaveDriverName(val);
               }}
               maxLength={16}
               placeholder="Ketik Nama Panggilan..."
               className={`border rounded-xl px-4 py-3 text-sm font-black flex-grow sm:w-60 transition-all outline-none shadow-inner ${
                  !driverName.trim() 
                    ? 'bg-red-50/30 border-f1-red/40 text-slate-900 placeholder-red-300 focus:ring-4 focus:ring-f1-red/20 focus:border-f1-red' 
                    : 'bg-white border-slate-200 text-emerald-700 focus:ring-4 focus:ring-emerald-500/10'
               }`}
            />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {[1, 2, 3].map((stageNum) => {
          const isUnlocked = stageNum === 1 || (unlockedStages[selectedLevel] >= stageNum);
          const stageName = stageNum === 1 ? "FP (Free Practice)" : stageNum === 2 ? "Qualifying" : "Race";
          const stageDesc = stageNum === 1 ? "Warm up your tires and check the track layout." : stageNum === 2 ? "Push for the absolute limit. One mistake and you are out." : "The main event under the lights. Complete perfectly for the Certificate!";

          return (
            <div 
              key={stageNum}
              onClick={() => isUnlocked && startStageQuiz(selectedLevel, stageNum)}
              className={`paddock-card rounded-xl p-6 flex flex-col relative overflow-hidden transition-all duration-300 border-l-4 group ${
                isUnlocked 
                  ? "cursor-pointer hover:border-l-f1-red border-l-white/10" 
                  : "opacity-40 cursor-not-allowed border-l-slate-800 bg-slate-100/50"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-2xl font-black text-slate-900/20">STG 0{stageNum}</span>
                {isUnlocked ? (
                  <div className="bg-f1-red/20 text-f1-red text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-f1-red/30">READY</div>
                ) : (
                  <div className="bg-slate-200/50 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-slate-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> LOCKED
                  </div>
                )}
              </div>
              <h3 className="font-black text-2xl mb-3 tracking-wide text-slate-900 group-hover:text-f1-red transition-colors">{stageName}</h3>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed flex-grow">
                {stageDesc}
              </p>
              {isUnlocked && (
                <button className="bg-slate-50 text-slate-900 font-bold tracking-widest uppercase text-sm py-3 rounded-lg border border-slate-200 hover:bg-slate-100 transition mt-auto">
                  ENTER TRACK
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
        <button 
          onClick={() => navigateTo("landing")}
          className="text-slate-600 hover:text-slate-900 text-sm font-bold tracking-widest uppercase underline decoration-2 underline-offset-4"
        >
          Back to Compounds
        </button>
      </div>
    </div>
  );
}
