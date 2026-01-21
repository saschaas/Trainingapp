<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';

	interface Props {
		onSave: () => void;
		onReset: () => void;
		saveDisabled?: boolean;
		completionPercentage: number;
	}

	let { onSave, onReset, saveDisabled = false, completionPercentage }: Props = $props();
</script>

<footer class="footer">
	<div class="completion-bar">
		<div
			class="completion-fill"
			style="width: {completionPercentage}%"
		></div>
	</div>
	<div class="footer-content">
		<Button variant="secondary" onclick={onReset}>
			Zurücksetzen
		</Button>
		<Button variant="primary" onclick={onSave} disabled={saveDisabled}>
			Training speichern
		</Button>
	</div>
</footer>

<style>
	.footer {
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
	}

	.completion-bar {
		height: 3px;
		background: var(--color-surface-dark);
	}

	.completion-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width 0.3s ease;
	}

	.footer-content {
		display: flex;
		gap: 0.75rem;
		padding: 1rem;
		justify-content: flex-end;
	}
</style>
