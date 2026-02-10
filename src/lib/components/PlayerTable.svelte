<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { ProcessedData } from '$lib/types.js';
	import { interpolateColor } from '$lib/colors.js';

	let { processedData }: { processedData: ProcessedData } = $props();

	let expandedPlayer: string | null = $state(null);

	const sortedPlayers = Array.from(processedData.currentTotals.entries()).sort(
		(a, b) => b[1] - a[1]
	);

	const allStdDevs = sortedPlayers.map(
		([p]) => processedData.playerStats.get(p)!.standardDeviation
	);
	const minStdDev = Math.min(...allStdDevs);
	const maxStdDev = Math.max(...allStdDevs);

	const allCoVs = sortedPlayers.map(
		([p]) => processedData.playerStats.get(p)!.coefficientOfVariance
	);
	const minCoV = Math.min(...allCoVs);
	const maxCoV = Math.max(...allCoVs);

	function togglePlayer(player: string) {
		expandedPlayer = expandedPlayer === player ? null : player;
	}

	function statEntries(player: string) {
		const stats = processedData.playerStats.get(player)!;
		const streakAbs = Math.abs(stats.streak);
		const streakColorClass =
			stats.streak > 0 ? 'positive' : stats.streak < 0 ? 'negative' : '';

		return [
			{
				label: 'Mean',
				value: stats.mean.toFixed(2),
				colorClass: stats.mean > 0 ? 'positive' : stats.mean < 0 ? 'negative' : '',
				style: ''
			},
			{
				label: 'Std Dev',
				value: stats.standardDeviation.toFixed(2),
				colorClass: '',
				style: `color: ${interpolateColor(stats.standardDeviation, minStdDev, maxStdDev)}`
			},
			{
				label: 'CoV',
				value: stats.coefficientOfVariance.toFixed(2),
				colorClass: '',
				style: `color: ${interpolateColor(stats.coefficientOfVariance, minCoV, maxCoV)}`
			},
			{ label: 'Best', value: stats.bestDay.toFixed(2), colorClass: 'positive', style: '' },
			{
				label: 'Worst',
				value: stats.worstDay.toFixed(2),
				colorClass: 'negative',
				style: ''
			},
			{ label: 'Streak', value: `${streakAbs}`, colorClass: streakColorClass, style: '' },
			{ label: 'Games', value: `${stats.sampleCount}`, colorClass: '', style: '' }
		];
	}
</script>

<table>
	<thead>
		<tr>
			<th>Player</th>
			<th>Total</th>
		</tr>
	</thead>
	<tbody>
		{#each sortedPlayers as [player, total]}
			<tr
				class="player-row"
				class:active={expandedPlayer === player}
				onclick={() => togglePlayer(player)}
			>
				<td class="player-name">{player}</td>
				<td
					class="player-total"
					class:positive={total > 0}
					class:negative={total < 0}
				>
					{total.toFixed(2)}
				</td>
			</tr>
			{#if expandedPlayer === player}
				<tr class="player-details">
					<td colspan="2">
						<div class="details-grid" transition:slide={{ duration: 150 }}>
							{#each statEntries(player) as stat}
								<span class="stat-label">{stat.label}</span>
								<span
									class="stat-value {stat.colorClass}"
									style={stat.style || undefined}
								>
									{stat.value}
								</span>
							{/each}
						</div>
					</td>
				</tr>
			{/if}
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		background-color: transparent;
	}

	thead {
		border-bottom: 2px solid #3a3a3a;
	}

	th {
		text-align: left;
		padding: 12px 16px;
		font-weight: 300;
		font-size: 14px;
		color: #f5f5f5;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	th:last-child {
		text-align: right;
	}

	td {
		padding: 12px 16px;
		border-bottom: 1px solid #2a2a2a;
		font-size: 16px;
	}

	.player-row {
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.player-row:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.player-row.active {
		background-color: rgba(255, 255, 255, 0.08);
	}

	.player-name {
		text-transform: capitalize;
	}

	.player-total {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.player-details td {
		padding: 0 !important;
		border-bottom: 1px solid #2a2a2a;
	}

	.details-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 8px 16px 10px;
	}

	.stat-label {
		color: #888888;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		font-size: 12px;
		padding: 5px 0;
	}

	.stat-value {
		font-variant-numeric: tabular-nums;
		font-size: 12px;
		padding: 5px 0;
		text-align: right;
	}

	.stat-value :global(.positive) {
		color: #5a8a68;
	}

	.stat-value :global(.negative) {
		color: #9a6070;
	}
</style>
