import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { featureApi } from '../api/featureApi';

// Custom clean marker icon using Leaflet DivIcon
const createCustomIcon = (isSelected) => {
  return L.divIcon({
    className: 'custom-campus-marker',
    html: `<div style="
      background-color: ${isSelected ? '#134e4a' : '#1e3a8a'};
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      font-weight: bold;
      font-size: 14px;
    ">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const CampusMeetupMap = ({ selectedSpot, onSelectSpot }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await featureApi.getCampusMeetupSpots();
        if (res && res.data) {
          setSpots(res.data);
          if (!selectedSpot && res.data.length > 0 && onSelectSpot) {
            onSelectSpot(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load campus meetup spots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSpots();
  }, []);

  const defaultCenter = [12.9716, 77.5946]; // Bengaluru default coordinates

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-xs font-bold text-dark-900 uppercase tracking-wider">
          Campus Interactive Meetup Map (Leaflet & OpenStreetMap)
        </label>
        <span className="text-[11px] text-forest-800 font-semibold bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full">
          Verified Safe Public Campus Zones
        </span>
      </div>

      <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-border shadow-subtle relative z-0">
        {!loading && spots.length > 0 && (
          <MapContainer
            center={defaultCenter}
            zoom={15}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {spots.map((spot) => (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={createCustomIcon(selectedSpot?.id === spot.id)}
                eventHandlers={{
                  click: () => {
                    if (onSelectSpot) onSelectSpot(spot);
                  },
                }}
              >
                <Popup>
                  <div className="text-xs p-1 space-y-1">
                    <strong className="block text-dark-900 font-bold">{spot.name}</strong>
                    <p className="text-muted-600">{spot.description}</p>
                    <span className="inline-block text-[10px] bg-forest-100 text-forest-900 px-1.5 py-0.5 rounded font-semibold">
                      {spot.hours}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Spot Selection Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {spots.map((spot) => {
          const isSelected = selectedSpot?.id === spot.id || selectedSpot?.name === spot.name;
          return (
            <button
              type="button"
              key={spot.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSelectSpot) onSelectSpot(spot);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-forest-800 bg-forest-50 ring-1 ring-forest-800 shadow-sm'
                  : 'border-border bg-white hover:bg-ivory-50 hover:border-forest-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="font-semibold text-xs text-dark-900 truncate">{spot.name}</span>
                {isSelected ? (
                  <CheckCircle className="w-4 h-4 text-forest-800 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-muted-500 mt-1 line-clamp-1">{spot.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CampusMeetupMap;

