import axios from 'axios'
import { API_ENDPOINTS, APP_SETTINGS } from '@/utils/constants'

/**
 * REST Countries Service
 * Handles country data fetching, caching, and geographic matching
 * API Documentation: https://restcountries.com/
 */

const CACHE_KEY = 'quakex_countries_cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Create axios instance
const countriesClient = axios.create({
    baseURL: API_ENDPOINTS.COUNTRIES,
    timeout: APP_SETTINGS.requestTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Fetch all countries data
 * Uses localStorage cache to minimize API calls (data changes rarely)
 * @param {boolean} forceRefresh - Force API call even if cache exists
 * @returns {Promise<Array>} Array of country objects
 */
export async function fetchAllCountries(forceRefresh = false) {
    try {
        // Check cache first
        if (!forceRefresh) {
            const cached = getFromCache()
            if (cached) {
                console.log('Countries loaded from cache')
                return cached
            }
        }

        console.log('Fetching countries from REST Countries API...')

        const response = await countriesClient.get('')

        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid response from REST Countries API')
        }

        const countries = normalizeCountriesData(response.data)

        console.log(`Successfully fetched ${countries.length} countries`)

        // Save to cache
        saveToCache(countries)

        return countries
    } catch (error) {
        if (error.response) {
            console.error(
                'REST Countries API Error:',
                error.response.status,
                error.response.statusText,
            )
        } else if (error.request) {
            console.error('No response from REST Countries API')
        } else {
            console.error('Error fetching countries:', error.message)
        }

        // Return cached data as fallback
        const cached = getFromCache()
        if (cached) {
            console.log('Using cached countries as fallback')
            return cached
        }

        return []
    }
}

/**
 * Normalize countries data to application format
 * @param {Array} rawData - Raw data from REST Countries API
 * @returns {Array} Normalized country objects
 */
function normalizeCountriesData(rawData) {
    return rawData.map((country) => {
        return {
            // Names
            name: country.name?.common || 'Unknown',
            officialName: country.name?.official || country.name?.common || 'Unknown',
            nativeName: extractNativeName(country.name?.nativeName),

            // Geographic info
            capital: Array.isArray(country.capital) ? country.capital[0] : country.capital || null,
            capitals: country.capital || [],
            region: country.region || 'Unknown',
            subregion: country.subregion || 'Unknown',

            // Coordinates
            latitude: country.latlng?.[0] || null,
            longitude: country.latlng?.[1] || null,
            latlng: country.latlng || [null, null],

            // Metrics
            area: country.area || 0,
            population: country.population || 0,

            // Visual assets
            flag: country.flags?.svg || country.flags?.png || null,
            flagPng: country.flags?.png || null,
            flagSvg: country.flags?.svg || null,
            flagAlt: country.flags?.alt || `Flag of ${country.name?.common}`,

            // Maps
            googleMaps: country.maps?.googleMaps || null,
            openStreetMaps: country.maps?.openStreetMaps || null,

            // Time zones
            timezones: country.timezones || [],
            primaryTimezone: country.timezones?.[0] || 'UTC',
        }
    })
}

/**
 * Extract primary native name from nativeName object
 * @param {Object} nativeName - Native name object from API
 * @returns {string|null} Primary native name
 */
function extractNativeName(nativeName) {
    if (!nativeName || typeof nativeName !== 'object') return null

    const firstKey = Object.keys(nativeName)[0]
    if (!firstKey) return null

    return nativeName[firstKey]?.common || nativeName[firstKey]?.official || null
}

/**
 * Find country by exact name match
 * @param {string} name - Country name to search
 * @returns {Promise<Object|null>} Country object or null
 */
export async function findCountryByName(name) {
    const countries = await fetchAllCountries()

    const searchName = name.toLowerCase().trim()

    return (
        countries.find(
            (country) =>
                country.name.toLowerCase() === searchName ||
                country.officialName.toLowerCase() === searchName ||
                country.nativeName?.toLowerCase() === searchName,
        ) || null
    )
}

/**
 * Find country by geographic coordinates
 * Uses simple distance calculation to find nearest country
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} maxDistance - Maximum distance in km (default: 1000)
 * @returns {Promise<Object|null>} Nearest country or null
 */
export async function findCountryByCoordinates(latitude, longitude, maxDistance = 1000) {
    const countries = await fetchAllCountries()

    let nearestCountry = null
    let minDistance = Infinity

    for (const country of countries) {
        if (country.latitude === null || country.longitude === null) continue

        const distance = calculateDistance(latitude, longitude, country.latitude, country.longitude)

        if (distance < minDistance) {
            minDistance = distance
            nearestCountry = country
        }
    }

    // Return only if within max distance
    if (nearestCountry && minDistance <= maxDistance) {
        return {
            ...nearestCountry,
            distance: Math.round(minDistance),
        }
    }

    return null
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - First latitude
 * @param {number} lon1 - First longitude
 * @param {number} lat2 - Second latitude
 * @param {number} lon2 - Second longitude
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180)
}

/**
 * Search countries by region
 * @param {string} region - Region name (e.g., "Americas", "Europe", "Asia")
 * @returns {Promise<Array>} Array of countries in region
 */
export async function findCountriesByRegion(region) {
    const countries = await fetchAllCountries()

    const searchRegion = region.toLowerCase().trim()

    return countries.filter((country) => country.region.toLowerCase() === searchRegion)
}

/**
 * Search countries by subregion
 * @param {string} subregion - Subregion name (e.g., "Central America", "Western Europe")
 * @returns {Promise<Array>} Array of countries in subregion
 */
export async function findCountriesBySubregion(subregion) {
    const countries = await fetchAllCountries()

    const searchSubregion = subregion.toLowerCase().trim()

    return countries.filter((country) => country.subregion.toLowerCase() === searchSubregion)
}

/**
 * Get countries sorted by population
 * @param {number} limit - Maximum number of countries to return
 * @param {string} order - Sort order ('desc' or 'asc')
 * @returns {Promise<Array>} Sorted array of countries
 */
export async function getCountriesByPopulation(limit = 10, order = 'desc') {
    const countries = await fetchAllCountries()

    const sorted = [...countries].sort((a, b) => {
        return order === 'desc' ? b.population - a.population : a.population - b.population
    })

    return limit > 0 ? sorted.slice(0, limit) : sorted
}

/**
 * Get countries sorted by area
 * @param {number} limit - Maximum number of countries to return
 * @param {string} order - Sort order ('desc' or 'asc')
 * @returns {Promise<Array>} Sorted array of countries
 */
export async function getCountriesByArea(limit = 10, order = 'desc') {
    const countries = await fetchAllCountries()

    const sorted = [...countries].sort((a, b) => {
        return order === 'desc' ? b.area - a.area : a.area - b.area
    })

    return limit > 0 ? sorted.slice(0, limit) : sorted
}

/**
 * Save countries data to localStorage cache
 * @param {Array} countries - Countries data to cache
 */
function saveToCache(countries) {
    try {
        const cacheData = {
            timestamp: Date.now(),
            data: countries,
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
        console.log('Countries cached successfully')
    } catch (error) {
        console.error('Error saving countries to cache:', error.message)
    }
}

/**
 * Get countries data from localStorage cache
 * @returns {Array|null} Cached countries data or null
 */
function getFromCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (!cached) return null

        const cacheData = JSON.parse(cached)

        // Check if cache is expired
        const age = Date.now() - cacheData.timestamp
        if (age > CACHE_DURATION) {
            console.log('Cache expired')
            localStorage.removeItem(CACHE_KEY)
            return null
        }

        return cacheData.data
    } catch (error) {
        console.error('Error reading countries from cache:', error.message)
        return null
    }
}

/**
 * Clear countries cache
 */
export function clearCountriesCache() {
    try {
        localStorage.removeItem(CACHE_KEY)
        console.log('Countries cache cleared')
    } catch (error) {
        console.error('Error clearing countries cache:', error.message)
    }
}

/**
 * Export countries data to JSON file (for Apache Drill)
 * @param {string} filename - Filename for export
 * @returns {Promise<boolean>} Success status
 */
export async function saveToJSON(filename = `countries_${Date.now()}.json`) {
    try {
        const countries = await fetchAllCountries()

        const dataStr = JSON.stringify(countries, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        setTimeout(() => {
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }, 100)

        console.log(`Countries exported to ${filename}`)
        return true
    } catch (error) {
        console.error('Error exporting countries to JSON:', error.message)
        return false
    }
}

/**
 * Get statistics about countries data
 * @returns {Promise<Object>} Statistics object
 */
export async function getCountriesStatistics() {
    const countries = await fetchAllCountries()

    const totalPopulation = countries.reduce((sum, c) => sum + c.population, 0)
    const totalArea = countries.reduce((sum, c) => sum + c.area, 0)

    const regions = [...new Set(countries.map((c) => c.region))].filter((r) => r !== 'Unknown')
    const subregions = [...new Set(countries.map((c) => c.subregion))].filter(
        (s) => s !== 'Unknown',
    )

    return {
        totalCountries: countries.length,
        totalPopulation,
        totalArea,
        avgPopulation: Math.round(totalPopulation / countries.length),
        avgArea: Math.round(totalArea / countries.length),
        regions: regions.length,
        subregions: subregions.length,
        regionsList: regions.sort(),
        subregionsList: subregions.sort(),
    }
}
