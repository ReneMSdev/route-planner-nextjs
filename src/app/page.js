'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AddressForm from '@/components/AddressForm/AddressForm'
import ImportForm from '@/components/ImportForm'
import { parseFile } from '@/components/ImportForm/parseFile'
import dynamic from 'next/dynamic'
import { geocodeAddresses } from '@/utils/geocodeAddresses'
import { fetchRoadRoute } from '@/utils/fetchRoute'
import { optimizeRoute } from '@/utils/optimizeRoute'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import ExportModal from '@/components/ExportModal'
import { generateGoogleMapsUrl } from '@/utils/generateGoogleMapsUrl'
import { downloadPdfRoute } from '@/utils/downloadRoutePdf'

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false })

export default function Home() {
  const [activeTab, setActiveTab] = useState('line')
  const [addresses, setAddresses] = useState(['', ''])

  const [coordinates, setCoordinates] = useState([])
  const [roadPolyline, setRoadPolyline] = useState([])
  // Addresses of the stops currently on the map, in route order (for the PDF)
  const [routedAddresses, setRoutedAddresses] = useState([])

  const [showExportModal, setShowExportModal] = useState(false)

  // A failed submit clears the old route so the map and Export never show a
  // route the user was trying to replace.
  const clearRoute = () => {
    setCoordinates([])
    setRoadPolyline([])
    setRoutedAddresses([])
  }

  // Accepts optional override (used by "Generate Random Route").
  // Returns true when a route was drawn, false otherwise.
  const geocodeAndSet = async (addrOverride) => {
    try {
      // 1) Choose input: override (random) or current state
      const inputRaw = Array.isArray(addrOverride) ? addrOverride : addresses

      // 2) Trim + drop empties
      const input = inputRaw.map((a) => (a || '').trim()).filter(Boolean)
      if (input.length < 2) {
        clearRoute()
        alert('Please enter at least 2 addresses or generate a random route.')
        return false
      }

      // 3) Geocode (same order/length as input, may include nulls depending on your route)
      const results = await geocodeAddresses(input)

      // 4) Keep only valid coords and their indices
      const isValidPoint = (p) =>
        Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
      const validIdx = results.map((r, i) => (isValidPoint(r) ? i : -1)).filter((i) => i >= 0)

      if (validIdx.length < 2) {
        clearRoute()
        alert(
          'We could not geocode at least two addresses. Try different ones or Generate Random Route.'
        )
        return false
      }

      const validCoords = validIdx.map((i) => results[i])
      const validAddresses = validIdx.map((i) => input[i])
      const notFound = input.filter((_, i) => !isValidPoint(results[i]))

      // 5) Optimize order (fallback to input order if optimization fails)
      let order
      try {
        order = await optimizeRoute(validCoords) // indices into validCoords
      } catch (e) {
        console.warn('optimizeRoute failed; falling back to input order:', e)
        order = validCoords.map((_, i) => i)
      }

      const reorderedCoords = order.map((i) => validCoords[i])
      const reorderedAddresses = order.map((i) => validAddresses[i])

      // 6) Update UI (addresses shown in the left panel, coords for markers).
      // Addresses that weren't found stay at the end of the list so the user can fix them.
      setAddresses([...reorderedAddresses, ...notFound])
      setCoordinates(reorderedCoords)
      setRoutedAddresses(reorderedAddresses)

      // 7) Fetch road polyline (safe-guard)
      if (reorderedCoords.length >= 2) {
        try {
          const routedPath = await fetchRoadRoute(reorderedCoords)
          setRoadPolyline(routedPath || [])
        } catch (e) {
          console.warn('fetchRoadRoute failed:', e)
          setRoadPolyline([])
        }
      } else {
        setRoadPolyline([])
      }

      setActiveTab('line') // keep user on the Line-by-line view

      // After the route is drawn, so the alert doesn't hold up the route request
      if (notFound.length > 0) {
        alert(
          `We couldn't find ${notFound.length === 1 ? 'this address' : 'these addresses'}, so ${
            notFound.length === 1 ? "it isn't" : "they aren't"
          } on the map:\n\n${notFound.join('\n')}\n\n${
            notFound.length === 1 ? "It's" : "They're"
          } kept at the end of your list so you can edit and resubmit.`
        )
      }
      return true
    } catch (err) {
      console.error(err)
      clearRoute()
      alert(err.userMessage || 'Something went wrong while building the route. Please try again.')
      return false
    }
  }

  const handleFileAccepted = (file) => {
    parseFile(file, (parsedAddresses) => {
      if (parsedAddresses.length > 0) {
        setAddresses(parsedAddresses)
        setActiveTab('line') // auto-switch to Line by line tab
      } else {
        alert(
          'No addresses found in that file. Use a header row with either an "Address" column, or "Street" and "City" columns ("State" and "Zip" optional).'
        )
      }
    })
  }

  const handleDownloadPDF = () => {
    downloadPdfRoute(routedAddresses, 'map')
  }

  return (
    <>
      <ResizablePanelGroup
        direction='horizontal'
        className='h-screen w-full'
      >
        {/* Left Panel */}
        <ResizablePanel
          defaultSize={30}
          minSize={30}
          maxSize={50}
          className='min-width-[300px]'
        >
          <div className='h-full border-r border-violet-200 bg-violet-50 pb-6'>
            <div className='flex flex-col justify-center items-center gap-1 bg-violet-200 py-6 px-4 text-center'>
              <h1 className='text-3xl font-bold text-violet-900'>Route Boss</h1>
              <p className='text-sm text-violet-800 font-semibold'>
                Plan your optimal delivery or travel route
              </p>
            </div>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='p-3 my-3 mx-4'
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger
                  value='line'
                  className='cursor-pointer'
                >
                  Line by Line
                </TabsTrigger>
                <TabsTrigger
                  value='import'
                  className='cursor-pointer'
                >
                  Import
                </TabsTrigger>
              </TabsList>

              <TabsContent value='line'>
                <AddressForm
                  stops={addresses}
                  setStops={setAddresses}
                  onSubmit={geocodeAndSet}
                  onExportClick={() => setShowExportModal(true)}
                  canExport={coordinates.length >= 2}
                />
              </TabsContent>

              <TabsContent value='import'>
                <ImportForm onFileAccepted={handleFileAccepted} />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle withHandle />

        {/* Right Panel */}
        <ResizablePanel defaultSize={70}>
          <div className='h-full'>
            <MapDisplay
              coordinates={coordinates}
              roadPolyline={roadPolyline}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onDownloadPDF={handleDownloadPDF}
        qrUrl={generateGoogleMapsUrl(coordinates)}
      />
    </>
  )
}
