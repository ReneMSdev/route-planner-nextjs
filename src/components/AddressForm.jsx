'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from './ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FaTimes, FaPlus } from 'react-icons/fa'

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

  // can change the label with a custom fa 'location pin ex: A, B, etc file' or an array of custom pins.
  return (
    <Card className='border-none shadow-none m-0'>
      <CardHeader className='px-0'>
        <CardTitle>One address per line</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3 px-0'>
        {stops.map((value, i) => (
          <div
            key={i}
            className='flex gap-3 items-center'
          >
            <label className='text-sm font-medium text-gray-700'>
              {String.fromCharCode(65 + i)}
            </label>
            <Textarea
              onChange={(e) => handleAddressChange(i, e.target.value)}
              placeholder='Enter Address'
              className='min-h-8 pr-6'
            ></Textarea>
            {stops.length > 2 && (
              <FaTimes
                onClick={() => handleRemoveStop(i)}
                className='text-gray-500 cursor-pointer hover:text-red-500'
              ></FaTimes>
            )}
          </div>
        ))}

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
