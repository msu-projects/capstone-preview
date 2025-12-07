import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const municipality = url.searchParams.get('municipality') || 'all';
	const category = url.searchParams.get('category') || 'all';
	const status = url.searchParams.get('status') || 'all';
	const year = url.searchParams.get('year') || 'all';
	const tab = url.searchParams.get('tab') || 'overview';

	return {
		municipality,
		category,
		status,
		year,
		tab
	};
};
