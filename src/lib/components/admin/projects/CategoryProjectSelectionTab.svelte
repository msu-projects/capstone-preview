<script lang="ts">
	import { ComboboxMultiSelect } from '$lib/components/ui/combobox';
	import { FormSection } from '$lib/components/ui/form-section';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import { IMPLEMENTING_AGENCIES } from '$lib/config/agencies';
	import { categories, getProjectTypesByCategory } from '$lib/config/project-categories';
	import type { CategoryKey, ProjectType } from '$lib/types';
	import { cn } from '$lib/utils';
	import {
		Briefcase,
		Building2,
		FolderOpen,
		GraduationCap,
		HeartPulse,
		Info,
		Leaf,
		Sprout
	} from '@lucide/svelte';

	let {
		title = $bindable(),
		description = $bindable(),
		selectedCategory = $bindable<CategoryKey | ''>(''),
		selectedProjectType = $bindable<number | undefined>(undefined),
		implementingAgencies = $bindable([])
	} = $props<{
		title: string;
		description: string;
		selectedCategory: CategoryKey | '';
		selectedProjectType: number | undefined;
		implementingAgencies: string[];
	}>();

	const iconMap: Record<string, any> = {
		'building-2': Building2,
		sprout: Sprout,
		'graduation-cap': GraduationCap,
		'heart-pulse': HeartPulse,
		briefcase: Briefcase,
		leaf: Leaf
	};

	const projectTypes = $derived(
		selectedCategory ? getProjectTypesByCategory(selectedCategory) : []
	);

	const selectedCategoryData = $derived(categories.find((c) => c.key === selectedCategory));

	const selectedProjectTypeData = $derived(
		selectedProjectType ? projectTypes.find((pt) => pt.id === selectedProjectType) : undefined
	);

	let selectedProjectTypeValue = $state<string>(selectedProjectType?.toString() ?? '');

	let previousCategory = $state<CategoryKey | ''>(selectedCategory);
	let isInitialLoad = $state(true);

	$effect(() => {
		if (selectedCategory !== previousCategory) {
			// Skip reset on initial load to preserve the project type from edit mode
			if (!isInitialLoad) {
				// Reset project type when category changes
				selectedProjectType = undefined;
				selectedProjectTypeValue = '';
			}
			previousCategory = selectedCategory;
		}
		// Mark as no longer initial load after first effect run
		isInitialLoad = false;
	});

	$effect(() => {
		if (selectedProjectType) {
			selectedProjectTypeValue = selectedProjectType.toString();
		}
	});

	$effect(() => {
		if (selectedProjectTypeValue && selectedProjectTypeValue !== selectedProjectType?.toString()) {
			selectedProjectType = Number(selectedProjectTypeValue);
		}
	});

	function handleCategoryChange(value: CategoryKey | undefined) {
		if (value) {
			selectedCategory = value;
			// Reset project type when category changes
			selectedProjectType = undefined;
		}
	}

	function handleProjectTypeChange(value: number | undefined) {
		selectedProjectType = value;
	}

	// Auto-generate title based on category and project type
	function generateDefaultTitle(categoryKey: CategoryKey, projectType: ProjectType): string {
		const typeName = projectType.name;
		const lowerTypeName = typeName.toLowerCase();

		// Check if the type name already contains an action verb
		const hasActionVerb =
			lowerTypeName.includes('distribution') ||
			lowerTypeName.includes('provision') ||
			lowerTypeName.includes('installation') ||
			lowerTypeName.includes('construction') ||
			lowerTypeName.includes('training') ||
			lowerTypeName.includes('program') ||
			lowerTypeName.includes('support') ||
			lowerTypeName.includes('dispersal') ||
			lowerTypeName.includes('production') ||
			lowerTypeName.includes('missions') ||
			lowerTypeName.includes('campaigns');

		// If the name already has an action, use it as-is
		if (hasActionVerb) {
			return typeName;
		}

		// Otherwise, determine the appropriate action verb
		let action = '';

		// Check specific keywords in the type name to determine best action
		if (
			lowerTypeName.includes('classroom') ||
			lowerTypeName.includes('building') ||
			lowerTypeName.includes('road') ||
			lowerTypeName.includes('bridge') ||
			lowerTypeName.includes('center') ||
			lowerTypeName.includes('station') ||
			lowerTypeName.includes('facilities')
		) {
			action = 'Construction';
		} else if (
			lowerTypeName.includes('system') ||
			lowerTypeName.includes('lighting') ||
			lowerTypeName.includes('laboratory')
		) {
			action = 'Installation';
		} else if (
			lowerTypeName.includes('seedling') ||
			lowerTypeName.includes('livestock') ||
			lowerTypeName.includes('materials') ||
			lowerTypeName.includes('equipment')
		) {
			action = 'Distribution';
		} else if (lowerTypeName.includes('scholarship')) {
			action = 'Provision';
		} else {
			// Default actions by category
			const categoryActionMap: Record<CategoryKey, string> = {
				infrastructure: 'Construction',
				agriculture: 'Implementation',
				education: 'Implementation',
				health: 'Provision',
				livelihood: 'Development',
				environment: 'Implementation'
			};
			action = categoryActionMap[categoryKey] || 'Implementation';
		}

		return `${action} of ${typeName}`;
	}

	// Track if user has manually edited the title
	let userModifiedTitle = $state(false);
	let previousGeneratedTitle = $state('');

	// Auto-generate title when project type is selected
	$effect(() => {
		if (selectedCategory && selectedProjectTypeData) {
			const generatedTitle = generateDefaultTitle(selectedCategory, selectedProjectTypeData);

			// Only update title if:
			// 1. Title is empty, OR
			// 2. Title matches the previous generated title (user hasn't customized it)
			if (!title.trim() || (!userModifiedTitle && title === previousGeneratedTitle)) {
				title = generatedTitle;
				previousGeneratedTitle = generatedTitle;
				userModifiedTitle = false;
			}
		}
	});

	// Track manual title edits
	function handleTitleInput(event: Event) {
		const input = event.target as HTMLInputElement;
		// If user is typing and it differs from the generated title, mark as modified
		if (input.value !== previousGeneratedTitle) {
			userModifiedTitle = true;
		}
	}

	// Check if section is complete
	const isSectionComplete = $derived(
		title.trim() !== '' &&
			description.trim() !== '' &&
			selectedCategory !== '' &&
			selectedProjectType !== undefined
	);
</script>

<FormSection
	title="Category & Project Selection"
	description="Select the project category and specific project type. This determines the performance indicators and target templates."
	icon={FolderOpen}
	variant="blue"
	isComplete={isSectionComplete}
	collapsible={false}
>
	<div class="space-y-6">
		<!-- Category Selection -->
		<div class="space-y-2">
			<Label for="category" class="required">Project Category</Label>
			<Select.Root type="single" name="category" bind:value={selectedCategory}>
				<Select.Trigger class="w-full">
					{selectedCategoryData?.name ?? 'Select project category...'}
				</Select.Trigger>
				<Select.Content>
					{#each categories as category}
						{@const IconComponent = iconMap[category.icon]}
						<Select.Item value={category.key} label={category.name}>
							<div class="flex items-center gap-2">
								{#if IconComponent}
									<IconComponent class="size-4" />
								{/if}
								<span>{category.name}</span>
							</div>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			{#if selectedCategoryData}
				<p class="flex items-start gap-1.5 text-sm text-muted-foreground">
					<Info class="mt-0.5 size-4 shrink-0" />
					{selectedCategoryData.description}
				</p>
			{/if}
		</div>

		<!-- Project Type Selection (Dynamic based on category) -->
		{#if selectedCategory}
			<div class="space-y-2">
				<Label for="project-type" class="required">Project Type</Label>
				<Select.Root type="single" bind:value={selectedProjectTypeValue}>
					<Select.Trigger class="w-full">
						{selectedProjectTypeData?.name ?? 'Select specific project type...'}
					</Select.Trigger>
					<Select.Content>
						{#each projectTypes as projectType}
							<Select.Item value={projectType.id.toString()} label={projectType.name}>
								{projectType.name}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		{/if}

		<!-- Project Title -->
		<div class="space-y-2">
			<Label for="title" class="required">Project Title</Label>
			<Input
				id="title"
				bind:value={title}
				oninput={handleTitleInput}
				placeholder="Enter descriptive project title"
				class={cn('w-full text-sm', title.trim() && 'border-primary/30 bg-primary/5')}
			/>
			<p class="text-xs text-muted-foreground">
				{#if selectedProjectTypeData}
					Auto-generated from category and type. You can customize it as needed.
				{:else}
					Example: "Seedling Distribution Program - Lake Sebu Cluster"
				{/if}
			</p>
		</div>

		<!-- Project Description -->
		<div class="space-y-2">
			<Label for="description" class="required">Project Description</Label>
			<Textarea
				id="description"
				bind:value={description}
				placeholder="Provide a detailed description of the project objectives, scope, and expected outcomes"
				rows={4}
				class={cn('w-full text-sm', description.trim() && 'border-primary/30 bg-primary/5')}
			/>
			<p class="text-xs text-muted-foreground">
				Include key objectives, target outcomes, and how this project addresses sitio needs.
			</p>
		</div>

		<!-- Implementing Agencies -->
		<div class="space-y-2">
			<Label for="implementing-agencies" class="flex items-center gap-2">
				<Building2 class="size-4" />
				Implementing Agencies
			</Label>
			<ComboboxMultiSelect
				bind:values={implementingAgencies}
				options={[...IMPLEMENTING_AGENCIES]}
				placeholder="Search agencies..."
				addLabel="Add Agency"
				emptyMessage="No agencies added yet"
				allowCustom={true}
				variant="list"
			/>
			<p class="text-xs text-muted-foreground">
				Select one or more government offices or agencies responsible for implementing this project.
			</p>
		</div>
	</div>
</FormSection>

<style>
	:global(.required::after) {
		content: ' *';
		color: hsl(var(--destructive));
	}
</style>
