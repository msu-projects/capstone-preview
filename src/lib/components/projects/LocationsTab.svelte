<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import type { Project } from '$lib/types';
	import { MapPin, Users } from '@lucide/svelte';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();

	let totalBeneficiaries = $derived(
		project.project_sitios?.reduce((sum, sitio) => sum + (sitio.beneficiaries_target || 0), 0) || 0
	);
</script>

<!-- Locations Tab -->
<Card.Root class="overflow-hidden py-0 shadow-sm">
	<div class="flex items-center justify-between border-b border-slate-100 p-6">
		<div class="flex items-center gap-2">
			<div class="rounded-lg bg-blue-50 p-1.5">
				<MapPin class="size-4 text-blue-600" />
			</div>
			<h3 class="text-lg font-semibold text-slate-800">Involved Sitios & Beneficiaries</h3>
		</div>
		<div class="flex gap-2">
			<Badge variant="outline" class="bg-blue-50 text-blue-700">
				{project.project_sitios?.length || 0} Sitios
			</Badge>
			<Badge variant="outline" class="bg-emerald-50 text-emerald-700">
				<Users class="mr-1 size-3" />
				{totalBeneficiaries.toLocaleString()} Beneficiaries
			</Badge>
		</div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase">
				<tr>
					<th class="px-6 py-3 font-semibold">Sitio / Area</th>
					<th class="px-6 py-3 font-semibold">Location</th>
					<th class="px-6 py-3 text-center font-semibold">Beneficiaries</th>
					<th class="px-6 py-3 font-semibold">Focal Person</th>
					<th class="px-6 py-3 text-center font-semibold">Priority</th>
				</tr>
			</thead>
			<tbody>
				{#if project.project_sitios && project.project_sitios.length > 0}
					{#each project.project_sitios as sitio}
						<tr class="border-b border-slate-50 hover:bg-slate-50/50">
							<td class="px-6 py-4 font-medium text-slate-900">{sitio.sitio_name}</td>
							<td class="px-6 py-4 text-slate-600">
								<div class="flex flex-col">
									<span>{sitio.barangay}</span>
									<span class="text-xs text-slate-400">{sitio.municipality}</span>
								</div>
							</td>
							<td class="px-6 py-4 text-center">
								<span
									class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700"
								>
									<Users class="size-3" />
									{sitio.beneficiaries_target}
								</span>
							</td>
							<td class="px-6 py-4 text-slate-600">{sitio.focal_person || 'N/A'}</td>
							<td class="px-6 py-4 text-center">
								<Badge
									variant={sitio.priority_level === 'high' ? 'destructive' : 'outline'}
									class={sitio.priority_level === 'medium' ? 'bg-amber-100 text-amber-700' : ''}
								>
									{sitio.priority_level.charAt(0).toUpperCase() + sitio.priority_level.slice(1)}
								</Badge>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="5" class="px-6 py-4 text-center text-slate-500">
							No sitios specified for this project
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</Card.Root>
