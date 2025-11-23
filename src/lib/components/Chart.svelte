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
						},
						tooltip: {
							callbacks: {
								label: function (context: any) {
									const label = context.label || '';
									const value = context.parsed || 0;
									const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
									const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
									return `${label}: ${percentage}%`;
								}
							}
						}
					}
				},
				plugins: [
					{
						id: 'percentageLabels',
						afterDatasetsDraw(chart: any) {
							const ctx = chart.ctx;
							chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
								const meta = chart.getDatasetMeta(datasetIndex);
								if (!meta.hidden) {
									const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
									meta.data.forEach((element: any, index: number) => {
										const value = dataset.data[index];
										const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

										// Only show percentage if it's greater than 3% to avoid clutter
										if (parseFloat(percentage) > 3) {
											ctx.fillStyle = '#fff';
											ctx.font = 'bold 14px Arial';
											ctx.textAlign = 'center';
											ctx.textBaseline = 'middle';

											const position = element.tooltipPosition();
											ctx.fillText(`${percentage}%`, position.x, position.y);
										}
									});
								}
							});
						}
					}
				]
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
