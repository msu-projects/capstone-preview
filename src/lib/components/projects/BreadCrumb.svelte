<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { Project } from '$lib/types';
	import { getCategoryName } from '$lib/utils/project-calculations';
	import { ChevronRight } from '@lucide/svelte';

	interface Props {
		project: Project;
		isAdminView?: boolean;
	}

	const { project, isAdminView = false }: Props = $props();
</script>

<!-- Breadcrumb Navigation -->
<div
	class="sticky top-0 z-10 border-b border-border bg-white/80 backdrop-blur-sm dark:bg-slate-900/80"
>
	<div class="w-full px-4 py-3 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between">
			<nav class="flex items-center gap-2 text-sm">
				{#if isAdminView}
					<Sidebar.Trigger class="-ml-1" />
				{/if}
				<Separator orientation="vertical" class="h-6" />
				<a
					href={isAdminView ? '/admin' : '/'}
					class="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
				>
					{isAdminView ? 'Admin' : 'Home'}
				</a>
				<ChevronRight class="size-4 text-slate-400" />
				<a
					href={isAdminView ? '/admin/projects' : '/projects'}
					class="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
				>
					Projects
				</a>
				<ChevronRight class="size-4 text-slate-400" />
				<span class="text-slate-500 dark:text-slate-400"
					>{getCategoryName(project.category_key)}</span
				>
				<ChevronRight class="size-4 text-slate-400" />
				<span class="font-medium text-slate-900 dark:text-slate-100">PROJ-{project.id}</span>
			</nav>
			{#if isAdminView}
				<div class="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						href="/admin/projects/{project.id}/edit"
						class="shadow-sm"
					>
						Edit Project
					</Button>
					<Button size="sm" class="shadow-sm shadow-blue-200">Generate Report</Button>
				</div>
			{/if}
		</div>
	</div>
</div>
