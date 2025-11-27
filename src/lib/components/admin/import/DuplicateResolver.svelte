<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { DuplicateSitio } from '$lib/types';
	import { AlertTriangle } from '@lucide/svelte';

	let { duplicates, onResolved } = $props<{
		duplicates: DuplicateSitio[];
		onResolved: (resolutions: Map<string, 'replace' | 'skip'>) => void;
	}>();

	let currentIndex = $state(0);
	let resolutions = $state(new Map<string, 'replace' | 'skip'>());

	const currentDuplicate = $derived(duplicates[currentIndex]);
	const isOpen = $derived(currentIndex < duplicates.length);

	function resolve(action: 'replace' | 'skip') {
		if (currentDuplicate) {
			resolutions.set(currentDuplicate.key, action);
		}

		if (currentIndex < duplicates.length - 1) {
			currentIndex++;
		} else {
			onResolved(resolutions);
		}
	}

	function skipAll() {
		duplicates.forEach((dup: DuplicateSitio) => {
			resolutions.set(dup.key, 'skip');
		});
		onResolved(resolutions);
	}

	function replaceAll() {
		duplicates.forEach((dup: DuplicateSitio) => {
			resolutions.set(dup.key, 'replace');
		});
		onResolved(resolutions);
	}
</script>

<Dialog.Root open={isOpen}>
	<Dialog.Content class="max-w-4xl">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<AlertTriangle class="size-5 text-yellow-600" />
				Duplicate Sitio Found ({currentIndex + 1} of {duplicates.length})
			</Dialog.Title>
			<Dialog.Description>
				A sitio with the same municipality, barangay, and name already exists. Choose whether to
				replace the existing data or keep it.
			</Dialog.Description>
		</Dialog.Header>

		{#if currentDuplicate}
			<div class="grid grid-cols-2 gap-4">
				<!-- Existing Data -->
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">Existing Data</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-2 text-sm">
						<div>
							<span class="font-medium">Location:</span>
							{currentDuplicate.existing.municipality}, {currentDuplicate.existing.barangay}
						</div>
						<div>
							<span class="font-medium">Sitio:</span>
							{currentDuplicate.existing.name}
						</div>
						<div>
							<span class="font-medium">Population:</span>
							{currentDuplicate.existing.population?.toLocaleString() || 'N/A'}
						</div>
						<div>
							<span class="font-medium">Households:</span>
							{currentDuplicate.existing.households?.toLocaleString() || 'N/A'}
						</div>
						<div class="text-xs text-muted-foreground">
							Last updated: {new Date(
								currentDuplicate.existing.updated_at || currentDuplicate.existing.created_at
							).toLocaleDateString()}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- New Data -->
				<Card.Root class="border-primary">
					<Card.Header>
						<Card.Title class="text-base">New Data</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-2 text-sm">
						<div>
							<span class="font-medium">Location:</span>
							{currentDuplicate.incoming.municipality}, {currentDuplicate.incoming.barangay}
						</div>
						<div>
							<span class="font-medium">Sitio:</span>
							{currentDuplicate.incoming.name}
						</div>
						<div>
							<span class="font-medium">Population:</span>
							{currentDuplicate.incoming.population?.toLocaleString() || 'N/A'}
						</div>
						<div>
							<span class="font-medium">Households:</span>
							{currentDuplicate.incoming.households?.toLocaleString() || 'N/A'}
						</div>
						<div class="text-xs text-muted-foreground">From import file</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}

		<Dialog.Footer class="flex justify-between sm:justify-between">
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={skipAll}>Skip All</Button>
				<Button variant="outline" size="sm" onclick={replaceAll}>Replace All</Button>
			</div>
			<div class="flex gap-2">
				<Button variant="secondary" onclick={() => resolve('skip')}>Keep Existing</Button>
				<Button onclick={() => resolve('replace')}>Replace with New</Button>
			</div>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
