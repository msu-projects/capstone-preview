<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { getStatusBadgeVariant, getStatusLabel } from '$lib/config/status-config';
	import type { Project } from '$lib/types';
	import { truncateText } from '$lib/utils/formatters';
	import { getCategoryName } from '$lib/utils/project-calculations';
	import { AlertTriangle, ArrowRight, Calendar, Clock } from '@lucide/svelte';

	interface Props {
		projects: Project[];
		isLoading?: boolean;
		staleDays?: number; // Number of days without update to consider "stale"
	}

	let { projects, isLoading = false, staleDays = 30 }: Props = $props();

	// Filter and sort stale projects (excluding completed ones)
	const staleProjects = $derived.by(() => {
		const now = new Date();
		const staleThreshold = staleDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

		return projects
			.filter((project) => {
				// Exclude completed projects
				if (project.status === 'completed') return false;

				const updatedAt = new Date(project.updated_at);
				const timeSinceUpdate = now.getTime() - updatedAt.getTime();
				return timeSinceUpdate > staleThreshold;
			})
			.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
			.slice(0, 5);
	});

	function getDaysSinceUpdate(updatedAt: string): number {
		const now = new Date();
		const updated = new Date(updatedAt);
		const diffMs = now.getTime() - updated.getTime();
		return Math.floor(diffMs / (24 * 60 * 60 * 1000));
	}

	function formatLastUpdate(updatedAt: string): string {
		const days = getDaysSinceUpdate(updatedAt);
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
		if (days < 365) return `${Math.floor(days / 30)} months ago`;
		return `${Math.floor(days / 365)} years ago`;
	}

	function getUrgencyLevel(days: number): 'critical' | 'warning' | 'moderate' {
		if (days > 90) return 'critical';
		if (days > 60) return 'warning';
		return 'moderate';
	}

	function getUrgencyColor(level: 'critical' | 'warning' | 'moderate'): string {
		switch (level) {
			case 'critical':
				return 'text-destructive';
			case 'warning':
				return 'text-orange-500';
			case 'moderate':
				return 'text-yellow-500';
		}
	}

	function getUrgencyBgColor(level: 'critical' | 'warning' | 'moderate'): string {
		switch (level) {
			case 'critical':
				return 'bg-destructive/10 border-destructive/20';
			case 'warning':
				return 'bg-orange-500/10 border-orange-500/20';
			case 'moderate':
				return 'bg-yellow-500/10 border-yellow-500/20';
		}
	}
</script>

<Card.Card class="shadow-sm">
	<Card.CardHeader class="flex flex-row items-center justify-between pb-2">
		<div class="flex items-center gap-2">
			<div class="rounded-full bg-orange-500/10 p-2">
				<AlertTriangle class="size-5 text-orange-500" />
			</div>
			<div>
				<Card.CardTitle class="text-lg font-semibold">Projects Needing Update</Card.CardTitle>
				<Card.CardDescription>
					Projects not updated in the last {staleDays} days
				</Card.CardDescription>
			</div>
		</div>
		<a
			href="/admin/projects?filter=stale"
			class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			View All
			<ArrowRight class="size-4" />
		</a>
	</Card.CardHeader>
	<Card.CardContent>
		{#if isLoading}
			<div class="space-y-3">
				{#each Array(3) as _, i (i)}
					<div class="flex items-center gap-3 rounded-lg border p-3">
						<Skeleton class="h-10 w-10 rounded-full" />
						<div class="flex-1 space-y-2">
							<Skeleton class="h-4 w-3/4" />
							<Skeleton class="h-3 w-1/2" />
						</div>
						<Skeleton class="h-6 w-20" />
					</div>
				{/each}
			</div>
		{:else if staleProjects.length === 0}
			<div class="flex flex-col items-center justify-center py-8 text-center">
				<div class="rounded-full bg-green-500/10 p-3">
					<Calendar class="size-6 text-green-500" />
				</div>
				<p class="mt-3 text-sm font-medium">All Projects Up to Date</p>
				<p class="text-xs text-muted-foreground">
					No projects have gone more than {staleDays} days without an update
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each staleProjects as project (project.id)}
					{@const daysSince = getDaysSinceUpdate(project.updated_at)}
					{@const urgency = getUrgencyLevel(daysSince)}
					<a
						href="/admin/projects/{project.id}"
						class="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 {getUrgencyBgColor(
							urgency
						)}"
					>
						<div class="mt-0.5 shrink-0">
							<Clock class="size-5 {getUrgencyColor(urgency)}" />
						</div>
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate text-sm font-medium group-hover:text-primary">
									{truncateText(project.title, 35)}
								</p>
							</div>
							<p class="mt-0.5 text-xs text-muted-foreground">
								{getCategoryName(project.category_key)}
							</p>
							<div class="mt-2 flex flex-wrap items-center gap-2">
								<Badge variant={getStatusBadgeVariant(project.status)} class="text-xs">
									{getStatusLabel(project.status)}
								</Badge>
								<Tooltip.Provider>
									<Tooltip.Root>
										<Tooltip.Trigger>
											<span class="flex items-center gap-1 text-xs {getUrgencyColor(urgency)}">
												<Calendar class="size-3" />
												{formatLastUpdate(project.updated_at)}
											</span>
										</Tooltip.Trigger>
										<Tooltip.Content>
											<p>Last updated: {new Date(project.updated_at).toLocaleDateString()}</p>
											<p class="text-xs text-muted-foreground">{daysSince} days ago</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</Tooltip.Provider>
							</div>
						</div>
						<div class="flex shrink-0 items-center">
							<Button variant="ghost" size="sm" class="h-8 px-2 opacity-0 group-hover:opacity-100">
								Update
								<ArrowRight class="ml-1 size-3" />
							</Button>
						</div>
					</a>
				{/each}
			</div>

			{#if staleProjects.length > 0}
				<div class="mt-4 rounded-lg bg-muted/50 p-3">
					<div class="flex items-center justify-between text-sm">
						<span class="text-muted-foreground">
							{staleProjects.length} project{staleProjects.length === 1 ? '' : 's'} need attention
						</span>
						<Button variant="outline" size="sm" href="/admin/projects?filter=stale">
							Review All
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	</Card.CardContent>
</Card.Card>
