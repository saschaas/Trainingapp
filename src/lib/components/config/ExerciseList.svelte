<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import { CATEGORY_COLORS } from '$lib/constants/enums';
	import type { Exercise } from '$lib/types';

	interface Props {
		exercises: Exercise[];
		onEdit: (exercise: Exercise) => void;
		onDelete: (exercise: Exercise) => void;
	}

	let { exercises, onEdit, onDelete }: Props = $props();

	let groupedExercises = $derived(() => {
		const grouped = new Map<string, Exercise[]>();
		for (const ex of exercises) {
			const list = grouped.get(ex.category) || [];
			list.push(ex);
			grouped.set(ex.category, list);
		}
		return grouped;
	});
</script>

<div class="exercise-list">
	{#if exercises.length === 0}
		<div class="empty-state">
			<p>Noch keine Übungen vorhanden.</p>
			<p class="hint">Füge deine erste Übung hinzu!</p>
		</div>
	{:else}
		{#each [...groupedExercises().entries()] as [category, categoryExercises]}
			<div class="category-group">
				<h3 class="category-title" style="color: {CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}">
					{category}
				</h3>
				<div class="exercises">
					{#each categoryExercises as exercise}
						<div class="exercise-item">
							<div class="exercise-info">
								<span class="exercise-name">{exercise.name}</span>
								<span class="exercise-focus">{exercise.focus}</span>
							</div>
							<div class="exercise-actions">
								<button
									class="action-btn edit"
									onclick={() => onEdit(exercise)}
									aria-label="Bearbeiten"
								>
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
									</svg>
								</button>
								<button
									class="action-btn delete"
									onclick={() => onDelete(exercise)}
									aria-label="Löschen"
								>
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="3 6 5 6 21 6"></polyline>
										<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.exercise-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
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

	.category-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.category-title {
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
	}

	.exercises {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.exercise-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border-radius: 8px;
		border: 1px solid var(--color-border);
	}

	.exercise-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.exercise-name {
		font-weight: 500;
		color: var(--color-text);
	}

	.exercise-focus {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.exercise-actions {
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
</style>
