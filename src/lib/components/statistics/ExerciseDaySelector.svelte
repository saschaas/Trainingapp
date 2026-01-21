<script lang="ts">
	import type { ExerciseDay } from '$lib/types';

	interface Props {
		exerciseDays: ExerciseDay[];
		selectedId: number | null;
		onselect: (id: number) => void;
	}

	let { exerciseDays, selectedId, onselect }: Props = $props();

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'push': return '#ef4444';
			case 'pull': return '#3b82f6';
			case 'legs': return '#22c55e';
			case 'full-body': return '#8b5cf6';
			default: return '#14b8a6';
		}
	}
</script>

<div class="day-selector">
	{#each exerciseDays as day}
		<button
			class="day-pill"
			class:active={selectedId === day.id}
			style="--category-color: {getCategoryColor(day.category)}"
			onclick={() => onselect(day.id!)}
			type="button"
		>
			<span class="indicator"></span>
			{day.name}
		</button>
	{/each}
</div>

<style>
	.day-selector {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding-bottom: 0.5rem;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.day-selector::-webkit-scrollbar {
		display: none;
	}

	.day-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border, #2a2a45);
		background: var(--color-surface, #12121f);
		color: var(--color-text-secondary, #a0a0b0);
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 20px;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.day-pill:hover {
		border-color: var(--category-color);
		color: var(--color-text, #ffffff);
	}

	.day-pill.active {
		background: var(--category-color);
		border-color: var(--category-color);
		color: white;
	}

	.indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--category-color);
	}

	.day-pill.active .indicator {
		background: white;
	}
</style>
