<script lang="ts">
	import { Banknote, FileText, MapPin, TrendingUp } from '@lucide/svelte';

	interface Props {
		activeTab: string;
		onTabChange: (tab: string) => void;
	}

	const { activeTab, onTabChange }: Props = $props();
</script>

<!-- Tab Navigation -->
<div class="mb-6 border-b border-slate-200 dark:border-slate-700">
	<nav class="flex space-x-8" aria-label="Tabs">
		<button
			onclick={() => onTabChange('overview')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium {activeTab ===
			'overview'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}"
		>
			<FileText
				class="size-4 {activeTab === 'overview'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Overview
		</button>
		<button
			onclick={() => onTabChange('financials')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium {activeTab ===
			'financials'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}"
		>
			<Banknote
				class="size-4 {activeTab === 'financials'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Financials
		</button>
		<button
			onclick={() => onTabChange('locations')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium {activeTab ===
			'locations'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}"
		>
			<MapPin
				class="size-4 {activeTab === 'locations'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Sitios & Locations
		</button>
		<button
			onclick={() => onTabChange('monitoring')}
			class="group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium {activeTab ===
			'monitoring'
				? 'border-blue-600 text-blue-600'
				: 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'}"
		>
			<TrendingUp
				class="size-4 {activeTab === 'monitoring'
					? 'text-blue-600'
					: 'text-slate-400 group-hover:text-slate-500'}"
			/>
			Monthly Monitoring
		</button>
	</nav>
</div>
