<script lang="ts">
	import { goto } from '$app/navigation';
	import SitioList from '$lib/components/projects/SitioList.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Empty from '$lib/components/ui/empty';
	import { Progress } from '$lib/components/ui/progress';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { getStatusBadgeVariant, getStatusLabel } from '$lib/config/status-config';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import type { Project } from '$lib/types';
	import {
		formatCurrency,
		formatDate,
		formatRelativeTime,
		truncateText
	} from '$lib/utils/formatters';
	import { getCategoryName, getCompletionPercentage } from '$lib/utils/project-calculations';
	import {
		ArrowDownUp,
		Banknote,
		Calendar,
		Download,
		EllipsisVertical,
		Eye,
		FilterX,
		FolderOpen,
		MapPin,
		Plus,
		RefreshCw,
		SquarePen,
		Trash2,
		Upload
	} from '@lucide/svelte';

	const isMobile = new IsMobile();

	interface Props {
		projects: Project[];
		totalProjects: number;
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
		onQuickEdit: (id: number) => void;
		onClearFilters?: () => void;
		hasActiveFilters?: boolean;
	}

	let {
		projects,
		totalProjects,
		currentPage = $bindable(),
		itemsPerPage,
		totalPages,
		sortBy,
		sortOrder,
		onToggleSort,
		onRefresh,
		onDelete,
		onDownloadPDF,
		onQuickEdit,
		onClearFilters,
		hasActiveFilters = false
	}: Props = $props();

	// Mobile sort options
	const sortOptions = [
		{ value: 'title', label: 'Title' },
		{ value: 'budget', label: 'Budget' },
		{ value: 'progress', label: 'Progress' },
		{ value: 'status', label: 'Status' },
		{ value: 'updated', label: 'Last Updated' }
	] as const;

	function handleMobileSortChange(value: string | undefined) {
		if (value && onToggleSort) {
			onToggleSort(value as NonNullable<typeof sortBy>);
		}
	}
</script>

<Card.Root class="gap-4 shadow-sm transition-shadow hover:shadow-md">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title class="text-xl font-semibold">All Projects ({totalProjects})</Card.Title>
			<div class="flex items-center gap-2">
				<!-- Mobile Sort Dropdown -->
				{#if isMobile.current}
					<Select.Root type="single" value={sortBy} onValueChange={handleMobileSortChange}>
						<Select.Trigger class="">
							<ArrowDownUp class="mr-2 size-4" />
						</Select.Trigger>
						<Select.Content>
							{#each sortOptions as option}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				{/if}
				<Button variant="ghost" size="icon" onclick={onRefresh}>
					<RefreshCw class="size-4" />
				</Button>
			</div>
		</div>
	</Card.Header>
	<Card.Content class="">
		<!-- Mobile Card View -->
		{#if isMobile.current}
			<div class="space-y-3">
				{#if projects.length === 0}
					<Empty.Root class="border-none py-8">
						<Empty.Media>
							<FolderOpen class="size-12 text-muted-foreground/50" />
						</Empty.Media>
						<Empty.Header>
							<Empty.Title>
								{hasActiveFilters ? 'No matching projects' : 'No projects yet'}
							</Empty.Title>
							<Empty.Description>
								{#if hasActiveFilters}
									Try adjusting your search or filters to find what you're looking for.
								{:else}
									Get started by creating your first project or importing data.
								{/if}
							</Empty.Description>
						</Empty.Header>
						<Empty.Content>
							<div class="flex flex-col gap-2 sm:flex-row">
								{#if hasActiveFilters && onClearFilters}
									<Button variant="outline" size="sm" onclick={onClearFilters}>
										<FilterX class="mr-2 size-4" />
										Clear Filters
									</Button>
								{/if}
								<Button variant="outline" size="sm" onclick={() => goto('/admin/import')}>
									<Upload class="mr-2 size-4" />
									Import Data
								</Button>
								<Button size="sm" onclick={() => goto('/admin/projects/new')}>
									<Plus class="mr-2 size-4" />
									Add Project
								</Button>
							</div>
						</Empty.Content>
					</Empty.Root>
				{:else}
					{#each projects as project (project.id)}
						{@const completionPct = getCompletionPercentage(project)}
						<button
							type="button"
							class="block w-full rounded-lg border bg-card p-4 text-left transition-all hover:shadow-md focus:ring-2 focus:ring-primary/20 focus:outline-none"
							onclick={() => goto(`/admin/projects/${project.id}`)}
						>
							<!-- Header: Title & Status -->
							<div class="mb-3 flex items-start justify-between gap-2">
								<div class="min-w-0 flex-1">
									<h3 class="line-clamp-2 font-semibold text-foreground">
										{project.title}
									</h3>
									<p class="mt-0.5 text-sm text-muted-foreground">
										{getCategoryName(project.category_key)} • FY {project.project_year}
									</p>
								</div>
								<!-- Actions Dropdown -->
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button
											variant="ghost"
											size="icon"
											class="size-8 shrink-0"
											onclick={(e) => e.stopPropagation()}
										>
											<EllipsisVertical class="size-4" />
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item
											onclick={(e) => {
												e.stopPropagation();
												goto(`/admin/projects/${project.id}`);
											}}
										>
											<Eye class="mr-2 size-4" />
											View Details
										</DropdownMenu.Item>
										<DropdownMenu.Item
											onclick={(e) => {
												e.stopPropagation();
												onQuickEdit(project.id);
											}}
										>
											<SquarePen class="mr-2 size-4" />
											Quick Edit
										</DropdownMenu.Item>
										<DropdownMenu.Item
											onclick={(e) => {
												e.stopPropagation();
												goto(`/admin/projects/${project.id}/edit`);
											}}
										>
											<SquarePen class="mr-2 size-4" />
											Full Edit
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<DropdownMenu.Item
											onclick={(e) => {
												e.stopPropagation();
												onDownloadPDF(project.id);
											}}
										>
											<Download class="mr-2 size-4" />
											Download PDF
										</DropdownMenu.Item>
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
							</div>

							<!-- Progress Bar -->
							<div class="mb-3">
								<div class="mb-1 flex items-center justify-between text-xs">
									<span class="text-muted-foreground">Progress</span>
									<span class="font-medium">{completionPct.toFixed(0)}%</span>
								</div>
								<Progress value={Math.min(100, completionPct)} class="h-2" />
							</div>

							<!-- Stats Grid -->
							<div class="grid grid-cols-2 gap-3">
								<div class="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
									<Banknote class="size-4 text-muted-foreground" />
									<div>
										<p class="text-xs text-muted-foreground">Budget</p>
										<p class="text-sm font-medium">{formatCurrency(project.project_cost)}</p>
									</div>
								</div>
								<div class="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
									<MapPin class="size-4 text-muted-foreground" />
									<div>
										<p class="text-xs text-muted-foreground">Locations</p>
										<p class="text-sm font-medium">
											{project.project_sitios?.length || 0} sitio{(project.project_sitios?.length ||
												0) !== 1
												? 's'
												: ''}
										</p>
									</div>
								</div>
							</div>

							<!-- Footer: Status & Date -->
							<div class="mt-3 flex items-center justify-between border-t pt-3">
								<Badge variant={getStatusBadgeVariant(project.status)}>
									{getStatusLabel(project.status)}
								</Badge>
								<div class="flex items-center gap-1 text-xs text-muted-foreground">
									<Calendar class="size-3" />
									{formatRelativeTime(project.updated_at)}
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		{:else}
			<!-- Desktop Table View -->
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
									<ArrowDownUp
										class="size-3 {sortBy === 'budget' ? 'opacity-100' : 'opacity-30'}"
									/>
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
									<ArrowDownUp
										class="size-3 {sortBy === 'status' ? 'opacity-100' : 'opacity-30'}"
									/>
								</button>
							</Table.TableHead>
							<Table.TableHead class="w-[140px]">
								<button
									class="flex items-center gap-1 hover:text-foreground"
									onclick={() => onToggleSort('updated')}
								>
									Last Updated
									<ArrowDownUp
										class="size-3 {sortBy === 'updated' ? 'opacity-100' : 'opacity-30'}"
									/>
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
								{@const completionPct = getCompletionPercentage(project)}
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
												{getCategoryName(project.category_key)} • FY {project.project_year}
											</div>
										</div>
									</Table.TableCell>

									<!-- Location -->
									<Table.TableCell>
										{#if project.project_sitios && project.project_sitios.length > 0}
											<SitioList sitios={project.project_sitios} maxVisible={1} />
										{:else}
											<div class="text-sm text-muted-foreground">No sitios assigned</div>
										{/if}
									</Table.TableCell>

									<!-- Budget -->
									<Table.TableCell>
										<div class="text-sm font-medium">
											{formatCurrency(project.project_cost)}
										</div>
									</Table.TableCell>

									<!-- Progress -->
									<Table.TableCell>
										<div class="flex items-center gap-2">
											<Progress value={Math.min(100, completionPct)} class="w-full" />
											<span class="min-w-10 text-xs text-muted-foreground">
												{completionPct.toFixed(0)}%
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
										<div class="flex items-center justify-end gap-1">
											<Button
												variant="ghost"
												size="icon"
												onclick={(e) => {
													e.stopPropagation();
													onQuickEdit(project.id);
												}}
											>
												<SquarePen class="size-4" />
											</Button>
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
														Full Edit
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
										</div>
									</Table.TableCell>
								</Table.TableRow>
							{/each}
						{/if}
					</Table.TableBody>
				</Table.Table>
			</div>
		{/if}
	</Card.Content>

	<!-- Pagination -->
	{#if totalPages > 1}
		<Card.Footer class="flex flex-col gap-3 sm:flex-row sm:justify-between">
			<div class="text-center text-sm text-muted-foreground sm:text-left">
				{#if isMobile.current}
					Page {currentPage} of {totalPages}
				{:else}
					Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(
						currentPage * itemsPerPage,
						totalProjects
					)} of {totalProjects} projects
				{/if}
			</div>
			<div class="flex justify-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === 1}
					onclick={() => (currentPage = Math.max(1, currentPage - 1))}
				>
					Previous
				</Button>
				{#if !isMobile.current}
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
				{/if}
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === totalPages}
					onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
				>
					Next
				</Button>
			</div>
		</Card.Footer>
	{/if}
</Card.Root>
