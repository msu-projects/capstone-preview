<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminHeader from '$lib/components/admin/AdminHeader.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { hasIssuesPPAsOverride } from '$lib/config/issue-ppa-mappings';
	import { hasLocationsOverride } from '$lib/config/location-data';
	import { hasCategoriesOverride, hasProjectTypesOverride } from '$lib/config/project-categories';
	import { hasSitioOptionsOverride } from '$lib/config/sitio-options';
	import { hasStatusOverride } from '$lib/config/status-config';
	import { authStore } from '$lib/stores/auth.svelte';
	import {
		ChevronRight,
		FileText,
		FolderCog,
		ListChecks,
		MapPin,
		Palette,
		Settings2
	} from '@lucide/svelte';

	interface ConfigSection {
		id: string;
		title: string;
		description: string;
		icon: typeof Settings2;
		href: string;
		hasOverride: () => boolean;
		items: string[];
	}

	const configSections: ConfigSection[] = [
		{
			id: 'sitio-options',
			title: 'Sitio Form Options',
			description:
				'Dropdown options for sitio forms (ethnicities, religions, employment types, crops, etc.)',
			icon: ListChecks,
			href: '/admin/config/sitio-options',
			hasOverride: hasSitioOptionsOverride,
			items: ['Ethnicities', 'Religions', 'Employment Types', 'Crops', 'Livestock', 'And more...']
		},
		{
			id: 'locations',
			title: 'Location Data',
			description: 'Municipalities and barangays in South Cotabato',
			icon: MapPin,
			href: '/admin/config/locations',
			hasOverride: hasLocationsOverride,
			items: ['Municipalities', 'Barangays']
		},
		{
			id: 'project-types',
			title: 'Project Categories & Types',
			description:
				'Project categories and their associated project types with performance indicators',
			icon: FolderCog,
			href: '/admin/config/project-types',
			hasOverride: () => hasCategoriesOverride() || hasProjectTypesOverride(),
			items: ['6 Categories', '37 Project Types', 'Performance Indicators']
		},
		{
			id: 'issues-ppas',
			title: 'Issues & PPAs',
			description:
				'Predefined community issues, Programs/Projects/Activities, and their relationships',
			icon: FileText,
			href: '/admin/config/issues-ppas',
			hasOverride: hasIssuesPPAsOverride,
			items: ['Predefined Issues', 'Predefined PPAs', 'Issue-PPA Mappings']
		},
		{
			id: 'status',
			title: 'Status Configuration',
			description: 'Labels and colors for project statuses and need levels',
			icon: Palette,
			href: '/admin/config/status',
			hasOverride: hasStatusOverride,
			items: ['Project Statuses', 'Need Levels', 'Colors & Badges']
		}
	];

	const canManageConfig = $derived(authStore.isSuperadmin);
</script>

<svelte:head>
	<title>Configuration | Admin</title>
</svelte:head>

<div class="flex flex-col">
	<AdminHeader
		title="System Configuration"
		description="Manage application settings and dropdown options"
	/>

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
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each configSections as section}
					<Card.Root
						class="h-full cursor-pointer transition-colors hover:border-primary/50"
						onclick={() => goto(section.href)}
					>
						<Card.Header class="pb-2">
							<div class="flex items-start justify-between">
								<div
									class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
								>
									<section.icon class="size-5" />
								</div>
								{#if section.hasOverride()}
									<Badge variant="outline" class="text-amber-600 dark:text-amber-400"
										>Customized</Badge
									>
								{/if}
							</div>
							<Card.Title class="text-lg">{section.title}</Card.Title>
							<Card.Description>{section.description}</Card.Description>
						</Card.Header>
						<Card.Content class="flex-1">
							<div class="flex flex-wrap gap-1">
								{#each section.items as item}
									<Badge variant="secondary" class="text-xs">{item}</Badge>
								{/each}
							</div>
						</Card.Content>
						<Card.Footer class="pt-0">
							<Button variant="ghost" class="ml-auto gap-1">
								Configure
								<ChevronRight class="size-4" />
							</Button>
						</Card.Footer>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</div>
</div>
