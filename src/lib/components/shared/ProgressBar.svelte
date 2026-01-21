<script lang="ts">
	interface Props {
		value: number;
		max: number;
		label?: string;
		showPercentage?: boolean;
		color?: 'primary' | 'success' | 'warning' | 'danger';
		size?: 'sm' | 'md' | 'lg';
	}

	let {
		value,
		max,
		label = '',
		showPercentage = false,
		color = 'primary',
		size = 'md'
	}: Props = $props();

	let percentage = $derived(max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0);
</script>

<div class="progress-container progress-{size}">
	{#if label || showPercentage}
		<div class="progress-label">
			{#if label}
				<span class="label-text">{label}</span>
			{/if}
			{#if showPercentage}
				<span class="percentage">{percentage}%</span>
			{/if}
		</div>
	{/if}
	<div class="progress-track">
		<div
			class="progress-fill progress-{color}"
			style="width: {percentage}%"
		></div>
	</div>
</div>

<style>
	.progress-container {
		width: 100%;
	}

	.progress-label {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.375rem;
	}

	.label-text {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
	}

	.percentage {
		color: var(--color-text);
		font-weight: 500;
		font-size: 0.875rem;
	}

	.progress-track {
		background: var(--color-surface-dark);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-sm .progress-track {
		height: 4px;
	}

	.progress-md .progress-track {
		height: 8px;
	}

	.progress-lg .progress-track {
		height: 12px;
	}

	.progress-fill {
		height: 100%;
		border-radius: 999px;
		transition: width 0.3s ease;
	}

	.progress-primary {
		background: var(--color-primary);
	}

	.progress-success {
		background: var(--color-success);
	}

	.progress-warning {
		background: var(--color-warning);
	}

	.progress-danger {
		background: var(--color-danger);
	}
</style>
