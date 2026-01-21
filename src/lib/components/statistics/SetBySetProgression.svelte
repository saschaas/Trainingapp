<script lang="ts">
	import type { Training, SetProgressionData } from '$lib/types';
	import { calculateSetProgression, getExerciseSetNumbers } from '$lib/utils/statistics';
	import MiniSparkline from '$lib/components/shared/MiniSparkline.svelte';
	import TrendIndicator from '$lib/components/shared/TrendIndicator.svelte';

	interface Props {
		trainings: Training[];
		exerciseId: number;
	}

	let { trainings, exerciseId }: Props = $props();

	let expandedSet: number | null = $state(null);

	let setNumbers = $derived(getExerciseSetNumbers(trainings, exerciseId));

	let setData = $derived.by(() => {
		const data = new Map<number, { progression: SetProgressionData[]; trend: 'improving' | 'stable' | 'declining' }>();

		for (const setNum of setNumbers) {
			const progression = calculateSetProgression(trainings, exerciseId, setNum);

			// Calculate trend
			let trend: 'improving' | 'stable' | 'declining' = 'stable';
			if (progression.length >= 3) {
				const recent = progression.slice(-3);
				const older = progression.slice(-6, -3);

				if (older.length > 0) {
					const recentAvg = recent.reduce((sum, d) => sum + d.weight, 0) / recent.length;
					const olderAvg = older.reduce((sum, d) => sum + d.weight, 0) / older.length;
					const change = ((recentAvg - olderAvg) / olderAvg) * 100;

					if (change > 3) trend = 'improving';
					else if (change < -3) trend = 'declining';
				}
			}

			data.set(setNum, { progression, trend });
		}

		return data;
	});

	function toggleSet(setNum: number) {
		expandedSet = expandedSet === setNum ? null : setNum;
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
	}
</script>

<div class="progression-container">
	<h3 class="section-title">Satz-Progression</h3>

	{#if setNumbers.length === 0}
		<div class="no-data">Keine Satzdaten vorhanden</div>
	{:else}
		<div class="set-list">
			{#each setNumbers as setNum}
				{@const data = setData.get(setNum)}
				{#if data && data.progression.length > 0}
					<div class="set-item" class:expanded={expandedSet === setNum}>
						<button
							class="set-header"
							onclick={() => toggleSet(setNum)}
							type="button"
						>
							<div class="set-info">
								<span class="set-label">Satz {setNum}</span>
								<TrendIndicator trend={data.trend} size="sm" />
							</div>
							<div class="set-preview">
								<MiniSparkline
									data={data.progression.map(p => p.weight)}
									width={60}
									height={20}
									color={data.trend === 'improving' ? '#22c55e' : data.trend === 'declining' ? '#ef4444' : '#14b8a6'}
								/>
								<span class="current-weight">
									{data.progression[data.progression.length - 1]?.weight || 0} kg
								</span>
							</div>
							<svg
								class="chevron"
								class:open={expandedSet === setNum}
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						</button>

						{#if expandedSet === setNum}
							<div class="set-details">
								<div class="detail-header">
									<span>Datum</span>
									<span>Gewicht</span>
									<span>Wdh.</span>
									<span>Volumen</span>
								</div>
								{#each data.progression.slice(-10).reverse() as entry}
									<div class="detail-row">
										<span>{formatDate(entry.date)}</span>
										<span>{entry.weight} kg</span>
										<span>{entry.reps}</span>
										<span>{entry.volume} kg</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.progression-container {
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

	.set-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.set-item {
		background: var(--color-surface-elevated, #1a1a2e);
		border: 1px solid var(--color-border, #2a2a45);
		border-radius: 10px;
		overflow: hidden;
	}

	.set-item.expanded {
		border-color: var(--color-primary, #14b8a6);
	}

	.set-header {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: none;
		border: none;
		color: var(--color-text, #ffffff);
		cursor: pointer;
	}

	.set-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.set-label {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.set-preview {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.current-weight {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary, #a0a0b0);
		min-width: 60px;
		text-align: right;
	}

	.chevron {
		color: var(--color-text-muted, #606070);
		transition: transform 0.2s ease;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.set-details {
		padding: 0 0.75rem 0.75rem;
		border-top: 1px solid var(--color-border, #2a2a45);
	}

	.detail-header {
		display: grid;
		grid-template-columns: 1fr 1fr 0.5fr 1fr;
		gap: 0.5rem;
		padding: 0.625rem 0;
		font-size: 0.6875rem;
		font-weight: 600;
		color: var(--color-text-muted, #606070);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		border-bottom: 1px solid var(--color-border, #2a2a45);
	}

	.detail-row {
		display: grid;
		grid-template-columns: 1fr 1fr 0.5fr 1fr;
		gap: 0.5rem;
		padding: 0.5rem 0;
		font-size: 0.8125rem;
		color: var(--color-text-secondary, #a0a0b0);
		border-bottom: 1px solid var(--color-border, #2a2a45);
	}

	.detail-row:last-child {
		border-bottom: none;
	}
</style>
