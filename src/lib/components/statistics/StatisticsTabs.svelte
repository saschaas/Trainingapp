<script lang="ts">
	import type { StatsTabId } from '$lib/types';

	interface Props {
		activeTab: StatsTabId;
		onchange: (tab: StatsTabId) => void;
	}

	let { activeTab, onchange }: Props = $props();

	const tabs: Array<{ id: StatsTabId; label: string }> = [
		{ id: 'overview', label: 'Übersicht' },
		{ id: 'exercise-days', label: 'Trainingstage' },
		{ id: 'exercises', label: 'Übungen' }
	];
</script>

<nav class="statistics-tabs">
	{#each tabs as tab}
		<button
			class="tab-btn"
			class:active={activeTab === tab.id}
			onclick={() => onchange(tab.id)}
			type="button"
		>
			{tab.label}
		</button>
	{/each}
</nav>

<style>
	.statistics-tabs {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem;
		background: var(--color-surface-elevated, #1a1a2e);
		border-radius: 10px;
		margin-bottom: 1rem;
	}

	.tab-btn {
		flex: 1;
		padding: 0.625rem 0.75rem;
		border: none;
		background: transparent;
		color: var(--color-text-muted, #606070);
		font-size: 0.8125rem;
		font-weight: 500;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.tab-btn:hover {
		color: var(--color-text-secondary, #a0a0b0);
	}

	.tab-btn.active {
		background: var(--color-surface, #12121f);
		color: var(--color-text, #ffffff);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>
