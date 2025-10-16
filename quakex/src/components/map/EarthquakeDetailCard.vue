<template>
    <!-- Solo mostrar el dialog cuando TODO esté cargado -->
    <Dialog
        v-model:visible="isVisible"
        :modal="true"
        :closable="true"
        :dismissableMask="true"
        :style="{ width: '900px', maxWidth: '95vw' }"
        class="earthquake-detail-dialog"
    >
        <template #header>
            <div class="dialog-header">
                <div class="header-content">
                    <div class="magnitude-badge" :style="{ background: magnitudeColor }">
                        <CrosshairsGps :size="24" fillColor="white" />
                        <span class="magnitude-value"
                            >M {{ earthquake?.magnitude.toFixed(1) }}</span
                        >
                    </div>
                    <div class="header-info">
                        <h3 class="earthquake-title">{{ earthquake?.place }}</h3>
                        <div class="earthquake-meta">
                            <CalendarClock :size="16" fillColor="#64748b" />
                            <span>{{ formatDateTime(earthquake?.time) }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Loading State - Show until ALL data is ready -->
        <div v-if="isLoadingData" class="loading-container">
            <ProgressSpinner />
            <p class="loading-text">Loading earthquake details...</p>
            <small class="loading-subtext">Fetching data from multiple sources</small>
        </div>

        <!-- Main Content - Only show when ALL data is loaded -->
        <div v-else class="detail-content">
            <!-- Core Earthquake Information -->
            <Card class="info-card">
                <template #title>
                    <div class="section-header">
                        <InformationOutline :size="24" fillColor="#3b82f6" />
                        <span>Earthquake Details</span>
                    </div>
                </template>
                <template #content>
                    <div class="info-grid">
                        <!-- Magnitude -->
                        <div class="info-item">
                            <div class="info-label">
                                <ChartLineVariant :size="18" fillColor="#ef4444" />
                                <span>Magnitude</span>
                            </div>
                            <div class="info-value magnitude-value">
                                {{ earthquake.magnitude.toFixed(1) }}
                            </div>
                            <Tag :severity="magnitudeSeverity" :value="magnitudeLabel" />
                        </div>

                        <!-- Depth -->
                        <div class="info-item">
                            <div class="info-label">
                                <ArrowCollapseDown :size="18" fillColor="#8b5cf6" />
                                <span>Depth</span>
                            </div>
                            <div class="info-value">{{ Math.round(earthquake.depth) }} km</div>
                            <small class="depth-category">{{ depthCategory }}</small>
                        </div>

                        <!-- Significance -->
                        <div class="info-item">
                            <div class="info-label">
                                <StarOutline :size="18" fillColor="#f59e0b" />
                                <span>Significance</span>
                            </div>
                            <div class="info-value">{{ earthquake.significance }}</div>
                            <small>USGS significance score</small>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Location & Geography Section -->
            <div class="grid-2-cols">
                <!-- Location Card -->
                <Card class="location-card">
                    <template #title>
                        <div class="section-header">
                            <MapMarkerRadius :size="24" fillColor="#10b981" />
                            <span>Location</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="location-details">
                            <!-- Coordinates -->
                            <div class="coord-item">
                                <AxisZArrow :size="18" fillColor="#64748b" />
                                <div>
                                    <div class="coord-label">Latitude</div>
                                    <div class="coord-value">
                                        {{ earthquake.latitude.toFixed(4) }}°
                                    </div>
                                </div>
                            </div>
                            <div class="coord-item">
                                <AxisXArrow :size="18" fillColor="#64748b" />
                                <div>
                                    <div class="coord-label">Longitude</div>
                                    <div class="coord-value">
                                        {{ earthquake.longitude.toFixed(4) }}°
                                    </div>
                                </div>
                            </div>

                            <!-- Elevation -->
                            <div v-if="elevation" class="elevation-section">
                                <div class="elevation-info">
                                    <ImageFilterHdr :size="20" fillColor="#10b981" />
                                    <div>
                                        <div class="elevation-label">SURFACE ELEVATION</div>
                                        <div class="elevation-value">
                                            {{ elevation.elevation }} m
                                            <Tag
                                                :severity="elevationSeverity"
                                                :value="elevation.description"
                                                size="small"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <!-- Tsunami -->
                                <div class="elevation-info">
                                    <WavesArrowUp :size="20" fillColor="#06b6d4" />

                                    <div>
                                        <div class="elevation-label">TSUNAMI ALERT</div>
                                        <div class="elevation-value">
                                            <Tag
                                                :severity="
                                                    earthquake.tsunami ? 'danger' : 'success'
                                                "
                                                :value="earthquake.tsunami ? ' YES' : ' NO'"
                                                :icon="
                                                    earthquake.tsunami
                                                        ? 'pi pi-exclamation-triangle'
                                                        : 'pi pi-check'
                                                "
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Country Info -->
                        <div v-if="countryInfo" class="country-section">
                            <Divider />
                            <div class="country-header">
                                <FlagVariant :size="20" fillColor="#3b82f6" />
                                <span class="country-label">Country/Region</span>
                            </div>
                            <div class="country-info">
                                <img
                                    :src="countryInfo.flag"
                                    class="country-flag"
                                    :alt="countryInfo.name"
                                />
                                <div>
                                    <div class="country-name">{{ countryInfo.name }}</div>
                                    <small class="country-details">
                                        <span v-if="countryInfo.capital">{{
                                            countryInfo.capital
                                        }}</span>
                                        <span v-if="countryInfo.capital && countryInfo.population">
                                            •
                                        </span>
                                        <span v-if="countryInfo.population"
                                            >Population:
                                            {{ formatPopulation(countryInfo.population) }}</span
                                        >
                                    </small>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Weather Conditions Card -->
                <Card v-if="weather" class="weather-card">
                    <template #title>
                        <div class="section-header">
                            <CloudClockOutline :size="24" fillColor="#3b82f6" />
                            <span>Weather Conditions</span>
                        </div>
                    </template>
                    <template #content>
                        <div class="weather-content">
                            <!-- Main Weather Display -->
                            <div class="weather-main">
                                <component
                                    :is="weatherIconComponent"
                                    :size="64"
                                    fillColor="#3b82f6"
                                />
                                <div>
                                    <div class="weather-description">
                                        {{ weather.weatherCode.description }}
                                    </div>
                                    <small class="weather-time">At time of earthquake</small>
                                </div>
                            </div>

                            <Divider />

                            <!-- Weather Metrics Grid -->
                            <div class="weather-metrics">
                                <!-- Temperature -->
                                <div class="weather-metric">
                                    <Thermometer :size="20" fillColor="#ef4444" />
                                    <div>
                                        <div class="metric-label">Temperature</div>
                                        <div class="metric-value">
                                            {{ weather.temperature.value }}
                                            {{ weather.temperature.unit }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Humidity -->
                                <div class="weather-metric">
                                    <WaterPercent :size="20" fillColor="#06b6d4" />
                                    <div>
                                        <div class="metric-label">Humidity</div>
                                        <div class="metric-value">
                                            {{ weather.humidity.value }} {{ weather.humidity.unit }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Pressure -->
                                <div class="weather-metric">
                                    <Gauge :size="20" fillColor="#8b5cf6" />
                                    <div>
                                        <div class="metric-label">Pressure</div>
                                        <div class="metric-value">
                                            {{ weather.pressure.msl.value }}
                                            {{ weather.pressure.msl.unit }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Wind -->
                                <div class="weather-metric">
                                    <WeatherWindy :size="20" fillColor="#64748b" />
                                    <div>
                                        <div class="metric-label">Wind Speed</div>
                                        <div class="metric-value">
                                            {{ weather.wind.speed.value }}
                                            {{ weather.wind.speed.unit }}
                                            {{ weather.wind.direction.cardinal }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Cloud Cover -->
                                <div class="weather-metric">
                                    <CloudOutline :size="20" fillColor="#94a3b8" />
                                    <div>
                                        <div class="metric-label">Cloud Cover</div>
                                        <div class="metric-value">
                                            {{ weather.cloudCover.value }}
                                            {{ weather.cloudCover.unit }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Precipitation -->
                                <div class="weather-metric">
                                    <WeatherRainy :size="20" fillColor="#3b82f6" />
                                    <div>
                                        <div class="metric-label">Precipitation</div>
                                        <div class="metric-value">
                                            {{ weather.precipitation.value }}
                                            {{ weather.precipitation.unit }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Google Maps Embed -->
            <Card class="map-card">
                <template #title>
                    <div class="section-header">
                        <MapOutline :size="24" fillColor="#ea4335" />
                        <span>Location Map</span>
                    </div>
                </template>
                <template #content>
                    <div class="map-container">
                        <iframe
                            :src="googleMapsEmbedUrl"
                            width="100%"
                            height="300"
                            style="border: 0; border-radius: 8px"
                            allowfullscreen=""
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                    <div class="map-actions">
                        <Button
                            label="Open in Google Maps"
                            icon="pi pi-external-link"
                            size="small"
                            outlined
                            @click="openGoogleMaps"
                        />
                    </div>
                </template>
            </Card>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <div class="footer-actions-left">
                    <Button
                        icon="pi pi-external-link"
                        label="View on USGS"
                        text
                        @click="openUSGS"
                    />
                    <Button icon="pi pi-share-alt" label="Share" text @click="share" />
                </div>
                <Button
                    label="Close"
                    icon="pi pi-times"
                    @click="isVisible = false"
                    severity="secondary"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { fetchWeatherAtTime } from '@/services/weatherService'
import { fetchElevation } from '@/services/elevationService'
import { fetchAllCountries } from '@/services/countriesService'
import { getMagnitudeLevel, generateGoogleMapsEmbedUrl } from '@/utils/helpers'

// Material Design Icons
import CrosshairsGps from 'vue-material-design-icons/CrosshairsGps.vue'
import CalendarClock from 'vue-material-design-icons/CalendarClock.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import ChartLineVariant from 'vue-material-design-icons/ChartLineVariant.vue'
import ArrowCollapseDown from 'vue-material-design-icons/ArrowCollapseDown.vue'
import StarOutline from 'vue-material-design-icons/StarOutline.vue'
import WavesArrowUp from 'vue-material-design-icons/WavesArrowUp.vue'
import MapMarkerRadius from 'vue-material-design-icons/MapMarkerRadius.vue'
import AxisZArrow from 'vue-material-design-icons/AxisZArrow.vue'
import AxisXArrow from 'vue-material-design-icons/AxisXArrow.vue'
import FlagVariant from 'vue-material-design-icons/FlagVariant.vue'
import ImageFilterHdr from 'vue-material-design-icons/ImageFilterHdr.vue'
import Thermometer from 'vue-material-design-icons/Thermometer.vue'
import WaterPercent from 'vue-material-design-icons/WaterPercent.vue'
import Gauge from 'vue-material-design-icons/Gauge.vue'
import WeatherWindy from 'vue-material-design-icons/WeatherWindy.vue'
import CloudOutline from 'vue-material-design-icons/CloudOutline.vue'
import WeatherRainy from 'vue-material-design-icons/WeatherRainy.vue'
import DatabaseOutline from 'vue-material-design-icons/DatabaseOutline.vue'
import DatabaseCog from 'vue-material-design-icons/DatabaseCog.vue'
import ChartBar from 'vue-material-design-icons/ChartBar.vue'
import AlertCircle from 'vue-material-design-icons/AlertCircle.vue'
import MapOutline from 'vue-material-design-icons/MapOutline.vue'

// Weather Icons
import WeatherSunny from 'vue-material-design-icons/WeatherSunny.vue'
import WeatherPartlyCloudy from 'vue-material-design-icons/WeatherPartlyCloudy.vue'
import WeatherCloudy from 'vue-material-design-icons/WeatherCloudy.vue'
import WeatherFog from 'vue-material-design-icons/WeatherFog.vue'
import WeatherPouring from 'vue-material-design-icons/WeatherPouring.vue'
import WeatherSnowyRainy from 'vue-material-design-icons/WeatherSnowyRainy.vue'
import WeatherSnowy from 'vue-material-design-icons/WeatherSnowy.vue'
import WeatherSnowyHeavy from 'vue-material-design-icons/WeatherSnowyHeavy.vue'
import WeatherLightning from 'vue-material-design-icons/WeatherLightning.vue'
import WeatherLightningRainy from 'vue-material-design-icons/WeatherLightningRainy.vue'
import CloudClockOutline from 'vue-material-design-icons/CloudClockOutline.vue'

const store = useAppStore()

// State
const isLoadingData = ref(false)
const weather = ref(null)
const elevation = ref(null)
const countryInfo = ref(null)

const isVisible = computed({
    get: () => !!store.selectedEarthquake,
    set: (value) => {
        if (!value) store.selectEarthquake(null)
    },
})

const earthquake = computed(() => store.selectedEarthquake)

// Magnitude Helpers
const magnitudeColor = computed(() => {
    if (!earthquake.value) return '#10b981'
    return getMagnitudeLevel(earthquake.value.magnitude).color
})

const magnitudeSeverity = computed(() => {
    const mag = earthquake.value?.magnitude || 0
    if (mag >= 7.0) return 'danger'
    if (mag >= 6.0) return 'warning'
    if (mag >= 5.0) return 'info'
    return 'success'
})

const magnitudeLabel = computed(() => {
    const mag = earthquake.value?.magnitude || 0
    if (mag >= 8.0) return 'Great'
    if (mag >= 7.0) return 'Major'
    if (mag >= 6.0) return 'Strong'
    if (mag >= 5.0) return 'Moderate'
    return 'Light'
})

// Depth Helpers
const depthCategory = computed(() => {
    const depth = earthquake.value?.depth || 0
    if (depth < 70) return 'Shallow (<70km)'
    if (depth < 300) return 'Intermediate (70-300km)'
    return 'Deep (>300km)'
})

// Elevation Helpers
const elevationSeverity = computed(() => {
    if (!elevation.value) return 'info'
    const val = elevation.value.value
    if (val < 0) return 'info' // Below sea level
    if (val > 2000) return 'warning' // High altitude
    return 'success'
})

// Weather Icon Component
const weatherIconComponents = {
    WeatherSunny,
    WeatherPartlyCloudy,
    WeatherCloudy,
    WeatherFog,
    WeatherRainy,
    WeatherPouring,
    WeatherSnowyRainy,
    WeatherSnowy,
    WeatherSnowyHeavy,
    WeatherLightning,
    WeatherLightningRainy,
}

const weatherIconComponent = computed(() => {
    const iconName = weather.value?.weatherCode?.icon
    return weatherIconComponents[iconName] || CloudClockOutline
})

// Google Maps URL
const googleMapsEmbedUrl = computed(() => {
    if (!earthquake.value) return ''
    return generateGoogleMapsEmbedUrl(earthquake.value.latitude, earthquake.value.longitude, 8)
})

/**
 * Extract country name from USGS place string
 * Examples:
 * - "38 km WSW of Cantwell, Alaska" -> "Alaska"
 * - "M 2.2 - 38 km WSW of Cantwell, Alaska" -> "Alaska"
 * - "South of the Kermadec Islands" -> "Kermadec Islands"
 */
function extractCountryFromPlace(place) {
    if (!place || typeof place !== 'string') return null
    const parts = place.split(',')
    if (parts.length > 1) {
        return parts[parts.length - 1].trim()
    }

    const keywords = [' of ', ' near ', ' in ']
    for (const keyword of keywords) {
        const index = place.toLowerCase().lastIndexOf(keyword)
        if (index !== -1) {
            return place.substring(index + keyword.length).trim()
        }
    }

    return place.trim()
}

/**
 * Find country by searching in the normalized countries data
 * { name: string, officialName: string, region: string, ... }
 */
function findCountryInData(countryName, countriesData) {
    if (!countryName || !countriesData || countriesData.length === 0) return null

    const searchName = countryName.toLowerCase().trim()

    return countriesData.find((c) => {
        if (!c.name || !c.officialName) return false

        const name = c.name.toLowerCase()
        const officialName = c.officialName.toLowerCase()

        if (name === searchName || officialName === searchName) return true

        if (name.includes(searchName) || searchName.includes(name)) return true
        if (officialName.includes(searchName) || searchName.includes(officialName)) return true

        return false
    })
}

// Load all data for earthquake
async function loadEarthquakeData(eq) {
    if (!eq) return

    isLoadingData.value = true

    // Reset data
    weather.value = null
    elevation.value = null
    countryInfo.value = null

    try {
        // Load all data in parallel
        const [weatherData, elevationData, countriesData] = await Promise.all([
            // Weather
            fetchWeatherAtTime({
                latitude: eq.latitude,
                longitude: eq.longitude,
                date: eq.time,
            }).catch((err) => {
                console.warn('Weather fetch failed:', err)
                return null
            }),

            // Elevation
            fetchElevation({
                latitude: eq.latitude,
                longitude: eq.longitude,
            }).catch((err) => {
                console.warn('Elevation fetch failed:', err)
                return null
            }),

            // Countries
            fetchAllCountries().catch((err) => {
                console.warn('Countries fetch failed:', err)
                return []
            }),
        ])

        // Set weather
        weather.value = weatherData

        // Set elevation
        elevation.value = elevationData

        // Find country from place string
        if (countriesData && countriesData.length > 0) {
            const countryName = extractCountryFromPlace(eq.place)
            console.log('Extracted country name:', countryName)

            if (countryName) {
                const country = findCountryInData(countryName, countriesData)

                if (country) {
                    console.log('Found country:', country.name)
                    countryInfo.value = {
                        name: country.name,
                        capital: country.capital || null,
                        population: country.population,
                        flag: country.flagSvg || country.flagPng || country.flag,
                    }
                } else {
                    console.log('Country not found in data for:', countryName)
                }
            }
        }
    } catch (error) {
        console.error('Error loading earthquake data:', error)
    } finally {
        isLoadingData.value = false
    }
}

// Watch for earthquake changes
watch(
    earthquake,
    async (newEarthquake) => {
        if (newEarthquake) {
            await loadEarthquakeData(newEarthquake)
        }
    },
    { immediate: true },
)

// Formatters
const formatDateTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    })
}

const formatPopulation = (pop) => {
    if (!pop) return 'N/A'
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`
    return pop.toString()
}

// Actions
const openUSGS = () => {
    if (earthquake.value?.url) {
        window.open(earthquake.value.url, '_blank')
    }
}

const openGoogleMaps = () => {
    if (earthquake.value) {
        const { latitude, longitude } = earthquake.value
        window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')
    }
}

const share = () => {
    if (!earthquake.value) return

    const text = `Earthquake M${earthquake.value.magnitude} - ${earthquake.value.place}`

    if (navigator.share) {
        navigator
            .share({
                title: 'QuakeX Earthquake',
                text: text,
                url: earthquake.value.url,
            })
            .catch((err) => console.log('Share failed:', err))
    } else {
        // Fallback: copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(`${text}\n${earthquake.value.url}`)
                .then(() => console.log('Copied to clipboard'))
                .catch((err) => console.log('Copy failed:', err))
        }
    }
}
</script>

<style scoped>
/* Dialog Header */
.dialog-header {
    width: 100%;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.magnitude-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.magnitude-value {
    font-size: 1.25rem;
}

.header-info {
    flex: 1;
}

.earthquake-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 0.25rem 0;
}

.earthquake-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Loading State */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
}

.loading-text {
    margin-top: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
}

.loading-subtext {
    margin-top: 0.5rem;
    color: var(--text-color-secondary);
}

/* Main Content */
.detail-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Section Headers */
.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--primary-color);
    font-size: 1rem;
    font-weight: 600;
}

/* Info Card */
.info-card {
    border: 1px solid var(--surface-border);
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.info-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.info-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-color);
}

.info-value.magnitude-value {
    color: #00bfff;
}

.depth-category {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

/* Grid Layout */
.grid-2-cols {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
}

/* Location Card */
.location-card {
    border: 1px solid var(--surface-border);
}

.location-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.coord-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
}

.coord-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
    font-weight: 600;
}

.coord-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
}

.country-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.country-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.country-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
}

.country-flag {
    width: 48px;
    height: 32px;
    object-fit: cover;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.country-name {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-color);
}

.country-details {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

.elevation-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.elevation-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
}

.elevation-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
}

.elevation-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Weather Card */
.weather-card {
    border: 1px solid var(--surface-border);
}

.weather-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.weather-main {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #b0e0e6 0%, #f0f9ff 100%);
    border-radius: 12px;
}

.weather-description {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color);
}

.weather-time {
    color: var(--text-color-secondary);
}

.weather-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1rem;
}

.weather-metric {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
}

.metric-label {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    font-weight: 600;
    text-transform: uppercase;
}

.metric-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-color);
}

/* Map Card */
.map-card {
    border: 1px solid var(--surface-border);
}

.map-container {
    margin-bottom: 1rem;
}

.map-actions {
    display: flex;
    justify-content: center;
}

/* Dialog Footer */
.dialog-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.footer-actions-left {
    display: flex;
    gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
    .grid-2-cols {
        grid-template-columns: 1fr;
    }

    .info-grid,
    .weather-metrics,
    .regional-grid {
        grid-template-columns: 1fr;
    }

    .magnitude-badge {
        padding: 0.5rem 0.75rem;
    }

    .magnitude-value {
        font-size: 1rem;
    }

    .earthquake-title {
        font-size: 1rem;
    }

    .info-value {
        font-size: 1.5rem;
    }
}
</style>
