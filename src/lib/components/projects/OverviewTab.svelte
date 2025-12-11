<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { formatDate, formatNumber } from '$lib/utils/formatters';
	import { getCompletionPercentage } from '$lib/utils/project-calculations';
	import {
		Activity,
		Briefcase,
		Building2,
		Calendar,
		CalendarDays,
		Clock,
		FileText,
		MapPin,
		Users
	} from '@lucide/svelte';
	import ProjectSitiosMap from './ProjectSitiosMap.svelte';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	// Get completion percentage from monthly progress
	const completionPercentage = $derived(getCompletionPercentage(project));

	// Extract unique municipalities and barangays from project_sitios
	const uniqueMunicipalities = $derived(
		project.project_sitios && project.project_sitios.length > 0
			? [...new Set(project.project_sitios.map((s) => s.municipality))].join(', ')
			: 'Not specified'
	);

	const uniqueBarangays = $derived(
		project.project_sitios && project.project_sitios.length > 0
			? [...new Set(project.project_sitios.map((s) => s.barangay))].join(', ')
			: 'Not specified'
	);

	const totalSitios = $derived(project.project_sitios?.length || 0);
</script>

<!-- Overview Tab -->
<div class="space-y-6">
	<!-- Key Information Grid -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root class="border-l-4 border-l-blue-600 bg-white py-0 dark:bg-slate-800">
			<Card.Content class="p-5">
				<div class="flex items-start justify-between">
					<div>
						<p
							class="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
						>
							Project Year
						</p>
						<h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
							{project.project_year}
						</h3>
					</div>
					<div class="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/30">
						<CalendarDays class="size-5" />
					</div>
				</div>
				<div class="mt-4 text-xs text-slate-500 dark:text-slate-400">Fiscal year</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-l-4 border-l-emerald-600 bg-white py-0 dark:bg-slate-800">
			<Card.Content class="p-5">
				<div class="flex items-start justify-between">
					<div>
						<p
							class="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
						>
							Beneficiaries
						</p>
						<h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
							{formatNumber(project.beneficiaries)}
						</h3>
					</div>
					<div class="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/30">
						<Users class="size-5" />
					</div>
				</div>
				<div class="mt-4 text-xs text-slate-500 dark:text-slate-400">Households served</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-l-4 border-l-amber-600 bg-white py-0 dark:bg-slate-800">
			<Card.Content class="p-5">
				<div class="flex items-start justify-between">
					<div>
						<p
							class="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
						>
							Sitios Covered
						</p>
						<h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
							{totalSitios}
						</h3>
					</div>
					<div class="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-900/30">
						<MapPin class="size-5" />
					</div>
				</div>
				<div class="mt-4 text-xs text-slate-500 dark:text-slate-400">Total locations</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="border-l-4 border-l-purple-600 bg-white py-0 dark:bg-slate-800">
			<Card.Content class="p-5">
				<div class="flex items-start justify-between">
					<div>
						<p
							class="text-xs font-medium tracking-wider text-slate-500 uppercase dark:text-slate-400"
						>
							Employment Generated
						</p>
						<h3 class="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
							{formatNumber(
								(project.employment_generated?.male || 0) +
									(project.employment_generated?.female || 0)
							)}
						</h3>
					</div>
					<div class="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-900/30">
						<Briefcase class="size-5" />
					</div>
				</div>
				<div class="mt-4 text-xs text-slate-500 dark:text-slate-400">
					{#if project.employment_generated}
						{formatNumber(project.employment_generated.male)} M / {formatNumber(
							project.employment_generated.female
						)} F
					{:else}
						Jobs created
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Left Column: Description & Locations -->
		<div class="space-y-6 lg:col-span-2">
			<Card.Root class="shadow-sm">
				<Card.Header class="">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
							<FileText class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
							Project Description
						</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<p class="leading-relaxed text-slate-600 dark:text-slate-400">
						{project.description}
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root class="shadow-sm">
				<Card.Header class="">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
							<MapPin class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
							Project Locations
						</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="space-y-4">
						<div>
							<div
								class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
							>
								Municipality/Municipalities
							</div>
							<div class="text-sm font-medium text-slate-700 dark:text-slate-300">
								{uniqueMunicipalities}
							</div>
						</div>
						<div>
							<div
								class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
							>
								Barangay(s)
							</div>
							<div class="text-sm font-medium text-slate-700 dark:text-slate-300">
								{uniqueBarangays}
							</div>
						</div>
						<div>
							<div
								class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
							>
								Total Sitios
							</div>
							<div class="text-sm font-medium text-slate-700 dark:text-slate-300">
								{totalSitios} sitio(s) covered
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="shadow-sm">
				<Card.Header class="">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
							<Building2 class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
							Agency & Employment
						</h3>
					</div>
				</Card.Header>
				<Card.Content class="space-y-4 pt-0">
					<!-- Implementing Agencies -->
					{#if project.implementing_agencies && project.implementing_agencies.length > 0}
						<div>
							<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Implementing Agencies
							</div>
							<div
								class="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
							>
								<ul class="space-y-2">
									{#each project.implementing_agencies as agency}
										<li class="flex items-start gap-2">
											<Building2 class="mt-0.5 size-4 shrink-0 text-slate-400" />
											<span class="text-sm font-medium text-slate-700 dark:text-slate-300">
												{agency}
											</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					{/if}

					<!-- Employment Generated -->
					<div>
						<div
							class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500"
						>
							Employment Generated
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div
								class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center dark:border-blue-900/50 dark:bg-blue-900/20"
							>
								<div class="text-2xl font-bold text-blue-700 dark:text-blue-400">
									{project.employment_generated?.male || 0}
								</div>
								<div class="mt-1 text-xs font-medium text-blue-600 uppercase">Male</div>
							</div>
							<div
								class="rounded-lg border border-pink-100 bg-pink-50 p-3 text-center dark:border-pink-900/50 dark:bg-pink-900/20"
							>
								<div class="text-2xl font-bold text-pink-700 dark:text-pink-400">
									{project.employment_generated?.female || 0}
								</div>
								<div class="mt-1 text-xs font-medium text-pink-600 uppercase">Female</div>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right Column: Key Metrics -->
		<div class="space-y-6">
			<Card.Root class="gap-2 shadow-sm">
				<Card.Header class="pb-4">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
							<Activity class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Current Status</h3>
					</div>
				</Card.Header>
				<Card.Content class="space-y-6 pt-0">
					<div class="w-full">
						<div class="mb-1 flex items-end justify-between">
							<span class="text-sm font-medium text-slate-700">Physical Completion</span>
							<span class="text-sm font-bold text-slate-900"
								>{completionPercentage}%
								<span class="text-xs font-normal text-slate-400">Actual</span></span
							>
						</div>
						<div class="h-2.5 w-full rounded-full bg-slate-100">
							<div
								class="h-full rounded-full bg-emerald-500 transition-all"
								style="width: {completionPercentage}%"
							></div>
						</div>
					</div>
					<div
						class="rounded-lg border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20"
					>
						<div class="flex items-start gap-3">
							<Clock class="mt-0.5 size-5 text-amber-600" />
							<div>
								<h4 class="text-sm font-semibold text-amber-800">Timeline Analysis</h4>
								<p class="mt-1 text-xs text-amber-700">
									Project is currently on track with the planned schedule.
								</p>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="gap-2 shadow-sm">
				<Card.Header class="pb-4">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
							<Calendar class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Duration</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="flex flex-col gap-4">
						<div
							class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700"
						>
							<span class="text-sm text-slate-500 dark:text-slate-400">Start Date</span>
							<span class="text-sm font-medium text-slate-800 dark:text-slate-200"
								>{formatDate(project.start_date)}</span
							>
						</div>
						<div
							class="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-700"
						>
							<span class="text-sm text-slate-500 dark:text-slate-400">Contract Duration</span>
							<span class="text-sm font-medium text-slate-800 dark:text-slate-200"
								>{project.contract_duration}</span
							>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="gap-2 shadow-sm">
				<Card.Header class="pb-4">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5 dark:bg-blue-900/30">
							<MapPin class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
							Sitio Locations
						</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="h-[400px] w-full">
						<ProjectSitiosMap {project} />
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
