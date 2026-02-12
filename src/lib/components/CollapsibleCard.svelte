<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		headerText,
		isExpanded = $bindable(false),
		showPlusIcon = false,
		children
	}: { headerText: string; isExpanded: boolean; showPlusIcon?: boolean; children: Snippet } = $props();

	let plusRotation = $state(0);

	function handleToggle() {
		isExpanded = !isExpanded;
		if (showPlusIcon) {
			plusRotation = isExpanded ? 90 : 0;
		}
	}
</script>

<div class="collapsible">
	<button class="collapsible-header" class:expanded={isExpanded} onclick={handleToggle}>
		<span>{headerText}</span>
		{#if showPlusIcon}
			<span class="plus-icon" style="transform: rotate({plusRotation}deg)">+</span>
		{/if}
	</button>
	{#if isExpanded}
		<div class="collapsible-body" transition:slide={{ duration: 150 }}>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.collapsible {
		margin-top: 20px;
		padding-top: 16px;
		border-top: 1px solid #2a2a2a;
	}

	.collapsible-header {
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
	}

	.plus-icon {
		font-size: 16px;
		transition: transform 0.2s ease;
	}
</style>
