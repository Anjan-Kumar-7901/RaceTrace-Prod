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
        className="lg:col-span-7 p-6 rounded-2xl bg-[#151515] border border-white/8 shadow-xl relative overflow-hidden"
        id="driver-standings-card"
      >
        <div className="absolute top-0 inset-x-0 h-[3px] bg-[#D1D5DB]" />

        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#D1D5DB]/10 rounded-md border border-[#D1D5DB]/20">
              <Trophy className="w-4 h-4 text-[#F8FAFC]" />
            </div>
            <h3 className="font-sans font-bold text-base uppercase text-white tracking-wider">
              Driver Standings
            </h3>
          </div>
          <span className="font-sans text-[9px] text-[#F8FAFC] bg-[#D1D5DB]/10 px-2.5 py-0.5 rounded border border-[#D1D5DB]/20 font-bold uppercase">
            Live Results
          </span>
        </div>

        {/* Standings Table */}
        <div className="overflow-x-auto select-none" id="driver-standings-table">
          <table className="w-full table-fixed text-left border-collapse font-sans text-xs sm:text-sm">
            <colgroup>
              <col className="w-16" />
              <col />
              <col className="hidden sm:table-column sm:w-[22%]" />
              <col className="w-20 sm:w-24" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/4 font-sans text-[10px] text-[#9CA3AF] uppercase tracking-wider">
                <th className="pb-3 text-center">Pos</th>
                <th className="pb-3 pl-3">Driver</th>
                <th className="pb-3 pr-5 text-right hidden sm:table-cell">Team</th>
                <th className="pb-3 text-right pr-3">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {displayedDrivers.map((driver) => {
                const maxPoints = sortedDrivers[0]?.points || 1;
                const percentage = Math.max(8, Math.min(100, (driver.points / maxPoints) * 100));
                const teamStyle = { "--team-color": getTeamColor(driver.team) } as React.CSSProperties;
                return (
                  <tr
                    key={driver.id}
                    className="telemetry-row team-standings-row transition-colors group"
                    style={teamStyle}
                  >
                    {/* Position */}
                    <td className="py-3 text-center">
                      <span className="team-position-badge inline-flex items-center justify-center w-6 h-6 rounded font-sans text-xs font-black select-none">
                        {driver.position}
                      </span>
                    </td>

                    {/* Driver Label */}
                    <td className="py-3 pl-3 font-sans font-medium text-white uppercase tracking-wide">
                      <div className="flex flex-col w-full pr-4">
                        <span className="font-bold text-xs sm:text-sm">{driver.name}</span>
                        {/* Mobile team view */}
                        <span className="font-sans text-[9px] text-[var(--team-color)] font-normal uppercase tracking-wider block sm:hidden">
                          {driver.team}
                        </span>
                        {/* Simple solid status bar indicator */}
                        <div className="w-full mt-2 h-[4px] bg-[#101010] rounded-sm overflow-hidden hidden sm:block">
                          <div 
                            className="h-full bg-[var(--team-color)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Team squad */}
                    <td className="py-3 pr-5 text-right text-[var(--team-color)] uppercase text-xs hidden sm:table-cell">
                      {driver.team}
                    </td>

                    {/* Total points */}
                    <td className="py-3 text-right pr-3 font-sans font-extrabold text-[#F8FAFC] tracking-wide text-sm sm:text-base">
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
              className="px-4 py-2 bg-[#101010] border border-white/4 rounded-lg text-[#9CA3AF] font-sans text-xs font-bold uppercase tracking-wider hover:border-[#D1D5DB]/30 hover:text-white active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
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
              className="px-4 py-2 bg-[#101010] border border-white/4 rounded-lg text-[#9CA3AF] font-sans text-xs font-bold uppercase tracking-wider hover:border-white/20 hover:text-white active:scale-95 transition-all inline-flex items-center gap-1 cursor-pointer"
            >
              Show top 10
              <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Constructor Standings */}
      <div 
        className="lg:col-span-5 p-6 rounded-2xl bg-[#151515] border border-white/8 shadow-xl relative overflow-hidden"
        id="constructor-standings-card"
      >
        <div className="absolute top-0 inset-x-0 h-[3px] bg-[#E5E7EB]" />

        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#E5E7EB]/10 rounded-md border border-[#E5E7EB]/25">
              <Users className="w-4 h-4 text-[#E5E7EB]" />
            </div>
            <h3 className="font-sans font-bold text-base uppercase text-white tracking-wider">
              Team Standings
            </h3>
          </div>
          <span className="font-sans text-[9px] text-[#E5E7EB] bg-[#E5E7EB]/10 px-2.5 py-0.5 rounded border border-[#E5E7EB]/25 tracking-wider uppercase font-bold">
            Season Points
          </span>
        </div>

        <div className="overflow-x-auto select-none" id="constructor-standings-table">
          <table className="w-full table-fixed text-left border-collapse font-sans text-xs sm:text-sm">
            <colgroup>
              <col className="w-20" />
              <col />
              <col className="w-24 sm:w-28" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/4 font-sans text-[10px] text-[#9CA3AF] uppercase tracking-wider">
                <th className="pb-3 text-center">Pos</th>
                <th className="pb-3 pl-3">Team Name</th>
                <th className="pb-3 text-right pr-3">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {sortedConstructors.map((team) => {
                const teamStyle = { "--team-color": getTeamColor(team.name) } as React.CSSProperties;
                return (
                  <tr
                    key={team.id}
                    className="telemetry-row team-standings-row transition-colors"
                    style={teamStyle}
                  >
                    {/* Position */}
                    <td className="py-3 text-center">
                      <span className="team-position-badge inline-flex items-center justify-center min-w-7 h-6 px-1 rounded font-sans text-xs font-black">
                        P{team.position}
                      </span>
                    </td>

                    {/* Constructor Label */}
                    <td className="py-3 pl-3 font-sans font-bold text-[var(--team-color)] uppercase tracking-wide">
                      {team.name}
                    </td>

                    {/* Points */}
                    <td className="py-3 text-right pr-3 font-sans font-extrabold text-[var(--team-color)] tracking-wide text-sm sm:text-base">
                      {team.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getTeamColor(team: string): string {
  const normalized = team.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("mercedes")) return "var(--mercedes)";
  if (normalized.includes("ferrari")) return "var(--ferrari)";
  if (normalized.includes("mclaren")) return "var(--mclaren)";
  if (normalized.includes("redbull")) return "var(--redbull)";
  if (normalized.includes("williams")) return "var(--williams)";
  if (normalized.includes("haas")) return "var(--haas)";
  if (normalized.includes("alpine")) return "var(--alpine)";
  if (normalized.includes("audi") || normalized.includes("sauber")) return "var(--audi)";
  if (normalized.includes("racingbulls") || normalized === "rbfteam" || normalized.includes("visarb")) return "var(--racingbulls)";
  if (normalized.includes("aston")) return "var(--aston)";
  if (normalized.includes("cadillac")) return "var(--cadillac)";
  return "var(--racing)";
}
