<script lang="ts">
	import VolumeChart from '$lib/components/statistics/VolumeChart.svelte';
	import MuscleGroupChart from '$lib/components/statistics/MuscleGroupChart.svelte';
	import PersonalRecords from '$lib/components/statistics/PersonalRecords.svelte';
	import WorkoutFrequency from '$lib/components/statistics/WorkoutFrequency.svelte';

	import { trainingHistory } from '$lib/stores/trainingHistory';
	import { exercises, exercisesById } from '$lib/stores/exercises';

	import { calculateTrainingStats, calculateVolumeByCategory } from '$lib/utils/statistics';

	let trainingStats = $derived(calculateTrainingStats($trainingHistory));
	let volumeByCategory = $derived(calculateVolumeByCategory($trainingHistory, $exercisesById));
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
		<section class="stat-section">
			<h2>Trainingsübersicht</h2>
			<WorkoutFrequency stats={trainingStats} />
		</section>

		<section class="stat-section">
			<h2>Volumen-Verlauf</h2>
			<div class="chart-card">
				{#if $trainingHistory.length > 0}
					<VolumeChart trainings={$trainingHistory} limit={20} />
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
</style>
