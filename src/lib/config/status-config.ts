/**
 * Status configuration for projects
 * Centralizes all status-related display logic (labels, colors, badges)
 */
import type { ProjectStatus } from '$lib/types';

export interface StatusConfig {
	label: string;
	badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
	color: string;
	bgColor: string;
	textColor: string;
}

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
	planning: {
		label: 'Planning',
		badgeVariant: 'secondary',
		color: 'hsl(var(--muted-foreground))',
		bgColor: 'bg-slate-100',
		textColor: 'text-slate-700'
	},
	'in-progress': {
		label: 'In Progress',
		badgeVariant: 'outline',
		color: 'hsl(48, 96%, 53%)',
		bgColor: 'bg-amber-100',
		textColor: 'text-amber-700'
	},
	completed: {
		label: 'Completed',
		badgeVariant: 'default',
		color: 'hsl(142, 76%, 36%)',
		bgColor: 'bg-emerald-100',
		textColor: 'text-emerald-700'
	},
	suspended: {
		label: 'Suspended',
		badgeVariant: 'destructive',
		color: 'hsl(0, 72%, 51%)',
		bgColor: 'bg-red-100',
		textColor: 'text-red-700'
	}
};

/**
 * Gets the full status configuration for a project status
 */
export function getStatusConfig(status: ProjectStatus): StatusConfig {
	return PROJECT_STATUS_CONFIG[status] ?? PROJECT_STATUS_CONFIG.planning;
}

/**
 * Gets the display label for a project status
 */
export function getStatusLabel(status: ProjectStatus): string {
	return getStatusConfig(status).label;
}

/**
 * Gets the badge variant for a project status
 */
export function getStatusBadgeVariant(
	status: ProjectStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
	return getStatusConfig(status).badgeVariant;
}

/**
 * Gets the color for a project status (HSL format)
 */
export function getStatusColor(status: ProjectStatus): string {
	return getStatusConfig(status).color;
}

/**
 * Gets the background color class for a project status
 */
export function getStatusBgColor(status: ProjectStatus): string {
	return getStatusConfig(status).bgColor;
}

/**
 * Gets the text color class for a project status
 */
export function getStatusTextColor(status: ProjectStatus): string {
	return getStatusConfig(status).textColor;
}

/**
 * Array of all project statuses for iteration
 */
export const ALL_PROJECT_STATUSES: ProjectStatus[] = [
	'planning',
	'in-progress',
	'completed',
	'suspended'
];
