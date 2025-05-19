'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { useQRCode } from 'next-qrcode'

export default function ExportModal({ open, onClose, onDownloadPDF, qrUrl }) {
  const { Canvas } = useQRCode()

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className='max-w-lg w-full'>
        <DialogHeader>
          <DialogTitle>Export Your Route</DialogTitle>
          <DialogDescription>
            Choose how you'd like to export or share this route.
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-col sm:flex-row gap-6'>
          {/* PDF Export Option */}
          <div className='flex-1 text-center space-y-2'>
            <Button
              onClick={onDownloadPDF}
              className='w-full bg-gray-600 hover:bg-gray-500 cursor-pointer'
            >
              📄 Download PDF
            </Button>
            <p className='text-sm text-muted-foreground'>
              Save a printable copy of your optimized route.
            </p>
          </div>

          {/* Vertical Separator */}
          <Separator
            orientation='vertical'
            className='hidden sm:block'
          />

          {/* QR Code Option */}
          <div className='flex-1 text-center space-y-2'>
            <Button
              onClick={() => console.log('generateQR')}
              className='w-full bg-green-500 hover:bg-green-400 cursor-pointer'
            >
              📱 Generate QR Code
            </Button>
            <p className='text-sm text-muted-foreground'>Scan to open in Google Maps.</p>
          </div>
        </div>

        {/* QR Code */}
        {qrUrl && (
          <>
            <Separator className='my-4' />

            <div className='mt-6 flex justify-center'>
              <Canvas
                text={qrUrl}
                options={{
                  errorCorrectionLevel: 'M',
                  margin: 2,
                  scale: 4,
                  width: 200,
                  color: {
                    dark: '#000000',
                    light: '#ffffff',
                  },
                }}
              />
            </div>
            <p className='text-center text-xs text-muted-forground mt-2'>
              Scan to open in Google Maps
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
