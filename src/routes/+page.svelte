<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Header from '$lib/components/layout/Header.svelte';
	import TabNavigation from '$lib/components/layout/TabNavigation.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import ExerciseCard from '$lib/components/training/ExerciseCard.svelte';
	import VolumeDisplay from '$lib/components/training/VolumeDisplay.svelte';
	import HistoryOverview from '$lib/components/history/HistoryOverview.svelte';
	import Modal from '$lib/components/shared/Modal.svelte';
	import Button from '$lib/components/shared/Button.svelte';

	import { exercises, exercisesById } from '$lib/stores/exercises';
	import { exerciseDays, exerciseDaysByCategory } from '$lib/stores/exerciseDays';
	import { trainingHistory, trainingsByExerciseDay } from '$lib/stores/trainingHistory';
	import { currentTraining, currentVolume, completionPercentage } from '$lib/stores/currentTraining';
	import { ui, type TabId, categoryToTab } from '$lib/stores/ui';

	import { getNextCategory, getLastTrainedDays } from '$lib/utils/rotation';
	import { calculateAverageVolume } from '$lib/utils/volume';

	import type { ExerciseDay, SetData } from '$lib/types';

	let showSaveConfirm = $state(false);
	let showResetConfirm = $state(false);
	let initialized = $state(false);

	// Get last trained days for header
	let lastTrainedDays = $derived(
		getLastTrainedDays($trainingHistory, $exerciseDays, 3)
	);

	// Get exercise day for current tab
	let currentExerciseDay = $derived(() => {
		const tab = $ui.activeTab;
		if (tab === 'statistics' || tab === 'history') return null;

		const category = tab === 'push' ? 'push' : tab === 'pull' ? 'pull' : 'legs';
		const daysForCategory = $exerciseDaysByCategory.get(category);
		return daysForCategory?.[0] || null;
	});

	// Get trainings for current exercise day
	let currentDayTrainings = $derived(() => {
		const day = currentExerciseDay();
		if (!day?.id) return [];
		return $trainingsByExerciseDay.get(day.id) || [];
	});

	// Calculate averages
	let lastVolume = $derived(() => {
		const trainings = currentDayTrainings();
		return trainings[0]?.totalVolume || 0;
	});

	let averageVolume = $derived(() => {
		const trainings = currentDayTrainings();
		return calculateAverageVolume(trainings.slice(0, 5));
	});

	// Start training when exercise day changes
	$effect(() => {
		const day = currentExerciseDay();
		if (day && (!$currentTraining.isActive || $currentTraining.exerciseDayId !== day.id)) {
			currentTraining.start(day);
		}
	});

	// Initialize: select next exercise day in rotation based on PUSH → PULL → LEGS cycle
	onMount(async () => {
		const lastTraining = await trainingHistory.getLast();

		let lastCategory: 'push' | 'pull' | 'legs' | null = null;
		if (lastTraining) {
			// Get the exercise day to find its category
			const lastExerciseDay = await exerciseDays.getById(lastTraining.exerciseDayId);
			if (lastExerciseDay && lastExerciseDay.category !== 'full-body') {
				lastCategory = lastExerciseDay.category as 'push' | 'pull' | 'legs';
			}
		}

		// Get next category in the cycle: PUSH → PULL → LEGS → PUSH...
		const nextCategory = getNextCategory(lastCategory);
		ui.setActiveTab(nextCategory);

		initialized = true;
	});

	function handleTabChange(tab: TabId) {
		if (tab === 'statistics') {
			goto('/statistics');
			return;
		}
		ui.setActiveTab(tab);
	}

	// Check if we're on the history tab
	let isHistoryTab = $derived($ui.activeTab === 'history');

	function handleUpdateSet(exerciseId: number, setNumber: number, updates: Partial<SetData>) {
		currentTraining.updateSet(exerciseId, setNumber, updates);
	}

	function handleSkipSet(exerciseId: number, setNumber: number) {
		currentTraining.skipSet(exerciseId, setNumber);
	}

	function handleUnskipSet(exerciseId: number, setNumber: number) {
		currentTraining.unskipSet(exerciseId, setNumber);
	}

	function handleFillFirst(exerciseId: number) {
		currentTraining.fillFirstValues(exerciseId);
	}

	function handleFillLast(exerciseId: number, lastSets: SetData[]) {
		currentTraining.fillLastValues(exerciseId, lastSets);
	}

	async function handleSave() {
		showSaveConfirm = false;
		await currentTraining.complete();

		// Switch to next category in the cycle: PUSH → PULL → LEGS → PUSH...
		const lastTraining = await trainingHistory.getLast();
		if (lastTraining) {
			const lastExerciseDay = await exerciseDays.getById(lastTraining.exerciseDayId);
			if (lastExerciseDay && lastExerciseDay.category !== 'full-body') {
				const nextCategory = getNextCategory(lastExerciseDay.category as 'push' | 'pull' | 'legs');
				ui.setActiveTab(nextCategory);
			}
		}
	}

	function handleReset() {
		showResetConfirm = false;
		currentTraining.reset();
	}

	function getExerciseSets(exerciseId: number): SetData[] {
		return currentTraining.getSetsForExercise($currentTraining, exerciseId);
	}

	function getFirstInputIdForExercise(exerciseId: number): string {
		return `input-${exerciseId}-1-weight`;
	}
</script>

<svelte:head>
	<title>Fitness Tracker</title>
</svelte:head>

<Header {lastTrainedDays} />

<TabNavigation activeTab={$ui.activeTab} onTabChange={handleTabChange} />

<main class="main-content">
	{#if !initialized}
		<div class="loading">
			<p>Lädt...</p>
		</div>
	{:else if isHistoryTab}
		<HistoryOverview />
	{:else if !currentExerciseDay()}
		<div class="empty-state">
			<p>Kein Trainingstag für diese Kategorie vorhanden.</p>
			<a href="/config/exercise-days">Trainingstag erstellen</a>
		</div>
	{:else}
		{@const sortedExercises = currentExerciseDay()!.exercises.sort((a, b) => a.position - b.position)}
		<div class="exercises-list">
			{#each sortedExercises as config, index}
				{@const exercise = $exercisesById.get(config.exerciseId)}
				{@const nextConfig = sortedExercises[index + 1]}
				{#if exercise}
					<ExerciseCard
						{exercise}
						sets={getExerciseSets(config.exerciseId)}
						trainings={currentDayTrainings()}
						onUpdateSet={(setNumber, updates) => handleUpdateSet(config.exerciseId, setNumber, updates)}
						onSkipSet={(setNumber) => handleSkipSet(config.exerciseId, setNumber)}
						onUnskipSet={(setNumber) => handleUnskipSet(config.exerciseId, setNumber)}
						onFillFirst={() => handleFillFirst(config.exerciseId)}
						onFillLast={(lastSets) => handleFillLast(config.exerciseId, lastSets)}
						cardIndex={index}
						isLastCard={index === sortedExercises.length - 1}
						nextExerciseFirstInputId={nextConfig ? getFirstInputIdForExercise(nextConfig.exerciseId) : undefined}
					/>
				{/if}
			{/each}
		</div>

		<div class="volume-section">
			<VolumeDisplay
				currentVolume={$currentVolume}
				lastVolume={lastVolume()}
				averageVolume={averageVolume()}
			/>
		</div>
	{/if}
</main>

{#if currentExerciseDay() && !isHistoryTab}
	<Footer
		onSave={() => showSaveConfirm = true}
		onReset={() => showResetConfirm = true}
		saveDisabled={$completionPercentage < 10}
		completionPercentage={$completionPercentage}
	/>
{/if}

<!-- Save Confirmation Modal -->
<Modal
	open={showSaveConfirm}
	title="Training speichern?"
	onclose={() => showSaveConfirm = false}
>
	<p>Möchtest du dieses Training speichern?</p>
	<p class="modal-stats">
		Volumen: <strong>{$currentVolume.toLocaleString('de-DE')} kg</strong>
	</p>

	{#snippet actions()}
		<Button variant="secondary" onclick={() => showSaveConfirm = false}>Abbrechen</Button>
		<Button variant="primary" onclick={handleSave}>Speichern</Button>
	{/snippet}
</Modal>

<!-- Reset Confirmation Modal -->
<Modal
	open={showResetConfirm}
	title="Zurücksetzen?"
	onclose={() => showResetConfirm = false}
>
	<p>Alle eingegebenen Werte werden gelöscht.</p>

	{#snippet actions()}
		<Button variant="secondary" onclick={() => showResetConfirm = false}>Abbrechen</Button>
		<Button variant="danger" onclick={handleReset}>Zurücksetzen</Button>
	{/snippet}
</Modal>

<style>
	.main-content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.exercises-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.volume-section {
		margin-top: auto;
		padding-top: 1rem;
	}

	.empty-state,
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 3rem 1rem;
		text-align: center;
		color: var(--color-text-secondary);
	}

	.empty-state a {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.modal-stats {
		margin-top: 0.5rem;
		color: var(--color-text-secondary);
	}

	.modal-stats strong {
		color: var(--color-primary);
	}
</style>
