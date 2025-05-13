// File: components/ImportForm/parseFile.js
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

/**
 * Reads and parses a CSV, XLS, or XLSX file to extract addresses.
 * Calls onComplete(addresses: string[]) when parsing is done.
 */
export async function parseFile(file, onComplete) {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    Papa.parse(file, {
      complete: (results) => {
        const addresses = results.data
          .flat()
          .map((entry) => String(entry).trim())
          .filter(Boolean)
        onComplete(addresses)
      },
      error: (err) => {
        console.error('CSV Parse Error:', err)
        onComplete([])
      },
    })
  } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
    const addresses = sheetData
      .flat()
      .map((entry) => String(entry).trim())
      .filter(Boolean)
    onComplete(addresses)
  } else {
    console.warn('Unsupported file type')
    onComplete([])
  }
}
