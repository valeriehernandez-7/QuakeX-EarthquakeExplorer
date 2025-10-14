import axios from 'axios'
import { API_ENDPOINTS, APP_SETTINGS } from '@/utils/constants'
import { saveDatasetWithPeriod } from './drillService'

/**
 * Weather Service
 * Handles historical weather data fetching from Open-Meteo Archive API
 * API Documentation: https://open-meteo.com/en/docs/historical-weather-api
 *
 * Icons: Uses Material Design Icons (MDI) for weather conditions
 * Icon Library: https://pictogrammers.com/library/mdi/category/weather/
 *
 * Note: Historical weather data has a 5-day delay
 * For recent data (last 5 days), use the Forecast API with past_days parameter
 */

// Create axios instance with configuration
const weatherClient = axios.create({
    baseURL: API_ENDPOINTS.WEATHER,
    timeout: APP_SETTINGS.requestTimeout,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Weather variables to request from API (Standard level)
 * Balance between information and API response time
 * Matches the exact parameters from API documentation
 */
const HOURLY_VARIABLES = [
    'temperature_2m', // Temperature at 2 meters above ground
    'precipitation', // Precipitation (rain + snow)
    'surface_pressure', // Atmospheric pressure at surface level
    'pressure_msl', // Atmospheric pressure at mean sea level (meteorological standard)
    'weather_code', // WMO weather code
    'cloud_cover', // Cloud cover percentage
    'relative_humidity_2m', // Relative humidity
    'wind_speed_10m', // Wind speed at 10 meters
    'wind_direction_10m', // Wind direction in degrees
]

/**
 * In-memory cache for weather data
 * Key format: "lat,lng,date"
 * Prevents redundant API calls for same location/time
 */
const weatherCache = new Map()

/**
 * Fetch historical weather data for a specific location and time
 * @param {Object} params - Query parameters
 * @param {number} params.latitude - Geographical latitude
 * @param {number} params.longitude - Geographical longitude
 * @param {Date|string} params.date - Date for weather data (earthquake time)
 * @param {boolean} [params.useCache=true] - Whether to use cached data
 * @returns {Promise<Object|null>} Normalized weather object or null on error
 */
export async function fetchWeatherAtTime(params) {
    try {
        const { latitude, longitude, date, useCache = true } = params

        // Validate required parameters
        if (!latitude || !longitude || !date) {
            console.error('Missing required parameters: latitude, longitude, and date are required')
            return null
        }

        // Format date to YYYY-MM-DD
        const dateString = formatDateForAPI(date)

        // Check cache first
        const cacheKey = `${latitude},${longitude},${dateString}`
        if (useCache && weatherCache.has(cacheKey)) {
            console.log('Using cached weather data for', cacheKey)
            return weatherCache.get(cacheKey)
        }

        // Build query parameters
        const queryParams = {
            latitude: Number(latitude.toFixed(4)),
            longitude: Number(longitude.toFixed(4)),
            start_date: dateString,
            end_date: dateString,
            hourly: HOURLY_VARIABLES.join(','),
            timezone: 'auto', // Automatic timezone detection
        }

        console.log('Fetching weather data for:', { latitude, longitude, date: dateString })

        const response = await weatherClient.get('', { params: queryParams })

        // Validate response
        if (!response.data || !response.data.hourly) {
            console.warn('Invalid weather API response')
            return null
        }

        // Transform API response to normalized format
        const weatherData = transformWeatherData(response.data, date)

        // Cache the result
        if (weatherData) {
            weatherCache.set(cacheKey, weatherData)
            console.log('Weather data cached successfully')
        }

        return weatherData
    } catch (error) {
        if (error.response) {
            console.error('Weather API Error:', error.response.status, error.response.statusText)
        } else if (error.request) {
            console.error('No response from Weather API. Check network connection.')
        } else {
            console.error('Error fetching weather data:', error.message)
        }

        return null // Graceful degradation - return null on error
    }
}

/**
 * Transform Open-Meteo API response to application format
 * Finds the weather data closest to the earthquake time
 * @param {Object} apiData - Raw API response from Open-Meteo
 * @param {Date|string} earthquakeTime - Exact time of earthquake
 * @returns {Object|null} Normalized weather object
 */
function transformWeatherData(apiData, earthquakeTime) {
    try {
        const { hourly, hourly_units, timezone, timezone_abbreviation } = apiData

        if (!hourly || !hourly.time || hourly.time.length === 0) {
            console.warn('No hourly data in API response')
            return null
        }

        // Find the index closest to earthquake time
        const closestIndex = findClosestHourIndex(hourly.time, earthquakeTime)

        if (closestIndex === -1) {
            console.warn('Could not find matching hour in weather data')
            return null
        }

        // Extract data for the closest hour
        const weatherAtTime = {
            // Timestamp information
            timestamp: hourly.time[closestIndex],
            timezone: timezone,
            timezoneAbbreviation: timezone_abbreviation,

            // Temperature
            temperature: {
                value: hourly.temperature_2m[closestIndex],
                unit: hourly_units.temperature_2m,
            },

            // Precipitation
            precipitation: {
                value: hourly.precipitation[closestIndex],
                unit: hourly_units.precipitation,
            },

            // Atmospheric pressure (both surface and mean sea level)
            pressure: {
                surface: {
                    value: hourly.surface_pressure[closestIndex],
                    unit: hourly_units.surface_pressure,
                },
                msl: {
                    value: hourly.pressure_msl[closestIndex],
                    unit: hourly_units.pressure_msl,
                },
            },

            // Wind
            wind: {
                speed: {
                    value: hourly.wind_speed_10m[closestIndex],
                    unit: hourly_units.wind_speed_10m,
                },
                direction: {
                    value: hourly.wind_direction_10m[closestIndex],
                    unit: hourly_units.wind_direction_10m,
                    cardinal: getCardinalDirection(hourly.wind_direction_10m[closestIndex]),
                },
            },

            // Humidity
            humidity: {
                value: hourly.relative_humidity_2m[closestIndex],
                unit: hourly_units.relative_humidity_2m,
            },

            // Cloud cover
            cloudCover: {
                value: hourly.cloud_cover[closestIndex],
                unit: hourly_units.cloud_cover,
                description: getCloudCoverDescription(hourly.cloud_cover[closestIndex]),
            },

            // Weather condition (with MDI icon)
            weatherCode: {
                code: hourly.weather_code[closestIndex],
                description: getWeatherDescription(hourly.weather_code[closestIndex]),
                icon: getWeatherMDIIcon(hourly.weather_code[closestIndex]),
                primeIcon: getWeatherPrimeIcon(hourly.weather_code[closestIndex]), // Fallback
            },
        }

        return weatherAtTime
    } catch (error) {
        console.error('Error transforming weather data:', error.message)
        return null
    }
}

/**
 * Find the index of the hour closest to the target time
 * @param {Array<string>} timeArray - Array of ISO8601 time strings from API
 * @param {Date|string} targetTime - Target time to match
 * @returns {number} Index of closest hour, or -1 if not found
 */
function findClosestHourIndex(timeArray, targetTime) {
    const target = new Date(targetTime)
    const targetHour = target.getHours()

    // Find exact hour match first
    const exactMatch = timeArray.findIndex((timeStr) => {
        const hour = new Date(timeStr).getHours()
        return hour === targetHour
    })

    if (exactMatch !== -1) {
        return exactMatch
    }

    // If no exact match, find closest hour
    let closestIndex = 0
    let minDiff = Infinity

    timeArray.forEach((timeStr, index) => {
        const current = new Date(timeStr)
        const diff = Math.abs(current - target)
        if (diff < minDiff) {
            minDiff = diff
            closestIndex = index
        }
    })

    return closestIndex
}

/**
 * Convert wind direction degrees to cardinal direction
 * @param {number} degrees - Wind direction in degrees (0-360)
 * @returns {string} Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
function getCardinalDirection(degrees) {
    if (degrees === null || degrees === undefined) return 'N/A'

    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
}

/**
 * Get cloud cover description from percentage
 * @param {number} percentage - Cloud cover percentage (0-100)
 * @returns {string} Human-readable description
 */
function getCloudCoverDescription(percentage) {
    if (percentage === null || percentage === undefined) return 'Unknown'
    if (percentage < 10) return 'Clear sky'
    if (percentage < 30) return 'Few clouds'
    if (percentage < 60) return 'Partly cloudy'
    if (percentage < 90) return 'Mostly cloudy'
    return 'Overcast'
}

/**
 * Get weather description from WMO weather code
 * WMO Weather interpretation codes (WW)
 * @param {number} code - WMO weather code
 * @returns {string} Weather description
 */
function getWeatherDescription(code) {
    const weatherCodes = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    }

    return weatherCodes[code] || 'Unknown'
}

/**
 * Get Material Design Icon name for weather code
 * Uses vue-material-design-icons component names
 * Icons from: https://pictogrammers.com/library/mdi/category/weather/
 *
 * @param {number} code - WMO weather code
 * @returns {string} MDI component name (PascalCase)
 */
function getWeatherMDIIcon(code) {
    // Map WMO codes to Material Design Icon component names
    const iconMap = {
        // Clear conditions
        0: 'WeatherSunny', // Clear sky
        1: 'WeatherPartlyCloudy', // Mainly clear

        // Cloudy conditions
        2: 'WeatherPartlyCloudy', // Partly cloudy
        3: 'WeatherCloudy', // Overcast

        // Fog
        45: 'WeatherFog', // Fog
        48: 'WeatherFog', // Depositing rime fog

        // Drizzle
        51: 'WeatherRainy', // Light drizzle
        53: 'WeatherRainy', // Moderate drizzle
        55: 'WeatherPouring', // Dense drizzle
        56: 'WeatherPartlySnowyRainy', // Light freezing drizzle
        57: 'WeatherPartlySnowyRainy', // Dense freezing drizzle

        // Rain
        61: 'WeatherRainy', // Slight rain
        63: 'WeatherPouring', // Moderate rain
        65: 'WeatherPouring', // Heavy rain
        66: 'WeatherPartlySnowyRainy', // Light freezing rain
        67: 'WeatherPartlySnowyRainy', // Heavy freezing rain

        // Snow
        71: 'WeatherPartlySnowy', // Slight snow
        73: 'WeatherSnowy', // Moderate snow
        75: 'WeatherSnowyHeavy', // Heavy snow
        77: 'WeatherSnowy', // Snow grains

        // Showers
        80: 'WeatherRainy', // Slight rain showers
        81: 'WeatherPouring', // Moderate rain showers
        82: 'WeatherPouring', // Violent rain showers
        85: 'WeatherSnowy', // Slight snow showers
        86: 'WeatherSnowyHeavy', // Heavy snow showers

        // Thunderstorm
        95: 'WeatherLightning', // Thunderstorm
        96: 'WeatherLightningRainy', // Thunderstorm with slight hail
        99: 'WeatherLightningRainy', // Thunderstorm with heavy hail
    }

    return iconMap[code] || 'CloudClockOutline' // Default fallback
}

/**
 * Get PrimeIcons icon name for weather code (fallback option)
 * @param {number} code - WMO weather code
 * @returns {string} PrimeIcons class name
 */
function getWeatherPrimeIcon(code) {
    // Map weather codes to PrimeIcons (simpler set)
    if (code === 0 || code === 1) return 'pi pi-sun'
    if (code === 2 || code === 3) return 'pi pi-cloud'
    if (code >= 45 && code <= 48) return 'pi pi-cloud'
    if (code >= 51 && code <= 67) return 'pi pi-cloud'
    if (code >= 71 && code <= 77) return 'pi pi-cloud'
    if (code >= 80 && code <= 86) return 'pi pi-cloud'
    if (code >= 95 && code <= 99) return 'pi pi-bolt'

    return 'pi pi-question-circle' // Unknown
}

/**
 * Format date to YYYY-MM-DD format for API
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateForAPI(date) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Clear weather cache
 * Useful for testing or manual cache invalidation
 */
export function clearWeatherCache() {
    weatherCache.clear()
    console.log('Weather cache cleared')
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getWeatherCacheStats() {
    return {
        size: weatherCache.size,
        keys: Array.from(weatherCache.keys()),
    }
}

/**
 * Export weather data to JSON file
 * Saves all cached weather data for Apache Drill consumption
 * @param {string} [filename] - Custom filename
 * @returns {boolean} Success status
 */
export function exportWeatherCache(filename = `weather_cache_${Date.now()}.json`) {
    try {
        if (weatherCache.size === 0) {
            console.warn('Weather cache is empty, nothing to export')
            return false
        }

        // Convert Map to array of objects
        const cacheArray = Array.from(weatherCache.entries()).map(([key, value]) => {
            const [lat, lng, date] = key.split(',')
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
                date: date,
                ...value,
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

        console.log(`Weather cache exported to ${filename}`)
        return true
    } catch (error) {
        console.error('Error exporting weather cache:', error)
        return false
    }
}

/**
 * Cache weather data for all earthquakes in a time period
 * Creates a batch weather cache for Drill queries
 * @param {string} timePeriod - Time period key (e.g., 'LAST_WEEK')
 * @param {Array} earthquakes - Array of earthquake objects
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.saveForDrill=true] - Save to Drill-compatible JSON
 * @returns {Promise<Array>} Array of weather data objects
 *
 * @example
 * const earthquakes = await fetchEarthquakesForPeriod('LAST_WEEK')
 * const weatherData = await cacheWeatherForPeriod('LAST_WEEK', earthquakes)
 * // Saves to: weather_cache_last_week.json
 */
export async function cacheWeatherForPeriod(timePeriod, earthquakes, options = {}) {
    try {
        const { saveForDrill = true } = options

        if (!earthquakes || earthquakes.length === 0) {
            console.warn('No earthquakes provided for weather caching')
            return []
        }

        console.log(
            `Caching weather data for ${earthquakes.length} earthquakes (period: ${timePeriod})`,
        )

        const weatherDataArray = []
        let successCount = 0
        let failCount = 0

        // Fetch weather for each earthquake
        for (const earthquake of earthquakes) {
            try {
                const weatherData = await fetchWeatherAtTime({
                    latitude: earthquake.latitude,
                    longitude: earthquake.longitude,
                    datetime: earthquake.time,
                })

                if (weatherData) {
                    weatherDataArray.push({
                        earthquakeId: earthquake.id,
                        latitude: earthquake.latitude,
                        longitude: earthquake.longitude,
                        time: earthquake.time,
                        ...weatherData,
                    })
                    successCount++
                } else {
                    failCount++
                }
            } catch (error) {
                console.error(
                    `Failed to fetch weather for earthquake ${earthquake.id}:`,
                    error.message,
                )
                failCount++
            }
        }

        console.log(`Weather cache complete: ${successCount} success, ${failCount} failed`)

        // Save for Drill
        if (saveForDrill && weatherDataArray.length > 0) {
            const saved = saveDatasetWithPeriod('weather_cache', weatherDataArray, { timePeriod })
            if (saved) {
                console.log(`Weather data saved for Drill (period: ${timePeriod})`)
            }
        }

        return weatherDataArray
    } catch (error) {
        console.error('Error caching weather for period:', error.message)
        return []
    }
}

/**
 * Cache weather data for earthquakes on a specific date
 * @param {Date|string} specificDate - The specific date
 * @param {Array} earthquakes - Array of earthquake objects
 * @param {Object} [options={}] - Additional options
 * @returns {Promise<Array>} Array of weather data objects
 *
 * @example
 * const date = new Date('2024-10-15')
 * const earthquakes = await fetchEarthquakesForDate(date)
 * const weatherData = await cacheWeatherForDate(date, earthquakes)
 * // Saves to: weather_cache_2024-10-15.json
 */
export async function cacheWeatherForDate(specificDate, earthquakes, options = {}) {
    try {
        const { saveForDrill = true } = options

        if (!earthquakes || earthquakes.length === 0) {
            console.warn('No earthquakes provided for weather caching')
            return []
        }

        const dateStr = new Date(specificDate).toISOString().split('T')[0]
        console.log(`Caching weather data for ${earthquakes.length} earthquakes (date: ${dateStr})`)

        const weatherDataArray = []
        let successCount = 0
        let failCount = 0

        // Fetch weather for each earthquake
        for (const earthquake of earthquakes) {
            try {
                const weatherData = await fetchWeatherAtTime({
                    latitude: earthquake.latitude,
                    longitude: earthquake.longitude,
                    datetime: earthquake.time,
                })

                if (weatherData) {
                    weatherDataArray.push({
                        earthquakeId: earthquake.id,
                        latitude: earthquake.latitude,
                        longitude: earthquake.longitude,
                        time: earthquake.time,
                        ...weatherData,
                    })
                    successCount++
                } else {
                    failCount++
                }
            } catch (error) {
                console.error(
                    `Failed to fetch weather for earthquake ${earthquake.id}:`,
                    error.message,
                )
                failCount++
            }
        }

        console.log(`Weather cache complete: ${successCount} success, ${failCount} failed`)

        // Save for Drill
        if (saveForDrill && weatherDataArray.length > 0) {
            const saved = saveDatasetWithPeriod('weather_cache', weatherDataArray, {
                specificDate: new Date(specificDate),
            })
            if (saved) {
                console.log(`Weather data saved for Drill (date: ${dateStr})`)
            }
        }

        return weatherDataArray
    } catch (error) {
        console.error('Error caching weather for date:', error.message)
        return []
    }
}
