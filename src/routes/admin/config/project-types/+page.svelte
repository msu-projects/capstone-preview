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
	import * as Table from '$lib/components/ui/table';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		getCategories,
		getNextCategoryId,
		getNextProjectTypeId,
		getProjectTypes,
		hasCategoriesOverride,
		hasProjectTypesOverride,
		resetCategoriesConfig,
		resetProjectTypesConfig,
		saveCategoriesConfig,
		saveProjectTypesConfig
	} from '$lib/config/project-categories';
	import { authStore } from '$lib/stores/auth.svelte';
	import type { Category, PerformanceIndicator, ProjectType } from '$lib/types';
	import { INDICATOR_UNIT_OPTIONS } from '$lib/utils/config-storage';
	import {
		ArrowLeft,
		Briefcase,
		Building2,
		Droplets,
		Edit,
		Folder,
		GraduationCap,
		HeartPulse,
		Home,
		Landmark,
		Leaf,
		Plus,
		RotateCcw,
		Save,
		Shield,
		Sprout,
		Sun,
		Trash2,
		Truck,
		Users,
		Wifi,
		X,
		Zap
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let categories = $state<Category[]>([]);
	let projectTypes = $state<ProjectType[]>([]);
	let hasChanges = $state(false);
	let hasOverride = $state(false);
	let isResetDialogOpen = $state(false);
	let resetTarget = $state<'categories' | 'types' | 'all'>('all');
	let activeTab = $state('categories');

	// Project type dialog
	let isTypeDialogOpen = $state(false);
	let editingType = $state<ProjectType | null>(null);
	let typeForm = $state({
		name: '',
		category_key: '' as string,
		description: '',
		indicators: [] as PerformanceIndicator[]
	});

	// Indicator form
	let newIndicator = $state({
		id: '',
		name: '',
		unit: '',
		description: ''
	});

	// Category dialog
	let isCategoryDialogOpen = $state(false);
	let editingCategory = $state<Category | null>(null);
	let categoryForm = $state({
		key: '',
		name: '',
		description: '',
		icon: ''
	});

	// Common icon suggestions for categories
	const COMMON_ICONS = [
		'building-2',
		'sprout',
		'graduation-cap',
		'heart-pulse',
		'briefcase',
		'leaf',
		'home',
		'users',
		'shield',
		'zap',
		'droplets',
		'sun',
		'truck',
		'wifi',
		'landmark'
	];

	// Map icon names to Lucide components for preview
	const iconMap: Record<string, Component<{ class?: string }>> = {
		'building-2': Building2,
		sprout: Sprout,
		'graduation-cap': GraduationCap,
		'heart-pulse': HeartPulse,
		briefcase: Briefcase,
		leaf: Leaf,
		home: Home,
		users: Users,
		shield: Shield,
		zap: Zap,
		droplets: Droplets,
		sun: Sun,
		truck: Truck,
		wifi: Wifi,
		landmark: Landmark,
		folder: Folder
	};

	const canManageConfig = $derived(authStore.isSuperadmin);
	const categoryMap = $derived(Object.fromEntries(categories.map((c) => [c.key, c])));

	onMount(() => {
		categories = getCategories();
		projectTypes = getProjectTypes();
		hasOverride = hasCategoriesOverride() || hasProjectTypesOverride();
	});

	function openTypeDialog(type?: ProjectType) {
		if (type) {
			editingType = type;
			typeForm = {
				name: type.name,
				category_key: type.category_key,
				description: type.description || '',
				indicators: [...(type.default_indicators ?? [])]
			};
		} else {
			editingType = null;
			typeForm = {
				name: '',
				category_key: categories[0]?.key || 'infrastructure',
				description: '',
				indicators: []
			};
		}
		isTypeDialogOpen = true;
	}

	function addIndicator() {
		if (!newIndicator.id.trim() || !newIndicator.name.trim() || !newIndicator.unit) return;

		// Check for duplicate ID
		if (typeForm.indicators.some((i) => i.id === newIndicator.id.trim())) {
			toast.error('Indicator ID already exists');
			return;
		}

		typeForm.indicators = [
			...typeForm.indicators,
			{
				id: newIndicator.id.trim(),
				name: newIndicator.name.trim(),
				unit: newIndicator.unit,
				description: newIndicator.description.trim()
			}
		];
		newIndicator = { id: '', name: '', unit: '', description: '' };
	}

	function removeIndicator(index: number) {
		typeForm.indicators = typeForm.indicators.filter((_, i) => i !== index);
	}

	function saveProjectType() {
		if (!typeForm.name.trim() || !typeForm.category_key) {
			toast.error('Name and category are required');
			return;
		}

		if (editingType) {
			// Update existing
			projectTypes = projectTypes.map((t) =>
				t.id === editingType!.id
					? {
							...t,
							name: typeForm.name.trim(),
							category_key: typeForm.category_key as Category['key'],
							description: typeForm.description.trim(),
							default_indicators: typeForm.indicators
						}
					: t
			);
		} else {
			// Add new
			const newType: ProjectType = {
				id: getNextProjectTypeId(),
				name: typeForm.name.trim(),
				category_key: typeForm.category_key as Category['key'],
				description: typeForm.description.trim(),
				default_indicators: typeForm.indicators
			};
			projectTypes = [...projectTypes, newType];
		}

		hasChanges = true;
		isTypeDialogOpen = false;
	}

	function deleteProjectType(id: number) {
		projectTypes = projectTypes.filter((t) => t.id !== id);
		hasChanges = true;
	}

	function handleSave() {
		const categoriesSuccess = saveCategoriesConfig({ categories }, 'Updated project categories');
		const typesSuccess = saveProjectTypesConfig({ projectTypes }, 'Updated project types');

		if (categoriesSuccess && typesSuccess) {
			toast.success('Configuration saved successfully');
			hasChanges = false;
			hasOverride = true;
		} else {
			toast.error('Failed to save configuration');
		}
	}

	function handleReset() {
		if (resetTarget === 'categories' || resetTarget === 'all') {
			resetCategoriesConfig();
		}
		if (resetTarget === 'types' || resetTarget === 'all') {
			resetProjectTypesConfig();
		}

		categories = getCategories();
		projectTypes = getProjectTypes();
		toast.success('Configuration reset to defaults');
		hasChanges = false;
		hasOverride = hasCategoriesOverride() || hasProjectTypesOverride();
		isResetDialogOpen = false;
	}

	function getTypesByCategory(key: string) {
		return projectTypes.filter((t) => t.category_key === key);
	}

	// Category CRUD functions
	function generateKeyFromName(name: string): string {
		return name
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '_')
			.replace(/-+/g, '_');
	}

	function openCategoryDialog(category?: Category) {
		if (category) {
			editingCategory = category;
			categoryForm = {
				key: category.key,
				name: category.name,
				description: category.description,
				icon: category.icon
			};
		} else {
			editingCategory = null;
			categoryForm = {
				key: '',
				name: '',
				description: '',
				icon: 'folder'
			};
		}
		isCategoryDialogOpen = true;
	}

	function saveCategory() {
		if (!categoryForm.name.trim()) {
			toast.error('Category name is required');
			return;
		}

		const key = editingCategory ? categoryForm.key : generateKeyFromName(categoryForm.name);

		if (!key) {
			toast.error('Invalid category key');
			return;
		}

		// Check for duplicate key when adding new
		if (!editingCategory && categories.some((c) => c.key === key)) {
			toast.error('A category with this key already exists');
			return;
		}

		if (editingCategory) {
			// Update existing
			categories = categories.map((c) =>
				c.id === editingCategory!.id
					? {
							...c,
							name: categoryForm.name.trim(),
							description: categoryForm.description.trim(),
							icon: categoryForm.icon.trim() || 'folder'
						}
					: c
			);
		} else {
			// Add new
			const newCategory: Category = {
				id: getNextCategoryId(),
				key,
				name: categoryForm.name.trim(),
				description: categoryForm.description.trim(),
				icon: categoryForm.icon.trim() || 'folder'
			};
			categories = [...categories, newCategory];
		}

		hasChanges = true;
		isCategoryDialogOpen = false;
	}

	function canDeleteCategory(key: string): { canDelete: boolean; typeCount: number } {
		const typeCount = getTypesByCategory(key).length;
		return {
			canDelete: typeCount === 0,
			typeCount
		};
	}

	function deleteCategory(key: string) {
		const { canDelete, typeCount } = canDeleteCategory(key);

		if (!canDelete) {
			toast.error(
				`Cannot delete category: ${typeCount} project type${typeCount > 1 ? 's' : ''} are using it. Please reassign or delete them first.`
			);
			return;
		}

		categories = categories.filter((c) => c.key !== key);
		hasChanges = true;
		toast.success('Category deleted');
	}
</script>

<svelte:head>
	<title>Project Types | Configuration</title>
</svelte:head>

<div class="flex flex-col">
	<AdminHeader
		title="Project Categories & Types"
		description="Configure project categories and their associated project types"
	>
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => goto('/admin/config')}>
				<ArrowLeft class="size-4 sm:mr-2" />
				<span class="hidden sm:inline">Back</span>
			</Button>
			{#if hasOverride}
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						resetTarget = 'all';
						isResetDialogOpen = true;
					}}
				>
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
			<div class="grid gap-4 sm:grid-cols-3">
				<Card.Root>
					<Card.Content class="p-4">
						<p class="text-2xl font-bold">{categories.length}</p>
						<p class="text-sm text-muted-foreground">Categories</p>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content class="p-4">
						<p class="text-2xl font-bold">{projectTypes.length}</p>
						<p class="text-sm text-muted-foreground">Project Types</p>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content class="p-4">
						<p class="text-2xl font-bold">
							{projectTypes.reduce((sum, t) => sum + (t.default_indicators?.length ?? 0), 0)}
						</p>
						<p class="text-sm text-muted-foreground">Total Indicators</p>
					</Card.Content>
				</Card.Root>
			</div>

			<Tabs.Root bind:value={activeTab}>
				<Tabs.List>
					<Tabs.Trigger value="categories">Categories</Tabs.Trigger>
					<Tabs.Trigger value="types">Project Types</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="categories" class="mt-4">
					<Card.Root>
						<Card.Header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<Card.Title>Project Categories</Card.Title>
								<Card.Description>Manage project categories and their properties</Card.Description>
							</div>
							<Button size="sm" class="w-full sm:w-auto" onclick={() => openCategoryDialog()}>
								<Plus class="mr-2 size-4" />
								Add Category
							</Button>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head class="w-12">Icon</Table.Head>
										<Table.Head>Name</Table.Head>
										<Table.Head class="hidden md:table-cell">Description</Table.Head>
										<Table.Head class="w-20 text-center">Types</Table.Head>
										<Table.Head class="w-24 text-right">Actions</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each categories as category (category.id)}
										{@const typeCount = getTypesByCategory(category.key).length}
										{@const IconComponent = iconMap[category.icon]}
										<Table.Row>
											<Table.Cell>
												{#if IconComponent}
													<IconComponent class="size-5 text-muted-foreground" />
												{:else}
													<Folder class="size-5 text-muted-foreground" />
												{/if}
											</Table.Cell>
											<Table.Cell class="font-medium">{category.name}</Table.Cell>
											<Table.Cell class="hidden text-muted-foreground md:table-cell">
												{category.description}
											</Table.Cell>
											<Table.Cell class="text-center">
												{typeCount}
											</Table.Cell>
											<Table.Cell class="text-right">
												<div class="flex justify-end gap-1">
													<Button
														variant="ghost"
														size="icon"
														class="size-8"
														onclick={() => openCategoryDialog(category)}
													>
														<Edit class="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														class="size-8 text-destructive"
														onclick={() => deleteCategory(category.key)}
														disabled={typeCount > 0}
														title={typeCount > 0
															? `Cannot delete: ${typeCount} project types using this category`
															: 'Delete category'}
													>
														<Trash2 class="size-4" />
													</Button>
												</div>
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>
				</Tabs.Content>

				<Tabs.Content value="types" class="mt-4 space-y-4">
					<Card.Root>
						<Card.Header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<Card.Title>Project Types</Card.Title>
								<Card.Description>
									Manage project types and their default performance indicators
								</Card.Description>
							</div>
							<Button size="sm" class="w-full sm:w-auto" onclick={() => openTypeDialog()}>
								<Plus class="mr-2 size-4" />
								Add Type
							</Button>
						</Card.Header>
					</Card.Root>

					{#each categories as category (category.id)}
						{@const types = getTypesByCategory(category.key)}
						<Card.Root>
							<Card.Header class="pb-3">
								<Card.Title class="text-base">{category.name}</Card.Title>
								<Card.Description>{types.length} project types</Card.Description>
							</Card.Header>
							<Card.Content>
								{#if types.length === 0}
									<p class="text-sm text-muted-foreground italic">
										No project types in this category.
									</p>
								{:else}
									<div class="space-y-2">
										{#each types as type (type.id)}
											<div
												class="flex items-center justify-between rounded-md border border-border/50 p-3"
											>
												<div class="min-w-0 flex-1">
													<p class="font-medium">{type.name}</p>
													<p class="text-sm text-muted-foreground">
														{type.default_indicators?.length ?? 0} indicators
													</p>
												</div>
												<div class="flex gap-1">
													<Button
														variant="ghost"
														size="icon"
														class="size-8"
														onclick={() => openTypeDialog(type)}
													>
														<Edit class="size-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														class="size-8 text-destructive"
														onclick={() => deleteProjectType(type.id)}
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

<!-- Project Type Dialog -->
<Dialog.Root bind:open={isTypeDialogOpen}>
	<Dialog.Content class="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-2xl">
		<Dialog.Header>
			<Dialog.Title>{editingType ? 'Edit' : 'Add'} Project Type</Dialog.Title>
			<Dialog.Description>
				Configure project type details and default performance indicators.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div class="space-y-2">
					<Label for="type-name">Name *</Label>
					<Input id="type-name" bind:value={typeForm.name} placeholder="Project type name" />
				</div>
				<div class="space-y-2">
					<Label for="type-category">Category *</Label>
					<Select.Root type="single" bind:value={typeForm.category_key}>
						<Select.Trigger id="type-category">
							{categoryMap[typeForm.category_key]?.name || 'Select category'}
						</Select.Trigger>
						<Select.Content>
							{#each categories as cat}
								<Select.Item value={cat.key} label={cat.name}>{cat.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="space-y-2">
				<Label for="type-description">Description</Label>
				<Textarea
					id="type-description"
					bind:value={typeForm.description}
					placeholder="Brief description..."
					rows={2}
				/>
			</div>

			<div class="space-y-3">
				<Label>Default Performance Indicators</Label>

				<!-- Add indicator form -->
				<div class="grid gap-2 rounded-md bg-muted/50 p-3 sm:grid-cols-4">
					<Input
						bind:value={newIndicator.id}
						placeholder="ID (e.g., km_built)"
						class="sm:col-span-1"
					/>
					<Input bind:value={newIndicator.name} placeholder="Name" class="sm:col-span-1" />
					<Select.Root type="single" bind:value={newIndicator.unit}>
						<Select.Trigger class="sm:col-span-1">
							{newIndicator.unit || 'Unit'}
						</Select.Trigger>
						<Select.Content class="max-h-60">
							{#each INDICATOR_UNIT_OPTIONS as unit}
								<Select.Item value={unit} label={unit}>{unit}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Button
						size="sm"
						class="w-full sm:col-span-1"
						onclick={addIndicator}
						disabled={!newIndicator.id || !newIndicator.name || !newIndicator.unit}
					>
						<Plus class="mr-1 size-4" />
						Add
					</Button>
				</div>

				<!-- Indicator list -->
				{#if typeForm.indicators.length > 0}
					<div class="rounded-md border border-border/50">
						{#each typeForm.indicators as indicator, index (indicator.id)}
							<div
								class="flex items-center gap-3 border-b border-border/50 px-3 py-2 last:border-b-0"
							>
								<div class="min-w-0 flex-1">
									<p class="text-sm font-medium">{indicator.name}</p>
									<p class="text-xs text-muted-foreground">
										{indicator.id} • {indicator.unit}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									class="size-7"
									onclick={() => removeIndicator(index)}
								>
									<X class="size-3" />
								</Button>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground italic">No indicators added yet.</p>
				{/if}
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isTypeDialogOpen = false)}>Cancel</Button>
			<Button onclick={saveProjectType}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Category Dialog -->
<Dialog.Root bind:open={isCategoryDialogOpen}>
	<Dialog.Content class="max-w-[95vw] sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>{editingCategory ? 'Edit' : 'Add'} Category</Dialog.Title>
			<Dialog.Description>
				{editingCategory ? 'Update category details.' : 'Create a new project category.'}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4">
			<div class="space-y-2">
				<Label for="category-name">Name *</Label>
				<Input
					id="category-name"
					bind:value={categoryForm.name}
					placeholder="Category name"
					oninput={() => {
						if (!editingCategory) {
							categoryForm.key = generateKeyFromName(categoryForm.name);
						}
					}}
				/>
			</div>

			<div class="space-y-2">
				<Label for="category-key">Key</Label>
				<Input
					id="category-key"
					bind:value={categoryForm.key}
					placeholder="category_key"
					disabled={!!editingCategory}
					class={editingCategory ? 'bg-muted' : ''}
				/>
				<p class="text-xs text-muted-foreground">
					{editingCategory
						? 'Key cannot be changed after creation.'
						: 'Auto-generated from name. You can customize it before saving.'}
				</p>
			</div>

			<div class="space-y-2">
				<Label for="category-description">Description</Label>
				<Textarea
					id="category-description"
					bind:value={categoryForm.description}
					placeholder="Brief description of this category..."
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<Label for="category-icon">Icon</Label>
				<div class="flex items-center gap-3">
					<div class="flex size-12 items-center justify-center rounded-md border bg-muted/50">
						{#if iconMap[categoryForm.icon]}
							{@const PreviewIcon = iconMap[categoryForm.icon]}
							<PreviewIcon class="size-6 text-foreground" />
						{:else}
							<Folder class="size-6 text-muted-foreground" />
						{/if}
					</div>
					<Input
						id="category-icon"
						bind:value={categoryForm.icon}
						placeholder="e.g., building-2, leaf, heart-pulse"
						class="flex-1"
					/>
				</div>
				<div class="grid grid-cols-5 gap-1.5 pt-2 sm:grid-cols-8">
					{#each COMMON_ICONS as icon}
						{@const IconComp = iconMap[icon]}
						<Button
							variant={categoryForm.icon === icon ? 'secondary' : 'outline'}
							size="icon"
							class="size-9"
							onclick={() => (categoryForm.icon = icon)}
							title={icon}
						>
							{#if IconComp}
								<IconComp class="size-4" />
							{/if}
						</Button>
					{/each}
				</div>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isCategoryDialogOpen = false)}>Cancel</Button>
			<Button onclick={saveCategory}>Save</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<ConfigResetDialog
	bind:open={isResetDialogOpen}
	sectionName="Project Categories & Types"
	onConfirm={handleReset}
	onCancel={() => (isResetDialogOpen = false)}
/>
