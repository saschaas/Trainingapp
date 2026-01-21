<script lang="ts">
	import { formatVolume, getVolumeComparisonText } from '$lib/utils/volume';

	interface Props {
		currentVolume: number;
		lastVolume: number;
		averageVolume: number;
	}

	let { currentVolume, lastVolume, averageVolume }: Props = $props();

	let comparisonToLast = $derived(
		lastVolume > 0 ? getVolumeComparisonText(currentVolume, lastVolume) : null
	);

	let comparisonToAvg = $derived(
		averageVolume > 0 ? getVolumeComparisonText(currentVolume, averageVolume) : null
	);
</script>

<div class="volume-display">
	<div class="volume-main">
		<span class="volume-label">Gesamt-Volumen</span>
		<span class="volume-value">{formatVolume(currentVolume)} kg</span>
	</div>

	<div class="volume-comparisons">
		{#if lastVolume > 0}
			<div class="comparison">
				<span class="comparison-label">vs. Letztes</span>
				<span class="comparison-value" class:positive={currentVolume > lastVolume} class:negative={currentVolume < lastVolume}>
					{comparisonToLast}
				</span>
			</div>
		{/if}

		{#if averageVolume > 0}
			<div class="comparison">
				<span class="comparison-label">vs. Durchschnitt</span>
				<span class="comparison-value" class:positive={currentVolume > averageVolume} class:negative={currentVolume < averageVolume}>
					{comparisonToAvg}
				</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.volume-display {
		background: var(--color-surface);
		border-radius: 12px;
		padding: 1rem;
		border: 1px solid var(--color-border);
	}

	.volume-main {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 0.75rem;
	}

	.volume-label {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.volume-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.volume-comparisons {
		display: flex;
		gap: 1.5rem;
	}

	.comparison {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.comparison-label {
		font-size: 0.75rem;
		color: var(--color-text-muted);
	}

	.comparison-value {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.comparison-value.positive {
		color: var(--color-success);
	}

	.comparison-value.negative {
		color: var(--color-danger);
	}
</style>
