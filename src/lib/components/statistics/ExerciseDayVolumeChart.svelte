<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js';
	import type { ExerciseDayVolumeData, TimeRange } from '$lib/types';
	import TimeRangeSelector from '$lib/components/shared/TimeRangeSelector.svelte';

	interface Props {
		data: ExerciseDayVolumeData[];
		categoryColor?: string;
	}

	let { data, categoryColor = '#14b8a6' }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;
	let timeRange: TimeRange = $state(30);

	Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit'
		});
	}

	let filteredData = $derived(data.slice(-timeRange));

	$effect(() => {
		if (!canvas) return;

		const labels = filteredData.map(d => formatDate(d.date));
		const volumes = filteredData.map(d => d.volume);

		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets[0].data = volumes;
			chart.data.datasets[0].borderColor = categoryColor;
			chart.data.datasets[0].backgroundColor = categoryColor + '15';
			chart.data.datasets[0].pointBackgroundColor = filteredData.map(d =>
				d.prCount > 0 ? '#fbbf24' : categoryColor
			);
			chart.update();
		} else {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels,
					datasets: [{
						label: 'Volumen (kg)',
						data: volumes,
						borderColor: categoryColor,
						backgroundColor: categoryColor + '15',
						pointBackgroundColor: filteredData.map(d =>
							d.prCount > 0 ? '#fbbf24' : categoryColor
						),
						pointBorderColor: categoryColor,
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
									const dataIndex = context.dataIndex;
									const prCount = filteredData[dataIndex]?.prCount || 0;
									const lines = [`${context.parsed.y.toLocaleString('de-DE')} kg`];
									if (prCount > 0) {
										lines.push(`${prCount} PR${prCount > 1 ? 's' : ''}`);
									}
									return lines;
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
								color: '#606070',
								maxRotation: 45,
								minRotation: 45
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

	function handleTimeRangeChange(newRange: TimeRange) {
		timeRange = newRange;
	}
</script>

<div class="volume-chart-container">
	<div class="chart-header">
		<span class="chart-title">Volumen-Verlauf</span>
		<TimeRangeSelector value={timeRange} onchange={handleTimeRangeChange} />
	</div>
	<div class="chart-wrapper">
		{#if filteredData.length > 0}
			<canvas bind:this={canvas}></canvas>
		{:else}
			<div class="no-data">Keine Daten für diesen Zeitraum</div>
		{/if}
	</div>
	<div class="legend">
		<span class="legend-item">
			<span class="dot" style="background: {categoryColor}"></span>
			Normal
		</span>
		<span class="legend-item">
			<span class="dot" style="background: #fbbf24"></span>
			Mit PR
		</span>
	</div>
</div>

<style>
	.volume-chart-container {
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
		height: 220px;
	}

	.no-data {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted, #606070);
	}

	.legend {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: var(--color-text-muted, #606070);
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}
</style>
