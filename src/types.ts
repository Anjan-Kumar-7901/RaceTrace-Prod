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
  country: string;
  date: string;
  time: string;
  status: "completed" | "upcoming";
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
