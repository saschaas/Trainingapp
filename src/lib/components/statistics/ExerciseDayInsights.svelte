<script lang="ts">
	import type { ExerciseDayVolumeData, ProgressTrend } from '$lib/types';
	import TrendIndicator from '$lib/components/shared/TrendIndicator.svelte';

	interface Props {
		volumeData: ExerciseDayVolumeData[];
		prsThisMonth: number;
		focusExercise: ProgressTrend | null;
	}

	let { volumeData, prsThisMonth, focusExercise }: Props = $props();

	// Calculate volume trend from last 5 sessions
	let volumeTrend = $derived.by(() => {
		if (volumeData.length < 2) {
			return { trend: 'stable' as const, percentageChange: 0 };
		}

		const recent = volumeData.slice(-5);
		const older = volumeData.slice(-10, -5);

		if (older.length === 0) {
			return { trend: 'stable' as const, percentageChange: 0 };
		}

		const recentAvg = recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;
		const olderAvg = older.reduce((sum, d) => sum + d.volume, 0) / older.length;

		const percentageChange = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

		let trend: 'improving' | 'stable' | 'declining';
		if (percentageChange > 3) {
			trend = 'improving';
		} else if (percentageChange < -3) {
			trend = 'declining';
		} else {
			trend = 'stable';
		}

		return { trend, percentageChange };
	});
</script>

<div class="insights-container">
	<div class="insight-card">
		<div class="insight-icon trend">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
			</svg>
		</div>
		<div class="insight-content">
			<span class="insight-label">Trend</span>
			<div class="insight-value">
				<TrendIndicator
					trend={volumeTrend.trend}
					percentageChange={volumeTrend.percentageChange}
					showLabel={true}
				/>
			</div>
		</div>
	</div>

	<div class="insight-card">
		<div class="insight-icon prs">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
			</svg>
		</div>
		<div class="insight-content">
			<span class="insight-label">PRs diesen Monat</span>
			<span class="insight-value highlight">{prsThisMonth}</span>
		</div>
	</div>

	<div class="insight-card">
		<div class="insight-icon focus">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"></circle>
				<circle cx="12" cy="12" r="6"></circle>
				<circle cx="12" cy="12" r="2"></circle>
			</svg>
		</div>
		<div class="insight-content">
			<span class="insight-label">Fokus nächstes Mal</span>
			{#if focusExercise}
				<span class="insight-value small">{focusExercise.exerciseName}</span>
			{:else}
				<span class="insight-value muted">Alle gut!</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.insights-container {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 480px) {
		.insights-container {
			grid-template-columns: 1fr;
		}
	}

	.insight-card {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.875rem;
		background: var(--color-surface-elevated, #1a1a2e);
		border: 1px solid var(--color-border, #2a2a45);
		border-radius: 10px;
	}

	.insight-icon {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		flex-shrink: 0;
	}

	.insight-icon.trend {
		background: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
	}

	.insight-icon.prs {
		background: rgba(251, 191, 36, 0.15);
		color: #fbbf24;
	}

	.insight-icon.focus {
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
	}

	.insight-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.insight-label {
		font-size: 0.6875rem;
		font-weight: 500;
		color: var(--color-text-muted, #606070);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.insight-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text, #ffffff);
	}

	.insight-value.highlight {
		color: #fbbf24;
	}

	.insight-value.small {
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.insight-value.muted {
		color: var(--color-text-muted, #606070);
		font-weight: 500;
	}
</style>
