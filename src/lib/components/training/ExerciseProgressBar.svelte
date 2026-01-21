<script lang="ts">
	import { formatVolume } from '$lib/utils/volume';

	interface Props {
		currentVolume: number;
		lastVolume: number;
		averageVolume: number;
	}

	let { currentVolume, lastVolume, averageVolume }: Props = $props();

	let maxVolume = $derived(Math.max(currentVolume, lastVolume, averageVolume, 1));
	let currentPercent = $derived((currentVolume / maxVolume) * 100);
	let lastPercent = $derived((lastVolume / maxVolume) * 100);
	let avgPercent = $derived((averageVolume / maxVolume) * 100);
</script>

<div class="progress-container">
	<div class="progress-track">
		<!-- Average marker -->
		{#if averageVolume > 0}
			<div class="marker avg-marker" style="left: {avgPercent}%">
				<span class="marker-label">Ø</span>
			</div>
		{/if}

		<!-- Last session marker -->
		{#if lastVolume > 0}
			<div class="marker last-marker" style="left: {lastPercent}%">
				<span class="marker-label">L</span>
			</div>
		{/if}

		<!-- Current progress bar -->
		<div
			class="progress-fill"
			class:exceeds-avg={currentVolume > averageVolume}
			class:exceeds-last={currentVolume > lastVolume}
			style="width: {currentPercent}%"
		></div>
	</div>

	<div class="progress-labels">
		<span class="label current">{formatVolume(currentVolume)}</span>
		{#if lastVolume > 0}
			<span class="label last">/ {formatVolume(lastVolume)}</span>
		{/if}
		{#if averageVolume > 0}
			<span class="label avg">/ Ø {formatVolume(averageVolume)}</span>
		{/if}
	</div>
</div>

<style>
	.progress-container {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.progress-track {
		position: relative;
		height: 8px;
		background: var(--color-surface-dark);
		border-radius: 4px;
		overflow: visible;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.progress-fill.exceeds-avg {
		background: var(--color-success);
	}

	.marker {
		position: absolute;
		top: -4px;
		bottom: -4px;
		width: 2px;
		transform: translateX(-50%);
	}

	.avg-marker {
		background: var(--color-warning);
	}

	.last-marker {
		background: var(--color-text-muted);
	}

	.marker-label {
		position: absolute;
		top: -14px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.5rem;
		font-weight: 600;
		color: inherit;
	}

	.avg-marker .marker-label {
		color: var(--color-warning);
	}

	.last-marker .marker-label {
		color: var(--color-text-muted);
	}

	.progress-labels {
		display: flex;
		gap: 0.25rem;
		font-size: 0.75rem;
	}

	.label.current {
		color: var(--color-text);
		font-weight: 500;
	}

	.label.last {
		color: var(--color-text-muted);
	}

	.label.avg {
		color: var(--color-text-secondary);
	}
</style>
