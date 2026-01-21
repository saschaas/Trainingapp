<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initializeSettings } from '$lib/db';

	let { children } = $props();

	onMount(async () => {
		// Initialize app settings on first load
		await initializeSettings();

		// Register service worker for PWA
		if ('serviceWorker' in navigator) {
			try {
				await navigator.serviceWorker.register('/service-worker.js');
			} catch (err) {
				console.log('Service worker registration failed:', err);
			}
		}
	});
</script>

<div class="app">
	{@render children()}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
