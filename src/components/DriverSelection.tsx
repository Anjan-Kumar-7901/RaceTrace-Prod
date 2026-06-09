import React, { useState } from "react";
import { motion } from "motion/react";
import { UserCheck, Search, Users } from "lucide-react";
import { Driver } from "../types";

interface DriverSelectionProps {
  onSelect: (driverId: string) => void;
  userName: string;
  drivers: Driver[];
}

export default function DriverSelection({ onSelect, userName, drivers }: DriverSelectionProps) {
  const [selectedId, setSelectedId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDrivers = [...drivers].sort((a, b) => a.position - b.position).filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelection = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080808] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10" id="selection-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#151515] border border-white/8 rounded-full text-[#F8FAFC] font-mono text-[10px] uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" />
            Set Up Your Profile
          </div>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
            Choose Your Favorite Driver
          </h2>
          <p className="font-sans text-sm text-[#E5E7EB] max-w-lg mx-auto">
            Welcome, <span className="text-[#F8FAFC] font-bold">{userName}</span>! Select a driver below to tailor the companion dashboard's highlights and simulations.
          </p>
        </div>

        {/* Search controls */}
        <div className="w-full max-w-md mx-auto mb-10 relative" id="selection-search">
          <div className="relative h-11">
            <input
              id="driver-search-input"
              type="text"
              placeholder="Search driver or team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full bg-[#151515] border border-white/8 rounded-lg pl-11 pr-4 text-sm font-sans text-white focus:outline-none focus:border-[#D1D5DB] transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>

        {/* Driver Grid */}
        {drivers.length === 0 && (
          <div className="mb-12 py-16 text-center border border-white/8 bg-[#151515] rounded-lg">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] animate-pulse">
              Syncing current driver roster...
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12" id="driver-cards-grid">
          {filteredDrivers.map((driver) => {
            const isSelected = selectedId === driver.id;
            const teamStyle = {
              "--team-color": getTeamColor(driver.team),
            } as React.CSSProperties;

            return (
              <div
                key={driver.id}
                id={`driver-card-${driver.id}`}
                onClick={() => setSelectedId(driver.id)}
                style={teamStyle}
                className={`team-driver-card relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 border ${
                  isSelected
                    ? "is-selected bg-[#1B1B1B]"
                    : "bg-[#151515]"
                }`}
              >
                {/* Number Badge */}
                <div className="team-driver-number absolute top-2 left-2 z-20 font-mono text-xs font-bold px-2 py-0.5 rounded border shadow">
                  #{driver.number}
                </div>

                {/* Team Badge */}
                <div className="team-driver-team absolute top-2 right-2 z-20 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded border">
                  {driver.team.replace(" Racing", "").toUpperCase()}
                </div>

                {/* Initials bubble */}
                <div className="relative h-36 flex items-center justify-center bg-[#101010]">
                  <div className="team-driver-avatar w-16 h-16 rounded-full flex items-center justify-center font-sans text-2xl font-black transition-all">
                    {driver.name.split(" ").map(w => w[0]).join("")}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-3 border-t border-white/8 bg-[#151515]/80 text-center relative">
                  <h3 className="font-sans font-bold text-xs sm:text-sm text-white truncate mb-0.5">
                    {driver.name}
                  </h3>
                  <p className="font-sans text-[10px] text-[var(--team-color)] uppercase tracking-wide truncate">
                    {driver.team}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="text-center sticky bottom-6 max-w-xs mx-auto z-40 bg-[#080808] p-3 rounded-xl border border-white/8 shadow-2xl">
          <button
            id="confirm-selection-button"
            disabled={!selectedId}
            onClick={handleSelection}
            className={`w-full font-sans uppercase tracking-wider font-bold py-3 px-6 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${
              selectedId
                ? "bg-[#D1D5DB] text-black hover:bg-[#F8FAFC]"
                : "bg-[#1B1B1B]/60 text-[#9CA3AF]/50 border border-white/4 cursor-not-allowed"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            {selectedId ? "Confirm Selection" : "Select Your Driver"}
          </button>
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
