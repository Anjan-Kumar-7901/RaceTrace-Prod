import React, { useLayoutEffect, useRef } from "react";
import { Race } from "../types";
import { Calendar, CheckCircle2, MapPin } from "lucide-react";

interface RaceCalendarProps {
  races: Race[];
}

export default function RaceCalendar({ races }: RaceCalendarProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const currentRaceIndex = races.findIndex((race) => race.status === "upcoming");
  const initialRaceIndex = Math.max(0, currentRaceIndex - 1);
  const initialRaceRound = races[initialRaceIndex]?.round;
  const currentRaceRound = races[currentRaceIndex]?.round;

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const initialCard = scroller?.querySelector<HTMLElement>(`#race-card-${initialRaceRound}`);
    if (!scroller || !initialCard) return;

    scroller.scrollLeft = Math.max(0, initialCard.offsetLeft - scroller.offsetLeft);
  }, [currentRaceRound, initialRaceRound]);

  return (
    <div 
      className="p-6 rounded-2xl bg-[#151515] border border-white/8 shadow-xl"
      id="race-calendar-section"
    >
      <div className="flex items-center justify-between gap-2 mb-6" id="calendar-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#D1D5DB]/10 rounded-md border border-[#D1D5DB]/20">
            <Calendar className="w-4 h-4 text-[#D1D5DB]" />
          </div>
          <h3 className="font-sans font-bold text-base text-white uppercase tracking-wider">
            2026 Race Calendar
          </h3>
        </div>
        <div className="font-sans text-[10px] text-[#9CA3AF] bg-[#101010] px-2.5 py-0.5 rounded border border-white/4">
          23 Races
        </div>
      </div>

      {/* Horizontal horizontal scroller */}
      <div 
        ref={scrollerRef}
        className="race-calendar-scroller flex gap-4 overflow-x-auto pb-4 pt-1 snap-x select-none"
        id="calendar-scroller"
      >
        {races.map((race, index) => {
          const isUpcoming = race.status === "upcoming";
          const isCurrentRace = index === currentRaceIndex;
          return (
            <div
              key={race.round}
              id={`race-card-${race.round}`}
              className={`min-w-[240px] max-w-[260px] snap-start rounded-xl p-4 transition-all duration-300 relative border flex flex-col justify-between ${
                isUpcoming
                  ? "bg-[#1B1B1B] border-[#D1D5DB]/80 shadow-md"
                  : "bg-[#101010]/50 border-white/4 opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] font-bold bg-[#080808] text-[#9CA3AF] border border-white/4 px-2 py-0.5 rounded">
                  Round {race.round}
                </span>

                {isCurrentRace ? (
                  <span className="flex items-center gap-1 font-sans text-[9px] font-bold text-[#F8FAFC] bg-[#D1D5DB]/10 border border-[#D1D5DB]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Next Race
                  </span>
                ) : !isUpcoming ? (
                  <span className="flex items-center gap-1 font-sans text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Completed
                  </span>
                ) : null}
              </div>

              <div>
                <h4 className="font-sans font-extrabold text-sm text-white uppercase tracking-wide truncate mb-1">
                  {race.name.replace(" Grand Prix", "")} GP
                </h4>
                <p className="font-sans text-[11px] text-[#9CA3AF] truncate mb-1">
                  {race.circuit}
                </p>
                <div className="flex items-center gap-1 font-sans text-[10px] text-[#9CA3AF]/85">
                  <MapPin className="w-3 h-3 text-[#D1D5DB]" />
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
                <span className="text-[#9CA3AF]">
                  {race.time ? race.time.slice(0, 5) : "12:00"} UTC
                </span>
              </div>

              {/* Status indicator bar */}
              {isCurrentRace && (
                <div className="absolute top-0 bottom-0 right-0 w-[2.5px] bg-[#D1D5DB]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
