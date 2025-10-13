<script setup>
import { ref, computed } from 'vue'
import { fetchWeatherAtTime } from '@/services/weatherService'

// Weather condition icons (for main weather display)
import WeatherSunny from 'vue-material-design-icons/WeatherSunny.vue'
import WeatherPartlyCloudy from 'vue-material-design-icons/WeatherPartlyCloudy.vue'
import WeatherCloudy from 'vue-material-design-icons/WeatherCloudy.vue'
import WeatherFog from 'vue-material-design-icons/WeatherFog.vue'
import WeatherRainy from 'vue-material-design-icons/WeatherRainy.vue'
import WeatherPouring from 'vue-material-design-icons/WeatherPouring.vue'
import WeatherSnowyRainy from 'vue-material-design-icons/WeatherSnowyRainy.vue'
import WeatherSnowy from 'vue-material-design-icons/WeatherSnowy.vue'
import WeatherSnowyHeavy from 'vue-material-design-icons/WeatherSnowyHeavy.vue'
import WeatherLightning from 'vue-material-design-icons/WeatherLightning.vue'
import WeatherLightningRainy from 'vue-material-design-icons/WeatherLightningRainy.vue'
import CloudClockOutline from 'vue-material-design-icons/CloudClockOutline.vue'

// UI/Metric icons (for cards and variables)
import Thermometer from 'vue-material-design-icons/Thermometer.vue'
import WaterPercent from 'vue-material-design-icons/WaterPercent.vue'
import WeatherRainyIcon from 'vue-material-design-icons/WeatherRainy.vue'
import CloudOutline from 'vue-material-design-icons/CloudOutline.vue'
import GaugeEmpty from 'vue-material-design-icons/GaugeEmpty.vue'
import Gauge from 'vue-material-design-icons/Gauge.vue'
import WeatherWindy from 'vue-material-design-icons/WeatherWindy.vue'
import Navigation from 'vue-material-design-icons/Navigation.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import CalendarClock from 'vue-material-design-icons/CalendarClock.vue'
import CodeJson from 'vue-material-design-icons/CodeJson.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'

// Test coordinates: San José, Costa Rica
const latitude = ref(9.9333)
const longitude = ref(-84.0833)
const date = ref(new Date())
const loading = ref(false)
const error = ref(null)
const weatherData = ref(null)

// Map weather icon names (from API) to Vue components
const weatherIconComponents = {
    WeatherSunny: WeatherSunny,
    WeatherPartlyCloudy: WeatherPartlyCloudy,
    WeatherCloudy: WeatherCloudy,
    WeatherFog: WeatherFog,
    WeatherRainy: WeatherRainy,
    WeatherPouring: WeatherPouring,
    WeatherSnowyRainy: WeatherSnowyRainy,
    WeatherSnowy: WeatherSnowy,
    WeatherSnowyHeavy: WeatherSnowyHeavy,
    WeatherLightning: WeatherLightning,
    WeatherLightningRainy: WeatherLightningRainy,
}

// Get weather icon component (with fallback)
const weatherIconComponent = computed(() => {
    const iconName = weatherData.value?.weatherCode?.icon
    return weatherIconComponents[iconName] || CloudClockOutline // Fallback
})

async function testWeather() {
    loading.value = true
    error.value = null
    weatherData.value = null

    try {
        console.log('Testing weather service...')
        console.log('Location:', { latitude: latitude.value, longitude: longitude.value })
        console.log('Date:', date.value)

        const result = await fetchWeatherAtTime({
            latitude: latitude.value,
            longitude: longitude.value,
            date: date.value,
            useCache: false,
        })

        if (result) {
            weatherData.value = result
            console.log('Weather data received:', result)
        } else {
            error.value = 'No weather data returned'
            console.log('No weather data returned')
        }
    } catch (err) {
        error.value = err.message || 'Failed to fetch weather data'
        console.error('Error:', err)
    } finally {
        loading.value = false
    }
}

// Auto-load on mount
testWeather()
</script>

<template>
    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem">
            <CloudClockOutline :size="40" fillColor="#3b82f6" />
            <h1 style="margin: 0">Weather Service Test</h1>
        </div>
        <p style="color: #666; margin-bottom: 2rem">
            Testing Open-Meteo Archive API with Material Design Icons
        </p>

        <!-- Test Controls -->
        <Card style="margin-bottom: 2rem">
            <template #title>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <MapMarker :size="24" />
                    <span>Test Parameters</span>
                </div>
            </template>
            <template #content>
                <div
                    style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1rem;
                    "
                >
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                            >Latitude</label
                        >
                        <InputText
                            v-model.number="latitude"
                            type="number"
                            step="0.0001"
                            style="width: 100%"
                        />
                        <small style="color: #666">San José, Costa Rica: 9.9333</small>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                            >Longitude</label
                        >
                        <InputText
                            v-model.number="longitude"
                            type="number"
                            step="0.0001"
                            style="width: 100%"
                        />
                        <small style="color: #666">San José, Costa Rica: -84.0833</small>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600"
                            >Date</label
                        >
                        <DatePicker v-model="date" dateFormat="yy-mm-dd" style="width: 100%" />
                        <small style="color: #666">Historical data only</small>
                    </div>

                    <div style="display: flex; align-items: flex-end">
                        <Button
                            label="Test Weather API"
                            icon="pi pi-refresh"
                            @click="testWeather"
                            :loading="loading"
                            style="width: 100%"
                        />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Loading State -->
        <div v-if="loading" style="text-align: center; padding: 3rem">
            <ProgressSpinner />
            <p style="margin-top: 1rem; color: #666">Fetching weather data from Open-Meteo...</p>
        </div>

        <!-- Error State -->
        <Message v-if="error && !loading" severity="error" :closable="false">
            <div style="display: flex; align-items: center; gap: 1rem">
                <i class="pi pi-exclamation-triangle" style="font-size: 2rem"></i>
                <div>
                    <strong>Error fetching weather data</strong>
                    <p style="margin: 0.5rem 0 0 0">{{ error }}</p>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem">
                        Note: Open-Meteo Archive API has a 5-day delay. Try a date from last week.
                    </p>
                </div>
            </div>
        </Message>

        <!-- Weather Data Display -->
        <div v-if="weatherData && !loading">
            <!-- Main Weather Info -->
            <Card style="margin-bottom: 1rem">
                <template #title>
                    <div style="display: flex; align-items: center; gap: 1rem">
                        <!-- Dynamic weather icon with fallback -->
                        <component :is="weatherIconComponent" :size="56" fillColor="#3b82f6" />
                        <div>
                            <div style="font-size: 1.25rem">
                                {{ weatherData.weatherCode.description }}
                            </div>
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    margin-top: 0.25rem;
                                "
                            >
                                <CalendarClock :size="16" fillColor="#666" />
                                <small style="font-weight: normal; color: #666">
                                    {{ weatherData.timestamp }}
                                    {{ weatherData.timezoneAbbreviation }}
                                </small>
                            </div>
                            <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem">
                                <Badge
                                    :value="`WMO: ${weatherData.weatherCode.code}`"
                                    severity="info"
                                />
                                <Badge :value="weatherData.weatherCode.icon" severity="secondary" />
                            </div>
                        </div>
                    </div>
                </template>
                <template #content>
                    <div
                        style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 1.5rem;
                        "
                    >
                        <!-- Temperature -->
                        <div>
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    margin-bottom: 0.5rem;
                                "
                            >
                                <Thermometer :size="20" fillColor="#f59e0b" />
                                <strong>Temperature</strong>
                            </div>
                            <div style="font-size: 2rem; font-weight: bold; color: #ef4444">
                                {{ weatherData.temperature.value
                                }}{{ weatherData.temperature.unit }}
                            </div>
                        </div>

                        <!-- Precipitation -->
                        <div>
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    margin-bottom: 0.5rem;
                                "
                            >
                                <WeatherRainyIcon :size="20" fillColor="#3b82f6" />
                                <strong>Precipitation</strong>
                            </div>
                            <div style="font-size: 2rem; font-weight: bold; color: #3b82f6">
                                {{ weatherData.precipitation.value }}
                                {{ weatherData.precipitation.unit }}
                            </div>
                        </div>

                        <!-- Humidity -->
                        <div>
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    margin-bottom: 0.5rem;
                                "
                            >
                                <WaterPercent :size="20" fillColor="#06b6d4" />
                                <strong>Humidity</strong>
                            </div>
                            <div style="font-size: 2rem; font-weight: bold; color: #06b6d4">
                                {{ weatherData.humidity.value }}{{ weatherData.humidity.unit }}
                            </div>
                        </div>

                        <!-- Cloud Cover -->
                        <div>
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 0.5rem;
                                    margin-bottom: 0.5rem;
                                "
                            >
                                <CloudOutline :size="20" fillColor="#64748b" />
                                <strong>Cloud Cover</strong>
                            </div>
                            <div style="font-size: 2rem; font-weight: bold; color: #64748b">
                                {{ weatherData.cloudCover.value }}{{ weatherData.cloudCover.unit }}
                            </div>
                            <small style="color: #666">{{
                                weatherData.cloudCover.description
                            }}</small>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Pressure & Wind -->
            <div
                style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                "
            >
                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <Gauge :size="24" fillColor="#8b5cf6" />
                            <span>Atmospheric Pressure</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="display: flex; flex-direction: column; gap: 1rem">
                            <div>
                                <div
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 0.5rem;
                                        margin-bottom: 0.5rem;
                                    "
                                >
                                    <GaugeEmpty :size="18" fillColor="#8b5cf6" />
                                    <strong>Surface Pressure</strong>
                                </div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #8b5cf6">
                                    {{ weatherData.pressure.surface.value }}
                                    {{ weatherData.pressure.surface.unit }}
                                </div>
                            </div>
                            <Divider />
                            <div>
                                <div
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 0.5rem;
                                        margin-bottom: 0.5rem;
                                    "
                                >
                                    <Gauge :size="18" fillColor="#8b5cf6" />
                                    <strong>Mean Sea Level Pressure</strong>
                                </div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #8b5cf6">
                                    {{ weatherData.pressure.msl.value }}
                                    {{ weatherData.pressure.msl.unit }}
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>

                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <WeatherWindy :size="24" fillColor="#10b981" />
                            <span>Wind Conditions</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="display: flex; flex-direction: column; gap: 1rem">
                            <div>
                                <div
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 0.5rem;
                                        margin-bottom: 0.5rem;
                                    "
                                >
                                    <WeatherWindy :size="18" fillColor="#10b981" />
                                    <strong>Wind Speed</strong>
                                </div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #10b981">
                                    {{ weatherData.wind.speed.value }}
                                    {{ weatherData.wind.speed.unit }}
                                </div>
                            </div>
                            <Divider />
                            <div>
                                <div
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 0.5rem;
                                        margin-bottom: 0.5rem;
                                    "
                                >
                                    <Navigation :size="18" fillColor="#10b981" />
                                    <strong>Wind Direction</strong>
                                </div>
                                <div style="font-size: 1.5rem; font-weight: bold; color: #10b981">
                                    {{ weatherData.wind.direction.value }}° ({{
                                        weatherData.wind.direction.cardinal
                                    }})
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Raw JSON Data -->
            <Card>
                <template #title>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                        <CodeJson :size="24" />
                        <span>Raw JSON Response</span>
                    </div>
                </template>
                <template #content>
                    <pre
                        style="
                            background: #f3f4f6;
                            padding: 1rem;
                            border-radius: 0.5rem;
                            overflow-x: auto;
                            font-size: 0.85rem;
                        "
                        >{{ JSON.stringify(weatherData, null, 2) }}</pre
                    >
                </template>
            </Card>
        </div>

        <!-- Helper Info -->
        <Card style="margin-top: 2rem; background: #eff6ff; border: 2px solid #bfdbfe">
            <template #content>
                <div style="display: flex; gap: 1rem">
                    <InformationOutline :size="32" fillColor="#3b82f6" />
                    <div>
                        <strong style="color: #1e40af; font-size: 1.1rem">Important Notes:</strong>
                        <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; color: #1e40af">
                            <li>Open-Meteo Archive API has a <strong>5-day delay</strong></li>
                            <li>
                                For recent data (last 5 days), use the Forecast API with past_days
                                parameter
                            </li>
                            <li>Coordinates: San José, Costa Rica (9.9333, -84.0833)</li>
                            <li>Try dates from last week for best results</li>
                            <li>
                                Using <strong>vue-material-design-icons</strong> for all UI
                                elements! 🎨
                            </li>
                            <li>Fallback icon: <strong>CloudClockOutline</strong></li>
                        </ul>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>
h1 {
    margin: 0;
}

label {
    color: #374151;
}

small {
    display: block;
    margin-top: 0.25rem;
}
</style>
