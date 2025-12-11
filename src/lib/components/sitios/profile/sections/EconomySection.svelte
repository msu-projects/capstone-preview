<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import type { SitioYearlySnapshot } from '$lib/types/sitio-yearly';
	import { formatNumber } from '$lib/utils/formatters';
	import { Banknote, Beef, Briefcase, Leaf, Sprout, TrendingUp, Wheat } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		previousSnapshot?: SitioYearlySnapshot | null;
	}

	const { sitio, previousSnapshot = null }: Props = $props();

	// Employment types data - just display as badges now
	const employmentTypes = $derived(sitio.economic_condition?.employments || []);

	// Income brackets data - just display as badges
	const incomeBrackets = $derived(sitio.economic_condition?.income_brackets || []);

	// Top employment type
	const topEmployment = $derived.by((): string => {
		const emps = sitio.economic_condition?.employments;
		if (!emps || emps.length === 0) return 'N/A';
		return emps[0] || 'N/A';
	});

	// Livestock data - now just a string array
	const hasLivestock = $derived(sitio.livestock_poultry && sitio.livestock_poultry.length > 0);
	const livestockCount = $derived(sitio.livestock_poultry?.length || 0);

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
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Livestock Types</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{livestockCount}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Employment and Income Display -->
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
					{#if employmentTypes.length > 0}
						<Badge variant="outline" class="bg-blue-50 text-blue-700">
							{employmentTypes.length}
							{employmentTypes.length === 1 ? 'Type' : 'Types'}
						</Badge>
					{/if}
				</div>
				<Card.Description>Common types of employment in this sitio</Card.Description>
			</Card.Header>
			<Card.Content class="py-6">
				{#if employmentTypes.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each employmentTypes as type}
							<Badge variant="secondary" class="px-3 py-1.5 text-sm">
								{type}
							</Badge>
						{/each}
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
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-emerald-100 p-1.5">
							<Banknote class="size-4 text-emerald-600" />
						</div>
						<Card.Title class="text-lg">Income Distribution</Card.Title>
					</div>
					{#if incomeBrackets.length > 0}
						<Badge variant="outline" class="bg-emerald-50 text-emerald-700">
							{incomeBrackets.length}
							{incomeBrackets.length === 1 ? 'Bracket' : 'Brackets'}
						</Badge>
					{/if}
				</div>
				<Card.Description>Daily income brackets present in this sitio</Card.Description>
			</Card.Header>
			<Card.Content class="py-6">
				{#if incomeBrackets.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each incomeBrackets as bracket}
							<Badge variant="outline" class="px-3 py-1.5 text-sm">
								{formatIncomeBracket(bracket)}
							</Badge>
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
					<Card.Title class="text-lg">Livestock & Poultry</Card.Title>
				</div>
				{#if hasLivestock}
					<Badge variant="outline" class="bg-amber-50 text-amber-700">
						{livestockCount} Types
					</Badge>
				{/if}
			</div>
		</Card.Header>
		<Card.Content class="py-6">
			{#if hasLivestock}
				<div class="flex flex-wrap gap-2">
					{#each sitio.livestock_poultry as animal}
						<Badge
							variant="secondary"
							class="gap-1.5 bg-amber-50 px-3 py-2 text-sm text-amber-700 ring-1 ring-amber-200"
						>
							<Beef class="size-4" />
							{animal}
						</Badge>
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
