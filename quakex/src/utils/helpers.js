import {
    MAGNITUDE_LEVELS,
    DEPTH_CATEGORIES,
    TIME_PERIODS,
    DEFAULT_TIME_PERIOD,
    SPECIFIC_DATE_MODE,
    CACHE_EXPIRATION,
    TIME_PERIOD_OPTIONS,
} from './constants'

/**
 * Get magnitude severity level based on magnitude value
 * @param {number} magnitude - Earthquake magnitude
 * @returns {Object} Magnitude level object with label, color, description
 */
export function getMagnitudeLevel(magnitude) {
    for (const [key, level] of Object.entries(MAGNITUDE_LEVELS)) {
        const [min, max] = level.range
        if (magnitude >= min && magnitude <= max) {
            return { ...level, key }
        }
    }
    return MAGNITUDE_LEVELS.MINOR // Default fallback
}

/**
 * Get depth category based on depth value in kilometers
 * @param {number} depth - Earthquake depth in km
 * @returns {Object} Depth category object
 */
export function getDepthCategory(depth) {
    for (const [key, category] of Object.entries(DEPTH_CATEGORIES)) {
        const [min, max] = category.range
        if (depth >= min && depth < max) {
            return { ...category, key }
        }
    }
    return DEPTH_CATEGORIES.DEEP // Default fallback
}

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format string (default: 'DD MMM YYYY, HH:mm:ss')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'DD MMM YYYY, HH:mm:ss') {
    // This will use dayjs in the actual implementation
    // For now, return a basic format
    const d = new Date(date)
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    })
}

/**
 * Calculate marker size based on magnitude
 * @param {number} magnitude - Earthquake magnitude
 * @returns {number} Marker size in pixels
 */
export function calculateMarkerSize(magnitude) {
    const baseSize = 20
    const scaleFactor = 8
    return baseSize + magnitude * scaleFactor
}

/**
 * Calculate marker opacity based on depth
 * @param {number} depth - Earthquake depth in km
 * @returns {number} Opacity value (0-1)
 */
export function calculateMarkerOpacity(depth) {
    if (depth < 70) return 1.0 // Shallow
    if (depth < 300) return 0.7 // Intermediate
    return 0.5 // Deep
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 60) {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

/**
 * Generate Google Maps URL
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level
 * @returns {string} Google Maps URL
 */
export function generateGoogleMapsUrl(lat, lng, zoom = 10) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/**
 * Generate Google Maps embed URL
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level
 * @returns {string} Google Maps embed URL
 */
export function generateGoogleMapsEmbedUrl(lat, lng, zoom = 10) {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
}

/**
 * Get time period configuration by value
 * @param {string} value - Time period value (e.g., 'LAST_WEEK')
 * @returns {Object} Time period configuration
 */
export function getTimePeriod(value) {
    return TIME_PERIODS[value] || DEFAULT_TIME_PERIOD
}

/**
 * Calculate start date for a time period
 * @param {string} periodValue - Time period value
 * @returns {Date} Start date
 */
export function getStartDateForPeriod(periodValue) {
    const period = getTimePeriod(periodValue)
    const now = new Date()
    return new Date(now.getTime() - period.days * 24 * 60 * 60 * 1000)
}

/**
 * Calculate start and end dates for a time period
 * @param {string} periodValue - Time period value
 * @returns {Object} Object with startDate and endDate
 */
export function getDateRangeForPeriod(periodValue) {
    if (periodValue === SPECIFIC_DATE_MODE.value) {
        // For specific date mode, this will be called with actual date
        return null
    }

    const endDate = new Date()
    const startDate = getStartDateForPeriod(periodValue)

    return { startDate, endDate }
}

/**
 * Get date range for a specific date (single day)
 * @param {Date|string} date - The specific date
 * @returns {Object} Object with startDate and endDate (start and end of that day)
 */
export function getDateRangeForSpecificDate(date) {
    const targetDate = new Date(date)

    // Start of day (00:00:00)
    const startDate = new Date(targetDate)
    startDate.setHours(0, 0, 0, 0)

    // End of day (23:59:59)
    const endDate = new Date(targetDate)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate }
}

/**
 * Get cache filename for a time period
 * @param {string} periodValue - Time period value
 * @returns {string} Cache filename
 */
export function getCacheFilename(periodValue) {
    if (periodValue === SPECIFIC_DATE_MODE.value) {
        // For specific dates, use the date in the filename
        return null // Will be handled separately with date param
    }

    const period = getTimePeriod(periodValue)
    return `${period.cacheKey}.json`
}

/**
 * Get cache filename for a specific date
 * @param {Date|string} date - The specific date
 * @returns {string} Cache filename with date
 */
export function getCacheFilenameForDate(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `earthquakes_${year}-${month}-${day}.json`
}

/**
 * Check if cache is expired based on update frequency
 * @param {number} timestamp - Cache timestamp (Date.now())
 * @param {string} frequency - Update frequency ('hourly', 'daily', 'weekly', 'monthly')
 * @returns {boolean} True if expired
 */
export function isCacheExpired(timestamp, frequency) {
    const expirationTime = CACHE_EXPIRATION[frequency] || CACHE_EXPIRATION.daily
    return Date.now() - timestamp > expirationTime
}

/**
 * Format time period as readable string
 * @param {string} periodValue - Time period value
 * @returns {string} Human-readable period description
 */
export function formatTimePeriod(periodValue) {
    const period = getTimePeriod(periodValue)
    return period.label
}

/**
 * Get all available time periods for UI
 * @returns {Array<Object>} Array of time period objects
 */
export function getAvailableTimePeriods() {
    return TIME_PERIOD_OPTIONS
}

/**
 * Export data as JSON file (browser download)
 * @param {Array|Object} data - Data to export
 * @param {string} filename - Filename for download
 * @returns {boolean} Success status
 */
export function exportAsJSON(data, filename) {
    try {
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
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

        return true
    } catch (error) {
        console.error('Error exporting JSON:', error)
        return false
    }
}

/**
 * Export data as CSV file (browser download)
 * @param {Array<Object>} data - Array of objects to export
 * @param {string} filename - Filename for download
 * @param {Array<string>} [columns] - Optional array of column names
 * @returns {boolean} Success status
 */
export function exportAsCSV(data, filename, columns = null) {
    try {
        if (!data || data.length === 0) {
            console.warn('No data to export')
            return false
        }

        // Get columns from first object if not provided
        const cols = columns || Object.keys(data[0])

        // Create CSV header
        const header = cols.join(',')

        // Create CSV rows
        const rows = data.map((item) => {
            return cols
                .map((col) => {
                    const value = item[col]
                    // Escape commas and quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`
                    }
                    return value
                })
                .join(',')
        })

        const csvContent = [header, ...rows].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
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

        return true
    } catch (error) {
        console.error('Error exporting CSV:', error)
        return false
    }
}

/**
 * Save data to JSON file via JSON Saver server for Apache Drill
 * Falls back to browser download if server unavailable
 * @param {Array|Object} data - Data to save
 * @param {string} filename - JSON filename (e.g., 'earthquakes-2024-10.json')
 * @returns {Promise<Object>} Result object with success status
 */
export async function saveForDrill(data, filename) {
    try {
        const response = await fetch('http://localhost:3001/api/save-json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename,
                data,
            }),
        })

        if (response.ok) {
            const result = await response.json()
            console.log(`Data saved for Drill: ${filename} (${result.itemCount} items)`)
            return result
        }

        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
    } catch (error) {
        console.warn('JSON Saver server unavailable, falling back to download:', error.message)

        const downloadSuccess = exportAsJSON(data, filename)

        return {
            success: downloadSuccess,
            filename,
            fallback: true,
            message: downloadSuccess
                ? 'File downloaded - please place in /data directory manually'
                : 'Failed to save file',
        }
    }
}
