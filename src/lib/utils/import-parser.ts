import type { ImportedRow } from '$lib/types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Parse a CSV or Excel file and extract headers and rows
 * @param file File to parse
 * @returns Object containing headers array and rows array
 */
export async function parseFile(file: File): Promise<{
	headers: string[];
	rows: ImportedRow[];
}> {
	const extension = file.name.split('.').pop()?.toLowerCase();

	if (extension === 'csv') {
		return parseCSV(file);
	} else if (extension === 'xlsx' || extension === 'xls') {
		return parseExcel(file);
	} else {
		throw new Error('Unsupported file type. Please upload CSV or Excel files.');
	}
}

/**
 * Parse a CSV file using PapaParse
 */
async function parseCSV(file: File): Promise<{ headers: string[]; rows: ImportedRow[] }> {
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			dynamicTyping: true, // Auto-convert numbers
			complete: (results) => {
				const headers = results.meta.fields || [];
				const rows = results.data as ImportedRow[];
				resolve({ headers, rows });
			},
			error: (error) => reject(new Error(`CSV parsing error: ${error.message}`))
		});
	});
}

/**
 * Parse an Excel file using SheetJS
 */
async function parseExcel(file: File): Promise<{ headers: string[]; rows: ImportedRow[] }> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });

				// Use first sheet
				const sheetName = workbook.SheetNames[0];
				if (!sheetName) {
					reject(new Error('Excel file contains no sheets'));
					return;
				}

				const worksheet = workbook.Sheets[sheetName];

				// Convert to JSON with header row
				const jsonData = XLSX.utils.sheet_to_json(worksheet, {
					header: 1,
					defval: null // Use null for empty cells
				}) as any[][];

				if (jsonData.length === 0) {
					reject(new Error('Excel file is empty'));
					return;
				}

				// First row is headers
				const headers = jsonData[0].map((h) => String(h || '').trim()).filter((h) => h);

				// Remaining rows are data
				const rows = jsonData.slice(1).map((row) => {
					const obj: ImportedRow = {};
					headers.forEach((header, index) => {
						const value = row[index];
						// Convert to appropriate type
						if (value === null || value === undefined || value === '') {
							obj[header] = null;
						} else if (typeof value === 'number') {
							obj[header] = value;
						} else {
							obj[header] = String(value).trim();
						}
					});
					return obj;
				});

				// Filter out completely empty rows
				const filteredRows = rows.filter((row) =>
					Object.values(row).some((v) => v !== null && v !== '')
				);

				resolve({ headers, rows: filteredRows });
			} catch (error) {
				reject(
					new Error(
						`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
					)
				);
			}
		};

		reader.onerror = () => reject(new Error('Failed to read file'));
		reader.readAsArrayBuffer(file);
	});
}

/**
 * Validate file before parsing
 * @param file File to validate
 * @returns Error message if invalid, null if valid
 */
export function validateFile(file: File): string | null {
	const validExtensions = ['.csv', '.xlsx', '.xls'];
	const extension = '.' + file.name.split('.').pop()?.toLowerCase();

	if (!validExtensions.includes(extension)) {
		return 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)';
	}

	const maxSize = 10 * 1024 * 1024; // 10MB
	if (file.size > maxSize) {
		return 'File is too large. Maximum file size is 10MB.';
	}

	if (file.size === 0) {
		return 'File is empty.';
	}

	return null;
}
