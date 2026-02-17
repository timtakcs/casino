import type { GameData, ProcessedData, PlayerStatistics } from './types.js';

// This data is kept temporarily for the migration script
// After running `npm run migrate`, this array can be safely removed
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
  },
  {
    date: "2026-01-28",
    differences: { "timur": 0, "omar": -5, "carson": 13.45, "arv": -8.45, "vin": 0, "connor": 0, "jesus": 0 }
  },
  {
    date: "2026-01-31",
    differences: { "timur": 0, "omar": 13.1, "carson": 11.9, "arv": -15, "vin": 0, "connor": -10, "jesus": 0 }
  },
  {
    date: "2026-02-2",
    differences: { "timur": 0.4, "omar": -6.25, "carson": -0.85, "arv": 6.70, "vin": 0, "connor": 0, "jesus": 0 }
  },
  {
    date: "2026-02-05",
    differences: { "arv": -5.55, "carson": -5.20, "omar": 2.45, "connor": 7.30, "timur": 1.00, "vin": 0, "jesus": 0 }
  },
  // don't uncomment this but keep it here. this is the only place where this is stored.
  // {
  //   date: "2026-02-07",
  //   gameNumber: 1,
  //   differences: { "arhaan": 13.15, "connor": -4.20, "carson": -3.95, "arv": -5, "timur": 0, "omar": 0, "vin": 0, "jesus": 0 }
  // },
  {
    date: "2026-02-07",
    gameNumber: 2,
    differences: { "carson": -2, "arv": 4.20, "vin": -0.55, "omar": -1.65, "timur": 0, "connor": 0, "jesus": 0 }
  },
  {
    date: "2026-02-09",
    differences: { "timur": 6.45, "vin": 1.35, "arv": 6.30, "connor": -6.50, "jesus": -5.40, "carson": -3.55, "omar": 1.35 }
  },
  {
    date: "2026-02-11",
    differences: { "timur": -3.85, "vin": 0, "arv": 5.80, "connor": -0.9, "jesus": 0, "carson": -5.7, "omar": 4.65 }
  }
];

export const playerColors: Record<string, string> = {
  arv: '#4A5F8C',      // Soft navy
  timur: '#8B4A5F',    // Burgundy
  omar: '#4A7C59',     // Forest green
  vin: '#6B5B8C',      // Slate purple
  carson: '#B87757',   // Burnt orange
  connor: '#6B9A8E',   // Dusty teal
  jesus: '#A8956A',    // Dusty gold
  arhaan: '#7A8B6B'    // Sage green
};

export const playerEmojis: Record<string, string> = {
  arv: '🕺🏽',
  timur: '🐗',
  omar: '🦧',
  carson: '🐈‍⬛',
  connor: '🟦'
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

function calculatePlayerStatistics(games: GameData[]): Map<string, PlayerStatistics> {
  const playerDeltas = new Map<string, number[]>();
  const playerAllDeltas = new Map<string, number[]>(); // includes zeros, in game order

  games.forEach(game => {
    Object.entries(game.differences).forEach(([player, delta]) => {
      if (!playerAllDeltas.has(player)) {
        playerAllDeltas.set(player, []);
      }
      playerAllDeltas.get(player)!.push(delta);

      if (delta !== 0) {
        if (!playerDeltas.has(player)) {
          playerDeltas.set(player, []);
        }
        playerDeltas.get(player)!.push(delta);
      }
    });
  });

  const stats = new Map<string, PlayerStatistics>();

  playerDeltas.forEach((deltas, player) => {
    const n = deltas.length;

    if (n === 0) {
      stats.set(player, { mean: 0, standardDeviation: 0, sampleCount: 0, bestDay: 0, worstDay: 0, streak: 0, coefficientOfVariance: 0 });
      return;
    }

    const mean = deltas.reduce((sum, d) => sum + d, 0) / n;
    const squaredDiffs = deltas.map(d => Math.pow(d - mean, 2));
    const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / n;
    const standardDeviation = Math.sqrt(variance);

    const bestDay = Math.max(...deltas);
    const worstDay = Math.min(...deltas);

    // Calculate streak from most recent game backwards, ignoring 0 entries
    const allDeltas = playerAllDeltas.get(player)!;
    let streak = 0;
    let streakSign = 0;
    for (let i = allDeltas.length - 1; i >= 0; i--) {
      if (allDeltas[i] === 0) continue;
      const sign = allDeltas[i] > 0 ? 1 : -1;
      if (streakSign === 0) {
        streakSign = sign;
        streak = sign;
      } else if (sign === streakSign) {
        streak += sign;
      } else {
        break;
      }
    }

    const coefficientOfVariance = mean !== 0 ? standardDeviation / Math.abs(mean) : 0;

    stats.set(player, { mean, standardDeviation, sampleCount: n, bestDay, worstDay, streak, coefficientOfVariance });
  });

  return stats;
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
    const hasEmoji = player in playerEmojis;
    return {
      label: player,
      data: runningTotals.get(player)!,
      borderColor: playerColors[player],
      backgroundColor: playerColors[player],
      tension: 0.4,
      cubicInterpolationMode: 'monotone',
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHitRadius: 20,
      borderWidth: 2,
      hoverBorderWidth: 3,
      hidden: !hasEmoji,
      emoji: playerEmojis[player] || null
    };
  });

  const playerStats = calculatePlayerStatistics(games);

  return {
    labels,
    datasets,
    currentTotals,
    playerStats,
    minValue: Math.floor(minValue / 5) * 5 - 5,
    maxValue: Math.ceil(maxValue / 5) * 5 + 5
  };
}
