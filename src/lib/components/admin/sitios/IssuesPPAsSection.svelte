<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Dialog from '$lib/components/ui/dialog';
	import FormSection from '$lib/components/ui/form-section/form-section.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import {
		categoryColors,
		categoryLabels,
		createCustomIssue,
		createCustomPPA,
		createIssueFromPredefined,
		createPPAFromPredefined,
		getPredefinedIssue,
		getPredefinedPPA,
		getSuggestedPPAsForIssue,
		predefinedIssues,
		predefinedPPAs,
		type PredefinedPPA
	} from '$lib/config/issue-ppa-mappings';
	import { projectTypes } from '$lib/config/project-categories';
	import type { CategoryKey, SitioIssue, SitioPPA } from '$lib/types';
	import {
		AlertTriangle,
		ArrowRight,
		Check,
		Filter,
		Lightbulb,
		Link2,
		Pencil,
		Plus,
		Sparkles,
		Target,
		Trash2,
		X
	} from '@lucide/svelte';

	let {
		issues_concerns = $bindable<SitioIssue[]>([]),
		proposed_ppas = $bindable<SitioPPA[]>([])
	}: {
		issues_concerns: SitioIssue[];
		proposed_ppas: SitioPPA[];
	} = $props();

	// State
	let issuePopoverOpen = $state(false);
	let ppaPopoverOpen = $state(false);
	let issueSearch = $state('');
	let ppaSearch = $state('');
	let categoryFilter = $state<CategoryKey | 'all'>('all');

	// Custom entry dialog state
	let customIssueDialogOpen = $state(false);
	let customPPADialogOpen = $state(false);
	let customIssueName = $state('');
	let customPPAName = $state('');
	let customIssueCategory = $state<CategoryKey>('infrastructure');
	let customPPACategory = $state<CategoryKey>('infrastructure');
	let customPPAProjectTypeId = $state<number | undefined>(undefined);

	// Edit dialog state
	let editIssueDialogOpen = $state(false);
	let editPPADialogOpen = $state(false);
	let editingIssue = $state<SitioIssue | null>(null);
	let editingPPA = $state<SitioPPA | null>(null);
	let editIssueName = $state('');
	let editIssueCategory = $state<CategoryKey>('infrastructure');
	let editPPAName = $state('');
	let editPPACategory = $state<CategoryKey>('infrastructure');
	let editPPAProjectTypeId = $state<number | undefined>(undefined);

	// Computed: Available predefined issues (not yet added)
	const availableIssues = $derived(
		predefinedIssues.filter(
			(issue) =>
				!issues_concerns.some((i) => i.id === issue.id) &&
				(categoryFilter === 'all' || issue.category === categoryFilter) &&
				issue.name.toLowerCase().includes(issueSearch.toLowerCase())
		)
	);

	// Computed: Available predefined PPAs (not yet added)
	const availablePPAs = $derived(
		predefinedPPAs.filter(
			(ppa) =>
				!proposed_ppas.some((p) => p.id === ppa.id) &&
				(categoryFilter === 'all' || ppa.category === categoryFilter) &&
				ppa.name.toLowerCase().includes(ppaSearch.toLowerCase())
		)
	);

	// Computed: Suggested PPAs based on current issues
	const suggestedPPAs = $derived.by(() => {
		const suggestions: PredefinedPPA[] = [];
		const addedPPAIds = new Set(proposed_ppas.map((p) => p.id));

		for (const issue of issues_concerns) {
			const ppas = getSuggestedPPAsForIssue(issue.id);
			for (const ppa of ppas) {
				if (!addedPPAIds.has(ppa.id) && !suggestions.some((s) => s.id === ppa.id)) {
					suggestions.push(ppa);
				}
			}
		}
		return suggestions;
	});

	// Computed: Check if search is custom entry
	const isCustomIssueEntry = $derived(
		issueSearch.trim() !== '' &&
			!predefinedIssues.some((i) => i.name.toLowerCase() === issueSearch.toLowerCase()) &&
			!issues_concerns.some((i) => i.name.toLowerCase() === issueSearch.toLowerCase())
	);

	const isCustomPPAEntry = $derived(
		ppaSearch.trim() !== '' &&
			!predefinedPPAs.some((p) => p.name.toLowerCase() === ppaSearch.toLowerCase()) &&
			!proposed_ppas.some((p) => p.name.toLowerCase() === ppaSearch.toLowerCase())
	);

	// Computed: Project types for custom PPA selection
	const projectTypeOptions = $derived(
		projectTypes
			.filter((pt) => pt.category_key === customPPACategory)
			.map((pt) => ({ value: pt.id.toString(), label: pt.name }))
	);

	// Computed: Project types for edit PPA selection
	const editProjectTypeOptions = $derived(
		projectTypes
			.filter((pt) => pt.category_key === editPPACategory)
			.map((pt) => ({ value: pt.id.toString(), label: pt.name }))
	);

	// Category options for select
	const categoryOptions: Array<{ value: CategoryKey; label: string }> = [
		{ value: 'infrastructure', label: 'Infrastructure' },
		{ value: 'agriculture', label: 'Agriculture' },
		{ value: 'education', label: 'Education' },
		{ value: 'health', label: 'Health' },
		{ value: 'livelihood', label: 'Livelihood' },
		{ value: 'environment', label: 'Environment' }
	];

	// Functions
	function addIssue(issueId: string) {
		const issue = createIssueFromPredefined(issueId);
		if (issue && !issues_concerns.some((i) => i.id === issue.id)) {
			issues_concerns = [...issues_concerns, issue];
		}
		issueSearch = '';
		issuePopoverOpen = false;
	}

	function removeIssue(issueId: string) {
		issues_concerns = issues_concerns.filter((i) => i.id !== issueId);
	}

	function addPPA(ppaId: string) {
		const ppa = createPPAFromPredefined(ppaId);
		if (ppa && !proposed_ppas.some((p) => p.id === ppa.id)) {
			proposed_ppas = [...proposed_ppas, ppa];
		}
		ppaSearch = '';
		ppaPopoverOpen = false;
	}

	function removePPA(ppaId: string) {
		proposed_ppas = proposed_ppas.filter((p) => p.id !== ppaId);
	}

	function openCustomIssueDialog() {
		customIssueName = issueSearch;
		customIssueCategory = categoryFilter === 'all' ? 'infrastructure' : categoryFilter;
		customIssueDialogOpen = true;
		issuePopoverOpen = false;
	}

	function openCustomPPADialog() {
		customPPAName = ppaSearch;
		customPPACategory = categoryFilter === 'all' ? 'infrastructure' : categoryFilter;
		customPPAProjectTypeId = undefined;
		customPPADialogOpen = true;
		ppaPopoverOpen = false;
	}

	function saveCustomIssue() {
		if (customIssueName.trim()) {
			const issue = createCustomIssue(customIssueName.trim(), customIssueCategory);
			issues_concerns = [...issues_concerns, issue];
			customIssueName = '';
			customIssueDialogOpen = false;
		}
	}

	function saveCustomPPA() {
		if (customPPAName.trim()) {
			const ppa = createCustomPPA(customPPAName.trim(), customPPACategory, customPPAProjectTypeId);
			proposed_ppas = [...proposed_ppas, ppa];
			customPPAName = '';
			customPPADialogOpen = false;
		}
	}

	function getProjectTypeName(projectTypeId: number | undefined): string | null {
		if (!projectTypeId) return null;
		const pt = projectTypes.find((p) => p.id === projectTypeId);
		return pt?.name ?? null;
	}

	function getLinkedPPANames(issue: SitioIssue): string[] {
		const predefined = getPredefinedIssue(issue.id);
		if (!predefined) return [];
		return predefined.suggestedPPAIds
			.map((id) => getPredefinedPPA(id)?.name)
			.filter((n): n is string => !!n);
	}

	function getLinkedIssueNames(ppa: SitioPPA): string[] {
		const predefined = getPredefinedPPA(ppa.id);
		if (!predefined) return [];
		return predefined.addressesIssueIds
			.map((id) => getPredefinedIssue(id)?.name)
			.filter((n): n is string => !!n);
	}

	// Edit Issue
	function openEditIssueDialog(issue: SitioIssue) {
		editingIssue = issue;
		editIssueName = issue.name;
		editIssueCategory = issue.category;
		editIssueDialogOpen = true;
	}

	function saveEditedIssue() {
		if (editingIssue && editIssueName.trim()) {
			issues_concerns = issues_concerns.map((i) =>
				i.id === editingIssue!.id
					? {
							...i,
							name: editIssueName.trim(),
							category: editIssueCategory,
							isCustom: true
						}
					: i
			);
			editIssueDialogOpen = false;
			editingIssue = null;
		}
	}

	// Edit PPA
	function openEditPPADialog(ppa: SitioPPA) {
		editingPPA = ppa;
		editPPAName = ppa.name;
		editPPACategory = ppa.category;
		editPPAProjectTypeId = ppa.projectTypeId;
		editPPADialogOpen = true;
	}

	function saveEditedPPA() {
		if (editingPPA && editPPAName.trim()) {
			proposed_ppas = proposed_ppas.map((p) =>
				p.id === editingPPA!.id
					? {
							...p,
							name: editPPAName.trim(),
							category: editPPACategory,
							projectTypeId: editPPAProjectTypeId,
							isCustom: true
						}
					: p
			);
			editPPADialogOpen = false;
			editingPPA = null;
		}
	}
</script>

<div class="space-y-6">
	<!-- Category Filter -->
	<div class="flex items-center gap-2">
		<Filter class="size-4 text-muted-foreground" />
		<span class="text-sm text-muted-foreground">Filter by category:</span>
		<div class="flex flex-wrap gap-1.5">
			<Button
				type="button"
				variant={categoryFilter === 'all' ? 'default' : 'outline'}
				size="sm"
				class="h-7 px-2.5 text-xs"
				onclick={() => (categoryFilter = 'all')}
			>
				All
			</Button>
			{#each categoryOptions as cat (cat.value)}
				{@const colors = categoryColors[cat.value]}
				<Button
					type="button"
					variant={categoryFilter === cat.value ? 'default' : 'outline'}
					size="sm"
					class="h-7 px-2.5 text-xs {categoryFilter === cat.value ? '' : colors.text}"
					onclick={() => (categoryFilter = cat.value)}
				>
					{cat.label}
				</Button>
			{/each}
		</div>
	</div>

	<!-- Issues & Concerns Section -->
	<FormSection
		title="Issues & Concerns"
		description="Primary community issues (linked to suggested PPAs)"
		icon={AlertTriangle}
		variant="warning"
	>
		<!-- Issue chips -->
		{#if issues_concerns.length > 0}
			<div class="flex flex-wrap gap-2">
				{#each issues_concerns as issue (issue.id)}
					{@const colors = categoryColors[issue.category]}
					{@const linkedPPAs = getLinkedPPANames(issue)}
					<Tooltip.Root>
						<Tooltip.Trigger>
							<div
								class="group flex items-center gap-1.5 rounded-lg border py-1.5 pr-1.5 pl-3 text-sm transition-all {colors.bg} {colors.border}"
							>
								<span class="rounded px-1.5 py-0.5 text-xs font-medium {colors.bg} {colors.text}">
									{categoryLabels[issue.category]}
								</span>
								<span class="text-foreground">{issue.name}</span>
								{#if issue.isCustom}
									<span
										class="rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground"
										title="Custom entry"
									>
										Custom
									</span>
								{/if}
								{#if linkedPPAs.length > 0}
									<span class="flex items-center gap-0.5 text-muted-foreground">
										<Link2 class="size-3" />
										<span class="text-xs">{linkedPPAs.length}</span>
									</span>
								{/if}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="size-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
									onclick={() => openEditIssueDialog(issue)}
								>
									<Pencil class="size-3" />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="size-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
									onclick={() => removeIssue(issue.id)}
								>
									<X class="size-3.5" />
								</Button>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom" class="max-w-xs">
							{#if linkedPPAs.length > 0}
								<p class="mb-1 text-xs font-medium">Suggested PPAs:</p>
								<ul class="list-inside list-disc text-xs">
									{#each linkedPPAs as ppaName (ppaName)}
										<li>{ppaName}</li>
									{/each}
								</ul>
							{:else}
								<p class="text-xs">No linked PPAs</p>
							{/if}
						</Tooltip.Content>
					</Tooltip.Root>
				{/each}
			</div>
		{:else}
			<div
				class="flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 text-center"
			>
				<AlertTriangle class="size-6 text-muted-foreground/50" />
				<p class="text-sm text-muted-foreground">No issues added yet</p>
			</div>
		{/if}

		<!-- Add Issue Popover -->
		<Popover.Root bind:open={issuePopoverOpen}>
			<Popover.Trigger>
				<Button type="button" variant="outline" size="sm" class="mt-2 gap-1.5">
					<Plus class="size-3.5" />
					Add Issue
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-80 p-0" align="start">
				<Command.Root shouldFilter={false}>
					<Command.Input placeholder="Search issues..." bind:value={issueSearch} />
					<Command.List class="max-h-60">
						{#if availableIssues.length === 0 && !isCustomIssueEntry}
							<Command.Empty>No matching issues found.</Command.Empty>
						{/if}
						<Command.Group heading="Predefined Issues">
							{#each availableIssues as issue (issue.id)}
								{@const colors = categoryColors[issue.category]}
								<Command.Item value={issue.id} onSelect={() => addIssue(issue.id)}>
									<div class="flex w-full items-center gap-2">
										<span
											class="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium {colors.bg} {colors.text}"
										>
											{categoryLabels[issue.category]}
										</span>
										<span class="truncate">{issue.name}</span>
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
						{#if isCustomIssueEntry}
							<Command.Separator />
							<Command.Group>
								<Command.Item value="__custom_issue__" onSelect={openCustomIssueDialog}>
									<Plus class="mr-2 size-4" />
									Add custom: "{issueSearch}"
								</Command.Item>
							</Command.Group>
						{/if}
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</FormSection>

	<!-- Suggested PPAs Section (only show if there are suggestions) -->
	{#if suggestedPPAs.length > 0}
		<div
			class="rounded-lg border border-dashed border-success/50 bg-success/5 p-4 dark:border-success/30"
		>
			<div class="mb-3 flex items-center gap-2">
				<Lightbulb class="size-5 text-success" />
				<h4 class="font-medium text-success">Suggested PPAs</h4>
				<span class="text-xs text-muted-foreground">Based on selected issues</span>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each suggestedPPAs as ppa (ppa.id)}
					{@const colors = categoryColors[ppa.category]}
					<Button
						type="button"
						variant="outline"
						size="sm"
						class="h-auto gap-1.5 py-1.5 {colors.border} hover:{colors.bg} hover:text-black hover:dark:text-white"
						onclick={() => addPPA(ppa.id)}
					>
						<Sparkles class="size-3.5 text-success " />
						<span class="rounded px-1 py-0.5 text-xs {colors.bg} {colors.text}">
							{categoryLabels[ppa.category]}
						</span>
						<span>{ppa.name}</span>
						<Plus class="size-3.5" />
					</Button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Proposed PPAs Section -->
	<FormSection
		title="Proposed PPAs"
		description="Programs, Projects, and Activities (linked to project types)"
		icon={Target}
		variant="success"
	>
		<!-- PPA chips -->
		{#if proposed_ppas.length > 0}
			<div class="space-y-2">
				{#each proposed_ppas as ppa (ppa.id)}
					{@const colors = categoryColors[ppa.category]}
					{@const projectTypeName = getProjectTypeName(ppa.projectTypeId)}
					{@const linkedIssues = getLinkedIssueNames(ppa)}
					<div
						class="group flex items-start gap-2 rounded-lg border p-3 transition-all {colors.bg} {colors.border}"
					>
						<div class="min-w-0 flex-1">
							<div class="mb-1 flex flex-wrap items-center gap-1.5">
								<span class="rounded px-1.5 py-0.5 text-xs font-medium {colors.bg} {colors.text}">
									{categoryLabels[ppa.category]}
								</span>
								{#if ppa.isCustom}
									<span class="rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground">
										Custom
									</span>
								{/if}
								{#if projectTypeName}
									<Tooltip.Root>
										<Tooltip.Trigger>
											<span
												class="flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
											>
												<ArrowRight class="size-3" />
												{projectTypeName}
											</span>
										</Tooltip.Trigger>
										<Tooltip.Content>
											<p class="text-xs">Links to project type: {projectTypeName}</p>
										</Tooltip.Content>
									</Tooltip.Root>
								{/if}
							</div>
							<p class="text-sm font-medium text-foreground">{ppa.name}</p>
							{#if linkedIssues.length > 0}
								<p class="mt-1 text-xs text-muted-foreground">
									<span class="font-medium">Addresses:</span>
									{linkedIssues.join(', ')}
								</p>
							{/if}
						</div>
						<div class="flex shrink-0 gap-1">
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
								onclick={() => openEditPPADialog(ppa)}
							>
								<Pencil class="size-4" />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="size-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
								onclick={() => removePPA(ppa.id)}
							>
								<Trash2 class="size-4" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="flex flex-col items-center gap-2 rounded-lg border border-dashed py-6 text-center"
			>
				<Target class="size-6 text-muted-foreground/50" />
				<p class="text-sm text-muted-foreground">No PPAs added yet</p>
			</div>
		{/if}

		<!-- Add PPA Popover -->
		<Popover.Root bind:open={ppaPopoverOpen}>
			<Popover.Trigger>
				<Button type="button" variant="outline" size="sm" class="mt-2 gap-1.5">
					<Plus class="size-3.5" />
					Add PPA
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-96 p-0" align="start">
				<Command.Root shouldFilter={false}>
					<Command.Input placeholder="Search PPAs..." bind:value={ppaSearch} />
					<Command.List class="max-h-60">
						{#if availablePPAs.length === 0 && !isCustomPPAEntry}
							<Command.Empty>No matching PPAs found.</Command.Empty>
						{/if}
						<Command.Group heading="Predefined PPAs">
							{#each availablePPAs as ppa (ppa.id)}
								{@const colors = categoryColors[ppa.category]}
								{@const projectTypeName = getProjectTypeName(ppa.projectTypeId)}
								<Command.Item value={ppa.id} onSelect={() => addPPA(ppa.id)}>
									<div class="flex w-full flex-col gap-0.5">
										<div class="flex items-center gap-2">
											<span
												class="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium {colors.bg} {colors.text}"
											>
												{categoryLabels[ppa.category]}
											</span>
											<span class="truncate">{ppa.name}</span>
										</div>
										{#if projectTypeName}
											<span class="ml-1 text-xs text-muted-foreground">
												→ {projectTypeName}
											</span>
										{/if}
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
						{#if isCustomPPAEntry}
							<Command.Separator />
							<Command.Group>
								<Command.Item value="__custom_ppa__" onSelect={openCustomPPADialog}>
									<Plus class="mr-2 size-4" />
									Add custom: "{ppaSearch}"
								</Command.Item>
							</Command.Group>
						{/if}
					</Command.List>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</FormSection>
</div>

<!-- Custom Issue Dialog -->
<Dialog.Root bind:open={customIssueDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Custom Issue</Dialog.Title>
			<Dialog.Description>
				Create a custom issue with a required category for better organization.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="custom-issue-name">Issue Name</Label>
				<Input
					id="custom-issue-name"
					bind:value={customIssueName}
					placeholder="Enter issue description..."
				/>
			</div>
			<div class="space-y-2">
				<Label for="custom-issue-category">Category</Label>
				<Select.Root type="single" bind:value={customIssueCategory}>
					<Select.Trigger class="w-full">
						{categoryLabels[customIssueCategory] || 'Select category...'}
					</Select.Trigger>
					<Select.Content>
						{#each categoryOptions as cat (cat.value)}
							{@const colors = categoryColors[cat.value]}
							<Select.Item value={cat.value}>
								<span class="flex items-center gap-2">
									<span class="size-2 rounded-full {colors.bg}"></span>
									{cat.label}
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (customIssueDialogOpen = false)}>
				Cancel
			</Button>
			<Button type="button" onclick={saveCustomIssue} disabled={!customIssueName.trim()}>
				<Check class="mr-2 size-4" />
				Add Issue
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Custom PPA Dialog -->
<Dialog.Root bind:open={customPPADialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Add Custom PPA</Dialog.Title>
			<Dialog.Description>
				Create a custom PPA with category and optional project type link.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="custom-ppa-name">PPA Name</Label>
				<Input
					id="custom-ppa-name"
					bind:value={customPPAName}
					placeholder="Enter PPA description..."
				/>
			</div>
			<div class="space-y-2">
				<Label for="custom-ppa-category">Category</Label>
				<Select.Root type="single" bind:value={customPPACategory}>
					<Select.Trigger class="w-full">
						{categoryLabels[customPPACategory] || 'Select category...'}
					</Select.Trigger>
					<Select.Content>
						{#each categoryOptions as cat (cat.value)}
							{@const colors = categoryColors[cat.value]}
							<Select.Item value={cat.value}>
								<span class="flex items-center gap-2">
									<span class="size-2 rounded-full {colors.bg}"></span>
									{cat.label}
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label for="custom-ppa-project-type">Project Type (Optional)</Label>
				<Select.Root
					type="single"
					value={customPPAProjectTypeId?.toString()}
					onValueChange={(v) => (customPPAProjectTypeId = v ? parseInt(v) : undefined)}
				>
					<Select.Trigger class="w-full">
						{customPPAProjectTypeId
							? getProjectTypeName(customPPAProjectTypeId)
							: 'Select project type...'}
					</Select.Trigger>
					<Select.Content>
						{#each projectTypeOptions as pt (pt.value)}
							<Select.Item value={pt.value}>{pt.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<p class="text-xs text-muted-foreground">
					Link this PPA to a project type for future project recommendations.
				</p>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (customPPADialogOpen = false)}>
				Cancel
			</Button>
			<Button type="button" onclick={saveCustomPPA} disabled={!customPPAName.trim()}>
				<Check class="mr-2 size-4" />
				Add PPA
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit Issue Dialog -->
<Dialog.Root bind:open={editIssueDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Issue</Dialog.Title>
			<Dialog.Description>Modify the issue name and category.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="edit-issue-name">Issue Name</Label>
				<Input
					id="edit-issue-name"
					bind:value={editIssueName}
					placeholder="Enter issue description..."
				/>
			</div>
			<div class="space-y-2">
				<Label for="edit-issue-category">Category</Label>
				<Select.Root type="single" bind:value={editIssueCategory}>
					<Select.Trigger class="w-full">
						{categoryLabels[editIssueCategory] || 'Select category...'}
					</Select.Trigger>
					<Select.Content>
						{#each categoryOptions as cat (cat.value)}
							{@const colors = categoryColors[cat.value]}
							<Select.Item value={cat.value}>
								<span class="flex items-center gap-2">
									<span class="size-2 rounded-full {colors.bg}"></span>
									{cat.label}
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (editIssueDialogOpen = false)}>
				Cancel
			</Button>
			<Button type="button" onclick={saveEditedIssue} disabled={!editIssueName.trim()}>
				<Check class="mr-2 size-4" />
				Save Changes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Edit PPA Dialog -->
<Dialog.Root bind:open={editPPADialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit PPA</Dialog.Title>
			<Dialog.Description>Modify the PPA details and project type link.</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="edit-ppa-name">PPA Name</Label>
				<Input id="edit-ppa-name" bind:value={editPPAName} placeholder="Enter PPA description..." />
			</div>
			<div class="space-y-2">
				<Label for="edit-ppa-category">Category</Label>
				<Select.Root type="single" bind:value={editPPACategory}>
					<Select.Trigger class="w-full">
						{categoryLabels[editPPACategory] || 'Select category...'}
					</Select.Trigger>
					<Select.Content>
						{#each categoryOptions as cat (cat.value)}
							{@const colors = categoryColors[cat.value]}
							<Select.Item value={cat.value}>
								<span class="flex items-center gap-2">
									<span class="size-2 rounded-full {colors.bg}"></span>
									{cat.label}
								</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-2">
				<Label for="edit-ppa-project-type">Project Type (Optional)</Label>
				<Select.Root
					type="single"
					value={editPPAProjectTypeId?.toString()}
					onValueChange={(v) => (editPPAProjectTypeId = v ? parseInt(v) : undefined)}
				>
					<Select.Trigger class="w-full">
						{editPPAProjectTypeId
							? getProjectTypeName(editPPAProjectTypeId)
							: 'Select project type...'}
					</Select.Trigger>
					<Select.Content>
						{#each editProjectTypeOptions as pt (pt.value)}
							<Select.Item value={pt.value}>{pt.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<p class="text-xs text-muted-foreground">
					Link this PPA to a project type for future project recommendations.
				</p>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (editPPADialogOpen = false)}>
				Cancel
			</Button>
			<Button type="button" onclick={saveEditedPPA} disabled={!editPPAName.trim()}>
				<Check class="mr-2 size-4" />
				Save Changes
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
