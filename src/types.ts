export interface GameData {
  date: string;
  gameNumber?: number;
  differences: Record<string, number>;
}

export interface PlayerStatistics {
  mean: number;
  standardDeviation: number;
  sampleCount: number;
}

export interface ProcessedData {
  labels: string[];
  datasets: any[];
  currentTotals: Map<string, number>;
  playerStats: Map<string, PlayerStatistics>;
  minValue: number;
  maxValue: number;
}
