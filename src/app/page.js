'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import AddressForm from '@/components/AddressForm'
import ImportForm from '@/components/ImportForm'

export default function Home() {
  return (
    <div className='flex h-screen'>
      {/* Left Column */}
      <div className='w-1/3 border-r border-gray-200'>
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
          defaultValue='line'
          className='p-3'
        >
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='line'>Line by Line</TabsTrigger>
            <TabsTrigger value='import'>Import</TabsTrigger>
          </TabsList>

          <TabsContent value='line'>
            <AddressForm />
          </TabsContent>

          <TabsContent value='import'>
            <ImportForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
