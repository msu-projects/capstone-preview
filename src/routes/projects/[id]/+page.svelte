<script lang="ts">
	import ProjectDetailView from '$lib/components/projects/ProjectDetailView.svelte';
	import { Button } from '$lib/components/ui/button';
	import { projects } from '$lib/mock-data';
	import { ArrowLeft } from '@lucide/svelte';

	// Get project ID from URL
	const { data } = $props<{ data: { id: string } }>();
	const projectId = parseInt(data?.id || '0');
	const project = $derived(projects.find((p) => p.id === projectId));
</script>

<svelte:head>
	<title>{project ? project.title : 'Project Details'} - South Cotabato Data Bank</title>
</svelte:head>

{#if !project}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="mb-4 text-3xl font-bold">Project Not Found</h1>
			<p class="mb-6 text-muted-foreground">The project you're looking for doesn't exist.</p>
			<Button href="/projects">
				<ArrowLeft class="mr-2" />
				Back to Projects
			</Button>
		</div>
	</div>
{:else}
	<ProjectDetailView {project} isAdminView={false} />
{/if}
