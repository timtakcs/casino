<script lang="ts">
	import { onMount } from 'svelte';
	import type { Chart } from 'chart.js';
	import type { ProcessedData } from '$lib/types.js';

	let {
		processedData,
		onChartReady
	}: { processedData: ProcessedData; onChartReady: (chart: Chart) => void } = $props();

	let canvas: HTMLCanvasElement;

	onMount(async () => {
		const { createPokerChart } = await import('$lib/chart.js');
		const chart = createPokerChart(canvas, processedData);
		onChartReady(chart);

		return () => {
			chart.destroy();
		};
	});
</script>

<div class="chart-section">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-section {
		flex: 2;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.chart-section canvas {
		width: 100% !important;
		height: 100% !important;
	}

	@media (max-width: 1024px) {
		.chart-section {
			height: 500px;
		}
	}
</style>
