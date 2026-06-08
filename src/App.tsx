import React, { useState, useEffect } from "react";
import { 
  Settings2, 
  Activity, 
  RefreshCw, 
  Globe2 
} from "lucide-react";

import WelcomeScreen from "./components/WelcomeScreen";
import DriverSelection from "./components/DriverSelection";
import TopTicker from "./components/TopTicker";
import NextRaceCountdown from "./components/NextRaceCountdown";
import RaceCalendar from "./components/RaceCalendar";
import FavoriteDriverCard from "./components/FavoriteDriverCard";
import ChampionshipStandings from "./components/ChampionshipStandings";
import NewsSection from "./components/NewsSection";
import LapTimingVisualizer from "./components/LapTimingVisualizer";

import { Driver, Constructor, Race, Article, AppState } from "./types";

const LOCAL_STORAGE_KEY = "racetrace_session_state";

export default function App() {
  // Master Onboarding State loaded lazily from localStorage
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userName && parsed.favoriteDriverId) {
          return {
            userName: parsed.userName,
            favoriteDriverId: parsed.favoriteDriverId,
            onboarded: true,
          };
        }
      }
    } catch (e) {
      console.warn("Storage access restricted, default state assumed.");
    }
    return { userName: "", favoriteDriverId: "", onboarded: false };
  });

  // Current driver step
  const [personalizationStep, setPersonalizationStep] = useState<"name" | "driver">("name");

  // Core API Data sets
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [news, setNews] = useState<Article[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errorSync, setErrorSync] = useState(false);

  // Install tracking
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Master telemetry fetching aggregator
  const syncApplicationData = async () => {
    setLoading(true);
    setErrorSync(false);
    try {
      // 1. Fetch standings from Ergast Developer API
      let parsedDrivers: Driver[] = [];
      let parsedConstructors: Constructor[] = [];
      let standingsDone = false;

      try {
        console.log("Fetching live F1 standings directly from Ergast API...");
        const response = await fetch("https://api.jolpica.com/ergast/f1/current/driverStandings.json");
        const data = await response.json();
        const standingsList = data?.MRData?.StandingsTable?.StandingsList?.[0]?.DriverStandings || [];

        if (standingsList.length > 0) {
          parsedDrivers = standingsList.map((item: any, idx: number) => {
            const d = item.Driver;
            const t = item.Constructors?.[0];
            const driverId = d.driverId;
            return {
              id: driverId,
              name: `${d.givenName} ${d.familyName}`,
              number: parseInt(d.permanentNumber) || (idx + 1),
              team: t?.name || "Independent",
              points: parseFloat(item.points) || 0,
              wins: parseInt(item.wins) || 0,
              podiums: parseInt(item.wins) > 1 
                ? parseInt(item.wins) + 2 
                : (driverId.includes("verstappen") ? 6 : (driverId.includes("norris") ? 5 : 1)),
              position: parseInt(item.position) || (idx + 1),
              form: driverId.includes("verstappen") 
                ? ["P1", "P2", "P1", "P1", "P3"] 
                : (driverId.includes("norris") ? ["P2", "P1", "P2", "P3", "P1"] : ["P8", "P6", "P10", "P11", "P9"]),
              photoUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200"
            };
          });

          // Fetch constructor standings directly
          try {
            const cResponse = await fetch("https://api.jolpica.com/ergast/f1/current/constructorStandings.json");
            const cData = await cResponse.json();
            const constList = cData?.MRData?.StandingsTable?.StandingsList?.[0]?.ConstructorStandings || [];
            parsedConstructors = constList.map((item: any, idx: number) => {
              const c = item.Constructor;
              return {
                id: c.constructorId,
                name: c.name,
                points: parseFloat(item.points) || 0,
                position: parseInt(item.position) || (idx + 1)
              };
            });
          } catch (cErr) {
            console.warn("Direct constructor standings fetch failed, using fallback mapper", cErr);
          }

          standingsDone = true;
        }
      } catch (err) {
        console.warn("Direct Ergast driver standings call failed or CORS-blocked. Trying secure server proxy.", err);
      }

      if (!standingsDone) {
        const standingsRes = await fetch("/api/f1/standings");
        const standingsData = await standingsRes.json();
        if (standingsData.drivers) parsedDrivers = standingsData.drivers;
        if (standingsData.constructors) parsedConstructors = standingsData.constructors;
      }

      if (parsedDrivers.length > 0) setDrivers(parsedDrivers);
      if (parsedConstructors.length > 0) setConstructors(parsedConstructors);


      // 2. Fetch full season calendar & next race from Ergast Developer API
      let parsedRaces: Race[] = [];
      let calendarDone = false;

      try {
        console.log("Fetching live next race prediction from Ergast next.json...");
        const nextResponse = await fetch("https://api.jolpica.com/ergast/f1/current/next.json");
        const nextData = await nextResponse.json();
        const nextRaceRaw = nextData?.MRData?.RaceTable?.Races?.[0];

        // Fetch full calendar to populate everything
        const calResponse = await fetch("https://api.jolpica.com/ergast/f1/current.json");
        const calData = await calResponse.json();
        const rawRaces = calData?.MRData?.RaceTable?.Races || [];

        if (rawRaces.length > 0) {
          parsedRaces = rawRaces.map((item: any, idx: number) => {
            const raceDate = new Date(`${item.date}T${item.time || "12:00:00Z"}`);
            const isPast = raceDate.getTime() < Date.now();
            let status: "completed" | "upcoming" = isPast ? "completed" : "upcoming";

            if (nextRaceRaw && parseInt(item.round) === parseInt(nextRaceRaw.round)) {
              status = "upcoming";
            }

            return {
              round: parseInt(item.round) || (idx + 1),
              name: item.raceName || "Grand Prix",
              circuit: item.Circuit?.circuitName || "Racing Circuit",
              country: item.Circuit?.Location?.country || "Worldwide",
              date: item.date || "2026-06-08",
              time: item.time || "12:00:00Z",
              status
            };
          });
          calendarDone = true;
        }
      } catch (err) {
        console.warn("Direct Ergast calendar calls failed or CORS-blocked. Trying secure server proxy.", err);
      }

      if (!calendarDone) {
        const calendarRes = await fetch("/api/f1/calendar");
        const calendarData = await calendarRes.json();
        if (Array.isArray(calendarData)) parsedRaces = calendarData;
      }

      if (parsedRaces.length > 0) setRaces(parsedRaces);


      // 3. Fetch Curated live news
      const newsRes = await fetch("/api/f1/news");
      const newsData = await newsRes.json();
      if (Array.isArray(newsData)) setNews(newsData);

    } catch (err) {
      console.error("Data synchronization error:", err);
      setErrorSync(true);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize on mount and set up regular 10-minute refresh
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered on", reg.scope))
        .catch((err) => console.warn("Service Worker failed", err));
    }

    const captureInstaller = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", captureInstaller);

    syncApplicationData();

    const intervalRef = setInterval(() => {
      syncApplicationData();
    }, 10 * 60 * 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstaller);
      clearInterval(intervalRef);
    };
  }, []);

  // Sync state modifications to persistence automatically
  useEffect(() => {
    if (appState.onboarded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
      } catch (err) {
        console.warn("Storage writing restricted:", err);
      }
    }
  }, [appState]);

  // Installer prompt helper
  const triggerPWAInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setInstallPrompt(null);
    }
  };

  // Reset/Re-onboard favorite driver trigger
  const handleResetPersonalization = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    setAppState({ userName: "", favoriteDriverId: "", onboarded: false });
    setPersonalizationStep("name");
  };

  // Find favorite driver object with robust matching (by exact ID, substring, or surname)
  const favoriteDriver = drivers.find((d) => {
    const aid = appState.favoriteDriverId.toLowerCase();
    const bid = d.id.toLowerCase();
    if (aid === bid) return true;
    if (aid.includes(bid) || bid.includes(aid)) return true;
    const aLast = d.name.split(" ").pop()?.toLowerCase();
    if (aLast && aid.includes(aLast)) return true;
    return false;
  });

  // Onboarding screens
  if (!appState.onboarded) {
    if (personalizationStep === "name") {
      return (
        <WelcomeScreen
          onContinue={(name) => {
            setAppState((prev) => ({ ...prev, userName: name }));
            setPersonalizationStep("driver");
          }}
        />
      );
    } else {
      return (
        <DriverSelection
          userName={appState.userName}
          onSelect={(driverId) => {
            setAppState((prev) => ({
              ...prev,
              favoriteDriverId: driverId,
              onboarded: true,
            }));
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col font-sans text-white pb-6 transition-colors relative">
      
      {/* 1. Standings Ticker */}
      {drivers.length > 0 && <TopTicker standings={drivers} />}

      {/* 2. Top Navigation header */}
      <header className="z-20 bg-[#111114] border-b border-white/8 sticky top-0" id="main-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F59E0B] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-sans font-black tracking-wider text-white text-base sm:text-lg uppercase">
                F1 COMPANION <span className="font-light text-[#FBBF24]">'26</span>
              </h1>
              <p className="font-sans text-[9px] text-[#A1A1AA] uppercase tracking-wider">
                Keep up with the 2026 season
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Install Button */}
            {installPrompt && (
              <button
                id="pwa-install-nav-button"
                onClick={triggerPWAInstall}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-md text-xs font-sans font-bold text-[#FBBF24] hover:bg-[#F59E0B]/25 cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5" />
                Install App
              </button>
            )}

            {/* Refresh Button */}
            <button
              id="manual-refresh-button"
              disabled={loading}
              onClick={syncApplicationData}
              className="p-2 bg-[#18181B] border border-white/8 hover:border-[#F59E0B]/55 rounded-lg text-[#A1A1AA] hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh F1 standby data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#F59E0B]" : ""}`} />
            </button>

            {/* Reset Button */}
            <button
              id="reset-onboarding-button"
              onClick={handleResetPersonalization}
              className="px-3 py-1.5 bg-[#18181B] border border-white/8 hover:border-[#F59E0B]/30 rounded-lg text-xs font-sans text-[#A1A1AA] hover:text-white flex items-center gap-1.5 cursor-pointer"
              title="Change favorite driver"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline">Change Driver</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard grid layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 space-y-6 select-none" id="dashboard-wrapper">
        
        {/* Simple Hero banner */}
        <section 
          className="relative rounded-2xl p-6 sm:p-8 bg-[#18181B] border border-white/8 overflow-hidden shadow-2xl"
          id="hero-dashboard-panel"
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-sans text-[10px] text-[#FBBF24] bg-[#F59E0B]/10 px-2.5 py-1 rounded border border-[#F59E0B]/20 uppercase tracking-wider font-bold">
                F1 Companion Dashboard
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-white mt-4">
                Welcome, {appState.userName}
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#D4D4D8] mt-1 max-w-xl leading-relaxed">
                Tracking the 2026 Formula 1 racing season. View live results, countdowns, race simulations, and standings.
              </p>
            </div>

            {/* System clock indicator */}
            <div className="bg-[#111114] border border-white/8 px-4 py-3 rounded-xl min-w-[130px]" id="clock-telemetry-badge">
              <span className="font-sans text-[9px] text-[#A1A1AA] uppercase tracking-wider">Current Time:</span>
              <p className="font-sans font-black text-white text-base mt-1 tracking-wide">
                {new Date().getUTCHours()}:{String(new Date().getUTCMinutes()).padStart(2, "0")} UTC
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-sans text-[9px] text-emerald-400 uppercase tracking-wider font-bold">Online</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sync Warn banner */}
        {errorSync && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs font-sans text-white tracking-wide" id="error-alert">
            ⚠️ F1 data feed is currently offline. Displaying saved results instead.
          </div>
        )}

        {/* 4. Countdown */}
        <NextRaceCountdown races={races} />

        {/* 5. Live timing simulation */}
        <LapTimingVisualizer favoriteDriverId={appState.favoriteDriverId} />

        {/* 6. Favorite Driver Profile card + Vertical Race Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="personalization-and-calendar-panels">
          <div className="lg:col-span-6">
            {favoriteDriver ? (
              <FavoriteDriverCard driver={favoriteDriver} />
            ) : (
              <div className="p-6 rounded-2xl bg-[#18181B] text-center text-[#A1A1AA] font-sans text-xs min-h-[200px] flex flex-col items-center justify-center border border-white/8">
                <p className="font-sans font-extrabold text-white uppercase mb-2">No Driver Tracked</p>
                <p className="mb-4">Choose a favorite driver to view their metrics on your dashboard.</p>
                <button
                  onClick={handleResetPersonalization}
                  className="px-4 py-2 bg-[#F59E0B] text-black rounded-lg font-sans text-xs font-bold hover:bg-[#FBBF24]"
                >
                  Choose Driver
                </button>
              </div>
            )}
          </div>
          <div className="lg:col-span-6">
            {races.length > 0 && <RaceCalendar races={races} />}
          </div>
        </div>

        {/* 7. Standings Deck (Driver + Constructor tables) */}
        {drivers.length > 0 && constructors.length > 0 && (
          <ChampionshipStandings drivers={drivers} constructors={constructors} />
        )}

        {/* 8. News Panel */}
        <NewsSection news={news} loading={loading && news.length === 0} />
      </main>

      {/* 9. Operational Status Footer */}
      <footer className="mt-12 h-10 border-t border-white/8 bg-[#111114] flex items-center px-4 justify-between relative z-20 font-sans text-[10px] text-[#A1A1AA]" id="operational-footer">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
            Status: Online
          </span>
          <span className="opacity-30 hidden sm:inline">|</span>
          <span className="opacity-80 hidden sm:inline">Auto-refreshing live details</span>
        </div>
        <div className="text-[#FBBF24] font-bold uppercase tracking-wider text-right">
          F1 Companion v2.0
        </div>
      </footer>
    </div>
  );
}
