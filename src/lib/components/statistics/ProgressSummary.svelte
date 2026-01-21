<script lang="ts">
	import type { ProgressTrend, NextSessionRecommendation } from '$lib/types';
	import TrendIndicator from '$lib/components/shared/TrendIndicator.svelte';

	interface Props {
		topImprover: ProgressTrend | null;
		needsAttention: ProgressTrend | null;
		nextFocus: NextSessionRecommendation;
	}

	let { topImprover, needsAttention, nextFocus }: Props = $props();

	function formatDate(timestamp: number | null): string {
		if (!timestamp) return '-';
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
	}
</script>

<div class="progress-summary">
	<div class="summary-card success">
		<div class="card-icon">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
				<polyline points="17 6 23 6 23 12"></polyline>
			</svg>
		</div>
		<div class="card-content">
			<span class="card-label">Top Performer</span>
			{#if topImprover}
				<span class="card-value">{topImprover.exerciseName}</span>
				<div class="card-detail">
					<TrendIndicator
						trend={topImprover.trend}
						percentageChange={topImprover.percentageChange}
					/>
				</div>
			{:else}
				<span class="card-value muted">Noch keine Daten</span>
			{/if}
		</div>
	</div>

	<div class="summary-card warning">
		<div class="card-icon">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
		</div>
		<div class="card-content">
			<span class="card-label">Braucht Aufmerksamkeit</span>
			{#if needsAttention}
				<span class="card-value">{needsAttention.exerciseName}</span>
				<div class="card-detail">
					<TrendIndicator
						trend={needsAttention.trend}
						percentageChange={needsAttention.percentageChange}
					/>
				</div>
			{:else}
				<span class="card-value muted">Alles gut!</span>
			{/if}
		</div>
	</div>

	<div class="summary-card info">
		<div class="card-icon">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"></circle>
				<circle cx="12" cy="12" r="6"></circle>
				<circle cx="12" cy="12" r="2"></circle>
			</svg>
		</div>
		<div class="card-content">
			<span class="card-label">Nächster Fokus</span>
			{#if nextFocus.exerciseDay}
				<span class="card-value">{nextFocus.exerciseDay.name}</span>
				{#if nextFocus.focusExercises.length > 0}
					<span class="card-detail text">
						{nextFocus.focusExercises[0].exerciseName}
					</span>
				{:else}
					<span class="card-detail text muted">Keine spez. Empfehlung</span>
				{/if}
			{:else}
				<span class="card-value muted">Keine Tage konfiguriert</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.progress-summary {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.75rem;
	}

	@media (max-width: 640px) {
		.progress-summary {
			grid-template-columns: 1fr;
		}
	}

	.summary-card {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		background: var(--color-surface, #12121f);
		border: 1px solid var(--color-border, #2a2a45);
		border-radius: 12px;
	}

	.card-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.summary-card.success .card-icon {
		background: rgba(34, 197, 94, 0.15);
		color: #22c55e;
	}

	.summary-card.warning .card-icon {
		background: rgba(245, 158, 11, 0.15);
		color: #f59e0b;
	}

	.summary-card.info .card-icon {
		background: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.card-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-muted, #606070);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.card-value {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--color-text, #ffffff);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.card-value.muted {
		color: var(--color-text-muted, #606070);
		font-weight: 500;
	}

	.card-detail {
		font-size: 0.75rem;
	}

	.card-detail.text {
		color: var(--color-text-secondary, #a0a0b0);
	}

	.card-detail.text.muted {
		color: var(--color-text-muted, #606070);
	}
</style>
