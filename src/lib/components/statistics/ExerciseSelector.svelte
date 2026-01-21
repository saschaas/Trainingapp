<script lang="ts">
	import type { Exercise, ExerciseDay } from '$lib/types';

	interface Props {
		exercises: Exercise[];
		exerciseDays: ExerciseDay[];
		selectedId: number | null;
		onselect: (id: number) => void;
	}

	let { exercises, exerciseDays, selectedId, onselect }: Props = $props();

	let searchQuery = $state('');
	let isOpen = $state(false);

	// Group exercises by exercise day
	let groupedExercises = $derived.by(() => {
		const groups: Array<{ dayName: string; dayId: number; exercises: Exercise[] }> = [];

		for (const day of exerciseDays) {
			const dayExerciseIds = new Set(day.exercises.map(e => e.exerciseId));
			const dayExercises = exercises.filter(e => e.id && dayExerciseIds.has(e.id));

			if (dayExercises.length > 0) {
				groups.push({
					dayName: day.name,
					dayId: day.id!,
					exercises: dayExercises
				});
			}
		}

		// Add ungrouped exercises
		const groupedIds = new Set(groups.flatMap(g => g.exercises.map(e => e.id)));
		const ungrouped = exercises.filter(e => e.id && !groupedIds.has(e.id));

		if (ungrouped.length > 0) {
			groups.push({
				dayName: 'Andere',
				dayId: 0,
				exercises: ungrouped
			});
		}

		return groups;
	});

	let filteredGroups = $derived.by(() => {
		if (!searchQuery.trim()) return groupedExercises;

		const query = searchQuery.toLowerCase();
		return groupedExercises
			.map(group => ({
				...group,
				exercises: group.exercises.filter(e =>
					e.name.toLowerCase().includes(query)
				)
			}))
			.filter(group => group.exercises.length > 0);
	});

	let selectedExercise = $derived(exercises.find(e => e.id === selectedId));

	function handleSelect(id: number) {
		onselect(id);
		isOpen = false;
		searchQuery = '';
	}
</script>

<div class="selector-container">
	<button
		class="selector-trigger"
		onclick={() => isOpen = !isOpen}
		type="button"
	>
		{#if selectedExercise}
			<span class="selected-name">{selectedExercise.name}</span>
		{:else}
			<span class="placeholder">Übung auswählen...</span>
		{/if}
		<svg class="chevron" class:open={isOpen} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if isOpen}
		<div class="dropdown">
			<div class="search-container">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8"></circle>
					<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
				</svg>
				<input
					type="text"
					class="search-input"
					placeholder="Suchen..."
					bind:value={searchQuery}
				/>
			</div>

			<div class="options-container">
				{#each filteredGroups as group}
					<div class="group">
						<div class="group-header">{group.dayName}</div>
						{#each group.exercises as exercise}
							<button
								class="option"
								class:selected={exercise.id === selectedId}
								onclick={() => handleSelect(exercise.id!)}
								type="button"
							>
								{exercise.name}
								<span class="category">{exercise.category}</span>
							</button>
						{/each}
					</div>
				{/each}

				{#if filteredGroups.length === 0}
					<div class="no-results">Keine Übungen gefunden</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if isOpen}
	<button class="backdrop" onclick={() => isOpen = false} type="button" aria-label="Schließen"></button>
{/if}

<style>
	.selector-container {
		position: relative;
	}

	.selector-trigger {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--color-surface-elevated, #1a1a2e);
		border: 1px solid var(--color-border, #2a2a45);
		border-radius: 10px;
		color: var(--color-text, #ffffff);
		font-size: 0.9375rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.selector-trigger:hover {
		border-color: var(--color-primary, #14b8a6);
	}

	.placeholder {
		color: var(--color-text-muted, #606070);
	}

	.chevron {
		color: var(--color-text-muted, #606070);
		transition: transform 0.2s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		right: 0;
		background: var(--color-surface, #12121f);
		border: 1px solid var(--color-border, #2a2a45);
		border-radius: 10px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		z-index: 100;
		overflow: hidden;
	}

	.search-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-bottom: 1px solid var(--color-border, #2a2a45);
		color: var(--color-text-muted, #606070);
	}

	.search-input {
		flex: 1;
		background: none;
		border: none;
		color: var(--color-text, #ffffff);
		font-size: 0.875rem;
		outline: none;
	}

	.search-input::placeholder {
		color: var(--color-text-muted, #606070);
	}

	.options-container {
		max-height: 300px;
		overflow-y: auto;
	}

	.group {
		border-bottom: 1px solid var(--color-border, #2a2a45);
	}

	.group:last-child {
		border-bottom: none;
	}

	.group-header {
		padding: 0.5rem 0.75rem;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-muted, #606070);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--color-surface-elevated, #1a1a2e);
	}

	.option {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		background: none;
		border: none;
		color: var(--color-text, #ffffff);
		font-size: 0.875rem;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.option:hover {
		background: var(--color-surface-hover, #252540);
	}

	.option.selected {
		background: var(--color-primary, #14b8a6);
		color: white;
	}

	.category {
		font-size: 0.75rem;
		color: var(--color-text-muted, #606070);
	}

	.option.selected .category {
		color: rgba(255, 255, 255, 0.7);
	}

	.no-results {
		padding: 1.5rem;
		text-align: center;
		color: var(--color-text-muted, #606070);
		font-size: 0.875rem;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: transparent;
		z-index: 99;
		cursor: default;
		border: none;
	}
</style>
