<script lang="ts">
	import Input from '$lib/components/shared/Input.svelte';
	import Select from '$lib/components/shared/Select.svelte';
	import Button from '$lib/components/shared/Button.svelte';
	import { EXERCISE_CATEGORIES, FOCUS_OPTIONS } from '$lib/constants/enums';
	import type { Exercise, ExerciseCategory } from '$lib/types';

	interface Props {
		exercise?: Exercise | null;
		onSubmit: (data: { name: string; category: ExerciseCategory; focus: string }) => Promise<void>;
		onCancel: () => void;
	}

	let { exercise = null, onSubmit, onCancel }: Props = $props();

	let name = $state(exercise?.name || '');
	let category = $state<ExerciseCategory>(exercise?.category || 'Brust');
	let focus = $state(exercise?.focus || '');
	let isSubmitting = $state(false);
	let error = $state('');

	let categoryOptions = EXERCISE_CATEGORIES.map(c => ({ value: c, label: c }));
	let focusOptions = $derived(
		FOCUS_OPTIONS[category].map(f => ({ value: f, label: f }))
	);

	// Reset focus when category changes
	$effect(() => {
		if (!FOCUS_OPTIONS[category].includes(focus)) {
			focus = FOCUS_OPTIONS[category][0] || '';
		}
	});

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		if (!name.trim()) {
			error = 'Name ist erforderlich';
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit({ name: name.trim(), category, focus });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Fehler beim Speichern';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form class="exercise-form" onsubmit={handleSubmit}>
	<Input
		label="Name"
		bind:value={name}
		placeholder="z.B. Bankdrücken"
		error={error}
	/>

	<Select
		label="Kategorie"
		bind:value={category}
		options={categoryOptions}
	/>

	<Select
		label="Fokus"
		bind:value={focus}
		options={focusOptions}
	/>

	<div class="form-actions">
		<Button variant="secondary" onclick={onCancel} type="button">
			Abbrechen
		</Button>
		<Button variant="primary" type="submit" disabled={isSubmitting}>
			{exercise ? 'Speichern' : 'Hinzufügen'}
		</Button>
	</div>
</form>

<style>
	.exercise-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}
</style>
