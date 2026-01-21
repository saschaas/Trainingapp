<script lang="ts">
	interface Props {
		onFillFirst: () => void;
		onFillLast: () => void;
		hasLastData: boolean;
	}

	let { onFillFirst, onFillLast, hasLastData }: Props = $props();
</script>

<div class="quick-fill">
	<button class="fill-btn" onclick={onFillFirst} title="Erste Werte auf alle Sätze anwenden">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="17 1 21 5 17 9"></polyline>
			<path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
			<polyline points="7 23 3 19 7 15"></polyline>
			<path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
		</svg>
		<span>Erste Werte</span>
	</button>
	<button
		class="fill-btn"
		onclick={onFillLast}
		disabled={!hasLastData}
		title="Werte vom letzten Training"
	>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="1 4 1 10 7 10"></polyline>
			<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
		</svg>
		<span>Letzte Werte</span>
	</button>
</div>

<style>
	.quick-fill {
		display: flex;
		gap: 0.5rem;
	}

	.fill-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.375rem 0.625rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.fill-btn:hover:not(:disabled) {
		background: var(--color-surface-hover);
		color: var(--color-text);
		border-color: var(--color-primary);
	}

	.fill-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
