<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { Heart, Home, Users, Vote } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}
</script>

<!-- Sitio Header Block -->
<div class="relative mb-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5">
	<div
		class="absolute top-0 left-0 h-2 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500"
	></div>
	<div class="flex flex-col gap-6 p-6 md:flex-row md:items-start md:justify-between lg:p-8">
		<div class="flex-1 space-y-4">
			<div class="flex flex-wrap items-center gap-2">
				<Badge variant="secondary" class="bg-blue-50 text-blue-700 hover:bg-blue-100">
					{sitio.municipality}
				</Badge>
				<Badge variant="secondary" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
					{sitio.barangay}
				</Badge>
				{#if sitio.coding}
					<Badge variant="outline" class="font-mono text-slate-500">
						Code: {sitio.coding.code}
					</Badge>
				{/if}
			</div>
			<div>
				<h1 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
					{sitio.name}
				</h1>
				<p class="mt-1 text-slate-500">
					Detailed demographics and development data for {sitio.name}, {sitio.barangay}.
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Key Metrics Grid -->
<!-- Key Metrics Grid -->
<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card.Root class="group relative overflow-hidden transition-all hover:shadow-md">
		<div
			class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50 transition-transform group-hover:scale-110"
		></div>
		<Card.Content class="p-6">
			<div class="flex items-center gap-4">
				<div class="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-100">
					<Users class="size-6 text-blue-600" />
				</div>
				<div>
					<div class="text-sm font-medium text-slate-500">Population</div>
					<div class="text-2xl font-bold tracking-tight text-slate-900">
						{formatNumber(sitio.population)}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="group relative overflow-hidden transition-all hover:shadow-md">
		<div
			class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 transition-transform group-hover:scale-110"
		></div>
		<Card.Content class="p-6">
			<div class="flex items-center gap-4">
				<div class="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100">
					<Home class="size-6 text-emerald-600" />
				</div>
				<div>
					<div class="text-sm font-medium text-slate-500">Households</div>
					<div class="text-2xl font-bold tracking-tight text-slate-900">
						{formatNumber(sitio.households)}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="group relative overflow-hidden transition-all hover:shadow-md">
		<div
			class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50 transition-transform group-hover:scale-110"
		></div>
		<Card.Content class="p-6">
			<div class="flex items-center gap-4">
				<div class="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
					<Vote class="size-6 text-amber-600" />
				</div>
				<div>
					<div class="text-sm font-medium text-slate-500">Registered Voters</div>
					<div class="text-2xl font-bold tracking-tight text-slate-900">
						{sitio.social_services?.registered_voters
							? formatNumber(sitio.social_services.registered_voters)
							: 'N/A'}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="group relative overflow-hidden transition-all hover:shadow-md">
		<div
			class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50 transition-transform group-hover:scale-110"
		></div>
		<Card.Content class="p-6">
			<div class="flex items-center gap-4">
				<div class="rounded-xl bg-purple-50 p-3 ring-1 ring-purple-100">
					<Heart class="size-6 text-purple-600" />
				</div>
				<div>
					<div class="text-sm font-medium text-slate-500">4Ps Beneficiaries</div>
					<div class="text-2xl font-bold tracking-tight text-slate-900">
						{sitio.social_services?.fourps_beneficiaries
							? formatNumber(sitio.social_services.fourps_beneficiaries)
							: 'N/A'}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
