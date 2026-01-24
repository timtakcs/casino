export interface GameData {
  date: string;
  gameNumber?: number;
  differences: Record<string, number>;
}

export interface ProcessedData {
  labels: string[];
  datasets: any[];
  currentTotals: Map<string, number>;
  minValue: number;
  maxValue: number;
}
