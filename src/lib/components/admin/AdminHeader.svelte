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
		<div class="flex items-center justify-between p-4">
			<div class="flex items-center gap-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-6" />
				<div>
					<div class="flex items-center gap-3">
						<h1 class="text-2xl font-bold">{title}</h1>
						{#if badges}
							{@render badges()}
						{/if}
					</div>
					{#if description}
						<p class="mt-1 text-sm text-muted-foreground">{description}</p>
					{/if}
				</div>
			</div>
			{#if actions}
				<div class="flex items-center gap-2">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<header class="border-b bg-card">
		<div class="flex items-center justify-between p-6">
			<div class="flex items-center gap-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-6" />
				<div>
					<div class="flex items-center gap-3">
						<h1 class="text-3xl font-bold">{title}</h1>
						{#if badges}
							{@render badges()}
						{/if}
					</div>
					{#if description}
						<p class="text-muted-foreground">{description}</p>
					{/if}
				</div>
			</div>
			{#if actions}
				<div class="flex gap-2">
					{@render actions()}
				</div>
			{/if}
		</div>
	</header>
{/if}
