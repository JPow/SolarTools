const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for your React app
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://solar-data-tool.onrender.com'  // Your Render domain
    : 'http://localhost:3000'  // Your local React app
}));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
}

// Proxy endpoint for PVGIS API
app.get('/api/solar-data', async (req, res) => {
  console.log('Received request with params:', req.query);
  try {
    const pvgisUrl = 'https://re.jrc.ec.europa.eu/api/v5_2/PVcalc';
    console.log('Making request to PVGIS:', pvgisUrl);
    console.log('With parameters:', req.query);
    
    const response = await axios.get(pvgisUrl, {
      params: req.query,
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Solar-Data-Tool/1.0'
      }
    });
    
    console.log('PVGIS response status:', response.status);
    res.json(response.data);
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response data',
      request: error.request ? 'Request was made but no response received' : 'No request was made'
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch solar data',
      details: error.response?.data || error.message,
      code: error.code
    });
  }
});

// Handle React routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
}); 