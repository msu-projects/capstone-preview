<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { authStore } from '$lib/stores/auth.svelte';
	import { onMount } from 'svelte';
	import './layout.css';

	let { children } = $props();

	onMount(() => {
		authStore.initialize();
	});
</script>

<Tooltip.Provider delayDuration={300}>
	{@render children()}
</Tooltip.Provider>
<Toaster />
