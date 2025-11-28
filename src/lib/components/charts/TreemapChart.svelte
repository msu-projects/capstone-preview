<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	export interface TreemapData {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: TreemapData[];
		height?: number;
		title?: string;
		distributed?: boolean;
	}

	let { data, height = 350, title, distributed = true }: Props = $props();

	// Default color palette
	const defaultColors = [
		'hsl(217, 91%, 60%)', // blue
		'hsl(142, 71%, 45%)', // green
		'hsl(48, 96%, 53%)', // yellow
		'hsl(280, 70%, 60%)', // purple
		'hsl(340, 82%, 52%)', // pink
		'hsl(24, 95%, 53%)', // orange
		'hsl(173, 80%, 40%)', // teal
		'hsl(199, 89%, 48%)' // sky
	];

	// Transform data for treemap
	const treemapData = $derived(
		data.map((d, i) => ({
			x: d.label,
			y: d.value,
			fillColor: d.color || defaultColors[i % defaultColors.length]
		}))
	);

	const options = $derived<ApexOptions>({
		chart: {
			type: 'treemap',
			height: height,
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			toolbar: {
				show: false
			}
		},
		series: [
			{
				data: treemapData
			}
		],
		legend: {
			show: false
		},
		dataLabels: {
			enabled: true,
			style: {
				fontSize: '13px',
				fontWeight: 600,
				colors: ['#fff']
			},
			formatter: function (text, op) {
				return [text, op.value.toLocaleString()];
			},
			offsetY: -4
		},
		plotOptions: {
			treemap: {
				distributed: distributed,
				enableShades: !distributed,
				shadeIntensity: 0.5,
				colorScale: {
					ranges: distributed
						? []
						: [
								{ from: 0, to: 10, color: '#cbd5e1' },
								{ from: 11, to: 50, color: '#94a3b8' },
								{ from: 51, to: 100, color: '#64748b' },
								{ from: 101, to: 500, color: '#475569' },
								{ from: 501, to: 10000, color: '#334155' }
							]
				}
			}
		},
		tooltip: {
			y: {
				formatter: (val) => val.toLocaleString()
			}
		},
		stroke: {
			width: 2,
			colors: ['#fff']
		}
	});
</script>

<div class="treemap-chart">
	<Chart {options} />
</div>

<style>
	.treemap-chart {
		width: 100%;
	}
</style>
