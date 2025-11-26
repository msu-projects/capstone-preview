<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { Sitio } from '$lib/types';
	import { Users, Home, Vote, Heart } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}
</script>

<!-- Sitio Header Block -->
<div class="mb-5 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
	<div class="flex-1 space-y-3">
		<div class="flex flex-wrap items-center gap-2">
			<Badge variant="outline" class="bg-blue-50 text-blue-700">
				{sitio.municipality}
			</Badge>
			<Badge variant="outline" class="bg-blue-50 text-blue-700">
				{sitio.barangay}
			</Badge>
			{#if sitio.coding}
				<Badge variant="secondary">Code: {sitio.coding.code}</Badge>
			{/if}
		</div>
		<h1 class="text-3xl leading-tight font-bold tracking-tight text-slate-900">
			{sitio.name}
		</h1>
	</div>
</div>

<!-- Key Metrics Grid -->
<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card.Root class="py-0 shadow-sm">
		<Card.Content class="p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-blue-50 p-2">
					<Users class="size-5 text-blue-600" />
				</div>
				<div>
					<div class="text-xs font-medium text-slate-500">Population</div>
					<div class="text-xl font-bold text-slate-900">{formatNumber(sitio.population)}</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="py-0 shadow-sm">
		<Card.Content class="p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-emerald-50 p-2">
					<Home class="size-5 text-emerald-600" />
				</div>
				<div>
					<div class="text-xs font-medium text-slate-500">Households</div>
					<div class="text-xl font-bold text-slate-900">{formatNumber(sitio.households)}</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="py-0 shadow-sm">
		<Card.Content class="p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-amber-50 p-2">
					<Vote class="size-5 text-amber-600" />
				</div>
				<div>
					<div class="text-xs font-medium text-slate-500">Registered Voters</div>
					<div class="text-xl font-bold text-slate-900">
						{sitio.social_services?.registered_voters
							? formatNumber(sitio.social_services.registered_voters)
							: 'N/A'}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root class="py-0 shadow-sm">
		<Card.Content class="p-4">
			<div class="flex items-center gap-3">
				<div class="rounded-lg bg-purple-50 p-2">
					<Heart class="size-5 text-purple-600" />
				</div>
				<div>
					<div class="text-xs font-medium text-slate-500">4Ps Beneficiaries</div>
					<div class="text-xl font-bold text-slate-900">
						{sitio.social_services?.fourps_beneficiaries
							? formatNumber(sitio.social_services.fourps_beneficiaries)
							: 'N/A'}
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
