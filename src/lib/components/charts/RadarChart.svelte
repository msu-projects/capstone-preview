<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface RadarChartData {
		label: string;
		value: number; // Expected as percentage (0-100)
	}

	interface Props {
		data: RadarChartData[];
		height?: number;
		title?: string;
		color?: string;
		fillOpacity?: number;
		showDataLabels?: boolean;
	}

	let {
		data,
		height = 350,
		title,
		color = 'hsl(217, 91%, 60%)',
		fillOpacity = 0.25,
		showDataLabels = true
	}: Props = $props();

	const options = $derived<ApexOptions>({
		chart: {
			type: 'radar',
			height: height,
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			toolbar: {
				show: false
			},
			dropShadow: {
				enabled: true,
				blur: 1,
				left: 1,
				top: 1,
				opacity: 0.1
			}
		},
		series: [
			{
				name: title || 'Coverage',
				data: data.map((d) => d.value)
			}
		],
		colors: [color],
		fill: {
			opacity: fillOpacity
		},
		stroke: {
			width: 2
		},
		markers: {
			size: 4,
			strokeWidth: 2,
			strokeColors: '#fff',
			hover: {
				size: 6
			}
		},
		xaxis: {
			categories: data.map((d) => d.label),
			labels: {
				style: {
					colors: '#64748b',
					fontSize: '12px',
					fontWeight: 500
				}
			}
		},
		yaxis: {
			max: 100,
			min: 0,
			tickAmount: 4,
			labels: {
				style: {
					colors: '#64748b',
					fontSize: '10px'
				},
				formatter: (val) => `${val}%`
			}
		},
		dataLabels: {
			enabled: showDataLabels,
			background: {
				enabled: true,
				borderRadius: 2,
				padding: 4,
				borderColor: 'transparent',
				foreColor: '#334155'
			},
			formatter: (val) => `${Number(val).toFixed(0)}%`
		},
		tooltip: {
			y: {
				formatter: (val) => `${val.toFixed(1)}%`
			}
		},
		plotOptions: {
			radar: {
				polygons: {
					strokeColors: '#e2e8f0',
					connectorColors: '#e2e8f0',
					fill: {
						colors: ['#f8fafc', '#ffffff']
					}
				}
			}
		}
	});
</script>

<div class="radar-chart">
	<Chart {options} />
</div>

<style>
	.radar-chart {
		width: 100%;
	}
</style>
