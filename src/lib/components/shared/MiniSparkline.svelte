<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		data: number[];
		width?: number;
		height?: number;
		color?: string;
		fillColor?: string;
	}

	let { data, width = 80, height = 24, color = '#14b8a6', fillColor }: Props = $props();

	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (!canvas || data.length < 2) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		canvas.width = width * dpr;
		canvas.height = height * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, width, height);

		const padding = 2;
		const chartWidth = width - padding * 2;
		const chartHeight = height - padding * 2;

		const minVal = Math.min(...data);
		const maxVal = Math.max(...data);
		const range = maxVal - minVal || 1;

		const points: [number, number][] = data.map((val, i) => [
			padding + (i / (data.length - 1)) * chartWidth,
			padding + chartHeight - ((val - minVal) / range) * chartHeight
		]);

		// Draw fill
		if (fillColor) {
			ctx.beginPath();
			ctx.moveTo(points[0][0], height - padding);
			for (const [x, y] of points) {
				ctx.lineTo(x, y);
			}
			ctx.lineTo(points[points.length - 1][0], height - padding);
			ctx.closePath();
			ctx.fillStyle = fillColor;
			ctx.fill();
		}

		// Draw line
		ctx.beginPath();
		ctx.moveTo(points[0][0], points[0][1]);
		for (let i = 1; i < points.length; i++) {
			ctx.lineTo(points[i][0], points[i][1]);
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 1.5;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.stroke();

		// Draw end point
		const lastPoint = points[points.length - 1];
		ctx.beginPath();
		ctx.arc(lastPoint[0], lastPoint[1], 2, 0, Math.PI * 2);
		ctx.fillStyle = color;
		ctx.fill();
	});
</script>

<canvas
	bind:this={canvas}
	style="width: {width}px; height: {height}px;"
></canvas>

<style>
	canvas {
		display: block;
	}
</style>
