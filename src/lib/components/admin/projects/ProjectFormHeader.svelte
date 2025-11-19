<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Project } from '$lib/types';
	import { ArrowLeft, LoaderCircle, Save, X } from '@lucide/svelte';

	interface Props {
		isNewProject: boolean;
		existingProject: Project | null;
		canSave: boolean;
		isSaving: boolean;
		onSave: () => void;
		onCancel: () => void;
	}

	let { isNewProject, existingProject, canSave, isSaving, onSave, onCancel }: Props = $props();
</script>

<header class="sticky top-0 z-10 border-b bg-card shadow-sm">
	<div class="flex items-center justify-between p-4">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" onclick={onCancel}>
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">
					{isNewProject ? 'Create New Project' : 'Edit Project'}
				</h1>
				{#if !isNewProject && existingProject}
					<p class="text-sm text-muted-foreground">{existingProject.title}</p>
				{/if}
			</div>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" onclick={onCancel} disabled={isSaving}>
				<X class="mr-2 size-4" />
				Cancel
			</Button>
			<Button onclick={onSave} disabled={!canSave || isSaving}>
				{#if isSaving}
					<LoaderCircle class="mr-2 size-4 animate-spin" />
					Saving...
				{:else}
					<Save class="mr-2 size-4" />
					{isNewProject ? 'Create Project' : 'Save Changes'}
				{/if}
			</Button>
		</div>
	</div>
</header>
