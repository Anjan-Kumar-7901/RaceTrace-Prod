import React, { useState, useEffect } from "react";
import { 
  Settings2, 
  RefreshCw, 
  Globe2,
  Moon,
  Sun
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

import { Driver, Constructor, Race, Article, AppState, DriverCareerStats } from "./types";

const LOCAL_STORAGE_KEY = "racetrace_session_state";
const THEME_STORAGE_KEY = "racetrace_theme";
const API_TIMEOUT_MS = 15_000;

async function fetchJsonWithTimeout<T>(url: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const parentSignal = options.signal;
  const abortFromParent = () => controller.abort();
  parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Expected JSON from ${url}, received ${contentType || "an unknown content type"}`);
    }
    return await response.json() as T;
  } finally {
    window.clearTimeout(timeout);
    parentSignal?.removeEventListener("abort", abortFromParent);
  }
}

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

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
  const [favoriteCareerStats, setFavoriteCareerStats] = useState<DriverCareerStats | null>(null);
  const [careerLoading, setCareerLoading] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [errorSync, setErrorSync] = useState(false);

  // Install tracking
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Master telemetry fetching aggregator
  const syncApplicationData = async () => {
    setLoading(true);
    setErrorSync(false);
    const fetchJson = async (url: string, label: string) => {
      try {
        return await fetchJsonWithTimeout<any>(url);
      } catch (error: any) {
        throw new Error(`${label} request failed: ${error?.message || error}`);
      }
    };

    // Server endpoints isolate the browser from upstream CORS and schema changes.
    const results = await Promise.allSettled([
      fetchJson("/api/f1/standings", "Standings"),
      fetchJson("/api/f1/calendar", "Calendar"),
      fetchJson("/api/f1/news", "News"),
    ]);

    const [standingsResult, calendarResult, newsResult] = results;
    if (standingsResult.status === "fulfilled") {
      if (Array.isArray(standingsResult.value.drivers)) setDrivers(standingsResult.value.drivers);
      if (Array.isArray(standingsResult.value.constructors)) setConstructors(standingsResult.value.constructors);
    }
    if (calendarResult.status === "fulfilled" && Array.isArray(calendarResult.value)) {
      setRaces(calendarResult.value);
    }
    if (newsResult.status === "fulfilled" && Array.isArray(newsResult.value)) {
      setNews(newsResult.value);
    }

    const failures = results.filter((result) => result.status === "rejected");
    failures.forEach((failure) => console.error("Data synchronization error:", failure.reason));
    setErrorSync(failures.length > 0);
    setLoading(false);
  };

  // Synchronize on mount and set up regular 10-minute refresh
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (isLocalDev) {
        navigator.serviceWorker
        .getRegistrations()
          .then((registrations) => registrations.forEach((registration) => registration.unregister()))
          .catch((err) => console.warn("Service Worker cleanup failed", err));
      } else {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered on", reg.scope))
          .catch((err) => console.warn("Service Worker failed", err));
      }
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

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
    document.documentElement.style.colorScheme = theme;
    document.body.classList.toggle("light-theme-body", theme === "light");
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "light" ? "#F4F4F5" : "#080808"
    );
  }, [theme]);

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

  // Find favorite driver object by stable id, normalized id, or surname.
  const favoriteDriver = drivers.find((d) => {
    const aid = appState.favoriteDriverId.toLowerCase();
    const bid = d.id.toLowerCase();
    if (aid === bid) return true;
    if (aid.replace(/[^a-z0-9]/g, "") === bid.replace(/[^a-z0-9]/g, "")) return true;
    const aLast = d.name.split(" ").pop()?.toLowerCase();
    if (aLast && aid.includes(aLast)) return true;
    return false;
  });

  useEffect(() => {
    if (!favoriteDriver?.id) {
      setFavoriteCareerStats(null);
      return;
    }

    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    setCareerLoading(true);
    setFavoriteCareerStats(null);

    const loadCareerStats = async (attempt = 0) => {
      try {
        const payload = await fetchJsonWithTimeout<DriverCareerStats>(`/api/f1/drivers/${encodeURIComponent(favoriteDriver.id)}/career`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (
          !Number.isFinite(payload.currentPoints) ||
          !Number.isFinite(payload.currentWins) ||
          !Number.isFinite(payload.currentPodiums) ||
          !Number.isFinite(payload.careerWins) ||
          !Number.isFinite(payload.careerPodiums) ||
          !Number.isFinite(payload.championships) ||
          payload.source !== "Jolpica F1 API"
        ) {
          throw new Error("Career statistics response is incomplete");
        }
        setFavoriteCareerStats(payload);
        setCareerLoading(false);
      } catch (error: any) {
        if (error.name === "AbortError") return;
        if (attempt < 2) {
          retryTimer = setTimeout(() => loadCareerStats(attempt + 1), 1500 * (attempt + 1));
          return;
        }
        console.error("Favorite driver career statistics error:", error);
        setCareerLoading(false);
      }
    };

    loadCareerStats();
    return () => {
      controller.abort();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [favoriteDriver?.id]);

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
          drivers={drivers}
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
    <div className={`${theme === "light" ? "light-theme" : ""} min-h-screen bg-[#080808] flex flex-col font-sans text-white pb-6 transition-colors relative`}>
      
     {/* 1. Standings Ticker */}
      {drivers.length > 0 && <TopTicker standings={drivers} />}

      {/* 2. Top Navigation header */}
      <header className="z-20 bg-[#101010] border-b border-white/8 sticky top-0" id="main-header">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-9 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/12 bg-black flex items-center justify-center shadow-[0_0_14px_rgba(239,255,0,0.12)]">
              <img src="/racetrace-icon.png" alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display font-black tracking-wider text-white text-base sm:text-lg uppercase">
                RACE TRACE <span className="font-light text-[#F8FAFC]">'26</span>
              </h1>
              <p className="font-sans text-[9px] text-[#9CA3AF] uppercase tracking-wider">
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
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D1D5DB]/10 border border-[#D1D5DB]/20 rounded-md text-xs font-sans font-bold text-[#F8FAFC] hover:bg-[#D1D5DB]/25 cursor-pointer"
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
              className="p-2 bg-[#151515] border border-white/8 hover:border-[#D1D5DB]/55 rounded-lg text-[#9CA3AF] hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh F1 standby data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#D1D5DB]" : ""}`} />
            </button>

            {/* Reset Button */}
            <button
              id="reset-onboarding-button"
              onClick={handleResetPersonalization}
              className="px-3 py-1.5 bg-[#151515] border border-white/8 hover:border-[#D1D5DB]/30 rounded-lg text-xs font-sans text-[#9CA3AF] hover:text-white flex items-center gap-1.5 cursor-pointer"
              title="Change favorite driver"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#D1D5DB]" />
              <span className="hidden sm:inline">Change Driver</span>
            </button>

            <button
              id="theme-toggle-button"
              type="button"
              onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
              className="p-2 bg-[#151515] border border-white/8 hover:border-[#D1D5DB]/55 rounded-lg text-[#9CA3AF] hover:text-white transition-all cursor-pointer"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard grid layout */}
      <main className="max-w-[1440px] w-full mx-auto px-6 lg:px-9 mt-8 flex-1 space-y-8 select-none" id="dashboard-wrapper">
        
        {/* Simple Hero banner */}
        <section 
          className="relative rounded-lg p-7 sm:p-10 bg-[#151515] border border-white/8 overflow-hidden"
          id="hero-dashboard-panel"
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <span className="font-mono text-[10px] text-[#F8FAFC] uppercase tracking-[0.24em] font-bold">
                Race Control / 2026 Season
              </span>
              <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white mt-5 uppercase leading-[0.92] tracking-[0.06em]">
                Welcome
                <span className="hero-user-name block">{appState.userName}</span>
              </h2>
              <div className="hero-underline" />
              <p className="font-sans text-sm text-[#E5E7EB] mt-6 max-w-xl leading-relaxed">
                Tracking the 2026 Formula 1 racing season. View live results, countdowns, race simulations, and standings.
              </p>
            </div>

            {/* System clock indicator */}
            <div className="bg-[#101010] border border-white/8 px-5 py-4 rounded-lg min-w-[180px]" id="clock-telemetry-badge">
              <span className="font-mono text-[9px] text-[#9CA3AF] uppercase tracking-[0.2em]">Current Time</span>
              <p className="font-mono font-black text-white text-xl mt-2 tracking-wide">
                {new Date().getUTCHours()}:{String(new Date().getUTCMinutes()).padStart(2, "0")} UTC
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-wider font-bold">System Online</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sync Warn banner */}
        {errorSync && (
          <div className="p-4 bg-gray-300/10 border border-gray-300/30 rounded-xl text-center text-xs font-sans text-white tracking-wide" id="error-alert">
            ⚠️ F1 data feed is currently offline. Displaying saved results instead.
          </div>
        )}

               {/* 4. Countdown */}
        <NextRaceCountdown races={races} />

        {/* 5. Live timing simulation */}
        <LapTimingVisualizer favoriteDriverId={appState.favoriteDriverId} />

        {/* 6. Full-width Favorite Driver Profile + Race Calendar */}
        <div className="space-y-8" id="personalization-and-calendar-panels">
          <section className="w-full">
            {favoriteDriver ? (
              <FavoriteDriverCard
                driver={favoriteDriver}
                careerStats={favoriteCareerStats}
                careerLoading={careerLoading}
              />
            ) : (
              <div className="p-6 rounded-2xl bg-[#151515] text-center text-[#9CA3AF] font-sans text-xs min-h-[200px] flex flex-col items-center justify-center border border-white/8">
                <p className="font-sans font-extrabold text-white uppercase mb-2">No Driver Tracked</p>
                <p className="mb-4">Choose a favorite driver to view their metrics on your dashboard.</p>
                <button
                  onClick={handleResetPersonalization}
                  className="px-4 py-2 bg-[#D1D5DB] text-black rounded-lg font-sans text-xs font-bold hover:bg-[#F8FAFC]"
                >
                  Choose Driver
                </button>
              </div>
            )}
          </section>
          <section className="w-full">
            {races.length > 0 && <RaceCalendar races={races} />}
          </section>
        </div>

        {/* 7. Standings Deck (Driver + Constructor tables) */}
        {drivers.length > 0 && constructors.length > 0 && (
          <ChampionshipStandings drivers={drivers} constructors={constructors} />
        )}

        {/* 8. News Panel */}
        <NewsSection news={news} loading={loading && news.length === 0} />
      </main>

      {/* 9. Operational Status Footer */}
      <footer className="mt-12 min-h-12 border-t border-white/8 bg-[#101010] flex items-center px-4 sm:px-6 py-2 justify-between gap-4 relative z-20 font-sans text-[10px] text-[#9CA3AF]" id="operational-footer">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="footer-signature">
            Made By <strong>Anjan</strong>
          </span>
          <span className="opacity-30">|</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
            Status: Online
          </span>
          <span className="opacity-30 hidden sm:inline">|</span>
          <span className="opacity-80 hidden sm:inline">Auto-refreshing live details</span>
        </div>
        <div className="text-[#F8FAFC] font-bold uppercase tracking-wider text-right">
          F1 Companion v2.0
        </div>
      </footer>
    </div>
  );
}
