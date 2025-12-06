<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { ArrowDown, ArrowUp, Plus, X } from '@lucide/svelte';

	interface Props {
		items: string[];
		label?: string;
		placeholder?: string;
		onUpdate: (items: string[]) => void;
		allowReorder?: boolean;
		maxItems?: number;
	}

	let {
		items = [],
		label,
		placeholder = 'Enter value',
		onUpdate,
		allowReorder = true,
		maxItems
	}: Props = $props();

	let newItem = $state('');

	function addItem() {
		if (!newItem.trim()) return;
		if (maxItems && items.length >= maxItems) return;
		if (items.includes(newItem.trim())) {
			newItem = '';
			return;
		}
		onUpdate([...items, newItem.trim()]);
		newItem = '';
	}

	function removeItem(index: number) {
		onUpdate(items.filter((_, i) => i !== index));
	}

	function moveItem(index: number, direction: 'up' | 'down') {
		const newItems = [...items];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= newItems.length) return;
		[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
		onUpdate(newItems);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addItem();
		}
	}
</script>

<div class="space-y-3">
	{#if label}
		<p class="text-sm font-medium">{label}</p>
	{/if}

	<div class="flex gap-2">
		<Input
			bind:value={newItem}
			{placeholder}
			onkeydown={handleKeyDown}
			disabled={maxItems !== undefined && items.length >= maxItems}
		/>
		<Button
			variant="outline"
			size="icon"
			onclick={addItem}
			disabled={!newItem.trim() || (maxItems !== undefined && items.length >= maxItems)}
		>
			<Plus class="size-4" />
		</Button>
	</div>

	{#if items.length > 0}
		<div class="rounded-md border border-border/50">
			{#each items as item, index (item)}
				<div class="flex items-center gap-2 border-b border-border/50 px-3 py-2 last:border-b-0">
					{#if allowReorder}
						<div class="flex flex-col">
							<Button
								variant="ghost"
								size="icon"
								class="size-5"
								onclick={() => moveItem(index, 'up')}
								disabled={index === 0}
							>
								<ArrowUp class="size-3" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								class="size-5"
								onclick={() => moveItem(index, 'down')}
								disabled={index === items.length - 1}
							>
								<ArrowDown class="size-3" />
							</Button>
						</div>
					{/if}
					<span class="flex-1 text-sm">{item}</span>
					<Button variant="ghost" size="icon" class="size-7" onclick={() => removeItem(index)}>
						<X class="size-3" />
					</Button>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-sm text-muted-foreground italic">No items added yet.</p>
	{/if}

	{#if maxItems}
		<p class="text-xs text-muted-foreground">
			{items.length} / {maxItems} items
		</p>
	{/if}
</div>
