"use client";

import React from "react";
import { Trophy, CheckCircle2, ChevronRight, Camera, Download, Loader2, UserCircle } from "lucide-react";

interface CertificateViewProps {
  selectedLevel: "basic" | "intermediate" | "advanced";
  score: number;
  timeTaken: number;
  driverName: string;
  driverPhoto: string | null;
  isExportingImage: boolean;
  generateLicenseId: string;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExportLicense: () => void;
  navigateTo: (view: string) => void;
  formatTime: (seconds: number | undefined) => string;
}

export default function CertificateView({
  selectedLevel,
  score,
  timeTaken,
  driverName,
  driverPhoto,
  isExportingImage,
  generateLicenseId,
  handlePhotoUpload,
  handleExportLicense,
  navigateTo,
  formatTime,
}: CertificateViewProps) {
  return (
    <div className="w-full max-w-3xl animate-fade-in z-10 flex flex-col items-center mt-10">
      {/* The Certificate Card */}
      <div id="print-certificate" className={`w-full relative aspect-auto sm:aspect-[1.6/1] min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border bg-slate-950 transition-all duration-500 ${
        selectedLevel === 'advanced' ? 'border-f1-red/30 shadow-f1-red/20' :
        selectedLevel === 'intermediate' ? 'border-amber-500/30 shadow-amber-500/20' :
        'border-slate-400/30 shadow-slate-400/20'
      }`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black"></div>
        
        <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-40 transition-all duration-500 ${
          selectedLevel === 'advanced' ? 'bg-f1-red' : selectedLevel === 'intermediate' ? 'bg-amber-500' : 'bg-slate-400'
        }`}></div>
        
        <div className="p-6 sm:p-8 md:p-10 h-full flex flex-col justify-between relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4">
            <div>
              <div className={`inline-block px-2 py-1 rounded text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${
                selectedLevel === 'advanced' ? 'bg-f1-red text-white' : 
                selectedLevel === 'intermediate' ? 'bg-amber-500 text-slate-900' : 
                'bg-slate-200 text-slate-900'
              }`}>
                {selectedLevel === 'advanced' ? 'Tier 3 - World Champion Candidate' : 
                 selectedLevel === 'intermediate' ? 'Tier 2 - Elite Driver Status' : 
                 'Tier 1 - Rising Talent'}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                PADDOCK <span className={selectedLevel === 'advanced' ? 'text-f1-red' : selectedLevel === 'intermediate' ? 'text-amber-500' : 'text-slate-300'}>IQ PRO</span>
              </h2>
              <p className="text-xs text-white/60 font-bold uppercase tracking-[0.3em]">Official Driver License</p>
            </div>
            <img 
              src="/f1-logo.png" 
              alt="F1 Logo" 
              className="h-8 md:h-10 filter invert opacity-90 shrink-0 ml-4"
            />
          </div>

          {/* Main Body Content: Details and Photo Grid */}
          <div className="flex flex-col sm:flex-row gap-6 flex-grow items-stretch">
            <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-4 my-auto">
              <div className="col-span-2">
                <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1">Driver Name</p>
                <p className="text-xl md:text-2xl font-black text-white uppercase truncate border-b border-white/10 pb-1 leading-tight">{driverName || "GUEST DRIVER"}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1">License Class</p>
                <p className={`text-sm md:text-lg font-black uppercase ${
                  selectedLevel === 'advanced' ? 'text-f1-red' : 
                  selectedLevel === 'intermediate' ? 'text-amber-500' : 
                  'text-slate-200'
                }`}>
                  {selectedLevel === 'advanced' ? 'SUPER LICENSE' : selectedLevel === 'intermediate' ? 'PRO LICENSE' : 'ROOKIE LICENSE'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1">Compound</p>
                <p className="text-sm md:text-lg font-bold text-white uppercase">{selectedLevel} (C{selectedLevel==='basic'?1:selectedLevel==='intermediate'?3:5})</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1">Final Points</p>
                <p className="text-xl md:text-2xl font-black text-emerald-400 uppercase">{score} <span className="text-xs">PTS</span></p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1">Fastest Lap</p>
                <p className="text-xl md:text-2xl font-black text-white font-mono">{formatTime(timeTaken)}</p>
              </div>
            </div>

            {/* Right Driver Portrait Photo frame */}
            <div className="sm:ml-auto flex flex-col items-center justify-center shrink-0 self-center sm:self-auto mt-4 sm:mt-0">
              <div className={`w-28 h-36 sm:w-32 sm:h-40 relative rounded-lg border-2 overflow-hidden bg-slate-900/80 backdrop-blur-md shadow-inner ${
                selectedLevel === 'advanced' ? 'border-f1-red/40' : 
                selectedLevel === 'intermediate' ? 'border-amber-500/40' : 
                'border-slate-500/40'
              }`}>
                {driverPhoto ? (
                  <img src={driverPhoto} alt={`${driverName} driver portrait`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                    <UserCircle className="w-16 h-16 mb-1 opacity-50" />
                    <span className="text-[8px] uppercase font-black tracking-widest opacity-50">NO PHOTO</span>
                  </div>
                )}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30" />
                <div className="absolute bottom-1 right-1 bg-black/70 text-[6px] text-emerald-400 px-1 rounded font-mono">VERIFIED</div>
              </div>
            </div>
          </div>

          {/* Footer details */}
          <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-6 shrink-0">
            <div>
              <p className="text-[8px] text-white/40 font-mono tracking-widest">REGISTRY ID: {generateLicenseId}</p>
              <p className="text-[8px] text-white/40 font-mono tracking-widest">ISSUED: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
            <div className="text-right">
              <div className="font-serif italic text-lg md:text-xl text-white/80 -mb-1 tracking-wide">Race Control</div>
              <div className="w-24 h-px bg-white/20 mt-1 ml-auto"></div>
              <p className="text-[8px] text-white/50 font-bold tracking-widest uppercase mt-2">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload & Download Actions Area */}
      <div className="mt-8 w-full max-w-lg flex flex-col gap-4 items-center bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
         <div className="w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-5 hover:bg-slate-50 transition-all cursor-pointer relative group overflow-hidden">
            <div className="bg-slate-100 p-3 rounded-full text-slate-500 mb-2 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
              {driverPhoto ? 'Change Photo' : 'Upload License Photo'}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">Portrait Photo Recommended</span>
            <input 
              type="file" 
              accept="image/*"
              onChange={handlePhotoUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
            <button 
              onClick={handleExportLicense}
              disabled={isExportingImage}
              className="bg-slate-900 text-white hover:bg-black font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
              {isExportingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span className="text-xs">Save Image</span>
                </>
              )}
            </button>
            <button 
              onClick={() => navigateTo("landing")}
              className="bg-slate-100 text-slate-900 font-black uppercase tracking-widest py-4 rounded-xl border border-slate-300 hover:bg-slate-200 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 text-xs"
            >
              Return to Hub
            </button>
         </div>
      </div>
    </div>
  );
}
