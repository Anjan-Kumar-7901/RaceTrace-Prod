import React from "react";
import { Driver } from "../types";
import { Award, Shield, Milestone, TrendingUp, Zap } from "lucide-react";

interface FavoriteDriverCardProps {
  driver: Driver;
}

export default function FavoriteDriverCard({ driver }: FavoriteDriverCardProps) {
  const driverInitials = driver.name.split(" ").map(w => w[0]).join("").toUpperCase();

  return (
    <div 
      className="p-6 rounded-2xl bg-[#18181B] border border-white/8 shadow-2xl relative overflow-hidden"
      id="favorite-driver-profile"
    >
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#F59E0B]" />

      <div className="absolute top-4 right-4 font-sans text-[10px] text-[#FBBF24] uppercase tracking-wider font-bold">
        Active Tracker
      </div>

      <div className="flex items-center gap-2 mb-6" id="fav-driver-header">
        <div className="p-1.5 bg-[#F59E0B]/10 rounded-md border border-[#F59E0B]/20">
          <Shield className="w-4 h-4 text-[#F59E0B]" />
        </div>
        <h3 className="font-sans font-bold text-base text-white uppercase tracking-wider">
          Favorite Driver Dashboard
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        {/* Driver Card Frame */}
        <div className="md:col-span-4 flex flex-col items-center justify-center bg-[#111114] p-5 rounded-xl border border-white/4 text-center relative" id="driver-avatar">
          <div className="absolute top-2 left-3 font-sans text-[10px] text-[#A1A1AA] font-bold">
            No. {driver.number}
          </div>

          <div className="w-20 h-20 rounded-full bg-[#18181B] border-2 border-[#F59E0B] flex items-center justify-center font-sans text-3xl font-black text-white h-20 w-20 shadow-lg mb-3 relative">
            {driverInitials}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-[#111114]" />
          </div>

          <h4 className="font-sans font-black text-base text-white uppercase leading-tight">
            {driver.name}
          </h4>
          <p className="font-sans text-[10px] text-[#A1A1AA] uppercase tracking-wide mt-1">
            {driver.team}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-8 flex flex-col justify-between gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans" id="fav-driver-stats">
            {[
              { label: "Season Rank", value: `P${driver.position}`, icon: Milestone, color: "text-[#FCD34D]" },
              { label: "Total Points", value: `${driver.points} pts`, icon: TrendingUp, color: "text-[#FBBF24]" },
              { label: "Podiums", value: `${driver.podiums}`, icon: Award, color: "text-[#F59E0B]" },
              { label: "Race Wins", value: `${driver.wins}`, icon: MedalIcon, color: "text-amber-400" }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#111114] border border-white/4 rounded-xl relative"
              >
                <div className="font-sans text-[9px] uppercase tracking-wider text-[#A1A1AA] mb-1">
                  {stat.label}
                </div>
                <div className="font-sans text-base sm:text-lg font-black tracking-tight text-white">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Form Timeline */}
          <div className="bg-[#111114]/50 border border-white/4 p-4 rounded-xl" id="driver-season-form">
            <h5 className="font-sans text-[10px] uppercase text-[#A1A1AA] tracking-wider mb-3.5 flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              Recent Race Results
            </h5>

            <div className="flex items-center justify-between gap-2 max-w-md mx-auto relative pt-1 pb-1">
              <div className="absolute top-[23px] left-4 right-4 h-[1px] bg-white/4 pointer-events-none" />
              
              {driver.form.map((pos, idx) => {
                const num = parseInt(pos.replace("P", "")) || 5;
                const isWinner = num === 1;
                const isPodium = num <= 3 && num > 1;

                const label = 5 - idx === 1 ? "Latest" : `${5 - idx} runs ago`;

                return (
                  <div key={idx} className="flex flex-col items-center relative z-10">
                    <span className="font-sans text-[8px] text-[#A1A1AA] mb-1">
                      {label}
                    </span>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-sans text-xs font-black shadow-md ${
                      isWinner 
                        ? "bg-[#F59E0B] text-black"
                        : isPodium
                        ? "bg-[#FCD34D] text-black"
                        : "bg-[#18181B] border border-white/8 text-[#A1A1AA]"
                    }`}>
                      {pos}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MedalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-amber-400"
      {...props}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
