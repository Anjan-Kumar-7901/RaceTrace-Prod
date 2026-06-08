import React, { useState } from "react";
import { motion } from "motion/react";
import { UserCheck, Search, Users } from "lucide-react";
import { Driver } from "../types";

interface DriverSelectionProps {
  onSelect: (driverId: string) => void;
  userName: string;
}

// 2026 Active Drivers Grid Definitions (perfectly matched with 2026 real roster)
const GRID_DRIVERS: Driver[] = [
  { id: "verstappen", name: "Max Verstappen", number: 1, team: "Red Bull Racing", points: 145, wins: 4, podiums: 6, position: 1, form: ["P1", "P2", "P1", "P1", "P3"], photoUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200" },
  { id: "norris", name: "Lando Norris", number: 4, team: "McLaren", points: 132, wins: 2, podiums: 5, position: 2, form: ["P2", "P1", "P2", "P3", "P1"], photoUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=200" },
  { id: "leclerc", name: "Charles Leclerc", number: 16, team: "Ferrari", points: 118, wins: 1, podiums: 4, position: 3, form: ["P3", "P4", "P1", "P2", "P2"], photoUrl: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=200" },
  { id: "piastri", name: "Oscar Piastri", number: 81, team: "McLaren", points: 110, wins: 1, podiums: 3, position: 4, form: ["P4", "P3", "P2", "P5", "P4"], photoUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=200" },
  { id: "hamilton", name: "Lewis Hamilton", number: 44, team: "Ferrari", points: 96, wins: 1, podiums: 2, position: 5, form: ["P5", "P5", "P3", "P1", "P6"], photoUrl: "https://images.unsplash.com/photo-1611244419377-b0a760c19719?auto=format&fit=crop&q=80&w=200" },
  { id: "russell", name: "George Russell", number: 63, team: "Mercedes", points: 88, wins: 0, podiums: 2, position: 6, form: ["P6", "P3", "P5", "P4", "P5"], photoUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200" },
  { id: "sainz", name: "Carlos Sainz", number: 55, team: "Williams", points: 64, wins: 0, podiums: 1, position: 7, form: ["P7", "P6", "P7", "P8", "P7"], photoUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200" },
  { id: "antonelli", name: "Kimi Antonelli", number: 12, team: "Mercedes", points: 52, wins: 0, podiums: 1, position: 8, form: ["P9", "P7", "P4", "P8", "P9"], photoUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=200" },
  { id: "alonso", name: "Fernando Alonso", number: 14, team: "Aston Martin", points: 48, wins: 0, podiums: 0, position: 9, form: ["P8", "P8", "P10", "P6", "P8"], photoUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=200" },
  { id: "lawson", name: "Liam Lawson", number: 30, team: "Red Bull Racing", points: 34, wins: 0, podiums: 0, position: 10, form: ["P11", "P9", "P8", "P10", "P11"], photoUrl: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80&w=200" },
  { id: "gasly", name: "Pierre Gasly", number: 10, team: "Alpine", points: 22, wins: 0, podiums: 0, position: 11, form: ["P10", "P11", "P12", "P12", "P10"], photoUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=200" },
  { id: "stroll", name: "Lance Stroll", number: 18, team: "Aston Martin", points: 18, wins: 0, podiums: 0, position: 12, form: ["P12", "P10", "P9", "P11", "P12"], photoUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=200" },
  { id: "albon", name: "Alexander Albon", number: 23, team: "Williams", points: 16, wins: 0, podiums: 0, position: 13, form: ["P13", "P14", "P11", "P13", "P14"], photoUrl: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&q=80&w=200" },
  { id: "tsunoda", name: "Yuki Tsunoda", number: 22, team: "RB F1 Team", points: 14, wins: 0, podiums: 0, position: 14, form: ["P14", "P12", "P14", "P16", "P13"], photoUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200" },
  { id: "ocon", name: "Esteban Ocon", number: 31, team: "Haas", points: 12, wins: 0, podiums: 0, position: 15, form: ["P15", "P13", "P15", "P14", "P15"], photoUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=200" },
  { id: "bearman", name: "Oliver Bearman", number: 87, team: "Haas", points: 8, wins: 0, podiums: 0, position: 16, form: ["P16", "P15", "P13", "P15", "P17"], photoUrl: "https://images.unsplash.com/photo-1494976388531-d1058094e2fd?auto=format&fit=crop&q=80&w=200" },
  { id: "hulkenberg", name: "Nico Hulkenberg", number: 27, team: "Audi F1 Team", points: 6, wins: 0, podiums: 0, position: 17, form: ["P17", "P16", "P17", "P18", "P16"], photoUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=200" },
  { id: "bortoleto", name: "Gabriel Bortoleto", number: 5, team: "Audi F1 Team", points: 4, wins: 0, podiums: 0, position: 18, form: ["P18", "P18", "P16", "P17", "P18"], photoUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=200" },
  { id: "doohan", name: "Jack Doohan", number: 15, team: "Alpine", points: 2, wins: 0, podiums: 0, position: 19, form: ["P19", "P17", "P18", "P19", "P19"], photoUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=200" },
  { id: "hadjar", name: "Isack Hadjar", number: 6, team: "RB F1 Team", points: 1, wins: 0, podiums: 0, position: 20, form: ["P20", "P19", "P20", "P20", "P20"], photoUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=200" }
];

export default function DriverSelection({ onSelect, userName }: DriverSelectionProps) {
  const [selectedId, setSelectedId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDrivers = GRID_DRIVERS.filter(
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
    <div className="relative min-h-screen bg-[#09090B] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10" id="selection-header">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#18181B] border border-white/8 rounded-full text-[#FBBF24] font-mono text-[10px] uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" />
            Set Up Your Profile
          </div>
          <h2 className="font-sans text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
            Choose Your Favorite Driver
          </h2>
          <p className="font-sans text-sm text-[#D4D4D8] max-w-lg mx-auto">
            Welcome, <span className="text-[#FBBF24] font-bold">{userName}</span>! Select a driver below to tailor the companion dashboard's highlights and simulations.
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
              className="w-full h-full bg-[#18181B] border border-white/8 rounded-lg pl-11 pr-4 text-sm font-sans text-white focus:outline-none focus:border-[#F59E0B] transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA] pointer-events-none" />
          </div>
        </div>

        {/* Driver Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12" id="driver-cards-grid">
          {filteredDrivers.map((driver) => {
            const isSelected = selectedId === driver.id;
            return (
              <div
                key={driver.id}
                id={`driver-card-${driver.id}`}
                onClick={() => setSelectedId(driver.id)}
                className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 border ${
                  isSelected
                    ? "bg-[#1F1F23] border-[#F59E0B]"
                    : "bg-[#18181B] border-white/8 hover:border-[#F59E0B]/50"
                }`}
              >
                {/* Number Badge */}
                <div className="absolute top-2 left-2 z-20 font-sans text-xs font-bold bg-[#09090B] text-white px-2 py-0.5 rounded border border-white/8 shadow">
                  #{driver.number}
                </div>

                {/* Team Badge */}
                <div className="absolute top-2 right-2 z-20 font-mono text-[9px] font-semibold bg-[#111114] px-1.5 py-0.5 rounded border border-white/8 text-[#A1A1AA]">
                  {driver.team.replace(" Racing", "").toUpperCase()}
                </div>

                {/* Initials bubble */}
                <div className="relative h-36 flex items-center justify-center bg-[#111114]">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-sans text-2xl font-black transition-all ${
                    isSelected 
                      ? "bg-[#F59E0B] text-black" 
                      : "bg-[#18181B] border border-white/8 text-[#FCD34D] group-hover:text-white group-hover:border-[#F59E0B]"
                  }`}>
                    {driver.name.split(" ").map(w => w[0]).join("")}
                  </div>
                </div>

                {/* Info block */}
                <div className="p-3 border-t border-white/8 bg-[#18181B]/80 text-center relative">
                  <h3 className="font-sans font-bold text-xs sm:text-sm text-white truncate mb-0.5">
                    {driver.name}
                  </h3>
                  <p className="font-sans text-[10px] text-[#A1A1AA] uppercase tracking-wide truncate">
                    {driver.team}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="text-center sticky bottom-6 max-w-xs mx-auto z-40 bg-[#09090B] p-3 rounded-xl border border-white/8 shadow-2xl">
          <button
            id="confirm-selection-button"
            disabled={!selectedId}
            onClick={handleSelection}
            className={`w-full font-sans uppercase tracking-wider font-bold py-3 px-6 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all ${
              selectedId
                ? "bg-[#F59E0B] text-black hover:bg-[#FBBF24]"
                : "bg-[#1F1F23]/60 text-[#A1A1AA]/50 border border-white/4 cursor-not-allowed"
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
