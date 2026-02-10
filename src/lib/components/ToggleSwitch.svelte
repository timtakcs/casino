<script lang="ts">
	let { label, isChecked = $bindable(false) }: { label: string; isChecked: boolean } = $props();
</script>

<div class="graph-toggle">
	<label class="toggle-label">
		<span class="toggle-text">{label}</span>
		<span class="toggle-switch">
			<input type="checkbox" bind:checked={isChecked} />
			<span class="toggle-slider"></span>
		</span>
	</label>
</div>

<style>
	.graph-toggle {
		margin-top: 16px;
		padding: 12px 16px;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
	}

	.toggle-text {
		font-size: 12px;
		color: #888888;
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 36px;
		height: 18px;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #2a2a2a;
		border-radius: 9px;
		transition: background-color 0.2s ease;
	}

	.toggle-slider::before {
		content: '';
		position: absolute;
		height: 12px;
		width: 12px;
		left: 3px;
		bottom: 3px;
		background-color: #666666;
		border-radius: 50%;
		transition:
			transform 0.2s ease,
			background-color 0.2s ease;
	}

	.toggle-switch input:checked + .toggle-slider {
		background-color: #3a3a3a;
	}

	.toggle-switch input:checked + .toggle-slider::before {
		transform: translateX(18px);
		background-color: #888888;
	}
</style>
