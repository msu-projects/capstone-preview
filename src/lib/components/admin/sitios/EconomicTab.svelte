<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let {
		top_employments = $bindable(['', '', '']),
		top_income_brackets = $bindable(['', '', ''])
	}: {
		top_employments: string[];
		top_income_brackets: string[];
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Economic Condition</Card.Title>
		<Card.Description>Employment and income information</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		<!-- Top Employments -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Top Employment Types</h3>
			<div class="space-y-3">
				{#each top_employments as employment, i}
					<div class="space-y-2">
						<Label for={`employment_${i}`}>Employment Type {i + 1}</Label>
						<Input
							id={`employment_${i}`}
							bind:value={top_employments[i]}
							placeholder="e.g., Farming, Teaching, Construction"
						/>
					</div>
				{/each}
			</div>
		</div>

		<!-- Top Income Brackets -->
		<div class="space-y-4">
			<h3 class="text-lg font-semibold">Top Income Brackets</h3>
			<div class="space-y-3">
				{#each top_income_brackets as bracket, i}
					<div class="space-y-2">
						<Label for={`bracket_${i}`}>Income Bracket {i + 1}</Label>
						<Input
							id={`bracket_${i}`}
							bind:value={top_income_brackets[i]}
							placeholder="e.g., Below 10k, 10k-20k, Above 20k"
						/>
					</div>
				{/each}
			</div>
		</div>
	</Card.Content>
</Card.Root>
