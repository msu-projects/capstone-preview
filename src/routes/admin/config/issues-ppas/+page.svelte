<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import ConfigResetDialog from '$lib/components/admin/config/ConfigResetDialog.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		categoryColors,
		categoryLabels,
		getPredefinedIssues,
		getPredefinedPPAs,
		hasIssuesPPAsOverride,
		resetIssuesPPAsConfig,
		saveIssuesPPAsConfig,
		type PredefinedIssue,
		type PredefinedPPA
	} from '$lib/config/issue-ppa-mappings';
	import { getCategories, getProjectTypes } from '$lib/config/project-categories';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { CategoryKey } from '$lib/types';
	import { ArrowLeft, Edit, Plus, RotateCcw, Save, Trash2, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let issues = $state<PredefinedIssue[]>([]);
	let ppas = $state<PredefinedPPA[]>([]);
	let hasChanges = $state(false);
	let hasOverride = $state(false);
	let isResetDialogOpen = $state(false);
	let activeTab = $state('issues');

	// Dialog states
	let isIssueDialogOpen = $state(false);
	let isPPADialogOpen = $state(false);
	let editingIssue = $state<PredefinedIssue | null>(null);
	let editingPPA = $state<PredefinedPPA | null>(null);

	// Form states
	let issueForm = $state({
		id: '',
		name: '',
		category: 'infrastructure' as CategoryKey,
		suggestedPPAIds: [] as string[],
		keywords: [] as string[]
	});

	let ppaForm = $state({
		id: '',
		name: '',
		category: 'infrastructure' as CategoryKey,
		projectTypeId: 1,
		addressesIssueIds: [] as string[],
		keywords: [] as string[]
	});

	let newKeyword = $state('');

	const canManageConfig = $derived(authStore.isSuperadmin);
	const categories = $derived(getCategories());
	const projectTypes = $derived(getProjectTypes());

	onMount(() => {
		issues = getPredefinedIssues();
		ppas = getPredefinedPPAs();
		hasOverride = hasIssuesPPAsOverride();
	});

	// Issue dialog
	function openIssueDialog(issue?: PredefinedIssue) {
		if (issue) {
			editingIssue = issue;
			issueForm = {
				id: issue.id,
				name: issue.name,
				category: issue.category,
				suggestedPPAIds: [...issue.suggestedPPAIds],
				keywords: [...issue.keywords]
			};
		} else {
			editingIssue = null;
			issueForm = {
				id: '',
				name: '',
				category: 'infrastructure',
				suggestedPPAIds: [],
				keywords: []
			};
		}
		isIssueDialogOpen = true;
	}

	function saveIssue() {
		if (!issueForm.id.trim() || !issueForm.name.trim()) {
			toast.error('ID and name are required');
			return;
		}

		const issue: PredefinedIssue = {
			id: issueForm.id.trim(),
			name: issueForm.name.trim(),
			category: issueForm.category,
			suggestedPPAIds: issueForm.suggestedPPAIds,
			keywords: issueForm.keywords
		};

		if (editingIssue) {
			issues = issues.map((i) => (i.id === editingIssue!.id ? issue : i));
		} else {
			if (issues.some((i) => i.id === issue.id)) {
				toast.error('Issue ID already exists');
				return;
			}
			issues = [...issues, issue];
		}

		hasChanges = true;
		isIssueDialogOpen = false;
	}

	function deleteIssue(id: string) {
		issues = issues.filter((i) => i.id !== id);
		hasChanges = true;
	}

	// PPA dialog
	function openPPADialog(ppa?: PredefinedPPA) {
		if (ppa) {
			editingPPA = ppa;
			ppaForm = {
				id: ppa.id,
				name: ppa.name,
				category: ppa.category,
				projectTypeId: ppa.projectTypeId,
				addressesIssueIds: [...ppa.addressesIssueIds],
				keywords: [...ppa.keywords]
			};
		} else {
			editingPPA = null;
			ppaForm = {
				id: '',
				name: '',
				category: 'infrastructure',
				projectTypeId: projectTypes[0]?.id || 1,
				addressesIssueIds: [],
				keywords: []
			};
		}
		isPPADialogOpen = true;
	}

	function savePPA() {
		if (!ppaForm.id.trim() || !ppaForm.name.trim()) {
			toast.error('ID and name are required');
			return;
		}

		const ppa: PredefinedPPA = {
			id: ppaForm.id.trim(),
			name: ppaForm.name.trim(),
			category: ppaForm.category,
			projectTypeId: ppaForm.projectTypeId,
			addressesIssueIds: ppaForm.addressesIssueIds,
			keywords: ppaForm.keywords
		};

		if (editingPPA) {
			ppas = ppas.map((p) => (p.id === editingPPA!.id ? ppa : p));
		} else {
			if (ppas.some((p) => p.id === ppa.id)) {
				toast.error('PPA ID already exists');
				return;
			}
			ppas = [...ppas, ppa];
		}

		hasChanges = true;
		isPPADialogOpen = false;
	}

	function deletePPA(id: string) {
		ppas = ppas.filter((p) => p.id !== id);
		hasChanges = true;
	}

	// Keyword management
	function addKeyword(target: 'issue' | 'ppa') {
		if (!newKeyword.trim()) return;
		if (target === 'issue') {
			if (!issueForm.keywords.includes(newKeyword.trim())) {
				issueForm.keywords = [...issueForm.keywords, newKeyword.trim()];
			}
		} else {
			if (!ppaForm.keywords.includes(newKeyword.trim())) {
				ppaForm.keywords = [...ppaForm.keywords, newKeyword.trim()];
			}
		}
		newKeyword = '';
	}

	function removeKeyword(target: 'issue' | 'ppa', keyword: string) {
		if (target === 'issue') {
			issueForm.keywords = issueForm.keywords.filter((k) => k !== keyword);
		} else {
			ppaForm.keywords = ppaForm.keywords.filter((k) => k !== keyword);
		}
	}

	// Save/Reset
	function handleSave() {
		const success = saveIssuesPPAsConfig(
			{ predefinedIssues: issues, predefinedPPAs: ppas },
			'Updated issues and PPAs'
		);
		if (success) {
			toast.success('Configuration saved successfully');
			hasChanges = false;
			hasOverride = true;
		} else {
			toast.error('Failed to save configuration');
		}
	}

	function handleReset() {
		resetIssuesPPAsConfig();
		issues = getPredefinedIssues();
		ppas = getPredefinedPPAs();
		toast.success('Configuration reset to defaults');
		hasChanges = false;
		hasOverride = false;
		isResetDialogOpen = false;
	}

	function getIssuesByCategory(category: CategoryKey) {
		return issues.filter((i) => i.category === category);
	}

	function getPPAsByCategory(category: CategoryKey) {
		return ppas.filter((p) => p.category === category);
	}

	function getProjectTypeName(id: number) {
		return projectTypes.find((t) => t.id === id)?.name || 'Unknown';
	}
</script>

<svelte:head>
	<title>Issues & PPAs | Configuration</title>
</svelte:head>

<div class="flex flex-col">
	<AdminHeader
		title="Issues & PPAs"
		description="Configure predefined community issues and Programs/Projects/Activities"
	>
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => goto('/admin/config')}>
				<ArrowLeft class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Back</span>
			</Button>
			{#if hasOverride}
				<Button variant="outline" size="sm" onclick={() => (isResetDialogOpen = true)}>
					<RotateCcw class="size-4 sm:mr-2" />
					<span class="hidden sm:inline">Reset</span>
				</Button>
			{/if}
			<Button size="sm" onclick={handleSave} disabled={!hasChanges || !canManageConfig}>
				<Save class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Save Changes</span>
			</Button>
		{/snippet}
		{#snippet badges()}
			{#if hasOverride}
				<Badge variant="outline" class="text-amber-600 dark:text-amber-400">Customized</Badge>
			{/if}
			{#if hasChanges}
				<Badge variant="outline" class="text-blue-600 dark:text-blue-400">Unsaved Changes</Badge>
			{/if}
		{/snippet}
	</AdminHeader>

	<div class="flex flex-col gap-6 p-4 md:p-6">
		{#if !canManageConfig}
			<Card.Root>
				<Card.Content class="py-8 text-center">
					<p class="text-muted-foreground">
						You need superadmin privileges to manage configuration.
					</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<!-- Stats -->
			<div class="grid gap-4 sm:grid-cols-2">
				<Card.Root>
					<Card.Content class="p-4">
						<p class="text-2xl font-bold">{issues.length}</p>
						<p class="text-sm text-muted-foreground">Predefined Issues</p>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content class="p-4">
						<p class="text-2xl font-bold">{ppas.length}</p>
						<p class="text-sm text-muted-foreground">Predefined PPAs</p>
					</Card.Content>
				</Card.Root>
			</div>

			<Tabs.Root bind:value={activeTab}>
				<Tabs.List>
					<Tabs.Trigger value="issues">Issues ({issues.length})</Tabs.Trigger>
					<Tabs.Trigger value="ppas">PPAs ({ppas.length})</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="issues" class="mt-4 space-y-4">
					<Card.Root>
						<Card.Header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<Card.Title>Predefined Issues</Card.Title>
								<Card.Description>Community issues that can be assigned to sitios</Card.Description>
							</div>
							<Button size="sm" class="w-full sm:w-auto" onclick={() => openIssueDialog()}>
								<Plus class="mr-2 size-4" />
								Add Issue
							</Button>
						</Card.Header>
					</Card.Root>

					{#each Object.keys(categoryLabels) as catKey}
						{@const category = catKey as CategoryKey}
						{@const catIssues = getIssuesByCategory(category)}
						{@const colors = categoryColors[category]}
						<Card.Root>
							<Card.Header class="pb-3">
								<div class="flex items-center gap-2">
									<Badge class="{colors.bg} {colors.text}">{categoryLabels[category]}</Badge>
									<span class="text-sm text-muted-foreground">{catIssues.length} issues</span>
								</div>
							</Card.Header>
							<Card.Content>
								{#if catIssues.length === 0}
									<p class="text-sm text-muted-foreground italic">No issues in this category.</p>
								{:else}
									<div class="space-y-2">
										{#each catIssues as issue (issue.id)}
											<div
												class="flex items-center justify-between rounded-md border border-border/50 p-3"
											>
												<div class="min-w-0 flex-1">
													<p class="font-medium">{issue.name}</p>
													<p class="text-xs text-muted-foreground">{issue.id}</p>
												</div>
												<div class="flex gap-1">
													<Button
														variant="ghost"
														size="icon"
														class="size-8"
														onclick={() => openIssueDialog(issue)}
													>
														<Edit class="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														class="size-8 text-destructive"
														onclick={() => deleteIssue(issue.id)}
													>
														<Trash2 class="size-4" />
													</Button>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</Card.Content>
						</Card.Root>
					{/each}
				</Tabs.Content>

				<Tabs.Content value="ppas" class="mt-4 space-y-4">
					<Card.Root>
						<Card.Header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<Card.Title>Predefined PPAs</Card.Title>
								<Card.Description
									>Programs, Projects, and Activities that address issues</Card.Description
								>
							</div>
							<Button size="sm" class="w-full sm:w-auto" onclick={() => openPPADialog()}>
								<Plus class="mr-2 size-4" />
								Add PPA
							</Button>
						</Card.Header>
					</Card.Root>

					{#each Object.keys(categoryLabels) as catKey}
						{@const category = catKey as CategoryKey}
						{@const catPPAs = getPPAsByCategory(category)}
						{@const colors = categoryColors[category]}
						<Card.Root>
							<Card.Header class="pb-3">
								<div class="flex items-center gap-2">
									<Badge class="{colors.bg} {colors.text}">{categoryLabels[category]}</Badge>
									<span class="text-sm text-muted-foreground">{catPPAs.length} PPAs</span>
								</div>
							</Card.Header>
							<Card.Content>
								{#if catPPAs.length === 0}
									<p class="text-sm text-muted-foreground italic">No PPAs in this category.</p>
								{:else}
									<div class="space-y-2">
										{#each catPPAs as ppa (ppa.id)}
											<div
												class="flex items-center justify-between rounded-md border border-border/50 p-3"
											>
												<div class="min-w-0 flex-1">
													<p class="font-medium">{ppa.name}</p>
													<p class="text-xs text-muted-foreground">
														{ppa.id} • {getProjectTypeName(ppa.projectTypeId)}
													</p>
												</div>
												<div class="flex gap-1">
													<Button
														variant="ghost"
														size="icon"
														class="size-8"
														onclick={() => openPPADialog(ppa)}
													>
														<Edit class="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														class="size-8 text-destructive"
														onclick={() => deletePPA(ppa.id)}
													>
														<Trash2 class="size-4" />
													</Button>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</Card.Content>
						</Card.Root>
					{/each}
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	</div>
</div>

<!-- Issue Dialog -->
<Dialog.Root bind:open={isIssueDialogOpen}>
	<Dialog.Content class="max-w-[95vw] sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{editingIssue ? 'Edit' : 'Add'} Issue</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="issue-id">ID *</Label>
				<Input
					id="issue-id"
					bind:value={issueForm.id}
					placeholder="issue_water_supply"
					disabled={!!editingIssue}
				/>
			</div>

			<div class="space-y-2">
				<Label for="issue-name">Name *</Label>
				<Input
					id="issue-name"
					bind:value={issueForm.name}
					placeholder="Lack of potable water supply"
				/>
			</div>

			<div class="space-y-2">
				<Label>Category *</Label>
				<Select.Root type="single" bind:value={issueForm.category}>
					<Select.Trigger>
						{categoryLabels[issueForm.category]}
					</Select.Trigger>
					<Select.Content>
						{#each Object.keys(categoryLabels) as catKey}
							<Select.Item value={catKey} label={categoryLabels[catKey as CategoryKey]}>
								{categoryLabels[catKey as CategoryKey]}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label>Keywords</Label>
				<div class="flex gap-2">
					<Input
						bind:value={newKeyword}
						placeholder="Add keyword..."
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword('issue'))}
					/>
					<Button size="sm" variant="outline" onclick={() => addKeyword('issue')}>Add</Button>
				</div>
				{#if issueForm.keywords.length > 0}
					<div class="flex flex-wrap gap-1">
						{#each issueForm.keywords as keyword}
							<Badge variant="secondary" class="gap-1">
								{keyword}
								<button type="button" onclick={() => removeKeyword('issue', keyword)}>
									<X class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isIssueDialogOpen = false)}>Cancel</Button>
			<Button onclick={saveIssue}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- PPA Dialog -->
<Dialog.Root bind:open={isPPADialogOpen}>
	<Dialog.Content class="max-w-[95vw] sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{editingPPA ? 'Edit' : 'Add'} PPA</Dialog.Title>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="ppa-id">ID *</Label>
				<Input
					id="ppa-id"
					bind:value={ppaForm.id}
					placeholder="ppa_water_system"
					disabled={!!editingPPA}
				/>
			</div>

			<div class="space-y-2">
				<Label for="ppa-name">Name *</Label>
				<Input id="ppa-name" bind:value={ppaForm.name} placeholder="Water System Installation" />
			</div>

			<div class="space-y-2">
				<Label>Category *</Label>
				<Select.Root type="single" bind:value={ppaForm.category}>
					<Select.Trigger>
						{categoryLabels[ppaForm.category]}
					</Select.Trigger>
					<Select.Content>
						{#each Object.keys(categoryLabels) as catKey}
							<Select.Item value={catKey} label={categoryLabels[catKey as CategoryKey]}>
								{categoryLabels[catKey as CategoryKey]}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label>Project Type *</Label>
				<Select.Root
					type="single"
					value={String(ppaForm.projectTypeId)}
					onValueChange={(v) => v && (ppaForm.projectTypeId = Number(v))}
				>
					<Select.Trigger>
						{getProjectTypeName(ppaForm.projectTypeId)}
					</Select.Trigger>
					<Select.Content class="max-h-60">
						{#each projectTypes as type}
							<Select.Item value={String(type.id)} label={type.name}>{type.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label>Keywords</Label>
				<div class="flex gap-2">
					<Input
						bind:value={newKeyword}
						placeholder="Add keyword..."
						onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword('ppa'))}
					/>
					<Button size="sm" variant="outline" onclick={() => addKeyword('ppa')}>Add</Button>
				</div>
				{#if ppaForm.keywords.length > 0}
					<div class="flex flex-wrap gap-1">
						{#each ppaForm.keywords as keyword}
							<Badge variant="secondary" class="gap-1">
								{keyword}
								<button type="button" onclick={() => removeKeyword('ppa', keyword)}>
									<X class="size-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isPPADialogOpen = false)}>Cancel</Button>
			<Button onclick={savePPA}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<ConfigResetDialog
	bind:open={isResetDialogOpen}
	sectionName="Issues & PPAs"
	onConfirm={handleReset}
	onCancel={() => (isResetDialogOpen = false)}
/>
