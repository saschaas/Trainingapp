<script lang="ts">
	import type { TrainingStats } from '$lib/types';
	import { formatVolume } from '$lib/utils/volume';

	interface Props {
		stats: TrainingStats;
	}

	let { stats }: Props = $props();
</script>

<div class="frequency-stats">
	<div class="stat-card">
		<span class="stat-value">{stats.totalSessions}</span>
		<span class="stat-label">Trainings gesamt</span>
	</div>

	<div class="stat-card">
		<span class="stat-value">{stats.sessionsThisWeek}</span>
		<span class="stat-label">Diese Woche</span>
	</div>

	<div class="stat-card">
		<span class="stat-value">{stats.sessionsThisMonth}</span>
		<span class="stat-label">Dieser Monat</span>
	</div>

	<div class="stat-card highlight">
		<span class="stat-value">{stats.currentStreak}</span>
		<span class="stat-label">Aktuelle Serie</span>
	</div>

	<div class="stat-card">
		<span class="stat-value">{stats.longestStreak}</span>
		<span class="stat-label">Längste Serie</span>
	</div>

	<div class="stat-card">
		<span class="stat-value">{formatVolume(stats.avgVolumePerSession)}</span>
		<span class="stat-label">Ø Volumen/Training</span>
	</div>
</div>

<style>
	.frequency-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
	}

	.stat-card {
		padding: 1rem;
		background: var(--color-surface-dark);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-card.highlight {
		background: var(--color-primary);
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		text-align: center;
	}

	.stat-card.highlight .stat-label {
		color: rgba(255, 255, 255, 0.8);
	}
</style>
