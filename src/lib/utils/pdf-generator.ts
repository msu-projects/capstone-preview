import type { Project, Sitio } from '$lib/types';
import { getNeedLevelFromScore } from '$lib/types';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { logAuditAction } from './audit';
import { LOGO_BASE64 } from './logo-base64';
import { getCompletionPercentage } from './project-calculations';

// Initialize pdfMake with fonts
if (pdfFonts && pdfFonts.vfs) {
	pdfMake.vfs = pdfFonts.vfs;
}

/**
 * Generates a PDF report for project monitoring following the official
 * PROJECT MONITORING FORM 2025 - PHYSICAL AND FINANCIAL ACCOMPLISHMENT REPORT
 * FOR CAPITAL INVESTMENT PROGRAMS/PROJECTS (20% LDF)
 */
export function generateProjectMonitoringPDF(projects: Project[], quarter: string = '3rd') {
	const currentDate = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// Helper to get location from project sitios
	const getProjectLocation = (project: Project): string => {
		if (project.project_sitios && project.project_sitios.length > 0) {
			return project.project_sitios[0].sitio_name || project.project_sitios[0].municipality;
		}
		return 'N/A';
	};

	// Helper to calculate slippage from monthly targets vs actual progress
	const getPhysicalProgress = (project: Project) => {
		// Get planned from monthly_targets
		const latestTarget = project.monthly_targets?.[project.monthly_targets.length - 1];
		const plan = latestTarget?.planned_physical_progress ?? 0;
		const actual = getCompletionPercentage(project);
		return { plan, actual, slippage: plan - actual };
	};

	// Create table rows for projects
	const projectRows = projects.map((project) => {
		const employment = project.employment_generated ?? { male: 0, female: 0 };
		const municipalities = project.project_sitios?.map((s) => s.municipality).join(', ') || 'N/A';
		const physical = getPhysicalProgress(project);

		// Calculate cumulative budget utilized from monthly progress
		const cumulativeDisbursed =
			project.monthly_progress?.reduce((sum, mp) => sum + (mp.budget_utilized || 0), 0) || 0;

		return [
			// Name of Projects column
			{
				text: [
					{ text: `${project.title}\n`, bold: true, fontSize: 9 },
					{
						text: `Location: ${getProjectLocation(project)}\n`,
						fontSize: 8,
						italics: true
					},
					{
						text: `Municipality: ${municipalities}\n`,
						fontSize: 8
					},
					{
						text: `Date Started: ${project.start_date}\n`,
						fontSize: 8
					},
					{
						text: `Duration: ${project.contract_duration}`,
						fontSize: 8
					}
				],
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Total Budget
			{
				text: project.total_budget.toLocaleString('en-PH', {
					style: 'currency',
					currency: 'PHP',
					minimumFractionDigits: 2
				}),
				alignment: 'right' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Contract Cost
			{
				text: project.contract_cost.toLocaleString('en-PH', {
					style: 'currency',
					currency: 'PHP',
					minimumFractionDigits: 2
				}),
				alignment: 'right' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Budget Utilized (from monthly progress)
			{
				text: cumulativeDisbursed.toLocaleString('en-PH', {
					style: 'currency',
					currency: 'PHP',
					minimumFractionDigits: 2
				}),
				alignment: 'right' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Plan %
			{
				text: `${physical.plan.toFixed(2)}%`,
				alignment: 'center' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Actual %
			{
				text: `${physical.actual.toFixed(2)}%`,
				alignment: 'center' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Slippage %
			{
				text: `${physical.slippage.toFixed(2)}%`,
				alignment: 'center' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number],
				color: physical.slippage < 0 ? 'red' : 'black'
			},
			// Male Employment
			{
				text: employment.male.toString(),
				alignment: 'center' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Female Employment
			{
				text: employment.female.toString(),
				alignment: 'center' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Contract Duration
			{
				text: project.contract_duration,
				alignment: 'center' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Project Status
			{
				text: project.status,
				alignment: 'center' as const,
				fontSize: 8,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// Remarks/Justification (from latest monthly progress)
			{
				text: [
					{
						text: 'Issues: ',
						bold: true,
						fontSize: 7
					},
					{
						text: `${project.monthly_progress?.[project.monthly_progress.length - 1]?.issues || 'None'}\n\n`,
						fontSize: 7
					},
					{
						text: 'Recommendations: ',
						bold: true,
						fontSize: 7
					},
					{
						text:
							project.monthly_progress?.[project.monthly_progress.length - 1]?.recommendations ||
							'None',
						fontSize: 7
					}
				],
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// CATCH-UP Plans (from latest monthly progress)
			{
				text: project.monthly_progress?.[project.monthly_progress.length - 1]?.catch_up_plan || '',
				fontSize: 7,
				margin: [2, 4, 2, 4] as [number, number, number, number]
			}
		];
	});

	const docDefinition: TDocumentDefinitions = {
		pageOrientation: 'landscape',
		pageSize: 'LEGAL',
		pageMargins: [20, 60, 20, 40],
		header: {
			columns: [
				{
					text: 'PROJECT MONITORING FORM 2025\nPHYSICAL AND FINANCIAL ACCOMPLISHMENT REPORT FOR CAPITAL INVESTMENT PROGRAMS/PROJECTS (20% LDF)',
					style: 'header',
					alignment: 'center',
					margin: [0, 10, 0, 0]
				}
			]
		},
		footer: (currentPage: number, pageCount: number) => {
			return {
				columns: [
					{
						text: `Prepared by: Provincial Governor's Office - CATCH-UP Program`,
						fontSize: 8,
						margin: [20, 0, 0, 0]
					},
					{
						text: `Page ${currentPage} of ${pageCount}`,
						alignment: 'right',
						fontSize: 8,
						margin: [0, 0, 20, 0]
					}
				]
			};
		},
		content: [
			{
				text: `As of ${quarter} Quarter, ${new Date().getFullYear()}`,
				style: 'subheader',
				margin: [0, 0, 0, 10]
			},
			{
				table: {
					headerRows: 2,
					widths: [
						100, // Name of Projects
						50, // Total Budget
						50, // Contract Cost
						50, // Budget Utilized
						30, // Plan %
						30, // Actual %
						30, // Slippage %
						20, // Male
						20, // Female
						40, // Contract Duration
						50, // Project Status
						100, // Remarks
						70 // CATCH-UP Plans
					],
					body: [
						// First header row - Grouped headers
						[
							{
								text: "IMPLEMENTER: Provincial Governor's Office\nPROVINCE: South Cotabato\n\nNAME OF PROJECTS",
								style: 'tableHeader',
								rowSpan: 2
							},
							{
								text: 'FINANCIAL STATUS',
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							},
							{},
							{},
							{
								text: 'PHYSICAL STATUS',
								style: 'tableHeader',
								colSpan: 3,
								alignment: 'center'
							},
							{},
							{},
							{
								text: 'EMPLOYMENT',
								style: 'tableHeader',
								colSpan: 2,
								alignment: 'center'
							},
							{},
							{
								text: 'CONTRACT\nDURATION',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							},
							{
								text: 'PROJECT\nSTATUS',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							},
							{
								text: 'REMARKS/ JUSTIFICATION\n(Issues & Recommendations)',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							},
							{
								text: 'CATCH-UP\nPLANS',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							}
						],
						// Second header row - Column details
						[
							{}, // NAME OF PROJECTS (rowSpan from above)
							{ text: 'TOTAL BUDGET', style: 'tableHeader', fontSize: 7 },
							{ text: 'CONTRACT COST', style: 'tableHeader', fontSize: 7 },
							{ text: 'BUDGET UTILIZED', style: 'tableHeader', fontSize: 7 },
							{ text: 'PLAN (%)', style: 'tableHeader', fontSize: 7 },
							{ text: 'ACTUAL (%)', style: 'tableHeader', fontSize: 7 },
							{ text: 'SLIPPAGE (%)', style: 'tableHeader', fontSize: 7 },
							{ text: '(M)', style: 'tableHeader', fontSize: 7 },
							{ text: '(F)', style: 'tableHeader', fontSize: 7 },
							{}, // CONTRACT DURATION (rowSpan from above)
							{}, // PROJECT STATUS (rowSpan from above)
							{}, // REMARKS (rowSpan from above)
							{} // CATCH-UP PLANS (rowSpan from above)
						],
						// Data rows
						...projectRows
					]
				},
				layout: {
					hLineWidth: () => 0.5,
					vLineWidth: () => 0.5,
					hLineColor: () => '#000000',
					vLineColor: () => '#000000',
					paddingLeft: () => 2,
					paddingRight: () => 2,
					paddingTop: () => 2,
					paddingBottom: () => 2
				}
			},
			{
				text: `\n\nGenerated on: ${currentDate}`,
				fontSize: 8,
				italics: true,
				alignment: 'right'
			}
		],
		styles: {
			header: {
				fontSize: 11,
				bold: true
			},
			subheader: {
				fontSize: 10,
				bold: true
			},
			tableHeader: {
				fontSize: 8,
				bold: true,
				fillColor: '#E0E0E0',
				alignment: 'center'
			}
		}
	};

	return pdfMake.createPdf(docDefinition);
}

/**
 * Downloads the project monitoring PDF
 */
export function downloadProjectMonitoringPDF(
	projects: Project[],
	quarter: string = '3rd',
	fileName?: string
) {
	const pdf = generateProjectMonitoringPDF(projects, quarter);
	const defaultFileName = `Project_Monitoring_Report_Q${quarter}_${new Date().getFullYear()}.pdf`;
	const finalFileName = fileName || defaultFileName;
	pdf.download(finalFileName);

	// Log the export action
	logAuditAction(
		'export',
		'project',
		undefined,
		finalFileName,
		`Exported ${projects.length} project(s) to PDF: ${finalFileName}`
	);
}

/**
 * Opens the project monitoring PDF in a new window
 */
export function openProjectMonitoringPDF(projects: Project[], quarter: string = '3rd') {
	const pdf = generateProjectMonitoringPDF(projects, quarter);
	pdf.open();

	// Log the export action
	logAuditAction(
		'export',
		'project',
		undefined,
		'PDF Preview',
		`Previewed ${projects.length} project(s) monitoring report`
	);
}

/**
 * Generates and downloads a single project report
 */
export function downloadSingleProjectPDF(project: Project, fileName?: string) {
	downloadProjectMonitoringPDF([project], '3rd', fileName);
}

// ===== SITIO PROFILE PDF GENERATION =====

/**
 * Helper function to format currency values
 */
function formatCurrency(value: number): string {
	return value.toLocaleString('en-PH', {
		style: 'currency',
		currency: 'PHP',
		minimumFractionDigits: 2
	});
}

/**
 * Helper function to create a section header
 */
function createSectionHeader(title: string): Content {
	return {
		text: title,
		style: 'sectionHeader',
		margin: [0, 15, 0, 8] as [number, number, number, number]
	};
}

/**
 * Helper function to create a subsection header
 */
function createSubsectionHeader(title: string): Content {
	return {
		text: title,
		style: 'subsectionHeader',
		margin: [0, 10, 0, 5] as [number, number, number, number]
	};
}

/**
 * Helper function to create a key-value row
 */
function createKeyValue(key: string, value: string | number | undefined | null): Content {
	return {
		columns: [
			{ text: key, width: 180, style: 'label' },
			{ text: value?.toString() || 'N/A', style: 'value' }
		],
		margin: [0, 2, 0, 2] as [number, number, number, number]
	};
}

/**
 * Get need level display info
 */
function getNeedLevelInfo(score: number): { text: string; color: string } {
	const level = getNeedLevelFromScore(score);
	const colors: Record<string, string> = {
		critical: '#DC2626',
		high: '#EA580C',
		medium: '#CA8A04',
		low: '#16A34A'
	};
	return {
		text: level.charAt(0).toUpperCase() + level.slice(1),
		color: colors[level] || '#6B7280'
	};
}

/**
 * Generates a comprehensive PDF profile for a sitio
 */
export function generateSitioProfilePDF(sitio: Sitio) {
	const currentDate = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	const needLevelInfo = getNeedLevelInfo(sitio.need_score ?? 5);

	// Build content sections
	const content: Content[] = [];

	// ===== HEADER WITH LOGO =====
	content.push({
		columns: [
			{
				image: LOGO_BASE64,
				width: 60,
				alignment: 'left'
			},
			{
				stack: [
					{
						text: 'SITIO PROFILE REPORT',
						style: 'documentTitle',
						alignment: 'center'
					},
					{
						text: 'South Cotabato Convergence Data Bank',
						style: 'documentSubtitle',
						alignment: 'center'
					},
					{
						text: `Generated: ${currentDate}`,
						fontSize: 9,
						italics: true,
						alignment: 'center',
						margin: [0, 5, 0, 0] as [number, number, number, number]
					}
				],
				width: '*'
			},
			{
				width: 60,
				text: ''
			}
		],
		margin: [0, 0, 0, 20] as [number, number, number, number]
	});

	// ===== SITIO IDENTIFICATION =====
	content.push({
		table: {
			widths: ['*'],
			body: [
				[
					{
						stack: [
							{
								text: sitio.name,
								style: 'sitioName',
								margin: [0, 0, 0, 5] as [number, number, number, number]
							},
							{
								text: `${sitio.barangay}, ${sitio.municipality}${sitio.province ? `, ${sitio.province}` : ''}`,
								style: 'sitioLocation'
							}
						],
						fillColor: '#F1F5F9',
						margin: [15, 12, 15, 12] as [number, number, number, number]
					}
				]
			]
		},
		layout: {
			hLineWidth: () => 1,
			vLineWidth: () => 1,
			hLineColor: () => '#CBD5E1',
			vLineColor: () => '#CBD5E1'
		},
		margin: [0, 0, 0, 15] as [number, number, number, number]
	});

	// ===== QUICK STATS =====
	content.push({
		columns: [
			{
				stack: [
					{ text: 'Population', style: 'statLabel' },
					{ text: (sitio.population || 0).toLocaleString(), style: 'statValue' }
				],
				width: '*',
				alignment: 'center'
			},
			{
				stack: [
					{ text: 'Households', style: 'statLabel' },
					{ text: (sitio.households || 0).toLocaleString(), style: 'statValue' }
				],
				width: '*',
				alignment: 'center'
			},
			{
				stack: [
					{ text: 'Need Score', style: 'statLabel' },
					{
						text: `${sitio.need_score ?? 'N/A'}/10`,
						style: 'statValue',
						color: needLevelInfo.color
					}
				],
				width: '*',
				alignment: 'center'
			},
			{
				stack: [
					{ text: 'Need Level', style: 'statLabel' },
					{ text: needLevelInfo.text, style: 'statValue', color: needLevelInfo.color }
				],
				width: '*',
				alignment: 'center'
			}
		],
		margin: [0, 0, 0, 20] as [number, number, number, number]
	});

	// ===== OVERVIEW SECTION =====
	content.push(createSectionHeader('Overview'));
	content.push(createKeyValue('Sitio Code', sitio.coding));
	content.push(
		createKeyValue(
			'Coordinates',
			sitio.coordinates
				? `${sitio.coordinates.lat.toFixed(6)}, ${sitio.coordinates.lng.toFixed(6)}`
				: undefined
		)
	);

	// ===== DEMOGRAPHICS SECTION =====
	content.push(createSectionHeader('Demographics'));

	if (sitio.demographics) {
		const demo = sitio.demographics;
		const dependencyRatio =
			demo.age_15_64 > 0
				? (((demo.age_0_14 || 0) + (demo.age_65_above || 0)) / demo.age_15_64) * 100
				: 0;

		content.push({
			table: {
				widths: ['*', '*'],
				body: [
					[{ text: 'Gender Distribution', style: 'tableSubHeader', colSpan: 2 }, {}],
					[
						{ text: 'Male', style: 'tableCell' },
						{
							text: `${(demo.male || 0).toLocaleString()} (${demo.total ? ((demo.male / demo.total) * 100).toFixed(1) : 0}%)`,
							style: 'tableCell'
						}
					],
					[
						{ text: 'Female', style: 'tableCell' },
						{
							text: `${(demo.female || 0).toLocaleString()} (${demo.total ? ((demo.female / demo.total) * 100).toFixed(1) : 0}%)`,
							style: 'tableCell'
						}
					],
					[
						{ text: 'Total', style: 'tableCellBold' },
						{ text: (demo.total || 0).toLocaleString(), style: 'tableCellBold' }
					]
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});

		content.push({
			table: {
				widths: ['*', '*'],
				body: [
					[{ text: 'Age Distribution', style: 'tableSubHeader', colSpan: 2 }, {}],
					[
						{ text: 'Children (0-14 years)', style: 'tableCell' },
						{ text: (demo.age_0_14 || 0).toLocaleString(), style: 'tableCell' }
					],
					[
						{ text: 'Working Age (15-64 years)', style: 'tableCell' },
						{ text: (demo.age_15_64 || 0).toLocaleString(), style: 'tableCell' }
					],
					[
						{ text: 'Elderly (65+ years)', style: 'tableCell' },
						{ text: (demo.age_65_above || 0).toLocaleString(), style: 'tableCell' }
					],
					[
						{ text: 'Dependency Ratio', style: 'tableCellBold' },
						{ text: `${dependencyRatio.toFixed(1)}%`, style: 'tableCellBold' }
					]
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	} else {
		content.push({ text: 'No demographic data available.', style: 'noData' });
	}

	// ===== ECONOMIC & LIVELIHOODS SECTION =====
	content.push(createSectionHeader('Economic & Livelihoods'));

	// Employment Types
	if (sitio.economic_condition?.employments && sitio.economic_condition.employments.length > 0) {
		content.push(createSubsectionHeader('Employment Types'));
		const employmentRows = sitio.economic_condition.employments.map((emp) => [
			{ text: emp.type, style: 'tableCell' },
			{ text: emp.count.toLocaleString(), style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', 100],
				body: [
					[
						{ text: 'Type', style: 'tableHeader' },
						{ text: 'Count', style: 'tableHeader' }
					],
					...employmentRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	}

	// Income Brackets
	if (
		sitio.economic_condition?.income_brackets &&
		sitio.economic_condition.income_brackets.length > 0
	) {
		content.push(createSubsectionHeader('Income Brackets (Monthly, in PHP thousands)'));
		const incomeRows = sitio.economic_condition.income_brackets.map((inc) => [
			{ text: inc.bracket, style: 'tableCell' },
			{ text: inc.households.toLocaleString(), style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', 100],
				body: [
					[
						{ text: 'Bracket', style: 'tableHeader' },
						{ text: 'Households', style: 'tableHeader' }
					],
					...incomeRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	}

	// Agriculture
	if (sitio.agriculture) {
		content.push(createSubsectionHeader('Agriculture'));
		content.push(createKeyValue('Number of Farmers', sitio.agriculture.farmers_count));
		content.push(createKeyValue('Farmer Associations', sitio.agriculture.farmer_associations));
		content.push(
			createKeyValue('Farm Area', `${sitio.agriculture.farm_area_hectares || 0} hectares`)
		);
		if (sitio.agriculture.top_crops && sitio.agriculture.top_crops.length > 0) {
			content.push(createKeyValue('Top Crops', sitio.agriculture.top_crops.join(', ')));
		}
	}

	// Livestock & Poultry
	if (sitio.livestock_poultry && sitio.livestock_poultry.length > 0) {
		content.push(createSubsectionHeader('Livestock & Poultry'));
		content.push({
			text: sitio.livestock_poultry.join(', '),
			style: 'value',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	}

	// ===== INFRASTRUCTURE & HOUSING SECTION =====
	content.push(createSectionHeader('Infrastructure & Housing'));

	// Housing Quality
	if (sitio.housing?.quality_types && sitio.housing.quality_types.length > 0) {
		content.push(createSubsectionHeader('Housing Quality'));
		const housingQualityRows = sitio.housing.quality_types.map((h) => [
			{ text: h.type, style: 'tableCell' },
			{ text: h.count.toLocaleString(), style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', 100],
				body: [
					[
						{ text: 'Type', style: 'tableHeader' },
						{ text: 'Count', style: 'tableHeader' }
					],
					...housingQualityRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	}

	// Housing Ownership
	if (sitio.housing?.ownership_types && sitio.housing.ownership_types.length > 0) {
		content.push(createSubsectionHeader('Housing Ownership'));
		const ownershipRows = sitio.housing.ownership_types.map((h) => [
			{ text: h.type, style: 'tableCell' },
			{ text: h.count.toLocaleString(), style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', 100],
				body: [
					[
						{ text: 'Type', style: 'tableHeader' },
						{ text: 'Count', style: 'tableHeader' }
					],
					...ownershipRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	}

	// Water & Sanitation
	if (sitio.water_sanitation) {
		content.push(createSubsectionHeader('Water & Sanitation'));
		content.push(createKeyValue('Water Systems Count', sitio.water_sanitation.water_systems_count));

		if (sitio.water_sanitation.water_sources && sitio.water_sanitation.water_sources.length > 0) {
			const waterSourcesText = sitio.water_sanitation.water_sources
				.map((ws) => `${ws.source} (${ws.status})`)
				.join(', ');
			content.push(createKeyValue('Water Sources', waterSourcesText));
		}

		content.push(
			createKeyValue('Households without Toilet', sitio.water_sanitation.households_without_toilet)
		);

		if (
			sitio.water_sanitation.toilet_facility_types &&
			sitio.water_sanitation.toilet_facility_types.length > 0
		) {
			content.push(
				createKeyValue(
					'Toilet Facility Types',
					sitio.water_sanitation.toilet_facility_types.join(', ')
				)
			);
		}

		content.push(
			createKeyValue(
				'Waste Segregation Practice',
				sitio.water_sanitation.waste_segregation_practice === true
					? 'Yes'
					: sitio.water_sanitation.waste_segregation_practice === false
						? 'No'
						: 'Unknown'
			)
		);
	}

	// Utilities
	if (sitio.utilities) {
		content.push(createSubsectionHeader('Utilities'));
		content.push(
			createKeyValue('Households with Electricity', sitio.utilities.households_with_electricity)
		);
		if (
			sitio.utilities.alternative_electricity_sources &&
			sitio.utilities.alternative_electricity_sources.length > 0
		) {
			content.push(
				createKeyValue(
					'Alternative Power Sources',
					sitio.utilities.alternative_electricity_sources.join(', ')
				)
			);
		}
	}

	// ===== SOCIAL SERVICES SECTION =====
	content.push(createSectionHeader('Social Services'));

	if (sitio.social_services) {
		content.push(createKeyValue('Registered Voters', sitio.social_services.registered_voters));
		content.push(
			createKeyValue('PhilHealth Beneficiaries', sitio.social_services.philhealth_beneficiaries)
		);
		content.push(createKeyValue('4Ps Beneficiaries', sitio.social_services.fourps_beneficiaries));
	}

	// Food Security
	if (sitio.food_security) {
		content.push(createSubsectionHeader('Food Security'));
		content.push(
			createKeyValue(
				'Households with Backyard Garden',
				sitio.food_security.households_with_backyard_garden
			)
		);
		if (
			sitio.food_security.common_garden_commodities &&
			sitio.food_security.common_garden_commodities.length > 0
		) {
			content.push(
				createKeyValue(
					'Common Garden Commodities',
					sitio.food_security.common_garden_commodities.join(', ')
				)
			);
		}
	}

	// Domestic Animals
	if (sitio.domestic_animals) {
		content.push(createSubsectionHeader('Domestic Animals'));
		content.push(
			createKeyValue(
				'Dogs',
				`${sitio.domestic_animals.dogs || 0} (${sitio.domestic_animals.dogs_vaccinated || 0} vaccinated)`
			)
		);
		content.push(
			createKeyValue(
				'Cats',
				`${sitio.domestic_animals.cats || 0} (${sitio.domestic_animals.cats_vaccinated || 0} vaccinated)`
			)
		);
	}

	// Community Empowerment
	if (sitio.community_empowerment) {
		content.push(createSubsectionHeader('Community Empowerment'));
		content.push(
			createKeyValue('Sectoral Organizations', sitio.community_empowerment.sectoral_organizations)
		);
		if (
			sitio.community_empowerment.info_dissemination_methods &&
			sitio.community_empowerment.info_dissemination_methods.length > 0
		) {
			content.push(
				createKeyValue(
					'Info Dissemination Methods',
					sitio.community_empowerment.info_dissemination_methods.join(', ')
				)
			);
		}
		if (
			sitio.community_empowerment.transportation_methods &&
			sitio.community_empowerment.transportation_methods.length > 0
		) {
			content.push(
				createKeyValue(
					'Transportation Methods',
					sitio.community_empowerment.transportation_methods.join(', ')
				)
			);
		}
	}

	// Ethnicity and Religion
	if (sitio.ethnicities && sitio.ethnicities.length > 0) {
		content.push(createKeyValue('Ethnicities', sitio.ethnicities.join(', ')));
	}
	if (sitio.religions && sitio.religions.length > 0) {
		content.push(createKeyValue('Religions', sitio.religions.join(', ')));
	}

	// ===== ISSUES & PPAs SECTION =====
	content.push(createSectionHeader('Issues & Proposed Programs/Projects'));

	// Issues & Concerns
	if (sitio.issues_concerns && sitio.issues_concerns.length > 0) {
		content.push(createSubsectionHeader('Issues & Concerns'));
		const issueRows = sitio.issues_concerns.map((issue) => [
			{ text: issue.name, style: 'tableCell' },
			{ text: issue.category, style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', 150],
				body: [
					[
						{ text: 'Issue', style: 'tableHeader' },
						{ text: 'Category', style: 'tableHeader' }
					],
					...issueRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	} else {
		content.push({ text: 'No issues/concerns recorded.', style: 'noData' });
	}

	// Proposed PPAs
	if (sitio.proposed_ppas && sitio.proposed_ppas.length > 0) {
		content.push(createSubsectionHeader('Proposed Programs, Projects & Activities'));
		const ppaRows = sitio.proposed_ppas.map((ppa) => [
			{ text: ppa.name, style: 'tableCell' },
			{ text: ppa.category, style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', 150],
				body: [
					[
						{ text: 'PPA', style: 'tableHeader' },
						{ text: 'Category', style: 'tableHeader' }
					],
					...ppaRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	} else {
		content.push({ text: 'No proposed PPAs recorded.', style: 'noData' });
	}

	// ===== LOCAL OFFICIALS SECTION =====
	if (sitio.local_officials && sitio.local_officials.length > 0) {
		content.push(createSectionHeader('Local Officials'));
		const officialRows = sitio.local_officials.map((official) => [
			{ text: official.name, style: 'tableCell' },
			{ text: official.position, style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', '*'],
				body: [
					[
						{ text: 'Name', style: 'tableHeader' },
						{ text: 'Position', style: 'tableHeader' }
					],
					...officialRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	}

	// ===== RST OFFICIALS SECTION =====
	if (sitio.rst_officials && sitio.rst_officials.length > 0) {
		content.push(createSectionHeader('RST Officials'));
		const rstRows = sitio.rst_officials.map((official) => [
			{ text: official.name, style: 'tableCell' },
			{ text: official.position, style: 'tableCell' }
		]);
		content.push({
			table: {
				widths: ['*', '*'],
				body: [
					[
						{ text: 'Name', style: 'tableHeader' },
						{ text: 'Position', style: 'tableHeader' }
					],
					...rstRows
				]
			},
			layout: 'lightHorizontalLines',
			margin: [0, 5, 0, 10] as [number, number, number, number]
		});
	}

	// Document definition
	const docDefinition: TDocumentDefinitions = {
		pageOrientation: 'portrait',
		pageSize: 'LEGAL',
		pageMargins: [40, 40, 40, 60],
		footer: (currentPage: number, pageCount: number) => {
			return {
				columns: [
					{
						text: 'South Cotabato Convergence Data Bank - Sitio Profile',
						fontSize: 8,
						color: '#6B7280',
						margin: [40, 0, 0, 0]
					},
					{
						text: `Page ${currentPage} of ${pageCount}`,
						alignment: 'right',
						fontSize: 8,
						color: '#6B7280',
						margin: [0, 0, 40, 0]
					}
				]
			};
		},
		content,
		styles: {
			documentTitle: {
				fontSize: 16,
				bold: true,
				color: '#1E293B'
			},
			documentSubtitle: {
				fontSize: 11,
				color: '#475569'
			},
			sitioName: {
				fontSize: 20,
				bold: true,
				color: '#0F172A'
			},
			sitioLocation: {
				fontSize: 12,
				color: '#64748B'
			},
			statLabel: {
				fontSize: 9,
				color: '#64748B'
			},
			statValue: {
				fontSize: 14,
				bold: true,
				color: '#1E293B'
			},
			sectionHeader: {
				fontSize: 14,
				bold: true,
				color: '#1E40AF',
				decoration: 'underline'
			},
			subsectionHeader: {
				fontSize: 11,
				bold: true,
				color: '#334155'
			},
			label: {
				fontSize: 10,
				color: '#64748B'
			},
			value: {
				fontSize: 10,
				color: '#1E293B'
			},
			tableHeader: {
				fontSize: 9,
				bold: true,
				fillColor: '#E2E8F0',
				color: '#1E293B'
			},
			tableSubHeader: {
				fontSize: 10,
				bold: true,
				fillColor: '#F1F5F9',
				color: '#334155'
			},
			tableCell: {
				fontSize: 9,
				color: '#374151'
			},
			tableCellBold: {
				fontSize: 9,
				bold: true,
				color: '#1E293B'
			},
			noData: {
				fontSize: 9,
				italics: true,
				color: '#9CA3AF',
				margin: [0, 5, 0, 10] as [number, number, number, number]
			}
		}
	};

	return pdfMake.createPdf(docDefinition);
}

/**
 * Downloads a sitio profile PDF
 */
export function downloadSitioProfilePDF(sitio: Sitio, fileName?: string) {
	const pdf = generateSitioProfilePDF(sitio);
	const sanitizedName = sitio.name.replace(/[^a-z0-9]/gi, '_');
	const defaultFileName = `${sanitizedName}_Profile.pdf`;
	const finalFileName = fileName || defaultFileName;
	pdf.download(finalFileName);

	// Log the export action
	logAuditAction(
		'export',
		'sitio',
		sitio.id,
		finalFileName,
		`Exported sitio profile to PDF: ${sitio.name}`
	);
}

/**
 * Opens a sitio profile PDF in a new window
 */
export function openSitioProfilePDF(sitio: Sitio) {
	const pdf = generateSitioProfilePDF(sitio);
	pdf.open();

	// Log the export action
	logAuditAction(
		'export',
		'sitio',
		sitio.id,
		'PDF Preview',
		`Previewed sitio profile PDF: ${sitio.name}`
	);
}
