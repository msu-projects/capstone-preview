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
		baselinePlannedStart: DateValue | undefined;
		baselinePlannedEnd: DateValue | undefined;
		baselineDuration: string;
		baselineBudget: string;
		baselinePlannedStartOpen: boolean;
		baselinePlannedEndOpen: boolean;
	}

	let {
		baselinePlannedStart = $bindable(),
		baselinePlannedEnd = $bindable(),
		baselineDuration = $bindable(),
		baselineBudget = $bindable(),
		baselinePlannedStartOpen = $bindable(),
		baselinePlannedEndOpen = $bindable()
	}: Props = $props();
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>Baseline Information</Card.CardTitle>
		<Card.CardDescription>
			Original planned timeline and budget for variance tracking and accountability
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent class="space-y-4">
		<div class="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
			This baseline captures the original project plan. Compare these values against current dates
			and budget to measure project variance and delays.
		</div>

		<div class="grid gap-4 md:grid-cols-2">
			<!-- Planned Start Date -->
			<div class="space-y-2">
				<Label for="baselinePlannedStart">Original Planned Start Date</Label>
				<Popover.Root bind:open={baselinePlannedStartOpen}>
					<Popover.Trigger class="w-full">
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

			<!-- Planned End Date -->
			<div class="space-y-2">
				<Label for="baselinePlannedEnd">Original Planned End Date</Label>
				<Popover.Root bind:open={baselinePlannedEndOpen}>
					<Popover.Trigger class="w-full">
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

			<!-- Planned Duration -->
			<div class="space-y-2">
				<Label for="baselineDuration">Original Planned Duration (days)</Label>
				<Input
					id="baselineDuration"
					type="number"
					bind:value={baselineDuration}
					placeholder="e.g., 180"
					min="0"
				/>
			</div>

			<!-- Baseline Budget -->
			<div class="space-y-2">
				<Label for="baselineBudget">Original Approved Budget (PHP)</Label>
				<Input
					id="baselineBudget"
					type="number"
					bind:value={baselineBudget}
					placeholder="0"
					min="0"
					step="1000"
				/>
			</div>
		</div>
	</Card.CardContent>
</Card.Card>
