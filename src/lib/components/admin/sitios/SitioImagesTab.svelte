<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { deleteImage, getImage, saveImage } from '$lib/utils/image-storage';
	import { AlertCircle, Image, Plus, Upload, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	interface SitioImage {
		id: string;
		caption?: string;
		uploaded_at: string;
		preview?: string;
	}

	let {
		images = $bindable<
			Array<{
				id: string;
				caption?: string;
				uploaded_at: string;
			}>
		>([])
	} = $props();

	let imagesList = $state<SitioImage[]>([...images]);

	let fileInput: HTMLInputElement;
	let isUploading = $state(false);

	onMount(async () => {
		// Load preview URLs for existing images
		for (const img of imagesList) {
			if (!img.preview) {
				const blob = await getImage(img.id);
				if (blob) {
					img.preview = URL.createObjectURL(blob);
				}
			}
		}
	});

	async function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;

		if (!files || files.length === 0) return;

		isUploading = true;

		try {
			for (const file of Array.from(files)) {
				// Validate file type
				if (!file.type.startsWith('image/')) {
					toast.error(`${file.name} is not a valid image file`);
					continue;
				}

				// Validate file size (max 5MB)
				const maxSize = 5 * 1024 * 1024;
				if (file.size > maxSize) {
					toast.error(`${file.name} exceeds 5MB size limit`);
					continue;
				}

				// Generate unique ID
				const imageId = `sitio-img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

				// Save to IndexedDB
				await saveImage(file, imageId);

				// Create preview URL
				const preview = URL.createObjectURL(file);

				// Add to list
				imagesList.push({
					id: imageId,
					caption: '',
					uploaded_at: new Date().toISOString(),
					preview
				});

				toast.success(`${file.name} uploaded successfully`);
			}
		} catch (error) {
			toast.error('Failed to upload image(s)');
			console.error('Upload error:', error);
		} finally {
			isUploading = false;
			// Reset file input
			if (fileInput) {
				fileInput.value = '';
			}
		}
	}

	async function removeImage(imageId: string) {
		try {
			// Delete from IndexedDB
			await deleteImage(imageId);

			// Remove from list
			const index = imagesList.findIndex((img) => img.id === imageId);
			if (index >= 0) {
				// Revoke preview URL
				if (imagesList[index].preview) {
					URL.revokeObjectURL(imagesList[index].preview!);
				}
				imagesList.splice(index, 1);
			}

			toast.success('Image removed');
		} catch (error) {
			toast.error('Failed to remove image');
			console.error('Delete error:', error);
		}
	}

	function updateCaption(imageId: string, caption: string) {
		const image = imagesList.find((img) => img.id === imageId);
		if (image) {
			image.caption = caption;
		}
	}

	// Sync back to parent binding
	$effect(() => {
		images = imagesList.map((img) => ({
			id: img.id,
			caption: img.caption,
			uploaded_at: img.uploaded_at
		}));
	});
</script>

<Card.Card>
	<Card.CardHeader>
		<Card.CardTitle>Sitio Photos & Images</Card.CardTitle>
		<Card.CardDescription>
			Add photos of the sitio community for documentation and reference
		</Card.CardDescription>
	</Card.CardHeader>
	<Card.CardContent class="space-y-6">
		<!-- Upload Section -->
		<div class="space-y-4">
			<div class="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
				<input
					bind:this={fileInput}
					type="file"
					multiple
					accept="image/*"
					class="hidden"
					onchange={handleFileSelect}
					disabled={isUploading}
				/>
				<Upload class="mx-auto mb-2 size-8 text-muted-foreground" />
				<p class="mb-2 text-sm font-medium">Drag and drop images or click to select</p>
				<p class="mb-4 text-xs text-muted-foreground">
					JPG, PNG, WebP up to 5MB each. Multiple files supported.
				</p>
				<Button
					variant="outline"
					size="sm"
					onclick={() => fileInput?.click()}
					disabled={isUploading}
					class="gap-2"
				>
					<Plus class="size-4" />
					{isUploading ? 'Uploading...' : 'Select Images'}
				</Button>
			</div>
		</div>

		<!-- Images Grid -->
		{#if imagesList.length > 0}
			<div class="space-y-4">
				<div class="text-sm font-medium">
					Uploaded Images ({imagesList.length})
				</div>

				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each imagesList as image (image.id)}
						<div class="group rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
							<!-- Image Preview -->
							<div class="relative mb-3 aspect-video overflow-hidden rounded bg-muted">
								{#if image.preview}
									<img
										src={image.preview}
										alt={image.caption || 'Sitio image'}
										class="h-full w-full object-cover"
									/>
								{:else}
									<div class="flex h-full items-center justify-center">
										<Image class="size-8 text-muted-foreground/50" />
									</div>
								{/if}

								<!-- Delete Button -->
								<button
									type="button"
									onclick={() => removeImage(image.id)}
									class="absolute top-1 right-1 rounded bg-destructive/90 p-1 opacity-0 transition-opacity group-hover:opacity-100"
									title="Remove image"
								>
									<X class="text-destructive-foreground size-4" />
								</button>
							</div>

							<!-- Caption -->
							<div class="space-y-2">
								<Label class="text-xs">Caption (optional)</Label>
								<Textarea
									placeholder="Add a description or caption for this image..."
									value={image.caption || ''}
									onchange={(e) => updateCaption(image.id, (e.target as HTMLTextAreaElement).value)}
									class="min-h-16 resize-none text-xs"
								/>
							</div>

							<!-- Upload Date -->
							<p class="mt-2 text-xs text-muted-foreground">
								{new Date(image.uploaded_at).toLocaleDateString()}
							</p>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
				<AlertCircle class="mx-auto mb-2 size-8 text-muted-foreground/50" />
				<p class="text-sm text-muted-foreground">No images uploaded yet</p>
				<p class="text-xs text-muted-foreground/75">
					Upload images to document the sitio community
				</p>
			</div>
		{/if}
	</Card.CardContent>
</Card.Card>
