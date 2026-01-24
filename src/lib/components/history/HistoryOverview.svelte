<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';
	import { trainingHistory } from '$lib/stores/trainingHistory';
	import { exerciseDays, exerciseDaysById } from '$lib/stores/exerciseDays';
	import { exercisesById } from '$lib/stores/exercises';
	import { formatVolume, calculateTotalVolume } from '$lib/utils/volume';
	import { EXERCISE_DAY_LABELS } from '$lib/constants/enums';
	import type { Training, SetData } from '$lib/types';

	let daysFilter = $state<number | null>(30);
	let filterDayId = $state<number | null>(null);

	let showDeleteConfirm = $state(false);
	let showEditModal = $state(false);
	let selectedTraining = $state<Training | null>(null);

	let editingSets = $state<SetData[]>([]);
	let editingDate = $state<string>('');
	let editingTime = $state<string>('');

	let filteredTrainings = $derived(() => {
		let trainings = $trainingHistory;
		if (filterDayId !== null) {
			trainings = trainings.filter(t => t.exerciseDayId === filterDayId);
		}
		if (daysFilter !== null) {
			const cutoffDate = Date.now() - (daysFilter * 24 * 60 * 60 * 1000);
			trainings = trainings.filter(t => t.date >= cutoffDate);
		}
		return trainings;
	});

	function formatDateShort(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
	}

	function getDayName(dayId: number): string {
		return $exerciseDaysById.get(dayId)?.name || 'Unbekannt';
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

	function getExerciseName(exerciseId: number): string {
		return $exercisesById.get(exerciseId)?.name || '?';
	}

	function groupSetsByExercise(training: Training) {
		const grouped = new Map<number, typeof training.sets>();
		for (const set of training.sets) {
			const list = grouped.get(set.exerciseId) || [];
			list.push(set);
			grouped.set(set.exerciseId, list);
		}
		return grouped;
	}

	function formatSetsCompact(sets: SetData[]): string {
		const validSets = sets.filter(s => !s.skipped).sort((a, b) => a.setNumber - b.setNumber);
		if (validSets.length === 0) return '-';
		return validSets.map(s => `${s.weight ?? '-'}x${s.repetitions ?? '-'}`).join(' / ');
	}

	function openEditModal(training: Training, e: Event) {
		e.stopPropagation();
		selectedTraining = training;
		editingSets = JSON.parse(JSON.stringify(training.sets));
		const date = new Date(training.date);
		editingDate = date.toISOString().split('T')[0];
		editingTime = date.toTimeString().slice(0, 5);
		showEditModal = true;
	}

	function openDeleteConfirm(training: Training, e: Event) {
		e.stopPropagation();
		selectedTraining = training;
		showDeleteConfirm = true;
	}

	function updateEditingSet(exerciseId: number, setNumber: number, field: 'weight' | 'repetitions', value: string) {
		const numValue = value === '' ? null : parseFloat(value);
		editingSets = editingSets.map(set => {
			if (set.exerciseId === exerciseId && set.setNumber === setNumber) {
				return { ...set, [field]: numValue };
			}
			return set;
		});
	}

	function toggleSkipSet(exerciseId: number, setNumber: number) {
		editingSets = editingSets.map(set => {
			if (set.exerciseId === exerciseId && set.setNumber === setNumber) {
				return { ...set, skipped: !set.skipped };
			}
			return set;
		});
	}

	async function saveEdit() {
		if (!selectedTraining?.id) return;
		const dateTime = new Date(`${editingDate}T${editingTime}`);
		const totalVolume = calculateTotalVolume(editingSets);
		await trainingHistory.update(selectedTraining.id, {
			sets: editingSets,
			date: dateTime.getTime(),
			totalVolume
		});
		showEditModal = false;
		selectedTraining = null;
	}

	async function handleDelete() {
		if (selectedTraining?.id) {
			await trainingHistory.remove(selectedTraining.id);
		}
		showDeleteConfirm = false;
		showEditModal = false;
		selectedTraining = null;
	}

	let groupedEditingSets = $derived(() => {
		const grouped = new Map<number, SetData[]>();
		for (const set of editingSets) {
			const list = grouped.get(set.exerciseId) || [];
			list.push(set);
			grouped.set(set.exerciseId, list);
		}
		return grouped;
	});
</script>

<div class="history-overview">
	<div class="toolbar">
		<select class="filter-select" bind:value={daysFilter}>
			<option value={7}>7 Tage</option>
			<option value={14}>14 Tage</option>
			<option value={30}>30 Tage</option>
			<option value={null}>Alle</option>
		</select>
		<select class="filter-select" bind:value={filterDayId}>
			<option value={null}>Alle Tage</option>
			{#each $exerciseDays as day}
				<option value={day.id}>{day.name}</option>
			{/each}
		</select>
		<span class="count">{filteredTrainings().length} Trainings</span>
	</div>

	{#if filteredTrainings().length === 0}
		<div class="empty">Keine Trainings im Zeitraum.</div>
	{:else}
		<div class="list">
			{#each filteredTrainings() as training (training.id)}
				{@const groups = [...groupSetsByExercise(training).entries()]}
				<div class="row">
					<div class="row-left">
						<span class="badge" style="background:{getCategoryColor(training.exerciseDayId)}">
							{getDayName(training.exerciseDayId)}
						</span>
						<span class="date">{formatDateShort(training.date)}</span>
						<span class="vol">{formatVolume(training.totalVolume)}kg</span>
					</div>
					<div class="row-exercises">
						{#each groups as [exId, sets], i}
							<div class="ex-pill">
								<span class="ex-label">{getExerciseName(exId)}</span>
								<span class="ex-data">{formatSetsCompact(sets)}</span>
							</div>
						{/each}
					</div>
					<div class="row-actions">
						<button class="btn-icon" onclick={(e) => openEditModal(training, e)} title="Bearbeiten">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
						</button>
						<button class="btn-icon del" onclick={(e) => openDeleteConfirm(training, e)} title="Löschen">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal open={showEditModal} title="Training bearbeiten" onclose={() => { showEditModal = false; selectedTraining = null; }}>
	{#if selectedTraining}
		<div class="edit-form">
			<div class="edit-row">
				<div class="field">
					<label for="edit-date">Datum</label>
					<input id="edit-date" type="date" bind:value={editingDate} />
				</div>
				<div class="field">
					<label for="edit-time">Zeit</label>
					<input id="edit-time" type="time" bind:value={editingTime} />
				</div>
			</div>
			<div class="edit-exercises">
				{#each [...groupedEditingSets().entries()] as [exerciseId, sets]}
					<div class="edit-ex">
						<div class="edit-ex-name">{$exercisesById.get(exerciseId)?.name || '?'}</div>
						<div class="edit-ex-sets">
							{#each sets.sort((a, b) => a.setNumber - b.setNumber) as set}
								<div class="set-row" class:skipped={set.skipped}>
									<input type="number" placeholder="kg" value={set.weight ?? ''} disabled={set.skipped} oninput={(e) => updateEditingSet(exerciseId, set.setNumber, 'weight', e.currentTarget.value)} />
									<span>x</span>
									<input type="number" placeholder="Wdh" value={set.repetitions ?? ''} disabled={set.skipped} oninput={(e) => updateEditingSet(exerciseId, set.setNumber, 'repetitions', e.currentTarget.value)} />
									<button class="skip" class:active={set.skipped} onclick={() => toggleSkipSet(exerciseId, set.setNumber)}>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
									</button>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	{#snippet actions()}
		<Button variant="secondary" onclick={() => { showEditModal = false; selectedTraining = null; }}>Abbrechen</Button>
		<Button variant="primary" onclick={saveEdit}>Speichern</Button>
	{/snippet}
</Modal>

<Modal open={showDeleteConfirm} title="Löschen?" onclose={() => showDeleteConfirm = false}>
	<p>Training wirklich löschen?</p>
	{#snippet actions()}
		<Button variant="secondary" onclick={() => showDeleteConfirm = false}>Nein</Button>
		<Button variant="danger" onclick={handleDelete}>Ja</Button>
	{/snippet}
</Modal>

<style>
	.history-overview {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.filter-select {
		padding: 0.5rem 0.75rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 0.9rem;
	}

	.count {
		margin-left: auto;
		font-size: 0.9rem;
		color: var(--color-text-muted);
	}

	.empty {
		padding: 3rem;
		text-align: center;
		color: var(--color-text-muted);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
		flex: 1;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
	}

	.row:hover {
		border-color: var(--color-text-muted);
	}

	.row-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
		min-width: 200px;
	}

	.badge {
		padding: 0.375rem 0.75rem;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		color: white;
		white-space: nowrap;
	}

	.date {
		font-size: 0.85rem;
		color: var(--color-text-muted);
	}

	.vol {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.row-exercises {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		min-width: 0;
	}

	.ex-pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.75rem;
		background: var(--color-surface-dark);
		border: 1px solid var(--color-border);
		border-radius: 6px;
	}

	.ex-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.ex-data {
		font-size: 0.85rem;
		color: var(--color-text);
		font-variant-numeric: tabular-nums;
	}

	.row-actions {
		display: flex;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.btn-icon {
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface-dark);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.15s;
	}

	.btn-icon:hover {
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.btn-icon.del:hover {
		color: var(--color-danger);
		border-color: var(--color-danger);
	}

	/* Edit Modal */
	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.edit-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field label {
		font-size: 0.8rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.field input {
		padding: 0.625rem 0.75rem;
		background: var(--color-surface-dark);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text);
		font-size: 0.95rem;
	}

	.field input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.edit-exercises {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.edit-ex {
		padding: 0.875rem;
		background: var(--color-surface-dark);
		border-radius: 8px;
	}

	.edit-ex-name {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: 0.625rem;
	}

	.edit-ex-sets {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.set-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-text-muted);
	}

	.set-row.skipped {
		opacity: 0.4;
	}

	.set-row input {
		width: 4.5rem;
		padding: 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 5px;
		color: var(--color-text);
		font-size: 0.95rem;
		text-align: center;
	}

	.set-row input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.set-row input:disabled {
		opacity: 0.4;
	}

	.skip {
		background: none;
		border: none;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 0.25rem;
		display: flex;
	}

	.skip:hover, .skip.active {
		color: var(--color-danger);
	}
</style>
