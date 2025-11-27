<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { Project } from '$lib/types';
	import { ArrowLeft } from '@lucide/svelte';

	interface Props {
		project: Project;
		isAdminView?: boolean;
	}

	const { project, isAdminView = false }: Props = $props();
</script>

<!-- Top Navigation / Breadcrumb Area -->
<div class="sticky top-0 z-10 border-b border-slate-200 bg-white">
	<div class="w-full px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center gap-4">
			<Sidebar.Trigger class="-ml-1" />
			<Separator orientation="vertical" class="mr-2 h-6" />
			<Button
				variant="ghost"
				size="icon"
				class="-ml-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
				href={isAdminView ? '/admin/projects' : '/projects'}
			>
				<ArrowLeft class="size-5" />
			</Button>
			<div class="flex flex-col">
				<div class="flex items-center gap-2 text-sm text-slate-500">
					<span>Projects</span>
					<span class="text-slate-300">/</span>
					<span>{project.category}</span>
					<span class="text-slate-300">/</span>
					<span class="font-medium text-slate-800">PROJ-{project.id}</span>
				</div>
			</div>
			<div class="ml-auto flex items-center gap-3">
				{#if isAdminView}
					<Button
						variant="outline"
						size="sm"
						href="/admin/projects/{project.id}/edit"
						class="shadow-sm"
					>
						Edit Project
					</Button>
					<Button size="sm" class="shadow-sm shadow-blue-200">Generate Report</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
