/**
 * Monthly Data Generator
 * Generates enriched earthquake data for Apache Drill analytics
 * Uses existing services: usgsService, countriesService, elevationService
 */

import { fetchEarthquakes } from './usgsService.js'
import { findCountryByCoordinates } from './countriesService.js'
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
                // Return basic data without enrichment
                return addTemporalData(earthquake)
            }
        })

        const batchResults = await Promise.allSettled(batchPromises)
        const successfulResults = batchResults
            .filter((result) => result.status === 'fulfilled')
            .map((result) => result.value)

        enriched.push(...successfulResults)

        // Rate limiting: wait 1 second between batches
        if (i + batchSize < earthquakes.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
        }
    }

    console.log(`Enrichment completed: ${successCount} successful, ${errorCount} failed`)
    return enriched
}

/**
 * Enrich single earthquake with external data
 */
async function enrichSingleEarthquake(earthquake) {
    const [countryData, elevationData] = await Promise.allSettled([
        findCountryByCoordinates(earthquake.latitude, earthquake.longitude),
        fetchElevation({
            latitude: earthquake.latitude,
            longitude: earthquake.longitude,
        }),
    ])

    return {
        // Core earthquake data
        ...earthquake,

        // High-value analytical data
        country:
            countryData.status === 'fulfilled'
                ? {
                    name: countryData.value?.name,
                    region: countryData.value?.region,
                    subregion: countryData.value?.subregion,
                    population: countryData.value?.population,
                    area: countryData.value?.area,
                }
                : null,

        elevation:
            elevationData.status === 'fulfilled'
                ? {
                    value: elevationData.value?.elevation,
                    category: getElevationCategory(elevationData.value?.elevation),
                }
                : null,

        // Derived temporal data (no API calls needed)
        temporal: addTemporalData(earthquake),
    }
}

/**
 * Add temporal analysis data to earthquake
 */
function addTemporalData(earthquake) {
    const date = new Date(earthquake.time)

    return {
        hour_of_day: date.getHours(),
        day_of_week: date.getDay(), // 0 = Sunday, 6 = Saturday
        month: date.getMonth(), // 0 = January, 11 = December
        season: getSeason(date),
    }
}

/**
 * Get season based on month
 */
function getSeason(date) {
    const month = date.getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
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
