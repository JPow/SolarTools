import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Box, Paper, Typography, CircularProgress, Alert, TextField } from '@mui/material';
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

function SolarDataDisplay({ data }) {
  if (!data) return null;

  const { outputs } = data;
  const { totals } = outputs;
  const { fixed } = totals;

  // Helper function to format numbers or strings
  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Annual Solar Production</Typography>
      <Typography variant="body1">
        Daily Average: {formatValue(fixed.E_d)} kWh/day
      </Typography>
      <Typography variant="body1">
        Monthly Average: {formatValue(fixed.E_m)} kWh/month
      </Typography>
      <Typography variant="body1">
        Yearly Total: {formatValue(fixed.E_y)} kWh/year
      </Typography>
      
      <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>System Losses</Typography>
      <Typography variant="body1">
        Angle of Incidence Loss: {formatValue(fixed.l_aoi)}%
      </Typography>
      <Typography variant="body1">
        Spectral Loss: {formatValue(fixed.l_spec)}%
      </Typography>
      <Typography variant="body1">
        Temperature Loss: {formatValue(fixed.l_tg)}%
      </Typography>
      <Typography variant="body1">
        Total Loss: {formatValue(fixed.l_total)}%
      </Typography>
    </Box>
  );
}

function App() {
  const [loading, setLoading] = useState(false);
  const [solarData, setSolarData] = useState(null);
  const [error, setError] = useState(null);
  const [solarSize, setSolarSize] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [solarSizeInput, setSolarSizeInput] = useState('10');

  const handleSolarSizeChange = (e) => {
    const value = e.target.value;
    setSolarSizeInput(value);
    
    // Only update the actual solar size if we have a valid number
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue > 0) {
      setSolarSize(numValue);
    } else {
      setSolarSize(null); // Set to null when input is empty or invalid
    }
  };

  const fetchSolarData = async (latlng, size) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat: latlng.lat,
        lon: latlng.lng,
        loss: 14,
        raddatabase: 'PVGIS-SARAH2',
        pvtechchoice: 'crystSi',
        peakpower: size,
        mountingplace: 'free',
        components: 1,
        outputformat: 'json'
      });

      const apiUrl = `${process.env.NODE_ENV === 'production' 
        ? 'https://solar-data-tool-api.onrender.com' 
        : 'http://localhost:3001'}/api/solar-data?${params}`;

      console.log('Making request to:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || `HTTP error! status: ${response.status}`;
        } catch (e) {
          errorMessage = response.statusText || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      if (!data || !data.outputs) {
        throw new Error('Invalid data format received from server');
      }

      setSolarData(data);
    } catch (err) {
      console.error('Error fetching solar data:', err);
      setError(err.message || 'Failed to fetch solar data. Please try again.');
    }
    setLoading(false);
  };

  const handleLocationSelect = async (latlng) => {
    setSelectedLocation(latlng);
    await fetchSolarData(latlng, solarSize);
  };

  useEffect(() => {
    if (selectedLocation && solarSize !== null) {
      fetchSolarData(selectedLocation, solarSize);
    } else if (solarSize === null) {
      setSolarData(null); // Clear the data when input is empty
    }
  }, [solarSize]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4">Solar Data Tool for Denmark</Typography>
        <Typography variant="subtitle1">Click on your location to get solar data</Typography>
      </Box>
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Solar Size (KWp)"
          type="number"
          value={solarSizeInput}
          onChange={handleSolarSizeChange}
          inputProps={{ min: 1, max: 1000 }}
          sx={{ width: '200px' }}
          disabled={!selectedLocation}
        />
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
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {solarData && (
        <Paper sx={{ m: 2, maxHeight: '300px', overflow: 'auto' }}>
          <SolarDataDisplay data={solarData} />
        </Paper>
      )}
    </Box>
  );
}

export default App; 