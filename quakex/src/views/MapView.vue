<template>
    <div class="map-view">
        <!-- App Navigation Bar -->
        <AppNavbar />

        <!-- Main Content Area -->
        <div class="main-content">
            <!-- Filter Sidebar -->
            <FilterSidebar v-model:visible="showFilters" />

            <!-- Map Container -->
            <div class="map-container">
                <EarthquakeMap @toggle-filters="showFilters = !showFilters" />
            </div>
        </div>

        <!-- Earthquake Detail Dialog -->
        <EarthquakeDetailCard />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '@/stores/appStore'

// Components
import AppNavbar from '@/components/layout/AppNavbar.vue'
import FilterSidebar from '@/components/filters/FilterSidebar.vue'
import EarthquakeMap from '@/components/map/EarthquakeMap.vue'
import EarthquakeDetailCard from '@/components/map/EarthquakeDetailCard.vue'

const store = useAppStore()
const showFilters = ref(false)

// Load initial data
onMounted(async () => {
    if (store.earthquakes.length === 0) {
        await store.fetchEarthquakes({
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            minMagnitude: 2.5, // All earthquakes for map
        })
    }
})
</script>

<style scoped>
.map-view {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--surface-ground);
}

.main-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
}

.map-container {
    flex: 1;
    position: relative;
    background: var(--surface-section);
}

/* Responsive design */
@media (max-width: 768px) {
    .main-content {
        flex-direction: column;
    }
}
</style>
