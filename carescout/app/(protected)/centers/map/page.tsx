"use client";

import { useEffect, useState } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from "next/navigation";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { MapContainer as MapContainerType, TileLayer as TileLayerType, Marker as MarkerType, Popup as PopupType } from 'react-leaflet';

// Dynamically import the map components with no SSR
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
) as typeof MapContainerType;

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
) as typeof TileLayerType;

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
) as typeof MarkerType;

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
) as typeof PopupType;

// Placeholder icon fix for react-leaflet/leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

interface Center {
  id: string;
  name: string;
  address: string;
}

interface CenterWithCoords extends Center {
  lat: number;
  lng: number;
}

export default function CentersMapPage() {
  const [centers, setCenters] = useState<CenterWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const router = useRouter();

  // Set the icon for all markers
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3001/api/centers");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Center[] = await res.json();
        
        // Geocode all addresses with rate limiting
        const geocoded = [];
        for (const center of data) {
          try {
            const coords = await geocodeAddress(center.address);
            if (coords) {
              geocoded.push({ ...center, ...coords });
            }
            // Add a small delay between requests to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error geocoding ${center.address}:`, error);
          }
        }
        
        setCenters(geocoded);
        setMapLoaded(true);
      } catch (err) {
        console.error("Error fetching centers:", err);
        setError("Failed to load centers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
      // Format address for Singapore
      const parts = address.split(",");
      let formatted = address;
      if (parts.length >= 3) {
        const street = parts.slice(0, -1).join(" ").replace(/,/g, " ").replace(/\s+/g, ' ').trim();
        const postal = parts[parts.length - 1].trim();
        formatted = `${street}, Singapore ${postal}`;
      }

      const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formatted)}&key=${apiKey}&countrycode=sg&limit=1`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Map</h1>
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Childcare Centers Map</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <div className="relative w-full h-[calc(100vh-12rem)] rounded-lg overflow-hidden border">
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-muted-foreground">Loading map...</div>
            </div>
          ) : (
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
                        onClick={() => router.push(`/centers/${center.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
        {loading && <div className="mt-4 text-muted-foreground">Loading centers...</div>}
      </div>
    </div>
  );
} 