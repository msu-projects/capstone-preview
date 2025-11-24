<script lang="ts">
	import SitioList from '$lib/components/projects/SitioList.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Progress } from '$lib/components/ui/progress';
	import * as Table from '$lib/components/ui/table';
	import type { Project, ProjectStatus } from '$lib/types';
	import {
		ArrowDownUp,
		Download,
		EllipsisVertical,
		RefreshCw,
		SquarePen,
		Trash2
	} from '@lucide/svelte';

	interface Props {
		projects: Project[];
		currentPage: number;
		itemsPerPage: number;
		totalPages: number;
		sortBy: 'title' | 'budget' | 'progress' | 'status' | 'updated';
		sortOrder: 'asc' | 'desc';
		onToggleSort: (column: 'title' | 'budget' | 'progress' | 'status' | 'updated') => void;
		onRefresh: () => void;
		onDelete: (id: number) => void;
		onDownloadPDF: (id: number) => void;
		onPageChange: (page: number) => void;
	}

	let {
		projects,
		currentPage = $bindable(),
		itemsPerPage,
		totalPages,
		sortBy,
		sortOrder,
		onToggleSort,
		onRefresh,
		onDelete,
		onDownloadPDF
	}: Props = $props();

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(amount);
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

	function truncateText(text: string, maxLength: number): string {
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	}

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-PH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}

	function formatRelativeTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Yesterday';
		if (diffInDays < 7) return `${diffInDays} days ago`;
		if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
		if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
		return `${Math.floor(diffInDays / 365)} years ago`;
	}
</script>

<Card.Card class="shadow-sm">
	<Card.CardHeader>
		<div class="flex items-center justify-between">
			<Card.CardTitle class="text-xl font-semibold">All Projects ({projects.length})</Card.CardTitle
			>
			<Button variant="ghost" size="icon" onclick={onRefresh}>
				<RefreshCw class="size-4" />
			</Button>
		</div>
	</Card.CardHeader>
	<Card.CardContent class="">
		<div class="overflow-x-auto rounded-md border">
			<Table.Table>
				<Table.TableHeader>
					<Table.TableRow>
						<Table.TableHead class="w-[350px]">
							<button
								class="flex items-center gap-1 hover:text-foreground"
								onclick={() => onToggleSort('title')}
							>
								Project
								<ArrowDownUp class="size-3 {sortBy === 'title' ? 'opacity-100' : 'opacity-30'}" />
							</button>
						</Table.TableHead>
						<Table.TableHead class="w-[200px]">Location</Table.TableHead>
						<Table.TableHead class="w-[140px]">
							<button
								class="flex items-center gap-1 hover:text-foreground"
								onclick={() => onToggleSort('budget')}
							>
								Budget
								<ArrowDownUp class="size-3 {sortBy === 'budget' ? 'opacity-100' : 'opacity-30'}" />
							</button>
						</Table.TableHead>
						<Table.TableHead class="w-[120px]">
							<button
								class="flex items-center gap-1 hover:text-foreground"
								onclick={() => onToggleSort('progress')}
							>
								Progress
								<ArrowDownUp
									class="size-3 {sortBy === 'progress' ? 'opacity-100' : 'opacity-30'}"
								/>
							</button>
						</Table.TableHead>
						<Table.TableHead class="w-[120px]">
							<button
								class="flex items-center gap-1 hover:text-foreground"
								onclick={() => onToggleSort('status')}
							>
								Status
								<ArrowDownUp class="size-3 {sortBy === 'status' ? 'opacity-100' : 'opacity-30'}" />
							</button>
						</Table.TableHead>
						<Table.TableHead class="w-[140px]">
							<button
								class="flex items-center gap-1 hover:text-foreground"
								onclick={() => onToggleSort('updated')}
							>
								Last Updated
								<ArrowDownUp class="size-3 {sortBy === 'updated' ? 'opacity-100' : 'opacity-30'}" />
							</button>
						</Table.TableHead>
						<Table.TableHead class="w-[100px] text-right">Actions</Table.TableHead>
					</Table.TableRow>
				</Table.TableHeader>
				<Table.TableBody>
					{#if projects.length === 0}
						<Table.TableRow>
							<Table.TableCell colspan={7} class="h-32 text-center">
								<div class="flex flex-col items-center justify-center gap-2">
									<p class="text-muted-foreground">No projects found</p>
								</div>
							</Table.TableCell>
						</Table.TableRow>
					{:else}
						{#each projects as project (project.id)}
							{@const monitoring = project.monitoring}
							{@const allotment = monitoring?.allotment}
							{@const physical = monitoring?.physical}
							<Table.TableRow
								class="cursor-pointer hover:bg-accent/10"
								onclick={() => (window.location.href = `/admin/projects/${project.id}`)}
							>
								<!-- Project Info -->
								<Table.TableCell>
									<div class="space-y-1">
										<div class="text-sm leading-tight font-medium">
											{truncateText(project.title, 80)}
										</div>
										<div class="text-xs text-muted-foreground">
											{project.category} • FY {project.project_year}
										</div>
									</div>
								</Table.TableCell>

								<!-- Location -->
								<Table.TableCell>
									{#if project.project_sitios && project.project_sitios.length > 0}
										<SitioList sitios={project.project_sitios} maxVisible={1} />
									{:else}
										<div class="space-y-1">
											<div class="text-sm">{project.municipality}</div>
											<div class="text-xs text-muted-foreground">
												{project.sitio_name}
											</div>
										</div>
									{/if}
								</Table.TableCell>

								<!-- Budget -->
								<Table.TableCell>
									<div class="text-sm font-medium">
										{formatCurrency(allotment?.total ?? project.budget)}
									</div>
								</Table.TableCell>

								<!-- Progress -->
								<Table.TableCell>
									<div class="flex items-center gap-2">
										<Progress
											value={Math.min(100, physical?.actual ?? project.completion_percentage)}
											class="w-full"
										/>
										<span class="min-w-10 text-xs text-muted-foreground">
											{(physical?.actual ?? project.completion_percentage).toFixed(0)}%
										</span>
									</div>
								</Table.TableCell>

								<!-- Status -->
								<Table.TableCell>
									<Badge variant={getStatusBadgeVariant(project.status)}>
										{getStatusLabel(project.status)}
									</Badge>
								</Table.TableCell>

								<!-- Last Updated -->
								<Table.TableCell>
									<div class="space-y-1">
										<div class="text-sm">{formatDate(project.updated_at)}</div>
										<div class="text-xs text-muted-foreground">
											{formatRelativeTime(project.updated_at)}
										</div>
									</div>
								</Table.TableCell>

								<!-- Actions -->
								<Table.TableCell class="text-right">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											<Button variant="ghost" size="icon" onclick={(e) => e.stopPropagation()}>
												<EllipsisVertical class="size-4" />
											</Button>
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Item
												onclick={(e) => {
													e.stopPropagation();
													window.location.href = `/admin/projects/${project.id}/edit`;
												}}
											>
												<SquarePen class="mr-2 size-4" />
												Edit
											</DropdownMenu.Item>
											<DropdownMenu.Item
												onclick={(e) => {
													e.stopPropagation();
													onDownloadPDF(project.id);
												}}
											>
												<Download class="mr-2 size-4" />
												Download PDF
											</DropdownMenu.Item>
											<DropdownMenu.Separator />
											<DropdownMenu.Item
												onclick={(e) => {
													e.stopPropagation();
													onDelete(project.id);
												}}
												class="text-destructive"
											>
												<Trash2 class="mr-2 size-4" />
												Delete
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Table.TableCell>
							</Table.TableRow>
						{/each}
					{/if}
				</Table.TableBody>
			</Table.Table>
		</div>
	</Card.CardContent>

	<!-- Pagination -->
	{#if totalPages > 1}
		<Card.CardFooter class="flex justify-between">
			<div class="text-sm text-muted-foreground">
				Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(
					currentPage * itemsPerPage,
					projects.length
				)} of {projects.length} projects
			</div>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === 1}
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
				>
					Previous
				</Button>
				<div class="flex items-center gap-1">
					{#each Array(totalPages) as _, i (i)}
						{#if i + 1 === 1 || i + 1 === totalPages || (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)}
							<Button
								variant={currentPage === i + 1 ? 'default' : 'outline'}
								size="sm"
								onclick={() => (currentPage = i + 1)}
							>
								{i + 1}
							</Button>
						{:else if i + 1 === currentPage - 2 || i + 1 === currentPage + 2}
							<span class="px-2">...</span>
						{/if}
					{/each}
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === totalPages}
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
				>
					Next
				</Button>
			</div>
		</Card.CardFooter>
	{/if}
</Card.Card>
