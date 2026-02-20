export type PlayerData = { name: string; selected: boolean; difference: string };

export interface GameData {
  date: string;
  gameNumber?: number;
  differences: Record<string, number>;
}

export interface PlayerStatistics {
  mean: number;
  standardDeviation: number;
  sampleCount: number;
  bestDay: number;
  worstDay: number;
  streak: number; // positive = winning streak, negative = losing streak
  coefficientOfVariance: number;
}

export interface ProcessedData {
  labels: string[];
  datasets: any[];
  currentTotals: Map<string, number>;
  playerStats: Map<string, PlayerStatistics>;
  minValue: number;
  maxValue: number;
}
