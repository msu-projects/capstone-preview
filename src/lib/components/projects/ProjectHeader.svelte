<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Project } from '$lib/types';
	import { formatCurrency } from '$lib/utils/formatters';
	import { getCategoryName } from '$lib/utils/project-calculations';

	interface Props {
		project: Project;
	}

	const { project }: Props = $props();
</script>

<!-- Project Header Block -->
<div class="mb-5 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
	<div class="flex-1 space-y-3">
		<div class="flex flex-wrap items-center gap-2">
			<Badge
				variant={project.status === 'in-progress' ? 'default' : 'secondary'}
				class={project.status === 'in-progress'
					? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80'
					: ''}
			>
				{project.status === 'in-progress'
					? 'Ongoing'
					: project.status.charAt(0).toUpperCase() + project.status.slice(1)}
			</Badge>
			<Badge variant="outline" class="bg-blue-50 text-blue-700">
				{getCategoryName(project.category_key)}
			</Badge>
		</div>
		<h1 class="text-3xl leading-tight font-bold tracking-tight text-slate-900">
			{project.title}
		</h1>
	</div>
	<div
		class="flex flex-col items-start gap-1 rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 md:min-w-[200px] md:items-end"
	>
		<span class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Total Budget</span>
		<span class="text-2xl font-bold text-slate-900">{formatCurrency(project.total_budget)}</span>
	</div>
</div>
