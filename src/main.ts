import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip
} from 'chart.js';

import { gamesData, processGameData } from './data.js';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip
);

// Plugin to draw emojis at the end of each line
const emojiPlugin = {
  id: 'emojiLabels',
  afterDatasetsDraw(chart: Chart) {
    const ctx = chart.ctx;
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 16 : 20;

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      if (dataset.hidden || !dataset.emoji) return;

      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden) return;

      // Find the last non-null data point
      let lastIndex = -1;
      for (let i = dataset.data.length - 1; i >= 0; i--) {
        if (dataset.data[i] !== null) {
          lastIndex = i;
          break;
        }
      }

      if (lastIndex === -1) return;

      const point = meta.data[lastIndex];
      if (!point) return;

      ctx.save();
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(dataset.emoji, point.x + 8, point.y);
      ctx.restore();
    });
  }
};

// Process the game data
const processedData = processGameData(gamesData);

// Create the chart
const ctx = document.getElementById('pokerChart') as HTMLCanvasElement;

new Chart(ctx, {
  type: 'line',
  data: {
    labels: processedData.labels,
    datasets: processedData.datasets
  },
  plugins: [emojiPlugin],
  options: {
    responsive: true,
    maintainAspectRatio: false,
    backgroundColor: 'transparent',
    interaction: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    },
    layout: {
      padding: {
        right: 40
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#F5F5F5',
          font: {
            family: 'Iosevka Aile, Courier New, monospace',
            size: 14,
            weight: 300
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#2A2A2A',
        titleColor: '#F5F5F5',
        bodyColor: '#F5F5F5',
        borderColor: '#3A3A3A',
        borderWidth: 1,
        titleFont: {
          family: 'Iosevka Aile, Courier New, monospace',
          size: 13,
          weight: 300
        },
        bodyFont: {
          family: 'Iosevka Aile, Courier New, monospace',
          size: 12,
          weight: 300
        },
        filter: (tooltipItem: any) => {
          const chart = tooltipItem.chart;
          const meta = chart.getDatasetMeta(tooltipItem.datasetIndex);
          const point = meta.data[tooltipItem.dataIndex];
          if (!point) return false;
          const evt = (chart as any)._lastEvent;
          if (!evt) return false;
          const dx = point.x - evt.x;
          const dy = point.y - evt.y;
          return Math.sqrt(dx * dx + dy * dy) < 40;
        },
        callbacks: {
          title: (items: any[]) => {
            if (!items.length) return '';
            return items[0].label || '';
          },
          label: (item: any) => {
            const name = item.dataset.label || '';
            const value = item.parsed.y !== null ? item.parsed.y.toFixed(2) : '';
            return ` ${name}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#F5F5F5',
          font: {
            family: 'Iosevka Aile, Courier New, monospace',
            size: 12,
            weight: 300
          }
        }
      },
      y: {
        min: processedData.minValue,
        max: processedData.maxValue,
        grid: {
          color: '#2A2A2A'
        },
        border: {
          display: false
        },
        ticks: {
          color: '#F5F5F5',
          font: {
            family: 'Iosevka Aile, Courier New, monospace',
            size: 12,
            weight: 300
          }
        }
      }
    }
  }
});

// Populate the totals table
const tbody = document.querySelector('#totalsTable tbody') as HTMLTableSectionElement;

// Sort players by total (descending)
const sortedPlayers = Array.from(processedData.currentTotals.entries())
  .sort((a, b) => b[1] - a[1]);

function togglePlayerDetails(player: string): void {
  const detailsRow = document.querySelector(`.player-details[data-player="${player}"]`) as HTMLElement;
  const mainRow = document.querySelector(`.player-row[data-player="${player}"]`) as HTMLElement;

  const isExpanded = detailsRow.classList.contains('expanded');

  // Close any other expanded rows first
  document.querySelectorAll('.player-details.expanded').forEach(row => {
    row.classList.remove('expanded');
  });
  document.querySelectorAll('.player-row.active').forEach(row => {
    row.classList.remove('active');
  });

  // Toggle this row
  if (!isExpanded) {
    detailsRow.classList.add('expanded');
    mainRow.classList.add('active');
  }
}

// Compute std dev range across all players for color interpolation
const allStdDevs = sortedPlayers.map(([p]) => processedData.playerStats.get(p)!.standardDeviation);
const minStdDev = Math.min(...allStdDevs);
const maxStdDev = Math.max(...allStdDevs);

function stdDevColor(stdDev: number): string {
  const t = maxStdDev > minStdDev ? (stdDev - minStdDev) / (maxStdDev - minStdDev) : 0;
  // Blue (#5A7A9B) to Orange (#B8864A)
  const r = Math.round(90 + t * 94);
  const g = Math.round(122 + t * 12);
  const b = Math.round(155 - t * 81);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

sortedPlayers.forEach(([player, total]) => {
  const stats = processedData.playerStats.get(player)!;

  // Main row
  const mainRow = document.createElement('tr');
  mainRow.className = 'player-row';
  mainRow.dataset.player = player;

  const playerCell = document.createElement('td');
  playerCell.className = 'player-name';
  playerCell.textContent = player;

  const totalCell = document.createElement('td');
  totalCell.className = 'player-total';
  totalCell.textContent = total.toFixed(2);
  if (total > 0) {
    totalCell.classList.add('positive');
  } else if (total < 0) {
    totalCell.classList.add('negative');
  }

  mainRow.appendChild(playerCell);
  mainRow.appendChild(totalCell);

  // Details row
  const detailsRow = document.createElement('tr');
  detailsRow.className = 'player-details';
  detailsRow.dataset.player = player;

  const streakAbs = Math.abs(stats.streak);
  const streakColorClass = stats.streak > 0 ? 'positive' : stats.streak < 0 ? 'negative' : '';
  const sdColor = stdDevColor(stats.standardDeviation);

  const statEntries = [
    { label: 'Mean', value: stats.mean.toFixed(2), colorClass: stats.mean > 0 ? 'positive' : stats.mean < 0 ? 'negative' : '', style: '' },
    { label: 'Std Dev', value: stats.standardDeviation.toFixed(2), colorClass: '', style: `color: ${sdColor}` },
    { label: 'Best', value: stats.bestDay.toFixed(2), colorClass: 'positive', style: '' },
    { label: 'Worst', value: stats.worstDay.toFixed(2), colorClass: 'negative', style: '' },
    { label: 'Streak', value: `${streakAbs}`, colorClass: streakColorClass, style: '' },
    { label: 'Games', value: `${stats.sampleCount}`, colorClass: '', style: '' }
  ];

  const detailsLabelCell = document.createElement('td');
  detailsLabelCell.className = 'details-label-cell';
  const detailsValueCell = document.createElement('td');
  detailsValueCell.className = 'details-value-cell';

  detailsLabelCell.innerHTML = `<div class="details-content">${statEntries.map(s => `<div class="stat-row"><span class="stat-label">${s.label}</span></div>`).join('')}</div>`;
  detailsValueCell.innerHTML = `<div class="details-content">${statEntries.map(s => `<div class="stat-row"><span class="stat-value ${s.colorClass}"${s.style ? ` style="${s.style}"` : ''}>${s.value}</span></div>`).join('')}</div>`;

  detailsRow.appendChild(detailsLabelCell);
  detailsRow.appendChild(detailsValueCell);

  tbody.appendChild(mainRow);
  tbody.appendChild(detailsRow);

  // Click handler
  mainRow.addEventListener('click', () => {
    togglePlayerDetails(player);
  });
});
