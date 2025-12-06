<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Stats } from '$lib/types';
	import { formatNumber } from '$lib/utils/formatters';
	import {
		Activity,
		Banknote,
		CircleCheckBig,
		MapPin,
		TrendingUp,
		Users,
		type IconProps
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

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

	interface StatCard {
		title: string;
		value: string;
		subtitle: string;
		subtitleClass: string;
		icon: Component<IconProps>;
		iconClass: string;
		iconBgClass: string;
		href: string;
	}

	const statCards: StatCard[] = $derived([
		{
			title: 'Total Sitios',
			value: formatNumber(stats.total_sitios),
			subtitle: '5 added this month',
			subtitleClass: 'text-green-600',
			icon: MapPin,
			iconClass: 'text-blue-600',
			iconBgClass: 'bg-blue-500/10',
			href: '/admin/sitios'
		},
		{
			title: 'Active Projects',
			value: formatNumber(stats.active_projects),
			subtitle: 'In progress',
			subtitleClass: 'text-green-600',
			icon: Activity,
			iconClass: 'text-yellow-600',
			iconBgClass: 'bg-yellow-500/10',
			href: '/admin/projects?status=in-progress'
		},
		{
			title: 'Completed Projects',
			value: formatNumber(stats.completed_projects),
			subtitle: 'This year',
			subtitleClass: 'text-green-600',
			icon: CircleCheckBig,
			iconClass: 'text-green-600',
			iconBgClass: 'bg-green-500/10',
			href: '/admin/projects?status=completed'
		},
		{
			title: 'Total Beneficiaries',
			value: formatNumber(stats.total_beneficiaries),
			subtitle: 'Across all projects',
			subtitleClass: 'text-green-600',
			icon: Users,
			iconClass: 'text-purple-600',
			iconBgClass: 'bg-purple-500/10',
			href: '/admin/sitios'
		},
		{
			title: 'Total Budget',
			value: formatCompactCurrency(stats.total_budget),
			subtitle: 'Allocated funds',
			subtitleClass: 'text-muted-foreground',
			icon: Banknote,
			iconClass: 'text-emerald-600',
			iconBgClass: 'bg-emerald-500/10',
			href: '/admin/projects?tab=budget'
		}
	]);
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
		{#each statCards as card (card.title)}
			<a href={card.href} class="group">
				<Card.Card
					class="shadow-sm transition-colors duration-200 group-hover:bg-muted/50 group-hover:shadow-md"
				>
					<Card.CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.CardTitle class="text-sm font-medium text-muted-foreground"
							>{card.title}</Card.CardTitle
						>
						<div class="rounded-full p-2 {card.iconBgClass}">
							<card.icon class="size-5 {card.iconClass}" />
						</div>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="text-3xl font-bold">{card.value}</div>
						<p class="mt-1 text-xs {card.subtitleClass}">
							{#if card.subtitleClass.includes('green')}
								<TrendingUp class="mr-1 inline size-3" />
							{/if}
							{card.subtitle}
						</p>
					</Card.CardContent>
				</Card.Card>
			</a>
		{/each}
	{/if}
</div>
