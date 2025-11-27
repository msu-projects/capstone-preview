<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Stats } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import { Activity, Banknote, CircleCheckBig, MapPin, TrendingUp, Users } from '@lucide/svelte';

	interface Props {
		stats: Stats;
		isLoading?: boolean;
	}

	let { stats, isLoading = false }: Props = $props();

	// Compact currency format for dashboard
	function formatCompactCurrency(num: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			notation: 'compact',
			maximumFractionDigits: 1
		}).format(num);
	}
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
	{#if isLoading}
		{#each Array(5) as _}
			<Card.Card class="shadow-sm">
				<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Skeleton class="h-4 w-24" />
					<Skeleton class="size-9 rounded-full" />
				</Card.CardHeader>
				<Card.CardContent>
					<Skeleton class="mb-2 h-8 w-20" />
					<Skeleton class="h-3 w-28" />
				</Card.CardContent>
			</Card.Card>
		{/each}
	{:else}
		<Card.Card class="shadow-sm">
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium text-muted-foreground"
					>Total Sitios</Card.CardTitle
				>
				<div class="rounded-full bg-blue-500/10 p-2">
					<MapPin class="size-5 text-blue-600" />
				</div>
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-3xl font-bold">{formatNumber(stats.total_sitios)}</div>
				<p class="mt-1 text-xs text-green-600">
					<TrendingUp class="mr-1 inline size-3" />5 added this month
				</p>
			</Card.CardContent>
		</Card.Card>

		<Card.Card class="shadow-sm">
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium text-muted-foreground"
					>Active Projects</Card.CardTitle
				>
				<div class="rounded-full bg-yellow-500/10 p-2">
					<Activity class="size-5 text-yellow-600" />
				</div>
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-3xl font-bold">{formatNumber(stats.active_projects)}</div>
				<p class="mt-1 text-xs text-green-600">
					<TrendingUp class="mr-1 inline size-3" />In progress
				</p>
			</Card.CardContent>
		</Card.Card>

		<Card.Card class="shadow-sm">
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium text-muted-foreground"
					>Completed Projects</Card.CardTitle
				>
				<div class="rounded-full bg-green-500/10 p-2">
					<CircleCheckBig class="size-5 text-green-600" />
				</div>
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-3xl font-bold">{formatNumber(stats.completed_projects)}</div>
				<p class="mt-1 text-xs text-green-600">
					<TrendingUp class="mr-1 inline size-3" />This year
				</p>
			</Card.CardContent>
		</Card.Card>

		<Card.Card class="shadow-sm">
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium text-muted-foreground"
					>Total Beneficiaries</Card.CardTitle
				>
				<div class="rounded-full bg-purple-500/10 p-2">
					<Users class="size-5 text-purple-600" />
				</div>
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-3xl font-bold">{formatNumber(stats.total_beneficiaries)}</div>
				<p class="mt-1 text-xs text-green-600">
					<TrendingUp class="mr-1 inline size-3" />Across all projects
				</p>
			</Card.CardContent>
		</Card.Card>

		<Card.Card class="shadow-sm">
			<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.CardTitle class="text-sm font-medium text-muted-foreground"
					>Total Budget</Card.CardTitle
				>
				<div class="rounded-full bg-emerald-500/10 p-2">
					<Banknote class="size-5 text-emerald-600" />
				</div>
			</Card.CardHeader>
			<Card.CardContent>
				<div class="text-3xl font-bold">{formatCompactCurrency(stats.total_budget)}</div>
				<p class="mt-1 text-xs text-muted-foreground">Allocated funds</p>
			</Card.CardContent>
		</Card.Card>
	{/if}
</div>
