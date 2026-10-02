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

const defaultPosition = [37.79, -122.345] // between SF and Oakland (over the Bay Bridge)

const validateLatLng = (arr = []) =>
  arr.filter(
    (p) => Array.isArray(p) && p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1])
  )

// Defined at module level so it isn't remounted on every render. It refits only
// when a new route arrives, not when the user is zooming or typing.
function FitBounds({ coordinates, roadPolyline }) {
  const map = useMap()
  useEffect(() => {
    const pts = [...validateLatLng(coordinates), ...validateLatLng(roadPolyline)]
    if (pts.length === 0) return
    map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] })
  }, [coordinates, roadPolyline, map])
  return null
}

// Leaflet only notices window resizes. This keeps the map filling its container
// when the container changes size on its own: dragging the desktop panel handle,
// or the mobile Map view going from hidden to shown.
function TrackContainerSize() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

export default function MapDisplay({ coordinates, roadPolyline }) {
  const validStops = validateLatLng(coordinates)
  const validPolyline = validateLatLng(roadPolyline)

  return (
    <MapContainer
      id='map'
      center={validStops[0] || defaultPosition} // ✅ safe
      zoom={12}
      scrollWheelZoom
      className='w-full h-full z-0'
    >
      <TileLayer
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      <TrackContainerSize />

      <FitBounds
        coordinates={coordinates}
        roadPolyline={roadPolyline}
      />

      {validStops.map((coord, idx) => {
        const label = String.fromCharCode(65 + idx)
        const labelIcon = L.divIcon({
          // ✅ avoid shadowing "icon" import
          className: 'custom-marker-label',
          html: `<div class="bg-violet-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow">${label}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })
        return (
          <Marker
            key={idx}
            position={coord}
            icon={labelIcon}
          />
        )
      })}

      {validPolyline.length > 1 && (
        <Polyline
          positions={validPolyline}
          pathOptions={{ color: '#7c3aed', weight: 6, opacity: 0.7 }}
        />
      )}
    </MapContainer>
  )
}
