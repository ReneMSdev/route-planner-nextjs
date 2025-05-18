'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UploadCloud } from 'lucide-react'

export default function ImportForm({ onFileAccepted }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0])
      }
    },
    [onFileAccepted]
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog,
  } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 1024 * 1024, // 1 MB
  })

  return (
    <div
      {...getRootProps()}
      className='mt-4'
    >
      <input {...getInputProps()} />
      <Card className='mt-4 border-dashed border-2 border-green-500 bg-white shadow-none'>
        <CardHeader className='flex items-center justify-center'>
          <UploadCloud className='text-green-600 text-md' />
        </CardHeader>

        <CardContent className='text-center space-y-2'>
          <p className='font-medium'>Drag and drop file here</p>
          <p className='text-sm text-muted-foreground'>or</p>

          <Button
            type='button'
            variant='outline'
            onClick={openFileDialog}
            className='text-green-600 border-green-600 hover:bg-green-50'
          >
            Browse files
          </Button>

          <p className='text-xs text-muted-foreground'>Files supported: XLS, XLSX, CSV</p>
          <p className='text-xs text-muted-foreground'>Size limit: 1 MB</p>
        </CardContent>
      </Card>
    </div>
  )
}
