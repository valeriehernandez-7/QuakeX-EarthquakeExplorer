import { MAGNITUDE_LEVELS, DEPTH_CATEGORIES } from './constants'

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
