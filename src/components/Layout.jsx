// src/components/Layout.jsx
import React, { useState, useEffect } from 'react';
import MapView from './mapView';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
// No need for haversine-distance anymore

const shortenDisplayName = (displayName) => {
  const parts = displayName.split(',');
  return parts.slice(0, 2).join(',');
};

const Layout = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0); // State for travel time

  // ... other states for search and suggestions ...
  const [pickupQuery, setPickupQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [debouncedPickup] = useDebounce(pickupQuery, 500);
  const [debouncedDest] = useDebounce(destQuery, 500);

  // ... useEffects for fetching suggestions remain the same ...
  useEffect(() => {
    if (debouncedPickup) {
      axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${debouncedPickup}`)
        .then(res => setPickupSuggestions(res.data));
    } else {
      setPickupSuggestions([]);
    }
  }, [debouncedPickup]);

  useEffect(() => {
    if (debouncedDest) {
      axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${debouncedDest}`)
        .then(res => setDestSuggestions(res.data));
    } else {
      setDestSuggestions([]);
    }
  }, [debouncedDest]);


  // ✅ This useEffect now calculates road distance using OSRM
  useEffect(() => {
    if (pickup && destination) {
      const { lon: lon1, lat: lat1 } = pickup;
      const { lon: lon2, lat: lat2 } = destination;
      
      axios.get(`http://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}`)
        .then(response => {
          const route = response.data.routes[0];
          // Distance is in meters, duration is in seconds
          setDistance((route.distance / 1000).toFixed(2)); // convert to km
          setDuration(Math.round(route.duration / 60)); // convert to minutes
        });
    }
  }, [pickup, destination]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <MapView pickup={pickup} destination={destination} />

      <div style={{
        position: 'absolute', top: 0, left: 0, width: '350px',
        background: 'rgba(14, 11, 11, 0.8)', padding: '1rem',
        boxSizing: 'border-box', zIndex: 1000, height: '100%'
      }}>
        <h1>Book a Ride</h1>
        
        {/* Pickup and Destination Inputs (remain the same) */}
        <div>
          <h3>Pick up Location</h3>
          <input type="text" value={pickupQuery} onChange={(e) => setPickupQuery(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          {pickupSuggestions.length > 0 && (
            <ul>{pickupSuggestions.map(s => <li key={s.place_id} onClick={() => { setPickup(s); setPickupQuery(shortenDisplayName(s.display_name)); setPickupSuggestions([]); }}>{shortenDisplayName(s.display_name)}</li>)}</ul>
          )}
        </div>
        <div style={{marginTop: '1rem'}}>
          <h3>Destination</h3>
          <input type="text" value={destQuery} onChange={(e) => setDestQuery(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          {destSuggestions.length > 0 && (
            <ul>{destSuggestions.map(s => <li key={s.place_id} onClick={() => { setDestination(s); setDestQuery(shortenDisplayName(s.display_name)); setDestSuggestions([]); }}>{shortenDisplayName(s.display_name)}</li>)}</ul>
          )}
        </div>

        {/* ✅ Updated Distance and Duration Display */}
        {distance > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Trip Details</h2>
            <p><strong>Road Distance:</strong> {distance} km</p>
            <p><strong>Estimated Time:</strong> {duration} minutes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;