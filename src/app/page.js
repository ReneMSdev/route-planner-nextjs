'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import AddressForm from '@/components/AddressForm/AddressForm'
import ImportForm from '@/components/ImportForm'
import { parseFile } from '@/components/ImportForm/parseFile'
import dynamic from 'next/dynamic'
import { geocodeAddresses } from '@/utils/geocodeAddresses'

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false })

export default function Home() {
  const [activeTab, setActiveTab] = useState('import')
  const [addresses, setAddresses] = useState(['', ''])

  const [coordinates, setCoordinates] = useState([])

  const geocodeAndSet = async () => {
    const results = await geocodeAddresses(addresses)
    setCoordinates(results)
  }

  const handleFileAccepted = (file) => {
    parseFile(file, (parsedAddresses) => {
      if (parsedAddresses.length > 0) {
        setAddresses(parsedAddresses)
        setActiveTab('line') // auto-switch to Line by line tab
      }
    })
  }

  return (
    <div className='flex h-screen'>
      {/* Left Column */}
      <div className='w-1/3 min-w-[300px] border-r border-gray-300'>
        <div className='flex justify-center items-center gap-5 bg-gray-700 py-6 px-2'>
          <h1 className='text-3xl font-bold text-white'>Route Boss</h1>
          <Separator
            orientation='vertical'
            className='bg-gray-300 h-12'
          />
          <p className='text-sm text-gray-300'>Plan your optimal delivery or travel route</p>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='p-3'
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
            />
          </TabsContent>

          <TabsContent value='import'>
            <ImportForm onFileAccepted={handleFileAccepted} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column */}
      <div className='flex-1'>
        <MapDisplay coordinates={coordinates} />
      </div>
    </div>
  )
}
