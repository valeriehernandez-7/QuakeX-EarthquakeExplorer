import axios from 'axios'
import { API_ENDPOINTS, APP_SETTINGS } from '@/utils/constants'

/**
 * Elevation Service
 * Handles terrain elevation data fetching from Open-Meteo Elevation API
 * API Documentation: https://open-meteo.com/en/docs/elevation-api
 *
 * Data Source: Copernicus DEM 2021 release GLO-90 with 90 meters resolution
 * License: Non-commercial use only (<10,000 daily API calls)
 * Attribution required: Copernicus program + Open-Meteo reference
 */

// Create axios instance with configuration
const elevationClient = axios.create({
    baseURL: API_ENDPOINTS.ELEVATION,
    timeout: APP_SETTINGS.requestTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * In-memory cache for elevation data
 * Key format: "lat,lng" or "lat1,lng1|lat2,lng2|..." for multiple coordinates
 * Prevents redundant API calls for same locations
 */
const elevationCache = new Map()

/**
 * CACHE_DURATION: 24 hours in milliseconds
 * Elevation data is static for geographical locations
 */
const CACHE_DURATION = 24 * 60 * 60 * 1000

/**
 * Fetch elevation for single or multiple coordinates
 * @param {Object|Array} coordinates - Single coordinate object or array of coordinates
 * @param {number} coordinates.latitude - Geographical latitude (-90 to 90)
 * @param {number} coordinates.longitude - Geographical longitude (-180 to 180)
 * @param {boolean} [useCache=true] - Whether to use cached data
 * @returns {Promise<Array<Object>|Object|null>} Normalized elevation data or null on error
 */
export async function fetchElevation(coordinates, useCache = true) {
    try {
        // Validate input
        if (!coordinates || (Array.isArray(coordinates) && coordinates.length === 0)) {
            console.error('Invalid coordinates provided')
            return null
        }

        // Normalize to array for consistent processing
        const coordsArray = Array.isArray(coordinates) ? coordinates : [coordinates]

        // Validate each coordinate
        for (const coord of coordsArray) {
            if (!isValidCoordinate(coord)) {
                console.error('Invalid coordinate:', coord)
                return null
            }
        }

        // Check API limits
        if (coordsArray.length > 100) {
            console.warn('Maximum 100 coordinates allowed per request. Truncating to first 100.')
            coordsArray.splice(100)
        }

        // Check cache first
        const cacheKey = generateCacheKey(coordsArray)
        if (useCache) {
            const cached = getFromCache(cacheKey)
            if (cached) {
                console.log('Using cached elevation data for', cacheKey)
                return Array.isArray(coordinates) ? cached : cached[0]
            }
        }

        console.log(`Fetching elevation for ${coordsArray.length} coordinate(s)`)

        // Build query parameters
        const queryParams = {
            latitude: coordsArray.map((coord) => Number(coord.latitude.toFixed(6))).join(','),
            longitude: coordsArray.map((coord) => Number(coord.longitude.toFixed(6))).join(','),
        }

        const response = await elevationClient.get('', { params: queryParams })

        // Validate response
        if (!response.data || !Array.isArray(response.data.elevation)) {
            console.warn('Invalid elevation API response')
            return null
        }

        // Transform API response to normalized format
        const elevationData = transformElevationData(coordsArray, response.data.elevation)

        // Cache the result
        if (elevationData) {
            saveToCache(cacheKey, elevationData)
        }

        // Return single object for single coordinate, array for multiple
        return Array.isArray(coordinates) ? elevationData : elevationData[0]
    } catch (error) {
        if (error.response) {
            console.error('Elevation API Error:', error.response.status, error.response.statusText)
            console.error('Error details:', error.response.data)
        } else if (error.request) {
            console.error('No response from Elevation API. Check network connection.')
        } else {
            console.error('Error fetching elevation data:', error.message)
        }

        return null // Graceful degradation - return null on error
    }
}

/**
 * Fetch elevation for earthquake data
 * Useful for correlating earthquake depth with terrain elevation
 * @param {Array} earthquakes - Array of earthquake objects
 * @param {boolean} [useCache=true] - Whether to use cached data
 * @returns {Promise<Array<Object>|null>} Earthquakes with elevation data or null on error
 */
export async function fetchElevationForEarthquakes(earthquakes, useCache = true) {
    try {
        if (!earthquakes || !Array.isArray(earthquakes) || earthquakes.length === 0) {
            console.error('Invalid earthquakes array provided')
            return null
        }

        // Extract coordinates from earthquakes
        const coordinates = earthquakes.map((eq) => ({
            latitude: eq.latitude,
            longitude: eq.longitude,
            earthquakeId: eq.id, // Store reference for matching
        }))

        // Fetch elevation data
        const elevationData = await fetchElevation(coordinates, useCache)

        if (!elevationData) {
            return null
        }

        // Combine earthquake data with elevation
        return earthquakes.map((earthquake, index) => ({
            ...earthquake,
            elevation: {
                value: elevationData[index].elevation,
                unit: 'meters',
                aboveSeaLevel: elevationData[index].elevation >= 0,
                description: getElevationDescription(elevationData[index].elevation),
            },
        }))
    } catch (error) {
        console.error('Error fetching elevation for earthquakes:', error)
        return null
    }
}

/**
 * Transform elevation API response to normalized format
 * @param {Array} coordinates - Array of coordinate objects
 * @param {Array} elevationArray - Raw elevation values from API
 * @returns {Array<Object>} Normalized elevation objects
 */
function transformElevationData(coordinates, elevationArray) {
    return coordinates.map((coord, index) => {
        const elevationValue = elevationArray[index]

        return {
            // Original coordinates
            latitude: coord.latitude,
            longitude: coord.longitude,
            earthquakeId: coord.earthquakeId, // Optional reference

            // Elevation data
            elevation: elevationValue,
            unit: 'meters',
            aboveSeaLevel: elevationValue >= 0,

            // Descriptive information
            description: getElevationDescription(elevationValue),
            category: getElevationCategory(elevationValue),

            // Metadata
            dataSource: 'Copernicus DEM GLO-90 (90m resolution)',
            attribution: {
                copernicus: 'https://doi.org/10.5270/ESA-c5d3d65',
                openMeteo: 'https://open-meteo.com/en/docs/elevation-api',
            },
        }
    })
}

/**
 * Get human-readable elevation description
 * @param {number} elevation - Elevation in meters
 * @returns {string} Description of elevation level
 */
function getElevationDescription(elevation) {
    if (elevation < 0) return 'Below sea level'
    if (elevation < 200) return 'Coastal/Lowland'
    if (elevation < 500) return 'Hills'
    if (elevation < 1500) return 'Mountains'
    if (elevation < 3500) return 'High mountains'
    return 'Alpine/Peak'
}

/**
 * Get elevation category for analysis
 * @param {number} elevation - Elevation in meters
 * @returns {string} Category name
 */
function getElevationCategory(elevation) {
    if (elevation < 0) return 'submarine'
    if (elevation < 200) return 'lowland'
    if (elevation < 500) return 'hills'
    if (elevation < 1500) return 'mountains'
    if (elevation < 3500) return 'high_mountains'
    return 'alpine'
}

/**
 * Validate coordinate object
 * @param {Object} coord - Coordinate object
 * @returns {boolean} True if coordinate is valid
 */
function isValidCoordinate(coord) {
    if (!coord || typeof coord !== 'object') return false
    if (typeof coord.latitude !== 'number' || typeof coord.longitude !== 'number') return false
    if (coord.latitude < -90 || coord.latitude > 90) return false
    if (coord.longitude < -180 || coord.longitude > 180) return false
    return true
}

/**
 * Generate cache key from coordinates array
 * @param {Array} coordinates - Array of coordinate objects
 * @returns {string} Cache key
 */
function generateCacheKey(coordinates) {
    return coordinates
        .map((coord) => `${coord.latitude.toFixed(6)},${coord.longitude.toFixed(6)}`)
        .join('|')
}

/**
 * Get elevation data from cache
 * @param {string} cacheKey - Cache key
 * @returns {Array|null} Cached data or null
 */
function getFromCache(cacheKey) {
    try {
        const cached = elevationCache.get(cacheKey)
        if (!cached) return null

        // Check if cache is expired
        const age = Date.now() - cached.timestamp
        if (age > CACHE_DURATION) {
            elevationCache.delete(cacheKey)
            return null
        }

        return cached.data
    } catch (error) {
        console.error('Error reading from elevation cache:', error)
        return null
    }
}

/**
 * Save elevation data to cache
 * @param {string} cacheKey - Cache key
 * @param {Array} data - Data to cache
 */
function saveToCache(cacheKey, data) {
    try {
        elevationCache.set(cacheKey, {
            timestamp: Date.now(),
            data: data,
        })
        console.log('Elevation data cached successfully')
    } catch (error) {
        console.error('Error saving to elevation cache:', error)
    }
}

/**
 * Clear elevation cache
 * Useful for testing or manual cache invalidation
 */
export function clearElevationCache() {
    elevationCache.clear()
    console.log('Elevation cache cleared')
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getElevationCacheStats() {
    return {
        size: elevationCache.size,
        keys: Array.from(elevationCache.keys()),
    }
}

/**
 * Export elevation cache to JSON file
 * Saves cached elevation data for Apache Drill consumption
 * @param {string} [filename] - Custom filename
 * @returns {boolean} Success status
 */
export function exportElevationCache(filename = `elevation_cache_${Date.now()}.json`) {
    try {
        if (elevationCache.size === 0) {
            console.warn('Elevation cache is empty, nothing to export')
            return false
        }

        // Convert Map to array of objects
        const cacheArray = Array.from(elevationCache.entries()).map(([key, value]) => {
            const coords = key.split('|').map((coordStr) => {
                const [lat, lng] = coordStr.split(',')
                return {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lng),
                }
            })

            return {
                cacheKey: key,
                coordinates: coords,
                data: value.data,
                cachedAt: new Date(value.timestamp).toISOString(),
            }
        })

        // Create JSON blob
        const dataStr = JSON.stringify(cacheArray, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        // Create download link
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }, 100)

        console.log(`Elevation cache exported to ${filename}`)
        return true
    } catch (error) {
        console.error('Error exporting elevation cache:', error)
        return false
    }
}

/**
 * Get required attribution text for elevation data
 * @returns {string} Attribution text
 */
export function getElevationAttribution() {
    return 'Elevation data from Copernicus DEM via Open-Meteo. Non-commercial use only.'
}
