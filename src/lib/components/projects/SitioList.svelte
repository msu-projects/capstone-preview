<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import type { ProjectSitio } from '$lib/types';
	import toTitleCase from '$lib/utils/common';

	interface Props {
		sitios: ProjectSitio[];
		maxVisible?: number;
	}

	let { sitios, maxVisible = 1 }: Props = $props();

	const visibleSitios = $derived(sitios.slice(0, maxVisible));
	const remainingSitios = $derived(sitios.slice(maxVisible));
	const hasMore = $derived(remainingSitios.length > 0);
</script>

{#if sitios.length === 0}
	<div class="text-sm text-muted-foreground">No locations</div>
{:else}
	<div class="flex flex-wrap items-center gap-1 text-sm">
		{#each visibleSitios as sitio, i (sitio.sitio_id)}
			<span>
				{toTitleCase(sitio.sitio_name)}{i < visibleSitios.length - 1 || hasMore ? ',' : ''}
			</span>
		{/each}
		{#if hasMore}
			<Tooltip.Provider delayDuration={100}>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<button {...props} class="font-medium text-gray-500 hover:underline">...more</button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content class="max-w-xs">
						<div class="space-y-1">
							<div class="text-xs font-semibold">All Sitios ({sitios.length}):</div>
							{#each sitios as s}
								<p class="text-xs">{toTitleCase(s.sitio_name)}</p>
							{/each}
							<!-- <div class="text-xs">
									{sitios.map((s) => s.sitio_name).join(', ')}
							</div> -->
						</div>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		{/if}
	</div>
{/if}
