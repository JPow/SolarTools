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
  try {
    const response = await axios.get('https://re.jrc.ec.europa.eu/api/v5_2/PVcalc', {
      params: req.query
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching solar data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch solar data',
      details: error.response?.data || error.message 
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