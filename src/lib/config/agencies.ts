/**
 * Implementing Agencies Configuration
 * List of government offices and agencies that can implement projects
 */

export const IMPLEMENTING_AGENCIES = [
	"Provincial Governor's Office (PGO)",
	'Provincial Engineering Office (PEO)',
	"Provincial Agriculturist's Office (PAO)",
	'Provincial Health Office (PHO)',
	'Provincial Social Welfare and Development Office (PSWDO)',
	'Provincial Planning and Development Office (PPDO)',
	'Provincial Veterinary Office (PVO)',
	'Provincial Environment and Natural Resources Office (PENRO)',
	'Department of Agriculture - Region XII (DA-XII)',
	'Department of Public Works and Highways (DPWH)',
	'Department of Education (DepEd)',
	'Department of Health (DOH)',
	'Department of Social Welfare and Development (DSWD)',
	'Department of the Interior and Local Government (DILG)',
	'Local Government Unit (LGU)',
	'Provincial Disaster Risk Reduction and Management Office (PDRRMO)',
	'Provincial Tourism Office (PTO)',
	'Provincial General Services Office (PGSO)'
] as const;

export type ImplementingAgency = (typeof IMPLEMENTING_AGENCIES)[number] | string;
