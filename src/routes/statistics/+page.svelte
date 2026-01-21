<script lang="ts">
	import type { StatsTabId, TimeRange } from '$lib/types';

	// Existing components
	import VolumeChart from '$lib/components/statistics/VolumeChart.svelte';
	import MuscleGroupChart from '$lib/components/statistics/MuscleGroupChart.svelte';
	import PersonalRecords from '$lib/components/statistics/PersonalRecords.svelte';
	import WorkoutFrequency from '$lib/components/statistics/WorkoutFrequency.svelte';

	// New components - Shared
	import StatisticsTabs from '$lib/components/statistics/StatisticsTabs.svelte';
	import ProgressSummary from '$lib/components/statistics/ProgressSummary.svelte';

	// New components - Exercise Day Tab
	import ExerciseDaySelector from '$lib/components/statistics/ExerciseDaySelector.svelte';
	import ExerciseDayVolumeChart from '$lib/components/statistics/ExerciseDayVolumeChart.svelte';
	import TopExercisesBreakdown from '$lib/components/statistics/TopExercisesBreakdown.svelte';
	import ExerciseDayInsights from '$lib/components/statistics/ExerciseDayInsights.svelte';

	// New components - Exercise Tab
	import ExerciseSelector from '$lib/components/statistics/ExerciseSelector.svelte';
	import ExerciseProgressChart from '$lib/components/statistics/ExerciseProgressChart.svelte';
	import SetBySetProgression from '$lib/components/statistics/SetBySetProgression.svelte';
	import ExercisePRComparison from '$lib/components/statistics/ExercisePRComparison.svelte';

	// Stores
	import { trainingHistory } from '$lib/stores/trainingHistory';
	import { exercises, exercisesById } from '$lib/stores/exercises';
	import { exerciseDays } from '$lib/stores/exerciseDays';

	// Utils
	import {
		calculateTrainingStats,
		calculateVolumeByCategory,
		calculateExerciseDayVolumeHistory,
		getTopExercisesByVolume,
		getTopImprovers,
		getExercisesNeedingAttention,
		getNextSessionRecommendation,
		countPRsInPeriod,
		calculateExerciseProgressTrend
	} from '$lib/utils/statistics';

	// State
	let activeTab: StatsTabId = $state('overview');
	let selectedDayId: number | null = $state(null);
	let selectedExerciseId: number | null = $state(null);

	// Initialize selected day when exercise days load
	$effect(() => {
		if ($exerciseDays.length > 0 && selectedDayId === null) {
			selectedDayId = $exerciseDays[0].id!;
		}
	});

	// Initialize selected exercise when exercises load
	$effect(() => {
		if ($exercises.length > 0 && selectedExerciseId === null) {
			selectedExerciseId = $exercises[0].id!;
		}
	});

	// Computed values for Overview tab
	let trainingStats = $derived(calculateTrainingStats($trainingHistory));
	let volumeByCategory = $derived(calculateVolumeByCategory($trainingHistory, $exercisesById));
	let topImprovers = $derived(getTopImprovers($trainingHistory, $exercises));
	let needsAttention = $derived(getExercisesNeedingAttention($trainingHistory, $exercises));
	let nextRecommendation = $derived(
		getNextSessionRecommendation($trainingHistory, $exerciseDays, $exercises, $exercisesById)
	);

	// Computed values for Exercise Day tab
	let selectedDay = $derived($exerciseDays.find(d => d.id === selectedDayId));
	let dayVolumeHistory = $derived(
		selectedDayId ? calculateExerciseDayVolumeHistory($trainingHistory, selectedDayId, 90) : []
	);
	let dayTopExercises = $derived(
		selectedDayId ? getTopExercisesByVolume($trainingHistory, selectedDayId, $exercisesById) : []
	);
	let dayPRsThisMonth = $derived(
		selectedDayId
			? countPRsInPeriod($trainingHistory, selectedDayId, Date.now() - 30 * 24 * 60 * 60 * 1000)
			: 0
	);
	let dayFocusExercise = $derived.by(() => {
		if (!selectedDayId) return null;
		const dayTrainings = $trainingHistory.filter(t => t.exerciseDayId === selectedDayId);
		const dayExercises = selectedDay?.exercises || [];

		for (const config of dayExercises) {
			const exercise = $exercisesById.get(config.exerciseId);
			if (!exercise) continue;

			const trend = calculateExerciseProgressTrend(dayTrainings, config.exerciseId, exercise.name);
			if (trend.trend === 'declining' || (trend.trend === 'stable' && trend.sessionCount >= 5)) {
				return trend;
			}
		}
		return null;
	});

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'push': return '#ef4444';
			case 'pull': return '#3b82f6';
			case 'legs': return '#22c55e';
			case 'full-body': return '#8b5cf6';
			default: return '#14b8a6';
		}
	}

	function handleTabChange(tab: StatsTabId) {
		activeTab = tab;
	}

	function handleDaySelect(id: number) {
		selectedDayId = id;
	}

	function handleExerciseSelect(id: number) {
		selectedExerciseId = id;
	}

	function handleExerciseClick(exerciseId: number) {
		selectedExerciseId = exerciseId;
		activeTab = 'exercises';
	}
</script>

<svelte:head>
	<title>Statistik - Fitness Tracker</title>
</svelte:head>

<div class="statistics-page">
	<header class="page-header">
		<a href="/" class="back-btn" aria-label="Zurück">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
		</a>
		<h1>Statistik</h1>
	</header>

	<main class="statistics-content">
		<StatisticsTabs activeTab={activeTab} onchange={handleTabChange} />

		{#if activeTab === 'overview'}
			<!-- Overview Tab -->
			<section class="stat-section">
				<h2>Trainingsübersicht</h2>
				<WorkoutFrequency stats={trainingStats} />
			</section>

			<section class="stat-section">
				<h2>Fortschritts-Zusammenfassung</h2>
				<ProgressSummary
					topImprover={topImprovers[0] || null}
					needsAttention={needsAttention[0] || null}
					nextFocus={nextRecommendation}
				/>
			</section>

			<section class="stat-section">
				<h2>Volumen-Verlauf</h2>
				<div class="chart-card">
					{#if $trainingHistory.length > 0}
						<VolumeChart trainings={$trainingHistory} showTimeRange={true} />
					{:else}
						<div class="no-data">Noch keine Trainingsdaten vorhanden.</div>
					{/if}
				</div>
			</section>

			<section class="stat-section">
				<h2>Muskelgruppen-Verteilung</h2>
				<div class="chart-card">
					<MuscleGroupChart {volumeByCategory} />
				</div>
			</section>

			<section class="stat-section">
				<h2>Bestleistungen</h2>
				<PersonalRecords exercises={$exercises} trainings={$trainingHistory} />
			</section>

		{:else if activeTab === 'exercise-days'}
			<!-- Exercise Days Tab -->
			{#if $exerciseDays.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					</div>
					<p>Keine Trainingstage konfiguriert</p>
					<a href="/config" class="empty-action">Trainingstage erstellen</a>
				</div>
			{:else}
				<section class="stat-section">
					<ExerciseDaySelector
						exerciseDays={$exerciseDays}
						selectedId={selectedDayId}
						onselect={handleDaySelect}
					/>
				</section>

				{#if selectedDayId && dayVolumeHistory.length > 0}
					<section class="stat-section">
						<div class="chart-card">
							<ExerciseDayVolumeChart
								data={dayVolumeHistory}
								categoryColor={selectedDay ? getCategoryColor(selectedDay.category) : '#14b8a6'}
							/>
						</div>
					</section>

					<section class="stat-section">
						<ExerciseDayInsights
							volumeData={dayVolumeHistory}
							prsThisMonth={dayPRsThisMonth}
							focusExercise={dayFocusExercise}
						/>
					</section>

					<section class="stat-section">
						<div class="chart-card">
							<TopExercisesBreakdown
								exercises={dayTopExercises}
								onexerciseclick={handleExerciseClick}
							/>
						</div>
					</section>
				{:else if selectedDayId}
					<div class="empty-state">
						<div class="empty-icon">
							<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M3 3v18h18"></path>
								<path d="M18 17V9"></path>
								<path d="M13 17V5"></path>
								<path d="M8 17v-3"></path>
							</svg>
						</div>
						<p>Noch keine Trainings für diesen Tag</p>
					</div>
				{/if}
			{/if}

		{:else if activeTab === 'exercises'}
			<!-- Exercises Tab -->
			{#if $exercises.length === 0}
				<div class="empty-state">
					<div class="empty-icon">
						<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M6.5 6.5h11a1 1 0 011 1v9a1 1 0 01-1 1h-11a1 1 0 01-1-1v-9a1 1 0 011-1z"></path>
							<path d="M4 9h2M18 9h2M4 15h2M18 15h2"></path>
						</svg>
					</div>
					<p>Keine Übungen konfiguriert</p>
					<a href="/config" class="empty-action">Übungen erstellen</a>
				</div>
			{:else}
				<section class="stat-section">
					<ExerciseSelector
						exercises={$exercises}
						exerciseDays={$exerciseDays}
						selectedId={selectedExerciseId}
						onselect={handleExerciseSelect}
					/>
				</section>

				{#if selectedExerciseId}
					{@const hasData = $trainingHistory.some(t =>
						t.sets.some(s => s.exerciseId === selectedExerciseId)
					)}

					{#if hasData}
						<section class="stat-section">
							<div class="chart-card">
								<ExerciseProgressChart
									trainings={$trainingHistory}
									exerciseId={selectedExerciseId}
								/>
							</div>
						</section>

						<section class="stat-section">
							<div class="chart-card">
								<ExercisePRComparison
									trainings={$trainingHistory}
									exerciseId={selectedExerciseId}
								/>
							</div>
						</section>

						<section class="stat-section">
							<div class="chart-card">
								<SetBySetProgression
									trainings={$trainingHistory}
									exerciseId={selectedExerciseId}
								/>
							</div>
						</section>
					{:else}
						<div class="empty-state">
							<div class="empty-icon">
								<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M3 3v18h18"></path>
									<path d="M18 17V9"></path>
									<path d="M13 17V5"></path>
									<path d="M8 17v-3"></path>
								</svg>
							</div>
							<p>Noch keine Daten für diese Übung</p>
						</div>
					{/if}
				{/if}
			{/if}
		{/if}
	</main>
</div>

<style>
	.statistics-page {
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

	.statistics-content {
		flex: 1;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.stat-section h2 {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.75rem;
	}

	.chart-card {
		background: var(--color-surface);
		border-radius: 12px;
		border: 1px solid var(--color-border);
		padding: 1rem;
	}

	.no-data {
		text-align: center;
		padding: 2rem 1rem;
		color: var(--color-text-muted);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		text-align: center;
		gap: 1rem;
	}

	.empty-icon {
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.empty-state p {
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
	}

	.empty-action {
		padding: 0.625rem 1.25rem;
		background: var(--color-primary);
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 8px;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.empty-action:hover {
		opacity: 0.9;
	}
</style>
