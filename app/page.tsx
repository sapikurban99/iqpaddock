"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { dbService, Question, LeaderboardEntry } from "@/lib/db";
import { Trophy } from "lucide-react";
import { toPng } from "html-to-image";

import LandingView from "@/app/components/LandingView";
import StageSelectionView from "@/app/components/StageSelectionView";
import QuizView from "@/app/components/QuizView";
import ResultView from "@/app/components/ResultView";
import CertificateView from "@/app/components/CertificateView";
import LeaderboardView from "@/app/components/LeaderboardView";

export default function PaddockPulse() {
  const [currentView, setCurrentView] = useState<string>("landing");

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardTotal, setLeaderboardTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [lbFilterLevel, setLbFilterLevel] = useState<string>("all");
  const [lbFilterStage, setLbFilterStage] = useState<string>("all");

  // Reset page on filter change (via button handlers in LeaderboardView)
  const handleLbFilterChange = useCallback((filterType: "level" | "stage", value: string) => {
    setCurrentPage(1);
    if (filterType === "level") setLbFilterLevel(value);
    else setLbFilterStage(value);
  }, []);

  useEffect(() => {
    if (currentView === "leaderboard") {
      const fetch = async () => {
        setIsLeaderboardLoading(true);
        try {
          const res = await dbService.getLeaderboard(currentPage, itemsPerPage, lbFilterLevel, lbFilterStage);
          setLeaderboard(res.data);
          setLeaderboardTotal(res.count);
        } catch (e) {
          console.error("Pagination fetch failed:", e);
        } finally {
          setIsLeaderboardLoading(false);
        }
      };
      fetch();
    }
  }, [currentView, currentPage, lbFilterLevel, lbFilterStage]);

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

  const [unlockedStages, setUnlockedStages] = useState<Record<string, number>>({ basic: 1, intermediate: 1, advanced: 1 });
  const [completedLicenses, setCompletedLicenses] = useState<Record<string, {score: number, timeTaken: number}>>({});
  const [driverPhoto, setDriverPhoto] = useState<string | null>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("paddock_pulse_unlocked_stages");
      if (saved) {
        queueMicrotask(() => setUnlockedStages(JSON.parse(saved)));
      } else {
        // Ensure initial values
      }
      const savedLicenses = localStorage.getItem("paddock_pulse_licenses");
      if (savedLicenses) {
        queueMicrotask(() => setCompletedLicenses(JSON.parse(savedLicenses)));
      }
      const savedName = localStorage.getItem("paddock_pulse_driver_name");
      if (savedName) {
        queueMicrotask(() => setDriverName(savedName));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("paddock_pulse_unlocked_stages", JSON.stringify(unlockedStages));
    }
  }, [unlockedStages]);

  useEffect(() => {
    if (!driverName.trim()) return;
    
    const syncUserData = async () => {
      try {
        const userRecords = await dbService.getUserRecord(driverName);
        if (userRecords.length === 0) return;

        setCompletedLicenses(prev => {
          const localCopy = { ...prev };
          let hasChanged = false;

          userRecords.forEach(entry => {
            const existing = localCopy[entry.level];
            if (!existing || entry.score > existing.score || (entry.score === existing.score && (entry.timeTaken || 999999) < (existing.timeTaken || 999999))) {
              localCopy[entry.level] = { 
                score: entry.score, 
                timeTaken: entry.timeTaken !== undefined ? entry.timeTaken : 0 
              };
              hasChanged = true;
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
      } catch (error) {
        console.warn("Targeted history sync failed:", error);
      }
    };
    syncUserData();
  }, [driverName]);

  const navigateTo = (view: string) => {
    setCurrentView(view);
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
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectLevelAndGoToStages = (level: "basic" | "intermediate" | "advanced") => {
    setSelectedLevel(level);
    navigateTo("stage-selection");
  };

  const startStageQuiz = async (level: "basic" | "intermediate" | "advanced", stageNum: number) => {
    if (!driverName.trim()) {
      alert("PERINGATAN: Masukkan Driver Alias kamu terlebih dahulu di kolom bagian atas sebelum memulai balapan!");
      const el = document.getElementById("global-driver-alias-input");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
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

  const handleSelectAnswer = (option: string) => {
    if (hasAnswered) return;
    setSelectedAnswer(option);
    setHasAnswered(true);
    
    const currentQ = quizQuestions[currentQuestionIndex];
    if (option === currentQ.correctAnswer) {
      const basePoints = Math.round(100 / quizQuestions.length);
      const points = (currentQuestionIndex === quizQuestions.length - 1) 
          ? 100 - (basePoints * (quizQuestions.length - 1))
          : basePoints;
      setScore((prev) => Math.min(prev + points, 100));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      // eslint-disable-next-line react-hooks/purity -- Date.now() is valid in event handlers
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

      handleSubmitScore(undefined, true, elapsedSeconds);
      navigateTo("result");
    }
  };

  const handleSubmitScore = async (e?: React.FormEvent, skipRedirect = false, overrideTimeTaken?: number) => {
    if (e) e.preventDefault();
    
    const nameToUse = driverName.trim();
    if (!nameToUse) return;

    if (typeof window !== "undefined") {
      localStorage.setItem("paddock_pulse_driver_name", nameToUse);
    }

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

  const driverNameInputRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSaveDriverName = useCallback((name: string) => {
    if (driverNameInputRef.current) clearTimeout(driverNameInputRef.current);
    driverNameInputRef.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("paddock_pulse_driver_name", name.trim());
      }
    }, 400);
  }, []);

  const [generateLicenseId] = useState(() => `FIA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);

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
      const dataUrl = await toPng(element, { cacheBust: true, quality: 1.0, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `PaddockIQ-License-${driverName.replace(/\s+/g, '-').toUpperCase() || 'DRIVER'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export failed. Please try again.");
    } finally { setIsExportingImage(false); }
  };

  const totalPages = Math.max(1, Math.ceil(leaderboardTotal / itemsPerPage));

  return (
    <div className="flex flex-col flex-1 min-h-screen overflow-x-hidden paddock-background">
      {/* GLOBAL NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigateTo("landing")}
            >
              <img 
                src="/f1-logo.png" 
                alt="F1 Logo" 
                className="h-6 w-auto mix-blend-multiply group-hover:scale-105 transition-transform brightness-90"
              />
              <div className="border-l border-white/15 pl-3">
                <div className="text-lg font-black uppercase tracking-tighter leading-none text-slate-900 flex items-center gap-1">
                  PADDOCK<span className="text-f1-red">IQ</span>
                </div>
                <div className="text-[8px] text-slate-600 tracking-widest uppercase font-bold">Telemetry Pulse</div>
              </div>
            </div>
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-f1-red/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]" />
        </div>

        {isLoading && currentView !== 'quiz' && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col gap-4 items-center justify-center z-40 transition-opacity">
            <div className="w-16 h-16 border-4 border-f1-red border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="text-f1-red font-black uppercase tracking-widest text-sm animate-pulse">Syncing Telemetry...</p>
          </div>
        )}

        {currentView === "landing" && (
          <LandingView selectLevelAndGoToStages={selectLevelAndGoToStages} />
        )}

        {currentView === "stage-selection" && (
          <StageSelectionView
            selectedLevel={selectedLevel}
            completedLicenses={completedLicenses}
            driverName={driverName}
            setDriverName={setDriverName}
            debouncedSaveDriverName={debouncedSaveDriverName}
            unlockedStages={unlockedStages}
            viewStoredCertificate={viewStoredCertificate}
            startStageQuiz={startStageQuiz}
            navigateTo={navigateTo}
          />
        )}

        {currentView === "quiz" && (
          <QuizView
            quizQuestions={quizQuestions}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswer={selectedAnswer}
            hasAnswered={hasAnswered}
            score={score}
            selectedLevel={selectedLevel}
            selectedStage={selectedStage}
            handleSelectAnswer={handleSelectAnswer}
            handleNextQuestion={handleNextQuestion}
            navigateTo={navigateTo}
            fullscreenImage={fullscreenImage}
            setFullscreenImage={setFullscreenImage}
          />
        )}

        {currentView === "result" && (
          <ResultView
            score={score}
            selectedStage={selectedStage}
            selectedLevel={selectedLevel}
            driverName={driverName}
            isSubmittingScore={isSubmittingScore}
            navigateTo={navigateTo}
          />
        )}

        {currentView === "certificate" && (
          <CertificateView
            selectedLevel={selectedLevel}
            score={score}
            timeTaken={timeTaken}
            driverName={driverName}
            driverPhoto={driverPhoto}
            isExportingImage={isExportingImage}
            generateLicenseId={generateLicenseId}
            handlePhotoUpload={handlePhotoUpload}
            handleExportLicense={handleExportLicense}
            navigateTo={navigateTo}
            formatTime={formatTime}
          />
        )}

        {currentView === "leaderboard" && (
          <LeaderboardView
            leaderboard={leaderboard}
            leaderboardTotal={leaderboardTotal}
            isLeaderboardLoading={isLeaderboardLoading}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            lbFilterLevel={lbFilterLevel}
            lbFilterStage={lbFilterStage}
            handleLbFilterChange={handleLbFilterChange}
            navigateTo={navigateTo}
            formatTime={formatTime}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full mt-auto py-8 text-center z-10 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
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
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">PADDOCK IQ © {new Date().getFullYear()} — by @yeppingcouple</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
