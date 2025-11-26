<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { Sitio } from '$lib/types';
	import { ArrowLeft, Download } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		isAdminView?: boolean;
	}

	const { sitio, isAdminView = false }: Props = $props();

	function handleDownloadPDF() {
		alert('PDF download feature coming soon!');
	}
</script>

<!-- Top Navigation / Breadcrumb Area -->
<div class="sticky top-0 z-10 border-b border-slate-200 bg-white">
	<div class="w-full px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center gap-4">
			<Button
				variant="ghost"
				size="icon"
				class="-ml-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
				href={isAdminView ? '/admin/sitios' : '/sitios'}
			>
				<ArrowLeft class="size-5" />
			</Button>
			<div class="flex flex-col">
				<div class="flex items-center gap-2 text-sm text-slate-500">
					<span>Sitios</span>
					<span class="text-slate-300">/</span>
					<span>{sitio.municipality}</span>
					<span class="text-slate-300">/</span>
					<span class="font-medium text-slate-800">SITIO-{sitio.id}</span>
				</div>
			</div>
			<div class="ml-auto flex items-center gap-3">
				{#if isAdminView}
					<Button
						variant="outline"
						size="sm"
						href="/admin/sitios/{sitio.id}/edit"
						class="shadow-sm"
					>
						Edit Sitio
					</Button>
					<Button size="sm" class="shadow-sm shadow-blue-200" onclick={handleDownloadPDF}>
						<Download class="mr-2 size-4" />
						Download PDF
					</Button>
				{/if}
			</div>
		</div>
	</div>
</div>
