<script lang="ts">
	import { page } from '$app/state';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import {
		CloudUpload,
		Database,
		ExternalLink,
		Folder,
		LayoutDashboard,
		LogOut,
		MapPin,
		Users
	} from '@lucide/svelte';
	import type { Component, ComponentProps } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	interface NavItem {
		title: string;
		url: string;
		icon: Component;
	}

	interface NavGroup {
		title: string;
		items: NavItem[];
	}

	const navGroups: NavGroup[] = [
		{
			title: 'Main',
			items: [{ title: 'Dashboard', url: '/admin', icon: LayoutDashboard }]
		},
		{
			title: 'Data Management',
			items: [
				{ title: 'Sitios', url: '/admin/sitios', icon: MapPin },
				{ title: 'Projects', url: '/admin/projects', icon: Folder },
				{ title: 'Import Data', url: '/admin/import', icon: CloudUpload }
			]
		},
		{
			title: 'System',
			items: [
				{ title: 'Users', url: '/admin/users', icon: Users },
				{ title: 'View Public Portal', url: '/', icon: ExternalLink }
			]
		}
	];

	const user = {
		name: 'Admin User',
		email: 'admin@example.com',
		initials: 'A'
	};

	function handleLogout() {
		console.log('Logout clicked');
	}

	function isActive(url: string): boolean {
		return page.url.pathname === url;
	}
</script>

<Sidebar.Root collapsible="icon" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="data-[state=open]:bg-sidebar-accent">
					<a href="/admin" class="flex items-center gap-2">
						<div
							class="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white"
						>
							<Database class="size-4" />
						</div>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">SC Data Bank</span>
							<span class="truncate text-xs">Admin Portal</span>
						</div>
					</a>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		{#each navGroups as group}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.Menu>
					{#each group.items as item}
						{@const active = isActive(item.url)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton tooltipContent={item.title} isActive={active}>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon class="size-4" />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.Group>
		{/each}
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								size="lg"
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								{...props}
							>
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-blue-600 text-white">
										{user.initials}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.name}</span>
									<span class="truncate text-xs">{user.email}</span>
								</div>
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" side="right" align="end" sideOffset={4}>
						<DropdownMenu.Label class="p-0 font-normal">
							<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Fallback class="rounded-lg bg-blue-600 text-white">
										{user.initials}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">{user.name}</span>
									<span class="truncate text-xs">{user.email}</span>
								</div>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={handleLogout}>
							<LogOut class="size-4" />
							Log out
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
