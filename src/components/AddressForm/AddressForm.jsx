'use client'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import AddressField from './AddressField'
import { Button } from '../ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FaPlus } from 'react-icons/fa'

export default function AddressForm({ stops, setStops, onSubmit }) {
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
    <Card className='border-none shadow-none m-0'>
      <CardHeader className='px-0'>
        <CardTitle>One address per line</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 px-0'>
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
          onClick={onSubmit}
          className=' bg-gray-700 cursor-pointer w-70 mx-auto block'
        >
          Submit Route
        </Button>
      </CardContent>
    </Card>
  )
}
