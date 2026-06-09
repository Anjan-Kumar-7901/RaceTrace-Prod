import React from "react";
import { Driver, DriverCareerStats } from "../types";
import { Award, Crown, Flag, Milestone, Shield, TrendingUp } from "lucide-react";

interface FavoriteDriverCardProps {
  driver: Driver;
  careerStats: DriverCareerStats | null;
  careerLoading: boolean;
}

export default function FavoriteDriverCard({ driver, careerStats, careerLoading }: FavoriteDriverCardProps) {
  const driverInitials = driver.name.split(" ").map(w => w[0]).join("").toUpperCase();
  const teamColor = getTeamColor(driver.team);
  const teamStyle = { "--team-color": teamColor } as React.CSSProperties;

  return (
    <div 
      className="team-favorite-card p-6 rounded-2xl bg-[#151515] border border-white/8 shadow-2xl relative overflow-hidden"
      id="favorite-driver-profile"
      style={teamStyle}
    >
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[var(--team-color)]" />

      <div className="absolute top-4 right-4 font-sans text-[10px] text-[var(--team-color)] uppercase tracking-wider font-bold">
        Active Tracker
      </div>

      <div className="flex items-center gap-2 mb-6" id="fav-driver-header">
        <div className="p-1.5 rounded-md team-accent-tile">
          <Shield className="w-4 h-4 text-[var(--team-color)]" />
        </div>
        <h3 className="font-sans font-bold text-base text-white uppercase tracking-wider">
          Favorite Driver Dashboard
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        {/* Driver Card Frame */}
        <div className="md:col-span-4 flex flex-col items-center justify-center bg-[#101010] p-5 rounded-xl border border-white/4 text-center relative" id="driver-avatar">
          <div className="absolute top-2 left-3 font-sans text-[10px] text-[#9CA3AF] font-bold">
            No. {driver.number}
          </div>

          <div className="team-avatar-ring w-20 h-20 rounded-full bg-[#151515] border-2 flex items-center justify-center font-sans text-3xl font-black text-white h-20 w-20 shadow-lg mb-3 relative">
            {driverInitials}
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[var(--team-color)] rounded-full border border-[#101010]" />
          </div>

          <h4 className="font-sans font-black text-base text-white uppercase leading-tight">
            {driver.name}
          </h4>
          <p className="font-sans text-[10px] text-[var(--team-color)] uppercase tracking-wide mt-1">
            {driver.team}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="md:col-span-8 flex flex-col justify-center gap-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans" id="fav-driver-stats">
            {[
              {
                label: "Current Rank",
                value: currentValue(careerStats?.currentPosition, careerLoading, "P"),
                icon: Milestone,
              },
              {
                label: "Current Points",
                value: currentValue(careerStats?.currentPoints, careerLoading, "", " pts"),
                icon: TrendingUp,
              },
              { label: "Current Podiums", value: careerValue(careerStats?.currentPodiums, careerLoading), icon: Award },
              { label: "Current Race Wins", value: careerValue(careerStats?.currentWins, careerLoading), icon: Flag },
              { label: "Career Race Wins", value: careerValue(careerStats?.careerWins, careerLoading), icon: Flag },
              { label: "Career Podiums", value: careerValue(careerStats?.careerPodiums, careerLoading), icon: Award },
              { label: "Championships Won", value: careerValue(careerStats?.championships, careerLoading), icon: Crown },
              {
                label: `${careerStats?.previousSeason || new Date().getFullYear() - 1} Championship`,
                value: careerLoading ? "Syncing" : careerStats?.previousSeasonPosition ? `P${careerStats.previousSeasonPosition}` : "N/A",
                icon: MedalIcon,
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="team-stat-card p-3 bg-[#101010] border border-white/4 rounded-xl relative"
              >
                <div className="font-sans text-[9px] uppercase tracking-wider text-[#9CA3AF] mb-1">
                  {stat.label}
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className="font-sans text-base sm:text-lg font-black tracking-tight text-white">
                    {stat.value}
                  </div>
                  <stat.icon className="w-4 h-4 text-[var(--team-color)] opacity-80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function careerValue(value: number | undefined, loading: boolean): string {
  if (loading) return "Syncing";
  return value === undefined ? "Unavailable" : String(value);
}

function currentValue(
  value: number | null | undefined,
  loading: boolean,
  prefix = "",
  suffix = ""
): string {
  if (loading) return "Syncing";
  return value === undefined || value === null ? "Unavailable" : `${prefix}${value}${suffix}`;
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
  if (normalized.includes("racingbulls") || normalized === "rbfteam" || normalized.includes("visarb")) return "var(--racingbulls)";
  if (normalized.includes("aston")) return "var(--aston)";
  if (normalized.includes("cadillac")) return "var(--cadillac)";
  return "var(--racing)";
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
      className="w-4 h-4 text-gray-200"
      {...props}
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
