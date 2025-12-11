/**
 * Status configuration for projects and sitio need levels
 * Centralizes all status-related display logic (labels, colors, badges)
 *
 * NOTE: These are default values. Admins can customize via the Configuration page.
 * Use the getter functions to get values with overrides.
 */
import type { NeedLevel, ProjectStatus } from '$lib/types';
import { getNeedLevelFromScore } from '$lib/types';
import {
	CONFIG_STORAGE_KEYS,
	getConfigWithOverrides,
	hasConfigOverride,
	resetConfigToDefault,
	saveConfigOverride,
	type StatusConfigData
} from '$lib/utils/config-storage';

// ===== TYPES =====

export interface StatusConfig {
	label: string;
	badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
	color: string;
	bgColor: string;
	textColor: string;
	darkBgColor: string;
	darkTextColor: string;
}

export interface NeedLevelConfig {
	label: string;
	shortLabel: string;
	bgClass: string;
	textClass: string;
	darkBgClass: string;
	darkTextClass: string;
	badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
}

// ===== DEFAULT PROJECT STATUS CONFIGURATION =====

const DEFAULT_PROJECT_STATUS_CONFIG: Record<ProjectStatus, StatusConfig> = {
	preparation: {
		label: 'Preparation',
		badgeVariant: 'secondary',
		color: 'hsl(var(--muted-foreground))',
		bgColor: 'bg-slate-100',
		textColor: 'text-slate-700',
		darkBgColor: 'dark:bg-slate-800',
		darkTextColor: 'dark:text-slate-300'
	},
	ongoing: {
		label: 'On Going',
		badgeVariant: 'outline',
		color: 'hsl(48, 96%, 53%)',
		bgColor: 'bg-amber-100',
		textColor: 'text-amber-700',
		darkBgColor: 'dark:bg-amber-900/30',
		darkTextColor: 'dark:text-amber-400'
	},
	completed: {
		label: 'Completed',
		badgeVariant: 'default',
		color: 'hsl(142, 76%, 36%)',
		bgColor: 'bg-emerald-100',
		textColor: 'text-emerald-700',
		darkBgColor: 'dark:bg-emerald-900/30',
		darkTextColor: 'dark:text-emerald-400'
	},
	delayed: {
		label: 'Delayed',
		badgeVariant: 'destructive',
		color: 'hsl(25, 95%, 53%)',
		bgColor: 'bg-orange-100',
		textColor: 'text-orange-700',
		darkBgColor: 'dark:bg-orange-900/30',
		darkTextColor: 'dark:text-orange-400'
	},
	'non-completion': {
		label: 'Non-completion',
		badgeVariant: 'destructive',
		color: 'hsl(0, 72%, 51%)',
		bgColor: 'bg-red-100',
		textColor: 'text-red-700',
		darkBgColor: 'dark:bg-red-900/30',
		darkTextColor: 'dark:text-red-400'
	}
};

// ===== DEFAULT NEED LEVEL CONFIGURATION =====

const DEFAULT_NEED_LEVEL_CONFIG: Record<NeedLevel, NeedLevelConfig> = {
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

// ============================================
// GETTER FUNCTIONS (with localStorage override support)
// ============================================

function getConfig(): StatusConfigData {
	const defaultConfig: StatusConfigData = {
		projectStatuses: DEFAULT_PROJECT_STATUS_CONFIG,
		needLevels: DEFAULT_NEED_LEVEL_CONFIG
	};
	return getConfigWithOverrides(CONFIG_STORAGE_KEYS.STATUS_CONFIG, defaultConfig);
}

/**
 * Get the full project status configuration object
 */
export function getProjectStatusConfigAll(): Record<ProjectStatus, StatusConfig> {
	return getConfig().projectStatuses as Record<ProjectStatus, StatusConfig>;
}

/**
 * Get the full need level configuration object
 */
export function getNeedLevelConfigAll(): Record<NeedLevel, NeedLevelConfig> {
	return getConfig().needLevels as Record<NeedLevel, NeedLevelConfig>;
}

/**
 * Gets the full status configuration for a project status
 */
export function getStatusConfig(status: ProjectStatus): StatusConfig {
	const config = getProjectStatusConfigAll();
	return config[status] ?? DEFAULT_PROJECT_STATUS_CONFIG.preparation;
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
 * Gets the background color class for a project status (includes dark mode)
 */
export function getStatusBgColor(status: ProjectStatus): string {
	const config = getStatusConfig(status);
	return `${config.bgColor} ${config.darkBgColor}`;
}

/**
 * Gets the text color class for a project status (includes dark mode)
 */
export function getStatusTextColor(status: ProjectStatus): string {
	const config = getStatusConfig(status);
	return `${config.textColor} ${config.darkTextColor}`;
}

/**
 * Array of all project statuses for iteration
 */
export const ALL_PROJECT_STATUSES: ProjectStatus[] = [
	'preparation',
	'ongoing',
	'completed',
	'delayed',
	'non-completion'
];

// ===== NEED LEVEL FUNCTIONS =====

/**
 * Gets the full need level configuration for a need level
 */
export function getNeedLevelConfig(level: NeedLevel): NeedLevelConfig {
	const config = getNeedLevelConfigAll();
	return config[level] ?? DEFAULT_NEED_LEVEL_CONFIG.medium;
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

// ============================================
// FULL CONFIG ACCESS (for admin config page)
// ============================================

export function getStatusFullConfig(): StatusConfigData {
	return getConfig();
}

export function getDefaultStatusConfig(): StatusConfigData {
	return {
		projectStatuses: { ...DEFAULT_PROJECT_STATUS_CONFIG },
		needLevels: { ...DEFAULT_NEED_LEVEL_CONFIG }
	};
}

export function saveStatusConfig(config: StatusConfigData, changeDescription?: string): boolean {
	return saveConfigOverride(CONFIG_STORAGE_KEYS.STATUS_CONFIG, config, 'status', changeDescription);
}

export function resetStatusConfig(): boolean {
	return resetConfigToDefault(CONFIG_STORAGE_KEYS.STATUS_CONFIG, 'status');
}

export function hasStatusOverride(): boolean {
	return hasConfigOverride(CONFIG_STORAGE_KEYS.STATUS_CONFIG);
}

// ============================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================

/** @deprecated Use getProjectStatusConfigAll() instead */
export const PROJECT_STATUS_CONFIG = DEFAULT_PROJECT_STATUS_CONFIG;

/** @deprecated Use getNeedLevelConfigAll() instead */
export const NEED_LEVEL_CONFIG = DEFAULT_NEED_LEVEL_CONFIG;
