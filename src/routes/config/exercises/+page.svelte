<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';
	import ExerciseForm from '$lib/components/config/ExerciseForm.svelte';
	import ExerciseList from '$lib/components/config/ExerciseList.svelte';
	import { exercises } from '$lib/stores/exercises';
	import type { Exercise, ExerciseCategory } from '$lib/types';

	let showForm = $state(false);
	let editingExercise = $state<Exercise | null>(null);
	let showDeleteConfirm = $state(false);
	let deleteTarget = $state<Exercise | null>(null);

	function handleAdd() {
		editingExercise = null;
		showForm = true;
	}

	function handleEdit(exercise: Exercise) {
		editingExercise = exercise;
		showForm = true;
	}

	function handleDeleteClick(exercise: Exercise) {
		deleteTarget = exercise;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (deleteTarget?.id) {
			await exercises.remove(deleteTarget.id);
		}
		showDeleteConfirm = false;
		deleteTarget = null;
	}

	async function handleSubmit(data: { name: string; category: ExerciseCategory; focus: string }) {
		// Check for duplicate name
		const exists = await exercises.checkNameExists(data.name, editingExercise?.id);
		if (exists) {
			throw new Error('Eine Übung mit diesem Namen existiert bereits');
		}

		if (editingExercise?.id) {
			await exercises.update(editingExercise.id, data);
		} else {
			await exercises.add(data.name, data.category, data.focus);
		}
		showForm = false;
		editingExercise = null;
	}

	function handleCancel() {
		showForm = false;
		editingExercise = null;
	}
</script>

<svelte:head>
	<title>Übungen verwalten - Fitness Tracker</title>
</svelte:head>

<div class="exercises-page">
	<header class="page-header">
		<a href="/config" class="back-btn" aria-label="Zurück">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
		</a>
		<h1>Übungen</h1>
		<Button variant="primary" size="sm" onclick={handleAdd}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
			Neu
		</Button>
	</header>

	<main class="exercises-content">
		<ExerciseList
			exercises={$exercises}
			onEdit={handleEdit}
			onDelete={handleDeleteClick}
		/>
	</main>
</div>

<!-- Exercise Form Modal -->
<Modal
	open={showForm}
	title={editingExercise ? 'Übung bearbeiten' : 'Neue Übung'}
	onclose={handleCancel}
>
	<ExerciseForm
		exercise={editingExercise}
		onSubmit={handleSubmit}
		onCancel={handleCancel}
	/>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal
	open={showDeleteConfirm}
	title="Übung löschen?"
	onclose={() => {
		showDeleteConfirm = false;
		deleteTarget = null;
	}}
>
	<p>Möchtest du die Übung "<strong>{deleteTarget?.name}</strong>" wirklich löschen?</p>
	<p class="warning-text">Diese Aktion kann nicht rückgängig gemacht werden.</p>

	{#snippet actions()}
		<Button variant="secondary" onclick={() => showDeleteConfirm = false}>Abbrechen</Button>
		<Button variant="danger" onclick={handleDelete}>Löschen</Button>
	{/snippet}
</Modal>

<style>
	.exercises-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.page-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.back-btn {
		color: var(--color-text-secondary);
		padding: 0.5rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}

	.page-header h1 {
		flex: 1;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.exercises-content {
		flex: 1;
		padding: 1rem;
	}

	.warning-text {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
</style>
