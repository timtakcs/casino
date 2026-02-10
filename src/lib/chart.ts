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
import type { ProcessedData } from './types.js';

Chart.register(
	LineController,
	LineElement,
	PointElement,
	LinearScale,
	CategoryScale,
	Legend,
	Tooltip
);

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

export function createPokerChart(
	canvas: HTMLCanvasElement,
	processedData: ProcessedData
): Chart {
	const chart = new Chart(canvas, {
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
			events: ['click'],
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
					enabled: false,
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
					callbacks: {
						title: (items: any[]) => {
							if (!items.length) return '';
							return items[0].label || '';
						},
						label: (item: any) => {
							const name = item.dataset.label || '';
							const value =
								item.parsed.y !== null ? item.parsed.y.toFixed(2) : '';
							return ` ${name}: ${value}`;
						}
					}
				}
			},
			scales: {
				x: {
					grid: { display: false },
					border: { display: false },
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
					grid: { color: '#2A2A2A' },
					border: { display: false },
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

	return chart;
}

export function updateChartInteractivity(chart: Chart, isInteractive: boolean): void {
	if (isInteractive) {
		chart.options.events = ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'];
		chart.options.plugins!.tooltip!.enabled = true;
		chart.options.interaction!.mode = 'index';
		chart.options.interaction!.intersect = false;
		chart.options.hover!.mode = 'index';
		chart.options.hover!.intersect = false;
	} else {
		chart.options.events = ['click'];
		chart.options.plugins!.tooltip!.enabled = false;
	}
	chart.update();
}
