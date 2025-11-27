import type { Project } from '$lib/types';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { logAuditAction } from './audit';
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
			// Remarks/Justification
			{
				text: [
					{
						text: 'Issues: ',
						bold: true,
						fontSize: 7
					},
					{
						text: `${project.issues || 'None'}\n\n`,
						fontSize: 7
					},
					{
						text: 'Recommendations: ',
						bold: true,
						fontSize: 7
					},
					{
						text: project.recommendations || 'None',
						fontSize: 7
					}
				],
				margin: [2, 4, 2, 4] as [number, number, number, number]
			},
			// CATCH-UP Plans
			{
				text: project.catch_up_plan || '',
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
