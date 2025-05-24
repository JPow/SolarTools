# Solar Data Tool for Energy Communities

A web application that enables Energy Communities to estimate solar power generation potential for specific locations in Denmark. This tool helps communities make informed decisions about solar energy investments by providing accurate solar radiation and PV system performance data.

## Features

- Interactive map interface for location selection
- Real-time solar data retrieval
- Detailed solar production estimates including:
  - Daily average production
  - Monthly average production
  - Yearly total production
  - System losses (angle of incidence, spectral, temperature)
- User-friendly interface with Material-UI components

## Data Source

This application uses the [PVGIS API](https://joint-research-centre.ec.europa.eu/pvgis-photovoltaic-geographical-information-system_en) (Photovoltaic Geographical Information System) provided by the European Commission's Joint Research Centre. The data includes:

- Solar radiation data from the SARAH-2 database
- PV system performance calculations
- Temperature and weather effects
- System loss estimations

## Technical Stack

- Frontend:
  - React.js
  - Material-UI for components
  - Leaflet for interactive maps
  - React-Leaflet for React integration

- Backend:
  - Node.js
  - Express.js
  - Axios for API requests

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/JPow/SolarTools.git
   cd SolarTools
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   This will start both the React frontend (port 3000) and Express backend (port 3001).

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Open the application in your web browser
2. Click on the map to select a location in Denmark
3. The application will automatically fetch and display:
   - Annual solar production estimates
   - System losses
   - Other relevant solar data

## Deployment

The application is deployed on Render:
- Frontend: [https://solar-data-tool.onrender.com](https://solar-data-tool.onrender.com)
- Backend API: [https://solar-data-tool-api.onrender.com](https://solar-data-tool-api.onrender.com)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. This project is licensed under the GNU General Public License v3.0, which means any improvements or modifications must be shared back with the community.

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

## Acknowledgments

- European Commission's Joint Research Centre for providing the PVGIS API
- OpenStreetMap for map data
- The Energy Community movement for inspiring this tool 