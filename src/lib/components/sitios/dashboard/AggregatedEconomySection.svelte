<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import HistogramChart from '$lib/components/charts/HistogramChart.svelte';
	import TreemapChart from '$lib/components/charts/TreemapChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		aggregateAgriculture,
		aggregateEconomy,
		mapToChartData
	} from '$lib/utils/sitio-aggregation';
	import { Banknote, Briefcase, Leaf, Tractor, Warehouse } from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
	}

	const { sitios }: Props = $props();

	// Compute aggregated data
	const economy = $derived(aggregateEconomy(sitios));
	const agriculture = $derived(aggregateAgriculture(sitios));

	// Employment chart data
	const employmentChartData = $derived(mapToChartData(economy.employmentByType));

	// Income bracket chart data (convert to HistogramData format)
	const incomeBracketData = $derived(
		Array.from(economy.incomeBracketDistribution.entries()).map(([bracket, count]) => ({
			bracket,
			count
		}))
	);

	// Livestock data - now based on frequency (how many sitios have each livestock type)
	const livestockData = $derived(
		economy.livestockList.map((item, i) => ({
			label: item.type,
			value: item.count,
			color: [
				'hsl(45, 93%, 47%)',
				'hsl(200, 70%, 50%)',
				'hsl(330, 81%, 60%)',
				'hsl(24, 95%, 53%)',
				'hsl(142, 71%, 45%)',
				'hsl(262, 83%, 58%)',
				'hsl(217, 91%, 60%)'
			][i % 7]
		}))
	);

	// Total unique livestock types across all sitios
	const totalLivestockTypes = $derived(economy.livestockList.length);

	// Top crops list (limited to top 8)
	const topCrops = $derived(agriculture.topCropsList.slice(0, 8));
</script>

<div class="space-y-6">
	<!-- Key Economic Indicators -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Total Farmers -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-50 opacity-50 dark:bg-green-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-green-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-green-900/30">
						<Tractor class="size-5 text-green-700 sm:size-6 dark:text-green-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Total Farmers
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(agriculture.totalFarmers)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Farm Area -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50 dark:bg-amber-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-amber-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-amber-900/30">
						<Leaf class="size-5 text-amber-700 sm:size-6 dark:text-amber-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Farm Area
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(agriculture.totalFarmAreaHectares)} ha
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Farmer Associations -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50 dark:bg-blue-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-blue-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-blue-900/30">
						<Briefcase class="size-5 text-blue-700 sm:size-6 dark:text-blue-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Farmer Associations
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{formatNumber(agriculture.totalFarmerAssociations)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Total Livestock -->
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50 dark:bg-slate-800/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50 dark:bg-purple-900/30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div
						class="rounded-xl bg-purple-50 p-2.5 ring-1 ring-black/5 sm:p-3 dark:bg-purple-900/30"
					>
						<Warehouse class="size-5 text-purple-700 sm:size-6 dark:text-purple-400" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
							Livestock Types
						</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-slate-100"
						>
							{totalLivestockTypes}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts Row -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Employment Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Briefcase class="size-5 text-slate-500 dark:text-slate-400" />
					Employment Distribution
				</Card.Title>
				<Card.Description>Types of employment across all sitios</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if employmentChartData.length > 0}
					<TreemapChart data={employmentChartData} height={280} />
				{:else}
					<div
						class="flex h-[280px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No employment data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Income Brackets -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Banknote class="size-5 text-slate-500 dark:text-slate-400" />
					Income Distribution
				</Card.Title>
				<Card.Description>Household income bracket distribution</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if incomeBracketData.length > 0}
					<HistogramChart data={incomeBracketData} height={280} />
				{:else}
					<div
						class="flex h-[280px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No income data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Livestock & Agriculture Row -->
	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Livestock Distribution -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Warehouse class="size-5 text-slate-500 dark:text-slate-400" />
					Livestock & Poultry
				</Card.Title>
				<Card.Description>Number of sitios with each livestock type</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if livestockData.length > 0}
					<BarChart data={livestockData} orientation="horizontal" height={280} />
				{:else}
					<div
						class="flex h-[280px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No livestock data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Top Crops -->
		<Card.Root class="border-0 shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50">
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Leaf class="size-5 text-slate-500 dark:text-slate-400" />
					Top Agricultural Crops
				</Card.Title>
				<Card.Description>Most common crops grown across sitios</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if topCrops.length > 0}
					<div class="space-y-3">
						{#each topCrops as crop, index}
							<div class="flex items-center gap-3">
								<div
									class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400"
								>
									{index + 1}
								</div>
								<div class="min-w-0 flex-1">
									<div class="flex items-center justify-between">
										<span class="truncate font-medium text-slate-900 dark:text-slate-100"
											>{crop.crop}</span
										>
										<span class="text-sm text-slate-500 dark:text-slate-400"
											>{crop.count} sitios</span
										>
									</div>
									<div
										class="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
									>
										<div
											class="h-full rounded-full bg-green-500"
											style="width: {(crop.count / topCrops[0].count) * 100}%"
										></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div
						class="flex h-[280px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
					>
						No crop data available
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
