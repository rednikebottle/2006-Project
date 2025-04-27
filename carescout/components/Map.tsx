import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

interface Center {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface MapProps {
  centers: Center[];
  onCenterClick: (centerId: string) => void;
}

export default function Map({ centers, onCenterClick }: MapProps) {
  return (
    <MapContainer 
      center={[1.3521, 103.8198]} 
      zoom={12} 
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {centers.map((center) => (
        <Marker key={center.id} position={[center.lat, center.lng]}>
          <Popup>
            <div className="flex flex-col gap-2">
              <strong className="text-lg">{center.name}</strong>
              <p className="text-sm text-gray-600">{center.address}</p>
              <button
                onClick={() => onCenterClick(center.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 