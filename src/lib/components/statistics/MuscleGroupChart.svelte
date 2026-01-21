<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
	import { CATEGORY_COLORS } from '$lib/constants/enums';
	import { formatVolume } from '$lib/utils/volume';

	interface Props {
		volumeByCategory: Map<string, number>;
	}

	let { volumeByCategory }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	// Register Chart.js components
	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	$effect(() => {
		if (!canvas) return;

		const categories = [...volumeByCategory.keys()];
		const data = categories.map(c => volumeByCategory.get(c) || 0);
		const colors = categories.map(c => CATEGORY_COLORS[c as keyof typeof CATEGORY_COLORS] || '#14b8a6');

		if (chart) {
			chart.data.labels = categories;
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].backgroundColor = colors;
			chart.update();
		} else {
			chart = new Chart(canvas, {
				type: 'doughnut',
				data: {
					labels: categories,
					datasets: [{
						data,
						backgroundColor: colors,
						borderColor: '#1a1a2e',
						borderWidth: 2
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: 'right',
							labels: {
								color: '#a0a0b0',
								padding: 15,
								usePointStyle: true,
								pointStyle: 'circle'
							}
						},
						tooltip: {
							backgroundColor: '#1a1a2e',
							titleColor: '#ffffff',
							bodyColor: '#a0a0b0',
							borderColor: '#2a2a45',
							borderWidth: 1,
							callbacks: {
								label: (context) => {
									const value = context.parsed;
									const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
									const percentage = Math.round((value / total) * 100);
									return `${formatVolume(value)} kg (${percentage}%)`;
								}
							}
						}
					}
				}
			});
		}

		return () => {
			if (chart) {
				chart.destroy();
				chart = null;
			}
		};
	});
</script>

<div class="chart-container">
	{#if volumeByCategory.size === 0}
		<div class="no-data">Keine Daten vorhanden</div>
	{:else}
		<canvas bind:this={canvas}></canvas>
	{/if}
</div>

<style>
	.chart-container {
		width: 100%;
		height: 200px;
	}

	.no-data {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--color-text-muted);
	}
</style>
