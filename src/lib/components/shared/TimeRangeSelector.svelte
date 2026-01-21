<script lang="ts">
	import type { TimeRange } from '$lib/types';

	interface Props {
		value: TimeRange;
		onchange: (value: TimeRange) => void;
	}

	let { value, onchange }: Props = $props();

	const options: TimeRange[] = [10, 30, 90];
</script>

<div class="time-range-selector">
	{#each options as option}
		<button
			class="range-btn"
			class:active={value === option}
			onclick={() => onchange(option)}
			type="button"
		>
			{option}
		</button>
	{/each}
</div>

<style>
	.time-range-selector {
		display: flex;
		gap: 0.25rem;
		background: var(--color-surface-elevated, #1a1a2e);
		border-radius: 8px;
		padding: 0.25rem;
	}

	.range-btn {
		padding: 0.375rem 0.75rem;
		border: none;
		background: transparent;
		color: var(--color-text-muted, #606070);
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.range-btn:hover {
		color: var(--color-text-secondary, #a0a0b0);
	}

	.range-btn.active {
		background: var(--color-primary, #14b8a6);
		color: white;
	}
</style>
