<script lang="ts" module>
	import type { Component } from 'svelte';

	export interface Step {
		id: string;
		label: string;
		shortLabel?: string;
		icon: Component;
		isValid?: boolean;
		hasError?: boolean;
	}
</script>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Sheet from '$lib/components/ui/sheet';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { cn } from '$lib/utils';
	import { Check, CircleAlert, Menu } from '@lucide/svelte';

	let {
		steps,
		activeStep = $bindable(''),
		class: className
	}: {
		steps: Step[];
		activeStep: string;
		class?: string;
	} = $props();

	const isMobile = new IsMobile();
	let mobileMenuOpen = $state(false);

	function handleStepClick(stepId: string) {
		activeStep = stepId;
		mobileMenuOpen = false;
	}

	function getStepState(step: Step, index: number): 'active' | 'completed' | 'error' | 'pending' {
		if (step.hasError) return 'error';
		if (step.id === activeStep) return 'active';
		if (step.isValid) return 'completed';
		return 'pending';
	}

	const activeIndex = $derived(steps.findIndex((s) => s.id === activeStep));
	const activeStepData = $derived(steps.find((s) => s.id === activeStep));
</script>

{#if isMobile.current}
	<!-- Mobile: Horizontal compact stepper with sheet for full navigation -->
	<div class={cn('mb-4', className)}>
		<!-- Current step indicator bar -->
		<div class="flex items-center gap-2 rounded-xl border bg-card p-3 shadow-sm">
			<Sheet.Root bind:open={mobileMenuOpen}>
				<Sheet.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" class="size-9 shrink-0">
							<Menu class="size-5" />
						</Button>
					{/snippet}
				</Sheet.Trigger>
				<Sheet.Content side="left" class="w-72 p-0">
					<Sheet.Header class="border-b p-4">
						<Sheet.Title>Form Steps</Sheet.Title>
						<Sheet.Description class="text-sm">Navigate between sections</Sheet.Description>
					</Sheet.Header>
					<nav class="flex flex-col p-2">
						{#each steps as step, index (step.id)}
							{@const state = getStepState(step, index)}
							<button
								type="button"
								onclick={() => handleStepClick(step.id)}
								class={cn(
									'group flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all',
									state === 'active' && 'bg-primary/10 text-primary',
									state !== 'active' && 'hover:bg-muted'
								)}
							>
								<!-- Step indicator -->
								<div
									class={cn(
										'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
										state === 'active' && 'border-primary bg-primary text-primary-foreground',
										state === 'completed' && 'border-primary bg-primary/10 text-primary',
										state === 'error' && 'border-destructive bg-destructive/10 text-destructive',
										state === 'pending' && 'border-muted-foreground/30 text-muted-foreground'
									)}
								>
									{#if state === 'completed'}
										<Check class="size-4" />
									{:else if state === 'error'}
										<CircleAlert class="size-4" />
									{:else}
										<step.icon class="size-4" />
									{/if}
								</div>

								<!-- Step label -->
								<div class="flex flex-col">
									<span
										class={cn(
											'text-sm font-medium',
											state === 'active' && 'text-primary',
											state === 'pending' && 'text-muted-foreground'
										)}
									>
										{step.label}
									</span>
									<span class="text-xs text-muted-foreground">
										Step {index + 1} of {steps.length}
									</span>
								</div>
							</button>
						{/each}
					</nav>
				</Sheet.Content>
			</Sheet.Root>

			<!-- Current step info -->
			<div class="flex min-w-0 flex-1 items-center gap-3">
				{#if activeStepData}
					<div
						class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
					>
						<activeStepData.icon class="size-4" />
					</div>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium">{activeStepData.label}</p>
						<p class="text-xs text-muted-foreground">
							Step {activeIndex + 1} of {steps.length}
						</p>
					</div>
				{/if}
			</div>

			<!-- Step dots indicator -->
			<div class="flex items-center gap-1.5">
				{#each steps as step, index (step.id)}
					{@const state = getStepState(step, index)}
					<button
						type="button"
						onclick={() => handleStepClick(step.id)}
						class={cn(
							'size-2 rounded-full transition-all',
							state === 'active' && 'w-6 bg-primary',
							state === 'completed' && 'bg-primary/50',
							state === 'error' && 'bg-destructive',
							state === 'pending' && 'bg-muted-foreground/30'
						)}
						aria-label="Go to step {index + 1}: {step.label}"
					></button>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<!-- Desktop: Vertical sidebar stepper -->
	<aside
		class={cn(
			'sticky top-28.5 h-fit w-56 shrink-0 rounded-xl border bg-card p-4 shadow-sm',
			className
		)}
	>
		<!-- Header -->
		<div class="mb-4 border-b pb-3">
			<h3 class="text-sm font-semibold text-foreground">Form Progress</h3>
			<p class="mt-0.5 text-xs text-muted-foreground">
				{steps.filter((s) => s.isValid).length} of {steps.length} sections complete
			</p>
		</div>

		<!-- Steps -->
		<nav class="relative">
			<!-- Connecting line - between first and last step icons -->
			<div
				class="absolute top-7 left-5.5 h-[calc(100%-3.5rem)] w-0.5 bg-muted"
				aria-hidden="true"
			></div>

			<!-- Progress overlay on the line -->
			{#if activeIndex > 0}
				<div class="absolute top-0 left-5.5 h-full w-0.5 py-3.5" aria-hidden="true">
					<div
						class="bg-primary transition-all duration-300"
						style="height: {(activeIndex / (steps.length - 1)) * 100}%"
					></div>
				</div>
			{/if}

			<div class="relative flex flex-col gap-1">
				{#each steps as step, index (step.id)}
					{@const state = getStepState(step, index)}
					<button
						type="button"
						onclick={() => handleStepClick(step.id)}
						class={cn(
							'group flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-all',
							state === 'active' && 'bg-primary/10',
							state !== 'active' && 'hover:bg-muted/50'
						)}
					>
						<!-- Step circle indicator -->
						<div
							class={cn(
								'relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
								state === 'active' &&
									'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25',
								state === 'completed' && 'border-primary bg-card text-primary',
								state === 'error' && 'border-destructive bg-card text-destructive',
								state === 'pending' &&
									'border-muted-foreground/30 bg-card text-muted-foreground group-hover:border-muted-foreground/50'
							)}
						>
							{#if state === 'completed'}
								<Check class="size-4" strokeWidth={2.5} />
							{:else if state === 'error'}
								<CircleAlert class="size-4" />
							{:else}
								<step.icon class="size-4" />
							{/if}
						</div>

						<!-- Step label -->
						<div class="flex flex-col">
							<span
								class={cn(
									'text-sm leading-tight font-medium transition-colors',
									state === 'active' && 'text-primary',
									state === 'completed' && 'text-foreground',
									state === 'error' && 'text-destructive',
									state === 'pending' && 'text-muted-foreground group-hover:text-foreground'
								)}
							>
								{step.shortLabel || step.label}
							</span>
							{#if state === 'error'}
								<span class="text-xs text-destructive">Needs attention</span>
							{:else if state === 'completed'}
								<span class="text-xs text-muted-foreground">Completed</span>
							{/if}
						</div>
					</button>
				{/each}
			</div>
		</nav>
	</aside>
{/if}
