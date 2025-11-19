<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { CurrencyInput } from '$lib/components/ui/currency-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		fundSource: string;
		fiscalYear: string;
		implementingUnit: string;
		location: string;
		allocatedBudget: string;
		supplementalBudget: string;
		releasedAmount: string;
		obligations: string;
		contractCost: string;
		physicalPlan: string;
		physicalActual: string;
		physicalSlippage: string;
		maleEmployment: string;
		femaleEmployment: string;
		contractDuration: string;
		contractDelivery: string;
		contractExtension: string;
		statusStage: string;
		statusIssues: string;
		statusRecommendations: string;
		catchUpPlan: string;
	}

	let {
		fundSource = $bindable(),
		fiscalYear = $bindable(),
		implementingUnit = $bindable(),
		location = $bindable(),
		allocatedBudget = $bindable(),
		supplementalBudget = $bindable(),
		releasedAmount = $bindable(),
		obligations = $bindable(),
		contractCost = $bindable(),
		physicalPlan = $bindable(),
		physicalActual = $bindable(),
		physicalSlippage = $bindable(),
		maleEmployment = $bindable(),
		femaleEmployment = $bindable(),
		contractDuration = $bindable(),
		contractDelivery = $bindable(),
		contractExtension = $bindable(),
		statusStage = $bindable(),
		statusIssues = $bindable(),
		statusRecommendations = $bindable(),
		catchUpPlan = $bindable()
	}: Props = $props();

	const totalBudget = $derived(Number(allocatedBudget || 0) + Number(supplementalBudget || 0));
	const totalEmployment = $derived(Number(maleEmployment || 0) + Number(femaleEmployment || 0));

	function formatCurrency(amount: string): string {
		const num = Number(amount);
		if (isNaN(num)) return '₱0';
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(num);
	}
</script>

<div class="space-y-6">
	<!-- General Monitoring Info -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>General Information</Card.CardTitle>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="fundSource">Fund Source</Label>
					<Input id="fundSource" bind:value={fundSource} placeholder="e.g., GAA 2024" />
				</div>

				<div class="space-y-2">
					<Label for="fiscalYear">Fiscal Year</Label>
					<Input id="fiscalYear" type="number" bind:value={fiscalYear} min="2000" />
				</div>

				<div class="space-y-2">
					<Label for="implementingUnit">Implementing Unit</Label>
					<Input
						id="implementingUnit"
						bind:value={implementingUnit}
						placeholder="Department/Division"
					/>
				</div>

				<div class="space-y-2">
					<Label for="location">Location</Label>
					<Input id="location" bind:value={location} placeholder="Full address" />
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Financial Monitoring -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Financial Monitoring</Card.CardTitle>
			<Card.CardDescription>Track budget allocation and expenditure</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="allocatedBudget">Allocated Budget</Label>
					<CurrencyInput
						id="allocatedBudget"
						bind:value={allocatedBudget}
						placeholder="₱ 0"
						min={0}
					/>
				</div>

				<div class="space-y-2">
					<Label for="supplementalBudget">Supplemental Budget</Label>
					<CurrencyInput
						id="supplementalBudget"
						bind:value={supplementalBudget}
						placeholder="₱ 0"
						min={0}
					/>
				</div>

				<div class="space-y-2">
					<Label for="totalBudget">Total Budget</Label>
					<Input id="totalBudget" value={formatCurrency(totalBudget.toString())} readonly />
				</div>

				<div class="space-y-2">
					<Label for="releasedAmount">Released Amount</Label>
					<CurrencyInput
						id="releasedAmount"
						bind:value={releasedAmount}
						placeholder="₱ 0"
						min={0}
					/>
				</div>

				<div class="space-y-2">
					<Label for="obligations">Obligations</Label>
					<CurrencyInput
						id="obligations"
						bind:value={obligations}
						placeholder="₱ 0"
						min={0}
					/>
				</div>

				<div class="space-y-2">
					<Label for="contractCost">Contract Cost</Label>
					<CurrencyInput
						id="contractCost"
						bind:value={contractCost}
						placeholder="₱ 0"
						min={0}
					/>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Physical Progress -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Physical Progress</Card.CardTitle>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="grid gap-4 md:grid-cols-3">
				<div class="space-y-2">
					<Label for="physicalPlan">Plan (%)</Label>
					<Input
						id="physicalPlan"
						type="number"
						bind:value={physicalPlan}
						min="0"
						max="100"
						step="0.1"
					/>
				</div>

				<div class="space-y-2">
					<Label for="physicalActual">Actual (%)</Label>
					<Input
						id="physicalActual"
						type="number"
						bind:value={physicalActual}
						min="0"
						max="100"
						step="0.1"
					/>
				</div>

				<div class="space-y-2">
					<Label for="physicalSlippage">Slippage (%)</Label>
					<Input
						id="physicalSlippage"
						type="number"
						value={physicalSlippage}
						readonly
						class={Number(physicalSlippage) < 0 ? 'text-destructive' : 'text-green-600'}
					/>
				</div>
			</div>
		</Card.CardContent>
	</Card.Card>

	<!-- Employment & Contract -->
	<div class="grid gap-6 md:grid-cols-2">
		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>Employment Generated</Card.CardTitle>
			</Card.CardHeader>
			<Card.CardContent class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="maleEmployment">Male</Label>
						<Input id="maleEmployment" type="number" bind:value={maleEmployment} min="0" />
					</div>

					<div class="space-y-2">
						<Label for="femaleEmployment">Female</Label>
						<Input id="femaleEmployment" type="number" bind:value={femaleEmployment} min="0" />
					</div>
				</div>

				<Separator />

				<div class="flex justify-between">
					<span class="font-medium">Total Employment</span>
					<span class="text-xl font-bold text-primary">{totalEmployment}</span>
				</div>
			</Card.CardContent>
		</Card.Card>

		<Card.Card>
			<Card.CardHeader>
				<Card.CardTitle>Contract Information</Card.CardTitle>
			</Card.CardHeader>
			<Card.CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="contractDuration">Duration</Label>
					<Input id="contractDuration" bind:value={contractDuration} placeholder="e.g., 180 days" />
				</div>

				<div class="space-y-2">
					<Label for="contractDelivery">Delivery</Label>
					<Input
						id="contractDelivery"
						bind:value={contractDelivery}
						placeholder="e.g., CD, 180 CD"
					/>
				</div>
				<div class="space-y-2">
					<Label for="contractExtension">Extension</Label>
					<Input
						id="contractExtension"
						bind:value={contractExtension}
						placeholder="e.g., 30 days"
					/>
				</div>
			</Card.CardContent>
		</Card.Card>
	</div>

	<!-- Status Summary -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Status Summary</Card.CardTitle>
		</Card.CardHeader>
		<Card.CardContent class="space-y-4">
			<div class="space-y-2">
				<Label for="statusStage">Current Stage</Label>
				<Input id="statusStage" bind:value={statusStage} placeholder="e.g., Construction Phase" />
			</div>

			<div class="space-y-2">
				<Label for="statusIssues">Issues</Label>
				<Textarea
					id="statusIssues"
					bind:value={statusIssues}
					placeholder="List any current issues"
					rows={3}
				/>
			</div>

			<div class="space-y-2">
				<Label for="statusRecommendations">Recommendations</Label>
				<Textarea
					id="statusRecommendations"
					bind:value={statusRecommendations}
					placeholder="Recommended actions"
					rows={3}
				/>
			</div>

			<div class="space-y-2">
				<Label for="catchUpPlan">Catch-Up Plan</Label>
				<Textarea
					id="catchUpPlan"
					bind:value={catchUpPlan}
					placeholder="Plan to address delays"
					rows={3}
				/>
			</div>
		</Card.CardContent>
	</Card.Card>
</div>

<style>
	:global(input[readonly]) {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
