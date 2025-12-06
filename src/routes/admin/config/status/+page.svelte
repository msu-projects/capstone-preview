<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import ConfigResetDialog from '$lib/components/admin/config/ConfigResetDialog.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		ALL_NEED_LEVELS,
		ALL_PROJECT_STATUSES,
		getStatusFullConfig,
		hasStatusOverride,
		resetStatusConfig,
		saveStatusConfig,
		type NeedLevelConfig,
		type StatusConfig
	} from '$lib/config/status-config';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { NeedLevel, ProjectStatus } from '$lib/types';
	import type { StatusConfigData } from '$lib/utils/config-storage';
	import { ArrowLeft, RotateCcw, Save } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let config = $state<StatusConfigData | null>(null);
	let hasChanges = $state(false);
	let hasOverride = $state(false);
	let isResetDialogOpen = $state(false);
	let activeTab = $state('project-status');

	const canManageConfig = $derived(authStore.isSuperadmin);

	onMount(() => {
		config = getStatusFullConfig();
		hasOverride = hasStatusOverride();
	});

	function updateProjectStatus(status: ProjectStatus, field: keyof StatusConfig, value: string) {
		if (!config) return;
		config = {
			...config,
			projectStatuses: {
				...config.projectStatuses,
				[status]: {
					...config.projectStatuses[status],
					[field]: value
				}
			}
		};
		hasChanges = true;
	}

	function updateNeedLevel(level: NeedLevel, field: keyof NeedLevelConfig, value: string) {
		if (!config) return;
		config = {
			...config,
			needLevels: {
				...config.needLevels,
				[level]: {
					...config.needLevels[level],
					[field]: value
				}
			}
		};
		hasChanges = true;
	}

	function handleSave() {
		if (!config) return;
		const success = saveStatusConfig(config, 'Updated status configuration');
		if (success) {
			toast.success('Configuration saved successfully');
			hasChanges = false;
			hasOverride = true;
		} else {
			toast.error('Failed to save configuration');
		}
	}

	function handleReset() {
		const success = resetStatusConfig();
		if (success) {
			config = getStatusFullConfig();
			toast.success('Configuration reset to defaults');
			hasChanges = false;
			hasOverride = false;
		} else {
			toast.error('Failed to reset configuration');
		}
		isResetDialogOpen = false;
	}
</script>

<svelte:head>
	<title>Status Configuration | Configuration</title>
</svelte:head>

<div class="flex flex-col">
	<AdminHeader
		title="Status Configuration"
		description="Configure labels and colors for project statuses and need levels"
		breadcrumbs={[{ label: 'Configuration', href: '/admin/config' }, { label: 'Status' }]}
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
		{:else if config}
			<Tabs.Root bind:value={activeTab}>
				<Tabs.List>
					<Tabs.Trigger value="project-status">Project Statuses</Tabs.Trigger>
					<Tabs.Trigger value="need-levels">Need Levels</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="project-status" class="mt-4 space-y-4">
					<Card.Root>
						<Card.Header>
							<Card.Title>Project Status Labels</Card.Title>
							<Card.Description>
								Customize the display labels for each project status
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-4">
							{#each ALL_PROJECT_STATUSES as status}
								{@const statusConfig = config.projectStatuses[status]}
								<div class="rounded-md border border-border/50 p-4">
									<div class="mb-3 flex items-center gap-2">
										<Badge
											class="{statusConfig.bgColor} {statusConfig.textColor} {statusConfig.darkBgColor} {statusConfig.darkTextColor}"
										>
											{statusConfig.label}
										</Badge>
										<code class="text-xs text-muted-foreground">{status}</code>
									</div>
									<div class="grid gap-4 sm:grid-cols-2">
										<div class="space-y-2">
											<Label for="{status}-label">Label</Label>
											<Input
												id="{status}-label"
												value={statusConfig.label}
												onchange={(e) =>
													updateProjectStatus(status, 'label', e.currentTarget.value)}
											/>
										</div>
										<div class="space-y-2">
											<Label for="{status}-bg">Background Class</Label>
											<Input
												id="{status}-bg"
												value={statusConfig.bgColor}
												onchange={(e) =>
													updateProjectStatus(status, 'bgColor', e.currentTarget.value)}
												placeholder="bg-emerald-100"
											/>
										</div>
										<div class="space-y-2">
											<Label for="{status}-text">Text Class</Label>
											<Input
												id="{status}-text"
												value={statusConfig.textColor}
												onchange={(e) =>
													updateProjectStatus(status, 'textColor', e.currentTarget.value)}
												placeholder="text-emerald-700"
											/>
										</div>
										<div class="space-y-2">
											<Label for="{status}-dark-bg">Dark Background Class</Label>
											<Input
												id="{status}-dark-bg"
												value={statusConfig.darkBgColor}
												onchange={(e) =>
													updateProjectStatus(status, 'darkBgColor', e.currentTarget.value)}
												placeholder="dark:bg-emerald-900/30"
											/>
										</div>
									</div>
								</div>
							{/each}
						</Card.Content>
					</Card.Root>
				</Tabs.Content>

				<Tabs.Content value="need-levels" class="mt-4 space-y-4">
					<Card.Root>
						<Card.Header>
							<Card.Title>Need Level Labels</Card.Title>
							<Card.Description>Customize the display labels for sitio need levels</Card.Description
							>
						</Card.Header>
						<Card.Content class="space-y-4">
							{#each ALL_NEED_LEVELS as level}
								{@const levelConfig = config.needLevels[level]}
								<div class="rounded-md border border-border/50 p-4">
									<div class="mb-3 flex items-center gap-2">
										<Badge
											class="{levelConfig.bgClass} {levelConfig.textClass} {levelConfig.darkBgClass} {levelConfig.darkTextClass}"
										>
											{levelConfig.shortLabel}
										</Badge>
										<code class="text-xs text-muted-foreground">{level}</code>
									</div>
									<div class="grid gap-4 sm:grid-cols-2">
										<div class="space-y-2">
											<Label for="{level}-label">Full Label</Label>
											<Input
												id="{level}-label"
												value={levelConfig.label}
												onchange={(e) => updateNeedLevel(level, 'label', e.currentTarget.value)}
											/>
										</div>
										<div class="space-y-2">
											<Label for="{level}-short">Short Label</Label>
											<Input
												id="{level}-short"
												value={levelConfig.shortLabel}
												onchange={(e) =>
													updateNeedLevel(level, 'shortLabel', e.currentTarget.value)}
											/>
										</div>
										<div class="space-y-2">
											<Label for="{level}-bg">Background Class</Label>
											<Input
												id="{level}-bg"
												value={levelConfig.bgClass}
												onchange={(e) => updateNeedLevel(level, 'bgClass', e.currentTarget.value)}
												placeholder="bg-red-100"
											/>
										</div>
										<div class="space-y-2">
											<Label for="{level}-text">Text Class</Label>
											<Input
												id="{level}-text"
												value={levelConfig.textClass}
												onchange={(e) => updateNeedLevel(level, 'textClass', e.currentTarget.value)}
												placeholder="text-red-700"
											/>
										</div>
									</div>
								</div>
							{/each}
						</Card.Content>
					</Card.Root>
				</Tabs.Content>
			</Tabs.Root>
		{:else}
			<Card.Root>
				<Card.Content class="py-8 text-center">
					<p class="text-muted-foreground">Loading configuration...</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>

<ConfigResetDialog
	bind:open={isResetDialogOpen}
	sectionName="Status Configuration"
	onConfirm={handleReset}
	onCancel={() => (isResetDialogOpen = false)}
/>
