<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { NeedLevel, Project, Sitio } from '$lib/types';
	import { getNeedLevelFromScore } from '$lib/types';
	import { downloadSitioProfilePDF } from '$lib/utils/pdf-generator';
	import { Calendar, Download, Gauge, MapPin, Pencil } from '@lucide/svelte';
	import YearSelector from './YearSelector.svelte';

	interface Props {
		sitio: Sitio;
		relatedProjects: Project[];
		isAdminView?: boolean;
		availableYears: number[];
		selectedYear: number;
		onYearChange: (year: number) => void;
		onSaveCurrentYear: () => void;
		isCurrentYearSaved: boolean;
	}

	let {
		sitio,
		relatedProjects,
		isAdminView = false,
		availableYears,
		selectedYear = $bindable(),
		onYearChange,
		onSaveCurrentYear,
		isCurrentYearSaved
	}: Props = $props();

	// Need level badge styling
	const needLevelConfig: Record<NeedLevel, { label: string; bgClass: string; textClass: string }> =
		{
			critical: {
				label: 'Critical Need',
				bgClass: 'bg-red-100 dark:bg-red-900/30',
				textClass: 'text-red-700 dark:text-red-400'
			},
			high: {
				label: 'High Need',
				bgClass: 'bg-orange-100 dark:bg-orange-900/30',
				textClass: 'text-orange-700 dark:text-orange-400'
			},
			medium: {
				label: 'Medium Need',
				bgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
				textClass: 'text-yellow-700 dark:text-yellow-400'
			},
			low: {
				label: 'Low Need',
				bgClass: 'bg-green-100 dark:bg-green-900/30',
				textClass: 'text-green-700 dark:text-green-400'
			}
		};

	const needScore = $derived(sitio.need_score ?? 5);
	const needLevel = $derived(sitio.need_level ?? getNeedLevelFromScore(needScore));
	const needConfig = $derived(needLevelConfig[needLevel]);
</script>

<!-- Hero Header -->
<header class="relative overflow-hidden bg-white dark:bg-slate-900">
	<!-- Background Pattern -->
	<div
		class="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30"
	></div>
	<div
		class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"
	></div>

	<!-- Accent Line -->
	<div
		class="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500"
	></div>

	<div class="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
			<!-- Left: Sitio Info -->
			<div class="flex-1 space-y-4">
				<!-- Location Badges -->
				<div class="flex flex-wrap items-center gap-2">
					<Badge variant="secondary" class="gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100">
						<MapPin class="size-3" />
						{sitio.municipality}
					</Badge>
					<Badge variant="secondary" class="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
						{sitio.barangay}
					</Badge>
					{#if sitio.coding}
						<Badge variant="outline" class="font-mono text-slate-500">
							Code: {sitio.coding}
						</Badge>
					{/if}
				</div>

				<!-- Title & Need Score -->
				<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
					<!-- Title -->
					<div class="flex-1">
						<h1
							class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-slate-100"
						>
							{sitio.name}
						</h1>
						<p class="mt-2 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
							Community profile for {sitio.name}, Barangay {sitio.barangay}, {sitio.municipality}.
							{#if sitio.province}
								{sitio.province} Province.
							{/if}
						</p>
					</div>

					<!-- Prominent Need Score Card -->
					<div
						class="shrink-0 rounded-2xl border-2 {needConfig.bgClass} {needConfig.textClass} border-current/20 p-4 shadow-lg ring-2 ring-current/10"
					>
						<div class="flex items-center gap-4">
							<!-- Circular Score Indicator -->
							<div class="relative flex size-20 items-center justify-center">
								<!-- Background Circle -->
								<svg class="absolute inset-0 size-20 -rotate-90" viewBox="0 0 80 80">
									<circle
										cx="40"
										cy="40"
										r="32"
										stroke="currentColor"
										stroke-width="6"
										fill="none"
										class="opacity-20"
									/>
									<!-- Progress Circle -->
									<circle
										cx="40"
										cy="40"
										r="32"
										stroke="currentColor"
										stroke-width="6"
										fill="none"
										stroke-linecap="round"
										class="transition-all duration-700"
										style="stroke-dasharray: {(needScore / 10) * 201}px 201px;"
									/>
								</svg>
								<!-- Score Text -->
								<div class="relative text-center">
									<div class="text-2xl leading-none font-bold">{needScore}</div>
									<div class="text-xs font-medium opacity-80">/10</div>
								</div>
							</div>

							<!-- Need Level Text -->
							<div class="space-y-1">
								<div class="flex items-center gap-1.5">
									<Gauge class="size-4" />
									<span class="text-xs font-semibold tracking-wide uppercase opacity-80"
										>Need Score</span
									>
								</div>
								<div class="text-lg leading-tight font-bold">{needConfig.label}</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Quick Info -->
				<div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
					<span class="flex items-center gap-1.5">
						<Calendar class="size-4" />
						Last updated: {new Date(sitio.updated_at || sitio.created_at).toLocaleDateString(
							'en-US',
							{ month: 'short', day: 'numeric', year: 'numeric' }
						)}
					</span>
					{#if sitio.coordinates.lat && sitio.coordinates.lng}
						<span class="flex items-center gap-1.5">
							<MapPin class="size-4" />
							{sitio.coordinates.lat.toFixed(4)}°N, {sitio.coordinates.lng.toFixed(4)}°E
						</span>
					{/if}
				</div>
			</div>

			<!-- Right: Year Selector & Actions -->
			<div class="flex shrink-0 items-center gap-4">
				<YearSelector
					{availableYears}
					bind:selectedYear
					{onYearChange}
					{onSaveCurrentYear}
					showSaveButton={false}
					{isCurrentYearSaved}
				/>
				{#if isAdminView}
					<div class="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							class="gap-2"
							onclick={() => downloadSitioProfilePDF(sitio)}
						>
							<Download class="size-4" />
							Download PDF
						</Button>
						<Button size="sm" class="gap-2" href="/admin/sitios/{sitio.id}/edit">
							<Pencil class="size-4" />
							Edit Sitio
						</Button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>
