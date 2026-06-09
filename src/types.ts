export interface Driver {
  id: string;
  name: string;
  number: number;
  team: string;
  photoUrl: string;
  points: number;
  wins: number;
  podiums: number;
  position: number;
  form: string[]; // e.g. ["P2", "P1", "P3", "P2", "P1"]
}

export interface DriverCareerStats {
  currentSeason: number;
  currentPosition: number | null;
  currentPoints: number;
  currentWins: number;
  currentPodiums: number;
  careerWins: number;
  careerPodiums: number;
  championships: number;
  previousSeason: number;
  previousSeasonPosition: number | null;
  source: string;
  verifiedAt: string;
}

export interface Constructor {
  id: string;
  name: string;
  points: number;
  position: number;
}

export interface Race {
  round: number;
  name: string;
  circuit: string;
  circuitId?: string;
  country: string;
  location?: string;
  date: string;
  startDate?: string;
  time: string;
  status: "completed" | "upcoming";
  totalRounds?: number;
  laps?: number;
  lapRecord?: string;
  lastWinner?: string;
  lastWinnerYear?: number;
  poleSitter?: string;
  poleYear?: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl: string;
}

export interface LapTime {
  position: number;
  driverId: string;
  driverName: string;
  driverNumber: number;
  team: string;
  lapTime: string;
  sector1: string;
  sector2: string;
  sector3: string;
  fastestLap: boolean;
  gap: string;
}

export interface AppState {
  userName: string;
  favoriteDriverId: string;
  onboarded: boolean;
}
