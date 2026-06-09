import React from "react";
import { Driver } from "../types";
import { Award } from "lucide-react";

interface TopTickerProps {
  standings: Driver[];
}

export default function TopTicker({ standings }: TopTickerProps) {
  const sortedStandings = [...standings].sort((a, b) => a.position - b.position);

  // Duplicate items for standard marquee
  const tickerItems = [...sortedStandings, ...sortedStandings, ...sortedStandings];

  return (
    <div 
      className="w-full bg-[#101010] border-b border-white/8 overflow-hidden relative z-30 h-10 flex items-center shadow-md justify-start"
      id="top-ticker-section"
    >
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#151515] border-r border-white/8 flex items-center gap-1.5 z-45 text-xs font-sans font-bold text-[#D1D5DB] uppercase tracking-wider">
        <Award className="w-3.5 h-3.5 text-[#F8FAFC]" />
        Standings
      </div>

      <div className="pl-40 w-full relative overflow-hidden flex items-center select-none">
        <div className="ticker-scroll-content flex items-center gap-8 whitespace-nowrap">
          {tickerItems.map((driver, index) => {
            const teamStyle = {
              "--team-color": getTeamColor(driver.team),
            } as React.CSSProperties;

            return (
            <div
              key={`${driver.id}-${index}`}
              style={teamStyle}
              className="flex items-center gap-2 font-mono text-xs uppercase"
            >
              <span className="text-[#F8FAFC] font-bold">
                P{driver.position}
              </span>
              <span className="text-[var(--team-color)] font-bold">
                {driver.name.split(" ").pop()}
              </span>
              <span className="font-sans text-[10px] text-[#9CA3AF] bg-[#080808] px-1.5 py-0.5 rounded border border-white/4">
                {driver.points} pts
              </span>
              <span className="text-white/20 font-black">•</span>
            </div>
            );
          })}
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
  if (
    normalized.includes("racingbulls") ||
    normalized === "rbfteam" ||
    normalized.includes("visarb")
  ) {
    return "var(--racingbulls)";
  }
  if (normalized.includes("aston")) return "var(--aston)";
  if (normalized.includes("cadillac")) return "var(--cadillac)";

  return "var(--racing)";
}
