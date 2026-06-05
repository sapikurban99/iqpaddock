"use client";

import React from "react";
import { Shield, ChevronRight, Heart } from "lucide-react";

interface LandingViewProps {
  selectLevelAndGoToStages: (level: "basic" | "intermediate" | "advanced") => void;
}

export default function LandingView({ selectLevelAndGoToStages }: LandingViewProps) {
  return (
    <div className="max-w-6xl w-full flex flex-col gap-10 md:gap-12 py-4 md:py-8 animate-fade-in z-10">
      {/* HERO SECTION */}
      <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-f1-red/10 border border-f1-red/30 px-4 py-1.5 rounded-full mb-6">
          <Shield className="w-4 h-4 text-f1-red" />
          <span className="text-xs font-bold uppercase tracking-widest text-f1-red">Selamat Datang di Paddock IQ</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-900 mb-6 leading-tight">
          SEBERAPA JAUH PENGETAHUAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-f1-red to-orange-500">FORMULA 1</span> KAMU?
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-8 max-w-3xl">
          Paddock IQ adalah platform trivia interaktif untuk menguji wawasanmu tentang dunia balap Formula 1. 
          Apakah kamu sekadar fans TikTok yang baru ngikutin F1, atau seorang Paddock Expert sejati? 
          <span className="font-bold text-slate-900 block mt-2">Buktikan kemampuanmu di sini!</span>
        </p>
      </div>

      {/* CARA BERMAIN SECTION */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm max-w-5xl mx-auto w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-200 via-f1-red to-slate-200 opacity-50"></div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 mb-10 text-center">
          Cara Bermain 🏁
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 text-2xl font-black text-slate-700 shadow-sm">1</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Pilih Kompon Ban</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Pilih tingkat kesulitan kuis berdasarkan jenis kompon ban F1 (C1 Hard, C3 Medium, atau C5 Soft).</p>
          </div>
          <div className="flex flex-col items-center text-center relative">
            <div className="hidden md:block absolute top-8 -left-[20%] w-[40%] h-[2px] bg-slate-200"></div>
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 text-2xl font-black text-slate-700 shadow-sm relative z-10">2</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Selesaikan Stage</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Setiap level memiliki 3 tahapan (Free Practice, Qualifying, Race). Selesaikan semuanya untuk unlock stage berikutnya!</p>
          </div>
          <div className="flex flex-col items-center text-center relative">
            <div className="hidden md:block absolute top-8 -left-[20%] w-[40%] h-[2px] bg-slate-200"></div>
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 text-2xl font-black text-slate-700 shadow-sm relative z-10">3</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Kejar Leaderboard</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Kumpulkan skor setinggi-tingginya dan pastikan namamu masuk di daftar klasemen Global Leaderboard.</p>
          </div>
        </div>
      </div>

      {/* LEVEL SELECTION SECTION */}
      <div className="flex flex-col w-full mt-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 mb-4">
            PILIH <span className="text-slate-500">KOMPON BAN</span>
          </h2>
          <p className="text-slate-600 font-medium">Sesuaikan dengan tingkat pengetahuan F1 kamu saat ini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {/* Basic Compound (C1 Hard) */}
          <div 
            className="paddock-card bg-white/90 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer border border-slate-200 border-t-4 border-t-slate-400 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => selectLevelAndGoToStages("basic")}
          >
            <div className="absolute top-4 right-4 bg-slate-50 border border-slate-200 px-3 py-1 rounded text-[10px] font-bold text-slate-600 uppercase tracking-widest">Hard</div>
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-slate-400 flex items-center justify-center mb-6 shadow-inner relative group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-1.5 border-2 border-dashed border-slate-600 rounded-full animate-spin-slow" />
              <span className="font-extrabold text-3xl text-slate-700">C1</span>
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-wide text-slate-900">LEVEL BASIC</h3>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed flex-grow">
              Pondasi dasar balapan. Cocok untuk fans baru yang ingin belajar tentang aturan dasar, sejarah singkat, sirkuit ikonik, dan profil pembalap F1 saat ini.
            </p>
            <button className="bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-wider py-4 px-6 rounded-xl w-full mt-auto flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(15,23,42,0.39)]">
              PILIH C1
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Intermediate Compound (C3 Medium) */}
          <div 
            className="paddock-card bg-white/90 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer border border-slate-200 border-t-4 border-t-amber-400 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => selectLevelAndGoToStages("intermediate")}
          >
            <div className="absolute top-4 right-4 bg-amber-50 border border-amber-200 px-3 py-1 rounded text-[10px] font-bold text-amber-600 uppercase tracking-widest">Medium</div>
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-amber-400 flex items-center justify-center mb-6 shadow-inner relative group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-1.5 border-2 border-dashed border-amber-600/50 rounded-full animate-spin-slow" />
              <span className="font-extrabold text-3xl text-amber-500">C3</span>
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-wide text-amber-500">INTERMEDIATE</h3>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed flex-grow">
              Keseimbangan ideal. Pertanyaan seputar regulasi mendalam, taktik pitstop, pengetahuan teknis menengah, dan momen-momen bersejarah dekade lalu.
            </p>
            <button className="bg-amber-400 text-amber-950 font-black uppercase tracking-wider py-4 px-6 rounded-xl w-full mt-auto flex items-center justify-center gap-2 hover:bg-amber-500 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]">
              PILIH C3
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Advanced Compound (C5 Soft) */}
          <div 
            className="paddock-card bg-white/90 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer border border-slate-200 border-t-4 border-t-f1-red relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
            onClick={() => selectLevelAndGoToStages("advanced")}
          >
            <div className="absolute top-4 right-4 bg-red-50 border border-red-200 px-3 py-1 rounded text-[10px] font-bold text-f1-red uppercase tracking-widest">Soft</div>
            <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-f1-red flex items-center justify-center mb-6 shadow-inner shadow-f1-red/10 relative group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-1.5 border-2 border-dashed border-red-500/50 rounded-full animate-spin-slow" />
              <span className="font-extrabold text-3xl text-f1-red">C5</span>
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-wide text-f1-red">ADVANCED</h3>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed flex-grow">
              Untuk para F1 Expert sejati. Pertanyaan teknis tingkat tinggi, detail aerodinamika, rekor yang jarang diketahui, dan trivia spesifik dari era V10/V8.
            </p>
            <button className="glowing-red-btn bg-f1-red text-white font-black uppercase tracking-wider py-4 px-6 rounded-xl w-full mt-auto flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-[0_4px_14px_0_rgba(225,6,0,0.39)]">
              PILIH C5
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Creators / YeppingCouple Section */}
        <div className="mt-10 mb-2 max-w-2xl mx-auto w-full px-4 animate-fade-in relative z-10">
          <div className="paddock-card rounded-3xl p-8 md:p-10 border border-white/20 bg-white/60 backdrop-blur-xl relative overflow-hidden shadow-lg text-center border-t-4 border-t-f1-red transition-transform hover:scale-[1.01] duration-300">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-f1-red/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="bg-white p-2 rounded-full shadow-xl shadow-f1-red/10 border border-slate-100 mb-6 inline-flex items-center justify-center relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white relative group-hover:scale-105 transition-transform duration-300">
                   <img 
                     src="/yepping-profile.jpg" 
                     alt="YeppingCouple Profile" 
                     className="w-full h-full object-cover"
                   />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-10">
                  <Heart className="w-4 h-4 text-f1-red fill-f1-red animate-pulse" />
                </div>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-f1-red mb-2">Built with Passion</h4>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center justify-center gap-2">
                MEET <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-f1-red to-rose-600">@YEPPINGCOUPLE</span>
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium max-w-lg mx-auto">
                Halo Paddock Fans! 👋 <br/>
                Kita adalah sepasang kekasih yang sama-sama jatuh cinta pada serunya dunia Formula 1, dan kuis ini kami bangun murni untuk seru-seruan dan merayakan hobi bareng kalian.
                <span className="block mt-3 text-xs text-slate-500 font-bold">
                  Kuis ini fan-made dan dibuat untuk fun only – bukan platform resmi F1 ya.
                </span>
                <span className="block mt-2 italic text-xs font-extrabold text-slate-800">— Keep Pushing! 🏎️💨</span>
              </p>
              <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col items-center gap-4">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Follow our race journey</p>
                 <div className="flex items-center gap-6">
                    <a 
                      href="https://www.tiktok.com/@yeppingcouple" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-600 hover:text-f1-red transition-all font-bold group"
                    >
                      <div className="group-hover:scale-110 transition-transform"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.28z"/></svg></div>
                      <span className="text-xs tracking-wide">TikTok</span>
                    </a>
                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                    <a 
                      href="https://www.instagram.com/yeppingcouple" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-600 hover:text-f1-red transition-all font-bold group"
                    >
                      <div className="group-hover:scale-110 transition-transform"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></div>
                      <span className="text-xs tracking-wide">Instagram</span>
                    </a>
                 </div>
                 <p className="text-[9px] text-slate-400/70 mt-2 italic uppercase tracking-widest font-bold">*** Fan-made platform only.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
