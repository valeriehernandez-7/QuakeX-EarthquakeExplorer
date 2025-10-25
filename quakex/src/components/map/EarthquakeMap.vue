<template>
    <div class="earthquake-map">
        <div ref="mapContainer" class="map-element"></div>

        <!-- Loading Overlay -->
        <div v-if="store.loading" class="loading-overlay">
            <ProgressSpinner />
            <p class="loading-text">QuakeX</p>
            <small class="loading-subtext">Preparing Global Earthquakes Explorer</small>
        </div>

        <!-- Map Controls -->
        <div class="map-controls">
            <Button
                icon="pi pi-sync"
                rounded
                text
                severity="secondary"
                @click="refreshData"
                class="control-btn"
                v-tooltip.left="'Refresh'"
            />
            <Button
                icon="pi pi-filter"
                rounded
                text
                severity="secondary"
                @click="$emit('toggleFilters')"
                class="control-btn"
                v-tooltip.left="'Filters'"
            />
            <Button
                icon="pi pi-globe"
                rounded
                text
                severity="secondary"
                @click="resetView"
                class="control-btn"
                v-tooltip.left="'Global View'"
            />
            <Button
                icon="pi pi-plus"
                rounded
                text
                severity="secondary"
                @click="zoomIn"
                class="control-btn"
                v-tooltip.left="'Zoom In'"
            />
            <Button
                icon="pi pi-minus"
                rounded
                text
                severity="secondary"
                @click="zoomOut"
                class="control-btn"
                v-tooltip.left="'Zoom Out'"
            />
        </div>

        <!-- Results Counter -->
        <div v-if="!store.loading" class="results-counter">
            <div class="counter-content">
                <i class="pi pi-map-marker"></i>
                <span class="count">{{ store.filteredEarthquakes.length }}</span>
                <span class="label">{{
                    store.filteredEarthquakes.length === 1 ? 'Earthquake' : 'Earthquakes'
                }}</span>
                <Tag
                    v-if="store.filteredEarthquakes.length !== store.earthquakes.length"
                    icon="pi pi-filter"
                    severity="info"
                    class="ml-2"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useRoute } from 'vue-router'
import { MAP_CONFIG } from '@/utils/constants'
import { getMagnitudeLevel, calculateMarkerSize, calculateMarkerOpacity } from '@/utils/helpers'

// Leaflet imports
import L from 'leaflet'
import 'leaflet.markercluster'

const store = useAppStore()
const route = useRoute()
const mapContainer = ref(null)

// Leaflet instances
let map = null
let markerCluster = null
let tileLayer = null

defineEmits(['toggleFilters'])

const refreshData = async () => {
    await store.fetchEarthquakes({
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        minMagnitude: 2.5,
    })
}

// Marker management
const updateMarkers = () => {
    if (!markerCluster) return // Solo verificar que existe el cluster

    // Limpiar markers existentes (SIEMPRE, incluso si no hay resultados)
    markerCluster.clearLayers()

    // Agregar nuevos markers (si hay)
    store.filteredEarthquakes.forEach((earthquake) => {
        const marker = createEarthquakeMarker(earthquake)
        markerCluster.addLayer(marker)
    })

    console.log(`Map updated: ${store.filteredEarthquakes.length} markers displayed`)
}

const createEarthquakeMarker = (earthquake) => {
    const { latitude, longitude, magnitude, depth, place } = earthquake
    const magnitudeLevel = getMagnitudeLevel(magnitude)
    const markerSize = calculateMarkerSize(magnitude)
    const opacity = calculateMarkerOpacity(depth)

    // Create custom marker icon
    const icon = L.divIcon({
        className: 'earthquake-marker',
        html: `
            <div style="
                width: ${markerSize}px;
                height: ${markerSize}px;
                background: ${magnitudeLevel.color};
                border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${Math.max(10, markerSize * 0.3)}px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                opacity: ${opacity};
                cursor: pointer;
            ">
                ${magnitude.toFixed(1)}
            </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
    })

    // Create marker
    const marker = L.marker([latitude, longitude], { icon })

    // Add popup
    const popupContent = `
        <div class="earthquake-popup">
            <div class="popup-header">
                <strong>M${magnitude.toFixed(1)} Earthquake</strong>
                <div style="width: 12px; height: 12px; background: ${magnitudeLevel.color}; border-radius: 50%; margin-left: 8px;"></div>
            </div>
            <div class="popup-body">
                <p><strong>Location:</strong> ${place}</p>
                <p><strong>Depth:</strong> ${depth} km</p>
                <p><strong>Time:</strong> ${formatDateTime(earthquake.time)}</p>
            </div>
            <div class="popup-footer">
                <button onclick="this.dispatchEvent(new CustomEvent('viewDetails', { bubbles: true }))" 
                        style="background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                    View Details
                </button>
            </div>
        </div>
    `

    marker.bindPopup(popupContent)

    // Add click event for details
    marker.on('popupopen', () => {
        const popupElement = marker.getPopup().getElement()
        if (popupElement) {
            popupElement.addEventListener('viewDetails', () => {
                store.selectEarthquake(earthquake)
            })
        }
    })

    // Add tooltip on hover
    marker.bindTooltip(`M${magnitude} - ${place}`, {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.8,
    })

    return marker
}

// Map control methods
const resetView = () => {
    if (map) {
        map.setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom)
    }
}

const zoomIn = () => {
    if (map) {
        map.zoomIn()
    }
}

const zoomOut = () => {
    if (map) {
        map.zoomOut()
    }
}

const formatDateTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        timeZoneName: 'short',
    })
}

const southWestGlobal = L.latLng(-90, -180)
const northEastGlobal = L.latLng(90, 180)
const globalBounds = L.latLngBounds(southWestGlobal, northEastGlobal)

// Initialize map
onMounted(() => {
    if (!mapContainer.value) return

    // Create map instance
    map = L.map(mapContainer.value).setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom)

    // Set map bounds
    map.setMinZoom(MAP_CONFIG.minZoom)
    map.setMaxZoom(MAP_CONFIG.maxZoom)

    map.setMaxBounds(globalBounds)

    // Add tile layer
    tileLayer = L.tileLayer(MAP_CONFIG.tileLayer.url, {
        attribution: MAP_CONFIG.tileLayer.attribution,
        maxZoom: MAP_CONFIG.tileLayer.maxZoom,
    }).addTo(map)

    // Initialize marker cluster
    markerCluster = L.markerClusterGroup({
        maxClusterRadius: MAP_CONFIG.clusterRadius,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
    })

    map.addLayer(markerCluster)

    map.removeControl(map.zoomControl)

    // Load initial markers
    updateMarkers()
})

// Cleanup
onUnmounted(() => {
    if (map) {
        map.remove()
        map = null
    }
})

watch(
    () => store.filteredEarthquakes,
    (newEarthquakes, oldEarthquakes) => {
        console.log('Filter applied - Updating map:', {
            previous: oldEarthquakes?.length || 0,
            current: newEarthquakes.length,
            total: store.earthquakes.length,
            isFiltered: newEarthquakes.length !== store.earthquakes.length,
        })

        updateMarkers()
    },
    { deep: true },
)
</script>

<style scoped>
.earthquake-map {
    position: relative;
    width: 100%;
    height: 100%;
}

.map-element {
    width: 100%;
    height: 100%;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    min-height: 60vh;
}

.loading-text {
    margin-top: 1rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
}

.loading-subtext {
    margin-top: 0.5rem;
    color: var(--text-color-secondary);
}

.map-controls {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 500;
}

.control-btn {
    background: white !important;
    border: 1px solid #ddd !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.control-btn:hover {
    background: #f3f4f6 !important;
    border-color: #3b82f6 !important;
}

/* Results Counter */
.results-counter {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 500;
}

.counter-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.75rem 0.75rem;
    border-radius: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 2px solid #3b82f6;
}

.counter-content i {
    color: #3b82f6;
    font-size: 1.25rem;
}

.counter-content .count {
    font-size: 1.5rem;
    font-weight: bold;
    color: #1f2937;
}

.counter-content .label {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Popup styles */
:deep(.earthquake-popup) {
    min-width: 200px;
}

:deep(.earthquake-popup .popup-header) {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 1.1em;
}

:deep(.earthquake-popup .popup-body) {
    margin-bottom: 0.5rem;
}

:deep(.earthquake-popup .popup-body p) {
    margin: 0.25rem 0;
    font-size: 0.9em;
}

:deep(.earthquake-popup .popup-footer) {
    text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
    .map-controls {
        bottom: 6rem;
        top: auto;
        right: 1rem;
        flex-direction: row;
    }

    .results-counter {
        bottom: 1rem;
    }

    .counter-content {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
    }
}
</style>
