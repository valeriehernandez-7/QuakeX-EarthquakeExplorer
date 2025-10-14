import axios from 'axios'
import { API_ENDPOINTS, APP_SETTINGS } from '@/utils/constants'

/**
 * Apache Drill Service
 * Handles SQL queries to Apache Drill via REST API
 * API Documentation: https://drill.apache.org/docs/rest-api/
 *
 * Connection Details:
 * - Web UI: http://localhost:8047
 * - REST API: http://localhost:8047/query.json
 * - Workspace: dfs.quakex (configured in drill-dfs-storage-plugin.json)
 * - Data Location: /data/*.json
 */

// Create axios instance with Drill configuration
const drillClient = axios.create({
    baseURL: API_ENDPOINTS.DRILL || 'http://localhost:8047',
    timeout: APP_SETTINGS.requestTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * In-memory cache for query results
 * Key format: hash of SQL query
 * Prevents redundant queries for identical SQL
 */
const queryCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Execute SQL query against Apache Drill
 * @param {string} sql - SQL query to execute
 * @param {Object} options - Query options
 * @param {boolean} [options.useCache=true] - Use cached results
 * @param {number} [options.timeout] - Custom timeout in ms
 * @returns {Promise<Object|null>} Query result with rows and metadata
 */
export async function executeQuery(sql, options = {}) {
    try {
        const { useCache = true, timeout } = options

        // Validate SQL query
        if (!sql || typeof sql !== 'string' || sql.trim().length === 0) {
            console.error('Invalid SQL query provided')
            return null
        }

        // Check cache
        const cacheKey = hashString(sql)
        if (useCache) {
            const cached = getFromCache(cacheKey)
            if (cached) {
                console.log('Using cached query result')
                return cached
            }
        }

        console.log('Executing Drill query:', sql.substring(0, 100) + '...')

        // Prepare request payload
        const payload = {
            queryType: 'SQL',
            query: sql,
        }

        // Execute query
        const config = timeout ? { timeout } : {}
        const response = await drillClient.post('/query.json', payload, config)

        // Validate response
        if (!response.data) {
            console.warn('Invalid response from Drill API')
            return null
        }

        // Transform response to normalized format
        const result = transformDrillResponse(response.data, sql)

        // Cache the result
        if (result && result.rows.length > 0) {
            saveToCache(cacheKey, result)
        }

        return result
    } catch (error) {
        handleDrillError(error)
        return null
    }
}

/**
 * Fetch earthquakes with filters
 * @param {Object} filters - Query filters
 * @param {Array<number>} [filters.magnitudeRange=[0, 10]] - Magnitude range [min, max]
 * @param {Array<number>} [filters.depthRange] - Depth range in km [min, max]
 * @param {Date|string} [filters.startDate] - Start date
 * @param {Date|string} [filters.endDate] - End date
 * @param {number} [filters.limit=1000] - Maximum rows to return
 * @param {string} [filters.orderBy='time DESC'] - Sort order
 * @param {string} [filters.tableName='earthquakes.json'] - JSON file name
 * @returns {Promise<Array|null>} Array of earthquake objects
 */
export async function fetchEarthquakes(filters = {}) {
    try {
        const {
            magnitudeRange = [0, 10],
            depthRange,
            startDate,
            endDate,
            limit = 1000,
            orderBy = 'time DESC',
            tableName = 'earthquakes.json',
        } = filters

        // Build WHERE clauses
        const conditions = []

        // Magnitude filter
        if (magnitudeRange && magnitudeRange.length === 2) {
            conditions.push(
                `magnitude >= ${magnitudeRange[0]} AND magnitude <= ${magnitudeRange[1]}`,
            )
        }

        // Depth filter
        if (depthRange && depthRange.length === 2) {
            conditions.push(`depth >= ${depthRange[0]} AND depth <= ${depthRange[1]}`)
        }

        // Date filters
        if (startDate) {
            const startDateStr = formatDateForSQL(startDate)
            conditions.push(`CAST(\`time\` AS TIMESTAMP) >= TIMESTAMP '${startDateStr}'`)
        }

        if (endDate) {
            const endDateStr = formatDateForSQL(endDate)
            conditions.push(`CAST(\`time\` AS TIMESTAMP) <= TIMESTAMP '${endDateStr}'`)
        }

        // Build SQL query
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

        const sql = `
            SELECT 
                id,
                magnitude,
                depth,
                latitude,
                longitude,
                place,
                \`time\`,
                url,
                significance,
                type
            FROM dfs.quakex.\`${tableName}\`
            ${whereClause}
            ORDER BY ${orderBy}
            LIMIT ${limit}
        `

        const result = await executeQuery(sql)

        return result ? result.rows : null
    } catch (error) {
        console.error('Error fetching earthquakes from Drill:', error)
        return null
    }
}

/**
 * Get earthquake statistics
 * @param {string} [tableName='earthquakes.json'] - JSON file name
 * @returns {Promise<Object|null>} Statistics object
 */
export async function getEarthquakeStatistics(tableName = 'earthquakes.json') {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total_earthquakes,
                ROUND(AVG(magnitude), 2) as avg_magnitude,
                MAX(magnitude) as max_magnitude,
                MIN(magnitude) as min_magnitude,
                ROUND(AVG(depth), 0) as avg_depth_km,
                MAX(depth) as max_depth_km,
                MIN(depth) as min_depth_km,
                MAX(significance) as max_significance
            FROM dfs.quakex.\`${tableName}\`
        `

        const result = await executeQuery(sql)

        return result && result.rows.length > 0 ? result.rows[0] : null
    } catch (error) {
        console.error('Error fetching earthquake statistics:', error)
        return null
    }
}

/**
 * Get earthquakes grouped by magnitude category
 * @param {string} [tableName='earthquakes.json'] - JSON file name
 * @returns {Promise<Array|null>} Array of category statistics
 */
export async function getEarthquakesByMagnitudeCategory(tableName = 'earthquakes.json') {
    try {
        const sql = `
            SELECT 
                CASE 
                    WHEN magnitude < 4.0 THEN 'Minor (0-3.9)'
                    WHEN magnitude < 5.0 THEN 'Light (4.0-4.9)'
                    WHEN magnitude < 6.0 THEN 'Moderate (5.0-5.9)'
                    WHEN magnitude < 7.0 THEN 'Strong (6.0-6.9)'
                    ELSE 'Major (7.0+)'
                END as magnitude_category,
                COUNT(*) as count,
                ROUND(AVG(magnitude), 2) as avg_magnitude,
                MIN(magnitude) as min_magnitude,
                MAX(magnitude) as max_magnitude,
                ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM dfs.quakex.\`${tableName}\`
            GROUP BY 
                CASE 
                    WHEN magnitude < 4.0 THEN 'Minor (0-3.9)'
                    WHEN magnitude < 5.0 THEN 'Light (4.0-4.9)'
                    WHEN magnitude < 6.0 THEN 'Moderate (5.0-5.9)'
                    WHEN magnitude < 7.0 THEN 'Strong (6.0-6.9)'
                    ELSE 'Major (7.0+)'
                END
            ORDER BY count DESC
        `

        const result = await executeQuery(sql)

        return result ? result.rows : null
    } catch (error) {
        console.error('Error fetching earthquakes by magnitude category:', error)
        return null
    }
}

/**
 * Get earthquakes grouped by depth category
 * @param {string} [tableName='earthquakes.json'] - JSON file name
 * @returns {Promise<Array|null>} Array of category statistics
 */
export async function getEarthquakesByDepthCategory(tableName = 'earthquakes.json') {
    try {
        const sql = `
            SELECT 
                CASE 
                    WHEN depth < 70 THEN 'SHALLOW (<70km)'
                    WHEN depth < 300 THEN 'INTERMEDIATE (70-300km)'
                    ELSE 'DEEP (>300km)'
                END as depth_category,
                COUNT(*) as count,
                ROUND(AVG(magnitude), 2) as avg_magnitude,
                MIN(magnitude) as min_magnitude,
                MAX(magnitude) as max_magnitude
            FROM dfs.quakex.\`${tableName}\`
            GROUP BY 
                CASE 
                    WHEN depth < 70 THEN 'SHALLOW (<70km)'
                    WHEN depth < 300 THEN 'INTERMEDIATE (70-300km)'
                    ELSE 'DEEP (>300km)'
                END
            ORDER BY count DESC
        `

        const result = await executeQuery(sql)

        return result ? result.rows : null
    } catch (error) {
        console.error('Error fetching earthquakes by depth category:', error)
        return null
    }
}

/**
 * Get daily earthquake counts (temporal analysis)
 * @param {number} [days=30] - Number of days to analyze
 * @param {string} [tableName='earthquakes.json'] - JSON file name
 * @returns {Promise<Array|null>} Array of daily statistics
 */
export async function getDailyEarthquakeCounts(days = 30, tableName = 'earthquakes.json') {
    try {
        const sql = `
            SELECT 
                CAST(\`time\` AS DATE) as event_date,
                COUNT(*) as daily_count,
                ROUND(AVG(magnitude), 2) as avg_magnitude,
                MAX(magnitude) as max_magnitude
            FROM dfs.quakex.\`${tableName}\`
            WHERE CAST(\`time\` AS TIMESTAMP) >= CURRENT_DATE - INTERVAL '${days}' DAY
            GROUP BY CAST(\`time\` AS DATE)
            ORDER BY event_date DESC
        `

        const result = await executeQuery(sql)

        return result ? result.rows : null
    } catch (error) {
        console.error('Error fetching daily earthquake counts:', error)
        return null
    }
}

/**
 * Get top N strongest earthquakes
 * @param {number} [limit=10] - Number of earthquakes to return
 * @param {string} [tableName='earthquakes.json'] - JSON file name
 * @returns {Promise<Array|null>} Array of strongest earthquakes
 */
export async function getStrongestEarthquakes(limit = 10, tableName = 'earthquakes.json') {
    try {
        const sql = `
            SELECT 
                id,
                place,
                magnitude,
                depth,
                \`time\`,
                latitude,
                longitude,
                url,
                significance
            FROM dfs.quakex.\`${tableName}\`
            ORDER BY magnitude DESC
            LIMIT ${limit}
        `

        const result = await executeQuery(sql)

        return result ? result.rows : null
    } catch (error) {
        console.error('Error fetching strongest earthquakes:', error)
        return null
    }
}

/**
 * Get earthquakes by geographic zone (latitude-based)
 * @param {string} [tableName='earthquakes.json'] - JSON file name
 * @returns {Promise<Array|null>} Array of geographic statistics
 */
export async function getEarthquakesByGeographicZone(tableName = 'earthquakes.json') {
    try {
        const sql = `
            SELECT 
                CASE 
                    WHEN latitude >= 60 THEN 'Far North (60°+)'
                    WHEN latitude >= 30 THEN 'Mid North (30°-60°)'
                    WHEN latitude >= 0 THEN 'Tropics North (0°-30°)'
                    WHEN latitude >= -30 THEN 'Tropics South (0° to -30°)'
                    WHEN latitude >= -60 THEN 'Mid South (-30° to -60°)'
                    ELSE 'Far South (-60° and below)'
                END as latitude_zone,
                COUNT(*) as count,
                ROUND(AVG(magnitude), 2) as avg_magnitude
            FROM dfs.quakex.\`${tableName}\`
            GROUP BY 
                CASE 
                    WHEN latitude >= 60 THEN 'Far North (60°+)'
                    WHEN latitude >= 30 THEN 'Mid North (30°-60°)'
                    WHEN latitude >= 0 THEN 'Tropics North (0°-30°)'
                    WHEN latitude >= -30 THEN 'Tropics South (0° to -30°)'
                    WHEN latitude >= -60 THEN 'Mid South (-30° to -60°)'
                    ELSE 'Far South (-60° and below)'
                END
            ORDER BY count DESC
        `

        const result = await executeQuery(sql)

        return result ? result.rows : null
    } catch (error) {
        console.error('Error fetching earthquakes by geographic zone:', error)
        return null
    }
}

/**
 * Test Apache Drill connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testDrillConnection() {
    try {
        console.log('Testing Apache Drill connection...')

        // Simple query to test connection
        const sql = 'SELECT 1 as test_value'

        const result = await executeQuery(sql, { useCache: false })

        if (result && result.rows.length > 0) {
            console.log('Apache Drill connection successful')
            return true
        }

        console.warn('Apache Drill connection test returned no data')
        return false
    } catch (error) {
        console.error('Apache Drill connection failed:', error.message)
        return false
    }
}

/**
 * List available tables in quakex workspace
 * @returns {Promise<Array|null>} Array of table names
 */
export async function listAvailableTables() {
    try {
        const sql = `
            SELECT 
                TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = 'dfs.quakex'
        `

        const result = await executeQuery(sql)

        return result ? result.rows.map((row) => row.TABLE_NAME) : null
    } catch (error) {
        console.error('Error listing available tables:', error)
        return null
    }
}

/**
 * Get column information for a table
 * @param {string} tableName - Table name (e.g., 'earthquakes.json')
 * @returns {Promise<Array|null>} Array of column metadata
 */
export async function getTableSchema(tableName) {
    try {
        const sql = `
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'dfs.quakex' 
                AND TABLE_NAME = '${tableName}'
        `

        const result = await executeQuery(sql)

        return result ? result.rows : null
    } catch (error) {
        console.error('Error fetching table schema:', error)
        return null
    }
}

/**
 * Transform Drill API response to normalized format
 * @param {Object} rawData - Raw response from Drill API
 * @param {string} sql - Original SQL query
 * @returns {Object} Normalized result object
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
        console.error('Error transforming Drill response:', error)
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
 * @param {Error} error - Error object
 */
function handleDrillError(error) {
    if (error.code === 'ECONNREFUSED') {
        console.error('Cannot connect to Apache Drill. Is Drill running on port 8047?')
        console.error('Start Drill with: docker-compose up -d')
    } else if (error.response) {
        console.error('Apache Drill API Error:', error.response.status)
        console.error('Error message:', error.response.data?.errorMessage || error.response.data)
    } else if (error.request) {
        console.error('No response from Apache Drill. Check if Drill is running.')
    } else {
        console.error('Error executing Drill query:', error.message)
    }
}

/**
 * Format date for SQL query
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (YYYY-MM-DD HH:mm:ss)
 */
function formatDateForSQL(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Generate simple hash from string (for cache keys)
 * @param {string} str - String to hash
 * @returns {string} Hash string
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
 * Save query result to cache
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 */
function saveToCache(key, data) {
    try {
        queryCache.set(key, {
            timestamp: Date.now(),
            data: data,
        })
        console.log('Query result cached successfully')
    } catch (error) {
        console.error('Error saving to query cache:', error)
    }
}

/**
 * Get query result from cache
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null
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
        console.error('Error reading from query cache:', error)
        return null
    }
}

/**
 * Clear query cache
 */
export function clearDrillCache() {
    queryCache.clear()
    console.log('Drill query cache cleared')
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getDrillCacheStats() {
    return {
        size: queryCache.size,
        keys: Array.from(queryCache.keys()),
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
            console.warn('No data to export')
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

        console.log(`Query results exported to ${filename}`)
        return true
    } catch (error) {
        console.error('Error exporting query results:', error)
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

    // Import helpers dynamically
    const { getCacheFilename, getCacheFilenameForDate } = require('@/utils/helpers')

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

/**
 * Get filtered earthquakes for time period
 * Supports both predefined periods and specific dates
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Array|null>} Filtered earthquakes
 */
export async function getFilteredEarthquakesByPeriod(filters) {
    const {
        timePeriod,
        specificDate = null,
        minMagnitude = 0,
        maxMagnitude = 10,
        minDepth = 0,
        maxDepth = 1000,
        limit = 1000,
    } = filters

    // Import helper dynamically
    const { getCacheFilename, getCacheFilenameForDate } = require('@/utils/helpers')

    const filename = specificDate
        ? getCacheFilenameForDate(specificDate)
        : getCacheFilename(timePeriod)

    const sql = `
        SELECT 
            id,
            magnitude,
            depth,
            latitude,
            longitude,
            place,
            \`time\`,
            url,
            significance
        FROM dfs.quakex.\`${filename}\`
        WHERE magnitude >= ${minMagnitude}
          AND magnitude <= ${maxMagnitude}
          AND depth >= ${minDepth}
          AND depth <= ${maxDepth}
        ORDER BY \`time\` DESC
        LIMIT ${limit}
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}

/**
 * Get earthquake statistics for time period
 * @param {string} timePeriod - Time period value
 * @param {Date|string} [specificDate] - Optional specific date
 * @returns {Promise<Object|null>} Statistics object
 */
export async function getStatisticsForPeriod(timePeriod, specificDate = null) {
    const { getCacheFilename, getCacheFilenameForDate } = require('@/utils/helpers')

    const filename = specificDate
        ? getCacheFilenameForDate(specificDate)
        : getCacheFilename(timePeriod)

    const sql = `
        SELECT 
            COUNT(*) as total,
            ROUND(AVG(magnitude), 2) as avgMagnitude,
            MAX(magnitude) as maxMagnitude,
            MIN(magnitude) as minMagnitude,
            ROUND(AVG(depth), 0) as avgDepth,
            MAX(significance) as maxSignificance
        FROM dfs.quakex.\`${filename}\`
    `

    const result = await executeQuery(sql)
    return result && result.rows.length > 0 ? result.rows[0] : null
}

/**
 * Get temporal distribution for time period
 * @param {string} timePeriod - Time period value
 * @param {Date|string} [specificDate] - Optional specific date
 * @param {string} [groupBy='day'] - Group by: 'day', 'week', 'month'
 * @returns {Promise<Array|null>} Temporal distribution
 */
export async function getTemporalDistributionForPeriod(
    timePeriod,
    specificDate = null,
    groupBy = 'day',
) {
    const { getCacheFilename, getCacheFilenameForDate } = require('@/utils/helpers')

    const filename = specificDate
        ? getCacheFilenameForDate(specificDate)
        : getCacheFilename(timePeriod)

    let groupExpression
    switch (groupBy) {
        case 'week':
            groupExpression = 'EXTRACT(WEEK FROM CAST(`time` AS TIMESTAMP))'
            break
        case 'month':
            groupExpression = 'EXTRACT(MONTH FROM CAST(`time` AS TIMESTAMP))'
            break
        default:
            groupExpression = 'CAST(`time` AS DATE)'
    }

    const sql = `
        SELECT 
            ${groupExpression} as timeGroup,
            COUNT(*) as count,
            ROUND(AVG(magnitude), 2) as avgMagnitude,
            MAX(magnitude) as maxMagnitude
        FROM dfs.quakex.\`${filename}\`
        GROUP BY ${groupExpression}
        ORDER BY timeGroup
    `

    const result = await executeQuery(sql)
    return result ? result.rows : null
}
