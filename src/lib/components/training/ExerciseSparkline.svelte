<script lang="ts">
	import type { Training } from '$lib/types';
	import { calculateExerciseVolume } from '$lib/utils/volume';

	interface Props {
		trainings: Training[];
		exerciseId: number;
		width?: number;
		height?: number;
	}

	let { trainings, exerciseId, width = 56, height = 22 }: Props = $props();

	// Get volume per session for the last 7 sessions (oldest to newest)
	let volumeData = $derived.by(() => {
		const relevant = trainings
			.filter(t => t.sets.some(s => s.exerciseId === exerciseId))
			.sort((a, b) => a.date - b.date)
			.slice(-7);

		return relevant.map(t => calculateExerciseVolume(t.sets, exerciseId));
	});

	// Determine trend: compare first half avg vs second half avg
	let trend = $derived.by((): 'improving' | 'stable' | 'declining' => {
		if (volumeData.length < 2) return 'stable';

		const mid = Math.floor(volumeData.length / 2);
		const firstHalf = volumeData.slice(0, mid);
		const secondHalf = volumeData.slice(mid);

		const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
		const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;

		if (avgFirst === 0) return 'stable';
		const change = ((avgSecond - avgFirst) / avgFirst) * 100;

		if (change > 3) return 'improving';
		if (change < -3) return 'declining';
		return 'stable';
	});

	let lineColor = $derived(
		trend === 'improving' ? '#22c55e' : trend === 'declining' ? '#ef4444' : '#3b82f6'
	);

	// Build SVG polyline points
	let points = $derived.by(() => {
		if (volumeData.length < 2) return '';

		const padding = 2;
		const w = width - padding * 2;
		const h = height - padding * 2;

		const min = Math.min(...volumeData);
		const max = Math.max(...volumeData);
		const range = max - min || 1;

		return volumeData
			.map((v, i) => {
				const x = padding + (i / (volumeData.length - 1)) * w;
				const y = padding + h - ((v - min) / range) * h;
				return `${x},${y}`;
			})
			.join(' ');
	});
</script>

{#if volumeData.length >= 2}
	<svg
		class="sparkline"
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<polyline
			{points}
			stroke={lineColor}
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			fill="none"
		/>
	</svg>
{/if}

<style>
	.sparkline {
		flex-shrink: 0;
		display: block;
	}
</style>
