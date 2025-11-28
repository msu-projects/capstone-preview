<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import type { Sitio } from '$lib/types';
	import { AlertTriangle, Briefcase, Home, TrendingDown, TrendingUp, Users } from '@lucide/svelte';

	interface Props {
		sitio: Sitio;
		class?: string;
	}

	let { sitio, class: className = '' }: Props = $props();

	// Calculate vulnerability score
	// % of families who are 4Ps Beneficiaries + % without Electricity
	const fourpsPercentage = $derived(
		sitio.social_services && sitio.households > 0
			? (sitio.social_services.fourps_beneficiaries / sitio.households) * 100
			: 0
	);

	const withoutElectricityPercentage = $derived.by(() => {
		if (!sitio.utilities || sitio.households <= 0) return 0;
		const withElectricity = sitio.utilities.households_with_electricity;
		const withoutElectricity = sitio.households - withElectricity;
		return (withoutElectricity / sitio.households) * 100;
	});

	const vulnerabilityScore = $derived((fourpsPercentage + withoutElectricityPercentage) / 2);

	// Calculate workforce participation
	// % of population aged 18-60 currently employed
	// Using age_15_64 as proxy for working-age population
	const workforceParticipation = $derived.by(() => {
		if (!sitio.economic_condition || sitio.demographics.age_15_64 <= 0) return 0;
		const totalEmployed = sitio.economic_condition.employments.reduce((sum, e) => sum + e.count, 0);
		return (totalEmployed / sitio.demographics.age_15_64) * 100;
	});

	// Vulnerability interpretation
	const vulnerabilityLevel = $derived.by(() => {
		if (vulnerabilityScore < 25)
			return { label: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-50' };
		if (vulnerabilityScore < 50)
			return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
		return { label: 'High', color: 'text-red-600', bg: 'bg-red-50' };
	});

	// Workforce interpretation
	const workforceLevel = $derived.by(() => {
		if (workforceParticipation >= 60)
			return { label: 'Strong', color: 'text-emerald-600', bg: 'bg-emerald-50' };
		if (workforceParticipation >= 40)
			return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
		return { label: 'Low', color: 'text-red-600', bg: 'bg-red-50' };
	});

	const kpiData = $derived([
		{
			label: 'Total Population',
			value: sitio.population.toLocaleString(),
			sublabel: `${sitio.demographics.male.toLocaleString()} M / ${sitio.demographics.female.toLocaleString()} F`,
			icon: Users,
			color: 'from-blue-500 to-blue-600',
			bgColor: 'bg-blue-50',
			iconBg: 'bg-blue-100',
			iconColor: 'text-blue-600'
		},
		{
			label: 'Total Households',
			value: sitio.households.toLocaleString(),
			sublabel: `Avg ${(sitio.population / Math.max(sitio.households, 1)).toFixed(1)} per household`,
			icon: Home,
			color: 'from-indigo-500 to-indigo-600',
			bgColor: 'bg-indigo-50',
			iconBg: 'bg-indigo-100',
			iconColor: 'text-indigo-600'
		},
		{
			label: 'Vulnerability Score',
			value: `${vulnerabilityScore.toFixed(1)}%`,
			sublabel: vulnerabilityLevel.label + ' Risk',
			icon: AlertTriangle,
			color:
				vulnerabilityScore >= 50
					? 'from-red-500 to-red-600'
					: vulnerabilityScore >= 25
						? 'from-amber-500 to-amber-600'
						: 'from-emerald-500 to-emerald-600',
			bgColor: vulnerabilityLevel.bg,
			iconBg: vulnerabilityLevel.bg,
			iconColor: vulnerabilityLevel.color,
			trend:
				vulnerabilityScore >= 50 ? 'negative' : vulnerabilityScore >= 25 ? 'neutral' : 'positive'
		},
		{
			label: 'Workforce Participation',
			value: `${workforceParticipation.toFixed(1)}%`,
			sublabel: workforceLevel.label + ' Employment',
			icon: Briefcase,
			color:
				workforceParticipation >= 60
					? 'from-emerald-500 to-emerald-600'
					: workforceParticipation >= 40
						? 'from-amber-500 to-amber-600'
						: 'from-red-500 to-red-600',
			bgColor: workforceLevel.bg,
			iconBg: workforceLevel.bg,
			iconColor: workforceLevel.color,
			trend:
				workforceParticipation >= 60
					? 'positive'
					: workforceParticipation >= 40
						? 'neutral'
						: 'negative'
		}
	]);
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 {className}">
	{#each kpiData as kpi}
		<Card.Root
			class="relative overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md"
		>
			<!-- Gradient accent -->
			<div class="absolute top-0 left-0 h-1 w-full bg-linear-to-r {kpi.color}"></div>

			<Card.Content class="pt-5 pb-4">
				<div class="flex items-start justify-between">
					<div class="space-y-1">
						<p class="text-sm font-medium text-slate-500">{kpi.label}</p>
						<p class="text-2xl font-bold tracking-tight text-slate-900">{kpi.value}</p>
						<div class="flex items-center gap-1.5">
							{#if kpi.trend === 'positive'}
								<TrendingUp class="size-3.5 text-emerald-500" />
							{:else if kpi.trend === 'negative'}
								<TrendingDown class="size-3.5 text-red-500" />
							{/if}
							<p class="text-xs text-slate-500">{kpi.sublabel}</p>
						</div>
					</div>
					<div class="rounded-xl p-2.5 {kpi.iconBg}">
						<kpi.icon class="size-5 {kpi.iconColor}" />
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/each}
</div>
