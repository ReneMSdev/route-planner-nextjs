// File: components/ImportForm/parseFile.js
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

// Header names are matched case-insensitively, ignoring spaces, dashes, and underscores.
const ALIASES = {
  address: ['address', 'fulladdress', 'streetaddress'],
  street: ['street', 'address1', 'addressline1'],
  city: ['city', 'town'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'zipcode', 'postalcode', 'postcode'],
}

const normalize = (h) =>
  String(h ?? '')
    .toLowerCase()
    .replace(/[\s_-]+/g, '')

const cell = (v) => String(v ?? '').trim()

// ZIPs stored as numbers in Excel lose their leading zero (02139 -> 2139)
const zipCell = (v) => (typeof v === 'number' && v < 10000 ? String(v).padStart(5, '0') : cell(v))

/**
 * Turns a header row plus data rows into address strings. Accepts either a
 * single full-address column or Street + City (State and Zip optional).
 * Returns [] when neither layout is found.
 */
export function rowsToAddresses(rows) {
  const [header = [], ...data] = rows
  const names = header.map(normalize)
  const col = (key) => names.findIndex((n) => ALIASES[key].includes(n))
  const idx = Object.fromEntries(Object.keys(ALIASES).map((k) => [k, col(k)]))
  // "Address, City, State, Zip": the Address column usually holds just the street
  const addressAsStreet = idx.street < 0 && idx.city >= 0 && idx.address >= 0
  if (addressAsStreet) idx.street = idx.address

  if (idx.street >= 0 && idx.city >= 0) {
    return data
      .map((row) => {
        const street = cell(row[idx.street])
        const city = cell(row[idx.city])
        if (!street || !city) return null
        // ...but sometimes the full address ("1 Main St, Oakland, CA"): one of its
        // comma-separated parts after the first is exactly the city
        const parts = street.split(',').map((x) => x.trim().toLowerCase())
        if (addressAsStreet && parts.slice(1).includes(city.toLowerCase())) return street
        const stateZip = [cell(row[idx.state]), zipCell(row[idx.zip])].filter(Boolean).join(' ')
        return [street, city, stateZip].filter(Boolean).join(', ')
      })
      .filter(Boolean)
  }

  if (idx.address >= 0) {
    return data.map((row) => cell(row[idx.address])).filter(Boolean)
  }

  return []
}

/**
 * Reads and parses a CSV, XLS, or XLSX file to extract full addresses.
 * Calls onComplete(addresses: string[]) when parsing is done. Never throws;
 * unreadable files produce [].
 */
export async function parseFile(file, onComplete) {
  const fileName = file.name.toLowerCase()

  try {
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (results) => onComplete(rowsToAddresses(results.data)),
        error: (err) => {
          console.error('CSV Parse Error:', err)
          onComplete([])
        },
      })
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const sheetData = firstSheet ? XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) : []
      onComplete(rowsToAddresses(sheetData))
    } else {
      console.warn('Unsupported file type')
      onComplete([])
    }
  } catch (err) {
    console.error('File Parse Error:', err)
    onComplete([])
  }
}
