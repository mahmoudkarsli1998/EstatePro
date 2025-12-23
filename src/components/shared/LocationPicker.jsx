import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map clicks
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
      map.flyTo([lat, lng], map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

// Component to fly to selected city coordinates
const CityUpdater = ({ city }) => {
  const map = useMap();
  useEffect(() => {
    if (city) {
        // Simple mapping for demo cities - in real app, use geocoding API
        const cityCoords = {
            'cairo': [30.0444, 31.2357],
            'alexandria': [31.2001, 29.9187],
            'giza': [30.0131, 31.2089],
            'sharm': [27.9158, 34.3299],
            'hurghada': [27.2579, 33.8116],
            'maadi': [29.9602, 31.2569],
            'default': [30.0444, 31.2357]
        };
        
        const coords = cityCoords[city.toLowerCase()] || cityCoords['default'];
        if(coords) {
             map.flyTo(coords, 12);
        }
    }
  }, [city, map]);
  return null;
};

const LocationPicker = ({ lat, lng, onLocationSelect, selectedCity }) => {
  const [position, setPosition] = useState([30.0444, 31.2357]);

  useEffect(() => {
    if (lat && lng) {
      setPosition([parseFloat(lat), parseFloat(lng)]);
    }
  }, [lat, lng]);

  return (
    <div className="h-full w-full z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onLocationSelect={onLocationSelect} 
        />
        <CityUpdater city={selectedCity} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
