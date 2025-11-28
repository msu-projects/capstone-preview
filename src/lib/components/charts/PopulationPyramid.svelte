<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface AgeGroupData {
		ageGroup: string;
		male: number;
		female: number;
	}

	interface Props {
		data: AgeGroupData[];
		height?: number;
		title?: string;
		maleColor?: string;
		femaleColor?: string;
	}

	let {
		data,
		height = 350,
		title = 'Population Pyramid',
		maleColor = 'hsl(217, 91%, 60%)',
		femaleColor = 'hsl(330, 81%, 60%)'
	}: Props = $props();

	// Transform data for bi-directional bar chart
	// Male values are negative (left side), Female values are positive (right side)
	const options = $derived<ApexOptions>({
		chart: {
			type: 'bar',
			height: height,
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			stacked: true,
			toolbar: {
				show: false
			}
		},
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: '80%',
				borderRadius: 4
			}
		},
		colors: [maleColor, femaleColor],
		dataLabels: {
			enabled: false
		},
		stroke: {
			width: 1,
			colors: ['#fff']
		},
		series: [
			{
				name: 'Male',
				data: data.map((d) => -d.male) // Negative for left side
			},
			{
				name: 'Female',
				data: data.map((d) => d.female)
			}
		],
		grid: {
			borderColor: '#e2e8f0',
			xaxis: {
				lines: {
					show: true
				}
			},
			yaxis: {
				lines: {
					show: false
				}
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
		xaxis: {
			categories: data.map((d) => d.ageGroup),
			labels: {
				style: {
					colors: '#64748b',
					fontSize: '12px',
					fontWeight: 500
				},
				formatter: (val) => Math.abs(Number(val)).toLocaleString()
			}
		},
		tooltip: {
			shared: false,
			y: {
				formatter: (val) => Math.abs(val).toLocaleString()
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
		}
	});
</script>

<div class="population-pyramid">
	<Chart {options} />
</div>

<style>
	.population-pyramid {
		width: 100%;
	}
</style>
