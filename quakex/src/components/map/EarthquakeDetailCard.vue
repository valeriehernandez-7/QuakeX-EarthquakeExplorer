<template>
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
                        <span class="magnitude-value">M{{ earthquake?.magnitude.toFixed(1) }}</span>
                    </div>
                    <div class="header-info">
                        <h3 class="earthquake-title">{{ earthquake?.place }}</h3>
                        <div class="earthquake-meta">
                            <CalendarClock :size="16" fillColor="#64748b" />
                            <span>{{ formatDate(earthquake?.time) }}</span>
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

                        <!-- Tsunami -->
                        <div class="info-item">
                            <div class="info-label">
                                <WavesArrowUp :size="18" fillColor="#06b6d4" />
                                <span>Tsunami Alert</span>
                            </div>
                            <div class="info-value">
                                <Tag
                                    :severity="earthquake.tsunami ? 'danger' : 'success'"
                                    :value="earthquake.tsunami ? 'YES' : 'NO'"
                                    :icon="
                                        earthquake.tsunami
                                            ? 'pi pi-exclamation-triangle'
                                            : 'pi pi-check'
                                    "
                                />
                            </div>
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

                            <Divider />

                            <!-- Country Info -->
                            <div v-if="countryInfo" class="country-section">
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
                                            {{ countryInfo.capital }} • Population:
                                            {{ formatPopulation(countryInfo.population) }}
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <!-- Elevation -->
                            <div v-if="elevation" class="elevation-section">
                                <Divider />
                                <div class="elevation-info">
                                    <ImageFilterHdr :size="20" fillColor="#10b981" />
                                    <div>
                                        <div class="elevation-label">Surface Elevation</div>
                                        <div class="elevation-value">
                                            {{ elevation.value }} m
                                            <Tag
                                                :severity="elevationSeverity"
                                                :value="elevation.description"
                                                size="small"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <!-- Weather Conditions Card -->
                <Card v-if="weather" class="weather-card">
                    <template #title>
                        <div class="section-header">
                            <component :is="weatherIconComponent" :size="24" fillColor="#3b82f6" />
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
                                            {{ weather.temperature.value }}°C
                                        </div>
                                    </div>
                                </div>

                                <!-- Humidity -->
                                <div class="weather-metric">
                                    <WaterPercent :size="20" fillColor="#06b6d4" />
                                    <div>
                                        <div class="metric-label">Humidity</div>
                                        <div class="metric-value">
                                            {{ weather.humidity.value }}%
                                        </div>
                                    </div>
                                </div>

                                <!-- Pressure -->
                                <div class="weather-metric">
                                    <Gauge :size="20" fillColor="#8b5cf6" />
                                    <div>
                                        <div class="metric-label">Pressure</div>
                                        <div class="metric-value">
                                            {{ weather.pressure.msl.value }} hPa
                                        </div>
                                    </div>
                                </div>

                                <!-- Wind -->
                                <div class="weather-metric">
                                    <WeatherWindy :size="20" fillColor="#64748b" />
                                    <div>
                                        <div class="metric-label">Wind Speed</div>
                                        <div class="metric-value">
                                            {{ weather.wind.speed.value }} km/h
                                        </div>
                                    </div>
                                </div>

                                <!-- Cloud Cover -->
                                <div class="weather-metric">
                                    <CloudOutline :size="20" fillColor="#94a3b8" />
                                    <div>
                                        <div class="metric-label">Cloud Cover</div>
                                        <div class="metric-value">
                                            {{ weather.cloudCover.value }}%
                                        </div>
                                    </div>
                                </div>

                                <!-- Precipitation -->
                                <div class="weather-metric">
                                    <WeatherRainy :size="20" fillColor="#3b82f6" />
                                    <div>
                                        <div class="metric-label">Precipitation</div>
                                        <div class="metric-value">
                                            {{ weather.precipitation.value }} mm
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Regional Context (Powered by Apache Drill) -->
            <Card v-if="regionalContext" class="regional-card">
                <template #title>
                    <div class="section-header">
                        <DatabaseOutline :size="24" fillColor="#10b981" />
                        <span>Regional Seismic Context</span>
                        <Badge value="Apache Drill" severity="success" />
                    </div>
                </template>
                <template #content>
                    <div class="regional-grid">
                        <!-- Nearby Earthquakes -->
                        <div class="regional-stat">
                            <div class="stat-icon-container" style="background: #dbeafe">
                                <CrosshairsGps :size="28" fillColor="#3b82f6" />
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ regionalContext.nearbyCount }}</div>
                                <div class="stat-label">Nearby Earthquakes</div>
                                <small class="stat-description">Within 100km radius</small>
                            </div>
                        </div>

                        <!-- Regional Average Magnitude -->
                        <div class="regional-stat">
                            <div class="stat-icon-container" style="background: #fef3c7">
                                <ChartBar :size="28" fillColor="#f59e0b" />
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">M{{ regionalContext.avgMagnitude }}</div>
                                <div class="stat-label">Regional Avg Magnitude</div>
                                <small class="stat-description">Last 30 days</small>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="regional-stat">
                            <div class="stat-icon-container" style="background: #dcfce7">
                                <TrendingUp :size="28" fillColor="#10b981" />
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ regionalContext.recentActivity }}</div>
                                <div class="stat-label">Recent Events</div>
                                <small class="stat-description">Last 7 days</small>
                            </div>
                        </div>

                        <!-- Depth Comparison -->
                        <div class="regional-stat">
                            <div class="stat-icon-container" style="background: #f3e8ff">
                                <ArrowCollapseDown :size="28" fillColor="#8b5cf6" />
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">{{ regionalContext.avgDepth }}km</div>
                                <div class="stat-label">Avg Depth (Regional)</div>
                                <small class="stat-description">
                                    {{ depthComparison }}
                                </small>
                            </div>
                        </div>
                    </div>

                    <div class="drill-badge-container">
                        <small class="drill-badge">
                            <DatabaseCog :size="14" fillColor="#10b981" />
                            Data queried via Apache Drill SQL Engine
                        </small>
                    </div>
                </template>
            </Card>

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
                            :src="googleMapsUrl"
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
// import { getEarthquakesByRegion } from '@/services/drillService'
import { getMagnitudeLevel } from '@/utils/helpers'

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
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'
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
const regionalContext = ref(null)

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

const depthComparison = computed(() => {
    if (!regionalContext.value || !earthquake.value) return ''
    const diff = earthquake.value.depth - regionalContext.value.avgDepth
    if (Math.abs(diff) < 5) return 'Similar to regional average'
    return diff > 0
        ? `${Math.round(diff)}km deeper than average`
        : `${Math.round(Math.abs(diff))}km shallower`
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
const googleMapsUrl = computed(() => {
    if (!earthquake.value) return ''
    const { latitude, longitude } = earthquake.value
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${latitude},${longitude}&zoom=8`
})

// Extract country from place string
function extractCountryFromPlace(place) {
    if (!place) return null
    const parts = place.split(',')
    if (parts.length > 1) {
        return parts[parts.length - 1].trim()
    }
    return null
}

// Load all data for earthquake
async function loadEarthquakeData(eq) {
    if (!eq) return

    isLoadingData.value = true

    // Reset data
    weather.value = null
    elevation.value = null
    countryInfo.value = null
    regionalContext.value = null

    try {
        // Load all data in parallel
        const [weatherData, elevationData, countriesData, regionalData] = await Promise.all([
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

            // // Regional context from Drill
            // getEarthquakesByRegion({
            //     centerLat: eq.latitude,
            //     centerLon: eq.longitude,
            //     radiusKm: 100,
            //     timePeriod: 'LAST_MONTH',
            // }).catch((err) => {
            //     console.warn('Drill regional query failed:', err)
            //     return null
            // }),
        ])

        // Set weather
        weather.value = weatherData

        // Set elevation
        elevation.value = elevationData

        // Find country from place string
        if (countriesData && countriesData.length > 0) {
            const countryName = extractCountryFromPlace(eq.place)
            if (countryName) {
                const country = countriesData.find(
                    (c) =>
                        c.name.common.toLowerCase().includes(countryName.toLowerCase()) ||
                        c.name.official.toLowerCase().includes(countryName.toLowerCase()),
                )

                if (country) {
                    countryInfo.value = {
                        name: country.name.common,
                        capital: country.capital?.[0] || 'N/A',
                        population: country.population,
                        flag: country.flags.svg || country.flags.png,
                    }
                }
            }
        }

        // Calculate regional context from Drill data
        if (regionalData && regionalData.length > 0) {
            const recentDate = new Date()
            recentDate.setDate(recentDate.getDate() - 7)

            const recentEvents = regionalData.filter((e) => new Date(e.time) > recentDate)

            regionalContext.value = {
                nearbyCount: regionalData.length,
                avgMagnitude: (
                    regionalData.reduce((sum, e) => sum + e.magnitude, 0) / regionalData.length
                ).toFixed(2),
                avgDepth: Math.round(
                    regionalData.reduce((sum, e) => sum + e.depth, 0) / regionalData.length,
                ),
                recentActivity: recentEvents.length,
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
const formatDate = (date) => {
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
    const text = `Earthquake M${earthquake.value.magnitude} - ${earthquake.value.place}`
    if (navigator.share) {
        navigator.share({
            title: 'QuakeX Earthquake',
            text: text,
            url: earthquake.value.url,
        })
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${text}\n${earthquake.value.url}`)
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
    color: #ef4444;
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
    font-size: 0.75rem;
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
    background: linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%);
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

/* Regional Context Card */
.regional-card {
    border: 1px solid var(--surface-border);
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.regional-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1rem;
}

.regional-stat {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--surface-border);
}

.stat-icon-container {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.stat-content {
    flex: 1;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
}

.stat-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
    margin-top: 0.25rem;
}

.stat-description {
    font-size: 0.75rem;
    color: var(--text-color-secondary);
}

.drill-badge-container {
    display: flex;
    justify-content: center;
    padding-top: 0.5rem;
    border-top: 1px solid var(--surface-border);
}

.drill-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--surface-card);
    border-radius: 20px;
    color: #10b981;
    font-weight: 600;
    border: 1px solid #10b981;
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
