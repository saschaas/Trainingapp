<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';
	import { trainingHistory } from '$lib/stores/trainingHistory';
	import { exerciseDays, exerciseDaysById } from '$lib/stores/exerciseDays';
	import { exercisesById } from '$lib/stores/exercises';
	import { formatVolume } from '$lib/utils/volume';
	import { EXERCISE_DAY_LABELS } from '$lib/constants/enums';
	import type { Training } from '$lib/types';

	let filterDayId = $state<number | null>(null);
	let showDetails = $state(false);
	let selectedTraining = $state<Training | null>(null);
	let showDeleteConfirm = $state(false);

	let filteredTrainings = $derived(() => {
		if (filterDayId === null) return $trainingHistory;
		return $trainingHistory.filter(t => t.exerciseDayId === filterDayId);
	});

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			weekday: 'short',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getDayName(dayId: number): string {
		return $exerciseDaysById.get(dayId)?.name || 'Unbekannt';
	}

	function getDayCategory(dayId: number): string {
		const day = $exerciseDaysById.get(dayId);
		return day ? EXERCISE_DAY_LABELS[day.category] : '';
	}

	function getCategoryColor(dayId: number): string {
		const day = $exerciseDaysById.get(dayId);
		if (!day) return 'var(--color-primary)';
		switch (day.category) {
			case 'push': return 'var(--color-push)';
			case 'pull': return 'var(--color-pull)';
			case 'legs': return 'var(--color-legs)';
			case 'full-body': return 'var(--color-fullbody)';
			default: return 'var(--color-primary)';
		}
	}

	function showTrainingDetails(training: Training) {
		selectedTraining = training;
		showDetails = true;
	}

	async function handleDelete() {
		if (selectedTraining?.id) {
			await trainingHistory.remove(selectedTraining.id);
		}
		showDeleteConfirm = false;
		showDetails = false;
		selectedTraining = null;
	}

	function getExerciseName(exerciseId: number): string {
		return $exercisesById.get(exerciseId)?.name || 'Unbekannt';
	}

	// Group sets by exercise for display
	function groupSetsByExercise(training: Training) {
		const grouped = new Map<number, typeof training.sets>();
		for (const set of training.sets) {
			const list = grouped.get(set.exerciseId) || [];
			list.push(set);
			grouped.set(set.exerciseId, list);
		}
		return grouped;
	}
</script>

<svelte:head>
	<title>Trainingshistorie - Fitness Tracker</title>
</svelte:head>

<div class="history-page">
	<header class="page-header">
		<a href="/config" class="back-btn" aria-label="Zurück">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
		</a>
		<h1>Trainingshistorie</h1>
	</header>

	<div class="filter-bar">
		<select class="filter-select" bind:value={filterDayId}>
			<option value={null}>Alle Trainingstage</option>
			{#each $exerciseDays as day}
				<option value={day.id}>{day.name}</option>
			{/each}
		</select>
	</div>

	<main class="history-content">
		{#if filteredTrainings().length === 0}
			<div class="empty-state">
				<p>Keine Trainings vorhanden.</p>
			</div>
		{:else}
			<div class="trainings-list">
				{#each filteredTrainings() as training}
					<button class="training-card" onclick={() => showTrainingDetails(training)}>
						<div class="training-header">
							<span class="training-category" style="background: {getCategoryColor(training.exerciseDayId)}">
								{getDayCategory(training.exerciseDayId)}
							</span>
							<span class="training-day">{getDayName(training.exerciseDayId)}</span>
						</div>
						<div class="training-meta">
							<span class="training-date">{formatDate(training.date)}</span>
							<span class="training-time">{formatTime(training.date)}</span>
						</div>
						<div class="training-volume">
							<span class="volume-value">{formatVolume(training.totalVolume)} kg</span>
							<span class="volume-label">Volumen</span>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</main>
</div>

<!-- Training Details Modal -->
<Modal
	open={showDetails}
	title="Training Details"
	onclose={() => {
		showDetails = false;
		selectedTraining = null;
	}}
>
	{#if selectedTraining}
		<div class="training-details">
			<div class="detail-header">
				<span class="detail-category" style="background: {getCategoryColor(selectedTraining.exerciseDayId)}">
					{getDayCategory(selectedTraining.exerciseDayId)}
				</span>
				<span class="detail-day">{getDayName(selectedTraining.exerciseDayId)}</span>
			</div>

			<div class="detail-info">
				<div class="info-item">
					<span class="info-label">Datum</span>
					<span class="info-value">{formatDate(selectedTraining.date)}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Zeit</span>
					<span class="info-value">{formatTime(selectedTraining.date)}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Gesamt-Volumen</span>
					<span class="info-value highlight">{formatVolume(selectedTraining.totalVolume)} kg</span>
				</div>
			</div>

			<div class="detail-exercises">
				<h4>Übungen</h4>
				{#each [...groupSetsByExercise(selectedTraining).entries()] as [exerciseId, sets]}
					<div class="exercise-detail">
						<span class="exercise-name">{getExerciseName(exerciseId)}</span>
						<div class="sets-list">
							{#each sets.sort((a, b) => a.setNumber - b.setNumber) as set}
								<div class="set-detail" class:skipped={set.skipped}>
									{#if set.skipped}
										<span class="set-skipped">Skip</span>
									{:else}
										<span class="set-values">
											{set.weight ?? '-'}kg x {set.repetitions ?? '-'}
										</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="detail-actions">
				<Button variant="danger" size="sm" onclick={() => showDeleteConfirm = true}>
					Training löschen
				</Button>
			</div>
		</div>
	{/if}
</Modal>

<!-- Delete Confirmation Modal -->
<Modal
	open={showDeleteConfirm}
	title="Training löschen?"
	onclose={() => showDeleteConfirm = false}
>
	<p>Möchtest du dieses Training wirklich löschen?</p>
	<p class="warning-text">Diese Aktion kann nicht rückgängig gemacht werden.</p>

	{#snippet actions()}
		<Button variant="secondary" onclick={() => showDeleteConfirm = false}>Abbrechen</Button>
		<Button variant="danger" onclick={handleDelete}>Löschen</Button>
	{/snippet}
</Modal>

<style>
	.history-page {
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
		font-size: 1.25rem;
		font-weight: 600;
	}

	.filter-bar {
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.filter-select {
		width: 100%;
		padding: 0.625rem 0.875rem;
		background: var(--color-surface-dark);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.875rem;
	}

	.history-content {
		flex: 1;
		padding: 1rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--color-text-secondary);
	}

	.trainings-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.training-card {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		width: 100%;
		font-family: inherit;
	}

	.training-card:hover {
		background: var(--color-surface-hover);
		border-color: var(--color-primary);
	}

	.training-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.training-category {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 600;
		color: white;
		text-transform: uppercase;
	}

	.training-day {
		font-weight: 500;
		color: var(--color-text);
	}

	.training-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.training-volume {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-top: 0.25rem;
	}

	.volume-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.volume-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	/* Training Details */
	.training-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.detail-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.detail-category {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
	}

	.detail-day {
		font-weight: 500;
		color: var(--color-text);
	}

	.detail-info {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		padding: 0.75rem;
		background: var(--color-surface-dark);
		border-radius: 8px;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.info-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.info-value {
		font-weight: 500;
		color: var(--color-text);
	}

	.info-value.highlight {
		color: var(--color-primary);
	}

	.detail-exercises {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.detail-exercises h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
	}

	.exercise-detail {
		padding: 0.75rem;
		background: var(--color-surface-dark);
		border-radius: 8px;
	}

	.exercise-name {
		font-weight: 500;
		color: var(--color-text);
		display: block;
		margin-bottom: 0.5rem;
	}

	.sets-list {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.set-detail {
		padding: 0.25rem 0.5rem;
		background: var(--color-surface);
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.set-detail.skipped {
		opacity: 0.5;
	}

	.set-values {
		color: var(--color-text);
	}

	.set-skipped {
		color: var(--color-text-muted);
		font-style: italic;
	}

	.detail-actions {
		margin-top: 0.5rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--color-border);
	}

	.warning-text {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}
</style>
