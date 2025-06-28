// src/components/DynamicMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Leaflet의 기본 아이콘이 깨지는 것을 방지하는 설정
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface Recommendation {
  placeName: string;
  category: string;
  reason: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  recommendations: Recommendation[];
}

export default function MapComponent({ recommendations }: MapProps) {
  if (recommendations.length === 0) {
    return <div>Loading map...</div>;
  }

  // 지도의 중심점을 첫 번째 추천 장소로 설정
  const center: [number, number] = [recommendations[0].latitude, recommendations[0].longitude];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {recommendations.map((rec, index) => (
        <Marker key={index} position={[rec.latitude, rec.longitude]}>
          <Popup>
            <div className="font-sans">
              <h3 className="font-bold text-base mb-1">{rec.placeName}</h3>
              <p className="text-sm text-gray-600">{rec.reason}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}