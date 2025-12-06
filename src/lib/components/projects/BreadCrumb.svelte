<script lang="ts">
	import AppBreadcrumb, { type BreadcrumbItem } from '$lib/components/AppBreadcrumb.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { getCategoryName } from '$lib/utils/project-calculations';

	interface Props {
		project: Project;
		isAdminView?: boolean;
	}

	const { project, isAdminView = false }: Props = $props();

	const breadcrumbItems: BreadcrumbItem[] = $derived([
		{ label: 'Projects', href: isAdminView ? '/admin/projects' : '/projects' },
		{
			label: getCategoryName(project.category_key),
			href: isAdminView
				? `/admin/projects?category=${project.category_key}`
				: `/projects?category=${project.category_key}`
		},
		{ label: `PROJ-${project.id}` }
	]);
</script>

<AppBreadcrumb items={breadcrumbItems} {isAdminView}>
	{#snippet actions()}
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
	{/snippet}
</AppBreadcrumb>
