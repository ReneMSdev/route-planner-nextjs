'use client'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useRef, useState } from 'react'
import AddressField from './AddressField'
import { Button } from '../ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FaPlus } from 'react-icons/fa'
import { getRandomDemoRoute } from '@/utils/demoAddresses'

export default function AddressForm({ stops, setStops, onSubmit, onExportClick }) {
  const [routeSubmitted, setRouteSubmitted] = useState(false)
  const bottomRef = useRef(null)

  const handleSubmit = () => {
    onSubmit()
    setRouteSubmitted(true)
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }

  const handleGenerateRandom = () => {
    const demo = getRandomDemoRoute(5)
    setStops(demo)
    onSubmit(demo)
    setRouteSubmitted(true)
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }, 100)
    })
  }

  const handleAddStop = () => {
    setStops([...stops, ''])
  }

  const handleRemoveStop = (indexToRemove) => {
    setStops((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  const handleAddressChange = (i, newValue) => {
    const updated = [...stops]
    updated[i] = newValue
    setStops(updated)
  }

  const handleDragEnd = (e) => {
    const { active, over } = e
    if (active.id !== over?.id) {
      const oldIndex = stops.findIndex((_, i) => `item-${i}` === active.id)
      const newIndex = stops.findIndex((_, i) => `item-${i}` === over.id)
      setStops((prev) => arrayMove(prev, oldIndex, newIndex))
    }
  }

  return (
    <Card className='border-none shadow-none m-0 px-3 pt-3 max-h-[70vh] overflow-y-auto'>
      <CardHeader className='px-0'>
        <CardTitle className='text-gray-700'>One address per line</CardTitle>
        <p className='text-sm text-muted-foreground'>Address "A" will be your starting location</p>
        <p className='text-sm text-muted-foreground'>You may readjust by dragging</p>
      </CardHeader>
      <CardContent className='space-y-3  px-0 pb-8'>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={stops.map((_, i) => `item-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            {stops.map((value, i) => (
              <AddressField
                key={`item-${i}`}
                id={`item-${i}`}
                index={i}
                label={String.fromCharCode(65 + i)}
                value={value}
                onChange={(val) => handleAddressChange(i, val)}
                onRemove={() => handleRemoveStop(i)}
                canRemove={stops.length > 2}
              />
            ))}
          </SortableContext>
        </DndContext>

        <div
          onClick={handleAddStop}
          className='flex gap-2 items-center font-semibold text-sm text-gray-700 hover:cursor-pointer hover:text-green-500'
        >
          <FaPlus />
          <p>Add another stop</p>
        </div>

        <Separator className='my-4' />

        <Button
          onClick={handleSubmit}
          className='text-white bg-orange-400 cursor-pointer w-full max-w-[280px] mx-auto block hover:bg-orange-300'
        >
          Submit Route
        </Button>

        <Button
          className='text-white bg-orange-400 cursor-pointer w-full max-w-[280px] mx-auto block hover:bg-orange-300'
          onClick={handleGenerateRandom}
        >
          Generate Random Route
        </Button>

        {routeSubmitted && (
          <div
            className='mt-4 text-center'
            ref={bottomRef}
          >
            <Button
              className='text-white w-full max-w-[280px] bg-slate-600 hover:bg-slate-500 cursor-pointer'
              onClick={onExportClick}
            >
              Export Route
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
