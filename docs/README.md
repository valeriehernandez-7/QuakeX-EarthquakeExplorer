# QuakeX - Earthquake Data Explorer & Analytics Platform

![QuakeX Banner](https://img.shields.io/badge/QuakeX-Earthquake%20Explorer-blue?style=flat-square)
![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![Apache Drill](https://img.shields.io/badge/Apache%20Drill-Analytics-orange?style=flat-square)
![License](https://img.shields.io/badge/License-Academic-green?style=flat-square)

**QuakeX** is a comprehensive earthquake data visualization and analytics platform that transforms complex seismic information into accessible, actionable insights. Built with modern web technologies, QuakeX provides real-time earthquake monitoring, interactive mapping, and powerful SQL-based analytics through Apache Drill integration.

> 🌍 **Making complex seismic data accessible through modern web technologies and intelligent analytics.**

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Analytics with Apache Drill](#-analytics-with-apache-drill)
- [Data Enrichment Pipeline](#-data-enrichment-pipeline)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)
- [Author](#-author)

---

## ✨ Features

### 🗺️ Interactive Visualization

- **Real-time Earthquake Map**: Interactive Leaflet-based 2D globe displaying worldwide seismic activity
- **Dynamic Filtering**: Filter earthquakes by magnitude, depth, date range, and geographic location
- **Cluster Visualization**: Smart marker clustering for improved performance with large datasets
- **Detailed Event Cards**: Comprehensive information for each earthquake including weather context and elevation data

### 📊 Advanced Analytics

- **Apache Drill Integration**: Schema-free SQL queries on JSON earthquake datasets
- **Pre-built Query Templates**: Common analytical queries for magnitude distribution, temporal patterns, and geographic analysis
- **Custom SQL Execution**: Direct SQL interface for advanced users
- **Visual Reports**: Auto-generated charts and statistical summaries
- **Data Export**: Download enriched datasets and analysis results in JSON format

### 🌐 Multi-Source Data Enrichment

- **USGS Earthquake Data**: Real-time seismic events from the United States Geological Survey
- **Geographic Intelligence**: Automatic country identification using REST Countries API
- **Elevation Data**: Precise elevation information from Open-Meteo Elevation API
- **Weather Context**: Historical weather conditions at earthquake locations via Open-Meteo Weather API
- **Temporal Analysis**: Automatic season, quarter, and time-of-day categorization

### 🎯 User Experience

- **Responsive Design**: Fully responsive interface optimized for desktop, tablet, and mobile
- **PrimeVue Components**: Professional UI components with consistent design language
- **Real-time Updates**: Live data fetching with loading states and error handling
- **Caching Strategy**: Smart caching to minimize API calls and improve performance
- **Accessibility**: WCAG-compliant interface with keyboard navigation support

---

## 🛠️ Technology Stack

### Frontend

- **[Vue.js 3](https://vuejs.org/)** - Progressive JavaScript framework with Composition API
- **[Vue Router 4](https://router.vuejs.org/)** - Official routing library
- **[Pinia](https://pinia.vuejs.org/)** - State management with persistence
- **[PrimeVue 4](https://primevue.org/)** - Rich UI component library
- **[Leaflet](https://leafletjs.com/)** - Interactive mapping library
- **[Chart.js](https://www.chartjs.org/)** - Data visualization charts
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite 7](https://vitejs.dev/)** - Next-generation frontend tooling

### Backend & Data

- **[Node.js](https://nodejs.org/)** - JavaScript runtime (v20+)
- **[Express.js 5](https://expressjs.com/)** - Minimal web framework for JSON data management
- **[Apache Drill](https://drill.apache.org/)** - Schema-free SQL query engine for JSON analytics
- **[Docker](https://www.docker.com/)** - Containerization for Apache Drill deployment

### APIs & Data Sources

- **[USGS Earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/)** - Real-time seismic data
- **[REST Countries API](https://restcountries.com/)** - Comprehensive country information
- **[Open-Meteo Elevation API](https://open-meteo.com/en/docs/elevation-api)** - Elevation data
- **[Open-Meteo Weather API](https://open-meteo.com/en/docs/historical-weather-api)** - Historical weather data

### Development Tools

- **ESLint** - JavaScript linting with Vue.js plugin
- **Prettier** - Code formatting
- **Vue Devtools** - Vue.js debugging browser extension

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        QuakeX Frontend                      │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐    │
│  │  Map View  │  │ Analytics  │  │   About & Info      │    │
│  │  (Leaflet) │  │   View     │  │                     │    │
│  └────────────┘  └────────────┘  └─────────────────────┘    │
│         │               │                                   │
│         └───────────────┴─────────────────┐                 │
│                                           │                 │
│              ┌────────────────────────────▼───────┐         │
│              │     Pinia State Management         │         │
│              │  (Earthquakes, Filters, Settings)  │         │
│              └────────────────────────────────────┘         │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼───────┐
│  USGS API      │  │  Countries  │  │  Weather API   │
│  Earthquakes   │  │     API     │  │  Elevation API │
└────────────────┘  └─────────────┘  └────────────────┘
        │                  │                  │
        │                  │                  │
        │                  │                  │
┌───────▼──────────────────▼──────────────────▼──────────┐
│         JSON Manager Server (Express.js)               │
│      Saves enriched earthquake datasets                │
└────────────────────────────┬───────────────────────────┘
                             │
                   ┌─────────▼──────────┐
                   │   /data Directory  │
                   │   JSON Datasets    │
                   └─────────┬──────────┘
                             │
                   ┌─────────▼──────────────────┐
                   │   Apache Drill (Docker)    │
                   │   SQL Analytics Engine     │
                   │   http://localhost:8047    │
                   └────────────────────────────┘
```

---

## 📦 Prerequisites

Before installing QuakeX, ensure you have the following installed:

- **Node.js**: v20.19.0 or v22.12.0+ ([Download](https://nodejs.org/))
- **npm**: v10+ (comes with Node.js)
- **Docker**: Latest version ([Download](https://www.docker.com/get-started))
- **Docker Compose**: v2.0+ (included with Docker Desktop)
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

### System Requirements

- **RAM**: Minimum 4GB (8GB recommended for Apache Drill)
- **Disk Space**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/valeriehernandez-7/QuakeX-EarthquakeExplorer.git
cd QuakeX-EarthquakeExplorer/quakex
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install JSON Manager Server Dependencies

```bash
cd server
npm install
cd ..
```

### 4. Start Apache Drill with Docker

```bash
npm run drill:up
```

This command uses Docker Compose to start Apache Drill in embedded mode. Wait approximately 30-60 seconds for Drill to fully initialize.

**Verify Drill is running:**

- Open your browser and navigate to [http://localhost:8047](http://localhost:8047)
- You should see the Apache Drill Web UI

### 5. Configure DFS Storage Plugin

1. Navigate to [http://localhost:8047/storage](http://localhost:8047/storage)
2. Click on **"dfs"** storage plugin
3. Click **"Update"**
4. Replace the configuration with the content from `drill/drill-dfs-storage-plugin.json`
5. Click **"Update"** to save

This configuration maps the `/data` directory to Apache Drill for querying JSON files.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root (already provided):

```env
# API Endpoints
VITE_USGS_API_URL=https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&orderby=time
VITE_WEATHER_API_URL=https://archive-api.open-meteo.com/v1/archive
VITE_ELEVATION_API_URL=https://api.open-meteo.com/v1/elevation
VITE_COUNTRIES_API_URL=https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,latlng,area,flags,maps,population,timezones
VITE_DRILL_API_URL=http://localhost:5173/api/drill

# API Documentation Links (for reference)
# USGS Earthquake Catalog API: https://earthquake.usgs.gov/fdsnws/event/1/
# Open-Meteo Historical Weather API: https://open-meteo.com/en/docs/historical-weather-api
# Open-Meteo Elevation API: https://open-meteo.com/en/docs/elevation-api
# REST Countries API: https://restcountries.com/
# Apache Drill: https://drill.apache.org/docs/
```

### Application Settings

Modify `src/utils/constants.js` to customize application behavior:

```javascript
export const APP_SETTINGS = {
  requestTimeout: 30000, // API request timeout (ms)
  maxEarthquakesToDisplay: 10000, // Maximum earthquakes to fetch
  defaultMinMagnitude: 2.5, // Default minimum magnitude filter
  cacheExpirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
};
```

---

## 💻 Usage

### Starting the Application

You'll need **three terminal windows** running simultaneously:

#### Terminal 1: Apache Drill (Docker)

```bash
npm run drill:up
```

**Status**: Drill Web UI available at [http://localhost:8047](http://localhost:8047)

#### Terminal 2: JSON Manager Server

```bash
npm run server
```

**Status**: Server running on [http://localhost:3001](http://localhost:3001)

**Available endpoints:**

- `GET /api/health` - Server health check
- `POST /api/save-json` - Save enriched earthquake data
- `GET /api/files` - List available JSON datasets
- `GET /api/files/:filename` - Retrieve specific dataset

#### Terminal 3: Vue.js Development Server

```bash
npm run dev
```

**Status**: Application running on [http://localhost:5173](http://localhost:5173)

### Quick Start Guide

1. **Navigate to Map View** (default landing page)

   - View real-time earthquakes on the interactive map
   - Use the filter sidebar to refine results by magnitude, date, or location
   - Click on any earthquake marker for detailed information

2. **Explore Analytics**

   - Navigate to **Analytics** tab
   - Generate monthly enriched datasets (first-time users)
   - Execute pre-built SQL queries or write custom queries
   - View auto-generated charts and statistical summaries
   - Export results as JSON

3. **Learn About the Project**
   - Visit the **About** page for project information, technology stack, and developer details

### Stopping the Application

```bash
# Stop Vite dev server: Ctrl+C in Terminal 3
# Stop JSON Manager: Ctrl+C in Terminal 2
# Stop Apache Drill:
npm run drill:down
```

---

## 📁 Project Structure

```
quakex/
├── data/                           # JSON datasets for Apache Drill
│   ├── earthquakes-2025-08.json   # Enriched monthly earthquake data
│   ├── earthquakes-2025-09.json
│   └── earthquakes-2025-10.json
│
├── drill/                          # Apache Drill configuration
│   ├── drill-dfs-storage-plugin.json  # DFS storage plugin config
│   └── queries-testing.txt            # Sample SQL queries
│
├── public/                         # Static assets
│   └── favicon.ico
│
├── server/                         # JSON Manager Express server
│   ├── json-manager.js            # Main server file
│   ├── package.json
│   └── package-lock.json
│
├── src/
│   ├── assets/                    # CSS and static assets
│   │   └── main.css              # Global styles
│   │
│   ├── components/                # Vue components
│   │   ├── filters/
│   │   │   └── FilterSidebar.vue    # Earthquake filtering interface
│   │   ├── layout/
│   │   │   └── AppNavbar.vue        # Navigation bar
│   │   └── map/
│   │       ├── EarthquakeDetailCard.vue  # Event detail modal
│   │       └── EarthquakeMap.vue         # Leaflet map component
│   │
│   ├── router/                    # Vue Router configuration
│   │   └── index.js              # Route definitions
│   │
│   ├── services/                  # API service layer
│   │   ├── countriesService.js          # REST Countries API
│   │   ├── drillService.js              # Apache Drill queries
│   │   ├── elevationService.js          # Elevation API
│   │   ├── monthlyDataGeneratorService.js  # Data enrichment
│   │   ├── monthlyDataManagerService.js    # Dataset management
│   │   ├── usgsService.js               # USGS Earthquake API
│   │   └── weatherService.js            # Weather API
│   │
│   ├── stores/                    # Pinia state management
│   │   └── appStore.js           # Global application state
│   │
│   ├── utils/                     # Utility functions
│   │   ├── analyticsHelpers.js   # Analytics processing utilities
│   │   ├── constants.js          # App constants and API endpoints
│   │   └── helpers.js            # General helper functions
│   │
│   ├── views/                     # Page components
│   │   ├── AboutView.vue         # About/Info page
│   │   ├── AnalyticsView.vue     # Analytics dashboard
│   │   └── MapView.vue           # Map page
│   │
│   ├── App.vue                    # Root component
│   └── main.js                    # Application entry point
│
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
├── docker-compose.yml             # Apache Drill Docker configuration
├── index.html                     # HTML entry point
├── package.json                   # Project dependencies
├── vite.config.js                 # Vite configuration
└── README.md                      # This file
```

---

## 🔌 API Integration

### USGS Earthquake Catalog API

**Base URL**: `https://earthquake.usgs.gov/fdsnws/event/1/query`

**Example Usage**:

```javascript
import { fetchEarthquakes } from "@/services/usgsService";

const earthquakes = await fetchEarthquakes({
  startTime: new Date("2025-10-01"),
  endTime: new Date("2025-10-31"),
  minMagnitude: 4.5,
  limit: 1000,
});
```

**Available Functions**:

- `fetchEarthquakes(params)` - Fetch earthquakes with filters
- `fetchEarthquakeById(eventId)` - Get specific earthquake by ID
- `fetchSignificantEarthquakes()` - Get M4.5+ earthquakes from last 7 days
- `fetchEarthquakesForPeriod(timePeriod)` - Fetch by predefined period

### REST Countries API

**Base URL**: `https://restcountries.com/v3.1/all`

**Example Usage**:

```javascript
import { findCountryByCoordinates } from "@/services/countriesService";

const country = await findCountryByCoordinates(9.7489, -83.7534);
// Returns: { name: "Costa Rica", region: "Americas", ... }
```

**Available Functions**:

- `fetchAllCountries()` - Get all countries (with caching)
- `findCountryByName(name)` - Search by country name
- `findCountryByCoordinates(lat, lon)` - Find nearest country
- `findCountriesByRegion(region)` - Filter by region

### Open-Meteo Elevation API

**Base URL**: `https://api.open-meteo.com/v1/elevation`

**Example Usage**:

```javascript
import { fetchElevation } from "@/services/elevationService";

const elevation = await fetchElevation({
  latitude: 9.7489,
  longitude: -83.7534,
});
// Returns: { elevation: 1157, unit: "meters" }
```

### Open-Meteo Weather API

**Base URL**: `https://archive-api.open-meteo.com/v1/archive`

**Example Usage**:

```javascript
import { fetchWeatherForEarthquake } from "@/services/weatherService";

const weather = await fetchWeatherForEarthquake(earthquake);
// Returns: { temperature, precipitation, windSpeed, ... }
```

---

## 📈 Analytics with Apache Drill

### Accessing the Drill Web UI

1. Open [http://localhost:8047](http://localhost:8047) in your browser
2. Navigate to **Query** tab
3. Execute SQL queries against your JSON datasets

### Sample Queries

#### 1. Earthquakes by Magnitude Range

```sql
SELECT
    CAST(`magnitude` AS DOUBLE) as magnitude,
    place,
    `time`
FROM dfs.`/data/earthquakes-2025-10.json`
WHERE CAST(`magnitude` AS DOUBLE) >= 5.0
ORDER BY magnitude DESC
LIMIT 20;
```

#### 2. Top 10 Countries by Earthquake Count

```sql
SELECT
    `country`['name'] as country_name,
    COUNT(*) as earthquake_count,
    AVG(CAST(`magnitude` AS DOUBLE)) as avg_magnitude
FROM dfs.`/data/earthquakes-2025-10.json`
WHERE `country`['name'] IS NOT NULL
GROUP BY `country`['name']
ORDER BY earthquake_count DESC
LIMIT 10;
```

#### 3. Temporal Distribution Analysis

```sql
SELECT
    `temporal`['season'] as season,
    `temporal`['hour_of_day'] as hour,
    COUNT(*) as event_count,
    AVG(CAST(`magnitude` AS DOUBLE)) as avg_magnitude
FROM dfs.`/data/earthquakes-2025-10.json`
GROUP BY `temporal`['season'], `temporal`['hour_of_day']
ORDER BY season, hour;
```

#### 4. Depth vs Magnitude Correlation

```sql
SELECT
    CASE
        WHEN CAST(`depth` AS DOUBLE) < 70 THEN 'Shallow (0-70km)'
        WHEN CAST(`depth` AS DOUBLE) < 300 THEN 'Intermediate (70-300km)'
        ELSE 'Deep (>300km)'
    END as depth_category,
    COUNT(*) as count,
    AVG(CAST(`magnitude` AS DOUBLE)) as avg_magnitude,
    MAX(CAST(`magnitude` AS DOUBLE)) as max_magnitude
FROM dfs.`/data/earthquakes-2025-10.json`
GROUP BY depth_category
ORDER BY count DESC;
```

### Query Best Practices

1. **Type Casting**: Always cast numeric fields (`magnitude`, `depth`) to `DOUBLE` for calculations
2. **Null Handling**: Use `IS NOT NULL` filters for optional fields like `country`
3. **Performance**: Limit result sets for large datasets using `LIMIT` clause
4. **Indexing**: For repeated queries, consider creating views in Drill

---

## 🔄 Data Enrichment Pipeline

QuakeX implements a sophisticated data enrichment pipeline that combines multiple data sources:

### Enrichment Process

```
1. Fetch USGS Earthquake Data
   ↓
2. Extract Country from USGS Place Field
   ↓
3. Lookup Country Details (REST Countries API)
   ↓ (fallback if needed)
4. Find Country by Coordinates (Haversine distance)
   ↓
5. Fetch Elevation Data (Open-Meteo API)
   ↓
6. Add Temporal Analysis (season, quarter, hour)
   ↓
7. Categorize Elevation (below sea level, lowland, hills, mountains)
   ↓
8. Save Enriched Dataset to /data directory
   ↓
9. Ready for Apache Drill SQL Analysis
```

### Enriched Data Schema

```javascript
{
  // Core USGS data
  "id": "us7000example",
  "magnitude": 5.2,
  "depth": 10.5,
  "latitude": 9.7489,
  "longitude": -83.7534,
  "place": "15 km SE of San José, Costa Rica",
  "time": "2025-10-15T14:23:45.000Z",

  // Country enrichment
  "country": {
    "name": "Costa Rica",
    "region": "Americas",
    "subregion": "Central America",
    "population": 5163038,
    "area": 51100
  },

  // Elevation enrichment
  "elevation": {
    "value": 1157,
    "category": "mountains"
  },

  // Temporal analysis
  "temporal": {
    "hour_of_day": 14,
    "day_of_week": 2,
    "month": 9,
    "year": 2025,
    "quarter": 4,
    "season": "autumn"
  }
}
```

### Manual Data Generation

To generate enriched datasets for specific months:

```javascript
import { generateMonthlyData } from "@/services/monthlyDataGeneratorService";

// Generate data for October 2025
await generateMonthlyData("2025-10");
```

Or use the Analytics View UI:

1. Navigate to **Analytics** tab
2. Click **"Generate Monthly Data"**
3. Select the desired month
4. Wait for enrichment to complete (may take 5-10 minutes for large datasets)

---

## 🛠️ Development

### Development Scripts

```bash
# Start development server with hot-reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint and fix code
npm run lint

# Format code with Prettier
npm run format

# Start JSON Manager server
npm run server

# Docker Compose commands
npm run drill:up    # Start Apache Drill
npm run drill:down  # Stop Apache Drill
```

### Code Style Guidelines

- **Vue Components**: Use Composition API with `<script setup>`
- **Naming Conventions**:
  - Components: PascalCase (e.g., `EarthquakeMap.vue`)
  - Services: camelCase with descriptive names (e.g., `usgsService.js`)
  - Functions: camelCase verbs (e.g., `fetchEarthquakes()`)
- **Documentation**: JSDoc comments for all public functions
- **Error Handling**: Always use try-catch blocks for async operations
- **Type Safety**: Use JSDoc type hints for better IDE support

### Adding New Features

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop & Test**

   - Write clean, documented code
   - Test thoroughly in development environment
   - Ensure no console errors or warnings

3. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push & Create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🚢 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Output directory: dist/
# Deploy contents of dist/ to your hosting provider
```

### Environment Configuration

For production deployment, update `.env` with production API endpoints:

```env
VITE_USGS_API_URL=https://your-api-gateway.com/usgs
# ... other production endpoints
```

### Hosting Recommendations

- **Frontend**: Vercel, Netlify, or GitHub Pages
- **JSON Manager**: Heroku, Railway, or any Node.js hosting
- **Apache Drill**: AWS EC2, Google Cloud Compute, or DigitalOcean Droplet

### Docker Deployment

```bash
# Build production Docker image (if needed)
docker build -t quakex-frontend .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🤝 Contributing

Contributions are welcome! However, please note that this is an **academic project** developed for educational purposes.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code style and conventions
- Add JSDoc comments for new functions
- Update README if adding new features
- Test thoroughly before submitting PR
- Keep commits atomic and well-described

---

## 📄 License

This project is developed for **academic and educational purposes** as part of a university engineering program.

**Academic Use Only**: This software is provided for learning, research, and non-commercial educational purposes. Commercial use or redistribution requires explicit permission from the author.

**Third-Party Services**: This project uses data from USGS (public domain), REST Countries (various licenses), and Open-Meteo (open data). Please review their respective terms of service.

---

## 🙏 Acknowledgments

### Data Providers

- **[United States Geological Survey (USGS)](https://www.usgs.gov/)** - For providing comprehensive earthquake data
- **[REST Countries](https://restcountries.com/)** - For country information API
- **[Open-Meteo](https://open-meteo.com/)** - For weather and elevation data

### Open Source Communities

- **Vue.js Team** - For the exceptional framework
- **Apache Software Foundation** - For Apache Drill
- **Leaflet Community** - For the mapping library
- **PrimeVue Team** - For the comprehensive UI components

### Inspiration

This project was inspired by the seismic activity along the Pacific Ring of Fire and the need for accessible earthquake data visualization tools in Costa Rica and worldwide.

---

## 👩‍💻 Author

**Valerie M. Hernández Fernández**

- 📍 Location: Costa Rica
- 🎓 Engineering Student
- 🌐 GitHub: [@valeriehernandez-7](https://github.com/valeriehernandez-7)
- 📅 Project Date: October 2025

### About the Developer

As a Costa Rican engineering student living in a country along the Pacific Ring of Fire, I've experienced firsthand the impact of seismic activity in everyday life. Earthquakes are a regular occurrence here, inspiring me to create a tool that makes earthquake data more accessible and understandable for everyone.
QuakeX represents the convergence of my passion for technology, data analytics, and community resilience. This project demonstrates the power of modern web technologies and open data initiatives in solving real-world problems.

---

## 📞 Support & Contact

### Issues & Bug Reports

- Open an issue on [GitHub Issues](https://github.com/valeriehernandez-7/QuakeX-EarthquakeExplorer/issues)
- Include detailed steps to reproduce
- Attach screenshots if applicable

### Questions & Discussions

- Use [GitHub Discussions](https://github.com/valeriehernandez-7/QuakeX-EarthquakeExplorer/discussions)
- Check existing discussions before creating new ones

### Direct Contact

For academic inquiries or collaboration opportunities, please reach out via GitHub.

---

## 📚 Additional Resources

### Documentation

- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [Apache Drill Documentation](https://drill.apache.org/docs/)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [PrimeVue Documentation](https://primevue.org/)

### Learning Resources

- [Understanding the Richter Scale](https://www.usgs.gov/programs/earthquake-hazards/earthquake-magnitude-energy-release-and-shaking-intensity)
- [More](https://www.usgs.gov/programs/earthquake-hazards/science/)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**QuakeX** - Making Earthquake Data Accessible

Built with ❤️ in Costa Rica

[Report Bug](https://github.com/valeriehernandez-7/QuakeX-EarthquakeExplorer/issues) • [Request Feature](https://github.com/valeriehernandez-7/QuakeX-EarthquakeExplorer/issues) • [View Demo](#)

---

© 2025 Valerie M. Hernández Fernández. Academic Project.

</div>
