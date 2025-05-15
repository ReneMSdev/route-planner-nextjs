// File: components/ImportForm/parseFile.js
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

/**
 * Reads and parses a CSV, XLS, or XLSX file to extract full addresses.
 * Calls onComplete(addresses: string[]) when parsing is done.
 */
export async function parseFile(file, onComplete) {
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv')) {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const addresses = results.data
          .map((row) => {
            const { Street, City, State, Zip } = row
            if (!Street || !City || !State || !Zip) return null
            return `${Street}, ${City}, ${State} ${Zip}`
          })
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

    // Extract header row
    const [header, ...rows] = sheetData
    const colIndex = {
      Street: header.indexOf('Street'),
      City: header.indexOf('City'),
      State: header.indexOf('State'),
      Zip: header.indexOf('Zip'),
    }

    const addresses = rows
      .map((row) => {
        const street = row[colIndex.Street]
        const city = row[colIndex.City]
        const state = row[colIndex.State]
        const zip = row[colIndex.Zip]
        if (!street || !city || !state || !zip) return null
        return `${street}, ${city}, ${state} ${zip}`
      })
      .filter(Boolean)

    onComplete(addresses)
  } else {
    console.warn('Unsupported file type')
    onComplete([])
  }
}
