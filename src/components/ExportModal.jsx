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

export default function ExportModal({ open, onClose, onDownloadPDF, onGenerateQR }) {
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
              className='w-full'
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
              onClick={onGenerateQR}
              className='w-full'
            >
              📱 Generate QR Code
            </Button>
            <p className='text-sm text-muted-foreground'>Scan to open in Google Maps.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
