<script lang="ts">
	import ImagePreviewCard from '$lib/components/admin/projects/ImagePreviewCard.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { PhotoDocumentation } from '$lib/types';
	import {
		compressImage,
		deleteImage,
		generateThumbnail,
		getImage,
		getStorageUsage,
		initImageDatabase,
		saveImage
	} from '$lib/utils/image-storage';
	import {
		createImagePreviewURL,
		formatFileSize,
		generateUniqueId,
		readImageDimensions,
		revokeImagePreviewURL,
		validateImageFile
	} from '$lib/utils/image-utils';
	import {
		AlertTriangle,
		ChevronLeft,
		ChevronRight,
		Download,
		Image as ImageIcon,
		Loader2,
		Upload,
		X
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { SvelteMap } from 'svelte/reactivity';

	interface Props {
		photoDocumentation?: PhotoDocumentation[];
		maxFileSize?: number;
		compressionQuality?: number;
		maxDimension?: number;
	}

	let {
		photoDocumentation = $bindable([]),
		maxFileSize = 5 * 1024 * 1024, // 5MB
		compressionQuality = 0.85,
		maxDimension = 1920
	}: Props = $props();

	let fileInput: HTMLInputElement | undefined = $state();
	let isDragging = $state(false);
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let thumbnailCache = new SvelteMap<string, string>();
	let fullSizeCache = new SvelteMap<string, string>();
	let deleteDialogOpen = $state(false);
	let photoToDelete: PhotoDocumentation | null = $state(null);
	let fullSizeDialogOpen = $state(false);
	let fullSizePhotoIndex = $state(0);
	let storageWarning = $state(false);

	onMount(async () => {
		// Initialize IndexedDB
		await initImageDatabase();

		// Check storage usage
		await checkStorageUsage();

		await loadThumbnails();
	});

	async function loadThumbnails() {
		for (const photo of photoDocumentation) {
			if (
				photo.storage_type === 'indexeddb' &&
				photo.thumbnail_id &&
				!thumbnailCache.has(photo.id)
			) {
				try {
					const blob = await getImage(photo.thumbnail_id);
					if (blob) {
						const url = createImagePreviewURL(blob);
						thumbnailCache.set(photo.id, url);
					}
				} catch (error) {
					console.error('Failed to load thumbnail:', error);
				}
			}
		}
	}

	async function checkStorageUsage() {
		try {
			const { percentUsed } = await getStorageUsage();
			storageWarning = percentUsed > 80;
		} catch (error) {
			console.warn('Could not check storage usage:', error);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = Array.from(e.dataTransfer?.files || []);
		handleFiles(files);
	}

	function handleFileInput(e: Event) {
		const files = Array.from((e.target as HTMLInputElement).files || []);
		handleFiles(files);
	}

	async function handleFiles(files: File[]) {
		if (files.length === 0) return;

		isUploading = true;
		uploadProgress = 0;

		const totalFiles = files.length;
		let processedFiles = 0;

		for (const file of files) {
			try {
				await processFile(file);
				processedFiles++;
				uploadProgress = (processedFiles / totalFiles) * 100;
			} catch (error) {
				console.error('Failed to process file:', error);
				toast.error(`Failed to upload ${file.name}: ${(error as Error).message}`);
			}
		}

		isUploading = false;
		uploadProgress = 0;

		// Clear file input
		if (fileInput) {
			fileInput.value = '';
		}

		// Check storage after upload
		await checkStorageUsage();

		toast.success(
			`Successfully uploaded ${processedFiles} photo${processedFiles !== 1 ? 's' : ''}`
		);
	}

	async function processFile(file: File) {
		// Validate file
		const validation = validateImageFile(file, maxFileSize);
		if (!validation.valid) {
			throw new Error(validation.error);
		}

		// Generate unique ID
		const id = generateUniqueId();
		const thumbnailId = `thumb-${id}`;
		const photoId = `photo-${id}`;

		// Read dimensions
		const { width, height } = await readImageDimensions(file);

		// Compress image
		const compressedBlob = await compressImage(file, {
			maxDimension,
			quality: compressionQuality
		});

		// Generate thumbnail
		const thumbnailBlob = await generateThumbnail(file, 200);

		// Save to IndexedDB
		await saveImage(compressedBlob, photoId);
		await saveImage(thumbnailBlob, thumbnailId);

		// Create thumbnail preview URL
		const thumbnailUrl = createImagePreviewURL(thumbnailBlob);
		thumbnailCache.set(id, thumbnailUrl);

		// Create photo documentation entry
		const photoDoc: PhotoDocumentation = {
			id,
			filename: file.name,
			file_size: compressedBlob.size,
			mime_type: file.type,
			width,
			height,
			thumbnail_id: thumbnailId,
			uploaded_at: new Date().toISOString(),
			storage_type: 'indexeddb',
			storage_ref: photoId
		};

		// Add to array
		photoDocumentation = [...photoDocumentation, photoDoc];
	}

	async function handleDelete(photo: PhotoDocumentation) {
		photoToDelete = photo;
		deleteDialogOpen = true;
	}

	async function confirmDelete() {
		if (!photoToDelete) return;

		const photoId = photoToDelete.id;

		try {
			// Delete from IndexedDB
			await deleteImage(photoToDelete.storage_ref.replace('photo-', ''));
			if (photoToDelete.thumbnail_id) {
				await deleteImage(photoToDelete.thumbnail_id.replace('thumb-', ''));
			}

			// Revoke preview URLs
			const thumbnailUrl = thumbnailCache.get(photoId);
			if (thumbnailUrl) {
				revokeImagePreviewURL(thumbnailUrl);
				thumbnailCache.delete(photoId);
			}

			const fullSizeUrl = fullSizeCache.get(photoId);
			if (fullSizeUrl) {
				revokeImagePreviewURL(fullSizeUrl);
				fullSizeCache.delete(photoId);
			}

			// Remove from array
			photoDocumentation = photoDocumentation.filter((p) => p.id !== photoId);

			toast.success('Photo deleted successfully');
			deleteDialogOpen = false;
			photoToDelete = null;

			// Recheck storage
			await checkStorageUsage();
		} catch (error) {
			console.error('Failed to delete photo:', error);
			toast.error('Failed to delete photo');
		}
	}

	function handleCaptionChange(photo: PhotoDocumentation, caption: string) {
		photoDocumentation = photoDocumentation.map((p) => (p.id === photo.id ? { ...p, caption } : p));
	}

	async function handleViewFullSize(index: number) {
		fullSizePhotoIndex = index;
		fullSizeDialogOpen = true;

		// Load full-size image if not already cached
		const photo = photoDocumentation[index];
		if (!fullSizeCache.has(photo.id) && photo.storage_type === 'indexeddb') {
			try {
				const blob = await getImage(photo.storage_ref.replace('photo-', ''));
				if (blob) {
					const url = createImagePreviewURL(blob);
					fullSizeCache.set(photo.id, url);
				}
			} catch (error) {
				console.error('Failed to load full-size image:', error);
				toast.error('Failed to load image');
			}
		}
	}

	function navigateFullSize(direction: 'prev' | 'next') {
		if (direction === 'prev') {
			fullSizePhotoIndex =
				(fullSizePhotoIndex - 1 + photoDocumentation.length) % photoDocumentation.length;
		} else {
			fullSizePhotoIndex = (fullSizePhotoIndex + 1) % photoDocumentation.length;
		}
	}

	async function downloadCurrentPhoto() {
		const photo = photoDocumentation[fullSizePhotoIndex];
		try {
			const blob = await getImage(photo.storage_ref.replace('photo-', ''));
			if (blob) {
				const url = createImagePreviewURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = photo.filename;
				a.click();
				revokeImagePreviewURL(url);
			}
		} catch (error) {
			console.error('Failed to download photo:', error);
			toast.error('Failed to download photo');
		}
	}

	let currentFullSizePhoto = $derived(photoDocumentation[fullSizePhotoIndex]);
	let currentFullSizeUrl = $derived(
		currentFullSizePhoto ? fullSizeCache.get(currentFullSizePhoto.id) : undefined
	);
</script>

<div class="space-y-4">
	<!-- Storage Warning -->
	{#if storageWarning}
		<div class="flex items-start gap-2 rounded-lg border border-warning bg-warning/10 p-3">
			<AlertTriangle class="mt-0.5 size-4 text-warning" />
			<div class="flex-1 text-xs text-warning">
				<strong>Storage Warning:</strong> You're using over 80% of available storage. Consider deleting
				unused photos or migrating to server storage.
			</div>
		</div>
	{/if}

	<!-- Upload Area -->
	{#if !isUploading}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="rounded-lg border-2 border-dashed p-8 text-center transition-colors {isDragging
				? 'border-primary bg-primary/5'
				: 'border-border'}"
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
		>
			<Upload class="mx-auto mb-3 size-12 text-muted-foreground" />
			<h3 class="mb-1 text-sm font-semibold">Upload Photos</h3>
			<p class="mb-3 text-xs text-muted-foreground">
				Drag and drop photos here, or click to select files
			</p>
			<p class="mb-4 text-xs text-muted-foreground">
				Supports JPG, PNG, WebP · Max {formatFileSize(maxFileSize)} per file
			</p>
			<Button type="button" onclick={() => fileInput?.click()} class="gap-2">
				<ImageIcon class="size-4" />
				Select Photos
			</Button>

			<input
				type="file"
				accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
				multiple
				bind:this={fileInput}
				onchange={handleFileInput}
				class="hidden"
			/>
		</div>
	{:else}
		<!-- Upload Progress -->
		<div class="rounded-lg border border-border bg-muted/30 p-8 text-center">
			<Loader2 class="mx-auto mb-3 size-12 animate-spin text-primary" />
			<p class="mb-2 text-sm font-semibold">Uploading photos...</p>
			<div class="mx-auto h-2 w-64 overflow-hidden rounded-full bg-muted">
				<div class="h-full bg-primary transition-all" style="width: {uploadProgress}%"></div>
			</div>
			<p class="mt-2 text-xs text-muted-foreground">{Math.round(uploadProgress)}%</p>
		</div>
	{/if}

	<!-- Photo Gallery -->
	{#if photoDocumentation.length > 0}
		<div>
			<h3 class="mb-3 text-sm font-semibold">
				Uploaded Photos ({photoDocumentation.length})
			</h3>
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each photoDocumentation as photo, index (photo.id)}
					<ImagePreviewCard
						{photo}
						thumbnailUrl={thumbnailCache.get(photo.id)}
						onDelete={() => handleDelete(photo)}
						onCaptionChange={(caption) => handleCaptionChange(photo, caption)}
						onViewFullSize={() => handleViewFullSize(index)}
					/>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete Photo</AlertDialog.Title>
			<AlertDialog.Description>
				Are you sure you want to delete "{photoToDelete?.filename}"? This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDelete} class="bg-destructive hover:bg-destructive/90">
				Delete
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<!-- Full-Size Image Dialog -->
<Dialog.Root bind:open={fullSizeDialogOpen}>
	<Dialog.Content class="max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>{currentFullSizePhoto?.filename || 'Image'}</Dialog.Title>
		</Dialog.Header>

		<div class="relative">
			<!-- Image -->
			<div
				class="flex items-center justify-center rounded-lg bg-muted/30"
				style="min-height: 400px;"
			>
				{#if currentFullSizeUrl}
					<img
						src={currentFullSizeUrl}
						alt={currentFullSizePhoto?.filename}
						class="max-h-[600px] w-auto rounded-lg"
					/>
				{:else}
					<Loader2 class="size-12 animate-spin text-muted-foreground" />
				{/if}
			</div>

			<!-- Navigation -->
			{#if photoDocumentation.length > 1}
				<Button
					variant="outline"
					size="icon"
					class="absolute top-1/2 left-2 -translate-y-1/2"
					onclick={() => navigateFullSize('prev')}
				>
					<ChevronLeft class="size-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					class="absolute top-1/2 right-2 -translate-y-1/2"
					onclick={() => navigateFullSize('next')}
				>
					<ChevronRight class="size-4" />
				</Button>
			{/if}
		</div>

		<!-- Info and Actions -->
		{#if currentFullSizePhoto}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<div class="flex gap-2 text-xs text-muted-foreground">
						<span>{formatFileSize(currentFullSizePhoto.file_size)}</span>
						<span>·</span>
						<span>{currentFullSizePhoto.width}×{currentFullSizePhoto.height}</span>
						<span>·</span>
						<span>{fullSizePhotoIndex + 1} of {photoDocumentation.length}</span>
					</div>
					<Button size="sm" variant="outline" onclick={downloadCurrentPhoto} class="gap-2">
						<Download class="size-4" />
						Download
					</Button>
				</div>

				{#if currentFullSizePhoto.caption}
					<div class="rounded-lg border border-border bg-muted/30 p-3">
						<p class="text-sm">{currentFullSizePhoto.caption}</p>
					</div>
				{/if}
			</div>
		{/if}

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (fullSizeDialogOpen = false)}>
				<X class="mr-2 size-4" />
				Close
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
