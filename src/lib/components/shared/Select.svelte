<script lang="ts">
	interface Props {
		label?: string;
		error?: string;
		value?: string;
		options: Array<{ value: string; label: string }>;
		placeholder?: string;
		disabled?: boolean;
	}

	let {
		label = '',
		error = '',
		value = $bindable(''),
		options,
		placeholder = 'Auswählen...',
		disabled = false
	}: Props = $props();
</script>

<div class="select-group" class:has-error={!!error}>
	{#if label}
		<label class="select-label">{label}</label>
	{/if}
	<div class="select-wrapper">
		<select class="select" bind:value {disabled}>
			{#if placeholder}
				<option value="" disabled>{placeholder}</option>
			{/if}
			{#each options as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
		<svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="6,9 12,15 18,9"></polyline>
		</svg>
	</div>
	{#if error}
		<span class="error-text">{error}</span>
	{/if}
</div>

<style>
	.select-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.select-label {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.select-wrapper {
		position: relative;
	}

	.select {
		width: 100%;
		background: var(--color-surface-dark);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.625rem 2.5rem 0.625rem 0.875rem;
		font-size: 1rem;
		color: var(--color-text);
		font-family: inherit;
		appearance: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
	}

	.select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.select-arrow {
		position: absolute;
		right: 0.875rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-secondary);
		pointer-events: none;
	}

	.has-error .select {
		border-color: var(--color-danger);
	}

	.has-error .select:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
	}

	.error-text {
		color: var(--color-danger);
		font-size: 0.75rem;
	}
</style>
