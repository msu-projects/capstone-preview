<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { Sitio } from '$lib/types';
	import { projects } from '$lib/mock-data';
	import { FolderKanban, DollarSign, Users, TrendingUp, ExternalLink } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

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

	function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'planning':
				return 'secondary';
			case 'suspended':
				return 'destructive';
			default:
				return 'default';
		}
	}

	function getStatusLabel(status: string): string {
		switch (status) {
			case 'in-progress':
				return 'In Progress';
			case 'planning':
				return 'Planning';
			case 'completed':
				return 'Completed';
			case 'suspended':
				return 'Suspended';
			default:
				return status;
		}
	}

	// Fetch related projects
	const relatedProjects = $derived(
		projects.filter((p) => {
			// Check legacy sitio_id field
			if (p.sitio_id === sitio.id) return true;
			// Check new project_sitios array
			if (p.project_sitios && p.project_sitios.some((ps) => ps.sitio_id === sitio.id))
				return true;
			return false;
		})
	);

	const totalBudget = $derived(relatedProjects.reduce((sum, p) => sum + p.budget, 0));
	const activeProjects = $derived(relatedProjects.filter((p) => p.status === 'in-progress').length);
	const completedProjects = $derived(relatedProjects.filter((p) => p.status === 'completed').length);

	// Calculate total beneficiaries targeted for this sitio
	const beneficiariesTargeted = $derived(
		relatedProjects.reduce((sum, p) => {
			const sitioTarget = p.project_sitios?.find((ps) => ps.sitio_id === sitio.id);
			return sum + (sitioTarget?.beneficiaries_target || p.beneficiaries || 0);
		}, 0)
	);
</script>

<!-- Related Projects Tab -->
<div class="space-y-6">
	<!-- Summary Cards -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-blue-50 p-2">
						<FolderKanban class="size-5 text-blue-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Total Projects</div>
						<div class="text-xl font-bold text-slate-900">{relatedProjects.length}</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-emerald-50 p-2">
						<TrendingUp class="size-5 text-emerald-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Active Projects</div>
						<div class="text-xl font-bold text-emerald-600">{activeProjects}</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-amber-50 p-2">
						<DollarSign class="size-5 text-amber-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Total Investment</div>
						<div class="text-lg font-bold text-slate-900">
							{formatCurrency(totalBudget)}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root class="py-0 shadow-sm">
			<Card.Content class="p-4">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-50 p-2">
						<Users class="size-5 text-purple-600" />
					</div>
					<div>
						<div class="text-xs font-medium text-slate-500">Beneficiaries</div>
						<div class="text-xl font-bold text-slate-900">
							{formatNumber(beneficiariesTargeted)}
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Projects Table -->
	{#if relatedProjects.length > 0}
		<Card.Root class="shadow-sm">
			<Card.Header>
				<h3 class="text-lg font-semibold text-slate-800">Project Details</h3>
			</Card.Header>
			<Card.Content class="p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Project Title</Table.Head>
							<Table.Head>Category</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Budget</Table.Head>
							<Table.Head class="text-right">Beneficiaries</Table.Head>
							<Table.Head class="text-right">Progress</Table.Head>
							<Table.Head class="text-center">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each relatedProjects as project}
							<Table.Row class="hover:bg-slate-50/50">
								<Table.Cell class="font-medium">
									<div class="max-w-md">
										<div class="text-sm font-semibold text-slate-900">{project.title}</div>
										<div class="text-xs text-slate-500">Year: {project.project_year}</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline" class="bg-blue-50 text-blue-700">
										{project.category}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge variant={getStatusVariant(project.status)}>
										{getStatusLabel(project.status)}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right font-medium">
									{formatCurrency(project.budget)}
								</Table.Cell>
								<Table.Cell class="text-right">
									{formatNumber(project.beneficiaries)}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex items-center justify-end gap-2">
										<span class="text-sm font-semibold text-slate-900">
											{project.completion_percentage}%
										</span>
										<div class="h-2 w-16 rounded-full bg-slate-200">
											<div
												class="h-2 rounded-full bg-blue-600 transition-all"
												style="width: {project.completion_percentage}%"
											></div>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell class="text-center">
									<Button variant="ghost" size="sm" href="/admin/projects/{project.id}">
										<ExternalLink class="size-4" />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Empty State -->
		<Card.Root class="shadow-sm">
			<Card.Content class="py-12 text-center">
				<div class="mx-auto w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
					<FolderKanban class="size-12 text-slate-400" />
				</div>
				<h3 class="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h3>
				<p class="text-slate-500 mb-4">
					This sitio doesn't have any projects assigned yet.
				</p>
				<Button variant="outline" href="/admin/projects">
					Browse All Projects
				</Button>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
