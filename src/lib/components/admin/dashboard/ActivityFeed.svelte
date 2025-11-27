<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import type { Activity as ActivityType } from '$lib/types';
	import {
		Activity,
		CirclePlus,
		FileText,
		MapPin,
		SquarePen,
		Upload,
		type IconProps
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

	interface Props {
		activities: ActivityType[];
		isLoading?: boolean;
	}

	let { activities, isLoading = false }: Props = $props();

	function formatActivityTime(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) return `${diffMins} minutes ago`;
		if (diffHours < 24) return `${diffHours} hours ago`;
		return `${diffDays} days ago`;
	}

	function getActivityIcon(iconName: string): Component<IconProps> {
		const iconMap: Record<string, Component<IconProps>> = {
			'plus-circle': CirclePlus,
			edit: SquarePen,
			'map-pin': MapPin,
			upload: Upload,
			'file-text': FileText
		};
		return iconMap[iconName] || Activity;
	}
</script>

<Card.Card class="shadow-sm">
	<Card.CardHeader>
		<Card.CardTitle class="text-xl font-semibold">Recent Activity</Card.CardTitle>
	</Card.CardHeader>
	<Card.CardContent>
		{#if isLoading}
			<div class="space-y-6">
				{#each Array(5) as _}
					<div class="flex gap-3">
						<Skeleton class="size-10 rounded-full" />
						<div class="flex-1 space-y-2">
							<Skeleton class="h-4 w-24" />
							<Skeleton class="h-3 w-full" />
							<Skeleton class="h-3 w-16" />
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="space-y-6">
				{#each activities as activity}
					{@const ActivityIcon = getActivityIcon(activity.icon)}
					<div class="flex gap-3">
						<div
							class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card"
						>
							<ActivityIcon class="size-4" />
						</div>
						<div class="flex-1 space-y-1">
							<p class="text-sm font-semibold">{activity.user}</p>
							<p class="text-sm text-muted-foreground">
								{activity.action}: {activity.target}
							</p>
							<p class="text-xs text-muted-foreground">
								{formatActivityTime(activity.timestamp)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card.CardContent>
</Card.Card>
