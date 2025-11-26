<script lang="ts">
	import { FileText, Users, Briefcase, Home, Heart, FolderKanban } from '@lucide/svelte';

	interface Props {
		activeTab: string;
		onTabChange: (tab: string) => void;
	}

	const { activeTab, onTabChange }: Props = $props();
</script>

<!-- Tab Navigation -->
<div class="mb-6 border-b border-slate-200">
	<nav class="flex space-x-8 overflow-x-auto" aria-label="Tabs">
		<button
			onclick={() => onTabChange('overview')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {activeTab ===
			'overview'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
		>
			<FileText
				class="size-4 {activeTab === 'overview'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Overview
		</button>
		<button
			onclick={() => onTabChange('demographics')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {activeTab ===
			'demographics'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
		>
			<Users
				class="size-4 {activeTab === 'demographics'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Demographics
		</button>
		<button
			onclick={() => onTabChange('economic')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {activeTab ===
			'economic'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
		>
			<Briefcase
				class="size-4 {activeTab === 'economic'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Economic & Livelihoods
		</button>
		<button
			onclick={() => onTabChange('infrastructure')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {activeTab ===
			'infrastructure'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
		>
			<Home
				class="size-4 {activeTab === 'infrastructure'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Infrastructure & Housing
		</button>
		<button
			onclick={() => onTabChange('services')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {activeTab ===
			'services'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
		>
			<Heart
				class="size-4 {activeTab === 'services'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Social Services
		</button>
		<button
			onclick={() => onTabChange('projects')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap {activeTab ===
			'projects'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}"
		>
			<FolderKanban
				class="size-4 {activeTab === 'projects'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Related Projects
		</button>
	</nav>
</div>
