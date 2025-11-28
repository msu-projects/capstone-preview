<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface HistogramData {
		bracket: string;
		count: number;
	}

	interface Props {
		data: HistogramData[];
		height?: number;
		title?: string;
		color?: string;
		highlightFirstBar?: boolean;
		highlightColor?: string;
		xAxisLabel?: string;
		yAxisLabel?: string;
	}

	let {
		data,
		height = 300,
		title = 'Distribution',
		color = 'hsl(142, 71%, 45%)',
		highlightFirstBar = false,
		highlightColor = 'hsl(0, 84%, 60%)',
		xAxisLabel,
		yAxisLabel
	}: Props = $props();

	// Generate colors array - first bar highlighted if enabled
	const barColors = $derived(
		data.map((_, i) => (highlightFirstBar && i === 0 ? highlightColor : color))
	);

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
				columnWidth: '85%',
				borderRadius: 4,
				distributed: highlightFirstBar,
				dataLabels: {
					position: 'top'
				}
			}
		},
		colors: highlightFirstBar ? barColors : [color],
		legend: {
			show: false
		},
		dataLabels: {
			enabled: true,
			formatter: (val) => Number(val).toLocaleString(),
			offsetY: -20,
			style: {
				fontSize: '11px',
				fontWeight: 600,
				colors: ['#334155']
			}
		},
		series: [
			{
				name: title,
				data: data.map((d) => d.count)
			}
		],
		xaxis: {
			categories: data.map((d) => d.bracket),
			labels: {
				style: {
					colors: '#64748b',
					fontSize: '11px',
					fontWeight: 500
				},
				rotate: -45,
				rotateAlways: data.length > 5
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			...(xAxisLabel && {
				title: {
					text: xAxisLabel,
					style: {
						color: '#64748b',
						fontSize: '12px',
						fontWeight: 500
					}
				}
			})
		},
		yaxis: {
			labels: {
				style: {
					colors: '#64748b',
					fontSize: '12px',
					fontWeight: 500
				},
				formatter: (val) => val.toLocaleString()
			},
			...(yAxisLabel && {
				title: {
					text: yAxisLabel,
					style: {
						color: '#64748b',
						fontSize: '12px',
						fontWeight: 500
					}
				}
			})
		},
		grid: {
			borderColor: '#e2e8f0',
			strokeDashArray: 4,
			xaxis: {
				lines: {
					show: false
				}
			}
		},
		tooltip: {
			y: {
				formatter: (val) => `${val.toLocaleString()} households`
			}
		}
	});
</script>

<div class="histogram-chart">
	<Chart {options} />
</div>

<style>
	.histogram-chart {
		width: 100%;
	}
</style>
