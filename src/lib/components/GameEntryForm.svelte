<script lang="ts">
	import { writeToDb } from '$lib/db/operations.js';
	import type { GameData } from '$lib/types.js';
	import { playerColors } from '$lib/data.js';

	const allPlayerNames = Object.keys(playerColors).sort();
	const ROW_HEIGHT = 45;

	// Form state
	let date = $state(new Date().toISOString().split('T')[0]);
	let password = $state('');
	let error = $state('');
	let isSubmitting = $state(false);
	let newPlayerName = $state('');

	// Player state
	type PlayerData = { name: string; selected: boolean; difference: string };
	let players = $state<PlayerData[]>(
		allPlayerNames.map((name) => ({ name, selected: false, difference: '' }))
	);

	// Animation state
	let animatingPlayer = $state<string | null>(null);
	let animPhase = $state<'fade-out' | 'moving' | 'fade-in' | null>(null);

	// Navigation
	let focusedIndex = $state(-1);
	let containerEl = $state<HTMLDivElement>();

	// Layout: compute visual order and positions
	function computeSorted(): string[] {
		const sel = players
			.filter((p) => p.selected)
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((p) => p.name);
		const unsel = players
			.filter((p) => !p.selected)
			.sort((a, b) => a.name.localeCompare(b.name))
			.map((p) => p.name);
		return [...sel, ...unsel];
	}

	let visualOrder = $state<string[]>(computeSorted());
	let positions = $state<Map<string, number>>(
		new Map(visualOrder.map((n, i) => [n, i * ROW_HEIGHT]))
	);

	function refreshLayout() {
		visualOrder = computeSorted();
		positions = new Map(visualOrder.map((n, i) => [n, i * ROW_HEIGHT]));
	}

	// Animation helpers
	function sleep(ms: number) {
		return new Promise<void>((r) => setTimeout(r, ms));
	}

	function playerOpacity(name: string): number {
		if (animatingPlayer !== name) return 1;
		if (animPhase === 'fade-out' || animPhase === 'moving') return 0;
		return 1;
	}

	async function togglePlayer(name: string) {
		if (animatingPlayer) return;
		animatingPlayer = name;

		// 1: Fade out the clicked player
		animPhase = 'fade-out';
		await sleep(1);

		// 2: Toggle + slide everything to new positions
		const p = players.find((p) => p.name === name)!;
		p.selected = !p.selected;
		if (!p.selected) p.difference = '';
		animPhase = 'moving';
		refreshLayout();
		await sleep(1);

		// 3: Fade in at new position
		animPhase = 'fade-in';
		await sleep(1);

		animatingPlayer = null;
		animPhase = null;
		focusedIndex = visualOrder.indexOf(name);

		// Auto-focus the input if newly selected
		if (p.selected) {
			await sleep(10);
			const input = containerEl?.querySelector(`[data-player="${name}"] input`) as HTMLInputElement;
			input?.focus();
		}
	}

	function addNewPlayer() {
		const trimmed = newPlayerName.trim().toLowerCase();
		if (!trimmed) return;
		if (players.find((p) => p.name === trimmed)) {
			error = 'Player already exists';
			return;
		}
		players.push({ name: trimmed, selected: false, difference: '' });
		refreshLayout();
		newPlayerName = '';
		error = '';
	}

	function handleNewPlayerKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addNewPlayer();
		}
	}

	// Keyboard navigation
	function navigateRow(delta: number) {
		const newIdx = Math.max(0, Math.min(focusedIndex + delta, players.length - 1));
		if (newIdx === focusedIndex) return;
		focusedIndex = newIdx;
		focusCurrentRow();
	}

	function focusCurrentRow() {
		const name = visualOrder[focusedIndex];
		if (!name || !containerEl) return;
		const p = players.find((p) => p.name === name);
		if (p?.selected) {
			const input = containerEl.querySelector(`[data-player="${name}"] input`) as HTMLInputElement;
			input?.focus();
		} else {
			const btn = containerEl.querySelector(`[data-player="${name}"]`) as HTMLElement;
			btn?.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			navigateRow(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			navigateRow(-1);
		} else if (e.key === 'Enter' || e.key === ' ') {
			const isInput = e.target instanceof HTMLInputElement;
			if (!isInput && focusedIndex >= 0 && focusedIndex < visualOrder.length) {
				e.preventDefault();
				togglePlayer(visualOrder[focusedIndex]);
			}
		}
	}

	function handleRowFocus(name: string) {
		focusedIndex = visualOrder.indexOf(name);
	}

	function updateDifference(name: string, value: string) {
		const player = players.find((p) => p.name === name);
		if (player) player.difference = value;
	}

	// Validation + submission
	function validateBalance(): boolean {
		const sel = players.filter((p) => p.selected && p.difference);
		if (sel.length === 0) return false;
		const sum = sel.reduce((t, p) => t + parseFloat(p.difference || '0'), 0);
		return Math.abs(sum) < 0.01;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!date) {
			error = 'Date is required';
			return;
		}
		if (!password) {
			error = 'Password is required';
			return;
		}
		const sel = players.filter((p) => p.selected && p.difference);
		if (sel.length === 0) {
			error = 'At least one player with a difference is required';
			return;
		}
		if (!validateBalance()) {
			error = 'Poker is a zero sum game!';
			return;
		}

		isSubmitting = true;
		error = '';
		try {
			const gameData: GameData = {
				date,
				gameNumber: 1,
				differences: Object.fromEntries(
					sel.map((p) => [p.name.toLowerCase(), parseFloat(p.difference)])
				)
			};
			const result = await writeToDb(password, gameData);
			if (result.success) window.location.reload();
			else error = result.error || 'Failed to save game';
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="game-entry-form">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="players-container"
		bind:this={containerEl}
		onkeydown={handleKeydown}
		style="height: {players.length * ROW_HEIGHT}px;"
	>
		{#each players as player (player.name)}
			<button
				type="button"
				class="player-item"
				class:selected={player.selected}
				data-player={player.name}
				style="transform: translateY({positions.get(player.name) ?? 0}px); opacity: {playerOpacity(
					player.name
				)};"
				onclick={() => togglePlayer(player.name)}
				onfocus={() => handleRowFocus(player.name)}
			>
				<span class="player-name">{player.name}</span>
				<span class="separator">|</span>
				<span class="diff-cell">
					{#if player.selected}
						<input
							type="text"
							inputmode="decimal"
							class="player-difference"
							placeholder="0.00"
							value={player.difference}
							oninput={(e) => updateDifference(player.name, e.currentTarget.value)}
							onclick={(e) => e.stopPropagation()}
							onfocus={() => handleRowFocus(player.name)}
						/>
					{/if}
				</span>
			</button>
		{/each}
	</div>

	<div class="new-player-row">
		<input
			type="text"
			class="form-input"
			placeholder="New player"
			bind:value={newPlayerName}
			onkeydown={handleNewPlayerKeydown}
		/>
	</div>

	<div class="form-separator"></div>

	<!-- <div class="form-row">
		<input type="date" class="form-input" bind:value={date} required />
		<span class="separator">|</span>
		<input
			type="text"
			inputmode="numeric"
			class="form-input"
			placeholder="Ga"
			value={gameNumber ?? ''}
			oninput={(e) => {
				const v = e.currentTarget.value;
				gameNumber = v ? parseInt(v) : undefined;
			}}
		/>
	</div> -->

	<div class="form-row">
		<input
			type="password"
			class="form-input full-width"
			placeholder="Password"
			bind:value={password}
			required
		/>
	</div>

	{#if error}
		<div class="error-message">{error}</div>
	{/if}

	<button type="submit" class="submit-btn" disabled={isSubmitting}>
		{isSubmitting ? 'Submitting...' : 'Add Game'}
	</button>
</form>

<style>
	.game-entry-form {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 16px;
		padding-top: 8px;
		user-select: none;
	}

	.players-container {
		position: relative;
		margin-bottom: 16px;
	}

	.player-item {
		all: unset;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: grid;
		grid-template-columns: 38.2% auto 1fr;
		align-items: center;
		padding: 0 0 0 16px;
		cursor: pointer;
		border-bottom: 1px solid #2a2a2a;
		box-sizing: border-box;
		height: 45px;
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.15s ease,
			background-color 0.2s ease;
	}

	.player-item:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.player-item:focus-visible {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.player-item.selected {
		background-color: rgba(255, 255, 255, 0.08);
	}

	.player-name {
		text-transform: capitalize;
		color: #888888;
		font-size: 14px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
	}

	.player-item.selected .player-name {
		color: #f5f5f5;
	}

	.separator {
		color: #444444;
		font-size: 14px;
		padding: 0 12px;
	}

	.diff-cell {
		min-height: 20px;
	}

	.player-difference {
		all: unset;
		width: 100%;
		font-size: 14px;
		color: #888888;
		font-variant-numeric: tabular-nums;
		box-sizing: border-box;
	}

	.player-difference:focus {
		color: #f5f5f5;
	}

	.player-difference::placeholder {
		color: #444444;
	}

	.new-player-row {
		height: 45px;
		display: flex;
		align-items: center;
		padding-left: 16px;
	}

	.new-player-row .form-input {
		padding: 0;
	}

	.form-separator {
		height: 1px;
		background-color: #2a2a2a;
		margin: 8px 0 16px 0;
	}

	.form-row {
		display: grid;
		grid-template-columns: 38.2% auto 1fr;
		align-items: center;
		padding-left: 16px;
		margin-bottom: 12px;
	}

	.form-input {
		all: unset;
		font-size: 14px;
		color: #888888;
		padding: 8px 0;
		font-variant-numeric: tabular-nums;
	}

	.form-input.full-width {
		grid-column: 1 / -1;
	}

	.form-input:focus {
		color: #f5f5f5;
	}

	.form-input::placeholder {
		color: #444444;
	}

	.form-input[type='date'] {
		color-scheme: dark;
	}

	.form-input[type='date']::-webkit-calendar-picker-indicator {
		filter: invert(0.5);
		cursor: pointer;
	}

	.form-input:-webkit-autofill,
	.form-input:-webkit-autofill:hover,
	.form-input:-webkit-autofill:focus {
		-webkit-text-fill-color: #888888;
		-webkit-box-shadow: 0 0 0px 1000px #121212 inset;
		transition: background-color 5000s ease-in-out 0s;
	}

	.submit-btn {
		all: unset;
		padding: 12px 0;
		text-align: center;
		background: transparent;
		color: #888888;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		cursor: pointer;
		transition: all 0.2s ease;
		margin-top: 8px;
		border-top: 1px solid #2a2a2a;
		padding-top: 16px;
	}

	.submit-btn:hover:not(:disabled) {
		color: #f5f5f5;
	}

	.submit-btn:disabled {
		color: #444444;
		cursor: not-allowed;
	}

	.error-message {
		padding: 8px 0;
		color: #9a6070;
		font-size: 12px;
		margin-bottom: 8px;
	}
</style>
