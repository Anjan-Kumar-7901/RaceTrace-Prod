import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const JOLPICA_API_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const CURRENT_F1_SEASON = String(new Date().getFullYear());
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "100kb" }));

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        timeout: 12000,
        headers: {
          'User-Agent': 'RaceTrace/1.0',
        }
      }
    });
    console.log("Gemini client successfully initialized on server.");
  } catch (err) {
    console.error("Failed to initialize Gemini client:", err);
  }
} else {
  console.info("GEMINI_API_KEY not configured. News API will serve curated local fallback content.");
}

// Memory cache for active endpoints
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache: Record<string, CacheEntry<any>> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
}

let geminiDisabledUntil = 0;

const DRIVER_NUMBER_OVERRIDES_2026: Record<string, number> = {
  albon: 23, antonelli: 12, bearman: 87, bortoleto: 5, bottas: 77,
  colapinto: 43, gasly: 10, hadjar: 6, hamilton: 44, hulkenberg: 27,
  lawson: 30, leclerc: 16, norris: 1, ocon: 31, perez: 11,
  piastri: 81, russell: 63, sainz: 55, stroll: 18, verstappen: 3
};

const VERIFIED_ACTIVE_DRIVER_CHAMPIONSHIPS: Record<string, number> = {
  alonso: 2,
  hamilton: 7,
  max_verstappen: 4,
  norris: 1,
};

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function setApiCacheHeaders(res: express.Response, maxAge = 600): void {
  res.setHeader("Cache-Control", `public, max-age=0, s-maxage=${maxAge}, stale-while-revalidate=86400`);
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

// Realistic 2026 F1 Season Data (Fallback & Verification)
const DRIVERS_2026 = [
  { id: "verstappen", name: "Max Verstappen", number: 1, team: "Red Bull Racing", points: 145, wins: 4, podiums: 6, position: 1, form: ["P1", "P2", "P1", "P1", "P3"] },
  { id: "norris", name: "Lando Norris", number: 4, team: "McLaren", points: 132, wins: 2, podiums: 5, position: 2, form: ["P2", "P1", "P2", "P3", "P1"] },
  { id: "leclerc", name: "Charles Leclerc", number: 16, team: "Ferrari", points: 118, wins: 1, podiums: 4, position: 3, form: ["P3", "P4", "P1", "P2", "P2"] },
  { id: "piastri", name: "Oscar Piastri", number: 81, team: "McLaren", points: 110, wins: 1, podiums: 3, position: 4, form: ["P4", "P3", "P2", "P5", "P4"] },
  { id: "hamilton", name: "Lewis Hamilton", number: 44, team: "Ferrari", points: 96, wins: 1, podiums: 2, position: 5, form: ["P5", "P5", "P3", "P1", "P6"] },
  { id: "russell", name: "George Russell", number: 63, team: "Mercedes", points: 88, wins: 0, podiums: 2, position: 6, form: ["P6", "P3", "P5", "P4", "P5"] },
  { id: "sainz", name: "Carlos Sainz", number: 55, team: "Williams", points: 64, wins: 0, podiums: 1, position: 7, form: ["P7", "P6", "P7", "P8", "P7"] },
  { id: "antonelli", name: "Kimi Antonelli", number: 12, team: "Mercedes", points: 52, wins: 0, podiums: 1, position: 8, form: ["P9", "P7", "P4", "P8", "P9"] },
  { id: "alonso", name: "Fernando Alonso", number: 14, team: "Aston Martin", points: 48, wins: 0, podiums: 0, position: 9, form: ["P8", "P8", "P10", "P6", "P8"] },
  { id: "lawson", name: "Liam Lawson", number: 30, team: "Red Bull Racing", points: 34, wins: 0, podiums: 0, position: 10, form: ["P11", "P9", "P8", "P10", "P11"] },
  { id: "gasly", name: "Pierre Gasly", number: 10, team: "Alpine", points: 22, wins: 0, podiums: 0, position: 11, form: ["P10", "P11", "P12", "P12", "P10"] },
  { id: "stroll", name: "Lance Stroll", number: 18, team: "Aston Martin", points: 18, wins: 0, podiums: 0, position: 12, form: ["P12", "P10", "P9", "P11", "P12"] },
  { id: "albon", name: "Alexander Albon", number: 23, team: "Williams", points: 16, wins: 0, podiums: 0, position: 13, form: ["P13", "P14", "P11", "P13", "P14"] },
  { id: "tsunoda", name: "Yuki Tsunoda", number: 22, team: "RB F1 Team", points: 14, wins: 0, podiums: 0, position: 14, form: ["P14", "P12", "P14", "P16", "P13"] },
  { id: "ocon", name: "Esteban Ocon", number: 31, team: "Haas", points: 12, wins: 0, podiums: 0, position: 15, form: ["P15", "P13", "P15", "P14", "P15"] },
  { id: "bearman", name: "Oliver Bearman", number: 87, team: "Haas", points: 8, wins: 0, podiums: 0, position: 16, form: ["P16", "P15", "P13", "P15", "P17"] },
  { id: "hulkenberg", name: "Nico Hulkenberg", number: 27, team: "Audi F1 Team", points: 6, wins: 0, podiums: 0, position: 17, form: ["P17", "P16", "P17", "P18", "P16"] },
  { id: "bortoleto", name: "Gabriel Bortoleto", number: 5, team: "Audi F1 Team", points: 4, wins: 0, podiums: 0, position: 18, form: ["P18", "P18", "P16", "P17", "P18"] },
  { id: "doohan", name: "Jack Doohan", number: 15, team: "Alpine", points: 2, wins: 0, podiums: 0, position: 19, form: ["P19", "P17", "P18", "P19", "P19"] },
  { id: "hadjar", name: "Isack Hadjar", number: 6, team: "RB F1 Team", points: 1, wins: 0, podiums: 0, position: 20, form: ["P20", "P19", "P20", "P20", "P20"] }
];

const CONSTRUCTORS_2026 = [
  { id: "mclaren", name: "McLaren", points: 242, position: 1 },
  { id: "ferrari", name: "Ferrari", points: 214, position: 2 },
  { id: "redbull", name: "Red Bull Racing", points: 179, position: 3 },
  { id: "mercedes", name: "Mercedes", points: 140, position: 4 },
  { id: "astonmartin", name: "Aston Martin", points: 66, position: 5 },
  { id: "williams", name: "Williams", points: 80, position: 6 },
  { id: "alpine", name: "Alpine", points: 24, position: 7 },
  { id: "haas", name: "Haas", points: 20, position: 8 },
  { id: "rb", name: "RB F1 Team", points: 15, position: 9 },
  { id: "audi", name: "Audi F1 Team", points: 10, position: 10 }
];

const CALENDAR_2026 = [
  { round: 1, name: "Australian Grand Prix", circuit: "Albert Park Circuit", country: "Australia", date: "2026-03-15", time: "05:00:00Z", status: "completed" },
  { round: 2, name: "Chinese Grand Prix", circuit: "Shanghai International Circuit", country: "China", date: "2026-03-29", time: "07:00:00Z", status: "completed" },
  { round: 3, name: "Japanese Grand Prix", circuit: "Suzuka International Racing Course", country: "Japan", date: "2026-04-12", time: "05:00:00Z", status: "completed" },
  { round: 4, name: "Bahrain Grand Prix", circuit: "Bahrain International Circuit", country: "Bahrain", date: "2026-04-26", time: "15:00:00Z", status: "completed" },
  { round: 5, name: "Saudi Arabian Grand Prix", circuit: "Jeddah Corniche Circuit", country: "Saudi Arabia", date: "2026-05-10", time: "17:00:00Z", status: "completed" },
  { round: 6, name: "Miami Grand Prix", circuit: "Miami International Autodrome", country: "USA", date: "2026-05-24", time: "19:30:00Z", status: "completed" },
  { round: 7, name: "Monaco Grand Prix", circuit: "Circuit de Monaco", country: "Monaco", date: "2026-06-07", time: "13:00:00Z", status: "completed" },
  { round: 8, name: "Canadian Grand Prix", circuit: "Circuit Gilles-Villeneuve", country: "Canada", date: "2026-06-21", time: "18:00:00Z", status: "upcoming" },
  { round: 9, name: "Spanish Grand Prix", circuit: "Circuit de Barcelona-Catalunya", country: "Spain", date: "2026-07-05", time: "13:00:00Z", status: "upcoming" },
  { round: 10, name: "Austrian Grand Prix", circuit: "Red Bull Ring", country: "Austria", date: "2026-07-12", time: "13:00:00Z", status: "upcoming" },
  { round: 11, name: "British Grand Prix", circuit: "Silverstone Circuit", country: "UK", date: "2026-07-26", time: "14:00:00Z", status: "upcoming" },
  { round: 12, name: "Belgian Grand Prix", circuit: "Circuit de Spa-Francorchamps", country: "Belgium", date: "2026-08-02", time: "13:00:00Z", status: "upcoming" },
  { round: 13, name: "Hungarian Grand Prix", circuit: "Hungaroring", country: "Hungary", date: "2026-08-16", time: "13:00:00Z", status: "upcoming" },
  { round: 14, name: "Dutch Grand Prix", circuit: "Circuit Zandvoort", country: "Netherlands", date: "2026-08-30", time: "13:00:00Z", status: "upcoming" },
  { round: 15, name: "Italian Grand Prix", circuit: "Autodromo Nazionale Monza", country: "Italy", date: "2026-09-06", time: "13:00:00Z", status: "upcoming" },
  { round: 16, name: "Azerbaijan Grand Prix", circuit: "Baku City Circuit", country: "Azerbaijan", date: "2026-09-20", time: "11:00:00Z", status: "upcoming" },
  { round: 17, name: "Singapore Grand Prix", circuit: "Marina Bay Street Circuit", country: "Singapore", date: "2026-10-04", time: "12:00:00Z", status: "upcoming" },
  { round: 18, name: "United States Grand Prix", circuit: "Circuit of the Americas", country: "USA", date: "2026-10-18", time: "19:00:00Z", status: "upcoming" },
  { round: 19, name: "Mexico City Grand Prix", circuit: "Autódromo Hermanos Rodríguez", country: "Mexico", date: "2026-11-01", time: "19:00:00Z", status: "upcoming" },
  { round: 20, name: "São Paulo Grand Prix", circuit: "Autódromo José Carlos Pace", country: "Brazil", date: "2026-11-15", time: "17:00:00Z", status: "upcoming" },
  { round: 21, name: "Las Vegas Grand Prix", circuit: "Las Vegas Strip Court", country: "USA", date: "2026-11-28", time: "06:00:00Z", status: "upcoming" },
  { round: 22, name: "Qatar Grand Prix", circuit: "Lusail International Circuit", country: "Qatar", date: "2026-12-06", time: "17:00:00Z", status: "upcoming" },
  { round: 23, name: "Abu Dhabi Grand Prix", circuit: "Yas Marina Circuit", country: "UAE", date: "2026-12-13", time: "13:00:00Z", status: "upcoming" }
];

const FALLBACK_NEWS = [
  {
    id: "news-1",
    title: "Hamilton reflects on 'dream start' with Scuderia Ferrari in 2026",
    summary: "Seven-time world champion Lewis Hamilton says his early podium finishes with Ferrari are 'just the beginning' as the Italian squad tightens the battle with McLaren at the top.",
    source: "F1 Official",
    publishedAt: "2 hours ago",
    url: "https://www.formula1.com",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "news-2",
    title: "McLaren maintains aerodynamic advantage heading into Canadian GP",
    summary: "Technical director confirms minor upgrade package targeted at medium-speed stability is set to make McLaren the clear favorites on the structural kerbs of Circuit Gilles-Villeneuve.",
    source: "Motorsport Analyst",
    publishedAt: "5 hours ago",
    url: "https://www.motorsport.com",
    imageUrl: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "news-3",
    title: "Audi F1 principal praises Nico Hulkenberg's persistent work ethic",
    summary: "As Audi builds their newly minted works program, Hulkenberg secures historical constructor points, showing aggressive single-lap telemetry that positions them as mid-field title threats.",
    source: "Sky Sports F1",
    publishedAt: "1 day ago",
    url: "https://www.skysports.com/f1",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "news-4",
    title: "Verstappen targets major rebound after intense weekend battles",
    summary: "The reigning champion talks telemetry changes, race strategies, and his deep focus on turning his Red Bull into a highly competitive machine to defend against McLaren's charging duo.",
    source: "Autosport",
    publishedAt: "1 day ago",
    url: "https://www.autosport.com",
    imageUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600"
  }
];

function sanitizeNewsArticles(input: unknown): any[] {
  if (!Array.isArray(input)) return [];

  return input.flatMap((item: any, index: number) => {
    const title = String(item?.title || "").trim();
    const summary = String(item?.summary || "").trim();
    const source = String(item?.source || "RaceTrace Curated").trim();
    const publishedAt = String(item?.publishedAt || "Recently").trim();
    const rawUrl = String(item?.url || "").trim();

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      return [];
    }
    if (!["http:", "https:"].includes(url.protocol) || !title || !summary) return [];

    return [{
      id: String(item?.id || `news-${index + 1}`),
      title,
      summary,
      source,
      publishedAt,
      url: url.toString(),
      imageUrl: "",
    }];
  }).slice(0, 6);
}

// Helper to make live timing dynamic mock data
function generateLiveTiming(sessionType: string) {
  const baseTimes: Record<string, number> = {
    "verstappen": 74.230,
    "norris": 74.310,
    "leclerc": 74.380,
    "piastri": 74.450,
    "hamilton": 74.520,
    "russell": 74.610,
    "sainz": 74.720,
    "antonelli": 74.850,
    "alonso": 74.910,
    "lawson": 75.120,
    "gasly": 75.250,
    "stroll": 75.310,
    "albon": 75.450,
    "tsunoda": 75.520,
    "ocon": 75.630,
    "bearman": 75.720,
    "hulkenberg": 75.880,
    "bortoleto": 75.950,
    "doohan": 76.120,
    "hadjar": 76.450,
  };

  // Introduce small random fluctuations for timing excitement
  const timingTower = DRIVERS_2026.map(d => {
    const base = baseTimes[d.id] || 75.0;
    const luck = (Math.random() - 0.48) * 0.150; // Dynamic random interval
    const lapValue = base + luck;

    // Sector calculations
    const s1 = (lapValue * 0.28 + (Math.random() - 0.5) * 0.05).toFixed(3);
    const s2 = (lapValue * 0.42 + (Math.random() - 0.5) * 0.08).toFixed(3);
    const s3 = (lapValue * 0.30 + (Math.random() - 0.5) * 0.05).toFixed(3);

    return {
      driverId: d.id,
      driverName: d.name,
      driverNumber: getDriverNumber(d.id, d.number),
      team: d.team,
      lapValue,
      lapTime: formatLapTime(lapValue),
      sector1: s1,
      sector2: s2,
      sector3: s3,
      fastestLap: false,
    };
  });

  // Sort by lapValue to establish current layout
  timingTower.sort((a, b) => a.lapValue - b.lapValue);

  // Set top drivers gaps and fastest lap
  const leaderVal = timingTower[0].lapValue;
  timingTower[0].fastestLap = Math.random() > 0.6; // random purple indicator

  const finalTiming = timingTower.map((item, idx) => {
    const gap = idx === 0 ? "LEADER" : `+${(item.lapValue - leaderVal).toFixed(3)}s`;
    return {
      position: idx + 1,
      driverId: item.driverId,
      driverName: item.driverName,
      driverNumber: item.driverNumber,
      team: item.team,
      lapTime: item.lapTime,
      sector1: item.sector1,
      sector2: item.sector2,
      sector3: item.sector3,
      fastestLap: idx === 0 ? item.fastestLap : (idx === 3 ? Math.random() > 0.8 : false),
      gap
    };
  });

  return finalTiming;
}

function formatLapTime(secs: number): string {
  const mins = Math.floor(secs / 60);
  const remaining = (secs % 60).toFixed(3);
  const padding = parseFloat(remaining) < 10 ? "0" : "";
  return mins > 0 ? `${mins}:${padding}${remaining}` : `${remaining}`;
}

// ENDPOINTS

app.get("/api/health", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({
    status: "ok",
    service: "RaceTrace API",
    season: Number(CURRENT_F1_SEASON),
    jolpicaConfigured: true,
    geminiConfigured: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// Helper sanitizers to ensure runtime type compatibility with /src/types.ts
function getDriverNumber(driverId: string, rawNumber: unknown): number {
  if (CURRENT_F1_SEASON === "2026" && DRIVER_NUMBER_OVERRIDES_2026[driverId]) {
    return DRIVER_NUMBER_OVERRIDES_2026[driverId];
  }
  return parseInt(String(rawNumber)) || 0;
}

function sanitizeDrivers(input: any[]): any[] {
  if (!Array.isArray(input)) return [];
  return input.map((d: any, idx: number) => {
    const id = String(d.id || d.driverId || "").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "driver-" + idx;
    const name = String(d.name || d.driverName || d.familyName || "Unknown Driver");
    const number = getDriverNumber(id, d.number || d.driverNumber || d.permanentNumber) || (idx + 1);
    const team = String(d.team || d.teamName || d.constructor || d.constructorName || "Independent");
    const points = parseFloat(d.points) || 0;
    const wins = parseInt(d.wins) || 0;
    const podiums = parseInt(d.podiums) || (wins > 0 ? wins + 1 : 0);
    const position = parseInt(d.position) || (idx + 1);
    const form = Array.isArray(d.form) ? d.form.map(String) : [];
    const photoUrl = String(d.photoUrl || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=200");
    return { id, name, number, team, points, wins, podiums, position, form, photoUrl };
  });
}

function sanitizeConstructors(input: any[]): any[] {
  if (!Array.isArray(input)) return [];
  return input.map((c: any, idx: number) => {
    const id = String(c.id || c.constructorId || "").toLowerCase().replace(/[^a-z0-9_-]/g, "") || "team-" + idx;
    const name = String(c.name || c.constructorName || "Unknown Team");
    const points = parseFloat(c.points) || 0;
    const position = parseInt(c.position) || (idx + 1);
    return { id, name, points, position };
  });
}

function getApiDriverId(driverId: string): string {
  const normalized = driverId.toLowerCase().replace(/[^a-z0-9_]/g, "");
  const overrides: Record<string, string> = {
    verstappen: "max_verstappen",
  };
  return overrides[normalized] || normalized;
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJolpicaJson(url: string, attempts = 3): Promise<any> {
  const options = { headers: { "Accept": "application/json", "User-Agent": "RaceTrace/1.0" } };
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, options, 10000);
      if (!response.ok) {
        const error = new Error(`Jolpica response ${response.status}`);
        if (!isRetryableStatus(response.status)) throw error;
        lastError = error;
        if (attempt < attempts - 1) {
          const retryAfter = Number(response.headers.get("retry-after"));
          await wait(Number.isFinite(retryAfter) ? retryAfter * 1000 : 500 * (attempt + 1));
          continue;
        }
        throw error;
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await wait(350 * (attempt + 1));
    }
  }

  throw lastError;
}

async function getResponseTotal(url: string): Promise<number> {
  const payload = await fetchJolpicaJson(url);
  return parseInt(payload?.MRData?.total) || 0;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function getDriverCareerStats(driverId: string) {
  const apiDriverId = getApiDriverId(driverId);
  const currentSeason = Number(CURRENT_F1_SEASON);
  const previousSeason = Number(CURRENT_F1_SEASON) - 1;

  const [
    wins, secondPlaces, thirdPlaces,
    currentSecondPlaces, currentThirdPlaces,
    currentStandingData, previousStandingData
  ] = await mapWithConcurrency([
    () => getResponseTotal(`${JOLPICA_API_BASE_URL}/drivers/${apiDriverId}/results/1/?limit=1`),
    () => getResponseTotal(`${JOLPICA_API_BASE_URL}/drivers/${apiDriverId}/results/2/?limit=1`),
    () => getResponseTotal(`${JOLPICA_API_BASE_URL}/drivers/${apiDriverId}/results/3/?limit=1`),
    () => getResponseTotal(`${JOLPICA_API_BASE_URL}/${currentSeason}/drivers/${apiDriverId}/results/2/?limit=1`),
    () => getResponseTotal(`${JOLPICA_API_BASE_URL}/${currentSeason}/drivers/${apiDriverId}/results/3/?limit=1`),
    () => fetchJolpicaJson(`${JOLPICA_API_BASE_URL}/${currentSeason}/drivers/${apiDriverId}/driverstandings/?limit=1`),
    () => fetchJolpicaJson(`${JOLPICA_API_BASE_URL}/${previousSeason}/drivers/${apiDriverId}/driverstandings/?limit=1`),
  ], 3, (request) => request());

  const currentStanding = currentStandingData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];
  const previousStanding = previousStandingData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];
  const currentWins = Number(currentStanding?.wins) || 0;
  const championships = VERIFIED_ACTIVE_DRIVER_CHAMPIONSHIPS[apiDriverId] || 0;

  return {
    currentSeason,
    currentPosition: Number(currentStanding?.position) || null,
    currentPoints: Number(currentStanding?.points) || 0,
    currentWins,
    currentPodiums: currentWins + currentSecondPlaces + currentThirdPlaces,
    careerWins: wins,
    careerPodiums: wins + secondPlaces + thirdPlaces,
    championships,
    previousSeason,
    previousSeasonPosition: Number(previousStanding?.position) || null,
    source: "Jolpica F1 API",
    championshipsSource: "Verified active-driver championship history",
    verifiedAt: new Date().toISOString(),
  };
}

function sanitizeCalendar(input: any[]): any[] {
  if (!Array.isArray(input)) return [];
  return input.map((r: any, idx: number) => {
    const round = parseInt(r.round) || (idx + 1);
    const name = String(r.name || r.raceName || "Grand Prix");
    const circuit = String(r.circuit || r.circuitName || "Racing Circuit");
    const circuitId = r.circuitId ? String(r.circuitId) : undefined;
    const country = String(r.country || "Worldwide");
    const location = r.location ? String(r.location) : undefined;
    const date = String(r.date || new Date().toISOString().split("T")[0]);
    const startDate = r.startDate ? String(r.startDate) : undefined;
    const time = String(r.time || "12:00:00Z");
    const totalRounds = parseInt(r.totalRounds) || input.length;
    const laps = parseInt(r.laps) || undefined;
    const lapRecord = r.lapRecord ? String(r.lapRecord) : undefined;
    const lastWinner = r.lastWinner ? String(r.lastWinner) : undefined;
    const lastWinnerYear = parseInt(r.lastWinnerYear) || undefined;
    const poleSitter = r.poleSitter ? String(r.poleSitter) : undefined;
    const poleYear = parseInt(r.poleYear) || undefined;
    
    // Check if status is completed or upcoming
    let status = r.status;
    if (status !== "completed" && status !== "upcoming") {
      const raceDate = new Date(`${date}T${time}`);
      status = raceDate.getTime() < Date.now() ? "completed" : "upcoming";
    }
    return {
      round, name, circuit, circuitId, country, location, date, startDate, time, status,
      totalRounds, laps, lapRecord, lastWinner, lastWinnerYear, poleSitter, poleYear
    };
  });
}

function normalizeRaceKey(value: unknown): string {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function racesMatch(candidate: any, target: any): boolean {
  const candidateCircuitId = normalizeRaceKey(candidate.Circuit?.circuitId || candidate.circuitId);
  const targetCircuitId = normalizeRaceKey(target.circuitId);
  if (candidateCircuitId && targetCircuitId && candidateCircuitId === targetCircuitId) return true;

  const candidateCircuit = normalizeRaceKey(candidate.Circuit?.circuitName || candidate.circuit);
  const targetCircuit = normalizeRaceKey(target.circuit);
  if (candidateCircuit && targetCircuit && candidateCircuit === targetCircuit) return true;

  const candidateName = normalizeRaceKey(candidate.raceName || candidate.name);
  const targetName = normalizeRaceKey(target.name);
  if (candidateName && targetName && candidateName === targetName) return true;

  const candidateLocation = normalizeRaceKey(candidate.Circuit?.Location?.locality || candidate.location);
  const targetLocation = normalizeRaceKey(target.location);
  return Boolean(candidateLocation && targetLocation && candidateLocation === targetLocation);
}

async function enrichNextRaceFromErgast(input: any[]): Promise<any[]> {
  const races = sanitizeCalendar(input);
  const nextRace = races.find((race) => race.status === "upcoming");
  if (!nextRace) return races;

  const previousSeason = String(new Date(nextRace.date).getUTCFullYear() - 1);
  const options = { headers: { "Accept": "application/json", "User-Agent": "RaceTrace/1.0" } };

  try {
    const scheduleRes = await fetchWithTimeout(`${JOLPICA_API_BASE_URL}/${previousSeason}.json`, options, 8000);
    if (!scheduleRes.ok) throw new Error(`Previous calendar response not ok: ${scheduleRes.status}`);
    const scheduleData = await scheduleRes.json();
    const previousSchedule = scheduleData?.MRData?.RaceTable?.Races || [];
    const previousEvent = previousSchedule.find((race: any) => racesMatch(race, nextRace));
    if (!previousEvent?.round) {
      console.warn(`No ${previousSeason} event matched ${nextRace.name} at ${nextRace.circuit}`);
      return races;
    }

    const [resultsRes, qualifyingRes] = await Promise.all([
      fetchWithTimeout(`${JOLPICA_API_BASE_URL}/${previousSeason}/${previousEvent.round}/results/`, options, 8000),
      fetchWithTimeout(`${JOLPICA_API_BASE_URL}/${previousSeason}/${previousEvent.round}/qualifying/`, options, 8000),
    ]);
    if (!resultsRes.ok) throw new Error(`Previous race result response not ok: ${resultsRes.status}`);

    const resultsData = await resultsRes.json();
    const previousRace = resultsData?.MRData?.RaceTable?.Races?.[0];
    if (!previousRace) return races;

    let poleSitter: string | undefined;
    if (qualifyingRes.ok) {
      const qualifyingData = await qualifyingRes.json();
      const qualifyingRace = qualifyingData?.MRData?.RaceTable?.Races?.[0];
      const poleDriver = qualifyingRace?.QualifyingResults?.[0]?.Driver;
      if (poleDriver) poleSitter = `${poleDriver.givenName} ${poleDriver.familyName}`;
    }

    const winner = previousRace.Results?.[0];
    const fastestResult = previousRace.Results?.find((result: any) => Number(result.FastestLap?.rank) === 1);

    return races.map((race) => race.round === nextRace.round ? {
      ...race,
      circuitId: race.circuitId || previousRace.Circuit?.circuitId,
      location: race.location || previousRace.Circuit?.Location?.locality,
      laps: parseInt(winner?.laps) || race.laps,
      lapRecord: fastestResult?.FastestLap?.Time?.time || race.lapRecord,
      lastWinner: winner?.Driver ? `${winner.Driver.givenName} ${winner.Driver.familyName}` : race.lastWinner,
      lastWinnerYear: parseInt(previousSeason),
      poleSitter: poleSitter || race.poleSitter,
      poleYear: poleSitter ? parseInt(previousSeason) : race.poleYear,
    } : race);
  } catch (error: any) {
    console.warn(`Unable to enrich next race metadata from ${previousSeason}:`, error?.message || error);
    return races;
  }
}

interface DriverResultStats {
  form: string[];
  wins: number;
  podiums: number;
}

async function getDriverResultStatsFromErgast(season: string): Promise<Record<string, DriverResultStats>> {
  const resultsRes = await fetchWithTimeout(
    `${JOLPICA_API_BASE_URL}/${season}/results/?limit=2000`,
    { headers: { "Accept": "application/json", "User-Agent": "RaceTrace/1.0" } },
    8000
  );
  if (!resultsRes.ok) throw new Error(`Race results response not ok: ${resultsRes.status}`);
  const resultsData = await resultsRes.json();
  const races = resultsData?.MRData?.RaceTable?.Races;
  if (!Array.isArray(races)) return {};

  const resultStats: Record<string, DriverResultStats> = {};
  [...races].sort((a: any, b: any) => Number(a.round) - Number(b.round)).forEach((race: any) => {
    race.Results?.forEach((result: any) => {
      const driverId = result?.Driver?.driverId;
      if (!driverId) return;
      const position = parseInt(result.position);
      const positionText = String(result.positionText || result.position || "NC").toUpperCase();
      const statusLabels: Record<string, string> = { R: "DNF", D: "DSQ", E: "EX", F: "DNQ", N: "NC", W: "WD" };
      const finish = /^\d+$/.test(positionText) ? `P${positionText}` : statusLabels[positionText] || positionText;
      const stats = resultStats[driverId] || { form: [], wins: 0, podiums: 0 };
      stats.form = [...stats.form, finish].slice(-5);
      if (position === 1) stats.wins += 1;
      if (position >= 1 && position <= 3) stats.podiums += 1;
      resultStats[driverId] = stats;
    });
  });
  return resultStats;
}

// Shared Network APIs Handlers for F1 Ergast DB with Season Auto-Fallback
async function getStandingsFromErgast(season: string) {
  const options = { headers: { "Accept": "application/json", "User-Agent": "RaceTrace/1.0" } };
  const [driverRes, constructorRes, resultStats] = await Promise.all([
    fetchWithTimeout(`${JOLPICA_API_BASE_URL}/${season}/driverstandings/`, options, 8000),
    fetchWithTimeout(`${JOLPICA_API_BASE_URL}/${season}/constructorstandings/`, options, 8000),
    getDriverResultStatsFromErgast(season).catch(() => ({}))
  ]);
  if (!driverRes.ok) throw new Error(`Driver response not ok: ${driverRes.status}`);
  const optDrivers = await driverRes.json();
  if (!constructorRes.ok) throw new Error(`Constructor response not ok: ${constructorRes.status}`);
  const optConstructors = await constructorRes.json();

  const driverTable = optDrivers?.MRData?.StandingsTable;
  const constructorTable = optConstructors?.MRData?.StandingsTable;
  const standingList = (driverTable?.StandingsLists ?? driverTable?.StandingsList)?.[0]?.DriverStandings;
  const constList = (constructorTable?.StandingsLists ?? constructorTable?.StandingsList)?.[0]?.ConstructorStandings;

  if (!standingList || standingList.length === 0 || !constList || constList.length === 0) {
    throw new Error(`Empty standings lists for season ${season}`);
  }

  const rawDrivers = standingList.map((item: any) => {
    const d = item.Driver;
    const t = item.Constructors[0];
    const code = d.driverId;
    const stats = (resultStats as Record<string, any>)[code] || { form: [], wins: parseInt(item.wins) || 0, podiums: 0 };
    return {
      id: code,
      name: `${d.givenName} ${d.familyName}`,
      number: getDriverNumber(code, d.permanentNumber),
      team: t?.name || "Independent",
      points: parseFloat(item.points) || 0,
      wins: stats.wins,
      podiums: stats.podiums,
      position: parseInt(item.position) || 1,
      form: stats.form
    };
  });

  const rawConstructors = constList.map((item: any) => {
    const c = item.Constructor;
    return {
      id: c.constructorId,
      name: c.name,
      points: parseFloat(item.points) || 0,
      position: parseInt(item.position) || 1
    };
  });

  return {
    drivers: sanitizeDrivers(rawDrivers),
    constructors: sanitizeConstructors(rawConstructors)
  };
}

async function getCalendarFromErgast(season: string) {
  const calendarRes = await fetchWithTimeout(
    `${JOLPICA_API_BASE_URL}/${season}.json`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    },
    5000
  );
  if (!calendarRes.ok) throw new Error(`Calendar response not ok: ${calendarRes.status}`);
  const optCalendar = await calendarRes.json();
  const rawRaces = optCalendar?.MRData?.RaceTable?.Races;
  if (!rawRaces || rawRaces.length === 0) {
    throw new Error(`Empty calendar list for season ${season}`);
  }

  const races = rawRaces.map((item: any) => {
    const raceDate = new Date(`${item.date}T${item.time || "12:00:00Z"}`);
    const isPast = raceDate.getTime() < Date.now();
    return {
      round: parseInt(item.round) || 1,
      name: item.raceName || "Grand Prix",
      circuit: item.Circuit?.circuitName || "Racing Circuit",
      circuitId: item.Circuit?.circuitId,
      country: item.Circuit?.Location?.country || "Worldwide",
      location: item.Circuit?.Location?.locality,
      date: item.date || "2026-06-08",
      startDate: item.FirstPractice?.date,
      time: item.time || "12:00:00Z",
      status: isPast ? "completed" : "upcoming",
      totalRounds: rawRaces.length,
    };
  });

  return enrichNextRaceFromErgast(races);
}

// 1. Current Standings (Driver + Constructor)
app.get("/api/f1/standings", async (req, res) => {
  setApiCacheHeaders(res);
  const cached = getCached<{ drivers: any[]; constructors: any[] }>("standings");
  if (cached) {
    return res.json(cached);
  }

  // Standings must remain deterministic: Jolpica standings + race results only.
  try {
    console.log("Fetching live standings from network API...");
    try {
      const liveData = await getStandingsFromErgast(CURRENT_F1_SEASON);
      setCache("standings", liveData);
      return res.json(liveData);
    } catch (currentErr: any) {
      console.warn(`${CURRENT_F1_SEASON} standings unavailable (${currentErr?.message || currentErr}), checking current season alias...`);
      const backupData = await getStandingsFromErgast("current");
      setCache("standings", backupData);
      return res.json(backupData);
    }
  } catch (err: any) {
    console.warn(`Live standings database unavailable (${err?.message || err}). Utilizing curated 2026 standings.`);
    const data = {
      drivers: sanitizeDrivers(DRIVERS_2026.map((driver) => ({ ...driver, form: [] }))),
      constructors: sanitizeConstructors(CONSTRUCTORS_2026)
    };
    res.json(data);
  }
});

app.get("/api/f1/drivers/:driverId/career", async (req, res) => {
  const driverId = String(req.params.driverId || "").toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!driverId) return res.status(400).json({ error: "Driver id is required" });

  setApiCacheHeaders(res, 3600);
  const cacheKey = `career-v3-${driverId}`;
  const cached = getCached<any>(cacheKey);
  if (cached) return res.json(cached);

  try {
    const careerStats = await getDriverCareerStats(driverId);
    setCache(cacheKey, careerStats);
    return res.json(careerStats);
  } catch (error: any) {
    console.warn(`Career statistics unavailable for ${driverId}:`, error?.message || error);
    return res.status(502).json({ error: "Career statistics unavailable" });
  }
});

// 2. F1 Season Calendar
app.get("/api/f1/calendar", async (req, res) => {
  setApiCacheHeaders(res, 3600);
  const cached = getCached<any[]>("calendar");
  if (cached) {
    return res.json(cached);
  }

  try {
    console.log("Fetching race calendar from Jolpica...");
    try {
      const liveCal = await getCalendarFromErgast(CURRENT_F1_SEASON);
      setCache("calendar", liveCal);
      return res.json(liveCal);
    } catch (currentCalErr) {
      console.warn(`${CURRENT_F1_SEASON} calendar unavailable, checking current season alias...`);
      const backupCal = await getCalendarFromErgast("current");
      setCache("calendar", backupCal);
      return res.json(backupCal);
    }
  } catch (err) {
    console.warn("Jolpica calendar unavailable. Using curated season fallback.");
    const fallback = await enrichNextRaceFromErgast(CALENDAR_2026);
    setCache("calendar", fallback);
    res.json(fallback);
  }
});

// 3. F1 News (Curated Live via Gemini Search Grounding or Offline fallback)
app.get("/api/f1/news", async (req, res) => {
  setApiCacheHeaders(res);
  const cached = getCached<any[]>("news");
  if (cached) {
    return res.json(cached);
  }

  if (ai && Date.now() > geminiDisabledUntil) {
    try {
      console.log("Leveraging Gemini Search Grounding for live F1 telemetry news...");
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Produce a list of 6 real major Formula 1 news articles from the current ${CURRENT_F1_SEASON} season. Return strictly a JSON array without markdown. Each object must contain id, title, summary, source, publishedAt, and a direct https URL to the source article. Do not invent sources or URLs.`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        }
      });

      const rawText = response.text || "";
      const cleanedText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const newsArray = sanitizeNewsArticles(JSON.parse(cleanedText));
      if (newsArray.length > 0) {
        setCache("news", newsArray);
        return res.json(newsArray);
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("429") || errMsg.includes("quota")) {
        console.warn("Gemini Search Grounding rate limit (429) hit. Circuit breaker active. Offline fallback activated.");
        geminiDisabledUntil = Date.now() + 15 * 60 * 1000; // block for 15 minutes
      } else {
        console.warn("Gemini grounding news query had a minor error, falling back gracefully:", errMsg);
      }
    }
  }

  const fallbackNews = sanitizeNewsArticles(FALLBACK_NEWS);
  setCache("news", fallbackNews);
  res.json(fallbackNews);
});

// 4. Live Timing Simulation Stream
app.get("/api/f1/live-timing", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  const session = (req.query.session as string) || "Race";
  const data = generateLiveTiming(session);
  res.json({
    active: true,
    session,
    sessionTimeRemaining: "42:15",
    airTemp: "19.5°C",
    trackTemp: "31.2°C",
    lapsCompleted: 34,
    totalLaps: 56,
    timingTower: data
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API route not found" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled API error:", error);
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
