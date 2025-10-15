<template>
    <div class="earthquake-map">
        <div ref="mapContainer" class="map-element"></div>

        <!-- Loading Overlay -->
        <Skeleton v-if="store.loading" height="100vh" />

        <!-- Map Controls -->
        <div class="map-controls">
            <Button
                icon="pi pi-crosshairs"
                rounded
                text
                severity="secondary"
                @click="resetView"
                class="control-btn"
            />
            <Button
                icon="pi pi-plus"
                rounded
                text
                severity="secondary"
                @click="zoomIn"
                class="control-btn"
            />
            <Button
                icon="pi pi-minus"
                rounded
                text
                severity="secondary"
                @click="zoomOut"
                class="control-btn"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { MAP_CONFIG } from '@/utils/constants'
import { getMagnitudeLevel, calculateMarkerSize, calculateMarkerOpacity } from '@/utils/helpers'

// Leaflet imports
import L from 'leaflet'
import 'leaflet.markercluster'

const store = useAppStore()
const mapContainer = ref(null)

// Leaflet instances
let map = null
let markerCluster = null
let tileLayer = null

const markerMap = new Map() // earthquakeId -> marker

const updateMarkers = () => {
    const currentIds = new Set(store.filteredEarthquakes.map((eq) => eq.id))

    markerMap.forEach((marker, id) => {
        if (!currentIds.has(id)) {
            markerCluster.removeLayer(marker)
            markerMap.delete(id)
        }
    })

    store.filteredEarthquakes.forEach((earthquake) => {
        if (!markerMap.has(earthquake.id)) {
            const marker = createEarthquakeMarker(earthquake)
            markerCluster.addLayer(marker)
            markerMap.set(earthquake.id, marker)
        }
    })
}

const createEarthquakeMarker = (earthquake) => {
    const { latitude, longitude, magnitude, depth, place } = earthquake
    const magnitudeLevel = getMagnitudeLevel(magnitude)
    const markerSize = calculateMarkerSize(magnitude)
    const opacity = calculateMarkerOpacity(depth)
    const isRecent = Date.now() - new Date(earthquake.time) < 3600000

    // Create custom marker icon
    const icon = L.divIcon({
        className: 'earthquake-marker',
        html: `
            <div class="${isRecent ? 'pulse-animation' : ''}" style="
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
                <p><strong>Time:</strong> ${new Date(earthquake.time).toLocaleString()}</p>
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

// Initialize map
onMounted(() => {
    if (!mapContainer.value) return

    // Create map instance
    map = L.map(mapContainer.value).setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom)

    // Set map bounds
    map.setMinZoom(MAP_CONFIG.minZoom)
    map.setMaxZoom(MAP_CONFIG.maxZoom)

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

// Watch for earthquake data changes - AHORA updateMarkers está definida
watch(() => store.filteredEarthquakes, updateMarkers)
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
}

.map-controls {
    position: absolute;
    top: 1rem;
    right: 1rem;
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

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.7;
    }
}

.pulse-animation {
    animation: pulse 2s infinite;
}
</style>
