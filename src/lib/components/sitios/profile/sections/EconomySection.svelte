<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import DonutChart from '$lib/components/charts/DonutChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { Banknote, Beef, Briefcase, Leaf, Sprout, TrendingUp, Wheat } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		previousSnapshot?: SitioYearlySnapshot | null;
	}

	const { sitio, previousSnapshot = null }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Employment types data for chart
	const employmentData = $derived(
		sitio.economic_condition?.employments
			? sitio.economic_condition.employments
					.sort((a, b) => b.count - a.count)
					.slice(0, 6)
					.map((e, i) => ({
						label: e.type,
						value: e.count,
						color: [
							'hsl(217, 91%, 60%)',
							'hsl(142, 71%, 45%)',
							'hsl(24, 95%, 53%)',
							'hsl(262, 83%, 58%)',
							'hsl(189, 85%, 45%)',
							'hsl(340, 82%, 52%)'
						][i % 6]
					}))
			: []
	);

	// Income brackets data
	const incomeData = $derived(
		sitio.economic_condition?.income_brackets
			? sitio.economic_condition.income_brackets.map((ib, i) => ({
					label: formatIncomeBracket(ib.bracket),
					value: ib.households,
					color: [
						'hsl(217, 91%, 60%)',
						'hsl(142, 71%, 45%)',
						'hsl(24, 95%, 53%)',
						'hsl(262, 83%, 58%)'
					][i % 4]
				}))
			: []
	);

	// Total employed
	const totalEmployed = $derived(
		sitio.economic_condition?.employments?.reduce((sum, e) => sum + e.count, 0) || 0
	);

	// Top employment type
	const topEmployment = $derived(sitio.economic_condition?.employments?.[0]?.type || 'N/A');

	// Livestock data
	const livestockData = $derived.by(() => {
		const lp = sitio.livestock_poultry;
		if (!lp) return [];

		return [
			{ label: 'Chickens', value: lp.chickens || 0, icon: '🐔' },
			{ label: 'Pigs', value: lp.pigs || 0, icon: '🐷' },
			{ label: 'Goats', value: lp.goats || 0, icon: '🐐' },
			{ label: 'Cows', value: lp.cows || 0, icon: '🐄' },
			{ label: 'Ducks', value: lp.ducks || 0, icon: '🦆' },
			{ label: 'Carabaos', value: lp.carabaos || 0, icon: '🦬' },
			{ label: 'Horses', value: lp.horses || 0, icon: '🐴' }
		]
			.filter((item) => item.value > 0)
			.sort((a, b) => b.value - a.value);
	});

	const totalLivestock = $derived(livestockData.reduce((sum, l) => sum + l.value, 0));

	function formatIncomeBracket(bracket: string): string {
		switch (bracket) {
			case '<=100':
				return 'Below ₱100/day';
			case '100-300':
				return '₱100-300/day';
			case '300-500':
				return '₱300-500/day';
			case '>=500':
				return '₱500+/day';
			default:
				return bracket;
		}
	}
</script>

<div class="space-y-6">
	<!-- Key Economic Indicators -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-blue-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Briefcase class="size-5 text-blue-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Total Employed</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(totalEmployed)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<TrendingUp class="size-5 text-emerald-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Top Employment</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{topEmployment}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-green-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-green-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Sprout class="size-5 text-green-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Farmers</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(sitio.agriculture?.farmers_count || 0)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-amber-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-amber-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Beef class="size-5 text-amber-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Livestock</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(totalLivestock)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Employment and Income Charts -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Employment Types -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-100 p-1.5">
							<Briefcase class="size-4 text-blue-600" />
						</div>
						<Card.Title class="text-lg">Employment Types</Card.Title>
					</div>
					{#if totalEmployed > 0}
						<Badge variant="outline" class="bg-blue-50 text-blue-700">
							{formatNumber(totalEmployed)} Total
						</Badge>
					{/if}
				</div>
			</Card.Header>
			<Card.Content class="py-6">
				{#if employmentData.length > 0}
					<div style="height: 300px;">
						<BarChart data={employmentData} orientation="horizontal" height={300} />
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Briefcase class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No employment data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Income Distribution -->
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-100 p-1.5">
						<Banknote class="size-4 text-emerald-600" />
					</div>
					<Card.Title class="text-lg">Income Distribution</Card.Title>
				</div>
				<Card.Description>Daily income brackets by household</Card.Description>
			</Card.Header>
			<Card.Content class="py-6">
				{#if incomeData.length > 0}
					<div style="height: 280px;">
						<DonutChart
							data={incomeData}
							centerValue={formatNumber(sitio.households)}
							centerLabel="Households"
							height={280}
						/>
					</div>
					<!-- Income Legend -->
					<div class="mt-4 grid grid-cols-2 gap-2">
						{#each incomeData as income, i}
							<div class="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
								<div class="h-3 w-3 rounded-full" style="background-color: {income.color}"></div>
								<span class="truncate text-slate-600">{income.label}</span>
								<span class="ml-auto font-semibold text-slate-900">{income.value}</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center py-12 text-center">
						<Banknote class="size-16 text-slate-200" />
						<p class="mt-4 text-sm text-slate-500">No income data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Agriculture Profile -->
	<Card.Root class="gap-0 overflow-hidden py-0 shadow-sm">
		<Card.Header class="border-b bg-green-50/50 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-green-100 p-1.5">
						<Leaf class="size-4 text-green-600" />
					</div>
					<div>
						<Card.Title class="text-lg">Agriculture Profile</Card.Title>
						<Card.Description>Farming activities and crop production</Card.Description>
					</div>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="py-6">
			{#if sitio.agriculture}
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<!-- Stats -->
					<div class="grid grid-cols-2 gap-4 lg:col-span-1">
						<div class="rounded-xl bg-green-50 p-4 text-center ring-1 ring-green-100">
							<div class="text-3xl font-bold text-green-700">
								{formatNumber(sitio.agriculture.farmers_count)}
							</div>
							<div class="mt-1 text-xs font-medium text-green-600">Farmers</div>
						</div>
						<div class="rounded-xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
							<div class="text-3xl font-bold text-emerald-700">
								{sitio.agriculture.farmer_associations}
							</div>
							<div class="mt-1 text-xs font-medium text-emerald-600">Associations</div>
						</div>
						<div class="col-span-2 rounded-xl bg-teal-50 p-4 text-center ring-1 ring-teal-100">
							<div class="text-3xl font-bold text-teal-700">
								{sitio.agriculture.farm_area_hectares.toFixed(0)} ha
							</div>
							<div class="mt-1 text-xs font-medium text-teal-600">Total Farm Area</div>
						</div>
					</div>

					<!-- Primary Crops -->
					<div class="lg:col-span-2">
						<div class="mb-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
							Primary Crops Cultivated
						</div>
						{#if sitio.agriculture.top_crops && sitio.agriculture.top_crops.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each sitio.agriculture.top_crops as crop, i}
									<Badge
										variant="secondary"
										class="gap-1.5 bg-green-50 px-3 py-2 text-sm text-green-700 ring-1 ring-green-200"
									>
										<Wheat class="size-4" />
										{crop}
									</Badge>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-slate-500">No crop data recorded</p>
						{/if}

						<!-- Agriculture Summary -->
						<div class="mt-6 rounded-lg border border-green-200 bg-green-50/50 p-4">
							<div class="text-sm font-medium text-green-800">Agriculture Summary</div>
							<p class="mt-1 text-sm text-green-700">
								This community has {formatNumber(sitio.agriculture.farmers_count)} registered farmers
								organized into {sitio.agriculture.farmer_associations} association{sitio.agriculture
									.farmer_associations > 1
									? 's'
									: ''}, cultivating approximately {sitio.agriculture.farm_area_hectares.toFixed(0)}
								hectares of arable land.
							</p>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<Leaf class="size-16 text-slate-200" />
					<p class="mt-4 text-sm text-slate-500">No agriculture data available</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Livestock Census -->
	<Card.Root class="gap-0 py-0 shadow-sm">
		<Card.Header class="border-b bg-slate-50/50 py-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-amber-100 p-1.5">
						<Beef class="size-4 text-amber-600" />
					</div>
					<Card.Title class="text-lg">Livestock & Poultry Census</Card.Title>
				</div>
				{#if totalLivestock > 0}
					<Badge variant="outline" class="bg-amber-50 text-amber-700">
						{formatNumber(totalLivestock)} Total
					</Badge>
				{/if}
			</div>
		</Card.Header>
		<Card.Content class="py-6">
			{#if livestockData.length > 0}
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{#each livestockData as animal}
						<div
							class="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200 transition-all hover:bg-slate-100 hover:ring-slate-300"
						>
							<div class="text-3xl">{animal.icon}</div>
							<div class="mt-2 text-xl font-bold text-slate-900">{formatNumber(animal.value)}</div>
							<div class="text-xs font-medium text-slate-500">{animal.label}</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<Beef class="size-16 text-slate-200" />
					<p class="mt-4 text-sm text-slate-500">No livestock data available</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
