<script lang="ts">
	import { EXERCISE_DAY_LABELS } from '$lib/constants/enums';
	import type { ExerciseDay, Exercise } from '$lib/types';

	interface Props {
		exerciseDays: ExerciseDay[];
		exercises: Exercise[];
		onEdit: (day: ExerciseDay) => void;
		onDelete: (day: ExerciseDay) => void;
	}

	let { exerciseDays, exercises, onEdit, onDelete }: Props = $props();

	function getExerciseName(exerciseId: number): string {
		return exercises.find(e => e.id === exerciseId)?.name || 'Unbekannt';
	}

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'push': return 'var(--color-push)';
			case 'pull': return 'var(--color-pull)';
			case 'legs': return 'var(--color-legs)';
			case 'full-body': return 'var(--color-fullbody)';
			default: return 'var(--color-primary)';
		}
	}
</script>

<div class="day-list">
	{#if exerciseDays.length === 0}
		<div class="empty-state">
			<p>Noch keine Trainingstage vorhanden.</p>
			<p class="hint">Erstelle deinen ersten Trainingstag!</p>
		</div>
	{:else}
		{#each exerciseDays as day}
			<div class="day-card">
				<div class="day-header">
					<div class="day-info">
						<span
							class="day-category"
							style="background: {getCategoryColor(day.category)}"
						>
							{EXERCISE_DAY_LABELS[day.category]}
						</span>
						<h3 class="day-name">{day.name}</h3>
					</div>
					<div class="day-actions">
						<button
							class="action-btn edit"
							onclick={() => onEdit(day)}
							aria-label="Bearbeiten"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
							</svg>
						</button>
						<button
							class="action-btn delete"
							onclick={() => onDelete(day)}
							aria-label="Löschen"
						>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<polyline points="3 6 5 6 21 6"></polyline>
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
							</svg>
						</button>
					</div>
				</div>
				<div class="day-exercises">
					{#each day.exercises.sort((a, b) => a.position - b.position) as config}
						<div class="exercise-chip">
							<span class="exercise-name">{getExerciseName(config.exerciseId)}</span>
							<span class="exercise-sets">{config.numberOfSets}x</span>
						</div>
					{/each}
				</div>
				<div class="day-meta">
					<span class="rotation-order">Position #{day.rotationOrder + 1}</span>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.day-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--color-text-secondary);
	}

	.empty-state .hint {
		font-size: 0.875rem;
		color: var(--color-text-muted);
	}

	.day-card {
		background: var(--color-surface);
		border-radius: 12px;
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.day-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.day-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.day-category {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
	}

	.day-name {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text);
	}

	.day-actions {
		display: flex;
		gap: 0.25rem;
	}

	.action-btn {
		background: none;
		border: none;
		padding: 0.375rem;
		border-radius: 4px;
		cursor: pointer;
		color: var(--color-text-secondary);
		transition: all 0.2s ease;
	}

	.action-btn:hover {
		background: var(--color-surface-hover);
	}

	.action-btn.edit:hover {
		color: var(--color-primary);
	}

	.action-btn.delete:hover {
		color: var(--color-danger);
	}

	.day-exercises {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 1rem;
	}

	.exercise-chip {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		background: var(--color-surface-dark);
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.exercise-name {
		color: var(--color-text);
	}

	.exercise-sets {
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.day-meta {
		padding: 0.5rem 1rem;
		border-top: 1px solid var(--color-border);
		background: var(--color-surface-dark);
	}

	.rotation-order {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}
</style>
