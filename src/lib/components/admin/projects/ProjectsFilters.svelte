<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
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

<Card.Card class="shadow-sm">
	<Card.CardContent class="">
		<div class="flex flex-wrap gap-4">
			<!-- Search -->
			<div class="min-w-[300px] flex-1">
				<div class="relative">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search projects..."
						bind:value={searchQuery}
						class="pl-9"
					/>
				</div>
			</div>

			<!-- Status Filter -->
			<div class="w-[180px]">
				<Select.Root type="single" bind:value={statusFilter}>
					<Select.Trigger class="w-full">
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
			</div>

			<!-- Category Filter -->
			<div class="w-[200px]">
				<Select.Root type="single" bind:value={categoryFilter}>
					<Select.Trigger class="w-full">
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

			<!-- Clear Button -->
			<Button variant="ghost" size="sm" onclick={onReset}>
				<X class="mr-2 size-4" />
				Clear
			</Button>
		</div>
	</Card.CardContent>
</Card.Card>
