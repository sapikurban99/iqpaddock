"use client";

import React, { useState, useEffect } from "react";
import { dbService, Question, LeaderboardEntry } from "@/lib/db";
import { Trophy, AlertCircle, ChevronRight, ChevronLeft, CheckCircle2, Shield, Loader2, RefreshCw, Lock, Zap, Flame, Flag, UserCircle, Camera, Download, Heart } from "lucide-react";
import { toPng } from "html-to-image";

export default function PaddockPulse() {
  // Navigation View Router State
  // 'landing' | 'stage-selection' | 'quiz' | 'result' | 'certificate' | 'leaderboard' | 'admin'
  const [currentView, setCurrentView] = useState<string>("landing");
  
  // Database State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isFirebase, setIsFirebase] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Leaderboard Filters
  const [lbFilterLevel, setLbFilterLevel] = useState<string>("all");
  const [lbFilterStage, setLbFilterStage] = useState<string>("all");

  // Auto-reset leaderboard page to 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [lbFilterLevel, lbFilterStage]);

  // Quiz Engine State
  const [selectedLevel, setSelectedLevel] = useState<"basic" | "intermediate" | "advanced">("basic");
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [driverName, setDriverName] = useState<string>("");
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Campaign Game States
  const [unlockedStages, setUnlockedStages] = useState<Record<string, number>>({ basic: 1, intermediate: 1, advanced: 1 });
  const [completedLicenses, setCompletedLicenses] = useState<Record<string, {score: number, timeTaken: number}>>({});
  const [driverPhoto, setDriverPhoto] = useState<string | null>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);

  // Admin CRUD Form State
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
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

  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");

  // Fetch Questions and Leaderboard on Mount
  useEffect(() => {
    // Load unlocked stages from local storage safely
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paddock_pulse_unlocked_stages");
      if (saved) {
        setUnlockedStages(JSON.parse(saved));
      }
      const savedLicenses = localStorage.getItem("paddock_pulse_licenses");
      if (savedLicenses) {
        setCompletedLicenses(JSON.parse(savedLicenses));
      }
      const savedName = localStorage.getItem("paddock_pulse_driver_name");
      if (savedName) {
        setDriverName(savedName);
      }
    }
    loadAllData();
  }, []);

  // Save unlocked stages on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("paddock_pulse_unlocked_stages", JSON.stringify(unlockedStages));
    }
  }, [unlockedStages]);

  // Auto-sync historical certificates from Global Leaderboard based on active Driver Alias
  useEffect(() => {
    if (!driverName.trim() || leaderboard.length === 0) return;
    
    setCompletedLicenses(prev => {
      const localCopy = { ...prev };
      let hasChanged = false;
      const searchAlias = driverName.trim().toLowerCase();

      leaderboard.forEach(entry => {
        if (entry.name && entry.name.trim().toLowerCase() === searchAlias && Number(entry.stage) === 3 && Number(entry.score) >= 50) {
          const existing = localCopy[entry.level];
          // If not tracked locally, or leaderboard entry is valid
          if (!existing || entry.score > existing.score || (entry.score === existing.score && (entry.timeTaken || 999999) < (existing.timeTaken || 999999))) {
            localCopy[entry.level] = { 
              score: entry.score, 
              timeTaken: entry.timeTaken !== undefined ? entry.timeTaken : 0 
            };
            hasChanged = true;
          }
        }
      });

      if (hasChanged) {
        if (typeof window !== "undefined") {
          localStorage.setItem("paddock_pulse_licenses", JSON.stringify(localCopy));
        }
        return localCopy;
      }
      return prev;
    });
  }, [leaderboard, driverName]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const allQ = await dbService.getQuestions();
      setQuestions(allQ);
      const lb = await dbService.getLeaderboard();
      setLeaderboard(lb);
    } catch (err) {
      console.error("Error loading initial data:", err);
    } finally {
      setIsLoading(false);
      setIsFirebase(dbService.isFirebaseActive());
    }
  };

  // Navigate & view controller
  const navigateTo = (view: string) => {
    setCurrentView(view);
    // Reset temporary states depending on navigation
    if (view === "leaderboard") {
      setCurrentPage(1);
    }
    if (view === "landing") {
      setQuizQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setScore(0);
    }
    // Scroll to top of window
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectLevelAndGoToStages = (level: "basic" | "intermediate" | "advanced") => {
    setSelectedLevel(level);
    navigateTo("stage-selection");
  };

  const startStageQuiz = async (level: "basic" | "intermediate" | "advanced", stageNum: number) => {
    // Force active driver identification before running
    if (!driverName.trim()) {
      alert("PERINGATAN: Masukkan Driver Alias kamu terlebih dahulu di kolom bagian atas sebelum memulai balapan!");
      const el = document.getElementById("global-driver-alias-input");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        // Temporary visual cue (red border pulse) could be added here via classList
        el.classList.add('ring-4', 'ring-f1-red/40');
        setTimeout(() => el.classList.remove('ring-4', 'ring-f1-red/40'), 2000);
      }
      return;
    }

    setIsLoading(true);
    setSelectedLevel(level);
    setSelectedStage(stageNum);
    try {
      let qList = await dbService.getQuestions(level, stageNum);
      console.log(`[PaddockIQ] Fetched ${qList.length} questions for ${level}/stage${stageNum}`);
      
      // If no questions found, reset local storage and retry
      if (qList.length === 0) {
        console.warn("[PaddockIQ] No questions found, resetting local DB and retrying...");
        await dbService.resetLocalDb();
        qList = await dbService.getQuestions(level, stageNum);
        console.log(`[PaddockIQ] Retry fetched ${qList.length} questions`);
      }
      
      if (qList.length === 0) {
        alert(`No questions available for ${level} Stage ${stageNum}. Please add questions via Race Control.`);
        setIsLoading(false);
        return;
      }
      
      // Fisher-Yates Shuffle for better randomness
      const shuffled = [...qList];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      setQuizQuestions(shuffled.slice(0, 10));
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setScore(0);
      setQuizStartTime(Date.now());
      setTimeTaken(0);
      navigateTo("quiz");
    } catch (err) {
      console.error("Failed to start stage quiz:", err);
      alert("Failed to load questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Answer Selection
  const handleSelectAnswer = (option: string) => {
    if (hasAnswered) return; // Prevent changing answer after selection
    setSelectedAnswer(option);
    setHasAnswered(true);
    
    // Calculate Score immediately
    const currentQ = quizQuestions[currentQuestionIndex];
    if (option === currentQ.correctAnswer) {
      const basePoints = Math.round(100 / quizQuestions.length);
      const points = (currentQuestionIndex === quizQuestions.length - 1) 
          ? 100 - (basePoints * (quizQuestions.length - 1))
          : basePoints;
      setScore((prev) => Math.min(prev + points, 100));
    }
  };

  // Next Question or Finish
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      // Completed Stage - Calculate elapsed time and unlock Progression if passed (>= 50)
      const elapsedSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
      setTimeTaken(elapsedSeconds);

      if (score >= 50) {
        setUnlockedStages(prev => {
          const currentUnlocked = prev[selectedLevel] || 1;
          const nextStage = selectedStage === 1 ? 2 : selectedStage === 2 ? 3 : 4;
          return {
            ...prev,
            [selectedLevel]: Math.max(currentUnlocked, nextStage)
          };
        });

        // Save level completion for certificate recall
        if (selectedStage === 3) {
          setCompletedLicenses(prev => {
            const updated = { ...prev, [selectedLevel]: { score, timeTaken: elapsedSeconds } };
            if (typeof window !== "undefined") {
              localStorage.setItem("paddock_pulse_licenses", JSON.stringify(updated));
            }
            return updated;
          });
        }
      }

      // AUTOMATIC SUBMISSION: If we have the driverName (which is now forced at start),
      // we proactively trigger the background persistence immediately to reduce friction.
      handleSubmitScore(undefined, true, elapsedSeconds);
      
      navigateTo("result");
    }
  };

  // Submit Score to Leaderboard (Supports programmatic auto-trigger via parameters)
  const handleSubmitScore = async (e?: React.FormEvent, skipRedirect = false, overrideTimeTaken?: number) => {
    if (e) e.preventDefault();
    
    const nameToUse = driverName.trim();
    if (!nameToUse) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("paddock_pulse_driver_name", nameToUse);
    }

    // Use the parameter directly if passed, fallback to computed state otherwise
    const finalTime = overrideTimeTaken !== undefined ? overrideTimeTaken : timeTaken;

    setIsSubmittingScore(true);
    try {
      await dbService.addToLeaderboard({
        name: nameToUse,
        score,
        level: selectedLevel,
        stage: selectedStage,
        timeTaken: finalTime,
        createdAt: new Date().toISOString()
      });
      await loadAllData();
      
      // Only redirect if explicitly requested (like clicking manual submit button)
      if (!skipRedirect) {
        if (selectedStage === 3 && score >= 50) {
          navigateTo("certificate");
        } else {
          navigateTo("leaderboard");
        }
      }
    } catch (err) {
      console.error("Failed to save score:", err);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  // Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === "240400") {
      setIsAdminAuth(true);
      setAdminPassword("");
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
      await loadAllData();
      
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
        await loadAllData();
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
    
    // scroll to form
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleForceSync = async () => {
    if(confirm("WARNING: This will wipe your live Firestore 'questions' collection and re-seed it with the 18 default campaign questions! Proceed?")) {
      setIsLoading(true);
      try {
        await dbService.forceSyncDefaultsToFirestore();
        await loadAllData();
        setCrudSuccess("FIRESTORE FULLY SYNCED WITH DEFAULT CAMPAIGN QUESTIONS!");
      } catch (err) {
        console.error(err);
        alert("Failed to force sync.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const generateLicenseId = () => {
    return `FIA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  };

  const formatTime = (seconds: number | undefined) => {
    if (seconds === undefined || seconds === null) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const viewStoredCertificate = (level: "basic" | "intermediate" | "advanced") => {
    const data = completedLicenses[level];
    if (data) {
      setSelectedLevel(level);
      setScore(data.score);
      setTimeTaken(data.timeTaken);
      navigateTo("certificate");
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setDriverPhoto(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleExportLicense = async () => {
    const element = document.getElementById("print-certificate");
    if (!element) return;
    setIsExportingImage(true);
    try {
      const dataUrl = await toPng(element, { cacheBust: true, quality: 1.0, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `PaddockIQ-License-${driverName.replace(/\s+/g, '-').toUpperCase() || 'DRIVER'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally { setIsExportingImage(false); }
  };

  const filteredLeaderboard = leaderboard.filter(entry => {
    const matchLevel = lbFilterLevel === "all" || entry.level === lbFilterLevel;
    const matchStage = lbFilterStage === "all" || Number(entry.stage) === Number(lbFilterStage);
    return matchLevel && matchStage;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLeaderboard.length / itemsPerPage));
  const paginatedLeaderboard = filteredLeaderboard.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden paddock-background">
      {/* GLOBAL NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo("landing")}
            >
              <img 
                src="/f1-logo.png" 
                alt="F1 Logo" 
                className="h-6 w-auto mix-blend-multiply group-hover:scale-105 transition-transform opacity-90 brightness-90 opacity-90"
              />
              <div className="border-l border-white/15 pl-3">
                <div className="text-lg font-black uppercase tracking-tighter leading-none text-slate-900 flex items-center gap-1">
                  PADDOCK<span className="text-f1-red">IQ</span>
                </div>
                <div className="text-[8px] text-slate-600 tracking-widest uppercase font-bold">Telemetry Pulse</div>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigateTo("leaderboard")}
                className="text-slate-600 hover:text-slate-900 text-sm font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow flex flex-col items-center justify-start py-6 relative px-4 sm:px-6 w-full max-w-[100vw]">
        
        {/* Decorative Background Elements strictly clipped within view bounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-f1-red/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]" />
        </div>

        {/* Global Loading Overlay */}
        {isLoading && currentView !== 'quiz' && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col gap-4 items-center justify-center z-40 transition-opacity">
            <div className="w-16 h-16 border-4 border-f1-red border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="text-f1-red font-black uppercase tracking-widest text-sm animate-pulse">Syncing Telemetry...</p>
          </div>
        )}

        {/* 1. LANDING PAGE VIEW - VERTICAL FLOW */}
        {currentView === "landing" && (
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
                  {/* Modern background accent */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-f1-red/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10">
                    {/* Profile Image Decoration */}
                    <div className="bg-white p-2 rounded-full shadow-xl shadow-f1-red/10 border border-slate-100 mb-6 inline-flex items-center justify-center relative group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white relative group-hover:scale-105 transition-transform duration-300">
                         <img 
                           src="/yepping-profile.jpg" 
                           alt="YeppingCouple Profile" 
                           className="w-full h-full object-cover"
                         />
                      </div>
                      {/* Decorative badge */}
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
        )}

        {/* 2. STAGE SELECTION VIEW */}
        {currentView === "stage-selection" && (
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
               {/* Background status fill */}
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
                        if (typeof window !== "undefined") { localStorage.setItem("paddock_pulse_driver_name", val.trim()); }
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
        )}

        {/* 3. QUIZ INTERFACE VIEW */}
        {currentView === "quiz" && quizQuestions.length === 0 && (
          <div className="w-full max-w-md animate-fade-in z-10 flex flex-col items-center text-center py-20">
            <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No Questions Loaded</h2>
            <p className="text-slate-500 mb-6">Could not load questions for this stage. Please try again.</p>
            <button onClick={() => navigateTo("landing")} className="bg-f1-red text-white font-black uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-f1-red-hover transition">Return to Hub</button>
          </div>
        )}
        {currentView === "quiz" && quizQuestions.length > 0 && (
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
              {quizQuestions[currentQuestionIndex].imageUrl && (
                <div 
                  className="w-full rounded-xl overflow-hidden mb-8 border border-slate-200 relative group bg-slate-100 flex items-center justify-center cursor-zoom-in aspect-[16/9] max-h-80 shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => setFullscreenImage(quizQuestions[currentQuestionIndex].imageUrl || null)}
                >
                  <img 
                    src={quizQuestions[currentQuestionIndex].imageUrl} 
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
                {quizQuestions[currentQuestionIndex].questionText}
              </h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {quizQuestions[currentQuestionIndex].options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === quizQuestions[currentQuestionIndex].correctAnswer;
                  
                  // Determine Option Style State
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
                    optionStateClass = "bg-slate-200 border-slate-1000 text-slate-900";
                  }

                  const letter = String.fromCharCode(65 + index); // A, B, C, D

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
                      ? "glowing-red-btn bg-slate-900 text-white hover:bg-slate-800 hover:bg-slate-200" 
                      : "bg-slate-50 text-slate-500 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  {currentQuestionIndex < quizQuestions.length - 1 ? "NEXT LAP" : "CHEQUERED FLAG"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. RESULT VIEW */}
        {currentView === "result" && (
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
        )}

        {/* 4.5 CERTIFICATE VIEW */}
        {currentView === "certificate" && (
          <div className="w-full max-w-3xl animate-fade-in z-10 flex flex-col items-center mt-10">
            {/* The Certificate Card */}
            <div id="print-certificate" className={`w-full relative aspect-auto sm:aspect-[1.6/1] min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border bg-slate-950 transition-all duration-500 ${
              selectedLevel === 'advanced' ? 'border-f1-red/30 shadow-f1-red/20' :
              selectedLevel === 'intermediate' ? 'border-amber-500/30 shadow-amber-500/20' :
              'border-slate-400/30 shadow-slate-400/20'
            }`}>
              {/* High-quality abstract background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black"></div>
              
              {/* Thematic accent gradients */}
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
                  
                  {/* Left Details Grid */}
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
                        <img src={driverPhoto} alt="Driver" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                          <UserCircle className="w-16 h-16 mb-1 opacity-50" />
                          <span className="text-[8px] uppercase font-black tracking-widest opacity-50">NO PHOTO</span>
                        </div>
                      )}
                      
                      {/* Subtle Scanlines */}
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-30" />
                      
                      {/* Verify Watermark */}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-[6px] text-emerald-400 px-1 rounded font-mono">VERIFIED</div>
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex justify-between items-end border-t border-white/10 pt-4 mt-6 shrink-0">
                  <div>
                    <p className="text-[8px] text-white/40 font-mono tracking-widest">REGISTRY ID: {generateLicenseId()}</p>
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
        )}

        {/* 5. LEADERBOARD VIEW */}
        {currentView === "leaderboard" && (
          <div className="w-full max-w-4xl animate-fade-in z-10 flex flex-col h-[80vh]">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-4">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Global Standings</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">CHAMPIONSHIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">BOARD</span></h2>
              </div>
              <button 
                onClick={() => navigateTo("landing")}
                className="bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded border border-slate-300 hover:bg-slate-200 transition"
              >
                Back to Grid
              </button>
            </div>

            {/* Leaderboard Filtering Controls */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
               {/* Level Filters */}
               <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-1.5 flex shadow-sm">
                  {[
                     { id: 'all', label: 'All Compounds' },
                     { id: 'basic', label: 'C1 Hard' },
                     { id: 'intermediate', label: 'C3 Medium' },
                     { id: 'advanced', label: 'C5 Soft' }
                  ].map(lvl => (
                     <button 
                       key={lvl.id}
                       onClick={() => setLbFilterLevel(lvl.id)}
                       className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                         lbFilterLevel === lvl.id 
                           ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]' 
                           : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                       }`}
                     >
                       {lvl.label}
                     </button>
                  ))}
               </div>

               {/* Stage Filters */}
               <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-1.5 flex shadow-sm">
                  {[
                     { id: 'all', label: 'All Stages' },
                     { id: '1', label: 'Stage 1' },
                     { id: '2', label: 'Stage 2' },
                     { id: '3', label: 'Stage 3' }
                  ].map(stg => (
                     <button 
                       key={stg.id}
                       onClick={() => setLbFilterStage(stg.id)}
                       className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                         lbFilterStage === stg.id 
                           ? 'bg-f1-red text-white shadow-lg shadow-f1-red/20 scale-[1.02]' 
                           : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                       }`}
                     >
                       {stg.label}
                     </button>
                  ))}
               </div>
            </div>

            <div className="paddock-card rounded-2xl border border-slate-200 overflow-hidden flex-grow flex flex-col">
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-600">
                      <th className="p-4 pl-6 font-bold w-20">Pos</th>
                      <th className="p-4 font-bold">Driver Name</th>
                      <th className="p-4 font-bold">Compound & Stage</th>
                      <th className="p-4 font-bold">Fastest Lap</th>
                      <th className="p-4 font-bold text-right pr-6">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">
                          No telemetry data recorded yet.
                        </td>
                      </tr>
                    ) : (
                      paginatedLeaderboard.map((entry, index) => {
                        const globalIndex = ((currentPage - 1) * itemsPerPage) + index;
                        let rowStyle = "border-b border-slate-100 hover:bg-slate-50 transition-colors";
                        let posContent = <span className="text-slate-500 font-black text-lg">{(globalIndex + 1).toString().padStart(2, '0')}</span>;
                        
                        if (globalIndex === 0) {
                          posContent = <div className="w-8 h-8 rounded-full bg-yellow-400/20 border border-yellow-400 flex items-center justify-center text-yellow-400 font-black shadow-[0_0_10px_rgba(250,204,21,0.3)]">1</div>;
                        } else if (globalIndex === 1) {
                          posContent = <div className="w-8 h-8 rounded-full bg-slate-300/20 border border-slate-300 flex items-center justify-center text-slate-700 font-black">2</div>;
                        } else if (globalIndex === 2) {
                          posContent = <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-700 flex items-center justify-center text-amber-500 font-black">3</div>;
                        }

                        return (
                          <tr key={entry.id || index} className={rowStyle}>
                            <td className="p-4 pl-6">{posContent}</td>
                            <td className="p-4">
                              <span className={`font-bold text-lg uppercase ${globalIndex === 0 ? 'text-yellow-400' : 'text-slate-900'}`}>{entry.name}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                                  entry.level === 'advanced' ? 'bg-f1-red/20 text-f1-red border-f1-red/30' :
                                  entry.level === 'intermediate' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                                  'bg-slate-500/20 text-slate-700 border-slate-500/30'
                                }`}>
                                  {entry.level}
                                </span>
                                <span className="text-xs font-bold text-slate-600">Stage {entry.stage || 1}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-xs md:text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {formatTime(entry.timeTaken)}
                              </span>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <span className="font-black text-xl text-slate-900">{entry.score}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredLeaderboard.length > 0 && (
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Telemetry Feed: Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLeaderboard.length)} of {filteredLeaderboard.length} Drivers
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); }}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold text-xs shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-inner flex items-center">
                       <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Page {currentPage} / {totalPages}</span>
                    </div>
                    <button 
                      onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition font-bold text-xs shadow-sm"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. ADMIN / RACE CONTROL VIEW */}
        {currentView === "admin" && (
          <div className="w-full max-w-4xl animate-fade-in z-10 flex flex-col my-10">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-f1-red/10 border border-f1-red/30 px-3 py-1 rounded-full mb-4">
                  <Shield className="w-4 h-4 text-f1-red" />
                  <span className="text-xs font-bold uppercase tracking-widest text-f1-red">Restricted Access</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900">RACE <span className="text-transparent bg-clip-text bg-gradient-to-r from-f1-red to-orange-500">CONTROL</span></h2>
              </div>
              <button 
                onClick={() => navigateTo("landing")}
                className="bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded border border-slate-300 hover:bg-slate-200 transition"
              >
                Exit to Grid
              </button>
            </div>

            {!isAdminAuth ? (
              <div className="paddock-card rounded-2xl p-8 max-w-md w-full mx-auto border-t-4 border-t-f1-red text-center">
                <Lock className="w-12 h-12 text-slate-600 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-widest">Authentication Required</h3>
                <form onSubmit={handleAdminLogin}>
                  <input 
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter Clearance Code..."
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-center text-slate-900 font-mono tracking-widest focus:outline-none focus:border-f1-red transition-colors mb-4"
                  />
                  <button type="submit" className="w-full glowing-red-btn bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest py-3 rounded-lg hover:bg-slate-200 transition">
                    Grant Access
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-8">
                {crudSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      {crudSuccess}
                    </div>
                    <button onClick={() => setCrudSuccess(null)} className="text-emerald-400/50 hover:text-emerald-400">&times;</button>
                  </div>
                )}

                <div className="flex justify-end">
                  <button 
                    onClick={handleForceSync}
                    className="flex items-center gap-2 bg-f1-red/20 text-f1-red border border-f1-red/30 px-4 py-2 rounded hover:bg-f1-red/30 transition text-xs font-bold tracking-widest uppercase"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Force Sync Defaults to Firestore
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* LEFT COLUMN: Input Controls */}
                  <div className="lg:col-span-7 paddock-card rounded-2xl p-6 md:p-8 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-200 pb-4">
                      {editModeId ? "Edit Telemetry Profile" : "Inject New Telemetry"}
                      {editModeId && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded">EDIT MODE</span>}
                    </h3>

                  <form onSubmit={handleSaveQuestion} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Compound Level</label>
                        <select 
                          value={formLevel} 
                          onChange={(e) => setFormLevel(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-f1-red transition-colors appearance-none"
                        >
                          <option value="basic">Basic (C1 Hard)</option>
                          <option value="intermediate">Intermediate (C3 Medium)</option>
                          <option value="advanced">Advanced (C5 Soft)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Stage</label>
                        <select 
                          value={formStage} 
                          onChange={(e) => setFormStage(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-f1-red transition-colors appearance-none"
                        >
                          <option value={1}>Stage 1: FP (Free Practice)</option>
                          <option value={2}>Stage 2: Qualifying</option>
                          <option value={3}>Stage 3: Race</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Question Text</label>
                      <textarea 
                        required
                        value={formQuestionText}
                        onChange={(e) => setFormQuestionText(e.target.value)}
                        placeholder="Enter the trivia question..."
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-f1-red transition-colors resize-none placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Image URL (Unsplash/Direct Link)</label>
                      <input 
                        type="url"
                        required
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-f1-red transition-colors placeholder-slate-600"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest">Answer Options & Correct Key</label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['A', 'B', 'C', 'D'].map((opt, idx) => {
                          const val = idx === 0 ? formOptionA : idx === 1 ? formOptionB : idx === 2 ? formOptionC : formOptionD;
                          const setter = idx === 0 ? setFormOptionA : idx === 1 ? setFormOptionB : idx === 2 ? setFormOptionC : setFormOptionD;
                          const isCorrect = formCorrectAnswer === opt;
                          
                          return (
                            <div key={opt} className={`flex items-center gap-3 p-3 rounded-lg border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 border-slate-100'}`}>
                              <button
                                type="button"
                                onClick={() => setFormCorrectAnswer(opt)}
                                className={`shrink-0 w-8 h-8 rounded flex items-center justify-center font-black text-sm transition-colors ${
                                  isCorrect ? 'bg-emerald-500 text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                                className="flex-grow bg-transparent border-none text-slate-900 text-sm focus:outline-none placeholder-slate-600"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        className="flex-1 glowing-red-btn bg-slate-900 text-white hover:bg-slate-800 font-black uppercase tracking-widest py-3 rounded-lg hover:bg-slate-200 transition"
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
                          className="px-6 bg-slate-50 text-slate-900 font-bold tracking-widest uppercase text-xs rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                  </div>

                  {/* RIGHT COLUMN: Live Preview Mockup */}
                  <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                          <Camera className="w-3.5 h-3.5" />
                          Live Sector Preview
                       </h3>
                       <div className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase animate-pulse">
                         <div className="w-1 h-1 bg-white rounded-full"></div>
                         REALTIME
                       </div>
                    </div>
                    
                    <div className="paddock-card rounded-2xl p-5 border border-slate-200 shadow-lg bg-white relative overflow-hidden border-t-4 border-t-f1-red">
                      {/* Mock Viewport Decorator */}
                      <div className="flex gap-1.5 mb-4 border-b border-slate-100 pb-3">
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                         <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                      </div>

                      {/* Live Preview Image Container */}
                      {formImageUrl && formImageUrl.trim() ? (
                         <div className="w-full aspect-[16/9] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative mb-4 group shadow-inner">
                            <img 
                               src={formImageUrl} 
                               alt="Preview" 
                               className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all"
                               onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400/f1f5f9/94a3b8?text=Loading+Image+Wait..."; }}
                            />
                            <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">Visual Active</div>
                         </div>
                      ) : (
                         <div className="w-full aspect-[16/9] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3 mb-4 shadow-inner">
                            <Camera className="w-10 h-10 opacity-30" />
                            <div className="text-center">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Waiting for URL...</p>
                               <p className="text-[8px] font-medium text-slate-400 mt-0.5">Pasang Link Image untuk Visualizer</p>
                            </div>
                         </div>
                      )}

                      {/* Live Preview Question Text */}
                      <h4 className="text-sm font-bold text-slate-900 mb-5 leading-relaxed line-clamp-3 min-h-[40px] border-l-4 border-slate-200 pl-3">
                         {formQuestionText.trim() ? formQuestionText : <span className="text-slate-300 italic font-medium">Tulis pertanyaan triviamu di form sebelah kiri...</span>}
                      </h4>

                      {/* Live Preview Options */}
                      <div className="grid grid-cols-1 gap-2">
                         {[formOptionA, formOptionB, formOptionC, formOptionD].map((optText, idx) => {
                            const label = String.fromCharCode(65 + idx); 
                            const isCorrect = formCorrectAnswer === label;
                            return (
                               <div 
                                  key={label} 
                                  className={`text-xs p-3 rounded-lg border font-bold transition-all duration-300 flex items-center justify-between group ${
                                    isCorrect 
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm shadow-emerald-500/5' 
                                      : 'bg-white border-slate-200 text-slate-600'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 overflow-hidden w-full">
                                     <span className={`w-6 h-6 rounded flex items-center justify-center font-black text-[10px] shrink-0 transition-colors ${
                                        isCorrect ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                     }`}>{label}</span>
                                     <span className="truncate flex-grow">
                                        {optText.trim() ? optText : <span className="text-slate-300 italic font-medium">Opsi {label}...</span>}
                                     </span>
                                  </div>
                                  {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 animate-in zoom-in duration-300" />}
                               </div>
                            );
                         })}
                      </div>
                      
                      <div className="mt-6 text-[8px] font-bold text-slate-400 text-center uppercase tracking-widest border-t border-slate-100 pt-3">
                         Paddock IQ Simulator v1.0
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Table */}
                <div className="paddock-card rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">
                      Active Database Records ({questions.filter(q => (filterLevel === "all" || q.level === filterLevel) && (filterStage === "all" || Number(q.stage) === Number(filterStage))).length} / {questions.length})
                    </h3>
                    <button 
                      onClick={loadAllData}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded shadow-sm transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin text-f1-red" : "text-slate-500"}`} />
                      {isLoading ? "Loading..." : "Load Data"}
                    </button>
                  </div>
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Level:</span>
                      <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-f1-red"
                      >
                        <option value="all">All Levels</option>
                        <option value="basic">Basic (C1)</option>
                        <option value="intermediate">Intermediate (C3)</option>
                        <option value="advanced">Advanced (C5)</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Stage:</span>
                      <select
                        value={filterStage}
                        onChange={(e) => setFilterStage(e.target.value)}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-f1-red"
                      >
                        <option value="all">All Stages</option>
                        <option value="1">Stage 1 (FP)</option>
                        <option value="2">Stage 2 (Qualifying)</option>
                        <option value="3">Stage 3 (Race)</option>
                      </select>
                    </div>
                    { (filterLevel !== "all" || filterStage !== "all") && (
                      <button
                        onClick={() => { setFilterLevel("all"); setFilterStage("all"); }}
                        className="text-[10px] font-bold text-f1-red uppercase tracking-widest hover:underline ml-auto"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="sticky top-0 bg-white border-b border-slate-200">
                        <tr className="text-[10px] uppercase tracking-widest text-slate-600">
                          <th className="p-4">Compound</th>
                          <th className="p-4">Stage</th>
                          <th className="p-4">Question String</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {questions
                          .filter(q => {
                            const matchesLevel = filterLevel === "all" || q.level === filterLevel;
                            const matchesStage = filterStage === "all" || Number(q.stage) === Number(filterStage);
                            return matchesLevel && matchesStage;
                          })
                          .map((q, idx) => (
                          <tr key={q.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                q.level === 'advanced' ? 'bg-f1-red/20 text-f1-red border-f1-red/30' :
                                q.level === 'intermediate' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                                'bg-slate-500/20 text-slate-700 border-slate-500/30'
                              }`}>
                                {q.level}
                              </span>
                            </td>
                            <td className="p-4 text-slate-700 font-bold">Stage {q.stage || 1}</td>
                            <td className="p-4">
                              <div className="max-w-xs truncate text-slate-900">{q.questionText}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => populateEditForm(q)}
                                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteQuestion(q.id!)}
                                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-f1-red/20 text-f1-red hover:bg-f1-red/30 transition"
                                >
                                  Delete
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
        )}

      </main>

      {/* FOOTER */}
      <footer className="w-full mt-auto py-8 text-center z-10 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            {/* Social Links */}
            <div className="flex items-center gap-6">
              <a 
                href="https://www.tiktok.com/@yeppingcouple" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.52a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.87a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.28z"/>
                </svg>
                <span className="text-xs font-bold tracking-wide">@yeppingcouple</span>
              </a>
              <a 
                href="https://www.instagram.com/yeppingcouple" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                <span className="text-xs font-bold tracking-wide">@yeppingcouple</span>
              </a>
            </div>
            
            {/* Copyright & Admin */}
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">PADDOCK IQ © {new Date().getFullYear()} — by @yeppingcouple</p>
              <button 
                onClick={() => navigateTo("admin")}
                className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase hover:text-f1-red transition-colors underline decoration-slate-300 underline-offset-4"
              >
                Race Control Access
              </button>
            </div>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
