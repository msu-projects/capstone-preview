<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { categories } from '$lib/config/project-categories';
	import { stats } from '$lib/mock-data';
	import {
		ArrowRight,
		Briefcase,
		Building2,
		CheckCircle2,
		Clock,
		FolderKanban,
		GraduationCap,
		HeartPulse,
		Leaf,
		Sprout,
		Target,
		TrendingUp,
		Users
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

	// Map category icon names to Lucide components
	const categoryIcons: Record<string, Component<{ class?: string }>> = {
		'building-2': Building2,
		sprout: Sprout,
		'graduation-cap': GraduationCap,
		'heart-pulse': HeartPulse,
		briefcase: Briefcase,
		leaf: Leaf
	};

	// Format currency for display
	function formatBudget(amount: number): string {
		if (amount >= 1_000_000_000) {
			return `₱${(amount / 1_000_000_000).toFixed(1)}B`;
		}
		if (amount >= 1_000_000) {
			return `₱${(amount / 1_000_000).toFixed(1)}M`;
		}
		if (amount >= 1_000) {
			return `₱${(amount / 1_000).toFixed(0)}K`;
		}
		return `₱${amount.toLocaleString()}`;
	}

	// Format large numbers
	function formatNumber(num: number): string {
		if (num >= 1_000_000) {
			return `${(num / 1_000_000).toFixed(1)}M`;
		}
		if (num >= 1_000) {
			return `${(num / 1_000).toFixed(1)}K`;
		}
		return num.toLocaleString();
	}

	const quickStats = [
		{
			label: 'Total Projects',
			value: stats.total_projects,
			icon: FolderKanban,
			color: 'text-primary'
		},
		{
			label: 'Active Projects',
			value: stats.active_projects,
			icon: TrendingUp,
			color: 'text-amber-600'
		},
		{
			label: 'Completed',
			value: stats.completed_projects,
			icon: CheckCircle2,
			color: 'text-emerald-600'
		},
		{
			label: 'Total Sitios',
			value: stats.total_sitios,
			icon: Users,
			color: 'text-blue-600'
		}
	];

	const features = [
		{
			icon: Target,
			title: 'CATCH-UP Mechanism',
			description:
				'Identify, report, and resolve project delays with root cause analysis and recovery action plans.'
		},
		{
			icon: Clock,
			title: 'Real-time Monitoring',
			description:
				'Track physical and financial progress against baseline schedules with automatic slippage detection.'
		},
		{
			icon: CheckCircle2,
			title: 'Full Transparency',
			description:
				'Access project details, delay reports, and recovery plans to foster accountability in governance.'
		}
	];
</script>

<svelte:head>
	<title>South Cotabato CATCH-UP | Convergence Data Bank</title>
	<meta
		name="description"
		content="South Cotabato CATCH-UP - Convergence Approach for Transformation and CHange - Unification Program. Tracking development projects in vulnerable communities."
	/>
</svelte:head>

<div>
	<!-- Hero Section -->
	<section
		class="relative overflow-hidden bg-linear-to-b from-primary/5 via-background to-background py-16 md:py-24"
	>
		<div class="container mx-auto px-4">
			<div class="mx-auto max-w-3xl text-center">
				<div
					class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
				>
					<span class="size-1.5 rounded-full bg-primary"></span>
					Government Transparency Portal
				</div>
				<h1 class="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
					South Cotabato
					<span class="block text-primary">Convergence Data Bank</span>
				</h1>
				<p class="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
					Tracking development projects in vulnerable communities. Ensuring transparency,
					accountability, and timely delivery of government initiatives.
				</p>
				<div class="flex flex-col justify-center gap-3 sm:flex-row">
					<Button href="/projects" size="lg" class="gap-2">
						<FolderKanban class="size-5" />
						View Projects
						<ArrowRight class="size-4" />
					</Button>
					<Button href="/sitios" variant="outline" size="lg" class="gap-2">
						<Users class="size-5" />
						Explore Sitios
					</Button>
				</div>
			</div>
		</div>

		<!-- Decorative gradient orbs -->
		<div
			class="pointer-events-none absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-linear-to-r from-primary/20 to-transparent blur-3xl"
		></div>
	</section>

	<!-- Quick Stats -->
	<section class="border-y py-8">
		<div class="container mx-auto px-4">
			<div class="grid grid-cols-2 gap-10 md:grid-cols-4">
				{#each quickStats as stat}
					<Card.Root class="text-center">
						<Card.Content class="py-5">
							<div class="mb-2 flex justify-center">
								<stat.icon class="size-8 {stat.color}" />
							</div>
							<p class="text-3xl font-bold">{formatNumber(stat.value ?? 0)}</p>
							<p class="text-sm text-muted-foreground">{stat.label}</p>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	</section>

	<!-- About Section with Features -->
	<section class="py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto mb-12 max-w-2xl text-center">
				<h2 class="mb-4 text-3xl font-bold">Empowering Communities Through Transparency</h2>
				<p class="text-lg text-muted-foreground">
					The Convergence Data Bank provides citizens with direct access to project information,
					enabling oversight and fostering trust in local governance.
				</p>
			</div>

			<div class="grid gap-6 md:grid-cols-3">
				{#each features as feature}
					<Card.Root class="text-center">
						<Card.Content class="pt-6">
							<div
								class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10"
							>
								<feature.icon class="size-7 text-primary" />
							</div>
							<h3 class="mb-2 text-lg font-semibold">{feature.title}</h3>
							<p class="text-sm text-muted-foreground">{feature.description}</p>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	</section>

	<!-- Project Categories -->
	<section class="bg-muted/30 py-16">
		<div class="container mx-auto px-4">
			<div class="mx-auto mb-12 max-w-2xl text-center">
				<h2 class="mb-4 text-3xl font-bold">Project Categories</h2>
				<p class="text-lg text-muted-foreground">
					Explore development initiatives across various sectors driving progress in South Cotabato.
				</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each categories as category}
					{@const IconComponent = categoryIcons[category.icon]}
					<a href="/projects?category={category.key}" class="group">
						<Card.Root class="h-full transition-shadow hover:shadow-md">
							<Card.Content class="flex items-start gap-4">
								<div
									class="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20"
								>
									{#if IconComponent}
										<IconComponent class="size-6 text-primary" />
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<h3 class="mb-1 font-semibold transition-colors group-hover:text-primary">
										{category.name}
									</h3>
									<p class="line-clamp-2 text-sm text-muted-foreground">
										{category.description}
									</p>
								</div>
								<ArrowRight
									class="mt-1 size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
								/>
							</Card.Content>
						</Card.Root>
					</a>
				{/each}
			</div>
		</div>
	</section>
</div>
