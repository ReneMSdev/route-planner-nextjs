'use client'
import { useEffect, useRef } from 'react'
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

const isZeroSize = (map) => {
  const { x, y } = map.getSize()
  return x === 0 || y === 0
}

// Defined at module level so it isn't remounted on every render. It refits only
// when a new route arrives, not when the user is zooming or typing.
//
// Leaflet only notices window resizes, so it also watches the container: dragging
// the desktop panel handle, or the mobile Map view going from hidden to shown.
// A route that arrives while the map is hidden (0x0, e.g. after switching from
// the desktop to the phone layout on the Stops view) can't be fitted then;
// Leaflet would pick its maximum zoom. It's fitted once the map has a size.
function FitBounds({ coordinates, roadPolyline }) {
  const map = useMap()
  const pendingFit = useRef(null)

  useEffect(() => {
    const pts = [...validateLatLng(coordinates), ...validateLatLng(roadPolyline)]
    if (pts.length === 0) {
      pendingFit.current = null
      return
    }
    const bounds = L.latLngBounds(pts)
    if (isZeroSize(map)) {
      pendingFit.current = bounds
      return
    }
    pendingFit.current = null
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [coordinates, roadPolyline, map])

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
      if (pendingFit.current && !isZeroSize(map)) {
        map.fitBounds(pendingFit.current, { padding: [50, 50] })
        pendingFit.current = null
      }
    })
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
