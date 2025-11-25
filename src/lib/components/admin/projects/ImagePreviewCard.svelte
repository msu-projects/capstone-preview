<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { PhotoDocumentation } from '$lib/types';
	import { formatFileSize } from '$lib/utils/image-utils';
	import { FileImage, X } from '@lucide/svelte';

	interface Props {
		photo: PhotoDocumentation;
		thumbnailUrl?: string;
		onDelete: () => void;
		onCaptionChange: (caption: string) => void;
		onViewFullSize: () => void;
	}

	let { photo, thumbnailUrl, onDelete, onCaptionChange, onViewFullSize }: Props = $props();

	let isEditingCaption = $state(false);
	let captionValue = $state(photo.caption || '');

	function handleCaptionSave() {
		onCaptionChange(captionValue);
		isEditingCaption = false;
	}

	function handleCaptionCancel() {
		captionValue = photo.caption || '';
		isEditingCaption = false;
	}
</script>

<Card.Root class="group relative overflow-hidden py-0">
	<!-- Delete Button -->
	<Button
		variant="destructive"
		size="icon"
		class="absolute top-2 right-2 z-10 size-8 opacity-0 transition-opacity group-hover:opacity-100"
		onclick={onDelete}
	>
		<X class="size-4" />
	</Button>

	<Card.Content class="p-3">
		<!-- Image Preview -->
		<button
			type="button"
			onclick={onViewFullSize}
			class="relative mb-3 block aspect-square w-full overflow-hidden rounded-md bg-muted"
		>
			{#if thumbnailUrl}
				<img
					src={thumbnailUrl}
					alt={photo.filename}
					class="size-full object-cover transition-transform hover:scale-105"
				/>
			{:else}
				<div class="flex size-full items-center justify-center">
					<FileImage class="size-12 text-muted-foreground" />
				</div>
			{/if}
		</button>

		<!-- File Info -->
		<div class="mb-2 flex flex-wrap items-center gap-1.5">
			<Badge variant="outline" class="text-xs">
				{formatFileSize(photo.file_size)}
			</Badge>
			<Badge variant="outline" class="text-xs">
				{photo.width}×{photo.height}
			</Badge>
		</div>

		<!-- Filename -->
		<p class="mb-2 truncate text-xs font-medium text-foreground" title={photo.filename}>
			{photo.filename}
		</p>

		<!-- Caption -->
		{#if isEditingCaption}
			<div class="space-y-2">
				<Textarea
					bind:value={captionValue}
					placeholder="Add a caption..."
					rows={2}
					class="text-xs"
				/>
				<div class="flex justify-end gap-1">
					<Button size="sm" variant="outline" onclick={handleCaptionCancel} class="h-7 text-xs">
						<X class="mr-1 size-3" />
						Cancel
					</Button>
					<Button size="sm" onclick={handleCaptionSave} class="h-7 text-xs">Save</Button>
				</div>
			</div>
		{:else}
			<button
				type="button"
				onclick={() => (isEditingCaption = true)}
				class="w-full rounded border border-dashed border-border p-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50"
			>
				{#if photo.caption}
					<p class="line-clamp-2">{photo.caption}</p>
				{:else}
					<p class="italic">Click to add caption...</p>
				{/if}
			</button>
		{/if}
	</Card.Content>
</Card.Root>
