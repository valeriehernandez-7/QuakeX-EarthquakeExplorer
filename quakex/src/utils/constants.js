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

// JSON Manager Server Configuration
export const JSON_MANAGER_CONFIG = {
    BASE_URL: 'http://localhost:3001',
    ENDPOINTS: {
        HEALTH: '/api/health',
        SAVE_JSON: '/api/save-json',
        LIST_FILES: '/api/files',
    },
    TIMEOUT: 10000, // 10 seconds
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

/**
 * Predefined time periods for earthquake data queries
 * Each period defines caching strategy and expected data volume
 */
export const TIME_PERIODS = {
    TODAY: {
        value: 'TODAY',
        label: 'Today',
        icon: 'pi pi-sun',
        days: 0,
        cacheKey: 'earthquakes_today',
        updateFrequency: 'hourly',
        estimatedCount: 100,
        estimatedLabel: '~100',
    },
    LAST_WEEK: {
        value: 'LAST_WEEK',
        label: 'Last Week',
        icon: 'pi pi-calendar',
        days: 7,
        cacheKey: 'earthquakes_last_week',
        updateFrequency: 'daily',
        estimatedCount: 700,
        estimatedLabel: '~700',
        default: true,
    },
    LAST_MONTH: {
        value: 'LAST_MONTH',
        label: 'Last Month',
        icon: 'pi pi-calendar-plus',
        days: 30,
        cacheKey: 'earthquakes_last_month',
        updateFrequency: 'daily',
        estimatedCount: 3000,
        estimatedLabel: '~3K',
    },
    LAST_3_MONTHS: {
        value: 'LAST_3_MONTHS',
        label: 'Last 3 Months',
        icon: 'pi pi-history',
        days: 90,
        cacheKey: 'earthquakes_last_3months',
        updateFrequency: 'weekly',
        estimatedCount: 9000,
        estimatedLabel: '~9K',
    },
    LAST_YEAR: {
        value: 'LAST_YEAR',
        label: 'Last Year',
        icon: 'pi pi-chart-line',
        days: 365,
        cacheKey: 'earthquakes_last_year',
        updateFrequency: 'monthly',
        estimatedCount: 30000,
        estimatedLabel: '~30K',
    },
}

export const SPECIFIC_DATE_MODE = {
    value: 'SPECIFIC_DATE',
    label: 'Specific Date',
    icon: 'pi pi-calendar-times',
    description: 'Select a specific date to view earthquakes',
}

export const TIME_PERIOD_OPTIONS = Object.values(TIME_PERIODS)
export const DEFAULT_TIME_PERIOD = TIME_PERIODS.LAST_WEEK

export const CACHE_EXPIRATION = {
    hourly: 60 * 60 * 1000, // 1 hour
    daily: 24 * 60 * 60 * 1000, // 1 day
    weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
    monthly: 30 * 24 * 60 * 60 * 1000, // 30 days
}

export const CACHE_RETENTION_DAYS = 7

export const DRILL_CONFIG = {
    // Storage plugin and workspace
    storagePlugin: 'dfs',
    workspace: 'quakex',

    // Query execution settings
    queryTimeout: 30000, // 30 seconds
    maxRows: 10000, // Maximum rows to return
    defaultLimit: 1000, // Default LIMIT for queries without explicit limit

    // Query result cache settings
    queryCacheDuration: 5 * 60 * 1000, // 5 minutes cache for query results
    enableQueryCache: true,

    // Table names (standardized filenames)
    tables: {
        earthquakes: 'earthquakes.json',
        earthquakesSample: 'sample-earthquakes.json',
        countries: 'countries.json',
        weatherCache: 'weather_cache.json',
        elevationCache: 'elevation_cache.json',
    },

    // Default query settings
    defaults: {
        magnitudeRange: [0, 10], // Full magnitude range
        depthRange: [0, 700], // km - typical earthquake depth range
        orderBy: 'time DESC', // Most recent first
        dateFormat: 'YYYY-MM-DD', // SQL date format
    },

    // Magnitude categories for statistics
    magnitudeCategories: [
        { name: 'Minor', min: 0, max: 3.9 },
        { name: 'Light', min: 4.0, max: 4.9 },
        { name: 'Moderate', min: 5.0, max: 5.9 },
        { name: 'Strong', min: 6.0, max: 6.9 },
        { name: 'Major', min: 7.0, max: 10.0 },
    ],

    // Depth categories for statistics (in km)
    depthCategories: [
        { name: 'Shallow', min: 0, max: 70 },
        { name: 'Intermediate', min: 70, max: 300 },
        { name: 'Deep', min: 300, max: 700 },
    ],

    // Geographic zones (for spatial queries)
    geographicZones: {
        northernHemisphere: { latMin: 0, latMax: 90 },
        southernHemisphere: { latMin: -90, latMax: 0 },
        easternHemisphere: { lonMin: 0, lonMax: 180 },
        westernHemisphere: { lonMin: -180, lonMax: 0 },
    },

    // Statistics query settings
    statistics: {
        defaultDays: 30, // Default period for temporal statistics
        bucketSize: 1, // Days per bucket for time series
        topEarthquakesLimit: 10, // Number of strongest earthquakes to return
    },

    // Data directory (used for file operations)
    dataDirectory: '/data',
}

// Helper: Get full table path for Drill queries
export function getDrillTablePath(tableName) {
    return `${DRILL_CONFIG.storagePlugin}.${DRILL_CONFIG.workspace}.\`${tableName}\``
}

// Helper: Get table name with backticks for Drill
export function formatTableName(tableName) {
    return `\`${tableName}\``
}
