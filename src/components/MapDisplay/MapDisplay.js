'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icon issues with Leaflet in Next.js
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon.src || icon,
  shadowUrl: iconShadow.src || iconShadow,
})
L.Marker.prototype.options.icon = DefaultIcon

export default function MapDisplay({ coordinates }) {
  const defaultPosition = [30.2672, -97.7431] // Austin, TX as fallback

  return (
    <MapContainer
      center={coordinates?.[0] || defaultPosition}
      zoom={12}
      scrollWheelZoom={true}
      className='w-full h-full z-0'
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {coordinates?.map((coord, idx) => (
        <Marker
          key={idx}
          position={coord}
        >
          <Popup>Stop {String.fromCharCode(65 + idx)}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
