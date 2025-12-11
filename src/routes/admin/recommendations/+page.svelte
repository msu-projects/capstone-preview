<script lang="ts">
	import AppBreadcrumb from '$lib/components/AppBreadcrumb.svelte';
	import SitioRecommendations from '$lib/components/public/SitioRecommendations.svelte';
</script>

<!-- Breadcrumb -->
<AppBreadcrumb
	items={[{ label: 'Sitios Dashboard', href: '/admin/sitios' }, { label: 'Recommendations' }]}
	isAdminView
/>

<div class="container mx-auto p-6">
	<SitioRecommendations isAdminView />
</div>
