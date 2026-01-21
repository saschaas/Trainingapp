<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		label?: string;
		error?: string;
		value?: string | number;
	}

	let {
		label = '',
		error = '',
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		disabled = false,
		...rest
	}: Props = $props();
</script>

<div class="input-group" class:has-error={!!error}>
	{#if label}
		<label class="input-label">{label}</label>
	{/if}
	<input
		class="input"
		{type}
		{placeholder}
		{disabled}
		bind:value
		{...rest}
	/>
	{#if error}
		<span class="error-text">{error}</span>
	{/if}
</div>

<style>
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.input-label {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	.input {
		background: var(--color-surface-dark);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 0.625rem 0.875rem;
		font-size: 1rem;
		color: var(--color-text);
		font-family: inherit;
		transition: all 0.2s ease;
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
	}

	.input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.has-error .input {
		border-color: var(--color-danger);
	}

	.has-error .input:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
	}

	.error-text {
		color: var(--color-danger);
		font-size: 0.75rem;
	}

	/* Remove number input arrows */
	.input[type="number"]::-webkit-outer-spin-button,
	.input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.input[type="number"] {
		-moz-appearance: textfield;
	}
</style>
