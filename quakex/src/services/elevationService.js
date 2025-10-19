import axios from 'axios'
import { API_ENDPOINTS, APP_SETTINGS } from '@/utils/constants'
import { saveDatasetWithPeriod } from './drillService'

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
 *
 * @example
 * // Single coordinate
 * const elevation = await fetchElevation({ latitude: 52.52, longitude: 13.41 })
 * // Returns: { latitude: 52.52, longitude: 13.41, elevation: 38, ... }
 *
 * @example
 * // Multiple coordinates (up to 100)
 * const elevations = await fetchElevation([
 *   { latitude: 52.52, longitude: 13.41 },
 *   { latitude: 40.71, longitude: -74.01 }
 * ])
 * // Returns: [{ elevation: 38, ... }, { elevation: 10, ... }]
 */
export async function fetchElevation(coordinates, useCache = true, maxRetries = 2) {
    return await fetchElevationWithRetry(coordinates, useCache, maxRetries, 0)
}

/**
 * Internal helper function to fetch elevation with retry on rate limit (429)
 * @private
 * @param {Object|Array} coordinates - Coordinates to fetch
 * @param {boolean} useCache - Whether to use cache
 * @param {number} maxRetries - Maximum retry attempts (default: 2)
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {Promise<Array<Object>|Object|null>} Elevation data or null
 */
async function fetchElevationWithRetry(coordinates, useCache, maxRetries, attempt) {
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

        if (attempt > 0) {
            console.log(`Fetching elevation (attempt ${attempt + 1}/${maxRetries + 1})`)
        } else {
            console.log(`Fetching elevation for ${coordsArray.length} coordinate(s)`)
        }

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
        // Check if it's a 429 (Too Many Requests) error - RETRIABLE
        if (error.response?.status === 429) {
            if (attempt < maxRetries) {
                // Calculate exponential backoff: 3s, 6s, 12s
                const baseDelay = 3000 // 3 seconds
                const delay = baseDelay * Math.pow(2, attempt)

                console.warn(
                    `Rate limit (429) for elevation API. Waiting ${delay / 1000}s before retry ${attempt + 1}/${maxRetries}...`,
                )
                console.warn(
                    `   Coordinates: lat=${coordsArray[0]?.latitude}, lng=${coordsArray[0]?.longitude}`,
                )

                // Wait before retrying
                await new Promise((resolve) => setTimeout(resolve, delay))

                // Recursive retry
                return await fetchElevationWithRetry(coordinates, useCache, maxRetries, attempt + 1)
            } else {
                console.error(
                    `Rate limit exceeded after ${maxRetries + 1} attempts (waited ~${3 + 6 + (maxRetries > 1 ? 12 : 0)}s total). Returning null for elevation.`,
                )
                console.error(
                    `Coordinates that failed: lat=${coordsArray[0]?.latitude}, lng=${coordsArray[0]?.longitude}`,
                )
                return null
            }
        }

        // Handle other errors (non-retriable)
        if (error.response) {
            console.error('Elevation API Error:', error.response.status, error.response.statusText)

            // Handle specific error format from API: { error: true, reason: "..." }
            if (error.response.status === 400 && error.response.data?.reason) {
                console.error('API validation error:', error.response.data.reason)
            } else {
                console.error('Error details:', error.response.data)
            }
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

/**
 * Cache elevation data for all earthquakes in a time period
 * Creates a batch elevation cache for Drill queries
 * @param {string} timePeriod - Time period key (e.g., 'LAST_WEEK')
 * @param {Array} earthquakes - Array of earthquake objects
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.saveForDrill=true] - Save to Drill-compatible JSON
 * @returns {Promise<Array>} Array of elevation data objects
 *
 * @example
 * const earthquakes = await fetchEarthquakesForPeriod('LAST_WEEK')
 * const elevationData = await cacheElevationForPeriod('LAST_WEEK', earthquakes)
 * // Saves to: elevation_cache_last_week.json
 */
export async function cacheElevationForPeriod(timePeriod, earthquakes, options = {}) {
    try {
        const { saveForDrill = true } = options

        if (!earthquakes || earthquakes.length === 0) {
            console.warn('No earthquakes provided for elevation caching')
            return []
        }

        console.log(
            `Caching elevation data for ${earthquakes.length} earthquakes (period: ${timePeriod})`,
        )

        // Extract unique coordinates to avoid duplicate API calls
        const uniqueCoords = getUniqueCoordinates(earthquakes)
        console.log(`Found ${uniqueCoords.length} unique coordinate pairs`)

        // Fetch elevation for all unique coordinates
        const elevationData = await fetchElevation(uniqueCoords, true)

        if (!elevationData || elevationData.length === 0) {
            console.warn('No elevation data retrieved')
            return []
        }

        // Create coordinate -> elevation map for quick lookup
        const elevationMap = new Map()
        elevationData.forEach((data) => {
            const key = `${data.latitude.toFixed(4)},${data.longitude.toFixed(4)}`
            elevationMap.set(key, data)
        })

        // Create array with earthquake IDs for Drill JOINs
        const elevationCacheArray = earthquakes.map((earthquake) => {
            const key = `${earthquake.latitude.toFixed(4)},${earthquake.longitude.toFixed(4)}`
            const elevData = elevationMap.get(key)

            return {
                earthquakeId: earthquake.id,
                latitude: earthquake.latitude,
                longitude: earthquake.longitude,
                elevation: elevData?.elevation || null,
                elevationUnit: 'meters',
                aboveSeaLevel: elevData?.aboveSeaLevel || null,
                description: elevData?.description || 'Unknown',
                category: elevData?.category || 'unknown',
            }
        })

        console.log(`Elevation cache prepared with ${elevationCacheArray.length} entries`)

        // Save for Drill
        if (saveForDrill && elevationCacheArray.length > 0) {
            const saved = saveDatasetWithPeriod('elevation_cache', elevationCacheArray, {
                timePeriod,
            })
            if (saved) {
                console.log(`Elevation data saved for Drill (period: ${timePeriod})`)
            }
        }

        return elevationCacheArray
    } catch (error) {
        console.error('Error caching elevation for period:', error.message)
        return []
    }
}

/**
 * Cache elevation data for earthquakes on a specific date
 * @param {Date|string} specificDate - The specific date
 * @param {Array} earthquakes - Array of earthquake objects
 * @param {Object} [options={}] - Additional options
 * @returns {Promise<Array>} Array of elevation data objects
 *
 * @example
 * const date = new Date('2024-10-15')
 * const earthquakes = await fetchEarthquakesForDate(date)
 * const elevationData = await cacheElevationForDate(date, earthquakes)
 * // Saves to: elevation_cache_2024-10-15.json
 */
export async function cacheElevationForDate(specificDate, earthquakes, options = {}) {
    try {
        const { saveForDrill = true } = options

        if (!earthquakes || earthquakes.length === 0) {
            console.warn('No earthquakes provided for elevation caching')
            return []
        }

        const dateStr = new Date(specificDate).toISOString().split('T')[0]
        console.log(
            `Caching elevation data for ${earthquakes.length} earthquakes (date: ${dateStr})`,
        )

        // Extract unique coordinates
        const uniqueCoords = getUniqueCoordinates(earthquakes)
        console.log(`Found ${uniqueCoords.length} unique coordinate pairs`)

        // Fetch elevation
        const elevationData = await fetchElevation(uniqueCoords, true)

        if (!elevationData || elevationData.length === 0) {
            console.warn('No elevation data retrieved')
            return []
        }

        // Create map
        const elevationMap = new Map()
        elevationData.forEach((data) => {
            const key = `${data.latitude.toFixed(4)},${data.longitude.toFixed(4)}`
            elevationMap.set(key, data)
        })

        // Create array
        const elevationCacheArray = earthquakes.map((earthquake) => {
            const key = `${earthquake.latitude.toFixed(4)},${earthquake.longitude.toFixed(4)}`
            const elevData = elevationMap.get(key)

            return {
                earthquakeId: earthquake.id,
                latitude: earthquake.latitude,
                longitude: earthquake.longitude,
                elevation: elevData?.elevation || null,
                elevationUnit: 'meters',
                aboveSeaLevel: elevData?.aboveSeaLevel || null,
                description: elevData?.description || 'Unknown',
                category: elevData?.category || 'unknown',
            }
        })

        console.log(`Elevation cache prepared with ${elevationCacheArray.length} entries`)

        // Save for Drill
        if (saveForDrill && elevationCacheArray.length > 0) {
            const saved = saveDatasetWithPeriod('elevation_cache', elevationCacheArray, {
                specificDate: new Date(specificDate),
            })
            if (saved) {
                console.log(`Elevation data saved for Drill (date: ${dateStr})`)
            }
        }

        return elevationCacheArray
    } catch (error) {
        console.error('Error caching elevation for date:', error.message)
        return []
    }
}

/**
 * Get unique coordinates from earthquakes array
 * Reduces API calls by removing duplicate locations
 * @param {Array} earthquakes - Array of earthquake objects
 * @returns {Array} Array of unique coordinate objects
 */
function getUniqueCoordinates(earthquakes) {
    const coordMap = new Map()

    earthquakes.forEach((eq) => {
        // Round to 4 decimals (~11 meters precision)
        const key = `${eq.latitude.toFixed(4)},${eq.longitude.toFixed(4)}`

        if (!coordMap.has(key)) {
            coordMap.set(key, {
                latitude: eq.latitude,
                longitude: eq.longitude,
            })
        }
    })

    return Array.from(coordMap.values())
}
