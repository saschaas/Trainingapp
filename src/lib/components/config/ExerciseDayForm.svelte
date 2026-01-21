<script lang="ts">
	import Input from '$lib/components/shared/Input.svelte';
	import Select from '$lib/components/shared/Select.svelte';
	import Button from '$lib/components/shared/Button.svelte';
	import { EXERCISE_DAY_CATEGORIES, EXERCISE_DAY_LABELS } from '$lib/constants/enums';
	import type { ExerciseDay, ExerciseDayCategory, Exercise, ExerciseConfig } from '$lib/types';

	interface Props {
		exerciseDay?: ExerciseDay | null;
		exercises: Exercise[];
		onSubmit: (data: {
			name: string;
			category: ExerciseDayCategory;
			exercises: ExerciseConfig[];
		}) => Promise<void>;
		onCancel: () => void;
	}

	let { exerciseDay = null, exercises, onSubmit, onCancel }: Props = $props();

	let name = $state(exerciseDay?.name || '');
	let category = $state<ExerciseDayCategory>(exerciseDay?.category || 'push');
	let selectedExercises = $state<ExerciseConfig[]>(
		exerciseDay?.exercises.map(e => ({ ...e })) || []
	);
	let isSubmitting = $state(false);
	let error = $state('');

	let categoryOptions = EXERCISE_DAY_CATEGORIES.map(c => ({
		value: c,
		label: EXERCISE_DAY_LABELS[c]
	}));

	let availableExercises = $derived(
		exercises.filter(ex => !selectedExercises.some(se => se.exerciseId === ex.id))
	);

	function addExercise(exerciseId: number) {
		selectedExercises = [
			...selectedExercises,
			{
				exerciseId,
				numberOfSets: 3,
				position: selectedExercises.length
			}
		];
	}

	function removeExercise(exerciseId: number) {
		selectedExercises = selectedExercises
			.filter(e => e.exerciseId !== exerciseId)
			.map((e, i) => ({ ...e, position: i }));
	}

	function updateSets(exerciseId: number, sets: number) {
		selectedExercises = selectedExercises.map(e =>
			e.exerciseId === exerciseId ? { ...e, numberOfSets: Math.max(1, Math.min(10, sets)) } : e
		);
	}

	function moveUp(index: number) {
		if (index <= 0) return;
		const newList = [...selectedExercises];
		[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
		selectedExercises = newList.map((e, i) => ({ ...e, position: i }));
	}

	function moveDown(index: number) {
		if (index >= selectedExercises.length - 1) return;
		const newList = [...selectedExercises];
		[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
		selectedExercises = newList.map((e, i) => ({ ...e, position: i }));
	}

	function getExerciseName(exerciseId: number): string {
		return exercises.find(e => e.id === exerciseId)?.name || 'Unbekannt';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!name.trim()) {
			error = 'Name ist erforderlich';
			return;
		}

		if (selectedExercises.length === 0) {
			error = 'Mindestens eine Übung erforderlich';
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit({
				name: name.trim(),
				category,
				exercises: selectedExercises
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Fehler beim Speichern';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form class="day-form" onsubmit={handleSubmit}>
	<Input
		label="Name"
		bind:value={name}
		placeholder="z.B. Push Tag A"
		error={error && !selectedExercises.length ? '' : error}
	/>

	<Select
		label="Kategorie"
		bind:value={category}
		options={categoryOptions}
	/>

	<div class="exercises-section">
		<label class="section-label">Übungen</label>

		{#if exercises.length === 0}
			<div class="no-exercises-warning">
				<p>Keine Übungen vorhanden.</p>
				<p>Bitte erstelle zuerst <a href="/config/exercises">Übungen</a>, bevor du einen Trainingstag anlegst.</p>
			</div>
		{:else}
			{#if selectedExercises.length > 0}
				<div class="selected-exercises">
					{#each selectedExercises as config, index}
						<div class="exercise-row">
							<div class="exercise-order">
								<button type="button" class="order-btn" onclick={() => moveUp(index)} disabled={index === 0} aria-label="Nach oben">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="18 15 12 9 6 15"></polyline>
									</svg>
								</button>
								<button type="button" class="order-btn" onclick={() => moveDown(index)} disabled={index === selectedExercises.length - 1} aria-label="Nach unten">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="6 9 12 15 18 9"></polyline>
									</svg>
								</button>
							</div>
							<span class="exercise-name">{getExerciseName(config.exerciseId)}</span>
							<div class="sets-control">
								<button type="button" class="sets-btn" onclick={() => updateSets(config.exerciseId, config.numberOfSets - 1)}>-</button>
								<span class="sets-value">{config.numberOfSets}</span>
								<button type="button" class="sets-btn" onclick={() => updateSets(config.exerciseId, config.numberOfSets + 1)}>+</button>
							</div>
							<button type="button" class="remove-btn" onclick={() => removeExercise(config.exerciseId)} aria-label="Entfernen">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
						</div>
					{/each}
				</div>
			{/if}

			{#if availableExercises.length > 0}
				<div class="add-exercise">
					<select class="add-select" onchange={(e) => {
						const target = e.target as HTMLSelectElement;
						const id = parseInt(target.value);
						if (id) {
							addExercise(id);
							target.value = '';
						}
					}}>
						<option value="">Übung hinzufügen...</option>
						{#each availableExercises as ex}
							<option value={ex.id}>{ex.name}</option>
						{/each}
					</select>
				</div>
			{:else if selectedExercises.length > 0}
				<p class="all-added-note">Alle verfügbaren Übungen wurden hinzugefügt.</p>
			{/if}
		{/if}

		{#if error && selectedExercises.length === 0 && exercises.length > 0}
			<span class="error-text">{error}</span>
		{/if}
	</div>

	<div class="form-actions">
		<Button variant="secondary" onclick={onCancel} type="button">
			Abbrechen
		</Button>
		<Button variant="primary" type="submit" disabled={isSubmitting}>
			{exerciseDay ? 'Speichern' : 'Hinzufügen'}
		</Button>
	</div>
</form>

<style>
	.day-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.exercises-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.section-label {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.selected-exercises {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.exercise-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--color-surface-dark);
		border-radius: 6px;
	}

	.exercise-order {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.order-btn {
		background: none;
		border: none;
		padding: 2px;
		cursor: pointer;
		color: var(--color-text-secondary);
		border-radius: 2px;
	}

	.order-btn:hover:not(:disabled) {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}

	.order-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.exercise-name {
		flex: 1;
		font-size: 0.875rem;
		color: var(--color-text);
	}

	.sets-control {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.sets-btn {
		width: 24px;
		height: 24px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		cursor: pointer;
		color: var(--color-text);
		font-weight: 600;
	}

	.sets-btn:hover {
		background: var(--color-surface-hover);
	}

	.sets-value {
		width: 24px;
		text-align: center;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text);
	}

	.remove-btn {
		background: none;
		border: none;
		padding: 4px;
		cursor: pointer;
		color: var(--color-text-secondary);
		border-radius: 4px;
	}

	.remove-btn:hover {
		color: var(--color-danger);
		background: var(--color-surface-hover);
	}

	.add-exercise {
		margin-top: 0.25rem;
	}

	.add-select {
		width: 100%;
		padding: 0.5rem;
		background: var(--color-surface-dark);
		border: 1px dashed var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.add-select:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.error-text {
		color: var(--color-danger);
		font-size: 0.75rem;
	}

	.no-exercises-warning {
		padding: 1rem;
		background: var(--color-surface-dark);
		border: 1px dashed var(--color-border);
		border-radius: 8px;
		text-align: center;
	}

	.no-exercises-warning p {
		margin: 0;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.no-exercises-warning p:first-child {
		margin-bottom: 0.5rem;
		color: var(--color-text);
		font-weight: 500;
	}

	.no-exercises-warning a {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.all-added-note {
		margin: 0;
		padding: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}
</style>
