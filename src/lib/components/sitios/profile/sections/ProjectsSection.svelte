<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Project, Sitio } from '$lib/types';
	import {
		ArrowUpRight,
		Banknote,
		Calendar,
		CheckCircle,
		Clock,
		FolderKanban,
		Pause,
		TrendingUp,
		Users
	} from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		relatedProjects: Project[];
		isAdminView?: boolean;
	}

	const { sitio, relatedProjects, isAdminView = false }: Props = $props();

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Project statistics
	const totalBudget = $derived(relatedProjects.reduce((sum, p) => sum + p.budget, 0));
	const activeProjects = $derived(relatedProjects.filter((p) => p.status === 'in-progress'));
	const completedProjects = $derived(relatedProjects.filter((p) => p.status === 'completed'));
	const planningProjects = $derived(relatedProjects.filter((p) => p.status === 'planning'));
	const suspendedProjects = $derived(relatedProjects.filter((p) => p.status === 'suspended'));

	// Total beneficiaries targeted for this sitio
	const totalBeneficiaries = $derived(
		relatedProjects.reduce((sum, p) => {
			const sitioTarget = p.project_sitios?.find((ps) => ps.sitio_id === sitio.id);
			return sum + (sitioTarget?.beneficiaries_target || p.beneficiaries || 0);
		}, 0)
	);

	// Average completion
	const avgCompletion = $derived(
		relatedProjects.length > 0
			? relatedProjects.reduce((sum, p) => sum + p.completion_percentage, 0) /
					relatedProjects.length
			: 0
	);

	function getStatusConfig(status: string) {
		switch (status) {
			case 'in-progress':
				return {
					label: 'In Progress',
					variant: 'default' as const,
					bgColor: 'bg-blue-100',
					textColor: 'text-blue-700'
				};
			case 'completed':
				return {
					label: 'Completed',
					variant: 'default' as const,
					bgColor: 'bg-emerald-100',
					textColor: 'text-emerald-700'
				};
			case 'planning':
				return {
					label: 'Planning',
					variant: 'secondary' as const,
					bgColor: 'bg-slate-100',
					textColor: 'text-slate-700'
				};
			case 'suspended':
				return {
					label: 'Suspended',
					variant: 'destructive' as const,
					bgColor: 'bg-red-100',
					textColor: 'text-red-700'
				};
			default:
				return {
					label: status,
					variant: 'outline' as const,
					bgColor: 'bg-slate-100',
					textColor: 'text-slate-700'
				};
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'in-progress':
				return TrendingUp;
			case 'completed':
				return CheckCircle;
			case 'planning':
				return Clock;
			case 'suspended':
				return Pause;
			default:
				return FolderKanban;
		}
	}
</script>

<div class="space-y-6">
	<!-- Summary Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-blue-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-blue-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<FolderKanban class="size-5 text-blue-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Total Projects</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{relatedProjects.length}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-emerald-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-emerald-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<TrendingUp class="size-5 text-emerald-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Active Projects</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-emerald-700 sm:text-xl lg:text-2xl"
						>
							{activeProjects.length}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-amber-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-amber-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-amber-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Banknote class="size-5 text-amber-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Total Investment</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatCurrency(totalBudget)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="group relative overflow-hidden border-0 bg-white/80 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:shadow-md hover:ring-slate-300/50"
		>
			<div
				class="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-purple-50 opacity-50"
			></div>
			<div
				class="absolute inset-0 bg-purple-50 opacity-0 transition-opacity group-hover:opacity-30"
			></div>
			<Card.Content class="relative p-4 sm:p-5">
				<div class="flex items-center gap-3 sm:gap-4">
					<div class="rounded-xl bg-purple-50 p-2.5 ring-1 ring-black/5 sm:p-3">
						<Users class="size-5 text-purple-700 sm:size-6" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-xs font-medium text-slate-500 sm:text-sm">Beneficiaries</p>
						<p
							class="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl lg:text-2xl"
						>
							{formatNumber(totalBeneficiaries)}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Status Breakdown -->
	<Card.Root class="gap-0 py-0 shadow-sm">
		<Card.Header class="border-b bg-slate-50/50 py-6">
			<div class="flex items-center gap-2">
				<div class="rounded-lg bg-slate-100 p-1.5">
					<FolderKanban class="size-4 text-slate-600" />
				</div>
				<Card.Title class="text-lg">Project Status Breakdown</Card.Title>
			</div>
		</Card.Header>
		<Card.Content class="py-6">
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<div class="rounded-xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
					<TrendingUp class="mx-auto size-6 text-emerald-600" />
					<div class="mt-2 text-2xl font-bold text-emerald-700">{activeProjects.length}</div>
					<div class="text-xs font-medium text-emerald-600">In Progress</div>
				</div>
				<div class="rounded-xl bg-blue-50 p-4 text-center ring-1 ring-blue-100">
					<CheckCircle class="mx-auto size-6 text-blue-600" />
					<div class="mt-2 text-2xl font-bold text-blue-700">{completedProjects.length}</div>
					<div class="text-xs font-medium text-blue-600">Completed</div>
				</div>
				<div class="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
					<Clock class="mx-auto size-6 text-slate-600" />
					<div class="mt-2 text-2xl font-bold text-slate-700">{planningProjects.length}</div>
					<div class="text-xs font-medium text-slate-600">Planning</div>
				</div>
				<div class="rounded-xl bg-red-50 p-4 text-center ring-1 ring-red-100">
					<Pause class="mx-auto size-6 text-red-600" />
					<div class="mt-2 text-2xl font-bold text-red-700">{suspendedProjects.length}</div>
					<div class="text-xs font-medium text-red-600">Suspended</div>
				</div>
			</div>

			{#if relatedProjects.length > 0}
				<div class="mt-4 rounded-lg bg-slate-50 p-4">
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-600">Average Completion Rate</span>
						<span class="text-lg font-bold text-slate-900">{avgCompletion.toFixed(0)}%</span>
					</div>
					<Progress value={avgCompletion} class="mt-2 h-2" />
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Projects List -->
	{#if relatedProjects.length > 0}
		<Card.Root class="gap-0 py-0 shadow-sm">
			<Card.Header class="border-b bg-slate-50/50 py-6">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-100 p-1.5">
							<FolderKanban class="size-4 text-blue-600" />
						</div>
						<Card.Title class="text-lg">All Related Projects</Card.Title>
					</div>
					<Badge variant="outline" class="bg-blue-50 text-blue-700">
						{relatedProjects.length} Projects
					</Badge>
				</div>
			</Card.Header>
			<Card.Content class="p-0">
				<div class="divide-y divide-slate-100">
					{#each relatedProjects as project}
						{@const statusConfig = getStatusConfig(project.status)}
						{@const StatusIcon = getStatusIcon(project.status)}
						<div class="group p-4 transition-colors hover:bg-slate-50/50 sm:p-5">
							<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<!-- Project Info -->
								<div class="flex-1 space-y-2">
									<div class="flex flex-wrap items-center gap-2">
										<Badge
											variant="outline"
											class="text-xs {statusConfig.bgColor} {statusConfig.textColor}"
										>
											<StatusIcon class="mr-1 size-3" />
											{statusConfig.label}
										</Badge>
										<Badge variant="secondary" class="text-xs">
											{project.category}
										</Badge>
										<span class="text-xs text-slate-400">Year {project.project_year}</span>
									</div>
									<h4 class="font-semibold text-slate-900 group-hover:text-blue-600">
										{project.title}
									</h4>
									<p class="line-clamp-2 text-sm text-slate-500">
										{project.description}
									</p>
								</div>

								<!-- Progress & Budget -->
								<div class="flex flex-col gap-2 sm:items-end sm:text-right">
									<div class="text-lg font-bold text-slate-900">
										{formatCurrency(project.budget)}
									</div>
									<div class="flex items-center gap-2">
										<div class="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
											<div
												class="h-full rounded-full bg-blue-500 transition-all"
												style="width: {project.completion_percentage}%"
											></div>
										</div>
										<span class="text-sm font-medium text-slate-700">
											{project.completion_percentage}%
										</span>
									</div>
									<div class="flex items-center gap-1 text-xs text-slate-500">
										<Calendar class="size-3" />
										{formatDate(project.start_date)} - {formatDate(project.end_date)}
									</div>
								</div>
							</div>

							<!-- Action Button -->
							<div class="mt-3 flex justify-end">
								<Button
									variant="outline"
									size="sm"
									class="gap-1"
									href={isAdminView ? `/admin/projects/${project.id}` : `/projects/${project.id}`}
								>
									View Details
									<ArrowUpRight class="size-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root class="shadow-sm">
			<Card.Content class="py-12">
				<div class="flex flex-col items-center justify-center text-center">
					<FolderKanban class="size-16 text-slate-200" />
					<h3 class="mt-4 text-lg font-semibold text-slate-900">No Projects Yet</h3>
					<p class="mt-2 max-w-sm text-sm text-slate-500">
						There are currently no development projects linked to this sitio.
					</p>
					{#if isAdminView}
						<Button class="mt-4" href="/admin/projects/new">Create New Project</Button>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
