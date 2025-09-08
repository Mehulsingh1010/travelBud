'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function RealMap() {
  const positions = [
    { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
    { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
    { lat: 12.9716, lng: 77.5946, name: 'Bangalore' }
  ]

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{
        height: '350px',
        width: '100%',
        borderRadius: '1rem',
        overflow: 'hidden'
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {positions.map((pos, idx) => (
        <Marker key={idx} position={[pos.lat, pos.lng]} icon={customIcon}>
          <Popup>{pos.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
