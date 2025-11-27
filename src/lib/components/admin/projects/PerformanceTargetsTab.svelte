<script lang="ts">
	import { Calendar as CalendarComponent } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import { CurrencyInput } from '$lib/components/ui/currency-input';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { type DateValue, getLocalTimeZone } from '@internationalized/date';
	import { Banknote, Briefcase, Calendar } from '@lucide/svelte';

	let {
		targetStartDate = $bindable<DateValue | undefined>(undefined),
		durationInCalendarDays = $bindable(''),
		totalBudget = $bindable(''),
		employmentMale = $bindable(''),
		employmentFemale = $bindable('')
	} = $props<{
		targetStartDate: DateValue | undefined;
		durationInCalendarDays: string;
		totalBudget: string;
		employmentMale: string;
		employmentFemale: string;
	}>();

	// Auto-calculate target end date based on start date + calendar days
	const targetEndDate = $derived.by(() => {
		if (targetStartDate && durationInCalendarDays) {
			const days = Number(durationInCalendarDays);
			if (days > 0) {
				return targetStartDate.add({ days });
			}
		}
		return undefined;
	});
</script>

<div class="space-y-6">
	<!-- Universal Performance Indicators -->
	<Card.Card>
		<Card.CardHeader>
			<Card.CardTitle>Universal Performance Indicators</Card.CardTitle>
			<Card.CardDescription>Standard indicators applicable to all projects</Card.CardDescription>
		</Card.CardHeader>
		<Card.CardContent class="space-y-6">
			<!-- Project Timeline -->
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label class="required flex items-center gap-2">
						<Calendar class="size-4" />
						Target Start Date
					</Label>
					<Popover.Root>
						<Popover.Trigger
							class={cn(
								'flex h-10 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
								!targetStartDate && 'text-muted-foreground'
							)}
						>
							<Calendar class="mr-2 size-4" />
							{targetStartDate
								? targetStartDate.toDate(getLocalTimeZone()).toLocaleDateString()
								: 'Pick a date'}
						</Popover.Trigger>
						<Popover.Content class="w-auto p-0">
							<CalendarComponent
								type="single"
								bind:value={targetStartDate}
								class="rounded-md border"
								captionLayout="dropdown"
							/>
						</Popover.Content>
					</Popover.Root>
				</div>
				<div class="space-y-2">
					<Label for="duration-cd" class="required flex items-center gap-2">
						<Calendar class="size-4" />
						Project Duration (Calendar Days)
					</Label>
					<Input
						id="duration-cd"
						type="number"
						bind:value={durationInCalendarDays}
						placeholder="e.g., 120"
						min="1"
					/>
					<p class="text-xs text-muted-foreground">
						{#if targetStartDate && durationInCalendarDays && Number(durationInCalendarDays) > 0}
							Target completion: <strong
								>{targetEndDate?.toDate(getLocalTimeZone()).toLocaleDateString()}</strong
							>
						{:else}
							Enter duration in calendar days (CD)
						{/if}
					</p>
				</div>
			</div>

			<!-- Budget Allocation -->
			<div class="space-y-2">
				<Label for="total-budget" class="required flex items-center gap-2">
					<Banknote class="size-4" />
					Total Budget Allocation
				</Label>
				<CurrencyInput id="total-budget" bind:value={totalBudget} placeholder="₱ 0" min={0} />
			</div>

			<!-- Employment Generation -->
			<div>
				<Label class="mb-3 flex items-center gap-2">
					<Briefcase class="size-4" />
					Employment to Generate (Male/Female Breakdown)
				</Label>
				<div class="grid gap-4 md:grid-cols-3">
					<div class="space-y-2">
						<Label for="male-employment" class="text-sm">Male</Label>
						<Input
							id="male-employment"
							type="number"
							bind:value={employmentMale}
							placeholder="Male employment"
							min="0"
						/>
					</div>
					<div class="space-y-2">
						<Label for="female-employment" class="text-sm">Female</Label>
						<Input
							id="female-employment"
							type="number"
							bind:value={employmentFemale}
							placeholder="Female employment"
							min="0"
						/>
					</div>
					<div class="space-y-2">
						<Label class="text-sm">Total Employment</Label>
						<Input
							type="number"
							value={(Number(employmentMale) || 0) + (Number(employmentFemale) || 0)}
							disabled
							class="bg-muted"
						/>
					</div>
				</div>
				<p class="mt-2 text-xs text-muted-foreground">
					Total number of people expected to be employed by the project
				</p>
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
