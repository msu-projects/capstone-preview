<script lang="ts">
	import DemographicBarChart from '$lib/components/charts/DemographicBarChart.svelte';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { Percent, Users } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	// Gender distribution data
	const genderData = $derived([
		{
			label: 'Male',
			value: sitio.demographics.male,
			color: 'hsl(217, 91%, 60%)' // Blue
		},
		{
			label: 'Female',
			value: sitio.demographics.female,
			color: 'hsl(340, 82%, 62%)' // Pink
		}
	]);

	// Age distribution data
	const ageData = $derived([
		{
			label: '0-14 years',
			value: sitio.demographics.age_0_14,
			color: 'hsl(217, 91%, 60%)' // Blue
		},
		{
			label: '15-64 years',
			value: sitio.demographics.age_15_64,
			color: 'hsl(142, 71%, 45%)' // Green
		},
		{
			label: '65+ years',
			value: sitio.demographics.age_65_above,
			color: 'hsl(24, 95%, 53%)' // Orange
		}
	]);

	// Calculate percentages
	const malePercentage = $derived(
		sitio.population > 0 ? ((sitio.demographics.male / sitio.population) * 100).toFixed(1) : '0'
	);
	const femalePercentage = $derived(
		sitio.population > 0 ? ((sitio.demographics.female / sitio.population) * 100).toFixed(1) : '0'
	);

	// Calculate dependency ratio
	const dependencyRatio = $derived.by(() => {
		const working = sitio.demographics.age_15_64;
		const dependent = sitio.demographics.age_0_14 + sitio.demographics.age_65_above;
		return working > 0 ? ((dependent / working) * 100).toFixed(1) : '0';
	});
</script>

<!-- Demographics Tab -->
<div class="space-y-6">
	<!-- Charts Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Gender Distribution Chart -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-50 p-1.5">
						<Users class="size-4 text-blue-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Gender Distribution</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				<div style="height: 180px;">
					<DemographicBarChart data={genderData} orientation="horizontal" />
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Age Distribution Chart -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-50 p-1.5">
						<Users class="size-4 text-emerald-600" />
					</div>
					<h3 class="text-lg font-semibold text-slate-800">Age Distribution</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				<div style="height: 240px;">
					<DemographicBarChart data={ageData} orientation="vertical" />
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Summary Statistics Grid -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
		<!-- Population Summary -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-blue-50 p-1.5">
						<Users class="size-4 text-blue-600" />
					</div>
					<h3 class="text-base font-semibold text-slate-800">Total Population</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-3 pt-0">
				<div class="text-center">
					<div class="text-4xl font-bold text-slate-900">{formatNumber(sitio.population)}</div>
					<div class="mt-1 text-sm text-slate-500">people</div>
				</div>
				<div class="flex justify-around border-t pt-3">
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-600">
							{formatNumber(sitio.demographics.male)}
						</div>
						<div class="text-xs text-slate-500">Male ({malePercentage}%)</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-pink-600">
							{formatNumber(sitio.demographics.female)}
						</div>
						<div class="text-xs text-slate-500">Female ({femalePercentage}%)</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Age Groups Summary -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-emerald-50 p-1.5">
						<Users class="size-4 text-emerald-600" />
					</div>
					<h3 class="text-base font-semibold text-slate-800">Age Groups</h3>
				</div>
			</Card.Header>
			<Card.Content class="space-y-2 pt-0">
				<div class="flex justify-between rounded bg-slate-50 p-2">
					<span class="text-sm text-slate-600">Children (0-14)</span>
					<span class="font-semibold text-slate-900">
						{formatNumber(sitio.demographics.age_0_14)}
					</span>
				</div>
				<div class="flex justify-between rounded bg-slate-50 p-2">
					<span class="text-sm text-slate-600">Working Age (15-64)</span>
					<span class="font-semibold text-slate-900">
						{formatNumber(sitio.demographics.age_15_64)}
					</span>
				</div>
				<div class="flex justify-between rounded bg-slate-50 p-2">
					<span class="text-sm text-slate-600">Seniors (65+)</span>
					<span class="font-semibold text-slate-900">
						{formatNumber(sitio.demographics.age_65_above)}
					</span>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Dependency Ratio -->
		<Card.Root class="shadow-sm">
			<Card.Header>
				<div class="flex items-center gap-2">
					<div class="rounded-lg bg-amber-50 p-1.5">
						<Percent class="size-4 text-amber-600" />
					</div>
					<h3 class="text-base font-semibold text-slate-800">Dependency Ratio</h3>
				</div>
			</Card.Header>
			<Card.Content class="pt-0">
				<div class="text-center">
					<div class="text-4xl font-bold text-amber-600">{dependencyRatio}%</div>
					<div class="mt-2 text-xs text-slate-500">
						Ratio of dependents (children + seniors) to working-age population
					</div>
				</div>
				<div class="mt-4 rounded bg-amber-50 p-3">
					<div class="text-xs font-medium text-amber-800">Interpretation:</div>
					<div class="mt-1 text-xs text-amber-700">
						{#if Number(dependencyRatio) < 50}
							Low dependency - Strong working-age population
						{:else if Number(dependencyRatio) < 75}
							Moderate dependency - Balanced population structure
						{:else}
							High dependency - Many dependents per working adult
						{/if}
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
