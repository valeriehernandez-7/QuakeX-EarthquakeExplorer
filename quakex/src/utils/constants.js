/**
 * Application Constants
 * Magnitude severity levels, depth categories, API endpoints, and default values
 */

// Magnitude Severity Classification
export const MAGNITUDE_LEVELS = {
    MINOR: {
        label: 'Minor',
        range: [0, 3.9],
        color: '#10b981', // Green
        description: 'Rarely felt, minimal to no damage',
    },
    LIGHT: {
        label: 'Light',
        range: [4.0, 4.9],
        color: '#3b82f6', // Blue
        description: 'Often felt, minimal damage',
    },
    MODERATE: {
        label: 'Moderate',
        range: [5.0, 5.9],
        color: '#f59e0b', // Yellow
        description: 'Can damage weak structures',
    },
    STRONG: {
        label: 'Strong',
        range: [6.0, 6.9],
        color: '#ef4444', // Orange/Red
        description: 'Significant damage potential',
    },
    MAJOR: {
        label: 'Major',
        range: [7.0, 10.0],
        color: '#991b1b', // Dark Red
        description: 'Serious widespread damage',
    },
}

// Depth Categories (in kilometers)
export const DEPTH_CATEGORIES = {
    SHALLOW: {
        label: 'Shallow',
        range: [0, 70],
        description: 'Most dangerous, near surface',
    },
    INTERMEDIATE: {
        label: 'Intermediate',
        range: [70, 300],
        description: 'Moderate depth',
    },
    DEEP: {
        label: 'Deep',
        range: [300, Infinity],
        description: 'Less surface impact',
    },
}

// API Endpoints (from environment variables)
export const API_ENDPOINTS = {
    USGS: import.meta.env.VITE_USGS_API_URL,
    WEATHER: import.meta.env.VITE_WEATHER_API_URL,
    ELEVATION: import.meta.env.VITE_ELEVATION_API_URL,
    COUNTRIES: import.meta.env.VITE_COUNTRIES_API_URL,
    DRILL: import.meta.env.VITE_DRILL_API_URL,
}

// Default Filter Values
export const DEFAULT_FILTERS = {
    magnitudeRange: [2.5, 10.0], // USGS practical minimum
    dateRange: {
        startDays: 30, // Last 30 days
        endDays: 0, // Today
    },
}

// Map Configuration
export const MAP_CONFIG = {
    defaultCenter: [20, 0], // Global overview
    defaultZoom: 2, // World view
    minZoom: 2,
    maxZoom: 18,
    clusterRadius: 50, // pixels
    tileLayer: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
    },
}

// Chart Configuration
export const CHART_CONFIG = {
    colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
        tertiary: '#f59e0b',
    },
    height: {
        desktop: 400,
        tablet: 350,
        mobile: 300,
    },
}

// Application Settings
export const APP_SETTINGS = {
    dataRefreshInterval: 300000, // 5 minutes in milliseconds
    requestTimeout: 30000, // 30 seconds
    maxEarthquakesToDisplay: 10000, // https://earthquake.usgs.gov/fdsnws/event/1/#:~:text=The%20service%20limits%20queries%20to%2020000
}
