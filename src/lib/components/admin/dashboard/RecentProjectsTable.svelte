<script lang="ts">
	import SitioList from '$lib/components/projects/SitioList.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import type { Project, ProjectStatus } from '$lib/types';
	import { ArrowRight } from '@lucide/svelte';

	interface Props {
		projects: Project[];
		isLoading?: boolean;
	}

	let { projects, isLoading = false }: Props = $props();

	function truncateText(text: string, maxLength: number): string {
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	function getStatusBadgeVariant(status: ProjectStatus) {
		switch (status) {
			case 'planning':
				return 'secondary' as const;
			case 'in-progress':
				return 'outline' as const;
			case 'completed':
				return 'default' as const;
			case 'suspended':
				return 'destructive' as const;
			default:
				return 'default' as const;
		}
	}

	function getStatusLabel(status: ProjectStatus): string {
		switch (status) {
			case 'planning':
				return 'Planning';
			case 'in-progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			case 'suspended':
				return 'Suspended';
			default:
				return status;
		}
	}
</script>

<Card.Card class="shadow-sm lg:col-span-2">
	<Card.CardHeader class="flex flex-row items-center justify-between">
		<Card.CardTitle class="text-xl font-semibold">Recent Projects</Card.CardTitle>
		<a
			href="/admin/projects"
			class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			View All
			<ArrowRight class="size-4" />
		</a>
	</Card.CardHeader>
	<Card.CardContent>
		{#if isLoading}
			<div class="space-y-3">
				{#each Array(5) as _}
					<div class="flex items-center gap-4">
						<Skeleton class="h-12 flex-1" />
						<Skeleton class="h-12 w-24" />
						<Skeleton class="h-6 w-20" />
						<Skeleton class="h-4 w-32" />
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-md border">
				<Table.Table>
					<Table.TableHeader>
						<Table.TableRow>
							<Table.TableHead>Project</Table.TableHead>
							<Table.TableHead>Location</Table.TableHead>
							<Table.TableHead>Status</Table.TableHead>
							<Table.TableHead>Progress</Table.TableHead>
						</Table.TableRow>
					</Table.TableHeader>
					<Table.TableBody>
						{#each projects as project}
							<Table.TableRow class="cursor-pointer hover:bg-accent/10">
								<Table.TableCell>
									<div class="font-medium">{truncateText(project.title, 40)}</div>
									<div class="text-xs text-muted-foreground">{project.category}</div>
								</Table.TableCell>
								<Table.TableCell>
									{#if project.project_sitios && project.project_sitios.length > 0}
										<SitioList sitios={project.project_sitios} maxVisible={1} />
									{:else}
										<div class="text-sm text-muted-foreground">No sitios</div>
									{/if}
								</Table.TableCell>
								<Table.TableCell>
									<Badge variant={getStatusBadgeVariant(project.status)}>
										{getStatusLabel(project.status)}
									</Badge>
								</Table.TableCell>
								<Table.TableCell>
									<div class="flex items-center gap-2">
										<Progress value={project.completion_percentage} class="w-full" />
										<span class="min-w-12 text-xs text-muted-foreground">
											{project.completion_percentage}%
										</span>
									</div>
								</Table.TableCell>
							</Table.TableRow>
						{/each}
					</Table.TableBody>
				</Table.Table>
			</div>
		{/if}
	</Card.CardContent>
</Card.Card>
