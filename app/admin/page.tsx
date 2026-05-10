"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dbService, Question } from "@/lib/db";
import { Shield, Lock, CheckCircle2, RefreshCw, Camera, ChevronLeft } from "lucide-react";

export default function RaceControl() {
  // Auth & Data State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // CRUD Form State
  const [formLevel, setFormLevel] = useState<"basic" | "intermediate" | "advanced">("basic");
  const [formStage, setFormStage] = useState<number>(1);
  const [formQuestionText, setFormQuestionText] = useState<string>("");
  const [formImageUrl, setFormImageUrl] = useState<string>("");
  const [formOptionA, setFormOptionA] = useState<string>("");
  const [formOptionB, setFormOptionB] = useState<string>("");
  const [formOptionC, setFormOptionC] = useState<string>("");
  const [formOptionD, setFormOptionD] = useState<string>("");
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<string>("A");
  
  const [editModeId, setEditModeId] = useState<string | null>(null);
  const [crudSuccess, setCrudSuccess] = useState<string | null>(null);

  // Listing Filters
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");

  // Data loader
  const loadAdminQuestions = async () => {
    setIsLoading(true);
    try {
      const allQ = await dbService.getQuestions();
      setQuestions(allQ);
    } catch (err) {
      console.error("Error loading telemetry data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "240400") {
      setIsAdminAuth(true);
      setAdminPassword("");
      loadAdminQuestions();
    } else {
      alert("Invalid Race Control Clearance Code");
    }
  };

  // Admin Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudSuccess(null);

    const payload = {
      level: formLevel,
      stage: Number(formStage),
      questionText: formQuestionText.trim(),
      imageUrl: formImageUrl.trim(),
      options: [formOptionA.trim(), formOptionB.trim(), formOptionC.trim(), formOptionD.trim()],
      correctAnswer: formCorrectAnswer === "A" ? formOptionA.trim() :
                     formCorrectAnswer === "B" ? formOptionB.trim() :
                     formCorrectAnswer === "C" ? formOptionC.trim() : formOptionD.trim()
    };

    try {
      if (editModeId) {
        await dbService.updateQuestion(editModeId, payload);
        setCrudSuccess("Telemetry updated successfully.");
        setEditModeId(null);
      } else {
        await dbService.addQuestion(payload);
        setCrudSuccess("New telemetry profile injected successfully.");
      }
      await loadAdminQuestions();
      
      // reset fields
      setFormQuestionText("");
      setFormImageUrl("");
      setFormOptionA("");
      setFormOptionB("");
      setFormOptionC("");
      setFormOptionD("");
    } catch (err) {
      console.error(err);
      alert("Error saving telemetry.");
    }
  };

  // Admin Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (confirm("Are you sure you want to black-flag this telemetry? This action cannot be reversed.")) {
      try {
        await dbService.deleteQuestion(id);
        setCrudSuccess("Telemetry deleted successfully.");
        await loadAdminQuestions();
      } catch (err) {
        console.error(err);
        alert("Error deleting telemetry.");
      }
    }
  };

  // Admin Edit Population
  const populateEditForm = (q: Question) => {
    setEditModeId(q.id || null);
    setFormLevel(q.level);
    setFormStage(q.stage || 1);
    setFormQuestionText(q.questionText);
    setFormImageUrl(q.imageUrl || "");
    setFormOptionA(q.options[0] || "");
    setFormOptionB(q.options[1] || "");
    setFormOptionC(q.options[2] || "");
    setFormOptionD(q.options[3] || "");
    
    if (q.correctAnswer === q.options[0]) setFormCorrectAnswer("A");
    else if (q.correctAnswer === q.options[1]) setFormCorrectAnswer("B");
    else if (q.correctAnswer === q.options[2]) setFormCorrectAnswer("C");
    else setFormCorrectAnswer("D");
    
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleForceSync = async () => {
    if(confirm("WARNING: This will wipe your live Supabase 'questions' table and re-seed it with the default campaign questions! Proceed?")) {
      setIsLoading(true);
      try {
        await dbService.forceSyncDefaultsToFirestore();
        await loadAdminQuestions();
        setCrudSuccess("SUPABASE FULLY SYNCED WITH DEFAULT CAMPAIGN QUESTIONS!");
      } catch (err) {
        console.error(err);
        alert("Failed to force sync.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden paddock-background">
      {/* MINIMAL NAV */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-800 group">
             <img src="/f1-logo.png" alt="F1" className="h-4 mix-blend-multiply grayscale group-hover:grayscale-0 transition-all" />
             <span className="font-black uppercase tracking-tighter text-sm">Paddock<span className="text-f1-red">IQ</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest">
            <ChevronLeft className="w-3 h-3" />
            Exit Console
          </Link>
        </div>
      </nav>

      <main className="flex-grow w-full flex flex-col items-center px-4 md:px-6 lg:px-8 pb-20">
        <div className="w-full max-w-5xl animate-fade-in z-10 flex flex-col my-10">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-f1-red/10 border border-f1-red/30 px-3 py-1 rounded-full mb-4">
                <Shield className="w-4 h-4 text-f1-red" />
                <span className="text-xs font-bold uppercase tracking-widest text-f1-red">Restricted Access</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">
                RACE <span className="text-transparent bg-clip-text bg-gradient-to-r from-f1-red to-orange-500">CONTROL</span>
              </h2>
              <p className="text-slate-500 font-bold text-xs tracking-wider mt-1 uppercase">Question Repository & System Configuration</p>
            </div>
          </div>

          {!isAdminAuth ? (
            <div className="paddock-card rounded-2xl p-12 max-w-md w-full mx-auto border-t-4 border-t-f1-red text-center shadow-2xl bg-white mt-10">
              <Lock className="w-12 h-12 text-slate-600 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-widest">Authentication Required</h3>
              <form onSubmit={handleAdminLogin}>
                <input 
                  type="password"
                  autoFocus
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter Clearance Code..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center text-slate-900 font-mono tracking-widest focus:outline-none focus:border-f1-red focus:bg-white transition-colors mb-4 shadow-inner"
                />
                <button type="submit" className="w-full glowing-red-btn bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest py-4 rounded-lg shadow-lg transition-transform active:scale-95">
                  Grant Access
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {crudSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-between shadow-sm animate-bounce-once">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {crudSuccess}
                  </div>
                  <button onClick={() => setCrudSuccess(null)} className="text-emerald-600/50 hover:text-emerald-600">&times;</button>
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  onClick={handleForceSync}
                  className="flex items-center gap-2 bg-white text-f1-red border border-f1-red/30 px-4 py-2 rounded hover:bg-f1-red hover:text-white transition-all text-xs font-bold tracking-widest uppercase shadow-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  Resync Global Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Input Controls */}
                <div className="lg:col-span-7 paddock-card bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    {editModeId ? "Edit Telemetry Profile" : "Inject New Telemetry"}
                    {editModeId && <span className="text-[10px] bg-amber-500/20 text-amber-600 px-2 py-1 rounded font-black">EDIT MODE</span>}
                  </h3>

                  <form onSubmit={handleSaveQuestion} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Compound Level</label>
                        <select 
                          value={formLevel} 
                          onChange={(e) => setFormLevel(e.target.value as any)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-f1-red focus:bg-white transition-colors"
                        >
                          <option value="basic">Basic (C1 Hard)</option>
                          <option value="intermediate">Intermediate (C3 Medium)</option>
                          <option value="advanced">Advanced (C5 Soft)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stage</label>
                        <select 
                          value={formStage} 
                          onChange={(e) => setFormStage(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-f1-red focus:bg-white transition-colors"
                        >
                          <option value={1}>Stage 1: FP (Free Practice)</option>
                          <option value={2}>Stage 2: Qualifying</option>
                          <option value={3}>Stage 3: Race</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Question Text</label>
                      <textarea 
                        required
                        value={formQuestionText}
                        onChange={(e) => setFormQuestionText(e.target.value)}
                        placeholder="Enter the trivia question..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-f1-red focus:bg-white transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Image URL</label>
                      <input 
                        type="url"
                        required
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-f1-red focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Answer Options & Correct Key</label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['A', 'B', 'C', 'D'].map((opt, idx) => {
                          const val = idx === 0 ? formOptionA : idx === 1 ? formOptionB : idx === 2 ? formOptionC : formOptionD;
                          const setter = idx === 0 ? setFormOptionA : idx === 1 ? setFormOptionB : idx === 2 ? setFormOptionC : setFormOptionD;
                          const isCorrect = formCorrectAnswer === opt;
                          
                          return (
                            <div key={opt} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'}`}>
                              <button
                                type="button"
                                onClick={() => setFormCorrectAnswer(opt)}
                                className={`shrink-0 w-8 h-8 rounded flex items-center justify-center font-black text-sm transition-all ${
                                  isCorrect ? 'bg-emerald-500 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                {opt}
                              </button>
                              <input 
                                type="text"
                                required
                                value={val}
                                onChange={(e) => setter(e.target.value)}
                                placeholder={`Option ${opt}...`}
                                className="flex-grow bg-transparent border-none text-slate-900 text-sm focus:outline-none font-medium"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest py-4 rounded-lg shadow-md transition-all active:scale-[0.99]"
                      >
                        {editModeId ? "UPDATE TELEMETRY" : "INJECT TELEMETRY"}
                      </button>
                      
                      {editModeId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditModeId(null);
                            setFormQuestionText("");
                            setFormImageUrl("");
                            setFormOptionA("");
                            setFormOptionB("");
                            setFormOptionC("");
                            setFormOptionD("");
                          }}
                          className="px-6 bg-slate-50 text-slate-600 font-bold tracking-widest uppercase text-xs rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* RIGHT COLUMN: Live Preview Mockup */}
                <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
                  <div className="flex items-center justify-between px-2">
                     <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5" />
                        Visual Preview
                     </h3>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md relative overflow-hidden border-t-4 border-t-f1-red">
                    {/* Live Preview Image Container */}
                    {formImageUrl && formImageUrl.trim() ? (
                       <div className="w-full aspect-[16/9] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative mb-4 shadow-inner">
                          <img 
                             src={formImageUrl} 
                             alt="Preview" 
                             className="w-full h-full object-cover"
                             onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Link+Broken"; }}
                          />
                          <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">Visual Active</div>
                       </div>
                    ) : (
                       <div className="w-full aspect-[16/9] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3 mb-4 shadow-inner">
                          <Camera className="w-10 h-10 opacity-30" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Waiting for URL...</p>
                       </div>
                    )}

                    {/* Live Preview Question Text */}
                    <h4 className="text-sm font-bold text-slate-900 mb-5 leading-relaxed line-clamp-3 min-h-[40px] border-l-4 border-slate-200 pl-3">
                       {formQuestionText.trim() ? formQuestionText : <span className="text-slate-300 italic font-medium">Input your question string...</span>}
                    </h4>

                    {/* Live Preview Options */}
                    <div className="grid grid-cols-1 gap-2">
                       {[formOptionA, formOptionB, formOptionC, formOptionD].map((optText, idx) => {
                          const label = String.fromCharCode(65 + idx); 
                          const isCorrect = formCorrectAnswer === label;
                          return (
                             <div 
                                key={label} 
                                className={`text-xs p-3 rounded-lg border font-bold flex items-center justify-between ${
                                  isCorrect 
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                                    : 'bg-white border-slate-200 text-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-3 w-full">
                                   <span className={`w-6 h-6 rounded flex items-center justify-center font-black text-[10px] shrink-0 ${
                                      isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                   }`}>{label}</span>
                                   <span className="truncate">
                                      {optText.trim() ? optText : <span className="text-slate-300 italic font-medium">Option {label} placeholder</span>}
                                   </span>
                                </div>
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                             </div>
                          );
                       })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    Active Database Records
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-full">{questions.filter(q => (filterLevel === "all" || q.level === filterLevel) && (filterStage === "all" || Number(q.stage) === Number(filterStage))).length} / {questions.length}</span>
                  </h3>
                  <button 
                    onClick={loadAdminQuestions}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-f1-red" : "text-slate-500"}`} />
                    {isLoading ? "Loading..." : "Reload"}
                  </button>
                </div>
                
                <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level:</span>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Levels</option>
                      <option value="basic">Basic (C1)</option>
                      <option value="intermediate">Intermediate (C3)</option>
                      <option value="advanced">Advanced (C5)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stage:</span>
                    <select
                      value={filterStage}
                      onChange={(e) => setFilterStage(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Stages</option>
                      <option value="1">Stage 1 (FP)</option>
                      <option value="2">Stage 2 (Qualifying)</option>
                      <option value="3">Stage 3 (Race)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 z-10">
                      <tr className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        <th className="p-4">Level</th>
                        <th className="p-4">Stage</th>
                        <th className="p-4">Question Content</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {questions.length === 0 && !isLoading && (
                         <tr>
                           <td colSpan={4} className="p-12 text-center text-slate-400 italic">No records found. Use Reload or add telemetry above.</td>
                         </tr>
                      )}
                      {questions
                        .filter(q => {
                          const matchesLevel = filterLevel === "all" || q.level === filterLevel;
                          const matchesStage = filterStage === "all" || Number(q.stage) === Number(filterStage);
                          return matchesLevel && matchesStage;
                        })
                        .map((q, idx) => (
                        <tr key={q.id || idx} className="hover:bg-slate-50 transition-colors group">
                          <td className="p-4">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              q.level === 'advanced' ? 'bg-red-50 text-red-600 border-red-200' :
                              q.level === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {q.level}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-bold">S{q.stage}</td>
                          <td className="p-4">
                            <div className="max-w-md truncate text-slate-900 font-medium">{q.questionText}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => populateEditForm(q)}
                                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteQuestion(q.id!)}
                                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
