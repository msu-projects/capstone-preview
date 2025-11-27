<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface DonutChartData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: DonutChartData[];
		centerLabel?: string;
		centerValue?: string;
		height?: number;
		showLegend?: boolean;
	}

	let { data, centerLabel, centerValue, height = 300, showLegend = true }: Props = $props();

	// Track hovered segment
	let hoveredIndex = $state<number | null>(null);

	// Calculate total
	const total = $derived(data.reduce((sum, d) => sum + d.value, 0));

	// Get the current display value and label based on hover state
	const displayValue = $derived(
		hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < data.length
			? data[hoveredIndex].value.toLocaleString()
			: centerValue || total.toLocaleString()
	);

	const displayLabel = $derived(
		hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < data.length
			? data[hoveredIndex].label
			: centerLabel || 'Total'
	);

	// Calculate percentage for each item
	function getPercentage(value: number): string {
		return ((value / total) * 100).toFixed(1);
	}

	// Prepare chart data with colors
	const chartData = $derived(
		data.map((d, i) => ({
			...d,
			color: d.color || `hsl(var(--chart-${(i % 5) + 1}))`
		}))
	);

	// Prepare chart options
	const options = $derived<ApexOptions>({
		chart: {
			type: 'donut',
			height: height,
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			toolbar: {
				show: false
			},
			events: {
				dataPointMouseEnter: (event, chartContext, config) => {
					hoveredIndex = config.dataPointIndex;
				},
				dataPointMouseLeave: (event, chartContext, config) => {
					hoveredIndex = null;
				}
			}
		},
		series: chartData.map((d) => d.value),
		labels: chartData.map((d) => d.label),
		colors: chartData.map((d) => d.color),
		plotOptions: {
			pie: {
				donut: {
					size: '70%',
					labels: {
						show: true,
						name: {
							show: true,
							fontSize: '14px',
							fontWeight: 500,
							color: '#64748b'
						},
						value: {
							show: true,
							fontSize: '28px',
							fontWeight: 700,
							color: '#0f172a',
							formatter: () => displayValue
						},
						total: {
							show: true,
							label: displayLabel,
							fontSize: '14px',
							fontWeight: 500,
							color: '#64748b',
							formatter: () => displayValue
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: showLegend,
			position: 'bottom',
			horizontalAlign: 'center',
			fontSize: '12px',
			fontWeight: 500,
			labels: {
				colors: '#64748b'
			},
			markers: {
				size: 6,
				shape: 'square' as const,
				offsetX: 0,
				offsetY: 0
			},
			itemMargin: {
				horizontal: 12,
				vertical: 4
			},
			formatter: (seriesName, opts) => {
				const value = opts.w.globals.series[opts.seriesIndex];
				const percentage = ((value / total) * 100).toFixed(1);
				return `${seriesName}: ${value.toLocaleString()} (${percentage}%)`;
			}
		},
		tooltip: {
			enabled: true,
			y: {
				formatter: (val) => val.toLocaleString()
			}
		},
		stroke: {
			width: 2,
			colors: ['#ffffff']
		}
	});
</script>

<div class="w-full">
	<Chart {options} />
</div>
