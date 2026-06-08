import React, { useState } from "react";
import { Driver, Constructor } from "../types";
import { ChevronDown, Trophy, Users } from "lucide-react";

interface ChampionshipStandingsProps {
  drivers: Driver[];
  constructors: Constructor[];
}

export default function ChampionshipStandings({ drivers, constructors }: ChampionshipStandingsProps) {
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position);
  const sortedConstructors = [...constructors].sort((a, b) => a.position - b.position);

  const displayedDrivers = showAllDrivers ? sortedDrivers : sortedDrivers.slice(0, 10);

  return (
    <div 
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      id="standings-cards-container"
    >
      {/* 1. Driver Standings */}
      <div 
        className="lg:col-span-7 p-6 rounded-2xl bg-[#18181B] border border-white/8 shadow-xl relative overflow-hidden" 
        id="driver-standings-card"
      >
        <div className="absolute top-0 inset-x-0 h-[3px] bg-[#F59E0B]" />

        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#F59E0B]/10 rounded-md border border-[#F59E0B]/20">
              <Trophy className="w-4 h-4 text-[#FBBF24]" />
            </div>
            <h3 className="font-sans font-bold text-base uppercase text-white tracking-wider">
              Driver Standings
            </h3>
          </div>
          <span className="font-sans text-[9px] text-[#FBBF24] bg-[#F59E0B]/10 px-2.5 py-0.5 rounded border border-[#F59E0B]/20 font-bold uppercase">
            Live Results
          </span>
        </div>

        {/* Standings Table */}
        <div className="overflow-x-auto select-none" id="driver-standings-table">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/4 font-sans text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                <th className="pb-3 text-center w-10">Pos</th>
                <th className="pb-3 pl-2">Driver</th>
                <th className="pb-3 hidden sm:table-cell">Team</th>
                <th className="pb-3 text-right pr-2">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {displayedDrivers.map((driver) => {
                const maxPoints = sortedDrivers[0]?.points || 1;
                const percentage = Math.max(8, Math.min(100, (driver.points / maxPoints) * 100));
                return (
                  <tr
                    key={driver.id}
                    className="hover:bg-white/2 transition-colors group"
                  >
                    {/* Position */}
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-sans text-xs font-black select-none ${
                        driver.position === 1
                          ? "bg-[#F59E0B] text-black shadow"
                          : driver.position === 2
                          ? "bg-[#A1A1AA] text-black"
                          : driver.position === 3
                          ? "bg-amber-700 text-white"
                          : "text-[#A1A1AA] font-mono"
                      }`}>
                        {driver.position}
                      </span>
                    </td>

                    {/* Driver Label */}
                    <td className="py-3 pl-2 font-sans font-medium text-white uppercase tracking-wide">
                      <div className="flex flex-col w-full pr-4">
                        <span className="font-bold text-xs sm:text-sm">{driver.name}</span>
                        {/* Mobile team view */}
                        <span className="font-sans text-[9px] text-[#A1A1AA] font-normal uppercase tracking-wider block sm:hidden">
                          {driver.team}
                        </span>
                        {/* Simple solid status bar indicator */}
                        <div className="w-full mt-2 h-[4px] bg-[#111114] rounded-sm overflow-hidden hidden sm:block">
                          <div 
                            className="h-full bg-[#F59E0B]" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Team squad */}
                    <td className="py-3 text-[#A1A1AA] uppercase text-xs hidden sm:table-cell">
                      {driver.team}
                    </td>

                    {/* Total points */}
                    <td className="py-3 text-right pr-2 font-sans font-extrabold text-[#FBBF24] tracking-wide text-sm sm:text-base">
                      {driver.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Load More Controller */}
        {!showAllDrivers && sortedDrivers.length > 10 && (
          <div className="text-center mt-4 pt-4 border-t border-white/4">
            <button
              id="load-more-standings-button"
              onClick={() => setShowAllDrivers(true)}
              className="px-4 py-2 bg-[#111114] border border-white/4 rounded-lg text-[#A1A1AA] font-sans text-xs font-bold uppercase tracking-wider hover:border-[#F59E0B]/30 hover:text-white active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
            >
              Show everyone
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {showAllDrivers && (
          <div className="text-center mt-4 pt-4 border-t border-white/4">
            <button
              id="collapse-standings-button"
              onClick={() => setShowAllDrivers(false)}
              className="px-4 py-2 bg-[#111114] border border-white/4 rounded-lg text-[#A1A1AA] font-sans text-xs font-bold uppercase tracking-wider hover:border-white/20 hover:text-white active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
            >
              Show top 10
              <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Constructor Standings */}
      <div 
        className="lg:col-span-5 p-6 rounded-2xl bg-[#18181B] border border-white/8 shadow-xl relative overflow-hidden" 
        id="constructor-standings-card"
      >
        <div className="absolute top-0 inset-x-0 h-[3px] bg-[#FCD34D]" />

        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FCD34D]/10 rounded-md border border-[#FCD34D]/25">
              <Users className="w-4 h-4 text-[#FCD34D]" />
            </div>
            <h3 className="font-sans font-bold text-base uppercase text-white tracking-wider">
              Team Standings
            </h3>
          </div>
          <span className="font-sans text-[9px] text-[#FCD34D] bg-[#FCD34D]/10 px-2.5 py-0.5 rounded border border-[#FCD34D]/25 tracking-wider uppercase font-bold">
            Season Points
          </span>
        </div>

        <div className="overflow-x-auto select-none" id="constructor-standings-table">
          <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/4 font-sans text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                <th className="pb-3 text-center w-10">Pos</th>
                <th className="pb-3 pl-2">Team Name</th>
                <th className="pb-3 text-right pr-2">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {sortedConstructors.map((team) => (
                <tr
                  key={team.id}
                  className="hover:bg-white/2 transition-colors"
                >
                  {/* Position */}
                  <td className="py-3 text-center">
                    <span className="font-sans text-xs font-bold text-[#A1A1AA]">
                      P{team.position}
                    </span>
                  </td>

                  {/* Constructor Label */}
                  <td className="py-3 pl-2 font-sans font-bold text-white uppercase tracking-wide">
                    {team.name}
                  </td>

                  {/* Points */}
                  <td className="py-3 text-right pr-2 font-sans font-extrabold text-[#F59E0B] tracking-wide text-sm sm:text-base">
                    {team.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
