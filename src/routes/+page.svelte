<script lang="ts">
	import type { Chart } from 'chart.js';
	import { slide } from 'svelte/transition';
	import { processGameData } from '$lib/data.js';
	import PokerChart from '$lib/components/PokerChart.svelte';
	import PlayerTable from '$lib/components/PlayerTable.svelte';
	import CollapsibleCard from '$lib/components/CollapsibleCard.svelte';
	import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
	import GameEntryForm from '$lib/components/GameEntryForm.svelte';

	let { data } = $props();

	const processedData = processGameData(data.games, data.playerColors);

	let chartInstance: Chart | undefined = $state();
	let isGraphInteractive = $state(true);
	let showStatExplanations = $state(false);
	let showGameForm = $state(false);
	let plusRotation = $derived(showGameForm ? 90 : 0);

	$effect(() => {
		const interactive = isGraphInteractive;
		if (chartInstance) {
			import('$lib/chart.js').then(({ updateChartInteractivity }) => {
				updateChartInteractivity(chartInstance!, interactive);
			});
		}
	});
</script>

<svelte:head>
	<title>Poker Totals</title>
</svelte:head>

<div class="container">
	<PokerChart {processedData} onChartReady={(chart) => (chartInstance = chart)} />
	<div class="table-section">
		<PlayerTable {processedData} />
		<CollapsibleCard headerText="Stat definitions" bind:isExpanded={showStatExplanations}>
			<div class="explanation-item">
				<span class="explanation-term">Mean</span>
				<span class="explanation-def">Average result per game</span>
			</div>
			<div class="explanation-item">
				<span class="explanation-term">Std Dev</span>
				<span class="explanation-def">How spread out results are from the mean</span>
			</div>
			<div class="explanation-item">
				<span class="explanation-term">CoV</span>
				<span class="explanation-def">Volatility relative to average (std dev / mean)</span>
			</div>
			<div class="explanation-item">
				<span class="explanation-term">Best / Worst</span>
				<span class="explanation-def">Largest single-game win / loss</span>
			</div>
			<div class="explanation-item">
				<span class="explanation-term">Streak</span>
				<span class="explanation-def">Consecutive wins or losses (current)</span>
			</div>
			<div class="explanation-item">
				<span class="explanation-term">Games</span>
				<span class="explanation-def">Total games played (excludes sit-outs)</span>
			</div>
		</CollapsibleCard>
		<ToggleSwitch label="Interactive graph" bind:isChecked={isGraphInteractive} />
		<div class="new-game-section">
			<button class="new-game-header" onclick={() => (showGameForm = !showGameForm)}>
				<span>New Game</span>
				<span class="plus-icon" style="transform: rotate({plusRotation}deg)">+</span>
			</button>
			{#if showGameForm}
				<div class="form-section" transition:slide={{ duration: 150 }}>
					<GameEntryForm playerNames={Object.keys(data.playerColors).sort()} />
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		gap: 30px;
		height: calc(100vh - 40px);
		max-width: 1800px;
		margin: 0 auto;
	}

	.table-section {
		flex: 1;
		max-width: 400px;
		min-width: 250px;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: hidden;
	}

	.new-game-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid #2a2a2a;
	}

	.new-game-header {
		all: unset;
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0 16px;
		font-size: 12px;
		color: #888888;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		cursor: pointer;
		font-family: inherit;
		font-weight: inherit;
		gap: 12px;
		flex-shrink: 0;
		box-sizing: border-box;
	}

	.plus-icon {
		font-size: 16px;
		transition: transform 0.2s ease;
	}

	.form-section {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		padding-bottom: 24px;
	}

	.explanation-item {
		display: flex;
		justify-content: space-between;
		padding: 4px 16px;
		font-size: 11px;
		line-height: 1.6;
	}

	.explanation-term {
		color: #888888;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		flex-shrink: 0;
	}

	.explanation-def {
		color: #666666;
		text-align: right;
	}

	@media (max-width: 1024px) {
		.container {
			flex-direction: column;
			height: auto;
		}

		.table-section {
			max-width: 100%;
		}
	}
</style>
