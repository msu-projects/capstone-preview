<script lang="ts">
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	interface ChartDataItem {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: ChartDataItem[];
		centerText?: string;
		centerSubtext?: string;
	}

	const { data, centerText = '', centerSubtext = '' }: Props = $props();

	// Prepare chart options
	const options = $derived<ApexOptions>({
		chart: {
			type: 'donut',
			fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
			toolbar: {
				show: false
			}
		},
		series: data.map((d) => d.value),
		labels: data.map((d) => d.label),
		colors: data.map((d) => d.color || 'hsl(217, 91%, 60%)'),
		plotOptions: {
			pie: {
				donut: {
					size: '70%',
					labels: {
						show: !!centerText,
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
							formatter: (val) => centerText || val
						},
						total: {
							show: true,
							label: centerSubtext,
							fontSize: '14px',
							fontWeight: 500,
							color: '#64748b',
							formatter: () => centerText
						}
					}
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
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

<div class="h-full w-full">
	<Chart {options} />
</div>
