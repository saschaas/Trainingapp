<script lang="ts">
	import type { SetData, SetAverage } from '$lib/types';

	interface Props {
		setData: SetData;
		average?: SetAverage;
		onUpdate: (updates: Partial<SetData>) => void;
		onSkip: () => void;
		onUnskip: () => void;
		weightInputId: string;
		repsInputId: string;
		nextInputId?: string;
	}

	let {
		setData,
		average,
		onUpdate,
		onSkip,
		onUnskip,
		weightInputId,
		repsInputId,
		nextInputId
	}: Props = $props();

	function handleWeightChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseFloat(target.value) : null;
		onUpdate({ weight: value });
	}

	function handleRepsChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value ? parseInt(target.value) : null;
		onUpdate({ repetitions: value });
	}

	function handleKeyDown(e: KeyboardEvent, isWeight: boolean) {
		if (e.key === 'Tab' && !e.shiftKey) {
			e.preventDefault();
			const nextId = isWeight ? repsInputId : nextInputId;
			if (nextId) {
				const nextInput = document.getElementById(nextId);
				nextInput?.focus();
			}
		}
	}

	let volume = $derived(
		setData.weight !== null && setData.repetitions !== null && !setData.skipped
			? setData.weight * setData.repetitions
			: 0
	);
</script>

<div class="set-input" class:skipped={setData.skipped}>
	<div class="set-header">
		<span class="set-number">Satz {setData.setNumber}</span>
		{#if setData.skipped}
			<button class="skip-btn unskip" onclick={onUnskip}>
				Aktivieren
			</button>
		{:else}
			<button class="skip-btn" onclick={onSkip}>
				Skip
			</button>
		{/if}
	</div>

	{#if setData.skipped}
		<div class="skipped-overlay">
			<span>Übersprungen</span>
		</div>
	{:else}
		<div class="inputs">
			<div class="input-group">
				<label for={weightInputId}>kg</label>
				<input
					type="number"
					id={weightInputId}
					value={setData.weight ?? ''}
					oninput={handleWeightChange}
					onkeydown={(e) => handleKeyDown(e, true)}
					placeholder={average?.avgWeight ? `~${average.avgWeight}` : ''}
					step="0.5"
					min="0"
				/>
			</div>
			<span class="separator">x</span>
			<div class="input-group">
				<label for={repsInputId}>Wdh</label>
				<input
					type="number"
					id={repsInputId}
					value={setData.repetitions ?? ''}
					oninput={handleRepsChange}
					onkeydown={(e) => handleKeyDown(e, false)}
					placeholder={average?.avgReps ? `~${average.avgReps}` : ''}
					step="1"
					min="0"
				/>
			</div>
		</div>

		{#if volume > 0}
			<div class="set-volume">
				= {volume.toLocaleString('de-DE')} kg
			</div>
		{/if}
	{/if}
</div>

<style>
	.set-input {
		background: var(--color-surface-dark);
		border-radius: 8px;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 100px;
	}

	.set-input.skipped {
		opacity: 0.5;
	}

	.set-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.set-number {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
	}

	.skip-btn {
		background: none;
		border: none;
		font-size: 0.625rem;
		color: var(--color-text-muted);
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 2px;
	}

	.skip-btn:hover {
		color: var(--color-text-secondary);
		background: var(--color-surface);
	}

	.skip-btn.unskip {
		color: var(--color-primary);
	}

	.skipped-overlay {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		color: var(--color-text-muted);
		font-size: 0.75rem;
	}

	.inputs {
		display: flex;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		flex: 1;
	}

	.input-group label {
		font-size: 0.625rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
	}

	.input-group input {
		width: 100%;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.5rem;
		font-size: 1rem;
		color: var(--color-text);
		text-align: center;
		font-family: inherit;
	}

	.input-group input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.input-group input::placeholder {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	/* Remove number input arrows */
	.input-group input[type="number"]::-webkit-outer-spin-button,
	.input-group input[type="number"]::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.input-group input[type="number"] {
		-moz-appearance: textfield;
	}

	.separator {
		color: var(--color-text-muted);
		font-weight: 500;
		padding-bottom: 0.5rem;
	}

	.set-volume {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		text-align: center;
	}
</style>
