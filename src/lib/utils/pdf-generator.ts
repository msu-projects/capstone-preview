import type { Project } from '$lib/types';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

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

	// Create table rows for projects (filter out projects without monitoring data)
	const projectRows = projects
		.filter((project) => project.monitoring !== undefined)
		.map((project) => {
			const monitoring = project.monitoring!;
			const municipalities = project.project_sitios?.map((s) => s.municipality).join(', ') || 'N/A';

			return [
				// Name of Projects column
				{
					text: [
						{ text: `${project.title}\n`, bold: true, fontSize: 9 },
						{
							text: `Location: ${monitoring.location}\n`,
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
							text: `Target Completion: ${project.end_date}`,
							fontSize: 8
						}
					],
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Allotted Budget
				{
					text: monitoring.allotment.allocated.toLocaleString('en-PH', {
						style: 'currency',
						currency: 'PHP',
						minimumFractionDigits: 2
					}),
					alignment: 'right' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Supplemental Budget
				{
					text: monitoring.allotment.supplemental.toLocaleString('en-PH', {
						style: 'currency',
						currency: 'PHP',
						minimumFractionDigits: 2
					}),
					alignment: 'right' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Total Allocated Budget
				{
					text: monitoring.allotment.total.toLocaleString('en-PH', {
						style: 'currency',
						currency: 'PHP',
						minimumFractionDigits: 2
					}),
					alignment: 'right' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Allotment Release
				{
					text: monitoring.allotment.released.toLocaleString('en-PH', {
						style: 'currency',
						currency: 'PHP',
						minimumFractionDigits: 2
					}),
					alignment: 'right' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Obligations Incurred
				{
					text: monitoring.expenditure.obligations.toLocaleString('en-PH', {
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
					text: monitoring.expenditure.contractCost.toLocaleString('en-PH', {
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
					text: `${monitoring.physical.plan.toFixed(2)}%`,
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Actual %
				{
					text: `${monitoring.physical.actual.toFixed(2)}%`,
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Slippage %
				{
					text: `${monitoring.physical.slippage.toFixed(2)}%`,
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number],
					color: monitoring.physical.slippage < 0 ? 'red' : 'black'
				},
				// Male Employment
				{
					text: monitoring.employment.male.toString(),
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Female Employment
				{
					text: monitoring.employment.female.toString(),
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Contract Time
				{
					text: monitoring.contract.duration,
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Delivery Time
				{
					text: monitoring.contract.delivery,
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Extension
				{
					text: monitoring.contract.extension || 'None',
					alignment: 'center' as const,
					fontSize: 8,
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// Project Status
				{
					text: monitoring.statusSummary.stage,
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
							text: `${monitoring.statusSummary.issues}\n\n`,
							fontSize: 7
						},
						{
							text: 'Recommendations: ',
							bold: true,
							fontSize: 7
						},
						{
							text: monitoring.statusSummary.recommendations,
							fontSize: 7
						}
					],
					margin: [2, 4, 2, 4] as [number, number, number, number]
				},
				// CATCH-UP Plans
				{
					text: monitoring.catchUpPlan,
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
						80, // Name of Projects
						35, // Allotted Budget
						35, // Supplemental
						35, // Total Allocated
						35, // Allotment Release
						35, // Obligations
						35, // Contract Cost
						25, // Plan %
						25, // Actual %
						25, // Slippage %
						15, // Male
						15, // Female
						30, // Contract Time
						30, // Delivery Time
						30, // Extension
						40, // Project Status
						80, // Remarks
						60 // CATCH-UP Plans
					],
					body: [
						// First header row - Grouped headers
						[
							{
								text: "IMPLEMENTER: Provincial Governor's Office\nPROVINCE: South Cotabato\n\nNAME OF PROJECTS\n(All on-going projects implemented by an office under the 20% LDF in priority areas and supplemental target)",
								style: 'tableHeader',
								rowSpan: 2
							},
							{
								text: 'FINANCIAL STATUS (000)',
								style: 'tableHeader',
								colSpan: 6,
								alignment: 'center'
							},
							{},
							{},
							{},
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
								text: 'NO. OF EMPLOYEES GENERATED',
								style: 'tableHeader',
								colSpan: 2,
								alignment: 'center'
							},
							{},
							{
								text: 'CONTRACT TIME/ DELIVERY TIME',
								style: 'tableHeader',
								colSpan: 2,
								alignment: 'center'
							},
							{},
							{
								text: 'EXTENSION, if any',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							},
							{
								text: 'PROJECT STATUS\n(Completed, On going, Suspended)',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							},
							{
								text: 'REMARKS/ JUSTIFICATION\n(1) Procurement Issues of LGI\n(2) Recommendations',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							},
							{
								text: 'CATCHUP PLANS',
								style: 'tableHeader',
								rowSpan: 2,
								alignment: 'center'
							}
						],
						// Second header row - Column details
						[
							{}, // NAME OF PROJECTS (rowSpan from above)
							{ text: 'ALLOTTED BUDGET', style: 'tableHeader', fontSize: 7 },
							{ text: 'SUPPLEMENTAL BUDGET', style: 'tableHeader', fontSize: 7 },
							{ text: 'TOTAL ALLOCATED BUDGET', style: 'tableHeader', fontSize: 7 },
							{ text: 'ALLOTMENT RELEASE To Date', style: 'tableHeader', fontSize: 7 },
							{
								text: 'OBLIGATIONS INCURRED To Date',
								style: 'tableHeader',
								fontSize: 7
							},
							{ text: 'CONTRACT COST To Date', style: 'tableHeader', fontSize: 7 },
							{ text: 'PLAN This Month (%)', style: 'tableHeader', fontSize: 7 },
							{ text: 'ACTUAL This Month (%)', style: 'tableHeader', fontSize: 7 },
							{ text: 'SLIPPAGE (%)', style: 'tableHeader', fontSize: 7 },
							{ text: '(M)', style: 'tableHeader', fontSize: 7 },
							{ text: '(F)', style: 'tableHeader', fontSize: 7 },
							{ text: '', style: 'tableHeader', fontSize: 7 },
							{ text: '', style: 'tableHeader', fontSize: 7 },
							{}, // EXTENSION (rowSpan from above)
							{}, // PROJECT STATUS (rowSpan from above)
							{}, // REMARKS (rowSpan from above)
							{} // CATCHUP PLANS (rowSpan from above)
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
	pdf.download(fileName || defaultFileName);
}

/**
 * Opens the project monitoring PDF in a new window
 */
export function openProjectMonitoringPDF(projects: Project[], quarter: string = '3rd') {
	const pdf = generateProjectMonitoringPDF(projects, quarter);
	pdf.open();
}

/**
 * Generates and downloads a single project report
 */
export function downloadSingleProjectPDF(project: Project, fileName?: string) {
	downloadProjectMonitoringPDF([project], '3rd', fileName);
}
