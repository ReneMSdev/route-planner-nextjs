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
import { useQRCode } from 'next-qrcode'

export default function ExportModal({ open, onClose, onDownloadPDF, qrUrl, isMobile }) {
  const { Canvas } = useQRCode()

  // The first option gets the solid style: PDF on desktop, Google Maps on phones
  const primary = 'w-70 bg-violet-600 text-white hover:bg-violet-700 cursor-pointer'
  const secondary =
    'w-70 bg-white text-violet-700 border border-violet-300 hover:bg-violet-100 cursor-pointer'

  const pdfOption = (
    <div className='text-center space-y-2'>
      <Button
        onClick={onDownloadPDF}
        className={isMobile ? secondary : primary}
      >
        📄 Download PDF
      </Button>
      <p className='text-sm text-muted-foreground'>
        Save a printable copy of your optimized route.
      </p>
    </div>
  )

  // Opens the same URL as the QR code
  const mapsLink = qrUrl && (
    <div className='text-center space-y-2'>
      <Button
        asChild
        className={isMobile ? primary : secondary}
      >
        <a
          href={qrUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          🗺️ Open in Google Maps
        </a>
      </Button>
      <p className='text-sm text-muted-foreground'>
        {isMobile
          ? 'Opens the route in the Google Maps app, or in your browser.'
          : 'Opens the route in a new tab.'}
      </p>
    </div>
  )

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

        {/* On phones, Google Maps comes first: it's the main way to use the route there */}
        {isMobile ? (
          <>
            {mapsLink}
            {qrUrl && <Separator className='my-3' />}
            {pdfOption}
          </>
        ) : (
          <>
            {pdfOption}
            {qrUrl && <Separator className='my-3' />}
            {mapsLink}
          </>
        )}

        {/* QR code on desktop only, to send the route to a phone (a phone
            can't scan its own screen) */}
        {qrUrl && !isMobile && (
          <>
            <div className='mt-2 flex justify-center'>
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
            <p className='text-center text-xs text-muted-foreground mt-1'>
              Scan to open in Google Maps on your phone
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
