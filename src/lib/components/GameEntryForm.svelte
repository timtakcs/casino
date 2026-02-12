<script lang="ts">
	import { writeToDb } from '$lib/db/operations.js';
	import type { GameData } from '$lib/types.js';

	let date = $state('');
	let gameNumber = $state<number | undefined>(undefined);
	let players = $state<Array<{ name: string; diff: string }>>([{ name: '', diff: '' }]);
	let password = $state('');
	let error = $state('');
	let isSubmitting = $state(false);

	function addPlayer() {
		players = [...players, { name: '', diff: '' }];
	}

	function removePlayer(index: number) {
		if (players.length > 1) {
			players = players.filter((_, i) => i !== index);
		}
	}

	function validateBalance(): boolean {
		const sum = players
			.filter((p) => p.name && p.diff)
			.reduce((total, p) => total + parseFloat(p.diff || '0'), 0);

		return Math.abs(sum) < 0.01;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		// Validate balance
		if (!validateBalance()) {
			error = 'Player differences must sum to approximately 0';
			return;
		}

		// Validate required fields
		if (!date) {
			error = 'Date is required';
			return;
		}

		if (!password) {
			error = 'Password is required';
			return;
		}

		const validPlayers = players.filter((p) => p.name && p.diff);
		if (validPlayers.length === 0) {
			error = 'At least one player is required';
			return;
		}

		isSubmitting = true;
		error = '';

		try {
			const gameData: GameData = {
				date,
				differences: Object.fromEntries(
					validPlayers.map((p) => [p.name.toLowerCase(), parseFloat(p.diff)])
				)
			};

			if (gameNumber !== undefined && gameNumber !== null) {
				gameData.gameNumber = gameNumber;
			}

			const result = await writeToDb(password, gameData);

			if (result.success) {
				// Success - reload page to fetch new data
				window.location.reload();
			} else {
				error = result.error || 'Failed to save game';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="game-entry-form">
	<div class="form-group">
		<label for="date">Date *</label>
		<input type="date" id="date" bind:value={date} required />
	</div>

	<div class="form-group">
		<label for="gameNumber">Game Number (optional)</label>
		<input type="number" id="gameNumber" bind:value={gameNumber} min="1" />
	</div>

	<div class="players-section">
		<label>Players & Results *</label>
		{#each players as player, index}
			<div class="player-row">
				<input
					type="text"
					placeholder="Player name"
					bind:value={player.name}
					class="player-name"
				/>
				<input
					type="number"
					placeholder="Difference"
					bind:value={player.diff}
					step="0.01"
					class="player-diff"
				/>
				{#if players.length > 1}
					<button type="button" class="remove-btn" onclick={() => removePlayer(index)}>×</button>
				{/if}
			</div>
		{/each}
		<button type="button" class="add-player-btn" onclick={addPlayer}>+ Add Player</button>
	</div>

	<div class="form-group">
		<label for="password">Password *</label>
		<input type="password" id="password" bind:value={password} required />
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
		gap: 16px;
		padding: 16px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	label {
		font-size: 12px;
		font-weight: 500;
		color: #666666;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	input[type='date'],
	input[type='number'],
	input[type='password'] {
		padding: 8px 12px;
		border: 1px solid #cccccc;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
		background: white;
	}

	input:focus {
		outline: none;
		border-color: #4a5f8c;
	}

	.players-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.player-row {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.player-name {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #cccccc;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
	}

	.player-diff {
		width: 120px;
		padding: 8px 12px;
		border: 1px solid #cccccc;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
	}

	.remove-btn {
		width: 32px;
		height: 32px;
		padding: 0;
		border: 1px solid #e74c3c;
		border-radius: 4px;
		background: white;
		color: #e74c3c;
		font-size: 20px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-btn:hover {
		background: #e74c3c;
		color: white;
	}

	.add-player-btn {
		padding: 8px 12px;
		border: 1px dashed #4a5f8c;
		border-radius: 4px;
		background: transparent;
		color: #4a5f8c;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-player-btn:hover {
		background: #4a5f8c;
		color: white;
		border-style: solid;
	}

	.submit-btn {
		padding: 12px 24px;
		border: none;
		border-radius: 4px;
		background: #4a5f8c;
		color: white;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.submit-btn:hover:not(:disabled) {
		background: #3a4f7c;
	}

	.submit-btn:disabled {
		background: #cccccc;
		cursor: not-allowed;
	}

	.error-message {
		padding: 12px;
		background: #fee;
		border: 1px solid #e74c3c;
		border-radius: 4px;
		color: #c0392b;
		font-size: 13px;
	}
</style>
