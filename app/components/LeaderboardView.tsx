"use client";

import React from "react";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { LeaderboardEntry } from "@/lib/db";

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  leaderboardTotal: number;
  isLeaderboardLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number | ((p: number) => number)) => void;
  itemsPerPage: number;
  totalPages: number;
  lbFilterLevel: string;
  lbFilterStage: string;
  handleLbFilterChange: (filterType: "level" | "stage", value: string) => void;
  navigateTo: (view: string) => void;
  formatTime: (seconds: number | undefined) => string;
}

export default function LeaderboardView({
  leaderboard,
  leaderboardTotal,
  isLeaderboardLoading,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  totalPages,
  lbFilterLevel,
  lbFilterStage,
  handleLbFilterChange,
  navigateTo,
  formatTime,
}: LeaderboardViewProps) {
  return (
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
         <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-1.5 flex shadow-sm">
            {[
               { id: 'all', label: 'All Compounds' },
               { id: 'basic', label: 'C1 Hard' },
               { id: 'intermediate', label: 'C3 Medium' },
               { id: 'advanced', label: 'C5 Soft' }
            ].map(lvl => (
               <button 
                 key={lvl.id}
                 onClick={() => handleLbFilterChange("level", lvl.id)}
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

         <div className="bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 p-1.5 flex shadow-sm">
            {[
               { id: 'all', label: 'All Stages' },
               { id: '1', label: 'Stage 1' },
               { id: '2', label: 'Stage 2' },
               { id: '3', label: 'Stage 3' }
            ].map(stg => (
               <button 
                 key={stg.id}
                 onClick={() => handleLbFilterChange("stage", stg.id)}
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
              {isLeaderboardLoading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-500 font-black uppercase tracking-widest">
                    <div className="flex flex-col items-center gap-4 justify-center">
                      <div className="w-10 h-10 border-4 border-slate-200 border-t-f1-red rounded-full animate-spin"></div>
                      <span className="text-xs animate-pulse text-slate-600">Fetching Sector Data...</span>
                    </div>
                  </td>
                </tr>
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest">
                    No telemetry data recorded yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry, index) => {
                  const globalIndex = ((currentPage - 1) * itemsPerPage) + index;
                  const rowStyle = "border-b border-slate-100 hover:bg-slate-50 transition-colors";
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
        {leaderboardTotal > 0 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Telemetry Feed: Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, leaderboardTotal)} of {leaderboardTotal} Drivers
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
  );
}
