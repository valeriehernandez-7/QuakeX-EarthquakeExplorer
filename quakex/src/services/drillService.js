/**
 * Apache Drill Service - Analytics Version
 * Optimized for AnalyticsView with multi-month query support
 *
 * Features:
 * - 16+ analytics queries for multi-month data
 * - Automatic data availability validation
 * - Query result caching (5 min)
 * - UNION ALL queries across multiple months
 *
 * Connection:
 * - Web UI: http://localhost:8047
 * - REST API: http://localhost:8047/query.json (via proxy /api/drill)
 * - Workspace: dfs.quakex
 * - Data Location: /data/earthquakes-YYYY-MM.json
 */

import axios from 'axios'
import { API_ENDPOINTS, APP_SETTINGS } from '@/utils/constants'
import { getCacheFilename, getCacheFilenameForDate } from '@/utils/helpers'
import { monthlyManager } from './monthlyDataManagerService'

// Create axios instance with Drill configuration
// Uses proxy from vite.config: /api/drill -> http://localhost:8047
const drillClient = axios.create({
    baseURL: API_ENDPOINTS.DRILL || '/api/drill',
    timeout: APP_SETTINGS.requestTimeout || 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// In-memory cache for query results
const queryCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Execute SQL query against Apache Drill
 * @param {string} sql - SQL query
 * @param {Object} options - Query options
 * @param {boolean} [options.useCache=true] - Use cached results
 * @param {number} [options.timeout] - Custom timeout in ms
 * @returns {Promise<Object|null>} Query result
 */
async function executeQuery(sql, options = {}) {
    const { useCache = true, timeout } = options

    try {
        console.log('[drillService] Executing Drill query...')

        // Check cache
        const cacheKey = hashString(sql)
        if (useCache) {
            const cached = getFromCache(cacheKey)
            if (cached) {
                console.log('[drillService] Using cached result')
                return cached
            }
        }

        console.log('[drillService] Sending SQL:', sql.substring(0, 200) + '...')

        // Prepare request payload
        const payload = {
            queryType: 'SQL',
            query: sql,
        }

        console.log(
            '[drillService] Sending request to:',
            drillClient.defaults.baseURL + '/query.json',
        )

        // Execute query using drillClient (with proxy)
        const config = timeout ? { timeout } : {}
        const response = await drillClient.post('/query.json', payload, config)

        console.log('[drillService] Received response. Status:', response.status)

        if (response.data.queryState === 'FAILED') {
            console.error('[drillService] DRILL QUERY FAILED!')
            console.error('Full error response:', JSON.stringify(response.data, null, 2))
            console.error('Error message:', response.data.errorMessage)
            console.error('Error details:', response.data)
            console.error('Failed query:', sql)
            return null
        }

        // Validate response
        if (!response.data) {
            console.warn('[drillService] Invalid response from Drill API - no data')
            return null
        }

        console.log('[drillService] Response data structure:', {
            hasRows: !!response.data.rows,
            rowCount: response.data.rows ? response.data.rows.length : 0,
            columns: response.data.columns ? response.data.columns.length : 0,
            queryState: response.data.queryState,
        })

        // Transform response to normalized format
        const result = transformDrillResponse(response.data, sql)

        console.log('[drillService] Query completed. Returning', result.rowCount, 'rows')

        // Cache result
        if (result && result.rows.length > 0) {
            saveToCache(cacheKey, result)
        }

        return result
    } catch (error) {
        console.error('[drillService] Execute query failed completely')
        handleDrillError(error)
        return null
    }
}

/**
 * Build UNION ALL query for multiple months
 * @private
 */
function buildUnionQuery(months, selectClause, whereClause = '') {
    return months
        .map((month) => {
            const sql = `SELECT ${selectClause} FROM dfs.quakex.\`earthquakes-${month}.json\``
            return whereClause ? `${sql} WHERE ${whereClause}` : sql
        })
        .join('\n    UNION ALL\n    ')
}

/**
 * Simple string hash function
 * @private
 */
function hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
    }
    return hash.toString(36)
}

/**
 * Transform Drill API response to normalized format
 * @private
 */
function transformDrillResponse(rawData, sql) {
    try {
        return {
            // Query metadata
            query: sql,
            executionTime: Date.now(),

            // Rows data
            rows: rawData.rows || [],
            rowCount: rawData.rows ? rawData.rows.length : 0,

            // Column metadata
            columns: rawData.columns || [],

            // Query metadata from Drill
            queryId: rawData.queryId,
            queryState: rawData.queryState,

            // API metadata
            metadata: {
                queryType: 'SQL',
                workspace: 'dfs.quakex',
            },
        }
    } catch (error) {
        console.error('[drillService] Error transforming response:', error)
        return {
            query: sql,
            rows: [],
            rowCount: 0,
            columns: [],
            error: error.message,
        }
    }
}

/**
 * Handle Drill API errors
 * @private
 */
function handleDrillError(error) {
    console.error('[drillService] DRILL ERROR DETAILS:', error)

    if (error.code === 'ECONNREFUSED') {
        console.error(
            '[drillService] Cannot connect to Apache Drill. Is Drill running on port 8047?',
        )
        console.error('[drillService] Start Drill with: docker-compose up -d')
    } else if (error.response) {
        console.error('[drillService] Apache Drill API Error:', error.response.status)
        console.error('[drillService] Response headers:', error.response.headers)
        console.error(
            '[drillService] Error message:',
            error.response.data?.errorMessage || error.response.data,
        )
        console.error('[drillService] Full response data:', error.response.data)
    } else if (error.request) {
        console.error('[drillService] No response from Apache Drill. Check if Drill is running.')
        console.error('[drillService] Request details:', error.request)
    } else {
        console.error('[drillService] Error executing Drill query:', error.message)
        console.error('[drillService] Stack trace:', error.stack)
    }
}

/**
 * Save query result to cache
 * @private
 */
function saveToCache(key, data) {
    try {
        queryCache.set(key, {
            timestamp: Date.now(),
            data: data,
        })
        console.log('[drillService] Query result cached successfully')
    } catch (error) {
        console.error('[drillService] Error saving to cache:', error)
    }
}

/**
 * Get query result from cache
 * @private
 */
function getFromCache(key) {
    try {
        const cached = queryCache.get(key)
        if (!cached) return null

        // Check if cache is expired
        const age = Date.now() - cached.timestamp
        if (age > CACHE_DURATION) {
            queryCache.delete(key)
            return null
        }

        return cached.data
    } catch (error) {
        console.error('[drillService] Error reading from cache:', error)
        return null
    }
}

// DATA AVAILABILITY VALIDATION

/**
 * Ensure monthly data files exist before executing queries
 * Automatically generates missing months if needed
 * @param {Array<string>} months - Array of month keys ['2025-10', '2025-09', '2025-08']
 * @returns {Promise<boolean>} True if all data is available
 */
export async function ensureDataAvailable(months) {
    try {
        console.log('[drillService] Checking data availability for months:', months)

        // Get available months from file system
        const availableMonths = await monthlyManager.getAvailableMonths()
        const missingMonths = months.filter((month) => !availableMonths.includes(month))

        if (missingMonths.length === 0) {
            console.log('[drillService] All months available')
            return true
        }

        console.log('[drillService] Missing months detected:', missingMonths)
        console.log('[drillService] Generating missing data...')

        // Generate missing months
        const result = await monthlyManager.generateMissingMonths(missingMonths)

        // Check if all generations succeeded
        const allSuccess = result.every((r) => r.success)

        if (allSuccess) {
            console.log('[drillService] All missing data generated successfully')
        } else {
            console.error('[drillService] Some data generation failed:', result)
        }

        return allSuccess
    } catch (error) {
        console.error('[drillService] Error ensuring data availability:', error)
        return false
    }
}

// GLOBAL STATISTICS

/**
 * Get global statistics for multiple months
 * @param {Array<string>} months - Array of month keys ['2025-07', '2025-08', '2025-09']
 * @returns {Promise<Array|null>} Statistics by month
 */
export async function getGlobalStatistics(months) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT 
            COUNT(*) AS total_events,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude,
            MAX(\`magnitude\`) AS max_magnitude,
            MIN(\`magnitude\`) AS min_magnitude,
            ROUND(AVG(\`depth\`), 1) AS avg_depth,
            MAX(\`depth\`) AS max_depth,
            MIN(\`depth\`) AS min_depth,
            '${month}' AS month
        FROM dfs.quakex.\`earthquakes-${month}.json\`
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `${unionQuery} ORDER BY month ASC`

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get aggregated global statistics (total across all months)
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Object|null>} Aggregated statistics
 */
export async function getGlobalStatisticsTotal(months) {
    const unionQuery = buildUnionQuery(months, '\`magnitude\`, \`depth\`')

    const sql = `
        SELECT 
            COUNT(*) AS total_events,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude,
            MAX(\`magnitude\`) AS max_magnitude,
            MIN(\`magnitude\`) AS min_magnitude,
            ROUND(AVG(\`depth\`), 1) AS avg_depth,
            MAX(\`depth\`) AS max_depth,
            MIN(\`depth\`) AS min_depth
        FROM (
            ${unionQuery}
        ) AS all_events
    `

    const result = await executeQuery(sql)
    return result && result.rows.length > 0 ? result.rows[0] : null
}

/**
 * Get top countries by earthquake activity
 * @param {Array<string>} months - Array of month keys
 * @param {number} limit - Number of countries to return
 * @returns {Promise<Array|null>} Top countries with statistics
 */
export async function getTopCountries(months, limit = 20) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT 
            CAST(\`country\`['name'] AS VARCHAR) AS country_name,
            CAST(\`country\`['region'] AS VARCHAR) AS region,
            CAST(\`country\`['subregion'] AS VARCHAR) AS subregion,
            CAST(\`magnitude\` AS DOUBLE) AS magnitude_val,
            CAST(\`depth\` AS DOUBLE) AS depth_val,
            CASE WHEN \`tsunami\` = true THEN 1 ELSE 0 END AS tsunami_val,
            CASE WHEN \`magnitude\` >= 6.0 THEN 1 ELSE 0 END AS major_val
        FROM dfs.quakex.\`earthquakes-${month}.json\`
        WHERE \`country\`['name'] IS NOT NULL
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `
        SELECT 
            country_name,
            region,
            subregion,
            COUNT(*) AS total_events,
            ROUND(AVG(magnitude_val), 2) AS avg_magnitude,
            MAX(magnitude_val) AS max_magnitude,
            MIN(magnitude_val) AS min_magnitude,
            ROUND(AVG(depth_val), 1) AS avg_depth,
            SUM(tsunami_val) AS tsunami_events,
            SUM(major_val) AS major_events
        FROM (
            ${unionQuery}
        ) AS normalized_events
        GROUP BY country_name, region, subregion
        ORDER BY total_events DESC
        LIMIT ${limit}
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get list of all countries with event counts
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Countries with event counts
 */
export async function getCountryList(months) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT \`country\`
        FROM dfs.quakex.\`earthquakes-${month}.json\`
        WHERE \`country\`['name'] IS NOT NULL
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `
        SELECT 
            CAST(\`country\`['name'] AS VARCHAR) AS country_name,
            CAST(\`country\`['region'] AS VARCHAR) AS region,
            COUNT(*) AS event_count
        FROM (
            ${unionQuery}
        ) AS all_events
        GROUP BY 
            CAST(\`country\`['name'] AS VARCHAR),
            CAST(\`country\`['region'] AS VARCHAR)
        ORDER BY event_count DESC, country_name ASC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get all earthquakes for a specific country
 * @param {string} countryName - Country name (e.g., 'Costa Rica')
 * @param {Array<string>} months - Array of month keys
 * @param {number} limit - Maximum number of events to return
 * @returns {Promise<Array|null>} Earthquake events
 */
export async function getEarthquakesByCountry(countryName, months, limit = 1000) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT 
            \`id\`,
            \`magnitude\`,
            \`depth\`,
            \`latitude\`,
            \`longitude\`,
            \`place\`,
            \`time\`,
            \`significance\`,
            \`status\`,
            \`felt\`,
            \`alert\`,
            \`tsunami\`,
            \`url\`
        FROM dfs.quakex.\`earthquakes-${month}.json\`
        WHERE CAST(\`country\`['name'] AS VARCHAR) = '${countryName}'
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `
        SELECT * FROM (
            ${unionQuery}
        ) AS country_events
        ORDER BY \`time\` DESC
        LIMIT ${limit}
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get statistics for a specific country
 * @param {string} countryName - Country name
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Object|null>} Country statistics
 */
export async function getCountryStatistics(countryName, months) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT \`magnitude\`, \`depth\`, \`tsunami\`, \`felt\`
        FROM dfs.quakex.\`earthquakes-${month}.json\`
        WHERE CAST(\`country\`['name'] AS VARCHAR) = '${countryName}'
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `
        SELECT 
            COUNT(*) AS total_events,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude,
            MAX(\`magnitude\`) AS max_magnitude,
            MIN(\`magnitude\`) AS min_magnitude,
            ROUND(AVG(\`depth\`), 1) AS avg_depth,
            MAX(\`depth\`) AS max_depth,
            MIN(\`depth\`) AS min_depth,
            SUM(CASE WHEN \`tsunami\` = true THEN 1 ELSE 0 END) AS tsunami_events,
            SUM(CASE WHEN \`magnitude\` >= 6.0 THEN 1 ELSE 0 END) AS major_events,
            SUM(CASE WHEN \`felt\` IS NOT NULL THEN 1 ELSE 0 END) AS felt_events
        FROM (
            ${unionQuery}
        ) AS country_events
    `

    const result = await executeQuery(sql)
    return result && result.rows.length > 0 ? result.rows[0] : null
}

/**
 * Get monthly timeline for a specific country
 * @param {string} countryName - Country name
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Monthly timeline data
 */
export async function getCountryTimeline(countryName, months) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT 
            '${month}' AS month,
            \`magnitude\`
        FROM dfs.quakex.\`earthquakes-${month}.json\`
        WHERE CAST(\`country\`['name'] AS VARCHAR) = '${countryName}'
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `
        SELECT 
            month,
            COUNT(*) AS event_count,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude,
            MAX(\`magnitude\`) AS max_magnitude
        FROM (
            ${unionQuery}
        ) AS country_timeline
        GROUP BY month
        ORDER BY month ASC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get strongest earthquakes across multiple months
 * @param {Array<string>} months - Array of month keys
 * @param {number} limit - Number of earthquakes to return
 * @returns {Promise<Array|null>} Strongest earthquakes
 */
export async function getStrongestEarthquakes(months, limit = 10) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT 
            \`id\`,
            \`magnitude\`,
            \`depth\`,
            \`place\`,
            \`time\`,
            \`country\`
        FROM dfs.quakex.\`earthquakes-${month}.json\`
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `
        SELECT 
            \`id\`,
            \`magnitude\`,
            \`depth\`,
            \`place\`,
            \`time\`,
            COALESCE(CAST(\`country\`['name'] AS VARCHAR), 'Unknown') AS country_name,
            COALESCE(CAST(\`country\`['region'] AS VARCHAR), 'N/A') AS region
        FROM (
            ${unionQuery}
        ) AS all_events
        ORDER BY \`magnitude\` DESC
        LIMIT ${limit}
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get all tsunami events
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Tsunami events
 */
export async function getTsunamiEvents(months) {
    const unionQuery = months
        .map(
            (month) => `
        SELECT 
            \`id\`, \`magnitude\`, \`depth\`, \`place\`, \`time\`, 
            \`country\`, \`significance\`, \`url\`, \`tsunami\`
        FROM dfs.quakex.\`earthquakes-${month}.json\`
        WHERE \`tsunami\` = true
    `,
        )
        .join('\n    UNION ALL\n    ')

    const sql = `
        SELECT 
            \`id\`,
            \`magnitude\`,
            \`depth\`,
            \`place\`,
            \`time\`,
            COALESCE(CAST(\`country\`['name'] AS VARCHAR), 'Unknown') AS country_name,
            CAST(\`country\`['region'] AS VARCHAR) AS region,
            \`significance\`,
            \`url\`
        FROM (
            ${unionQuery}
        ) AS tsunami_events
        ORDER BY \`magnitude\` DESC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

// MAGNITUDE DISTRIBUTION

/**
 * Get magnitude distribution (histogram data)
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Magnitude distribution
 */
export async function getMagnitudeDistribution(months) {
    const unionQuery = buildUnionQuery(months, '\`magnitude\`')

    const sql = `
        SELECT 
            CASE 
                WHEN \`magnitude\` < 4.0 THEN '0-3.9'
                WHEN \`magnitude\` < 5.0 THEN '4.0-4.9'
                WHEN \`magnitude\` < 6.0 THEN '5.0-5.9'
                WHEN \`magnitude\` < 7.0 THEN '6.0-6.9'
                ELSE '7.0+'
            END AS magnitude_range,
            COUNT(*) AS count,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude
        FROM (
            ${unionQuery}
        ) AS all_magnitudes
        GROUP BY 
            CASE 
                WHEN \`magnitude\` < 4.0 THEN '0-3.9'
                WHEN \`magnitude\` < 5.0 THEN '4.0-4.9'
                WHEN \`magnitude\` < 6.0 THEN '5.0-5.9'
                WHEN \`magnitude\` < 7.0 THEN '6.0-6.9'
                ELSE '7.0+'
            END
        ORDER BY magnitude_range ASC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get depth distribution
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Depth distribution
 */
export async function getDepthDistribution(months) {
    const unionQuery = buildUnionQuery(months, '\`depth\`')

    const sql = `
        SELECT 
            CASE 
                WHEN \`depth\` < 70 THEN '0-70km (Shallow)'
                WHEN \`depth\` < 300 THEN '70-300km (Intermediate)'
                ELSE '300+km (Deep)'
            END AS depth_range,
            COUNT(*) AS count
        FROM (
            ${unionQuery}
        ) AS all_depths
        GROUP BY 
            CASE 
                WHEN \`depth\` < 70 THEN '0-70km (Shallow)'
                WHEN \`depth\` < 300 THEN '70-300km (Intermediate)'
                ELSE '300+km (Deep)'
            END
        ORDER BY count DESC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get daily timeline (events per day)
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Daily timeline data
 */
export async function getDailyTimeline(months) {
    const unionQuery = buildUnionQuery(months, '\`time\`, \`magnitude\`')

    const sql = `
        SELECT 
            CAST(\`time\` AS DATE) AS event_date,
            COUNT(*) AS event_count,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude,
            MAX(\`magnitude\`) AS max_magnitude
        FROM (
            ${unionQuery}
        ) AS all_events
        GROUP BY CAST(\`time\` AS DATE)
        ORDER BY event_date ASC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get hourly distribution (events by hour of day)
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Hourly distribution
 */
export async function getHourlyDistribution(months) {
    const unionQuery = buildUnionQuery(months, "temporal['hour_of_day'], \`magnitude\`")

    const sql = `
        SELECT 
            temporal['hour_of_day'] AS hour,
            COUNT(*) AS event_count,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude
        FROM (
            ${unionQuery}
        ) AS all_events
        GROUP BY temporal['hour_of_day']
        ORDER BY hour ASC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get scatter plot data (depth vs magnitude)
 * @param {Array<string>} months - Array of month keys
 * @param {number} limit - Maximum number of points
 * @param {boolean} includeCountry - Include country name
 * @returns {Promise<Array|null>} Scatter plot data
 */
export async function getScatterPlotData(months, limit = 1000, includeCountry = false) {
    const selectClause = includeCountry
        ? '\`magnitude\`, \`depth\`, \`significance\`, \`country\`'
        : '\`magnitude\`, \`depth\`, \`significance\`'

    const unionQuery = buildUnionQuery(months, selectClause)

    const countryCast = includeCountry
        ? `, CAST(\`country\`['name'] AS VARCHAR) AS country_name`
        : ''

    const sql = `
        SELECT 
            CAST(\`magnitude\` AS DOUBLE) AS magnitude,
            CAST(\`depth\` AS DOUBLE) AS depth,
            CASE 
                WHEN \`depth\` < 70 THEN 'shallow'
                WHEN \`depth\` >= 70 AND \`depth\` < 300 THEN 'intermediate'
                ELSE 'deep'
            END AS depth_category,
            CAST(\`significance\` AS INTEGER) AS significance
            ${countryCast}
        FROM (
            ${unionQuery}
        ) AS all_events
        WHERE \`depth\` IS NOT NULL AND \`magnitude\` IS NOT NULL
        LIMIT ${limit}
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get magnitude type distribution
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Magnitude type distribution
 */
export async function getMagnitudeTypeDistribution(months) {
    const unionQuery = buildUnionQuery(months, '\`magType\`, \`magnitude\`')

    const sql = `
        SELECT 
            CAST(\`magType\` AS VARCHAR) AS magnitude_type,
            COUNT(*) AS event_count,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude,
            MAX(\`magnitude\`) AS max_magnitude,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
        FROM (
            ${unionQuery}
        ) AS all_events
        GROUP BY CAST(\`magType\` AS VARCHAR)
        ORDER BY event_count DESC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get elevation category distribution
 * @param {Array<string>} months - Array of month keys
 * @returns {Promise<Array|null>} Elevation distribution
 */
export async function getElevationDistribution(months) {
    const unionQuery = buildUnionQuery(months, '\`elevation\`, \`magnitude\`')

    const sql = `
        SELECT 
            CAST(\`elevation\`['category'] AS VARCHAR) AS elevation_category,
            COUNT(*) AS event_count,
            ROUND(AVG(\`magnitude\`), 2) AS avg_magnitude,
            ROUND(AVG(CAST(\`elevation\`['value'] AS INTEGER)), 0) AS avg_elevation_m
        FROM (
            ${unionQuery}
        ) AS all_events
        GROUP BY CAST(\`elevation\`['category'] AS VARCHAR)
        ORDER BY event_count DESC
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Clear query cache
 */
export function clearCache() {
    queryCache.clear()
    console.log('[drillService] Cache cleared')
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return {
        size: queryCache.size,
        entries: Array.from(queryCache.keys()),
    }
}

/**
 * Export query result to JSON file
 * @param {Array} data - Data to export
 * @param {string} [filename] - Custom filename
 * @returns {boolean} Success status
 */
export function exportQueryResultToJSON(data, filename = `drill_export_${Date.now()}.json`) {
    try {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn('[drillService] No data to export')
            return false
        }

        const dataStr = JSON.stringify(data, null, 2)
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

        console.log(`[drillService] Query results exported to ${filename}`)
        return true
    } catch (error) {
        console.error('[drillService] Error exporting query results:', error)
        return false
    }
}

/**
 * Save dataset with time period support
 * @param {string} datasetName - Dataset name
 * @param {Array|Object} data - Data to save
 * @param {Object} [options={}] - Save options
 * @returns {boolean} Success status
 */
export function saveDatasetWithPeriod(datasetName, data, options = {}) {
    const { timePeriod = null, specificDate = null } = options

    let filename
    if (specificDate) {
        filename = getCacheFilenameForDate(specificDate)
    } else if (timePeriod) {
        filename = getCacheFilename(timePeriod)
    } else {
        filename = `${datasetName}.json`
    }

    return exportQueryResultToJSON(data, filename)
}
