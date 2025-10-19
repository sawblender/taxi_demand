// src/components/MapView.jsx
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';

const Routing = ({ pickup, destination }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    if (pickup && destination) {
      routingControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(pickup.lat, pickup.lon),
          L.latLng(destination.lat, destination.lon)
        ],
        routeWhileDragging: true,
        show: false, // Hides the turn-by-turn instructions
        createMarker: () => null // Hides the default A and B markers
      }).addTo(map);
    }
  }, [map, pickup, destination]);

  return null;
};

const MapView = ({ pickup, destination }) => {
  const [currentPosition, setCurrentPosition] = React.useState([13.0827, 80.2707]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      setCurrentPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  return (
    <MapContainer 
      center={currentPosition} 
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {pickup && <Marker position={[pickup.lat, pickup.lon]}><Popup>Pickup</Popup></Marker>}
      {destination && <Marker position={[destination.lat, destination.lon]}><Popup>Destination</Popup></Marker>}
      
      <Routing pickup={pickup} destination={destination} />
    </MapContainer>
  );
};

export default MapView;