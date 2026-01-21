<script lang="ts">
	interface Props {
		trend: 'improving' | 'stable' | 'declining';
		percentageChange?: number;
		showLabel?: boolean;
		size?: 'sm' | 'md' | 'lg';
	}

	let { trend, percentageChange, showLabel = false, size = 'md' }: Props = $props();

	const trendConfig = {
		improving: { label: 'Steigend', color: 'var(--color-success, #22c55e)' },
		stable: { label: 'Stabil', color: 'var(--color-warning, #f59e0b)' },
		declining: { label: 'Rückläufig', color: 'var(--color-error, #ef4444)' }
	};

	let config = $derived(trendConfig[trend]);
</script>

<div class="trend-indicator {size}" style="--trend-color: {config.color}">
	<span class="arrow" class:up={trend === 'improving'} class:flat={trend === 'stable'} class:down={trend === 'declining'}>
		{#if trend === 'improving'}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="18 15 12 9 6 15"></polyline>
			</svg>
		{:else if trend === 'declining'}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		{:else}
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<line x1="5" y1="12" x2="19" y2="12"></line>
			</svg>
		{/if}
	</span>
	{#if percentageChange !== undefined}
		<span class="percentage">{percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}%</span>
	{/if}
	{#if showLabel}
		<span class="label">{config.label}</span>
	{/if}
</div>

<style>
	.trend-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--trend-color);
	}

	.trend-indicator.sm {
		font-size: 0.75rem;
	}

	.trend-indicator.md {
		font-size: 0.875rem;
	}

	.trend-indicator.lg {
		font-size: 1rem;
	}

	.arrow {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.arrow svg {
		width: 1em;
		height: 1em;
	}

	.percentage {
		font-weight: 600;
	}

	.label {
		font-weight: 500;
	}
</style>
