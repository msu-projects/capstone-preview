<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { getStatusLabel } from '$lib/config/status-config';
	import type { ProjectStatus } from '$lib/types';
	import { Search, X } from '@lucide/svelte';

	interface Props {
		searchQuery: string;
		statusFilter: string;
		categoryFilter: string;
		categories: string[];
		onReset: () => void;
	}

	let {
		searchQuery = $bindable(),
		statusFilter = $bindable(),
		categoryFilter = $bindable(),
		categories,
		onReset
	}: Props = $props();

	// Derived value for checking if any filters are active
	const hasActiveFilters = $derived(
		searchQuery !== '' || statusFilter !== '' || categoryFilter !== ''
	);

	// Count active filters
	const activeFilterCount = $derived(
		(searchQuery !== '' ? 1 : 0) + (statusFilter !== '' ? 1 : 0) + (categoryFilter !== '' ? 1 : 0)
	);

	function removeSearchFilter() {
		searchQuery = '';
	}

	function removeStatusFilter() {
		statusFilter = '';
	}

	function removeCategoryFilter() {
		categoryFilter = '';
	}
</script>

<Card.Root class="shadow-sm transition-shadow hover:shadow-md">
	<Card.Content class="">
		<div class="flex flex-col gap-4 md:flex-row md:items-center">
			<!-- Search -->
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search projects..."
					bind:value={searchQuery}
					class="pl-10"
				/>
			</div>

			<!-- Status and Category Filters -->
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
				<!-- Status Filter -->
				<Select.Root type="single" bind:value={statusFilter}>
					<Select.Trigger class="w-full sm:w-[180px]">
						{statusFilter ? getStatusLabel(statusFilter as ProjectStatus) : 'All Status'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="All Status">All Status</Select.Item>
						<Select.Item value="planning" label="Planning">Planning</Select.Item>
						<Select.Item value="in-progress" label="In Progress">In Progress</Select.Item>
						<Select.Item value="completed" label="Completed">Completed</Select.Item>
						<Select.Item value="suspended" label="Suspended">Suspended</Select.Item>
					</Select.Content>
				</Select.Root>

				<!-- Category Filter -->
				<Select.Root type="single" bind:value={categoryFilter}>
					<Select.Trigger class="w-full sm:w-[200px]">
						{categoryFilter || 'All Categories'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="" label="All Categories">All Categories</Select.Item>
						{#each categories as category (category)}
							<Select.Item value={category} label={category}>{category}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Active Filter Badges -->
		{#if hasActiveFilters}
			<div class="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
				<span class="text-sm text-muted-foreground">Active filters:</span>

				{#if searchQuery}
					<Badge variant="secondary" class="gap-1 pr-1">
						<span class="max-w-32 truncate">Search: "{searchQuery}"</span>
						<button
							type="button"
							class="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
							onclick={removeSearchFilter}
						>
							<X class="size-3" />
							<span class="sr-only">Remove search filter</span>
						</button>
					</Badge>
				{/if}

				{#if statusFilter}
					<Badge variant="secondary" class="gap-1 pr-1">
						<span>Status: {getStatusLabel(statusFilter as ProjectStatus)}</span>
						<button
							type="button"
							class="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
							onclick={removeStatusFilter}
						>
							<X class="size-3" />
							<span class="sr-only">Remove status filter</span>
						</button>
					</Badge>
				{/if}

				{#if categoryFilter}
					<Badge variant="secondary" class="gap-1 pr-1">
						<span>Category: {categoryFilter}</span>
						<button
							type="button"
							class="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
							onclick={removeCategoryFilter}
						>
							<X class="size-3" />
							<span class="sr-only">Remove category filter</span>
						</button>
					</Badge>
				{/if}

				{#if activeFilterCount > 1}
					<Button variant="ghost" size="sm" class="h-7 text-xs" onclick={onReset}>Clear all</Button>
				{/if}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
