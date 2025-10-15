<template>
    <Dialog
        v-model:visible="isVisible"
        :modal="true"
        :closable="true"
        :style="{ width: '600px' }"
        class="earthquake-detail-dialog"
    >
        <template #header>
            <div class="dialog-header">
                <div class="flex items-center gap-2">
                    <div class="magnitude-badge" :style="{ background: magnitudeColor }">
                        M{{ earthquake.magnitude.toFixed(1) }}
                    </div>
                    <div>
                        <h3>{{ earthquake.place }}</h3>
                        <span class="text-sm text-gray-600">
                            {{ formatDate(earthquake.time) }}
                        </span>
                    </div>
                </div>
            </div>
        </template>

        <!-- Main Content -->
        <div v-if="earthquake" class="detail-content">
            <!-- Core Information -->
            <div class="info-grid grid grid-cols-2 gap-4 mb-4">
                <div class="info-item">
                    <label>Magnitude</label>
                    <p class="value">{{ earthquake.magnitude }}</p>
                </div>
                <div class="info-item">
                    <label>Depth</label>
                    <p class="value">{{ earthquake.depth }} km</p>
                </div>
                <div class="info-item">
                    <label>Significance</label>
                    <p class="value">{{ earthquake.significance }}</p>
                </div>
                <div class="info-item">
                    <label>Tsunami Alert</label>
                    <p class="value">
                        <Tag
                            :severity="earthquake.tsunami ? 'danger' : 'success'"
                            :value="earthquake.tsunami ? 'YES' : 'NO'"
                        />
                    </p>
                </div>
            </div>

            <!-- Location Details -->
            <div class="location-section mb-4">
                <h4 class="section-title">Location</h4>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Latitude:</strong> {{ earthquake.latitude }}°</div>
                    <div><strong>Longitude:</strong> {{ earthquake.longitude }}°</div>
                </div>

                <!-- Nearby Country -->
                <div v-if="nearbyCountry" class="mt-2">
                    <strong>Nearest Country:</strong>
                    <span class="ml-2">
                        <img :src="nearbyCountry.flag" class="inline-block w-6 h-4 mr-1" />
                        {{ nearbyCountry.name }}
                        ({{ nearbyCountry.distance }}km away)
                    </span>
                </div>

                <!-- Elevation -->
                <div v-if="elevation" class="mt-2">
                    <strong>Elevation:</strong>
                    {{ elevation.value }}m {{ elevation.description }}
                </div>
            </div>

            <!-- Weather Conditions (if available) -->
            <div v-if="weather" class="weather-section mb-4">
                <h4 class="section-title">Weather Conditions at Time</h4>
                <div class="weather-card p-3 bg-blue-50 rounded">
                    <div class="flex items-center gap-3">
                        <i :class="weather.weatherCode.icon" class="text-3xl"></i>
                        <div>
                            <p class="font-semibold">{{ weather.weatherCode.description }}</p>
                            <p class="text-sm">{{ weather.temperature.value }}°C</p>
                            <p class="text-sm">Pressure: {{ weather.pressure.msl.value }} hPa</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Small Map Preview -->
            <div class="map-preview mb-4" style="height: 200px">
                <!-- Mini Leaflet map -->
            </div>
        </div>

        <template #footer>
            <div class="flex justify-between">
                <div class="flex gap-2">
                    <Button
                        icon="pi pi-external-link"
                        label="View on USGS"
                        text
                        @click="openUSGS"
                    />
                    <Button icon="pi pi-share-alt" label="Share" text @click="share" />
                </div>
                <Button label="Close" @click="isVisible = false" />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { fetchWeatherAtTime } from '@/services/weatherService'
import { fetchElevation } from '@/services/elevationService'
import { findCountryByCoordinates } from '@/services/countriesService'
import { getMagnitudeLevel } from '@/utils/helpers'

const store = useAppStore()
const isVisible = computed({
    get: () => !!store.selectedEarthquake,
    set: (value) => {
        if (!value) store.selectEarthquake(null)
    },
})

const earthquake = computed(() => store.selectedEarthquake)
const weather = ref(null)
const elevation = ref(null)
const nearbyCountry = ref(null)

const magnitudeColor = computed(() => {
    if (!earthquake.value) return '#10b981'
    return getMagnitudeLevel(earthquake.value.magnitude).color
})

// Load additional data when earthquake is selected
watch(earthquake, async (newEarthquake) => {
    if (!newEarthquake) return

    // Reset
    weather.value = null
    elevation.value = null
    nearbyCountry.value = null

    // Load weather
    try {
        weather.value = await fetchWeatherAtTime({
            latitude: newEarthquake.latitude,
            longitude: newEarthquake.longitude,
            date: newEarthquake.time,
        })
    } catch (error) {
        console.error('Failed to load weather:', error)
    }

    // Load elevation
    try {
        const elevData = await fetchElevation({
            latitude: newEarthquake.latitude,
            longitude: newEarthquake.longitude,
        })
        elevation.value = elevData
    } catch (error) {
        console.error('Failed to load elevation:', error)
    }

    // Load nearby country
    try {
        nearbyCountry.value = await findCountryByCoordinates(
            newEarthquake.latitude,
            newEarthquake.longitude,
        )
    } catch (error) {
        console.error('Failed to load country:', error)
    }
})

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    })
}

const openUSGS = () => {
    if (earthquake.value?.url) {
        window.open(earthquake.value.url, '_blank')
    }
}

const share = () => {
    // Implementar lógica de compartir
    const text = `Earthquake M${earthquake.value.magnitude} - ${earthquake.value.place}`
    if (navigator.share) {
        navigator.share({
            title: 'QuakeX Earthquake',
            text: text,
            url: earthquake.value.url,
        })
    }
}
</script>
