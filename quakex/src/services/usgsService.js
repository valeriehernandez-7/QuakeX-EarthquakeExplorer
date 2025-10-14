import axios from 'axios'
import { API_ENDPOINTS, APP_SETTINGS } from '@/utils/constants'
import { getDateRangeForPeriod, getDateRangeForSpecificDate } from '@/utils/helpers'
import { saveDatasetWithPeriod } from './drillService'

/**
 * USGS Earthquake Service
 * Handles data fetching and transformation from USGS Earthquake Catalog API
 * API Documentation: https://earthquake.usgs.gov/fdsnws/event/1/
 */

// Create axios instance with configuration
const usgsClient = axios.create({
    baseURL: API_ENDPOINTS.USGS,
    timeout: APP_SETTINGS.requestTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Fetch earthquakes from USGS API
 * @param {Object} params - Query parameters
 * @param {Date} params.startTime - Start date for earthquake search
 * @param {Date} params.endTime - End date for earthquake search
 * @param {number} params.minMagnitude - Minimum magnitude filter
 * @param {number} params.maxMagnitude - Maximum magnitude filter
 * @param {number} params.limit - Maximum number of results (default: 1000)
 * @returns {Promise<Array>} Array of normalized earthquake objects
 */
export async function fetchEarthquakes(params = {}) {
    try {
        const {
            startTime = getDefaultStartDate(),
            endTime = new Date(),
            minMagnitude = 2.5,
            maxMagnitude = 10.0,
            limit = 1000,
        } = params

        // Build query parameters
        // Note: format=geojson&orderby=time already in base URL from .env
        const queryParams = {
            starttime: formatDateForUSGS(startTime),
            endtime: formatDateForUSGS(endTime),
            minmagnitude: minMagnitude,
            maxmagnitude: maxMagnitude,
            limit: Math.min(limit, APP_SETTINGS.maxEarthquakesToDisplay),
        }

        console.log('Fetching earthquakes with params:', queryParams)

        const response = await usgsClient.get('', { params: queryParams })

        // Validate response
        if (!response.data || response.data.type !== 'FeatureCollection') {
            throw new Error('Invalid GeoJSON response from USGS')
        }

        console.log(
            `USGS API returned ${response.data.metadata.count} earthquakes (status: ${response.data.metadata.status})`,
        )

        // Transform GeoJSON to normalized format
        const earthquakes = transformUSGSData(response.data)

        console.log(`Successfully processed ${earthquakes.length} earthquakes`)

        return earthquakes
    } catch (error) {
        if (error.response) {
            // API returned an error response
            console.error('USGS API Error:', error.response.status, error.response.statusText)
            console.error('Response data:', error.response.data)
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response from USGS API. Check network connection.')
        } else {
            // Something else went wrong
            console.error('Error fetching earthquakes:', error.message)
        }

        return [] // Return empty array on error (graceful degradation)
    }
}

/**
 * Transform USGS GeoJSON format to application format
 * @param {Object} geojson - GeoJSON FeatureCollection from USGS
 * @returns {Array} Array of normalized earthquake objects
 */
function transformUSGSData(geojson) {
    if (!geojson || !geojson.features || !Array.isArray(geojson.features)) {
        console.warn('Invalid GeoJSON data received')
        return []
    }

    return geojson.features
        .filter((feature) => {
            // Filter out invalid features
            if (!feature.properties || !feature.geometry) return false
            if (!feature.geometry.coordinates || feature.geometry.coordinates.length < 3)
                return false
            return true
        })
        .map((feature) => {
            const { id, properties, geometry } = feature

            // Handle potential null/undefined values
            const magnitude = properties.mag ?? 0
            const depth = geometry.coordinates[2] ?? 0
            const latitude = geometry.coordinates[1]
            const longitude = geometry.coordinates[0]

            return {
                // Core properties
                id: id || `eq-${Date.now()}-${Math.random()}`,
                magnitude: Number(magnitude.toFixed(1)),
                depth: Number(depth.toFixed(1)), // Depth in km (can be negative for above sea level)
                latitude: Number(latitude.toFixed(4)),
                longitude: Number(longitude.toFixed(4)),
                place: properties.place || 'Unknown location',
                time: new Date(properties.time), // Convert epoch milliseconds to Date
                url: properties.url || '',

                // Additional useful properties
                significance: properties.sig || 0, // USGS significance score (0-1000)
                type: properties.type || 'earthquake',
                status: properties.status || 'automatic', // 'automatic', 'reviewed', 'deleted'
                magType: properties.magType || 'unknown', // 'md', 'ml', 'ms', 'mw', 'me', 'mi', 'mb', 'mlg'
                tsunami: properties.tsunami === 1, // Convert to boolean

                // Seismic intensity (if available)
                felt: properties.felt, // Number of "Did You Feel It?" reports
                cdi: properties.cdi, // Community Decimal Intensity (1-10 scale)
                mmi: properties.mmi, // Modified Mercalli Intensity
                alert: properties.alert, // 'green', 'yellow', 'orange', 'red', null

                // Metadata
                updated: properties.updated ? new Date(properties.updated) : null,
                title: properties.title || `M${magnitude} - ${properties.place}`,
            }
        })
}

/**
 * Get default start date (30 days ago)
 * @returns {Date} Date object for 30 days ago
 */
function getDefaultStartDate() {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date
}

/**
 * Format date for USGS API (ISO 8601 format)
 * USGS expects: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
function formatDateForUSGS(date) {
    // Return ISO format without milliseconds and timezone
    return date.toISOString().split('.')[0]
}

/**
 * Export earthquakes data to JSON file (for Apache Drill)
 * @param {Array} earthquakes - Array of earthquake objects
 * @param {string} filename - Filename for export
 */
export function saveToJSON(earthquakes, filename = `earthquakes_${Date.now()}.json`) {
    try {
        // Create formatted JSON with proper indentation
        const dataStr = JSON.stringify(earthquakes, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        // Create temporary download link
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

        console.log(`Earthquakes exported to ${filename}`)
        return true
    } catch (error) {
        console.error('Error exporting earthquakes to JSON:', error)
        return false
    }
}

/**
 * Get earthquake by ID from USGS API
 * @param {string} eventId - USGS event ID
 * @returns {Promise<Object|null>} Earthquake object or null
 */
export async function fetchEarthquakeById(eventId) {
    try {
        const response = await usgsClient.get('', {
            params: {
                eventid: eventId,
            },
        })

        if (response.data && response.data.features && response.data.features.length > 0) {
            const earthquakes = transformUSGSData(response.data)
            return earthquakes[0]
        }

        return null
    } catch (error) {
        console.error(`Error fetching earthquake ${eventId}:`, error.message)
        return null
    }
}

/**
 * Get recent significant earthquakes (M4.5+, last 7 days)
 * Useful for quick overview/testing
 * @returns {Promise<Array>} Array of significant earthquakes
 */
export async function fetchSignificantEarthquakes() {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return fetchEarthquakes({
        startTime: sevenDaysAgo,
        endTime: new Date(),
        minMagnitude: 4.5,
        limit: 100,
    })
}

/**
 * Fetch earthquakes for a predefined time period
 * Automatically saves data with standardized filename for Drill
 * @param {string} timePeriod - Time period key (e.g., 'LAST_WEEK', 'TODAY')
 * @param {Object} [options={}] - Additional options
 * @param {number} [options.minMagnitude=2.5] - Minimum magnitude
 * @param {number} [options.maxMagnitude=10.0] - Maximum magnitude
 * @param {boolean} [options.saveForDrill=true] - Save to Drill-compatible JSON
 * @returns {Promise<Array>} Array of earthquake objects
 *
 * @example
 * const earthquakes = await fetchEarthquakesForPeriod('LAST_WEEK')
 * // Automatically saves to: earthquakes_last_week.json
 */
export async function fetchEarthquakesForPeriod(timePeriod, options = {}) {
    try {
        const { minMagnitude = 2.5, maxMagnitude = 10.0, saveForDrill = true } = options

        // Get date range for the period
        const dateRange = getDateRangeForPeriod(timePeriod)

        if (!dateRange) {
            console.error('Invalid time period:', timePeriod)
            return []
        }

        const { startDate, endDate } = dateRange

        console.log(`Fetching earthquakes for period: ${timePeriod}`)
        console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)

        // Fetch earthquakes using existing function
        const earthquakes = await fetchEarthquakes({
            startTime: startDate,
            endTime: endDate,
            minMagnitude,
            maxMagnitude,
            limit: APP_SETTINGS.maxEarthquakesToDisplay,
        })

        console.log(`Retrieved ${earthquakes.length} earthquakes for ${timePeriod}`)

        // Save for Drill if requested
        if (saveForDrill && earthquakes.length > 0) {
            const saved = saveDatasetWithPeriod('earthquakes', earthquakes, { timePeriod })
            if (saved) {
                console.log(`Earthquakes saved for Drill (period: ${timePeriod})`)
            }
        }

        return earthquakes
    } catch (error) {
        console.error(`Error fetching earthquakes for period ${timePeriod}:`, error.message)
        return []
    }
}

/**
 * Fetch earthquakes for a specific date
 * Retrieves all earthquakes that occurred on the given date (00:00 to 23:59)
 * @param {Date|string} date - The specific date to query
 * @param {Object} [options={}] - Additional options
 * @param {number} [options.minMagnitude=2.5] - Minimum magnitude
 * @param {number} [options.maxMagnitude=10.0] - Maximum magnitude
 * @param {boolean} [options.saveForDrill=true] - Save to Drill-compatible JSON
 * @returns {Promise<Array>} Array of earthquake objects
 *
 * @example
 * const earthquakes = await fetchEarthquakesForDate(new Date('2024-10-15'))
 * // Automatically saves to: earthquakes_2024-10-15.json
 */
export async function fetchEarthquakesForDate(date, options = {}) {
    try {
        const { minMagnitude = 2.5, maxMagnitude = 10.0, saveForDrill = true } = options

        // Get date range for the specific date (full day)
        const { startDate, endDate } = getDateRangeForSpecificDate(date)

        console.log(`Fetching earthquakes for date: ${startDate.toISOString().split('T')[0]}`)

        // Fetch earthquakes
        const earthquakes = await fetchEarthquakes({
            startTime: startDate,
            endTime: endDate,
            minMagnitude,
            maxMagnitude,
            limit: APP_SETTINGS.maxEarthquakesToDisplay,
        })

        console.log(`Retrieved ${earthquakes.length} earthquakes for the date`)

        // Save for Drill if requested
        if (saveForDrill && earthquakes.length > 0) {
            const saved = saveDatasetWithPeriod('earthquakes', earthquakes, {
                specificDate: startDate,
            })
            if (saved) {
                console.log(
                    `✓ Earthquakes saved for Drill (date: ${startDate.toISOString().split('T')[0]})`,
                )
            }
        }

        return earthquakes
    } catch (error) {
        console.error('Error fetching earthquakes for specific date:', error.message)
        return []
    }
}

/**
 * Get statistics for earthquakes in a time period
 * Useful for quick overview without fetching all data
 * @param {string} timePeriod - Time period key
 * @returns {Promise<Object>} Statistics object
 */
export async function getEarthquakeStatsForPeriod(timePeriod) {
    try {
        const earthquakes = await fetchEarthquakesForPeriod(timePeriod, {
            saveForDrill: false,
        })

        if (earthquakes.length === 0) {
            return {
                total: 0,
                avgMagnitude: 0,
                maxMagnitude: 0,
                minMagnitude: 0,
                avgDepth: 0,
            }
        }

        const magnitudes = earthquakes.map((eq) => eq.magnitude)
        const depths = earthquakes.map((eq) => eq.depth)

        return {
            total: earthquakes.length,
            avgMagnitude: Number(
                (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(2),
            ),
            maxMagnitude: Math.max(...magnitudes),
            minMagnitude: Math.min(...magnitudes),
            avgDepth: Number((depths.reduce((a, b) => a + b, 0) / depths.length).toFixed(1)),
            maxDepth: Math.max(...depths),
            minDepth: Math.min(...depths),
        }
    } catch (error) {
        console.error('Error getting earthquake stats:', error.message)
        return null
    }
}
