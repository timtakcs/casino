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

sortedPlayers.forEach(([player, total]) => {
  const row = tbody.insertRow();
  const playerCell = row.insertCell(0);
  const totalCell = row.insertCell(1);

  playerCell.textContent = player;
  totalCell.textContent = total.toFixed(2);

  // Add CSS class for color coding
  if (total > 0) {
    totalCell.classList.add('positive');
  } else if (total < 0) {
    totalCell.classList.add('negative');
  }
});
