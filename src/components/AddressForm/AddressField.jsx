'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Textarea } from '@/components/ui/textarea'
import { FaTimes, FaBars } from 'react-icons/fa'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import ClientOnly from '@/components/ClientOnly'

export default function AddressField({ id, label, value, onChange, onRemove, canRemove, disabled }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id, disabled })

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
          disabled={disabled}
          className='min-h-8 pr-14'
        />

        {/* Drag Handle with Tooltip */}
        <ClientOnly>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  {...attributes}
                  {...listeners}
                  className='absolute top-0 right-0 h-full w-8 bg-violet-100 hover:bg-violet-200 flex items-center justify-center cursor-grab touch-none rounded-r-sm'
                >
                  <FaBars className='text-violet-600 text-sm' />
                </div>
              </TooltipTrigger>
              <TooltipContent>Drag to reorder</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </ClientOnly>

        {/* Remove X with Tooltip */}
        {canRemove && !disabled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={onRemove}
                  className='absolute top-0 right-8 h-full flex items-center justify-center px-1 cursor-pointer'
                >
                  <FaTimes className='text-gray-500 hover:text-red-500 text-sm' />
                </div>
              </TooltipTrigger>
              <TooltipContent>Remove stop</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
