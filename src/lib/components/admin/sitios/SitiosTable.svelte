<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Table from '$lib/components/ui/table';
	import type { Sitio } from '$lib/types';
	import {
		ArrowDownUp,
		Download,
		EllipsisVertical,
		RefreshCw,
		SquarePen,
		Trash2
	} from '@lucide/svelte';

	interface Props {
		sitios: Sitio[];
		currentPage: number;
		itemsPerPage: number;
		totalPages: number;
		sortBy?: 'name' | 'municipality' | 'barangay' | 'population' | 'households';
		sortOrder?: 'asc' | 'desc';
		onToggleSort?: (
			column: 'name' | 'municipality' | 'barangay' | 'population' | 'households'
		) => void;
		onRefresh: () => void;
		onDelete: (id: number) => void;
		onDownloadPDF: (id: number) => void;
		onPageChange: (page: number) => void;
		onEdit: (id: number) => void;
	}

	let {
		sitios,
		currentPage = $bindable(),
		itemsPerPage,
		totalPages,
		sortBy,
		sortOrder,
		onToggleSort,
		onRefresh,
		onDelete,
		onDownloadPDF,
		onEdit
	}: Props = $props();

	function formatNumber(num: number | undefined): string {
		return num ? num.toLocaleString() : '-';
	}
</script>

<Card.Card class="gap-4 shadow-sm">
	<Card.CardHeader>
		<div class="flex items-center justify-between">
			<Card.CardTitle class="text-xl font-semibold">All Sitios ({sitios.length})</Card.CardTitle>
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
						<Table.TableHead class="w-[250px]">
							{#if onToggleSort}
								<button
									class="flex items-center gap-1 hover:text-foreground"
									onclick={() => onToggleSort?.('name')}
								>
									Sitio
									<ArrowDownUp class="size-3 {sortBy === 'name' ? 'opacity-100' : 'opacity-30'}" />
								</button>
							{:else}
								Sitio
							{/if}
						</Table.TableHead>
						<Table.TableHead class="w-[200px]">
							{#if onToggleSort}
								<button
									class="flex items-center gap-1 hover:text-foreground"
									onclick={() => onToggleSort?.('barangay')}
								>
									Barangay
									<ArrowDownUp
										class="size-3 {sortBy === 'barangay' ? 'opacity-100' : 'opacity-30'}"
									/>
								</button>
							{:else}
								Barangay
							{/if}
						</Table.TableHead>
						<Table.TableHead class="w-[200px]">
							{#if onToggleSort}
								<button
									class="flex items-center gap-1 hover:text-foreground"
									onclick={() => onToggleSort?.('municipality')}
								>
									Municipality
									<ArrowDownUp
										class="size-3 {sortBy === 'municipality' ? 'opacity-100' : 'opacity-30'}"
									/>
								</button>
							{:else}
								Municipality
							{/if}
						</Table.TableHead>
						<Table.TableHead class="w-[140px] text-right">
							{#if onToggleSort}
								<button
									class="flex items-center gap-1 hover:text-foreground"
									onclick={() => onToggleSort?.('population')}
								>
									Population
									<ArrowDownUp
										class="size-3 {sortBy === 'population' ? 'opacity-100' : 'opacity-30'}"
									/>
								</button>
							{:else}
								Population
							{/if}
						</Table.TableHead>
						<Table.TableHead class="w-[140px] text-right">
							{#if onToggleSort}
								<button
									class="flex items-center gap-1 hover:text-foreground"
									onclick={() => onToggleSort?.('households')}
								>
									Households
									<ArrowDownUp
										class="size-3 {sortBy === 'households' ? 'opacity-100' : 'opacity-30'}"
									/>
								</button>
							{:else}
								Households
							{/if}
						</Table.TableHead>
						<Table.TableHead class="w-[100px] text-right">Actions</Table.TableHead>
					</Table.TableRow>
				</Table.TableHeader>
				<Table.TableBody>
					{#if sitios.length === 0}
						<Table.TableRow>
							<Table.TableCell colspan={6} class="h-32 text-center">
								<div class="flex flex-col items-center justify-center gap-2">
									<p class="text-muted-foreground">No sitios found</p>
								</div>
							</Table.TableCell>
						</Table.TableRow>
					{:else}
						{#each sitios as sitio (sitio.id)}
							<Table.TableRow
								class="cursor-pointer hover:bg-accent/10"
								onclick={() => onEdit(sitio.id)}
							>
								<!-- Sitio Name -->
								<Table.TableCell>
									<div class="font-medium">{sitio.name}</div>
								</Table.TableCell>

								<!-- Barangay -->
								<Table.TableCell>
									<div class="text-sm">{sitio.barangay}</div>
								</Table.TableCell>

								<!-- Municipality -->
								<Table.TableCell>
									<div class="text-sm">{sitio.municipality}</div>
								</Table.TableCell>

								<!-- Population -->
								<Table.TableCell class="">
									<div class="text-sm font-medium">{formatNumber(sitio.population)}</div>
								</Table.TableCell>

								<!-- Households -->
								<Table.TableCell class="">
									<div class="text-sm font-medium">{formatNumber(sitio.households)}</div>
								</Table.TableCell>

								<!-- Actions -->
								<Table.TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											onclick={(e) => {
												e.stopPropagation();
												onEdit(sitio.id);
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
														onDownloadPDF(sitio.id);
													}}
												>
													<Download class="mr-2 size-4" />
													Download PDF
												</DropdownMenu.Item>
												<DropdownMenu.Separator />
												<DropdownMenu.Item
													onclick={(e) => {
														e.stopPropagation();
														onDelete(sitio.id);
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
	</Card.CardContent>

	<!-- Pagination -->
	{#if totalPages > 1}
		<Card.CardFooter class="flex justify-between">
			<div class="text-sm text-muted-foreground">
				Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(
					currentPage * itemsPerPage,
					sitios.length
				)} of {sitios.length} sitios
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
