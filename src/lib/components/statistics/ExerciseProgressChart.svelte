<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, LineController, BarController, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
	import type { Training, TimeRange } from '$lib/types';
	import TimeRangeSelector from '$lib/components/shared/TimeRangeSelector.svelte';
	import { getPersonalRecords } from '$lib/utils/statistics';

	interface Props {
		trainings: Training[];
		exerciseId: number;
	}

	let { trainings, exerciseId }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let timeRange: TimeRange = $state(30);

	Chart.register(LineController, BarController, LineElement, BarElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
	}

	// Get relevant data
	let chartData = $derived.by(() => {
		const relevantTrainings = trainings
			.filter(t => t.sets.some(s => s.exerciseId === exerciseId))
			.sort((a, b) => a.date - b.date)
			.slice(-timeRange);

		const prs = getPersonalRecords(trainings, exerciseId);
		const prDates = new Set<number>();
		if (prs.weight) prDates.add(prs.weight.date);
		if (prs.volume) prDates.add(prs.volume.date);

		return relevantTrainings.map(training => {
			let maxWeight = 0;
			let volume = 0;

			for (const set of training.sets) {
				if (set.exerciseId === exerciseId && !set.skipped && set.weight !== null && set.repetitions !== null) {
					maxWeight = Math.max(maxWeight, set.weight);
					volume += set.weight * set.repetitions;
				}
			}

			return {
				date: training.date,
				maxWeight,
				volume,
				isPR: prDates.has(training.date)
			};
		});
	});

	$effect(() => {
		if (!canvas || chartData.length === 0) return;

		const labels = chartData.map(d => formatDate(d.date));
		const weights = chartData.map(d => d.maxWeight);
		const volumes = chartData.map(d => d.volume);

		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets[0].data = weights;
			chart.data.datasets[1].data = volumes;
			chart.data.datasets[0].pointBackgroundColor = chartData.map(d =>
				d.isPR ? '#fbbf24' : '#14b8a6'
			);
			chart.update();
		} else {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels,
					datasets: [
						{
							type: 'line',
							label: 'Max Gewicht (kg)',
							data: weights,
							borderColor: '#14b8a6',
							backgroundColor: 'transparent',
							pointBackgroundColor: chartData.map(d =>
								d.isPR ? '#fbbf24' : '#14b8a6'
							),
							pointBorderColor: '#14b8a6',
							pointRadius: 4,
							pointHoverRadius: 6,
							tension: 0.3,
							yAxisID: 'y'
						},
						{
							type: 'bar',
							label: 'Volumen (kg)',
							data: volumes,
							backgroundColor: 'rgba(59, 130, 246, 0.4)',
							borderColor: '#3b82f6',
							borderWidth: 1,
							yAxisID: 'y1'
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					interaction: {
						mode: 'index',
						intersect: false
					},
					plugins: {
						legend: {
							display: true,
							position: 'bottom',
							labels: {
								color: '#a0a0b0',
								usePointStyle: true,
								padding: 16
							}
						},
						tooltip: {
							backgroundColor: '#1a1a2e',
							titleColor: '#ffffff',
							bodyColor: '#a0a0b0',
							borderColor: '#2a2a45',
							borderWidth: 1
						}
					},
					scales: {
						x: {
							grid: {
								color: '#2a2a45'
							},
							ticks: {
								color: '#606070',
								maxRotation: 45,
								minRotation: 45
							}
						},
						y: {
							type: 'linear',
							position: 'left',
							grid: {
								color: '#2a2a45'
							},
							ticks: {
								color: '#14b8a6'
							},
							title: {
								display: true,
								text: 'Gewicht (kg)',
								color: '#14b8a6'
							}
						},
						y1: {
							type: 'linear',
							position: 'right',
							grid: {
								drawOnChartArea: false
							},
							ticks: {
								color: '#3b82f6'
							},
							title: {
								display: true,
								text: 'Volumen (kg)',
								color: '#3b82f6'
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

	function handleTimeRangeChange(newRange: TimeRange) {
		timeRange = newRange;
	}
</script>

<div class="progress-chart-container">
	<div class="chart-header">
		<span class="chart-title">Fortschritt</span>
		<TimeRangeSelector value={timeRange} onchange={handleTimeRangeChange} />
	</div>
	<div class="chart-wrapper">
		{#if chartData.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="no-data">Keine Daten für diese Übung</div>
		{/if}
	</div>
</div>

<style>
	.progress-chart-container {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.chart-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--color-text-secondary, #a0a0b0);
	}

	.chart-wrapper {
		height: 280px;
	}

	.no-data {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted, #606070);
	}
</style>
