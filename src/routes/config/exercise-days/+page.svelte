<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';
	import ExerciseDayForm from '$lib/components/config/ExerciseDayForm.svelte';
	import ExerciseDayList from '$lib/components/config/ExerciseDayList.svelte';
	import { exercises } from '$lib/stores/exercises';
	import { exerciseDays } from '$lib/stores/exerciseDays';
	import type { ExerciseDay, ExerciseDayCategory, ExerciseConfig } from '$lib/types';

	let showForm = $state(false);
	let editingDay = $state<ExerciseDay | null>(null);
	let showDeleteConfirm = $state(false);
	let deleteTarget = $state<ExerciseDay | null>(null);

	function handleAdd() {
		editingDay = null;
		showForm = true;
	}

	function handleEdit(day: ExerciseDay) {
		editingDay = day;
		showForm = true;
	}

	function handleDeleteClick(day: ExerciseDay) {
		deleteTarget = day;
		showDeleteConfirm = true;
	}

	async function handleDelete() {
		if (deleteTarget?.id) {
			await exerciseDays.remove(deleteTarget.id);
		}
		showDeleteConfirm = false;
		deleteTarget = null;
	}

	async function handleSubmit(data: {
		name: string;
		category: ExerciseDayCategory;
		exercises: ExerciseConfig[];
	}) {
		if (editingDay?.id) {
			await exerciseDays.update(editingDay.id, data);
		} else {
			await exerciseDays.add(data.name, data.category, data.exercises);
		}
		showForm = false;
		editingDay = null;
	}

	function handleCancel() {
		showForm = false;
		editingDay = null;
	}
</script>

<svelte:head>
	<title>Trainingstage verwalten - Fitness Tracker</title>
</svelte:head>

<div class="days-page">
	<header class="page-header">
		<a href="/config" class="back-btn" aria-label="Zurück">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
		</a>
		<h1>Trainingstage</h1>
		<Button variant="primary" size="sm" onclick={handleAdd}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="12" y1="5" x2="12" y2="19"></line>
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
			Neu
		</Button>
	</header>

	<main class="days-content">
		<ExerciseDayList
			exerciseDays={$exerciseDays}
			exercises={$exercises}
			onEdit={handleEdit}
			onDelete={handleDeleteClick}
		/>
	</main>
</div>

<!-- Exercise Day Form Modal -->
<Modal
	open={showForm}
	title={editingDay ? 'Trainingstag bearbeiten' : 'Neuer Trainingstag'}
	onclose={handleCancel}
>
	<ExerciseDayForm
		exerciseDay={editingDay}
		exercises={$exercises}
		onSubmit={handleSubmit}
		onCancel={handleCancel}
	/>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal
	open={showDeleteConfirm}
	title="Trainingstag löschen?"
	onclose={() => {
		showDeleteConfirm = false;
		deleteTarget = null;
	}}
>
	<p>Möchtest du den Trainingstag "<strong>{deleteTarget?.name}</strong>" wirklich löschen?</p>
	<p class="warning-text">Diese Aktion kann nicht rückgängig gemacht werden. Vergangene Trainings bleiben erhalten.</p>

	{#snippet actions()}
		<Button variant="secondary" onclick={() => showDeleteConfirm = false}>Abbrechen</Button>
		<Button variant="danger" onclick={handleDelete}>Löschen</Button>
	{/snippet}
</Modal>

<style>
	.days-page {
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

	.days-content {
		flex: 1;
		padding: 1rem;
	}

	.warning-text {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
</style>
