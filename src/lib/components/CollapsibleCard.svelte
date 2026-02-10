<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	let {
		headerText,
		isExpanded = $bindable(false),
		children
	}: { headerText: string; isExpanded: boolean; children: Snippet } = $props();
</script>

<div class="collapsible">
	<button class="collapsible-header" class:expanded={isExpanded} onclick={() => (isExpanded = !isExpanded)}>
		{headerText}
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
		display: block;
		padding: 0 16px;
		font-size: 12px;
		color: #888888;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		cursor: pointer;
		font-family: inherit;
		font-weight: inherit;
	}
</style>
