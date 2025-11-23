<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		Title,
		Tooltip,
		Legend,
		ArcElement,
		CategoryScale,
		PieController,
		DoughnutController,
		LineController,
		BarController,
		PointElement,
		LineElement,
		BarElement,
		LinearScale,
		type ChartConfiguration
	} from 'chart.js';

	Chart.register(
		Title,
		Tooltip,
		Legend,
		ArcElement,
		CategoryScale,
		PieController,
		DoughnutController,
		LineController,
		BarController,
		PointElement,
		LineElement,
		BarElement,
		LinearScale
	);

	interface Props {
		data: any;
		title?: string;
		type?: 'pie' | 'doughnut' | 'line' | 'bar';
	}

	let { data, title = '', type = 'doughnut' }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chartInstance: Chart | null = null;

	// Reactivity for data updates
	$effect(() => {
		if (chartInstance && data) {
			chartInstance.data = data;
			chartInstance.update();
		}
	});

	onMount(() => {
		if (canvas) {
			const config: ChartConfiguration = {
				type: type,
				data: data,
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: 'bottom'
						},
						title: {
							display: !!title,
							text: title
						}
					}
				}
			};
			chartInstance = new Chart(canvas, config);
		}
	});

	onDestroy(() => {
		if (chartInstance) {
			chartInstance.destroy();
		}
	});
</script>

<div class="chart-container">
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.chart-container {
		position: relative;
		height: 300px;
		width: 100%;
		display: flex;
		justify-content: center;
	}
</style>
