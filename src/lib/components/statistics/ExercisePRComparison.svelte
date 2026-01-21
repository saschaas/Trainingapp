<script lang="ts">
	import type { Training } from '$lib/types';
	import { getPersonalRecords } from '$lib/utils/statistics';
	import { formatVolume } from '$lib/utils/volume';

	interface Props {
		trainings: Training[];
		exerciseId: number;
	}

	let { trainings, exerciseId }: Props = $props();

	let prs = $derived(getPersonalRecords(trainings, exerciseId));

	// Get current (most recent) values
	let currentValues = $derived.by(() => {
		const relevantTraining = trainings.find(t =>
			t.sets.some(s => s.exerciseId === exerciseId)
		);

		if (!relevantTraining) {
			return { weight: 0, volume: 0 };
		}

		let maxWeight = 0;
		let volume = 0;

		for (const set of relevantTraining.sets) {
			if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null && set.repetitions !== null) {
				maxWeight = Math.max(maxWeight, set.weight);
				volume += set.weight * set.repetitions;
			}
		}

		return { weight: maxWeight, volume };
	});

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	function getPercentage(current: number, best: number): number {
		if (best === 0) return 0;
		return Math.round((current / best) * 100);
	}
</script>

<div class="pr-comparison">
	<h3 class="section-title">Bestleistungen</h3>

	{#if !prs.weight && !prs.volume}
		<div class="no-data">Noch keine PRs erfasst</div>
	{:else}
		<div class="pr-cards">
			{#if prs.weight}
				<div class="pr-card">
					<div class="pr-icon weight">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M6.5 6.5h11a1 1 0 011 1v9a1 1 0 01-1 1h-11a1 1 0 01-1-1v-9a1 1 0 011-1z"></path>
							<path d="M4 9h2M18 9h2M4 15h2M18 15h2"></path>
						</svg>
					</div>
					<div class="pr-content">
						<span class="pr-label">Max. Gewicht</span>
						<div class="pr-values">
							<span class="pr-best">{prs.weight.value} kg</span>
							<span class="pr-date">{formatDate(prs.weight.date)}</span>
						</div>
						<div class="pr-comparison-bar">
							<div class="comparison-track">
								<div
									class="comparison-fill"
									style="width: {getPercentage(currentValues.weight, prs.weight.value)}%"
								></div>
							</div>
							<span class="comparison-text">
								Aktuell: {currentValues.weight} kg ({getPercentage(currentValues.weight, prs.weight.value)}%)
							</span>
						</div>
					</div>
				</div>
			{/if}

			{#if prs.volume}
				<div class="pr-card">
					<div class="pr-icon volume">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M3 3v18h18"></path>
							<path d="M18 17V9"></path>
							<path d="M13 17V5"></path>
							<path d="M8 17v-3"></path>
						</svg>
					</div>
					<div class="pr-content">
						<span class="pr-label">Max. Volumen</span>
						<div class="pr-values">
							<span class="pr-best">{formatVolume(prs.volume.value)} kg</span>
							<span class="pr-date">{formatDate(prs.volume.date)}</span>
						</div>
						<div class="pr-comparison-bar">
							<div class="comparison-track">
								<div
									class="comparison-fill volume-fill"
									style="width: {getPercentage(currentValues.volume, prs.volume.value)}%"
								></div>
							</div>
							<span class="comparison-text">
								Aktuell: {formatVolume(currentValues.volume)} kg ({getPercentage(currentValues.volume, prs.volume.value)}%)
							</span>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.pr-comparison {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary, #a0a0b0);
	}

	.no-data {
		text-align: center;
		padding: 1.5rem;
		color: var(--color-text-muted, #606070);
		font-size: 0.875rem;
	}

	.pr-cards {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.pr-card {
		display: flex;
		gap: 0.875rem;
		padding: 1rem;
		background: var(--color-surface-elevated, #1a1a2e);
		border: 1px solid var(--color-border, #2a2a45);
		border-radius: 10px;
	}

	.pr-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.pr-icon.weight {
		background: rgba(251, 191, 36, 0.15);
		color: #fbbf24;
	}

	.pr-icon.volume {
		background: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
	}

	.pr-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.pr-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-muted, #606070);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.pr-values {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.pr-best {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text, #ffffff);
	}

	.pr-date {
		font-size: 0.75rem;
		color: var(--color-text-muted, #606070);
	}

	.pr-comparison-bar {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 0.25rem;
	}

	.comparison-track {
		height: 4px;
		background: var(--color-surface, #12121f);
		border-radius: 2px;
		overflow: hidden;
	}

	.comparison-fill {
		height: 100%;
		background: #fbbf24;
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.comparison-fill.volume-fill {
		background: #3b82f6;
	}

	.comparison-text {
		font-size: 0.6875rem;
		color: var(--color-text-muted, #606070);
	}
</style>
