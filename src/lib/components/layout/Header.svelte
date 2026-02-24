<script lang="ts">
	import type { LastTrainedDay } from '$lib/utils/rotation';

	interface Props {
		lastTrainedDays: LastTrainedDay[];
	}

	let { lastTrainedDays }: Props = $props();

	function getCategoryBadge(category: string): string {
		switch (category) {
			case 'push': return 'PUSH';
			case 'pull': return 'PULL';
			case 'legs': return 'LEGS';
			case 'full-body': return 'FULL';
			default: return '?';
		}
	}

	function getCategoryColor(category: string): string {
		switch (category) {
			case 'push': return 'var(--color-push)';
			case 'pull': return 'var(--color-pull)';
			case 'legs': return 'var(--color-legs)';
			case 'full-body': return 'var(--color-fullbody)';
			default: return 'var(--color-primary)';
		}
	}
</script>

<header class="header">
	<div class="logo">
		<span class="logo-icon">💪</span>
		<span class="logo-text">FitTrack</span>
	</div>

	<div class="last-days">
		<span class="last-days-label">Letzte:</span>
		<div class="day-badges">
			{#each lastTrainedDays as { exerciseDay, daysAgo }}
				<div
					class="day-badge-wrapper"
					title="{exerciseDay.name} - vor {daysAgo} {daysAgo === 1 ? 'Tag' : 'Tagen'}"
				>
					<span
						class="day-badge"
						style="background: {getCategoryColor(exerciseDay.category)}"
					>
						{getCategoryBadge(exerciseDay.category)}
					</span>
					<span class="days-ago">{daysAgo}d</span>
				</div>
			{/each}
			{#if lastTrainedDays.length === 0}
				<span class="no-data">-</span>
			{/if}
		</div>
	</div>

	<a href="/config" class="config-btn" aria-label="Einstellungen">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="3"></circle>
			<path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"></path>
		</svg>
	</a>
</header>

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	.logo-text {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.last-days {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.last-days-label {
		color: var(--color-text-secondary);
		font-size: 0.75rem;
	}

	.day-badges {
		display: flex;
		gap: 0.5rem;
	}

	.day-badge-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
	}

	.day-badge {
		padding: 0.15rem 0.35rem;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.55rem;
		font-weight: 700;
		color: white;
		letter-spacing: 0.03em;
		white-space: nowrap;
	}

	.days-ago {
		font-size: 0.625rem;
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.no-data {
		color: var(--color-text-muted);
	}

	.config-btn {
		color: var(--color-text-secondary);
		padding: 0.5rem;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.config-btn:hover {
		background: var(--color-surface-hover);
		color: var(--color-text);
	}
</style>
