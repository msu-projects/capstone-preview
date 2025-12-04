<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		sticky?: boolean;
		actions?: Snippet;
		badges?: Snippet;
	}

	let { title, description, sticky = false, actions, badges }: Props = $props();
</script>

{#if sticky}
	<div class="sticky top-0 z-10 border-b border-border bg-background shadow-sm">
		<div class="flex items-center gap-2 p-3 sm:gap-4 sm:p-4">
			<Sidebar.Trigger class="-ml-1 shrink-0" />
			<Separator orientation="vertical" class="hidden h-6 sm:block" />
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					<h1 class="truncate text-lg font-bold sm:text-xl md:text-2xl">{title}</h1>
					{#if badges}
						<div class="flex shrink-0 items-center gap-1">
							{@render badges()}
						</div>
					{/if}
				</div>
				{#if description}
					<p class="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
				{/if}
			</div>
			{#if actions}
				<div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<header class="border-b bg-card">
		<div class="flex h-full items-center gap-2 p-4 sm:gap-4 sm:p-6">
			<Sidebar.Trigger class="-ml-1 shrink-0" />
			<!-- <Separator orientation="vertical" class="hidden scale-y-185 sm:block" color="#000" /> -->
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2 sm:gap-3">
					<h1 class="truncate text-xl font-bold sm:text-2xl md:text-3xl">{title}</h1>
					{#if badges}
						<div class="flex shrink-0 items-center gap-1">
							{@render badges()}
						</div>
					{/if}
				</div>
				{#if description}
					<p class="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
				{/if}
			</div>
			{#if actions}
				<div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
					{@render actions()}
				</div>
			{/if}
		</div>
	</header>
{/if}
