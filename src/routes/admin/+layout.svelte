<script lang="ts">
	import AppSidebar from '$lib/components/admin/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<!-- <header
			class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
			</div>
		</header> -->
		<main class="flex flex-1 flex-col gap-4 pt-0">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
