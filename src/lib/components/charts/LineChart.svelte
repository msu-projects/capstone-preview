<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface LineChartSeries {
		name: string;
		data: number[];
		color?: string;
	}

	interface Props {
		series: LineChartSeries[];
		categories: string[];
		height?: number;
		showGrid?: boolean;
		showLegend?: boolean;
		title?: string;
		curve?: 'smooth' | 'straight' | 'stepline';
		showDataLabels?: boolean;
		yAxisFormatter?: (val: number) => string;
	}

	let {
		series,
		categories,
		height = 300,
		showGrid = true,
		showLegend = true,
		title,
		curve = 'smooth',
		showDataLabels = false,
		yAxisFormatter = (val) => val.toLocaleString()
	}: Props = $props();

	// Default colors for series
	const defaultColors = [
		'hsl(217, 91%, 60%)',
		'hsl(142, 71%, 45%)',
		'hsl(24, 95%, 53%)',
		'hsl(262, 83%, 58%)',
		'hsl(189, 85%, 45%)',
		'hsl(340, 82%, 52%)'
	];

	// Prepare series data with colors
	const chartSeries = $derived(
		series.map((s, i) => ({
			name: s.name,
			data: s.data,
			color: s.color || defaultColors[i % defaultColors.length]
		}))
	);

	// Prepare chart options
	const options = $derived<ApexOptions>({
		chart: {
			type: 'line',
			height: height,
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			toolbar: {
				show: false
			},
			zoom: {
				enabled: false
			},
			animations: {
				enabled: true,
				speed: 800
			}
		},
		stroke: {
			curve: curve,
			width: 3
		},
		dataLabels: {
			enabled: showDataLabels
		},
		series: chartSeries.map((s) => ({
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
				}
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
				},
				formatter: yAxisFormatter
			}
		},
		grid: {
			show: showGrid,
			borderColor: '#e2e8f0',
			strokeDashArray: 4,
			xaxis: {
				lines: {
					show: false
				}
			},
			yaxis: {
				lines: {
					show: true
				}
			}
		},
		colors: chartSeries.map((s) => s.color),
		markers: {
			size: 5,
			colors: chartSeries.map((s) => s.color),
			strokeColors: '#fff',
			strokeWidth: 2,
			hover: {
				size: 7
			}
		},
		tooltip: {
			enabled: true,
			shared: true,
			intersect: false,
			y: {
				formatter: yAxisFormatter
			}
		},
		legend: {
			show: showLegend,
			position: 'bottom',
			horizontalAlign: 'center',
			fontSize: '13px',
			fontWeight: 500,
			markers: {
				size: 8,
				shape: 'circle'
			},
			itemMargin: {
				horizontal: 12,
				vertical: 8
			}
		}
	});
</script>

<div class="w-full">
	{#if title}
		<h3 class="mb-2 text-sm font-semibold text-slate-700">{title}</h3>
	{/if}
	<div class="w-full" style="height: {height}px;">
		<Chart {options} />
	</div>
</div>
