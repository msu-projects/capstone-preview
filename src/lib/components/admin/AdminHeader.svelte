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
		<div class="flex flex-col gap-3 p-3 sm:p-4">
			<!-- Top row: sidebar trigger, title, and actions -->
			<div class="flex items-center justify-between gap-2">
				<div class="flex min-w-0 items-center gap-2 sm:gap-4">
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
					</div>
				</div>
				{#if actions}
					<div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
						{@render actions()}
					</div>
				{/if}
			</div>
			<!-- Description row (if present) -->
			{#if description}
				<p class="pl-8 text-xs text-muted-foreground sm:pl-12 sm:text-sm">{description}</p>
			{/if}
		</div>
	</div>
{:else}
	<header class="border-b bg-card">
		<div class="flex flex-col gap-3 p-4 sm:p-6">
			<!-- Top row: sidebar trigger, title, and actions -->
			<div class="flex items-center justify-between gap-2">
				<div class="flex min-w-0 items-center gap-2 sm:gap-4">
					<Sidebar.Trigger class="-ml-1 shrink-0" />
					<Separator orientation="vertical" class="hidden h-6 sm:block" />
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2 sm:gap-3">
							<h1 class="truncate text-xl font-bold sm:text-2xl md:text-3xl">{title}</h1>
							{#if badges}
								<div class="flex shrink-0 items-center gap-1">
									{@render badges()}
								</div>
							{/if}
						</div>
					</div>
				</div>
				{#if actions}
					<div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
						{@render actions()}
					</div>
				{/if}
			</div>
			<!-- Description row (if present) -->
			{#if description}
				<p class="pl-8 text-xs text-muted-foreground sm:pl-12 sm:text-sm">{description}</p>
			{/if}
		</div>
	</header>
{/if}
