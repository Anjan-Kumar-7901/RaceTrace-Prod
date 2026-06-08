import React from "react";
import { Race } from "../types";
import { Calendar, CheckCircle2, MapPin } from "lucide-react";

interface RaceCalendarProps {
  races: Race[];
}

export default function RaceCalendar({ races }: RaceCalendarProps) {
  return (
    <div 
      className="p-6 rounded-2xl bg-[#18181B] border border-white/8 shadow-xl"
      id="race-calendar-section"
    >
      <div className="flex items-center justify-between gap-2 mb-6" id="calendar-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#F59E0B]/10 rounded-md border border-[#F59E0B]/20">
            <Calendar className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <h3 className="font-sans font-bold text-base text-white uppercase tracking-wider">
            2026 Race Calendar
          </h3>
        </div>
        <div className="font-sans text-[10px] text-[#A1A1AA] bg-[#111114] px-2.5 py-0.5 rounded border border-white/4">
          23 Races
        </div>
      </div>

      {/* Horizontal horizontal scroller */}
      <div 
        className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x select-none"
        style={{ scrollbarWidth: "thin" }}
        id="calendar-scroller"
      >
        {races.map((race) => {
          const isUpcoming = race.status === "upcoming";
          return (
            <div
              key={race.round}
              id={`race-card-${race.round}`}
              className={`min-w-[240px] max-w-[260px] snap-start rounded-xl p-4 transition-all duration-300 relative border flex flex-col justify-between ${
                isUpcoming
                  ? "bg-[#1F1F23] border-[#F59E0B]/80 shadow-md"
                  : "bg-[#111114]/50 border-white/4 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] font-bold bg-[#09090B] text-[#A1A1AA] border border-white/4 px-2 py-0.5 rounded">
                  Round {race.round}
                </span>

                {isUpcoming ? (
                  <span className="flex items-center gap-1 font-sans text-[9px] font-bold text-[#FBBF24] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Next Race
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-sans text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Completed
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-sm text-white uppercase tracking-wide truncate mb-1">
                  {race.name.replace(" Grand Prix", "")} GP
                </h4>
                <p className="font-sans text-[11px] text-[#A1A1AA] truncate mb-1">
                  {race.circuit}
                </p>
                <div className="flex items-center gap-1 font-sans text-[10px] text-[#A1A1AA]/85">
                  <MapPin className="w-3 h-3 text-[#F59E0B]" />
                  <span>{race.country}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/4 flex items-center justify-between text-[11px] font-sans">
                <span className="text-white font-medium">
                  {new Date(race.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[#A1A1AA]">
                  {race.time ? race.time.slice(0, 5) : "12:00"} UTC
                </span>
              </div>

              {/* Status indicator bar */}
              {isUpcoming && (
                <div className="absolute top-0 bottom-0 right-0 w-[2.5px] bg-[#F59E0B]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
