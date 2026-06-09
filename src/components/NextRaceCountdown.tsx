import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Race } from "../types";

interface NextRaceCountdownProps {
  races: Race[];
}

const EMPTY_TIME = { days: 0, hours: 0, minutes: 0, seconds: 0, completed: false };

export default function NextRaceCountdown({ races }: NextRaceCountdownProps) {
  const nextRace = races.find((race) => race.status === "upcoming") || races[races.length - 1];
  const [timeLeft, setTimeLeft] = useState(EMPTY_TIME);

  useEffect(() => {
    if (!nextRace) return;
    const targetDate = new Date(`${nextRace.date}T${nextRace.time || "12:00:00Z"}`);

    const calculateTimeLeft = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ ...EMPTY_TIME, completed: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1_000) % 60),
        completed: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1_000);
    return () => clearInterval(interval);
  }, [nextRace]);

  if (!nextRace) {
    return (
      <div className="bg-[#151515] border border-white/8 p-8 min-h-56 flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] animate-pulse">
          Loading next Grand Prix...
        </p>
      </div>
    );
  }

  const countdownUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];
  const title = splitRaceTitle(nextRace.name);
  const totalRounds = nextRace.totalRounds || races.length || 23;

  return (
    <section className="next-race-panel relative overflow-hidden" id="race-countdown-section">
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-10 xl:gap-12">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-8 w-[3px] bg-white" />
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#F8FAFC]">
              Round {String(nextRace.round).padStart(2, "0")} / Up Next
            </span>
            <span className="font-mono text-sm font-bold uppercase text-[#9CA3AF]">
              {nextRace.country}
            </span>
          </div>

          <h3 className="next-race-title">
            <span>{title.location}</span>
            <em>{title.event}</em>
          </h3>

          <div className="mt-5 space-y-1 font-sans text-sm text-[#E5E7EB]">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0 text-[#EFFF00]" />
              <strong className="text-white">{nextRace.circuit}</strong>
              <span className="text-[#9CA3AF]">/ {nextRace.location || nextRace.country}</span>
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#9CA3AF]">
              Round {nextRace.round} of {totalRounds}
              {nextRace.laps ? ` / ${nextRace.laps} laps` : ""}
            </p>
          </div>

          <div className="next-race-facts">
            <RaceFact label="Lap Record" value={nextRace.lapRecord || "API pending"} />
            <RaceFact
              label="Last Winner"
              value={nextRace.lastWinner || "API pending"}
              suffix={nextRace.lastWinnerYear}
            />
            <RaceFact
              label="Pole"
              value={nextRace.poleSitter || "API pending"}
              suffix={nextRace.poleYear}
            />
            <RaceFact label="Dates" value={formatRaceDates(nextRace)} />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-5 font-mono text-[9px] uppercase tracking-[0.28em] text-[#9CA3AF]">
            <span className="w-2 h-2 rounded-full bg-[#EFFF00] shadow-[0_0_12px_rgba(239,255,0,0.65)] animate-pulse" />
            Lights out in
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="countdown-timer-grid">
            {countdownUnits.map((unit) => (
              <div key={unit.label} className="next-race-timer">
                <span>
                  {timeLeft.completed ? "00" : String(unit.value).padStart(2, "0")}
                </span>
                <small>{unit.label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RaceFact({ label, value, suffix }: { label: string; value: string; suffix?: number }) {
  return (
    <div className="min-w-0">
      <span>{label}</span>
      <strong title={value}>
        {value}
        {suffix ? <small> / {suffix}</small> : null}
      </strong>
    </div>
  );
}

function splitRaceTitle(name: string): { location: string; event: string } {
  const suffix = " Grand Prix";
  if (name.endsWith(suffix)) {
    return { location: name.slice(0, -suffix.length), event: "Grand Prix" };
  }
  return { location: name, event: "Grand Prix" };
}

function formatRaceDates(race: Race): string {
  const end = new Date(`${race.date}T12:00:00Z`);
  const start = race.startDate ? new Date(`${race.startDate}T12:00:00Z`) : end;
  const month = end.toLocaleDateString(undefined, { month: "short", timeZone: "UTC" });
  const endDay = end.getUTCDate();
  const startDay = start.getUTCDate();

  return startDay === endDay ? `${month} ${endDay}` : `${month} ${startDay}-${endDay}`;
}
