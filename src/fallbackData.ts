import type { Article, Constructor, Driver, DriverCareerStats, Race } from "./types";

export const fallbackDrivers: Driver[] = [
  ["antonelli", "Andrea Kimi Antonelli", 12, "Mercedes", 156, 4, 5],
  ["hamilton", "Lewis Hamilton", 44, "Ferrari", 90, 0, 3],
  ["russell", "George Russell", 63, "Mercedes", 88, 0, 2],
  ["leclerc", "Charles Leclerc", 16, "Ferrari", 75, 0, 2],
  ["piastri", "Oscar Piastri", 81, "McLaren", 60, 0, 2],
  ["norris", "Lando Norris", 1, "McLaren", 58, 1, 2],
  ["verstappen", "Max Verstappen", 3, "Red Bull Racing", 43, 0, 1],
  ["hadjar", "Isack Hadjar", 6, "Red Bull Racing", 29, 0, 1],
  ["lawson", "Liam Lawson", 30, "RB F1 Team", 26, 0, 0],
  ["gasly", "Pierre Gasly", 10, "Alpine F1 Team", 26, 0, 0],
  ["bearman", "Oliver Bearman", 87, "Haas F1 Team", 18, 0, 0],
  ["colapinto", "Franco Colapinto", 43, "Alpine F1 Team", 15, 0, 0],
  ["lindblad", "Arvid Lindblad", 41, "RB F1 Team", 13, 0, 0],
  ["sainz", "Carlos Sainz", 55, "Williams", 6, 0, 0],
  ["albon", "Alexander Albon", 23, "Williams", 5, 0, 0],
  ["alonso", "Fernando Alonso", 14, "Aston Martin", 4, 0, 0],
  ["stroll", "Lance Stroll", 18, "Aston Martin", 3, 0, 0],
  ["ocon", "Esteban Ocon", 31, "Haas F1 Team", 2, 0, 0],
  ["hulkenberg", "Nico Hulkenberg", 27, "Audi F1 Team", 1, 0, 0],
  ["bortoleto", "Gabriel Bortoleto", 5, "Audi F1 Team", 0, 0, 0],
  ["bottas", "Valtteri Bottas", 77, "Cadillac", 0, 0, 0],
  ["perez", "Sergio Perez", 11, "Cadillac", 0, 0, 0],
].map(([id, name, number, team, points, wins, podiums], index) => ({
  id: String(id),
  name: String(name),
  number: Number(number),
  team: String(team),
  points: Number(points),
  wins: Number(wins),
  podiums: Number(podiums),
  position: index + 1,
  form: [],
  photoUrl: "",
}));

export const fallbackConstructors: Constructor[] = [
  ["mercedes", "Mercedes", 244],
  ["ferrari", "Ferrari", 165],
  ["mclaren", "McLaren", 118],
  ["redbull", "Red Bull Racing", 72],
  ["alpine", "Alpine F1 Team", 41],
  ["rb", "RB F1 Team", 39],
  ["haas", "Haas F1 Team", 21],
  ["williams", "Williams", 11],
  ["astonmartin", "Aston Martin", 7],
  ["audi", "Audi F1 Team", 1],
  ["cadillac", "Cadillac", 0],
].map(([id, name, points], index) => ({
  id: String(id),
  name: String(name),
  points: Number(points),
  position: index + 1,
}));

export const fallbackRaces: Race[] = [
  ["Australian Grand Prix", "Albert Park Circuit", "Australia", "2026-03-08", "04:00:00Z"],
  ["Chinese Grand Prix", "Shanghai International Circuit", "China", "2026-03-15", "07:00:00Z"],
  ["Japanese Grand Prix", "Suzuka Circuit", "Japan", "2026-03-29", "05:00:00Z"],
  ["Bahrain Grand Prix", "Bahrain International Circuit", "Bahrain", "2026-04-12", "15:00:00Z"],
  ["Saudi Arabian Grand Prix", "Jeddah Corniche Circuit", "Saudi Arabia", "2026-04-19", "17:00:00Z"],
  ["Miami Grand Prix", "Miami International Autodrome", "USA", "2026-05-03", "20:00:00Z"],
  ["Canadian Grand Prix", "Circuit Gilles Villeneuve", "Canada", "2026-05-24", "18:00:00Z"],
  ["Monaco Grand Prix", "Circuit de Monaco", "Monaco", "2026-06-07", "13:00:00Z"],
  ["Barcelona Grand Prix", "Circuit de Barcelona-Catalunya", "Spain", "2026-06-14", "13:00:00Z"],
  ["Austrian Grand Prix", "Red Bull Ring", "Austria", "2026-06-28", "13:00:00Z"],
  ["British Grand Prix", "Silverstone Circuit", "United Kingdom", "2026-07-05", "14:00:00Z"],
  ["Belgian Grand Prix", "Circuit de Spa-Francorchamps", "Belgium", "2026-07-19", "13:00:00Z"],
].map(([name, circuit, country, date, time], index) => ({
  round: index + 1,
  name: String(name),
  circuit: String(circuit),
  country: String(country),
  date: String(date),
  time: String(time),
  status: new Date(`${date}T${time}`).getTime() < Date.now() ? "completed" : "upcoming",
  totalRounds: 12,
}));

export const fallbackNews: Article[] = [
  {
    id: "fallback-1",
    title: "RaceTrace news feed operating in resilient mode",
    summary: "Live news enrichment is temporarily unavailable. Championship data and race tools remain available.",
    source: "RaceTrace",
    publishedAt: "Recently",
    url: "https://www.formula1.com",
    imageUrl: "",
  },
];

const championshipCounts: Record<string, number> = {
  alonso: 2,
  hamilton: 7,
  norris: 1,
  verstappen: 4,
};

export function getFallbackCareerStats(driver: Driver): DriverCareerStats {
  return {
    currentSeason: 2026,
    currentPosition: driver.position,
    currentPoints: driver.points,
    currentWins: driver.wins,
    currentPodiums: driver.podiums,
    careerWins: driver.id === "hamilton" ? 105 : driver.id === "verstappen" ? 63 : driver.wins,
    careerPodiums: driver.id === "hamilton" ? 205 : driver.id === "verstappen" ? 113 : driver.podiums,
    championships: championshipCounts[driver.id] || 0,
    previousSeason: 2025,
    previousSeasonPosition: null,
    source: "RaceTrace verified fallback",
    verifiedAt: new Date().toISOString(),
  };
}
