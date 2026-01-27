import { GameData, ProcessedData } from './types.js';

export const gamesData: GameData[] = [
  {
    date: "2026-01-13",
    differences: { "arv": -0.05, "timur": 0.05 }
  },
  {
    date: "2026-01-14",
    gameNumber: 1,
    differences: { "arv": -5, "timur": 5 }
  },
  {
    date: "2026-01-14",
    gameNumber: 2,
    differences: { "arv": -4.9, "omar": -1.8, "timur": 6.7 }
  },
  {
    date: "2026-01-15",
    differences: { "vin": -5, "timur": -2.35, "arv": 7.35 }
  },
  {
    date: "2026-01-21",
    differences: { "timur": 4.20, "omar": -10, "carson": -0.55, "arv": 6.05, "vin": 0.30 }
  },
  {
    date: "2026-01-24",
    differences: { "timur": -6.35, "omar": -5, "carson": +4.90, "arv": -2.65, "vin": 2.60, "connor": 4.76, "jesus": 3.35 }
  },
  {
    date: "2026-01-26",
    differences: { "timur": -0.4, "omar": 1.65, "carson": -5.0, "arv": 5.75, "vin": -1.90, "connor": 0, "jesus": 0 }
  }
];

export const playerColors: Record<string, string> = {
  arv: '#4A5F8C',      // Soft navy
  timur: '#8B4A5F',    // Burgundy
  omar: '#4A7C59',     // Forest green
  vin: '#6B5B8C',      // Slate purple
  carson: '#B87757',    // Burnt orange
  connor: '#B81157',
  jesus: "#5555CC"
};

export function generateGameLabels(games: GameData[]): string[] {
  return games.map(game => {
    const date = new Date(game.date);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const baseLabel = `${month} ${day}`;

    return game.gameNumber ? `${baseLabel}-${game.gameNumber}` : baseLabel;
  });
}

export function processGameData(games: GameData[]): ProcessedData {
  const gameLabels = generateGameLabels(games);
  const labels = ["", ...gameLabels];
  const numGames = games.length + 1;

  const allPlayers = new Set<string>();
  games.forEach(game => {
    Object.keys(game.differences).forEach(player => allPlayers.add(player));
  });

  const runningTotals = new Map<string, number[]>();
  allPlayers.forEach(player => {
    runningTotals.set(player, new Array(numGames).fill(null))
  })

  games.forEach((game, idx) => {
    allPlayers.forEach(player => {
      if (player in game.differences) {
        const score = game.differences[player];
        const currentIndex = idx + 1;

        if (runningTotals.get(player)![currentIndex - 1] === null) {
          runningTotals.get(player)![currentIndex - 1] = 0;
          runningTotals.get(player)![currentIndex] = score;
        } else {
          runningTotals.get(player)![currentIndex] = runningTotals.get(player)![currentIndex - 1] + score;
        }
      }
    })
  })

  const currentTotals = new Map<string, number>();
  allPlayers.forEach(player => {
    const totals = runningTotals.get(player)!;
    for (let i = totals.length - 1; i >= 0; i--) {
      if (totals[i] !== null) {
        currentTotals.set(player, totals[i]);
        break;
      }
    }
  });

  console.log(runningTotals)
  console.log("will this relfect")

  // Calculate min and max values across all data points
  let minValue = Infinity;
  let maxValue = -Infinity;

  allPlayers.forEach(player => {
    const totals = runningTotals.get(player)!;
    totals.forEach(value => {
      if (value !== null) {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      }
    });
  });

  const datasets = Array.from(allPlayers).map(player => {
    return {
      label: player,
      data: runningTotals.get(player)!,
      borderColor: playerColors[player],
      backgroundColor: playerColors[player],
      tension: 0,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 2
    };
  });

  return {
    labels,
    datasets,
    currentTotals,
    minValue: minValue - 5,
    maxValue: maxValue + 5
  };
}
