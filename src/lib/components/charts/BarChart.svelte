<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface BarChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: BarChartData[];
		orientation?: 'horizontal' | 'vertical';
		height?: number;
		showGrid?: boolean;
		title?: string;
	}

	let { data, orientation = 'vertical', height = 300, showGrid = true, title }: Props = $props();

	$inspect(data);

	// Default color palette for fallback
	const defaultColors = [
		'hsl(217, 91%, 60%)', // blue
		'hsl(142, 71%, 45%)', // green
		'hsl(48, 96%, 53%)', // yellow
		'hsl(280, 70%, 60%)', // purple
		'hsl(340, 82%, 52%)' // pink
	];

	// Prepare chart data with colors
	const chartData = $derived(
		data.map((d, i) => ({
			...d,
			color: d.color || defaultColors[i % defaultColors.length]
		}))
	);

	// Prepare chart options
	const options = $derived<ApexOptions>({
		chart: {
			type: 'bar',
			height: height,
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			toolbar: {
				show: false
			}
		},
		plotOptions: {
			bar: {
				horizontal: orientation === 'horizontal',
				columnWidth: orientation === 'vertical' ? '60%' : undefined,
				barHeight: orientation === 'horizontal' ? '70%' : undefined,
				borderRadius: 6,
				distributed: true,
				dataLabels: {
					position: 'top'
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		series: [
			{
				name: title || 'Value',
				data: chartData.map((d) => d.value)
			}
		],
		xaxis: {
			categories: chartData.map((d) => d.label),
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
				formatter: (val) => val.toLocaleString()
			}
		},
		grid: {
			show: showGrid,
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
		colors: chartData.map((d) => d.color),
		fill: {
			opacity: 1,
			colors: chartData.map((d) => d.color)
		},
		tooltip: {
			enabled: true,
			y: {
				formatter: (val) => val.toLocaleString()
			}
		},
		legend: {
			show: false
		},
		states: {
			hover: {
				filter: {
					type: 'lighten'
				}
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
