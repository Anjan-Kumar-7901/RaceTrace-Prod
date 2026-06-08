import React, { useState, useEffect } from "react";
import { Race } from "../types";
import { Timer, MapPin } from "lucide-react";

interface NextRaceCountdownProps {
  races: Race[];
}

export default function NextRaceCountdown({ races }: NextRaceCountdownProps) {
  // Find the next upcoming race (first one with status === 'upcoming')
  const nextRace = races.find(r => r.status === "upcoming") || races[races.length - 1];

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    completed: false
  });

  useEffect(() => {
    if (!nextRace) return;

    const targetDate = new Date(`${nextRace.date}T${nextRace.time || "12:00:00Z"}`);

    const calculateTimeLeft = () => {
      const diff = targetDate.getTime() - Date.now();
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, completed: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, completed: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [nextRace]);

  if (!nextRace) {
    return (
      <div className="bg-[#18181B] border border-white/8 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[120px]">
        <p className="font-sans text-xs uppercase text-[#A1A1AA] text-center animate-pulse">
          Loading countdown...
        </p>
      </div>
    );
  }

  const countdownUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds }
  ];

  return (
    <div
      className="p-6 rounded-2xl bg-[#18181B] border border-white/8 relative overflow-hidden shadow-xl"
      id="race-countdown-section"
    >
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#F59E0B]" />

      <div className="absolute right-4 top-4 font-mono text-[10px] text-[#A1A1AA] hidden sm:block uppercase tracking-wider">
        Round {nextRace.round} of 23
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div id="countdown-meta">
          <div className="flex items-center gap-1.5 text-[#FBBF24] font-sans text-xs font-bold uppercase tracking-wider mb-2">
            <Timer className="w-4 h-4" />
            Next Grand Prix Countdown
          </div>
          <h3 className="font-sans text-xl sm:text-2xl font-black text-white uppercase tracking-wide mb-1">
            {nextRace.name}
          </h3>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[#D4D4D8] text-xs font-sans">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
              {nextRace.circuit}, {nextRace.country}
            </span>
            <span className="text-white/10 hidden sm:inline">•</span>
            <span>Race Date: {new Date(nextRace.date).toLocaleDateString(undefined, { dateStyle: "long" })}</span>
          </div>
        </div>

        {/* Dynamic Simplified Timer Grid */}
        <div 
          className="grid grid-cols-4 gap-3 sm:gap-4 max-w-sm w-full lg:w-auto"
          id="countdown-timer-grid"
        >
          {countdownUnits.map((unit) => (
            <div
              key={unit.label}
              className="px-2 py-3 bg-[#111114] border border-white/4 rounded-xl text-center min-w-[65px] sm:min-w-[75px] flex flex-col justify-center"
            >
              <span className="font-sans text-xl sm:text-2xl font-black text-[#FBBF24] tracking-tight leading-none mb-1">
                {timeLeft.completed ? "00" : String(unit.value).padStart(2, "0")}
              </span>
              <span className="font-sans text-[9px] uppercase tracking-wider text-[#A1A1AA] leading-none">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Simple indicator line */}
      <div className="mt-5 w-full h-[3px] bg-[#111114] rounded-sm relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-[#F59E0B] rounded" style={{ width: timeLeft.completed ? "100%" : "35%" }} />
      </div>
    </div>
  );
}
