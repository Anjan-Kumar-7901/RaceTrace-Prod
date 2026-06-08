import React, { useState, useEffect } from "react";
import { LapTime } from "../types";
import { Play, Pause, Radio, RefreshCw, Cpu } from "lucide-react";

interface LapTimingVisualizerProps {
  favoriteDriverId: string;
}

export default function LapTimingVisualizer({ favoriteDriverId }: LapTimingVisualizerProps) {
  const [session, setSession] = useState("Race");
  const [isSimulating, setIsSimulating] = useState(false);
  const [timingData, setTimingData] = useState<LapTime[]>([]);
  const [loading, setLoading] = useState(false);

  const [metadata, setMetadata] = useState({
    airTemp: "19.5°C",
    trackTemp: "31.2°C",
    lapsCompleted: 34,
    totalLaps: 56,
  });

  const sessions = ["Practice", "Qualifying", "Sprint", "Race"];

  const fetchLiveTiming = async () => {
    try {
      const res = await fetch(`/api/f1/live-timing?session=${session}`);
      const payload = await res.json();
      if (payload && payload.timingTower) {
        setTimingData(payload.timingTower);
        setMetadata({
          airTemp: payload.airTemp,
          trackTemp: payload.trackTemp,
          lapsCompleted: payload.lapsCompleted,
          totalLaps: payload.totalLaps,
        });
      }
    } catch (err) {
      console.error("Telemetry simulation poll exception:", err);
    }
  };

  useEffect(() => {
    if (!isSimulating) {
      setTimingData([]);
      return;
    }

    setLoading(true);
    fetchLiveTiming().then(() => setLoading(false));

    const interval = setInterval(() => {
      fetchLiveTiming();
    }, 4005);

    return () => clearInterval(interval);
  }, [isSimulating, session]);

  return (
    <div 
      className="p-6 rounded-2xl bg-[#18181B] border border-white/8 shadow-xl relative overflow-hidden"
      id="lap-timing-visualizer-section"
    >
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#F59E0B]" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" id="timing-control-header">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#F59E0B]/10 rounded-md border border-[#F59E0B]/20 text-[#F59E0B]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-base uppercase text-white tracking-wide leading-none mb-1">
              Live Timing Monitor
            </h3>
            <p className="font-sans text-[10px] text-[#A1A1AA] uppercase tracking-wider leading-none">
              Laps, sector splits, and live pace data
            </p>
          </div>
        </div>

        {/* Live Simulation Trigger Button */}
        <div className="flex items-center gap-3">
          <button
            id="simulation-toggle-button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              isSimulating
                ? "bg-amber-400 text-black hover:bg-amber-300"
                : "bg-[#F59E0B] text-black hover:bg-[#FBBF24]"
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-black" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                Simulation mode
              </>
            )}
          </button>
        </div>
      </div>

      {/* When simulation is offline */}
      {!isSimulating ? (
        <div 
          className="py-10 px-6 border border-dashed border-white/8 rounded-xl bg-[#111114]/40 text-center text-[#A1A1AA] font-sans text-xs relative max-w-xl mx-auto"
          id="offline-timing-banner"
        >
          <Cpu className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="font-sans font-bold text-sm text-white uppercase tracking-wider mb-2">
            Live Timing is Offline
          </p>
          <p className="font-sans text-xs text-[#A1A1AA] leading-relaxed mb-6">
            Real racing data is only live on race weekends. Click 'Simulation mode' above to see how it works!
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111114] rounded-lg border border-white/4">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="font-sans text-[9px] text-[#A1A1AA] uppercase tracking-wider">
              Status: waiting for race
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-6" id="online-timing-dashboard">
          {/* Active Session telemetry metadata bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#111114] border border-white/4 font-sans text-[11px] text-[#A1A1AA] uppercase tracking-wider">
            <div className="flex flex-col gap-0.5">
              <span className="text-[#A1A1AA] text-[8px] font-bold">Session:</span>
              <div className="flex items-center gap-2">
                <select
                  id="timing-session-selector"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="bg-transparent text-[#F59E0B] font-bold pb-0.5 border-b border-[#F59E0B]/20 focus:outline-none"
                >
                  {sessions.map((s) => (
                    <option key={s} value={s} className="bg-[#111114] text-white">
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="text-[#A1A1AA] text-[8px] font-bold">Weather:</span>
              <p className="text-white font-bold mt-0.5">Air {metadata.airTemp} / Track {metadata.trackTemp}</p>
            </div>

            <div>
              <span className="text-[#A1A1AA] text-[8px] font-bold">Current Lap:</span>
              <p className="text-white font-bold mt-0.5">Lap {metadata.lapsCompleted} of {metadata.totalLaps}</p>
            </div>

            <div className="flex items-center justify-end">
              <span className="inline-flex items-center gap-1 bg-[#F59E0B]/10 text-[#F59E0B] px-2.5 py-1 rounded border border-[#F59E0B]/20 text-[9px] font-bold uppercase tracking-wider">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Updating live...
              </span>
            </div>
          </div>

          {/* Active timing tower list */}
          {loading && timingData.length === 0 ? (
            <div className="py-20 text-center font-sans text-xs text-[#A1A1AA] animate-pulse">
              Connecting timing loops...
            </div>
          ) : (
            <div className="overflow-x-auto" id="timing-tower-table-ctr">
              <table className="w-full text-left border-collapse font-sans text-xs select-none">
                <thead>
                  <tr className="border-b border-white/4 font-sans text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                    <th className="pb-3 text-center w-8">Pos</th>
                    <th className="pb-3 pl-2 w-10">No</th>
                    <th className="pb-3">Driver & Team</th>
                    <th className="pb-3 text-center w-24">Sector 1</th>
                    <th className="pb-3 text-center w-24">Sector 2</th>
                    <th className="pb-3 text-center w-24">Sector 3</th>
                    <th className="pb-3 text-right pr-3">Laptime</th>
                    <th className="pb-3 text-right">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4">
                  {timingData.map((row) => {
                    const isFavorite = row.driverId === favoriteDriverId;
                    return (
                      <tr
                        key={row.driverId}
                        className={`hover:bg-white/2 transition-colors ${
                          isFavorite ? "bg-[#F59E0B]/5 text-white" : ""
                        }`}
                      >
                        {/* Position */}
                        <td className="py-2.5 text-center font-sans font-bold">
                          {isFavorite ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#F59E0B] text-black font-extrabold text-xs">
                              {row.position}
                            </span>
                          ) : (
                            <span className="text-[#A1A1AA]">{row.position}</span>
                          )}
                        </td>

                        {/* Driver Number badge */}
                        <td className="py-2.5 pl-2">
                          <span className="font-mono text-[10px] text-[#A1A1AA]">
                            #{row.driverNumber}
                          </span>
                        </td>

                        {/* Name and Squad */}
                        <td className="py-2.5 font-sans font-medium text-white truncate max-w-[150px]">
                          <div className="flex flex-col">
                            <span className="font-bold flex items-center gap-1">
                              {row.driverName}
                              {isFavorite && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                              )}
                            </span>
                            <span className="text-[9px] text-[#A1A1AA] uppercase tracking-wider">
                              {row.team}
                            </span>
                          </div>
                        </td>

                        {/* Sectors */}
                        <td className="py-2.5 text-center font-mono text-[11px] text-[#D4D4D8]">
                          {row.sector1}
                        </td>
                        <td className="py-2.5 text-center font-mono text-[11px] text-[#FBBF24] font-semibold">
                          {row.sector2}
                        </td>
                        <td className="py-2.5 text-center font-mono text-[11px] text-[#D4D4D8]">
                          {row.sector3}
                        </td>

                        {/* LAP TIME */}
                        <td className="py-2.5 text-right pr-3 font-mono font-bold text-sm">
                          <span className={row.fastestLap ? "text-[#FCD34D] font-black" : "text-white"}>
                            {row.lapTime}
                          </span>
                        </td>

                        {/* Gap */}
                        <td className="py-2.5 text-right font-mono font-bold text-[#A1A1AA]">
                          {row.gap}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
