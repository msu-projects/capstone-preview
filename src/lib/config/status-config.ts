/**
 * Status configuration for projects and sitio need levels
 * Centralizes all status-related display logic (labels, colors, badges)
 */
import type { NeedLevel, ProjectStatus } from '$lib/types';
import { getNeedLevelFromScore } from '$lib/types';

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

// ===== NEED LEVEL CONFIGURATION =====

export interface NeedLevelConfig {
	label: string;
	shortLabel: string;
	bgClass: string;
	textClass: string;
	darkBgClass: string;
	darkTextClass: string;
	badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
}

export const NEED_LEVEL_CONFIG: Record<NeedLevel, NeedLevelConfig> = {
	critical: {
		label: 'Critical Need',
		shortLabel: 'Critical',
		bgClass: 'bg-red-100',
		textClass: 'text-red-700',
		darkBgClass: 'dark:bg-red-900/30',
		darkTextClass: 'dark:text-red-400',
		badgeVariant: 'destructive'
	},
	high: {
		label: 'High Need',
		shortLabel: 'High',
		bgClass: 'bg-orange-100',
		textClass: 'text-orange-700',
		darkBgClass: 'dark:bg-orange-900/30',
		darkTextClass: 'dark:text-orange-400',
		badgeVariant: 'default'
	},
	medium: {
		label: 'Medium Need',
		shortLabel: 'Medium',
		bgClass: 'bg-yellow-100',
		textClass: 'text-yellow-700',
		darkBgClass: 'dark:bg-yellow-900/30',
		darkTextClass: 'dark:text-yellow-400',
		badgeVariant: 'secondary'
	},
	low: {
		label: 'Low Need',
		shortLabel: 'Low',
		bgClass: 'bg-green-100',
		textClass: 'text-green-700',
		darkBgClass: 'dark:bg-green-900/30',
		darkTextClass: 'dark:text-green-400',
		badgeVariant: 'secondary'
	}
};

/**
 * Gets the full need level configuration for a need level
 */
export function getNeedLevelConfig(level: NeedLevel): NeedLevelConfig {
	return NEED_LEVEL_CONFIG[level] ?? NEED_LEVEL_CONFIG.medium;
}

/**
 * Gets the need level configuration from a score (1-10)
 */
export function getNeedLevelConfigFromScore(score: number): NeedLevelConfig {
	const level = getNeedLevelFromScore(score);
	return getNeedLevelConfig(level);
}

/**
 * Gets the combined Tailwind classes for a need level badge
 */
export function getNeedLevelBadgeClasses(level: NeedLevel): string {
	const config = getNeedLevelConfig(level);
	return `${config.bgClass} ${config.textClass} ${config.darkBgClass} ${config.darkTextClass}`;
}

/**
 * Array of all need levels for iteration (ordered by priority)
 */
export const ALL_NEED_LEVELS: NeedLevel[] = ['critical', 'high', 'medium', 'low'];
