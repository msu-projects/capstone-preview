<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { CurrencyInput } from '$lib/components/ui/currency-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Table from '$lib/components/ui/table';
	import type { BudgetComponent, FundingSource } from '$lib/types';
	import { Banknote, Calendar, PieChart, Plus, Trash2 } from '@lucide/svelte';

	let {
		totalBudget = '',
		fundingSources = $bindable<Omit<FundingSource, 'id' | 'project_id'>[]>([]),
		budgetComponents = $bindable<Omit<BudgetComponent, 'id' | 'project_id'>[]>([])
	} = $props<{
		totalBudget: string;
		fundingSources: Omit<FundingSource, 'id' | 'project_id'>[];
		budgetComponents: Omit<BudgetComponent, 'id' | 'project_id'>[];
	}>();

	// Funding Source Form
	let newSourceName = $state('');
	let newSourceType = $state<'provincial' | 'national' | 'partner' | 'lgu_counterpart'>(
		'provincial'
	);
	let newSourceAmount = $state('');

	// Budget Component Form
	let newComponentName = $state('');
	let newComponentAmount = $state('');

	const totalBudgetAmount = $derived(Number(totalBudget) || 0);

	const totalFundingSources = $derived(
		fundingSources.reduce((sum: number, fs: FundingSource) => sum + fs.amount, 0)
	);

	const totalBudgetComponents = $derived(
		budgetComponents.reduce((sum: number, bc: BudgetComponent) => sum + bc.amount, 0)
	);

	const fundingGap = $derived(totalBudgetAmount - totalFundingSources);
	const budgetGap = $derived(totalBudgetAmount - totalBudgetComponents);

	function addFundingSource() {
		if (!newSourceName || !newSourceAmount) return;

		const amount = Number(newSourceAmount);
		const percentage = totalBudgetAmount > 0 ? (amount / totalBudgetAmount) * 100 : 0;

		fundingSources = [
			...fundingSources,
			{
				source_name: newSourceName,
				source_type: newSourceType,
				amount,
				percentage: Number(percentage.toFixed(1))
			}
		];

		newSourceName = '';
		newSourceAmount = '';
		newSourceType = 'provincial';
	}

	function removeFundingSource(index: number) {
		fundingSources = fundingSources.filter((_: FundingSource, i: number) => i !== index);
	}

	function addBudgetComponent() {
		if (!newComponentName || !newComponentAmount) return;

		const amount = Number(newComponentAmount);
		const percentage = totalBudgetAmount > 0 ? (amount / totalBudgetAmount) * 100 : 0;

		budgetComponents = [
			...budgetComponents,
			{
				component_name: newComponentName,
				amount,
				percentage: Number(percentage.toFixed(1))
			}
		];

		newComponentName = '';
		newComponentAmount = '';
	}

	function removeBudgetComponent(index: number) {
		budgetComponents = budgetComponents.filter((_: BudgetComponent, i: number) => i !== index);
	}

	function getSourceTypeLabel(type: string): string {
		const labels: Record<string, string> = {
			provincial: 'Provincial Government',
			national: 'National Government',
			partner: 'Partner Organization',
			lgu_counterpart: 'LGU Counterpart'
		};
		return labels[type] || type;
	}

	function getSourceTypeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
			provincial: 'default',
			national: 'secondary',
			partner: 'outline',
			lgu_counterpart: 'secondary'
		};
		return variants[type] || 'secondary';
	}
</script>

<div class="space-y-6">
	<!-- Total Project Budget (Read-only from Tab 3) -->
	<Card.Card class="border-primary/20 bg-primary/5">
		<Card.CardHeader>
			<Card.CardTitle class="flex items-center gap-2">
				<Banknote class="size-5" />
				Target Budget
			</Card.CardTitle>
			<Card.CardDescription>
				Budget defined in Performance Targets tab (funding sources and components must total to this
				amount)
			</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent>
			<div class="rounded-lg border border-border bg-background p-4">
				<p class="mb-1 text-sm font-medium text-muted-foreground">Total Project Budget</p>
				<p class="text-3xl font-bold">
					{new Intl.NumberFormat('en-PH', {
						style: 'currency',
						currency: 'PHP'
					}).format(totalBudgetAmount)}
				</p>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Funding Sources -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Funding Sources</Card.CardTitle>
			<Card.CardDescription>
				Breakdown of funding from different sources (should total to project budget)
			</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			{#if fundingSources.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Source Name</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
							<Table.Head class="text-right">Percentage</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each fundingSources as source, index}
							<Table.Row>
								<Table.Cell class="font-medium">{source.source_name}</Table.Cell>
								<Table.Cell>
									<Badge variant={getSourceTypeVariant(source.source_type)}>
										{getSourceTypeLabel(source.source_type)}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									{new Intl.NumberFormat('en-PH', {
										style: 'currency',
										currency: 'PHP'
									}).format(source.amount)}
								</Table.Cell>
								<Table.Cell class="text-right">{source.percentage}%</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => removeFundingSource(index)}
										class="text-destructive hover:text-destructive"
									>
										<Trash2 class="size-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
						<Table.Row class="bg-muted/30 font-semibold">
							<Table.Cell colspan={2}>Total Funding</Table.Cell>
							<Table.Cell class="text-right">
								{new Intl.NumberFormat('en-PH', {
									style: 'currency',
									currency: 'PHP'
								}).format(totalFundingSources)}
							</Table.Cell>
							<Table.Cell class="text-right">
								{totalBudgetAmount > 0 ? ((totalFundingSources / totalBudgetAmount) * 100).toFixed(1) : 0}%
							</Table.Cell>
							<Table.Cell></Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>

				{#if fundingGap !== 0}
					<div
						class="rounded-lg border p-3 {fundingGap > 0
							? 'border-destructive/50 bg-destructive/5'
							: 'border-success/50 bg-success/5'}"
					>
						<p class="text-sm font-medium">
							{fundingGap > 0 ? 'Funding Gap:' : 'Over-funded by:'}
							<span class={fundingGap > 0 ? 'text-destructive' : 'text-success'}>
								{new Intl.NumberFormat('en-PH', {
									style: 'currency',
									currency: 'PHP'
								}).format(Math.abs(fundingGap))}
							</span>
						</p>
					</div>
				{/if}
			{/if}

			<div class="grid gap-3 md:grid-cols-4">
				<div class="space-y-2">
					<Label for="source-name" class="text-xs">Source Name</Label>
					<Input
						id="source-name"
						bind:value={newSourceName}
						placeholder="e.g., Provincial LDF"
						class="h-9"
					/>
				</div>
				<div class="space-y-2">
					<Label for="source-type" class="text-xs">Type</Label>
					<select
						id="source-type"
						bind:value={newSourceType}
						class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
					>
						<option value="provincial">Provincial Government</option>
						<option value="national">National Government</option>
						<option value="partner">Partner Organization</option>
						<option value="lgu_counterpart">LGU Counterpart</option>
					</select>
				</div>
				<div class="space-y-2">
					<Label for="source-amount" class="text-xs">Amount (PHP)</Label>
					<CurrencyInput
						id="source-amount"
						bind:value={newSourceAmount}
						placeholder="₱ 0"
						min={0}
						class="h-9"
					/>
				</div>
				<div class="flex items-end">
					<Button
						type="button"
						onclick={addFundingSource}
						size="sm"
						disabled={!newSourceName || !newSourceAmount}
						class="w-full gap-2"
					>
						<Plus class="size-4" />
						Add Source
					</Button>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Budget Breakdown by Component -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle class="flex items-center gap-2">
				<PieChart class="size-5" />
				Budget Breakdown by Component
			</Card.CardTitle>
			<Card.CardDescription>
				Allocation of budget across different project components
			</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			{#if budgetComponents.length > 0}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Component</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
							<Table.Head class="text-right">Percentage</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each budgetComponents as component, index}
							<Table.Row>
								<Table.Cell class="font-medium">{component.component_name}</Table.Cell>
								<Table.Cell class="text-right">
									{new Intl.NumberFormat('en-PH', {
										style: 'currency',
										currency: 'PHP'
									}).format(component.amount)}
								</Table.Cell>
								<Table.Cell class="text-right">{component.percentage}%</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => removeBudgetComponent(index)}
										class="text-destructive hover:text-destructive"
									>
										<Trash2 class="size-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
						<Table.Row class="bg-muted/30 font-semibold">
							<Table.Cell>Total Allocated</Table.Cell>
							<Table.Cell class="text-right">
								{new Intl.NumberFormat('en-PH', {
									style: 'currency',
									currency: 'PHP'
								}).format(totalBudgetComponents)}
							</Table.Cell>
							<Table.Cell class="text-right">
								{totalBudgetAmount > 0 ? ((totalBudgetComponents / totalBudgetAmount) * 100).toFixed(1) : 0}%
							</Table.Cell>
							<Table.Cell></Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>

				{#if budgetGap !== 0}
					<div
						class="rounded-lg border p-3 {budgetGap > 0
							? 'border-destructive/50 bg-destructive/5'
							: 'border-warning/50 bg-warning/5'}"
					>
						<p class="text-sm font-medium">
							{budgetGap > 0 ? 'Unallocated Budget:' : 'Over-allocated by:'}
							<span class={budgetGap > 0 ? 'text-destructive' : 'text-warning'}>
								{new Intl.NumberFormat('en-PH', {
									style: 'currency',
									currency: 'PHP'
								}).format(Math.abs(budgetGap))}
							</span>
						</p>
					</div>
				{/if}
			{/if}

			<div class="grid gap-3 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="component-name" class="text-xs">Component Name</Label>
					<Input
						id="component-name"
						bind:value={newComponentName}
						placeholder="e.g., Materials & Supplies"
						class="h-9"
					/>
				</div>
				<div class="space-y-2">
					<Label for="component-amount" class="text-xs">Amount (PHP)</Label>
					<CurrencyInput
						id="component-amount"
						bind:value={newComponentAmount}
						placeholder="₱ 0"
						min={0}
						class="h-9"
					/>
				</div>
				<div class="flex items-end">
					<Button
						type="button"
						onclick={addBudgetComponent}
						size="sm"
						disabled={!newComponentName || !newComponentAmount}
						class="w-full gap-2"
					>
						<Plus class="size-4" />
						Add Component
					</Button>
				</div>
			</div>

			<div class="rounded-lg border border-border bg-muted/30 p-4">
				<p class="mb-2 text-sm font-medium">Common Budget Components:</p>
				<div class="flex flex-wrap gap-2 text-xs">
					<Badge variant="outline">Materials/Supplies</Badge>
					<Badge variant="outline">Labor/Services</Badge>
					<Badge variant="outline">Equipment Rental</Badge>
					<Badge variant="outline">Training/Capacity Building</Badge>
					<Badge variant="outline">Administrative Costs</Badge>
					<Badge variant="outline">Contingency (5-10%)</Badge>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Monthly Release Schedule Note -->
	<Card.Card class="border-primary/20 bg-primary/5">
		<Card.CardContent class="pt-6">
			<div class="flex gap-3">
				<Calendar class="mt-0.5 size-5 shrink-0 text-primary" />
				<div>
					<p class="mb-1 font-medium">Monthly Release Schedule</p>
					<p class="text-sm text-muted-foreground">
						After project creation, you can define the monthly budget release schedule tied to
						milestone achievements through the project management interface.
					</p>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>
</div>

<style>
	:global(.required::after) {
		content: ' *';
		color: hsl(var(--destructive));
	}
</style>
