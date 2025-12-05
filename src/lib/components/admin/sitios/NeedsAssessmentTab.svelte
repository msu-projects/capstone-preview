<script lang="ts">
	import { FormSection } from '$lib/components/ui/form-section';
	import { HelpTooltip } from '$lib/components/ui/help-tooltip';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import {
		getNeedLevelFromScore,
		type NeedLevel,
		type SitioIssue,
		type SitioPPA
	} from '$lib/types';
	import { cn } from '$lib/utils';
	import { Target } from '@lucide/svelte';
	import IssuesPPAsSection from './IssuesPPAsSection.svelte';

	let {
		needScore = $bindable(5),
		issues_concerns = $bindable<SitioIssue[]>([]),
		proposed_ppas = $bindable<SitioPPA[]>([])
	}: {
		needScore: number;
		issues_concerns: SitioIssue[];
		proposed_ppas: SitioPPA[];
	} = $props();

	// Need level derived from score
	const needLevel = $derived(getNeedLevelFromScore(needScore));

	// Need level styling
	const needLevelConfig: Record<NeedLevel, { label: string; color: string; bgColor: string }> = {
		critical: {
			label: 'Critical',
			color: 'text-red-600 dark:text-red-400',
			bgColor: 'bg-red-100 dark:bg-red-900/30'
		},
		high: {
			label: 'High',
			color: 'text-orange-600 dark:text-orange-400',
			bgColor: 'bg-orange-100 dark:bg-orange-900/30'
		},
		medium: {
			label: 'Medium',
			color: 'text-yellow-600 dark:text-yellow-400',
			bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
		},
		low: {
			label: 'Low',
			color: 'text-green-600 dark:text-green-400',
			bgColor: 'bg-green-100 dark:bg-green-900/30'
		}
	};
</script>

<div class="space-y-6">
	<!-- Issues & Concerns and Proposed PPAs -->
	<IssuesPPAsSection bind:issues_concerns bind:proposed_ppas />

	<!-- Need Score Section -->
	<FormSection
		title="Need Score"
		description="Assess the sitio's priority level for development projects"
		icon={Target}
		accent="rose"
		isComplete={needScore >= 1 && needScore <= 10}
	>
		<div class="space-y-4">
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<Label for="needScore" class="flex items-center gap-1.5">
						Need Score (1-10)
						<span class="text-destructive">*</span>
						<HelpTooltip
							content="Rate how urgently this sitio needs development assistance. 1 = low need, 10 = critical need requiring immediate attention."
						/>
					</Label>
					<div
						class={cn(
							'flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
							needLevelConfig[needLevel].bgColor,
							needLevelConfig[needLevel].color
						)}
					>
						<span class="text-lg font-bold">{needScore}</span>
						<span>/10</span>
						<span class="mx-1">•</span>
						<span>{needLevelConfig[needLevel].label}</span>
					</div>
				</div>

				<div class="flex items-center gap-4">
					<span class="text-xs text-muted-foreground">Low</span>
					<Slider
						id="needScore"
						type="single"
						value={needScore}
						onValueChange={(v: number) => (needScore = v)}
						min={1}
						max={10}
						step={1}
						class="flex-1"
					/>
					<span class="text-xs text-muted-foreground">Critical</span>
				</div>

				<div class="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
					<span>1-3: Low (well-served)</span>
					<span>4-5: Medium</span>
					<span>6-7: High</span>
					<span>8-10: Critical (urgent)</span>
				</div>
			</div>
		</div>
	</FormSection>
</div>
