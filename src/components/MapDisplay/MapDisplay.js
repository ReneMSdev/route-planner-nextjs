'use client'
import { useEffect } from 'react'

import { MapContainer, TileLayer, Marker, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon.src || icon,
  shadowUrl: iconShadow.src || iconShadow,
})
L.Marker.prototype.options.icon = DefaultIcon

export default function MapDisplay({ coordinates, roadPolyline }) {
  const defaultPosition = [30.2672, -97.7431] // Austin, TX as fallback

  function FitBounds({ coordinates }) {
    const map = useMap()

    useEffect(() => {
      if (!coordinates || coordinates.length === 0) return

      const bounds = L.latLngBounds(coordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }, [coordinates, map])

    return null
  }

  return (
    <MapContainer
      id='map'
      center={coordinates?.[0] || defaultPosition}
      zoom={12}
      scrollWheelZoom={true}
      className='w-full h-full z-0'
    >
      <TileLayer
        url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains={['a', 'b', 'c', 'd']}
        maxZoom={20}
      />
      <FitBounds coordinates={coordinates} />
      {coordinates?.map((coord, idx) => {
        if (!coord || coord.length !== 2) return null

        const label = String.fromCharCode(65 + idx)

        const icon = L.divIcon({
          className: 'custom-marker-label',
          html: `<div class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow">${label}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
        return (
          <Marker
            key={idx}
            position={coord}
            icon={icon}
          ></Marker>
        )
      })}
      {roadPolyline.length > 1 && (
        <Polyline
          positions={roadPolyline}
          pathOptions={{
            color: 'blue',
            weight: 6,
            opacity: 0.6,
          }}
        />
      )}
    </MapContainer>
  )
}
