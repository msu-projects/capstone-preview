<script lang="ts">
	import { themeStore } from '$lib/stores/theme.svelte';
	import type { MonthlyProgress, PerformanceTarget } from '$lib/types';
	import { getChartColors, getDefaultSeriesColors } from '$lib/utils/chart-colors';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	interface Props {
		monthlyProgress: MonthlyProgress[];
		performanceTargets: PerformanceTarget[];
		height?: number;
	}

	let { monthlyProgress, performanceTargets, height = 300 }: Props = $props();

	// Get theme-aware colors
	const colors = $derived(getChartColors());
	const defaultColors = $derived(getDefaultSeriesColors());

	// Sort monthly progress by month_year
	const sortedProgress = $derived(
		[...monthlyProgress].sort((a, b) => a.month_year.localeCompare(b.month_year))
	);

	// Get unique months as categories
	const categories = $derived(
		sortedProgress.map((p) => {
			const [year, month] = p.month_year.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
		})
	);

	// Get progress for each performance target over time (data is already cumulative)
	function getProgressForTarget(target: PerformanceTarget): number[] {
		const normalizedType = target.indicator_type?.toLowerCase().replace(/\s+/g, '_');
		const normalizedName = target.indicator_name?.toLowerCase().replace(/\s+/g, '_');

		return sortedProgress.map((progress) => {
			let value = 0;
			if (progress.achieved_outputs) {
				value =
					progress.achieved_outputs[normalizedType] ||
					progress.achieved_outputs[normalizedName] ||
					progress.achieved_outputs[target.indicator_type] ||
					progress.achieved_outputs[target.indicator_name] ||
					0;
			}
			// Return percentage of target achieved
			return Math.min((value / target.target_value) * 100, 100);
		});
	}

	// Build series data for each performance target
	const chartSeries = $derived(
		performanceTargets.map((target, i) => ({
			name: target.indicator_name,
			data: getProgressForTarget(target),
			color: defaultColors[i % defaultColors.length]
		}))
	);

	// Chart options
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
			curve: 'smooth',
			width: 3
		},
		dataLabels: {
			enabled: false
		},
		series: chartSeries.map((s) => ({
			name: s.name,
			data: s.data
		})),
		xaxis: {
			categories: categories,
			labels: {
				style: {
					colors: colors.labelColor,
					fontSize: '11px',
					fontWeight: 500
				},
				rotate: -45,
				rotateAlways: categories.length > 6
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			}
		},
		yaxis: {
			min: 0,
			max: 100,
			labels: {
				style: {
					colors: colors.labelColor,
					fontSize: '12px',
					fontWeight: 500
				},
				formatter: (val: number) => `${val.toFixed(0)}%`
			},
			title: {
				text: '% of Target',
				style: {
					color: colors.labelColor,
					fontSize: '12px',
					fontWeight: 500
				}
			}
		},
		grid: {
			show: true,
			borderColor: colors.gridColor,
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
			size: 4,
			colors: chartSeries.map((s) => s.color),
			strokeColors: themeStore.resolvedTheme === 'dark' ? '#1e293b' : '#fff',
			strokeWidth: 2,
			hover: {
				size: 6
			}
		},
		tooltip: {
			enabled: true,
			shared: true,
			intersect: false,
			theme: themeStore.resolvedTheme,
			y: {
				formatter: (val: number) => `${val.toFixed(1)}%`
			}
		},
		legend: {
			show: true,
			position: 'bottom',
			horizontalAlign: 'center',
			fontSize: '12px',
			fontWeight: 500,
			labels: {
				colors: colors.labelColor
			},
			markers: {
				size: 8,
				shape: 'circle'
			},
			itemMargin: {
				horizontal: 10,
				vertical: 6
			}
		},
		annotations: {
			yaxis: [
				{
					y: 100,
					borderColor: themeStore.resolvedTheme === 'dark' ? '#22c55e' : '#16a34a',
					strokeDashArray: 4,
					label: {
						borderColor: 'transparent',
						style: {
							color: themeStore.resolvedTheme === 'dark' ? '#22c55e' : '#16a34a',
							background: 'transparent',
							fontSize: '11px'
						},
						text: 'Target (100%)',
						position: 'left'
					}
				}
			]
		}
	});

	// Check if there's any data to show
	const hasData = $derived(
		sortedProgress.length > 0 && chartSeries.some((s) => s.data.some((v) => v > 0))
	);
</script>

<div class="w-full">
	{#if hasData}
		<div class="w-full" style="height: {height}px;">
			{#key themeStore.resolvedTheme}
				<Chart {options} />
			{/key}
		</div>
	{:else}
		<div
			class="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
		>
			<p class="text-sm text-slate-500 dark:text-slate-400">
				No performance indicator data available yet
			</p>
		</div>
	{/if}
</div>
