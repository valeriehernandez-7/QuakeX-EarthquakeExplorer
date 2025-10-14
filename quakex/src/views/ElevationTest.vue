<script setup>
import { ref, onMounted } from 'vue'
import {
    fetchElevation,
    fetchElevationForEarthquakes,
    clearElevationCache,
    exportElevationCache,
    getElevationCacheStats,
} from '@/services/elevationService'

// Test coordinates
const testCoordinates = ref([
    { latitude: 52.52, longitude: 13.41 }, // Berlin
    { latitude: 9.9333, longitude: -84.0833 }, // San José, Costa Rica
    { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
    { latitude: 40.7128, longitude: -74.006 }, // New York
    { latitude: -33.8688, longitude: 151.2093 }, // Sydney
])

const customLat = ref(52.52)
const customLng = ref(13.41)
const loading = ref(false)
const elevationData = ref(null)
const earthquakeElevationData = ref(null)
const cacheStats = ref(null)

onMounted(() => {
    loadCacheStats()
})

async function testSingleElevation() {
    loading.value = true
    elevationData.value = null

    try {
        const result = await fetchElevation({
            latitude: customLat.value,
            longitude: customLng.value,
        })

        elevationData.value = result
        console.log('Single elevation result:', result)
    } catch (error) {
        console.error('Error fetching single elevation:', error)
    } finally {
        loading.value = false
        loadCacheStats()
    }
}

async function testMultipleElevation() {
    loading.value = true
    elevationData.value = null

    try {
        const result = await fetchElevation(testCoordinates.value)

        elevationData.value = result
        console.log('Multiple elevation result:', result)
    } catch (error) {
        console.error('Error fetching multiple elevation:', error)
    } finally {
        loading.value = false
        loadCacheStats()
    }
}

async function testEarthquakeElevation() {
    loading.value = true
    earthquakeElevationData.value = null

    try {
        // Sample earthquake data
        const sampleEarthquakes = [
            {
                id: 'test1',
                magnitude: 5.2,
                latitude: 9.9333,
                longitude: -84.0833,
                depth: 10,
                place: 'Test earthquake near San José',
                time: new Date(),
            },
            {
                id: 'test2',
                magnitude: 6.1,
                latitude: 35.6762,
                longitude: 139.6503,
                depth: 25,
                place: 'Test earthquake near Tokyo',
                time: new Date(),
            },
        ]

        const result = await fetchElevationForEarthquakes(sampleEarthquakes)

        earthquakeElevationData.value = result
        console.log('Earthquake elevation result:', result)
    } catch (error) {
        console.error('Error fetching earthquake elevation:', error)
    } finally {
        loading.value = false
        loadCacheStats()
    }
}

async function clearCache() {
    clearElevationCache()
    await loadCacheStats()
}

async function exportCache() {
    await exportElevationCache()
    await loadCacheStats()
}

function loadCacheStats() {
    cacheStats.value = getElevationCacheStats()
}
</script>

<template>
    <div style="padding: 2rem; max-width: 1200px; margin: 0 auto">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem">
            <i class="pi pi-mountain" style="font-size: 2rem; color: #10b981"></i>
            <h1 style="margin: 0">Elevation Service Test</h1>
        </div>
        <p style="color: #666; margin-bottom: 2rem">
            Testing Open-Meteo Elevation API with Copernicus DEM data
        </p>

        <!-- Cache Stats -->
        <Card style="margin-bottom: 2rem">
            <template #title>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <i class="pi pi-database"></i>
                    <span>Cache Statistics</span>
                </div>
            </template>
            <template #content>
                <div v-if="cacheStats" style="display: flex; gap: 2rem; align-items: center">
                    <div>
                        <div style="font-size: 2rem; font-weight: bold; color: #10b981">
                            {{ cacheStats.size }}
                        </div>
                        <div style="color: #666">Cached Locations</div>
                    </div>
                    <div style="flex: 1">
                        <div style="font-size: 0.9rem; color: #666">Recent Keys:</div>
                        <div style="font-size: 0.8rem; color: #999; margin-top: 0.25rem">
                            {{ cacheStats.keys.slice(0, 3).join(', ') }}
                            {{ cacheStats.keys.length > 3 ? '...' : '' }}
                        </div>
                    </div>
                </div>
                <div v-else style="text-align: center; color: #999">
                    No cache statistics available
                </div>
            </template>
        </Card>

        <!-- Test Controls -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem">
            <!-- Single Coordinate Test -->
            <Card>
                <template #title>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                        <i class="pi pi-map-marker"></i>
                        <span>Single Coordinate</span>
                    </div>
                </template>
                <template #content>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem">
                        <InputText
                            v-model.number="customLat"
                            placeholder="Latitude"
                            type="number"
                            step="0.0001"
                        />
                        <InputText
                            v-model.number="customLng"
                            placeholder="Longitude"
                            type="number"
                            step="0.0001"
                        />
                        <Button
                            label="Test"
                            icon="pi pi-search"
                            @click="testSingleElevation"
                            :loading="loading"
                        />
                    </div>
                    <small style="color: #666">
                        Example: Berlin (52.52, 13.41) - Should return ~38 meters
                    </small>
                </template>
            </Card>

            <!-- Multiple Coordinates Test -->
            <Card>
                <template #title>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                        <i class="pi pi-map"></i>
                        <span>Multiple Coordinates</span>
                    </div>
                </template>
                <template #content>
                    <div style="margin-bottom: 1rem">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem">
                            Testing {{ testCoordinates.length }} locations:
                        </div>
                        <div style="font-size: 0.8rem; color: #999">
                            {{
                                testCoordinates
                                    .map((c) => `${c.latitude},${c.longitude}`)
                                    .join(' | ')
                            }}
                        </div>
                    </div>
                    <Button
                        label="Test Multiple"
                        icon="pi pi-search"
                        severity="secondary"
                        @click="testMultipleElevation"
                        :loading="loading"
                        style="width: 100%"
                    />
                </template>
            </Card>
        </div>

        <!-- Earthquake Integration Test -->
        <Card style="margin-bottom: 2rem">
            <template #title>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <i class="pi pi-globe"></i>
                    <span>Earthquake Integration</span>
                </div>
            </template>
            <template #content>
                <p style="color: #666; margin-bottom: 1rem">
                    Test elevation data integration with sample earthquake data
                </p>
                <Button
                    label="Test Earthquake Elevation"
                    icon="pi pi-bolt"
                    severity="help"
                    @click="testEarthquakeElevation"
                    :loading="loading"
                />
            </template>
        </Card>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem">
            <Button
                label="Clear Cache"
                icon="pi pi-trash"
                severity="danger"
                outlined
                @click="clearCache"
            />
            <Button
                label="Export Cache"
                icon="pi pi-download"
                severity="success"
                @click="exportCache"
            />
        </div>

        <!-- Loading State -->
        <div v-if="loading" style="text-align: center; padding: 3rem">
            <ProgressSpinner />
            <p style="margin-top: 1rem; color: #666">Fetching elevation data from Open-Meteo...</p>
        </div>

        <!-- Single Elevation Results -->
        <Card v-if="elevationData && !Array.isArray(elevationData)" style="margin-bottom: 1rem">
            <template #title>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <i class="pi pi-check-circle" style="color: #10b981"></i>
                    <span>Single Elevation Result</span>
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
                        <strong>Coordinates</strong>
                        <div style="color: #666">
                            {{ elevationData.latitude }}, {{ elevationData.longitude }}
                        </div>
                    </div>
                    <div>
                        <strong>Elevation</strong>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #10b981">
                            {{ elevationData.elevation }} meters
                        </div>
                    </div>
                    <div>
                        <strong>Description</strong>
                        <div style="color: #666">{{ elevationData.description }}</div>
                    </div>
                    <div>
                        <strong>Category</strong>
                        <Badge :value="elevationData.category" severity="info" />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Multiple Elevation Results -->
        <Card v-if="elevationData && Array.isArray(elevationData)" style="margin-bottom: 1rem">
            <template #title>
                <div style="display: flex; align-items; center; gap: 0.5rem">
                    <i class="pi pi-check-circle" style="color: #10b981"></i>
                    <span>Multiple Elevation Results ({{ elevationData.length }} locations)</span>
                </div>
            </template>
            <template #content>
                <DataTable :value="elevationData" :paginator="true" :rows="5" stripedRows>
                    <Column field="latitude" header="Latitude" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.latitude.toFixed(4) }}
                        </template>
                    </Column>
                    <Column field="longitude" header="Longitude" sortable>
                        <template #body="slotProps">
                            {{ slotProps.data.longitude.toFixed(4) }}
                        </template>
                    </Column>
                    <Column field="elevation" header="Elevation (m)" sortable>
                        <template #body="slotProps">
                            <Badge
                                :value="slotProps.data.elevation"
                                :severity="slotProps.data.aboveSeaLevel ? 'success' : 'warning'"
                            />
                        </template>
                    </Column>
                    <Column field="description" header="Description" />
                    <Column field="category" header="Category">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.category" />
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- Earthquake Elevation Results -->
        <Card v-if="earthquakeElevationData" style="margin-bottom: 1rem">
            <template #title>
                <div style="display: flex; align-items; center; gap: 0.5rem">
                    <i class="pi pi-check-circle" style="color: #10b981"></i>
                    <span>Earthquake Elevation Integration</span>
                </div>
            </template>
            <template #content>
                <DataTable :value="earthquakeElevationData" :paginator="true" :rows="5" stripedRows>
                    <Column field="id" header="ID" />
                    <Column field="magnitude" header="Magnitude" sortable>
                        <template #body="slotProps">
                            <Badge :value="`M${slotProps.data.magnitude}`" severity="warning" />
                        </template>
                    </Column>
                    <Column field="place" header="Location" style="min-width: 200px" />
                    <Column field="depth" header="Depth (km)" sortable />
                    <Column field="elevation.value" header="Elevation (m)" sortable>
                        <template #body="slotProps">
                            <div style="display: flex; align-items: center; gap: 0.5rem">
                                <Badge
                                    :value="slotProps.data.elevation.value"
                                    :severity="
                                        slotProps.data.elevation.aboveSeaLevel
                                            ? 'success'
                                            : 'warning'
                                    "
                                />
                                <small style="color: #666">{{
                                    slotProps.data.elevation.description
                                }}</small>
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </template>
        </Card>

        <!-- Attribution -->
        <Card style="background: #eff6ff; border: 2px solid #bfdbfe">
            <template #content>
                <div style="display: flex; gap: 1rem">
                    <i class="pi pi-info-circle" style="font-size: 2rem; color: #3b82f6"></i>
                    <div>
                        <strong style="color: #1e40af">Data Attribution:</strong>
                        <p style="margin: 0.5rem 0 0 0; color: #1e40af">
                            Elevation data from Copernicus DEM 2021 GLO-90 (90m resolution) via
                            Open-Meteo. Non-commercial use only. Maximum 10,000 daily API calls.
                        </p>
                        <p style="margin: 0.5rem 0 0 0; color: #1e40af; font-size: 0.9rem">
                            Citation: https://doi.org/10.5270/ESA-c5d3d65
                        </p>
                    </div>
                </div>
            </template>
        </Card>
    </div>
</template>
