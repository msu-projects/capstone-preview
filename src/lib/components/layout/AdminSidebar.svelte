<script lang="ts">
	import { page } from '$app/state';
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

	interface NavLink {
		href: string;
		icon: any;
		label: string;
	}

	interface NavSection {
		title: string;
		links: NavLink[];
	}

	const navSections: NavSection[] = [
		{
			title: 'Main',
			links: [{ href: '/admin', icon: LayoutDashboard, label: 'Dashboard' }]
		},
		{
			title: 'Data Management',
			links: [
				{ href: '/admin/sitios', icon: MapPin, label: 'Sitios' },
				{ href: '/admin/projects', icon: Folder, label: 'Projects' },
				{ href: '/admin/import', icon: CloudUpload, label: 'Import Data' }
			]
		},
		{
			title: 'System',
			links: [
				{ href: '/admin/users', icon: Users, label: 'Users' },
				{ href: '/', icon: ExternalLink, label: 'View Public Portal' }
			]
		}
	];

	function handleLogout() {
		// In a real app, this would handle logout logic
		console.log('Logout clicked');
	}
</script>

<aside class="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
	<!-- Sidebar Header -->
	<div class="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
		<a href="/admin" class="flex items-center gap-2 text-lg font-semibold">
			<Database class="size-5 text-blue-500" />
			<span>SC Data Bank</span>
		</a>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 space-y-6 overflow-y-auto p-4">
		{#each navSections as section}
			<div class="space-y-2">
				<div class="px-3 text-xs font-semibold tracking-wider text-sidebar-foreground/60 uppercase">
					{section.title}
				</div>
				<div class="space-y-1">
					{#each section.links as link}
						{@const isActive = page.url.pathname === link.href}
						<a
							href={link.href}
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors {isActive
								? 'bg-sidebar-primary font-medium text-sidebar-primary-foreground'
								: 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
						>
							<svelte:component this={link.icon} class="size-4" />
							<span>{link.label}</span>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</nav>

	<!-- User Info Footer -->
	<div class="border-t border-sidebar-border p-4">
		<div class="flex items-center gap-3 p-2">
			<div
				class="flex size-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white"
			>
				A
			</div>
			<div class="flex-1 overflow-hidden">
				<div class="truncate text-sm font-medium">Admin User</div>
				<div class="truncate text-xs text-sidebar-foreground/60">Administrator</div>
			</div>
			<button
				onclick={handleLogout}
				class="rounded-md p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
				aria-label="Logout"
			>
				<LogOut class="size-4" />
			</button>
		</div>
	</div>
</aside>
