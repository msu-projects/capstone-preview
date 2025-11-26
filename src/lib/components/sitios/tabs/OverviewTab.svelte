<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import type { Sitio } from '$lib/types';
	import { projects } from '$lib/mock-data';
	import SitioMap from '../SitioMap.svelte';
	import {
		Users,
		Home,
		Vote,
		Heart,
		MapPin,
		Briefcase,
		TrendingUp,
		FolderKanban
	} from '@lucide/svelte';

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

	// Calculate PhilHealth and 4Ps coverage
	const philhealthCoverage = $derived(
		sitio.social_services && sitio.population > 0
			? (sitio.social_services.philhealth_beneficiaries / sitio.population) * 100
			: 0
	);

	const fourpsCoverage = $derived(
		sitio.social_services && sitio.households > 0
			? (sitio.social_services.fourps_beneficiaries / sitio.households) * 100
			: 0
	);

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

	const totalProjectBudget = $derived(relatedProjects.reduce((sum, p) => sum + p.budget, 0));
	const activeProjectsCount = $derived(
		relatedProjects.filter((p) => p.status === 'in-progress').length
	);
</script>

<!-- Overview Tab -->
<div class="space-y-6">
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Left Column -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Basic Information Card -->
			<Card.Root class="shadow-sm">
				<Card.Header>
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-blue-50 p-1.5">
							<MapPin class="size-4 text-blue-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Location Information</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<div class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Municipality
							</div>
							<div class="text-base text-slate-900">{sitio.municipality}</div>
						</div>
						<div>
							<div class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
								Barangay
							</div>
							<div class="text-base text-slate-900">{sitio.barangay}</div>
						</div>
						{#if sitio.province}
							<div>
								<div class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
									Province
								</div>
								<div class="text-base text-slate-900">{sitio.province}</div>
							</div>
						{/if}
						{#if sitio.coding}
							<div>
								<div class="mb-1 text-xs font-semibold tracking-wider text-slate-400 uppercase">
									Sitio Code
								</div>
								<div class="text-base text-slate-900">{sitio.coding.code}</div>
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Map Card -->
			<Card.Root class="shadow-sm">
				<Card.Header>
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-green-50 p-1.5">
							<MapPin class="size-4 text-green-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Location Map</h3>
					</div>
				</Card.Header>
				<Card.Content class="pt-0">
					<SitioMap
						latitude={sitio.coordinates.lat}
						longitude={sitio.coordinates.lng}
						sitioName={sitio.name}
						height="350px"
					/>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right Column -->
		<div class="space-y-6">
			<!-- Social Services Coverage Card -->
			<Card.Root class="shadow-sm">
				<Card.Header>
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-emerald-50 p-1.5">
							<Heart class="size-4 text-emerald-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Social Services</h3>
					</div>
				</Card.Header>
				<Card.Content class="space-y-4 pt-0">
					{#if sitio.social_services}
						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="text-slate-600">PhilHealth Coverage</span>
								<span class="font-semibold text-slate-900">{philhealthCoverage.toFixed(1)}%</span>
							</div>
							<Progress value={philhealthCoverage} class="h-2" />
							<div class="mt-1 text-xs text-slate-500">
								{formatNumber(sitio.social_services.philhealth_beneficiaries)} of {formatNumber(
									sitio.population
								)} covered
							</div>
						</div>

						<div>
							<div class="mb-2 flex justify-between text-sm">
								<span class="text-slate-600">4Ps Coverage</span>
								<span class="font-semibold text-slate-900">{fourpsCoverage.toFixed(1)}%</span>
							</div>
							<Progress value={fourpsCoverage} class="h-2" />
							<div class="mt-1 text-xs text-slate-500">
								{formatNumber(sitio.social_services.fourps_beneficiaries)} of {formatNumber(
									sitio.households
								)} households
							</div>
						</div>

						<div>
							<div class="text-sm text-slate-600">Registered Voters</div>
							<div class="text-2xl font-bold text-slate-900">
								{formatNumber(sitio.social_services.registered_voters)}
							</div>
						</div>
					{:else}
						<p class="text-sm text-slate-500">No social services data available</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Projects Summary Card -->
			<Card.Root class="shadow-sm">
				<Card.Header>
					<div class="flex items-center gap-2">
						<div class="rounded-lg bg-purple-50 p-1.5">
							<FolderKanban class="size-4 text-purple-600" />
						</div>
						<h3 class="text-lg font-semibold text-slate-800">Projects Summary</h3>
					</div>
				</Card.Header>
				<Card.Content class="space-y-3 pt-0">
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-600">Total Projects</span>
						<span class="text-2xl font-bold text-slate-900">{relatedProjects.length}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-600">Active Projects</span>
						<span class="text-lg font-semibold text-emerald-600">{activeProjectsCount}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-sm text-slate-600">Total Investment</span>
						<span class="text-base font-bold text-slate-900">
							{formatCurrency(totalProjectBudget)}
						</span>
					</div>
					{#if relatedProjects.length > 0}
						<div class="pt-2">
							<a
								href="#projects"
								class="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
								onclick={(e) => {
									e.preventDefault();
									window.dispatchEvent(new CustomEvent('tab-change', { detail: 'projects' }));
								}}
							>
								View All Projects →
							</a>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
