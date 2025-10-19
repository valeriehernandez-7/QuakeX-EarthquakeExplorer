/**
 * Monthly Data Generator
 * Generates enriched earthquake data for Apache Drill analytics
 * Uses existing services: usgsService, countriesService, elevationService
 */

import { fetchEarthquakes } from './usgsService.js'
import { findCountryByCoordinates, findCountryByName } from './countriesService.js'
import { fetchElevation } from './elevationService.js'
import { saveForDrill } from '@/utils/helpers.js'
import { getDateRangeForPeriod } from '@/utils/helpers.js'

/**
 * Generate enriched earthquake data for a specific month
 * @param {string} monthKey - Format: 'YYYY-MM' (e.g., '2024-10')
 * @returns {Promise<Object>} Generation result
 */
export async function generateMonthlyData(monthKey) {
    console.log(`Starting monthly data generation for: ${monthKey}`)

    try {
        // 1. Calculate date range for the month
        const [year, month] = monthKey.split('-')
        const startDate = new Date(year, month - 1, 1)
        const endDate = new Date(year, month, 0) // Last day of month

        console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`)

        // 2. Fetch earthquakes from USGS
        console.log('Fetching earthquakes from USGS...')
        const earthquakes = await fetchEarthquakes({
            startTime: startDate,
            endTime: endDate,
            minMagnitude: 4.5, // Richter scale
            limit: 10000, // Maximum allowed by USGS
        })

        if (earthquakes.length === 0) {
            console.log('No earthquakes found for this period')
            return { success: true, month: monthKey, itemCount: 0, message: 'No data available' }
        }

        console.log(`Fetched ${earthquakes.length} earthquakes, starting enrichment...`)

        // 3. Enrich earthquakes with country and elevation data
        const enrichedEarthquakes = await enrichEarthquakesBatch(earthquakes)

        // 4. Save for Apache Drill
        const filename = `earthquakes-${monthKey}.json`
        const saveResult = await saveForDrill(enrichedEarthquakes, filename)

        console.log(`Monthly data generation completed for ${monthKey}`)

        return {
            success: true,
            month: monthKey,
            filename,
            itemCount: enrichedEarthquakes.length,
            enrichedCount: enrichedEarthquakes.filter((eq) => eq.country || eq.elevation).length,
            saveResult,
        }
    } catch (error) {
        console.error(`Error generating monthly data for ${monthKey}:`, error)
        return {
            success: false,
            month: monthKey,
            error: error.message,
        }
    }
}

/**
 * Enrich earthquakes with country and elevation data
 * Uses parallel processing with rate limiting
 */
async function enrichEarthquakesBatch(earthquakes) {
    const enriched = []
    let successCount = 0
    let errorCount = 0

    // Process in smaller batches to avoid API rate limits
    const batchSize = 10

    for (let i = 0; i < earthquakes.length; i += batchSize) {
        const batch = earthquakes.slice(i, i + batchSize)
        console.log(
            `Enriching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(earthquakes.length / batchSize)}...`,
        )

        const batchPromises = batch.map(async (earthquake) => {
            try {
                const enrichedEq = await enrichSingleEarthquake(earthquake)
                successCount++
                return enrichedEq
            } catch (error) {
                errorCount++
                console.warn(`Failed to enrich earthquake ${earthquake.id}:`, error.message)
                // Return basic data without enrichment but with proper structure
                return {
                    ...earthquake,
                    country: null,
                    elevation: null,
                    temporal: addTemporalData(earthquake),
                }
            }
        })

        const batchResults = await Promise.allSettled(batchPromises)
        const successfulResults = batchResults
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value)

        enriched.push(...successfulResults)

        // Rate limiting: wait 2 second between batches
        if (i + batchSize < earthquakes.length) {
            await new Promise((resolve) => setTimeout(resolve, 2000))
        }
    }

    console.log(`Enrichment completed: ${successCount} successful, ${errorCount} failed`)
    return enriched
}

/**
 * Extract country name from USGS place field
 * USGS format: "distance direction of city, Country" or "region name" (if ocean)
 * @param {string} place - USGS place string
 * @returns {string|null} Extracted country name or null
 */
function extractCountryFromPlace(place) {
    if (!place || typeof place !== 'string') return null

    // Check if place contains a comma (indicates "city, Country" format)
    const commaIndex = place.lastIndexOf(',')
    if (commaIndex === -1) return null // No comma = ocean/international waters

    // Extract text after last comma and trim
    const countryText = place.substring(commaIndex + 1).trim()

    // Validate it's not empty
    return countryText.length > 0 ? countryText : null
}

/**
 * Enrich single earthquake with external data
 */
async function enrichSingleEarthquake(earthquake) {
    // Try to extract country from USGS place field first (fast, reliable)
    let countryInfo = null
    const countryNameFromPlace = extractCountryFromPlace(earthquake.place)

    if (countryNameFromPlace) {
        try {
            const countryByName = await findCountryByName(countryNameFromPlace)
            if (countryByName) {
                countryInfo = {
                    name: countryByName.name,
                    region: countryByName.region,
                    subregion: countryByName.subregion,
                    population: countryByName.population,
                    area: countryByName.area,
                }
            }
        } catch (error) {
            console.warn(`Failed to find country by name "${countryNameFromPlace}":`, error.message)
        }
    }

    // Fallback to coordinate-based search if place extraction failed
    if (!countryInfo) {
        try {
            const countryByCoords = await findCountryByCoordinates(
                earthquake.latitude,
                earthquake.longitude,
            )

            if (countryByCoords) {
                countryInfo = {
                    name: countryByCoords.name,
                    region: countryByCoords.region,
                    subregion: countryByCoords.subregion,
                    population: countryByCoords.population,
                    area: countryByCoords.area,
                }
            }
        } catch (error) {
            console.warn(
                `Failed to find country by coordinates for ${earthquake.id}:`,
                error.message,
            )
        }
    }

    // Fetch elevation (independent of country lookup)
    let elevationInfo = null
    try {
        const elevationData = await fetchElevation(
            { latitude: earthquake.latitude, longitude: earthquake.longitude },
            true, // useCache
            2, // maxRetries (default: 2, means 3 tries)
        )

        if (elevationData) {
            elevationInfo = {
                value: elevationData.elevation,
                category: getElevationCategory(elevationData.elevation),
            }
        }
    } catch (error) {
        console.warn(`Failed to fetch elevation for ${earthquake.id}:`, error.message)
    }

    return {
        // Core earthquake data
        ...earthquake,

        // High-value analytical data
        country: countryInfo,
        elevation: elevationInfo,

        // Derived temporal data (no API calls needed)
        temporal: addTemporalData(earthquake),
    }
}

/**
 * Add temporal analysis data to earthquake
 * @param {Object} earthquake - Earthquake object with time and latitude
 * @returns {Object} Temporal data (hour, day, month, season, etc.)
 */
function addTemporalData(earthquake) {
    const date = new Date(earthquake.time)
    const isNorthernHemisphere = earthquake.latitude >= 0 // Northern: Positive | Southern: Negative

    return {
        hour_of_day: date.getUTCHours(), // 0-23 in UTC
        day_of_week: date.getUTCDay(), // 0 = Sunday, 6 = Saturday (UTC)
        month: date.getUTCMonth(), // 0 = January, 11 = December (UTC)
        year: date.getUTCFullYear(), // Full year (UTC)
        quarter: Math.floor(date.getUTCMonth() / 3) + 1, // Q1-Q4 (UTC)
        season: getSeason(date, isNorthernHemisphere),
    }
}

/**
 * Get season based on month and hemisphere
 * @param {Date} date - Date object
 * @param {boolean} isNorthernHemisphere - True if latitude >= 0
 * @returns {string} Season name
 */
function getSeason(date, isNorthernHemisphere) {
    const month = date.getUTCMonth()

    // Northern Hemisphere seasons
    let season = null
    if (month >= 2 && month <= 4)
        season = 'spring' // Mar, Apr, May
    else if (month >= 5 && month <= 7)
        season = 'summer' // Jun, Jul, Aug
    else if (month >= 8 && month <= 10)
        season = 'autumn' // Sep, Oct, Nov
    else season = 'winter' // Dec, Jan, Feb

    // Invert seasons for Southern Hemisphere
    if (!isNorthernHemisphere) {
        const seasonMap = {
            spring: 'autumn',
            summer: 'winter',
            autumn: 'spring',
            winter: 'summer',
        }
        season = seasonMap[season]
    }

    return season
}

/**
 * Categorize elevation for analysis
 */
function getElevationCategory(elevation) {
    if (elevation === null || elevation === undefined) return 'unknown'
    if (elevation < 0) return 'below_sea_level'
    if (elevation < 200) return 'lowland'
    if (elevation < 500) return 'hills'
    if (elevation < 1500) return 'mountains'
    return 'high_mountains'
}

/**
 * Get last N months for data generation (excluding current month)
 */
export function getLastMonths(count = 3) {
    const months = []
    const now = new Date()

    // Start from previous month (current month is incomplete)
    for (let i = 1; i <= count; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        months.push(`${year}-${month}`)
    }

    return months
}

/**
 * Check if monthly data exists
 */
export async function checkMonthlyDataExists(monthKey) {
    try {
        const response = await fetch('http://localhost:3001/api/files')
        const data = await response.json()

        if (data.success) {
            const filename = `earthquakes-${monthKey}.json`
            return data.files.some((file) => file.name === filename)
        }
        return false
    } catch (error) {
        console.warn('Could not check existing files:', error.message)
        return false
    }
}
