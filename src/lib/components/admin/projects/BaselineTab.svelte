<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import type { DateValue } from '@internationalized/date';
	import { Calendar as CalendarIcon } from '@lucide/svelte';

	interface Props {
		baselineApproved: DateValue | undefined;
		baselinePlannedStart: DateValue | undefined;
		baselinePlannedEnd: DateValue | undefined;
		baselineDuration: string;
		baselineBudget: string;
		baselineMilestones: string;
		baselineApprovedOpen: boolean;
		baselinePlannedStartOpen: boolean;
		baselinePlannedEndOpen: boolean;
	}

	let {
		baselineApproved = $bindable(),
		baselinePlannedStart = $bindable(),
		baselinePlannedEnd = $bindable(),
		baselineDuration = $bindable(),
		baselineBudget = $bindable(),
		baselineMilestones = $bindable(),
		baselineApprovedOpen = $bindable(),
		baselinePlannedStartOpen = $bindable(),
		baselinePlannedEndOpen = $bindable()
	}: Props = $props();
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>Baseline Information</Card.CardTitle>
		<Card.CardDescription>Original approved plan for project comparison</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent class="space-y-4">
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-2">
				<Label for="baselineApproved">Approved Date</Label>
				<Popover.Root bind:open={baselineApprovedOpen}>
					<Popover.Trigger class="w-full justify-start text-left font-normal">
						<Button variant="outline" class="w-full justify-start text-left font-normal">
							<CalendarIcon class="mr-2 size-4" />
							{baselineApproved ? baselineApproved.toString() : 'Pick a date'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar
							type="single"
							bind:value={baselineApproved}
							class="rounded-md border"
							onValueChange={() => (baselineApprovedOpen = false)}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>
			<div class="space-y-2">
				<Label for="baselineBudget">Baseline Budget</Label>
				<Input id="baselineBudget" type="number" bind:value={baselineBudget} min="0" step="1000" />
			</div>

			<div class="space-y-2">
				<Label for="baselinePlannedStart">Planned Start</Label>
				<Popover.Root bind:open={baselinePlannedStartOpen}>
					<Popover.Trigger class="w-full justify-start text-left font-normal">
						<Button variant="outline" class="w-full justify-start text-left font-normal">
							<CalendarIcon class="mr-2 size-4" />
							{baselinePlannedStart ? baselinePlannedStart.toString() : 'Pick a date'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar
							type="single"
							bind:value={baselinePlannedStart}
							class="rounded-md border"
							onValueChange={() => (baselinePlannedStartOpen = false)}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>
			<div class="space-y-2">
				<Label for="baselinePlannedEnd">Planned End</Label>
				<Popover.Root bind:open={baselinePlannedEndOpen}>
					<Popover.Trigger class="w-full justify-start text-left font-normal">
						<Button variant="outline" class="w-full justify-start text-left font-normal">
							<CalendarIcon class="mr-2 size-4" />
							{baselinePlannedEnd ? baselinePlannedEnd.toString() : 'Pick a date'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar
							type="single"
							bind:value={baselinePlannedEnd}
							class="rounded-md border"
							onValueChange={() => (baselinePlannedEndOpen = false)}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>
			<div class="space-y-2">
				<Label for="baselineDuration">Duration (days)</Label>
				<Input id="baselineDuration" type="number" bind:value={baselineDuration} min="0" />
			</div>

			<div class="space-y-2">
				<Label for="baselineMilestones">Number of Milestones</Label>
				<Input id="baselineMilestones" type="number" bind:value={baselineMilestones} min="0" />
			</div>
		</div>
	</Card.CardContent>
</Card.Card>
