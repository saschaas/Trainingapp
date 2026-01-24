<script lang="ts">
	import type { TabId } from '$lib/stores/ui';

	interface Props {
		activeTab: TabId;
		onTabChange: (tab: TabId) => void;
	}

	let { activeTab, onTabChange }: Props = $props();

	const tabs: { id: TabId; label: string; color: string }[] = [
		{ id: 'push', label: 'PUSH', color: 'var(--color-push)' },
		{ id: 'pull', label: 'PULL', color: 'var(--color-pull)' },
		{ id: 'legs', label: 'BEINE', color: 'var(--color-legs)' },
		{ id: 'history', label: 'HISTORIE', color: 'var(--color-warning)' },
		{ id: 'statistics', label: 'STATISTIK', color: 'var(--color-primary)' }
	];
</script>

<nav class="tab-nav">
	{#each tabs as tab}
		<button
			class="tab"
			class:active={activeTab === tab.id}
			style="--tab-color: {tab.color}"
			onclick={() => onTabChange(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</nav>

<style>
	.tab-nav {
		display: flex;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.tab-nav::-webkit-scrollbar {
		display: none;
	}

	.tab {
		flex: 1;
		min-width: 80px;
		padding: 0.875rem 1rem;
		background: none;
		border: none;
		border-bottom: 3px solid transparent;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.tab:hover {
		color: var(--color-text);
		background: var(--color-surface-hover);
	}

	.tab.active {
		color: var(--tab-color);
		border-bottom-color: var(--tab-color);
	}
</style>
