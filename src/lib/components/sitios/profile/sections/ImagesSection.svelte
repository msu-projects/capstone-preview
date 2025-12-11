<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { getImage } from '$lib/utils/image-storage';
	import { AlertCircle, Image as ImageIcon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	interface Props {
		sitio: Sitio;
	}

	const { sitio }: Props = $props();

	let imagePreviews = $state<
		Array<{
			id: string;
			caption?: string;
			uploaded_at: string;
			url?: string;
		}>
	>([]);

	onMount(async () => {
		if (sitio.images && sitio.images.length > 0) {
			// Load image blobs and create object URLs
			for (const img of sitio.images) {
				const blob = await getImage(img.id);
				if (blob) {
					const url = URL.createObjectURL(blob);
					imagePreviews.push({
						...img,
						url
					});
				} else {
					// If blob not found, still add the image metadata
					imagePreviews.push(img);
				}
			}
		}
	});
</script>

<Card.Root>
	<Card.CardHeader>
		<Card.CardTitle>Photos & Documentation</Card.CardTitle>
		<Card.CardDescription>Community photos and images documenting this sitio</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent>
		{#if imagePreviews.length > 0}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each imagePreviews as image (image.id)}
					<div
						class="group overflow-hidden rounded-lg border bg-card transition-colors hover:bg-muted/50"
					>
						<!-- Image Preview -->
						<div class="relative aspect-video overflow-hidden rounded-t bg-muted">
							{#if image.url}
								<img
									src={image.url}
									alt={image.caption || 'Sitio image'}
									class="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
							{:else}
								<div class="flex h-full items-center justify-center bg-muted">
									<ImageIcon class="size-8 text-muted-foreground/50" />
								</div>
							{/if}
						</div>

						<!-- Caption and metadata -->
						<div class="space-y-2 p-3">
							{#if image.caption}
								<p class="text-sm font-medium text-foreground">
									{image.caption}
								</p>
							{/if}
							<p class="text-xs text-muted-foreground">
								{new Date(image.uploaded_at).toLocaleDateString()}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
				<AlertCircle class="mx-auto mb-2 size-8 text-muted-foreground/50" />
				<p class="text-sm text-muted-foreground">No images available</p>
				<p class="text-xs text-muted-foreground/75">
					Administrators can add images to this sitio profile
				</p>
			</div>
		{/if}
	</Card.CardContent>
</Card.Root>
