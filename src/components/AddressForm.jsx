'use client'

import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from './ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from './ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FaTimes, FaPlus, FaBars } from 'react-icons/fa'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export default function AddressForm() {
  const [stops, setStops] = useState(['', ''])

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
              <SortableItem
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
          onClick={() => console.log(stops)}
          className='w-full bg-gray-700 cursor-pointer'
        >
          Submit Route
        </Button>
      </CardContent>
    </Card>
  )
}

function SortableItem({ id, label, value, onChange, onRemove, canRemove }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='flex gap-3 items-center'
    >
      <label className='text-sm font-medium text-gray-700'>{label}</label>

      <div className='relative w-full'>
        <Textarea
          onChange={(e) => onChange(e.target.value)}
          value={value}
          placeholder='Enter Address'
          className='min-h-8 pr-10'
        />

        {/* Drag Handle w Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                {...attributes}
                {...listeners}
                className='absolute top-0 right-0 h-full rounded-r-sm flex items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-grab p-1 text-sm'
              >
                <FaBars className='text-gray-500 text-sm' />
              </div>
            </TooltipTrigger>
            <TooltipContent>Drag</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Remove X */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {canRemove && (
                <div
                  className='absolute top-0 right-6 h-full flex items-center justify-center px-1 cursor-pointer'
                  onClick={onRemove}
                >
                  <FaTimes className=' text-gray-500 cursor-pointer hover:text-red-500 text-sm' />
                </div>
              )}
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
