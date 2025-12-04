<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download, Plus } from '@lucide/svelte';

	interface Props {
		onExport: () => void;
	}

	let { onExport }: Props = $props();
</script>

<header class="border-b bg-card">
	<div class="flex items-center justify-between p-6">
		<div>
			<h1 class="text-3xl font-bold">Project Management</h1>
			<p class="text-muted-foreground">Manage and monitor all projects</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={onExport}>
				<Download class="mr-2" />
				Export
			</Button>
			<Button size="sm" href="/admin/projects/new">
				<Plus class="mr-2" />
				New Project
			</Button>
		</div>
	</div>
</header>
