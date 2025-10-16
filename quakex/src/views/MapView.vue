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
                <EarthquakeMap @toggleFilters="showFilters = !showFilters" />
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

onMounted(async () => {
    if (store.earthquakes.length === 0) {
        // Cargar datos de HOY por default
        const today = new Date()
        const startOfToday = new Date(today)
        startOfToday.setHours(0, 0, 0, 0)
        const endOfToday = new Date(today)
        endOfToday.setHours(23, 59, 59, 999)

        await store.fetchEarthquakes({
            startTime: startOfToday,
            endTime: endOfToday,
            minMagnitude: 2.5,
        })

        console.log('Initial load: TODAY earthquakes')
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
