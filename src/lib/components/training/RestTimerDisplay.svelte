<script lang="ts">
	import { restTimer, timerProgress, formattedTime } from '$lib/stores/restTimer';

	let isVisible = $derived($restTimer.isRunning || $restTimer.isFinished);

	const SIZE = 36;
	const STROKE = 3;
	const RADIUS = (SIZE - STROKE) / 2;
	const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
	let strokeOffset = $derived(CIRCUMFERENCE * (1 - $timerProgress));
</script>

{#if isVisible}
	<button
		class="rest-timer-pill"
		class:finished={$restTimer.isFinished}
		onclick={() => restTimer.dismiss()}
		aria-label="Pausentimer schließen"
	>
		{#if $restTimer.isFinished}
			<span class="finished-text">Pause vorbei!</span>
		{:else}
			<svg
				width={SIZE}
				height={SIZE}
				viewBox="0 0 {SIZE} {SIZE}"
				class="progress-ring"
			>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={RADIUS}
					fill="none"
					stroke="var(--color-border)"
					stroke-width={STROKE}
				/>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={RADIUS}
					fill="none"
					stroke="var(--color-primary)"
					stroke-width={STROKE}
					stroke-dasharray={CIRCUMFERENCE}
					stroke-dashoffset={strokeOffset}
					stroke-linecap="round"
					transform="rotate(-90 {SIZE / 2} {SIZE / 2})"
				/>
			</svg>
			<span class="timer-text">{$formattedTime}</span>
			<span class="dismiss-icon">&times;</span>
		{/if}
	</button>
{/if}

<style>
	.rest-timer-pill {
		position: fixed;
		bottom: 80px;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 0.4rem 0.75rem;
		color: var(--color-text);
		cursor: pointer;
		z-index: 100;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
		transition: all 0.2s ease;
	}

	.rest-timer-pill:hover {
		border-color: var(--color-primary);
	}

	.rest-timer-pill.finished {
		background: var(--color-success);
		border-color: var(--color-success);
		color: #fff;
		animation: pulse-glow 1s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 2px 12px rgba(34, 197, 94, 0.3);
		}
		50% {
			box-shadow: 0 2px 20px rgba(34, 197, 94, 0.6);
		}
	}

	.progress-ring {
		flex-shrink: 0;
	}

	.timer-text {
		font-size: 0.9rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.dismiss-icon {
		font-size: 1.1rem;
		line-height: 1;
		opacity: 0.6;
	}

	.finished-text {
		font-size: 0.85rem;
		font-weight: 600;
		padding: 0.1rem 0.25rem;
	}
</style>
