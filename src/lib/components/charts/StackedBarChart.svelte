<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface StackedBarSeries {
		name: string;
		data: number[];
		color?: string;
	}

	interface Props {
		series: StackedBarSeries[];
		categories: string[];
		height?: number;
		title?: string;
		stacked100?: boolean;
		orientation?: 'horizontal' | 'vertical';
		showDataLabels?: boolean;
	}

	let {
		series,
		categories,
		height = 300,
		title,
		stacked100 = false,
		orientation = 'horizontal',
		showDataLabels = true
	}: Props = $props();

	// Default color palette
	const defaultColors = [
		'hsl(142, 71%, 45%)', // green (covered)
		'hsl(0, 84%, 60%)', // red (not covered)
		'hsl(217, 91%, 60%)', // blue
		'hsl(48, 96%, 53%)', // yellow
		'hsl(280, 70%, 60%)' // purple
	];

	const colors = $derived(series.map((s, i) => s.color || defaultColors[i % defaultColors.length]));

	const options = $derived<ApexOptions>({
		chart: {
			type: 'bar',
			height: height,
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			stacked: true,
			stackType: stacked100 ? '100%' : 'normal',
			toolbar: {
				show: false
			}
		},
		plotOptions: {
			bar: {
				horizontal: orientation === 'horizontal',
				borderRadius: 4,
				borderRadiusApplication: 'end',
				barHeight: '70%',
				columnWidth: '70%'
			}
		},
		colors: colors,
		dataLabels: {
			enabled: showDataLabels,
			formatter: (val) =>
				stacked100 ? `${Number(val).toFixed(0)}%` : Number(val).toLocaleString(),
			style: {
				fontSize: '11px',
				fontWeight: 600,
				colors: ['#fff']
			}
		},
		series: series.map((s) => ({
			name: s.name,
			data: s.data
		})),
		xaxis: {
			categories: categories,
			labels: {
				style: {
					colors: '#64748b',
					fontSize: '12px',
					fontWeight: 500
				},
				formatter: stacked100 ? (val) => `${val}%` : undefined
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			}
		},
		yaxis: {
			labels: {
				style: {
					colors: '#64748b',
					fontSize: '12px',
					fontWeight: 500
				}
			}
		},
		grid: {
			borderColor: '#e2e8f0',
			strokeDashArray: 4,
			xaxis: {
				lines: {
					show: orientation === 'horizontal'
				}
			},
			yaxis: {
				lines: {
					show: orientation === 'vertical'
				}
			}
		},
		legend: {
			position: 'top',
			horizontalAlign: 'center',
			fontSize: '13px',
			fontWeight: 500,
			labels: {
				colors: '#334155'
			},
			markers: {
				size: 8,
				shape: 'circle'
			}
		},
		tooltip: {
			y: {
				formatter: (val) =>
					stacked100 ? `${Number(val).toFixed(1)}%` : Number(val).toLocaleString()
			}
		}
	});
</script>

<div class="stacked-bar-chart">
	<Chart {options} />
</div>

<style>
	.stacked-bar-chart {
		width: 100%;
	}
</style>
