'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ImportForm() {
  return (
    <Card className='border-none shadow-none m-0'>
      <CardHeader className='px-0'>
        <CardTitle>Import CSV or Excel</CardTitle>
      </CardHeader>
      <CardContent className='px-0'>
        <p>Upload a CSV or XLSX file with a list of addresses.</p>
        <p>Each row should contain one address.</p>
      </CardContent>
    </Card>
  )
}
