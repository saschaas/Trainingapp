<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';
	import type { Training } from '$lib/types';
	import { exerciseDaysById } from '$lib/stores/exerciseDays';
	import { get } from 'svelte/store';

	interface Props {
		trainings: Training[];
		limit?: number;
	}

	let { trainings, limit = 20 }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	// Register Chart.js components
	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
	}

	function getCategoryColor(dayId: number): string {
		const daysById = get(exerciseDaysById);
		const day = daysById.get(dayId);
		if (!day) return '#14b8a6';
		switch (day.category) {
			case 'push': return '#ef4444';
			case 'pull': return '#3b82f6';
			case 'legs': return '#22c55e';
			case 'full-body': return '#8b5cf6';
			default: return '#14b8a6';
		}
	}

	$effect(() => {
		if (!canvas) return;

		const recentTrainings = [...trainings]
			.sort((a, b) => a.date - b.date)
			.slice(-limit);

		const labels = recentTrainings.map(t => formatDate(t.date));
		const data = recentTrainings.map(t => t.totalVolume);
		const colors = recentTrainings.map(t => getCategoryColor(t.exerciseDayId));

		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].pointBackgroundColor = colors;
			chart.update();
		} else {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels,
					datasets: [{
						label: 'Volumen (kg)',
						data,
						borderColor: '#14b8a6',
						backgroundColor: 'rgba(20, 184, 166, 0.1)',
						pointBackgroundColor: colors,
						pointBorderColor: '#14b8a6',
						pointRadius: 4,
						pointHoverRadius: 6,
						tension: 0.3,
						fill: true
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false
						},
						tooltip: {
							backgroundColor: '#1a1a2e',
							titleColor: '#ffffff',
							bodyColor: '#a0a0b0',
							borderColor: '#2a2a45',
							borderWidth: 1,
							callbacks: {
								label: (context) => {
									return `${context.parsed.y.toLocaleString('de-DE')} kg`;
								}
							}
						}
					},
					scales: {
						x: {
							grid: {
								color: '#2a2a45'
							},
							ticks: {
								color: '#606070'
							}
						},
						y: {
							grid: {
								color: '#2a2a45'
							},
							ticks: {
								color: '#606070',
								callback: (value) => `${(value as number).toLocaleString('de-DE')}`
							},
							beginAtZero: true
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
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 250px;
	}
</style>
