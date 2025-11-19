<script lang="ts">
	import AdminSidebar from '$lib/components/layout/AdminSidebar.svelte';

	let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden">
	<AdminSidebar />
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>
</div>
