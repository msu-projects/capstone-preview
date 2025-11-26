<script lang="ts">
	import DemographicBarChart from '$lib/components/charts/DemographicBarChart.svelte';
	import DemographicDonutChart from '$lib/components/charts/DemographicDonutChart.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { Banknote, Beef, Briefcase, Sprout } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Employment types data
	const employmentData = $derived(
		sitio.economic_condition?.employments
			? sitio.economic_condition.employments
					.sort((a, b) => b.count - a.count)
					.map((e, i) => ({
						label: e.type,
						value: e.count,
						color: [
							'hsl(217, 91%, 60%)',
							'hsl(142, 71%, 45%)',
							'hsl(24, 95%, 53%)',
							'hsl(262, 83%, 58%)',
							'hsl(189, 85%, 45%)'
						][i % 5]
					}))
			: []
	);

	// Income brackets data
	const incomeData = $derived(
		sitio.economic_condition?.income_brackets
			? sitio.economic_condition.income_brackets.map((ib, i) => ({
					label: `₱${ib.bracket}/day`,
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

	// Livestock data (filtered to non-zero)
	const livestockData = $derived.by(() => {
		const lp = sitio.livestock_poultry;
		if (!lp) return [];
		return [
			{ label: 'Chickens', value: lp.chickens || 0 },
			{ label: 'Pigs', value: lp.pigs || 0 },
			{ label: 'Goats', value: lp.goats || 0 },
			{ label: 'Cows', value: lp.cows || 0 },
			{ label: 'Ducks', value: lp.ducks || 0 },
			{ label: 'Carabaos', value: lp.carabaos || 0 },
			{ label: 'Horses', value: lp.horses || 0 }
		]
			.filter((item) => item.value > 0)
			.sort((a, b) => b.value - a.value)
			.map((item, i) => ({
				...item,
				color: [
					'hsl(217, 91%, 60%)',
					'hsl(142, 71%, 45%)',
					'hsl(24, 95%, 53%)',
					'hsl(262, 83%, 58%)',
					'hsl(189, 85%, 45%)'
				][i % 5]
			}));
	});
</script>

<!-- Economic & Livelihoods Tab -->
<div class="space-y-6">
	<!-- Employment and Income Row -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Employment Types Chart -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-50 p-1.5">
						<Briefcase class="size-4 text-blue-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Employment Types</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if employmentData.length > 0}
					<div style="height: 300px;">
						<DemographicBarChart data={employmentData} orientation="horizontal" />
					</div>
				{:else}
					<div class="flex h-[300px] items-center justify-center">
						<div class="text-center">
							<Briefcase class="mx-auto size-12 text-slate-300" />
							<p class="mt-2 text-sm text-slate-500">No employment data recorded</p>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Income Distribution Chart -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-50 p-1.5">
						<Banknote class="size-4 text-emerald-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Income Distribution</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if incomeData.length > 0}
					<div style="height: 300px;">
						<DemographicDonutChart
							data={incomeData}
							centerText={formatNumber(sitio.households)}
							centerSubtext="Households"
						/>
					</div>
				{:else}
					<div class="flex h-[300px] items-center justify-center">
						<div class="text-center">
							<Banknote class="mx-auto size-12 text-slate-300" />
							<p class="mt-2 text-sm text-slate-500">No income data recorded</p>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Agriculture Row -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Agriculture Overview -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-green-50 p-1.5">
						<Sprout class="size-4 text-green-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Agriculture Overview</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-4 pt-0">
				{#if sitio.agriculture}
					<div class="grid grid-cols-3 gap-4">
						<div class="rounded bg-slate-50 p-3 text-center">
							<div class="text-2xl font-bold text-slate-900">
								{formatNumber(sitio.agriculture.farmers_count)}
							</div>
							<div class="text-xs text-slate-500">Farmers</div>
						</div>
						<div class="rounded bg-slate-50 p-3 text-center">
							<div class="text-2xl font-bold text-slate-900">
								{formatNumber(sitio.agriculture.farmer_associations)}
							</div>
							<div class="text-xs text-slate-500">Associations</div>
						</div>
						<div class="rounded bg-slate-50 p-3 text-center">
							<div class="text-2xl font-bold text-slate-900">
								{sitio.agriculture.farm_area_hectares.toFixed(1)}
							</div>
							<div class="text-xs text-slate-500">Hectares</div>
						</div>
					</div>
				{:else}
					<div class="py-8 text-center">
						<Sprout class="mx-auto size-12 text-slate-300" />
						<p class="mt-2 text-sm text-slate-500">No agriculture data available</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Top Crops -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-amber-50 p-1.5">
						<Sprout class="size-4 text-amber-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Top Crops</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				{#if sitio.agriculture?.top_crops && sitio.agriculture.top_crops.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each sitio.agriculture.top_crops as crop, i}
							<Badge
								variant="outline"
								class="border-green-200 bg-green-50 px-3 py-1 text-green-700"
							>
								{i + 1}. {crop}
							</Badge>
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center">
						<p class="text-sm text-slate-500">No crop data recorded</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Livestock & Poultry Chart -->
	{#if livestockData.length > 0}
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-orange-50 p-1.5">
						<Beef class="size-4 text-orange-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Livestock & Poultry</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				<div style="height: 300px;">
					<DemographicBarChart data={livestockData} orientation="horizontal" />
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
