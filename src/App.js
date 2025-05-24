import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix for default marker icons in Leaflet with React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function App() {
  const [loading, setLoading] = useState(false);
  const [solarData, setSolarData] = useState(null);
  const [error, setError] = useState(null);

  const handleLocationSelect = async (latlng) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://re.jrc.ec.europa.eu/api/v5_2/PVcalc', {
        params: {
          lat: latlng.lat,
          lon: latlng.lng,
          raddatabase: 'SARAH3',
          pvtechchoice: 'crystSi',
          peakpower: 10,
          loss: 14,
          mountingplace: 'free',
          components: 1,
          outputformat: 'json'
        }
      });
      setSolarData(response.data);
    } catch (err) {
      setError('Failed to fetch solar data. Please try again.');
      console.error('Error fetching solar data:', err);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4">Solar Data Tool for Denmark</Typography>
        <Typography variant="subtitle1">Click on your location to get solar data</Typography>
      </Box>
      
      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[56.26392, 9.501785]} // Center of Denmark
          zoom={7}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </Box>

      {loading && (
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Paper sx={{ p: 2, m: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {solarData && (
        <Paper sx={{ p: 2, m: 2, maxHeight: '300px', overflow: 'auto' }}>
          <Typography variant="h6">Solar Data Results</Typography>
          <pre>{JSON.stringify(solarData, null, 2)}</pre>
        </Paper>
      )}
    </Box>
  );
}

export default App; 