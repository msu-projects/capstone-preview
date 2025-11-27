<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Calendar, ChevronLeft, ChevronRight, Save } from '@lucide/svelte';

	interface Props {
		availableYears: number[];
		selectedYear: number;
		onYearChange: (year: number) => void;
		onSaveCurrentYear?: () => void;
		showSaveButton?: boolean;
		isCurrentYearSaved?: boolean;
	}

	let {
		availableYears,
		selectedYear = $bindable(),
		onYearChange,
		onSaveCurrentYear,
		showSaveButton = true,
		isCurrentYearSaved = false
	}: Props = $props();

	const currentYear = new Date().getFullYear();

	// All possible years to display (current year plus any historical years)
	const allYears = $derived(() => {
		const years = new Set([currentYear, ...availableYears]);
		return Array.from(years).sort((a, b) => b - a);
	});

	// Navigation helpers
	const canGoBack = $derived(
		allYears().findIndex((y) => y === selectedYear) < allYears().length - 1
	);
	const canGoForward = $derived(allYears().findIndex((y) => y === selectedYear) > 0);

	function goToPreviousYear() {
		const years = allYears();
		const currentIndex = years.findIndex((y) => y === selectedYear);
		if (currentIndex < years.length - 1) {
			const newYear = years[currentIndex + 1];
			selectedYear = newYear;
			onYearChange(newYear);
		}
	}

	function goToNextYear() {
		const years = allYears();
		const currentIndex = years.findIndex((y) => y === selectedYear);
		if (currentIndex > 0) {
			const newYear = years[currentIndex - 1];
			selectedYear = newYear;
			onYearChange(newYear);
		}
	}

	function handleYearSelect(year: string | undefined) {
		if (year) {
			const numYear = parseInt(year);
			selectedYear = numYear;
			onYearChange(numYear);
		}
	}

	// Check if viewing historical data
	const isViewingHistorical = $derived(selectedYear !== currentYear);
</script>

<div class="flex items-center gap-2">
	<!-- Year Navigation -->
	<div class="flex items-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
		<Button
			variant="ghost"
			size="icon"
			class="h-9 w-9 rounded-r-none"
			onclick={goToPreviousYear}
			disabled={!canGoBack}
		>
			<ChevronLeft class="size-4" />
		</Button>

		<Select.Root type="single" onValueChange={handleYearSelect}>
			<Select.Trigger
				class="h-9 w-[100px] gap-1 rounded-none border-0 border-x bg-transparent shadow-none ring-0 focus:ring-0"
			>
				<Calendar class="size-4 text-slate-500" />
				<span class="font-medium">{selectedYear}</span>
			</Select.Trigger>
			<Select.Content>
				{#each allYears() as year}
					<Select.Item value={year.toString()}>
						<div class="flex items-center gap-2">
							<span>{year}</span>
							{#if year === currentYear}
								<span class="text-xs text-slate-500">(Current)</span>
							{/if}
							{#if availableYears.includes(year)}
								<span class="text-xs text-emerald-600">✓</span>
							{/if}
						</div>
					</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<Button
			variant="ghost"
			size="icon"
			class="h-9 w-9 rounded-l-none"
			onclick={goToNextYear}
			disabled={!canGoForward}
		>
			<ChevronRight class="size-4" />
		</Button>
	</div>

	<!-- Historical Data Indicator -->
	{#if isViewingHistorical}
		<div
			class="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
		>
			Viewing historical data
		</div>
	{/if}

	<!-- Save Current Year Button -->
	{#if showSaveButton && selectedYear === currentYear && onSaveCurrentYear}
		<Button
			variant={isCurrentYearSaved ? 'outline' : 'default'}
			size="sm"
			onclick={onSaveCurrentYear}
			class="gap-2"
		>
			<Save class="size-4" />
			{isCurrentYearSaved ? 'Update ' + currentYear + ' Data' : 'Save ' + currentYear + ' Data'}
		</Button>
	{/if}
</div>
