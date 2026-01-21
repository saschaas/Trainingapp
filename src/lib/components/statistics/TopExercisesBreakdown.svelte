<script lang="ts">
	import type { ExerciseVolumeBreakdown } from '$lib/types';
	import { formatVolume } from '$lib/utils/volume';

	interface Props {
		exercises: ExerciseVolumeBreakdown[];
		onexerciseclick?: (exerciseId: number) => void;
	}

	let { exercises, onexerciseclick }: Props = $props();

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'Brust': return '#ef4444';
			case 'Schulter': return '#f97316';
			case 'Trizeps': return '#f59e0b';
			case 'Rücken': return '#3b82f6';
			case 'Bizeps': return '#6366f1';
			case 'Beine': return '#22c55e';
			case 'Bauch': return '#14b8a6';
			default: return '#8b5cf6';
		}
	}

	const maxPercentage = $derived(Math.max(...exercises.map(e => e.percentage), 1));
</script>

<div class="breakdown-container">
	<h3 class="section-title">Top Übungen nach Volumen</h3>

	{#if exercises.length === 0}
		<div class="no-data">Keine Übungsdaten vorhanden</div>
	{:else}
		<div class="exercise-list">
			{#each exercises as exercise, index}
				<button
					class="exercise-row"
					onclick={() => onexerciseclick?.(exercise.exerciseId)}
					type="button"
				>
					<div class="exercise-info">
						<span class="rank">{index + 1}</span>
						<span class="name">{exercise.exerciseName}</span>
						<span class="percentage">{exercise.percentage.toFixed(1)}%</span>
					</div>
					<div class="bar-container">
						<div
							class="bar"
							style="width: {(exercise.percentage / maxPercentage) * 100}%; background: {getCategoryColor(exercise.category)}"
						></div>
					</div>
					<div class="volume">{formatVolume(exercise.totalVolume)} kg</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.breakdown-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary, #a0a0b0);
	}

	.no-data {
		text-align: center;
		padding: 1.5rem;
		color: var(--color-text-muted, #606070);
		font-size: 0.875rem;
	}

	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.exercise-row {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.75rem;
		background: var(--color-surface-elevated, #1a1a2e);
		border: 1px solid var(--color-border, #2a2a45);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		width: 100%;
	}

	.exercise-row:hover {
		border-color: var(--color-primary, #14b8a6);
	}

	.exercise-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.rank {
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface, #12121f);
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-muted, #606070);
	}

	.name {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text, #ffffff);
	}

	.percentage {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary, #a0a0b0);
	}

	.bar-container {
		height: 6px;
		background: var(--color-surface, #12121f);
		border-radius: 3px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		border-radius: 3px;
		transition: width 0.3s ease;
	}

	.volume {
		font-size: 0.75rem;
		color: var(--color-text-muted, #606070);
		text-align: right;
	}
</style>
