<script lang="ts">
	import type { Exercise, Training } from '$lib/types';
	import { getPersonalRecords } from '$lib/utils/statistics';
	import { formatVolume } from '$lib/utils/volume';

	interface Props {
		exercises: Exercise[];
		trainings: Training[];
	}

	let { exercises, trainings }: Props = $props();

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// Get top 5 exercises by max weight
	let topRecords = $derived(() => {
		const records = exercises
			.map(ex => ({
				exercise: ex,
				records: getPersonalRecords(trainings, ex.id!)
			}))
			.filter(r => r.records.weight !== null)
			.sort((a, b) => (b.records.weight?.value || 0) - (a.records.weight?.value || 0))
			.slice(0, 5);

		return records;
	});
</script>

<div class="records-list">
	{#if topRecords().length === 0}
		<div class="no-data">Noch keine Bestleistungen vorhanden.</div>
	{:else}
		{#each topRecords() as record}
			<div class="record-item">
				<div class="record-exercise">{record.exercise.name}</div>
				<div class="record-details">
					{#if record.records.weight}
						<div class="record-stat">
							<span class="stat-value">{record.records.weight.value} kg</span>
							<span class="stat-label">Max. Gewicht</span>
							<span class="stat-date">{formatDate(record.records.weight.date)}</span>
						</div>
					{/if}
					{#if record.records.volume}
						<div class="record-stat">
							<span class="stat-value">{formatVolume(record.records.volume.value)} kg</span>
							<span class="stat-label">Max. Volumen</span>
							<span class="stat-date">{formatDate(record.records.volume.date)}</span>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.records-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.no-data {
		text-align: center;
		padding: 1.5rem;
		color: var(--color-text-muted);
	}

	.record-item {
		padding: 0.75rem;
		background: var(--color-surface-dark);
		border-radius: 8px;
	}

	.record-exercise {
		font-weight: 500;
		color: var(--color-text);
		margin-bottom: 0.5rem;
	}

	.record-details {
		display: flex;
		gap: 1.5rem;
	}

	.record-stat {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: 0.625rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.stat-date {
		font-size: 0.625rem;
		color: var(--color-text-secondary);
	}
</style>
