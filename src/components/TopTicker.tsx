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
      className="w-full bg-[#111114] border-b border-white/8 overflow-hidden relative z-30 h-10 flex items-center shadow-md justify-start"
      id="top-ticker-section"
    >
      <div className="absolute left-0 top-0 bottom-0 px-3 bg-[#18181B] border-r border-white/8 flex items-center gap-1.5 z-45 text-xs font-sans font-bold text-[#F59E0B] uppercase tracking-wider">
        <Award className="w-3.5 h-3.5 text-[#FBBF24]" />
        Standings Ticker
      </div>

      <div className="pl-40 w-full relative overflow-hidden flex items-center select-none">
        <div className="ticker-scroll-content flex items-center gap-8 whitespace-nowrap">
          {tickerItems.map((driver, index) => (
            <div
              key={`${driver.id}-${index}`}
              className="flex items-center gap-2 font-mono text-xs uppercase"
            >
              <span className="text-[#FBBF24] font-bold">
                P{driver.position}
              </span>
              <span className="text-white font-medium">
                {driver.name.split(" ").pop()}
              </span>
              <span className="font-sans text-[10px] text-[#A1A1AA] bg-[#09090B] px-1.5 py-0.5 rounded border border-white/4">
                {driver.points} pts
              </span>
              <span className="text-white/20 font-black">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
