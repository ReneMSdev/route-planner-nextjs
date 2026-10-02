'use client'

import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Button } from '@/components/ui/button'

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false })

export default function Home() {
  const [activeTab, setActiveTab] = useState('line')
  const [addresses, setAddresses] = useState(['', ''])

  const [coordinates, setCoordinates] = useState([])
  const [roadPolyline, setRoadPolyline] = useState([])
  // Addresses of the stops currently on the map, in route order (for the PDF)
  const [routedAddresses, setRoutedAddresses] = useState([])

  const [showExportModal, setShowExportModal] = useState(false)

  // Below Tailwind's md breakpoint the two panels become a Stops / Map switch
  const isMobile = useMediaQuery('(max-width: 767px)')
  // Starting width of the address column (%): half on tablets (md to lg),
  // 40% on small laptops (lg to xl), 30% on wide screens
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isSmallLaptop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)')
  const sidebarSize = isTablet ? 50 : isSmallLaptop ? 40 : 30
  const [mobileView, setMobileView] = useState('stops')

  // True while a route is being built. The ref blocks a second submit before
  // React re-renders with the disabled buttons.
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)

  // A failed submit clears the old route so the map and Export never show a
  // route the user was trying to replace.
  const clearRoute = () => {
    setCoordinates([])
    setRoadPolyline([])
    setRoutedAddresses([])
  }

  // Accepts optional override (used by "Generate Random Route").
  // Returns true when a route was drawn, false otherwise. Ignored while a
  // previous request is still running. Messages are shown after the loading
  // spinner clears, so an alert never sits on top of it.
  const geocodeAndSet = async (addrOverride) => {
    if (loadingRef.current) return false
    loadingRef.current = true
    setLoading(true)
    let result
    try {
      result = await buildRoute(addrOverride)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
    if (result.message) {
      await new Promise((resolve) => setTimeout(resolve, 50)) // let the spinner disappear first
      alert(result.message)
    }
    return result.ok
  }

  // Returns { ok, message? }
  const buildRoute = async (addrOverride) => {
    try {
      // 1) Choose input: override (random) or current state
      const inputRaw = Array.isArray(addrOverride) ? addrOverride : addresses

      // 2) Trim + drop empties
      const input = inputRaw.map((a) => (a || '').trim()).filter(Boolean)
      if (input.length < 2) {
        clearRoute()
        return { ok: false, message: 'Please enter at least 2 addresses or generate a random route.' }
      }

      // 3) Geocode (same order/length as input, may include nulls depending on your route)
      const results = await geocodeAddresses(input)

      // 4) Keep only valid coords and their indices
      const isValidPoint = (p) =>
        Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
      const validIdx = results.map((r, i) => (isValidPoint(r) ? i : -1)).filter((i) => i >= 0)

      if (validIdx.length < 2) {
        clearRoute()
        return {
          ok: false,
          message:
            'We could not geocode at least two addresses. Try different ones or Generate Random Route.',
        }
      }

      const validCoords = validIdx.map((i) => results[i])
      const validAddresses = validIdx.map((i) => input[i])
      const notFound = input.filter((_, i) => !isValidPoint(results[i]))

      // Problems worth telling the user about even though a route is shown
      const warnings = []

      // 5) Optimize order (fallback to input order if optimization fails)
      let order
      try {
        order = await optimizeRoute(validCoords) // indices into validCoords
      } catch (e) {
        console.warn('optimizeRoute failed; falling back to input order:', e)
        if (e.userMessage) warnings.push(`Stops are in your original order. ${e.userMessage}`)
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
          if (e.userMessage) warnings.push(`The road route couldn't be drawn. ${e.userMessage}`)
          setRoadPolyline([])
        }
      } else {
        setRoadPolyline([])
      }

      setActiveTab('line') // keep user on the Line-by-line view

      // Shown after the route is drawn, so it doesn't hold up the route request
      if (notFound.length > 0) {
        warnings.unshift(
          `We couldn't find ${notFound.length === 1 ? 'this address' : 'these addresses'}, so ${
            notFound.length === 1 ? "it isn't" : "they aren't"
          } on the map:\n\n${notFound.join('\n')}\n\n${
            notFound.length === 1 ? "It's" : "They're"
          } kept at the end of your list so you can edit and resubmit.`
        )
      }
      return warnings.length > 0 ? { ok: true, message: warnings.join('\n\n') } : { ok: true }
    } catch (err) {
      console.error(err)
      clearRoute()
      return {
        ok: false,
        message:
          err.userMessage || 'Something went wrong while building the route. Please try again.',
      }
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

  // On mobile, show the map while the route loads and stay there if it worked.
  // Go back to the stops if it failed, so the user can fix them.
  const submitRoute = async (addrOverride) => {
    if (!isMobile) return geocodeAndSet(addrOverride)
    if (loadingRef.current) return false
    setMobileView('map')
    const ok = await geocodeAndSet(addrOverride)
    if (!ok) setMobileView('stops')
    return ok
  }

  const canExport = coordinates.length >= 2

  const header = (
    <div
      className={`flex flex-col justify-center items-center gap-1 bg-violet-200 px-4 text-center ${
        isMobile ? 'py-3' : 'py-6'
      }`}
    >
      <h1 className={`font-bold text-violet-900 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
        Route Boss
      </h1>
      <p className='text-sm text-violet-800 font-semibold'>
        Plan your optimal delivery or travel route
      </p>
    </div>
  )

  const stopsPanel = (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className={isMobile ? 'p-3' : 'p-3 my-3 mx-4'}
    >
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger
          value='line'
          disabled={loading}
          className='cursor-pointer'
        >
          Line by Line
        </TabsTrigger>
        <TabsTrigger
          value='import'
          disabled={loading}
          className='cursor-pointer'
        >
          Import
        </TabsTrigger>
      </TabsList>

      <TabsContent value='line'>
        <AddressForm
          stops={addresses}
          setStops={setAddresses}
          onSubmit={submitRoute}
          onExportClick={() => setShowExportModal(true)}
          canExport={canExport}
          loading={loading}
          // The whole mobile Stops view scrolls, so the form doesn't need its own scrollbar
          className={isMobile ? 'max-h-none overflow-visible' : undefined}
        />
      </TabsContent>

      <TabsContent value='import'>
        <ImportForm onFileAccepted={handleFileAccepted} />
      </TabsContent>
    </Tabs>
  )

  const mapPanel = (
    // isolate keeps the overlay's z-index inside this panel (below dialogs)
    <div className='relative isolate h-full'>
      <MapDisplay
        coordinates={coordinates}
        roadPolyline={roadPolyline}
      />
      {loading && (
        <div
          role='status'
          className='absolute inset-0 z-[1000] flex flex-col items-center justify-center gap-3 bg-white/50'
        >
          <Loader2 className='h-12 w-12 animate-spin text-violet-600' />
          <p className='rounded-full bg-white/90 px-4 py-1 text-sm font-semibold text-violet-900 shadow'>
            Finding your route…
          </p>
        </div>
      )}
      {isMobile && canExport && !loading && (
        <div className='absolute inset-x-0 bottom-8 z-[1000] flex justify-center px-4'>
          <Button
            className='w-full max-w-[280px] bg-white text-violet-700 border border-violet-300 shadow-md hover:bg-violet-100 cursor-pointer'
            onClick={() => setShowExportModal(true)}
          >
            Export Route
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {isMobile ? (
        // Pinned to the screen so the page itself never scrolls; only the stops list does
        <div className='fixed inset-0 flex flex-col bg-violet-50'>
          {header}

          {/* Stops / Map switch. Both views stay mounted so the form and map keep their state. */}
          <Tabs
            value={mobileView}
            onValueChange={setMobileView}
            className='border-b border-violet-300 bg-violet-200 px-4 pt-1 pb-3'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger
                value='stops'
                disabled={loading}
                className='cursor-pointer'
              >
                Stops
              </TabsTrigger>
              <TabsTrigger
                value='map'
                disabled={loading}
                className='cursor-pointer'
              >
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className={mobileView === 'stops' ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6' : 'hidden'}>
            {stopsPanel}
          </div>
          <div className={mobileView === 'map' ? 'min-h-0 flex-1' : 'hidden'}>{mapPanel}</div>
        </div>
      ) : (
        <ResizablePanelGroup
          // defaultSize only applies on mount, so remount when the starting size changes
          key={sidebarSize}
          direction='horizontal'
          className='h-screen w-full'
        >
          {/* Left Panel */}
          <ResizablePanel
            defaultSize={sidebarSize}
            minSize={30}
            maxSize={50}
            className='min-w-[300px]'
          >
            <div className='h-full border-r border-violet-200 bg-violet-50 pb-6'>
              {header}
              {stopsPanel}
            </div>
          </ResizablePanel>

          {/* Handle */}
          <ResizableHandle withHandle />

          {/* Right Panel */}
          <ResizablePanel defaultSize={100 - sidebarSize}>{mapPanel}</ResizablePanel>
        </ResizablePanelGroup>
      )}

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onDownloadPDF={handleDownloadPDF}
        qrUrl={generateGoogleMapsUrl(coordinates)}
        isMobile={isMobile}
      />
    </>
  )
}
