<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { formatDate, formatNumber } from '$lib/utils/formatters';
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
		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-blue-50 p-2">
						<CalendarDays class="size-5 text-blue-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Project Year</div>
						<div class="text-xl font-bold text-slate-900">{project.project_year}</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-emerald-50 p-2">
						<Users class="size-5 text-emerald-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Beneficiaries</div>
						<div class="text-xl font-bold text-slate-900">
							{formatNumber(project.beneficiaries)}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-amber-50 p-2">
						<MapPin class="size-5 text-amber-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Sitios Covered</div>
						<div class="text-xl font-bold text-slate-900">{totalSitios}</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-50 p-2">
						<Briefcase class="size-5 text-purple-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Total Jobs</div>
						<div class="text-xl font-bold text-slate-900">
							{(project.employment_generated?.male || 0) +
								(project.employment_generated?.female || 0)}
						</div>
					</div>
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
						<div class="rounded-lg bg-blue-50 p-1.5">
							<FileText class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Project Description</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<p class="leading-relaxed text-slate-600">
						{project.description}
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root class="shadow-sm">
				<Card.Header class="">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5">
							<MapPin class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Project Locations</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="space-y-4">
						<div>
							<div class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Municipality/Municipalities
							</div>
							<div class="text-sm font-medium text-slate-700">{uniqueMunicipalities}</div>
						</div>
						<div>
							<div class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Barangay(s)
							</div>
							<div class="text-sm font-medium text-slate-700">{uniqueBarangays}</div>
						</div>
						<div>
							<div class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Total Sitios
							</div>
							<div class="text-sm font-medium text-slate-700">{totalSitios} sitio(s) covered</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="shadow-sm">
				<Card.Header class="">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5">
							<Building2 class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Agency & Employment</h3>
					</div>
				</Card.Header>
				<Card.Content class="space-y-4 pt-0">
					<!-- Implementing Agency -->
					<div>
						<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
							Implementing Agency
						</div>
						<div class="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
							<Building2 class="size-5 text-slate-400" />
							<span class="text-sm font-medium text-slate-700">
								{project.project_manager_team?.agency || 'Not specified'}
							</span>
						</div>
					</div>

					<!-- Employment Generated -->
					<div>
						<div class="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
							Employment Generated
						</div>
						<div class="grid grid-cols-2 gap-3">
							<div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
								<div class="text-2xl font-bold text-blue-700">
									{project.employment_generated?.male || 0}
								</div>
								<div class="mt-1 text-xs font-medium text-blue-600 uppercase">Male</div>
							</div>
							<div class="rounded-lg border border-pink-100 bg-pink-50 p-3 text-center">
								<div class="text-2xl font-bold text-pink-700">
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
						<div class="rounded-lg bg-blue-50 p-1.5">
							<Activity class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Current Status</h3>
					</div>
				</Card.Header>
				<Card.Content class="space-y-6 pt-0">
					<div class="w-full">
						<div class="mb-1 flex items-end justify-between">
							<span class="text-sm font-medium text-slate-700">Physical Completion</span>
							<span class="text-sm font-bold text-slate-900"
								>{project.completion_percentage}%
								<span class="text-xs font-normal text-slate-400">Actual</span></span
							>
						</div>
						<div class="h-2.5 w-full rounded-full bg-slate-100">
							<div
								class="h-full rounded-full bg-emerald-500 transition-all"
								style="width: {project.completion_percentage}%"
							></div>
						</div>
					</div>
					<div class="rounded-lg border border-amber-100 bg-amber-50 p-4">
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
						<div class="rounded-lg bg-blue-50 p-1.5">
							<Calendar class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Duration</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-between border-b border-slate-100 pb-3">
							<span class="text-sm text-slate-500">Start Date</span>
							<span class="text-sm font-medium text-slate-800"
								>{formatDate(project.start_date)}</span
							>
						</div>
						<div class="flex items-center justify-between border-b border-slate-100 pb-3">
							<span class="text-sm text-slate-500">Target Completion</span>
							<span class="text-sm font-medium text-slate-800">{formatDate(project.end_date)}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="text-sm text-slate-500">Total Duration</span>
							<span class="text-sm font-medium text-slate-800">
								{Math.ceil(
									(new Date(project.end_date).getTime() - new Date(project.start_date).getTime()) /
										(1000 * 60 * 60 * 24)
								)} Days
							</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="gap-2 shadow-sm">
				<Card.Header class="pb-4">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5">
							<MapPin class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Sitio Locations</h3>
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
