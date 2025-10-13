<script setup>
import { ref, onMounted } from 'vue'
import {
    fetchAllCountries,
    findCountryByName,
    findCountryByCoordinates,
    findCountriesByRegion,
    getCountriesByPopulation,
    getCountriesByArea,
    getCountriesStatistics,
    saveToJSON,
    clearCountriesCache,
} from '@/services/countriesService'

import Earth from 'vue-material-design-icons/Earth.vue'
import MapMarker from 'vue-material-design-icons/MapMarker.vue'
import AccountGroup from 'vue-material-design-icons/AccountGroup.vue'
import MapOutline from 'vue-material-design-icons/MapOutline.vue'
import ChartBar from 'vue-material-design-icons/ChartBar.vue'
import Cached from 'vue-material-design-icons/Cached.vue'
import Download from 'vue-material-design-icons/Download.vue'

const loading = ref(false)
const countries = ref([])
const statistics = ref(null)
const searchResult = ref(null)
const coordinateResult = ref(null)

// Test parameters
const searchName = ref('Costa Rica')
const testLat = ref(9.9333)
const testLng = ref(-84.0833)

onMounted(async () => {
    await loadCountries()
    await loadStatistics()
})

async function loadCountries() {
    loading.value = true
    try {
        countries.value = await fetchAllCountries()
        console.log('Loaded countries:', countries.value.length)
    } catch (error) {
        console.error('Error loading countries:', error)
    } finally {
        loading.value = false
    }
}

async function loadStatistics() {
    try {
        statistics.value = await getCountriesStatistics()
    } catch (error) {
        console.error('Error loading statistics:', error)
    }
}

async function testSearchByName() {
    loading.value = true
    try {
        searchResult.value = await findCountryByName(searchName.value)
        console.log('Search result:', searchResult.value)
    } catch (error) {
        console.error('Error searching country:', error)
    } finally {
        loading.value = false
    }
}

async function testSearchByCoordinates() {
    loading.value = true
    try {
        coordinateResult.value = await findCountryByCoordinates(testLat.value, testLng.value)
        console.log('Coordinate result:', coordinateResult.value)
    } catch (error) {
        console.error('Error searching by coordinates:', error)
    } finally {
        loading.value = false
    }
}

async function exportToJSON() {
    loading.value = true
    try {
        await saveToJSON()
    } catch (error) {
        console.error('Error exporting:', error)
    } finally {
        loading.value = false
    }
}

async function clearCache() {
    clearCountriesCache()
    await loadCountries(true)
}

function openLink(url) {
    window.open(url, '_blank')
}
</script>

<template>
    <div style="padding: 2rem; max-width: 1400px; margin: 0 auto">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem">
            <Earth :size="40" fillColor="#10b981" />
            <h1 style="margin: 0">Countries Service Test</h1>
        </div>
        <p style="color: #666; margin-bottom: 2rem">Testing REST Countries API with caching</p>

        <!-- Actions -->
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem">
            <Button
                label="Refresh Countries"
                icon="pi pi-refresh"
                @click="loadCountries"
                :loading="loading"
            />
            <Button
                label="Export to JSON"
                icon="pi pi-download"
                severity="secondary"
                @click="exportToJSON"
                :disabled="countries.length === 0"
            />
            <Button
                label="Clear Cache"
                icon="pi pi-trash"
                severity="danger"
                outlined
                @click="clearCache"
            />
        </div>

        <!-- Loading -->
        <div v-if="loading && countries.length === 0" style="text-align: center; padding: 3rem">
            <ProgressSpinner />
            <p style="margin-top: 1rem; color: #666">Loading countries data...</p>
        </div>

        <div v-else>
            <!-- Statistics Cards -->
            <div
                v-if="statistics"
                style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                "
            >
                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <Earth :size="24" fillColor="#10b981" />
                            <span>Total Countries</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="font-size: 2.5rem; font-weight: bold; color: #10b981">
                            {{ statistics.totalCountries }}
                        </div>
                        <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem">
                            {{ statistics.regions }} regions, {{ statistics.subregions }} subregions
                        </p>
                    </template>
                </Card>

                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <AccountGroup :size="24" fillColor="#3b82f6" />
                            <span>Total Population</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="font-size: 2.5rem; font-weight: bold; color: #3b82f6">
                            {{ (statistics.totalPopulation / 1000000000).toFixed(2) }}B
                        </div>
                        <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem">
                            Avg: {{ (statistics.avgPopulation / 1000000).toFixed(1) }}M per country
                        </p>
                    </template>
                </Card>

                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <MapOutline :size="24" fillColor="#f59e0b" />
                            <span>Total Area</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="font-size: 2.5rem; font-weight: bold; color: #f59e0b">
                            {{ (statistics.totalArea / 1000000).toFixed(1) }}M
                        </div>
                        <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem">
                            km² - Avg: {{ (statistics.avgArea / 1000).toFixed(0) }}K per country
                        </p>
                    </template>
                </Card>

                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <Cached :size="24" fillColor="#8b5cf6" />
                            <span>Cache Status</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #8b5cf6">
                            <Badge
                                value="Active"
                                severity="success"
                                style="font-size: 1rem; padding: 0.5rem 1rem"
                            />
                        </div>
                        <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem">
                            7 days duration
                        </p>
                    </template>
                </Card>
            </div>

            <!-- Search Tests -->
            <div
                style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                "
            >
                <!-- Search by Name -->
                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <MapMarker :size="24" />
                            <span>Search by Name</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem">
                            <InputText
                                v-model="searchName"
                                placeholder="Enter country name"
                                style="flex: 1"
                            />
                            <Button label="Search" icon="pi pi-search" @click="testSearchByName" />
                        </div>

                        <div
                            v-if="searchResult"
                            style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem"
                        >
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 1rem;
                                    margin-bottom: 1rem;
                                "
                            >
                                <img
                                    :src="searchResult.flagPng"
                                    :alt="searchResult.flagAlt"
                                    style="
                                        width: 60px;
                                        height: 40px;
                                        object-fit: cover;
                                        border-radius: 4px;
                                    "
                                />
                                <div>
                                    <h3 style="margin: 0">{{ searchResult.name }}</h3>
                                    <p
                                        style="
                                            margin: 0.25rem 0 0 0;
                                            color: #666;
                                            font-size: 0.9rem;
                                        "
                                    >
                                        {{ searchResult.officialName }}
                                    </p>
                                </div>
                            </div>

                            <div
                                style="
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 0.5rem;
                                    font-size: 0.9rem;
                                "
                            >
                                <div><strong>Capital:</strong> {{ searchResult.capital }}</div>
                                <div><strong>Region:</strong> {{ searchResult.region }}</div>
                                <div>
                                    <strong>Population:</strong>
                                    {{ (searchResult.population / 1000000).toFixed(2) }}M
                                </div>
                                <div>
                                    <strong>Area:</strong>
                                    {{ (searchResult.area / 1000).toFixed(0) }}K km²
                                </div>
                                <div>
                                    <strong>Timezone:</strong> {{ searchResult.primaryTimezone }}
                                </div>
                                <div>
                                    <strong>Coords:</strong> {{ searchResult.latitude }},
                                    {{ searchResult.longitude }}
                                </div>
                            </div>

                            <div style="margin-top: 1rem; display: flex; gap: 0.5rem">
                                <Button
                                    v-if="searchResult.googleMaps"
                                    label="Google Maps"
                                    icon="pi pi-map"
                                    size="small"
                                    text
                                    @click="openLink(searchResult.googleMaps)"
                                />
                                <Button
                                    v-if="searchResult.openStreetMaps"
                                    label="OpenStreetMap"
                                    icon="pi pi-map-marker"
                                    size="small"
                                    text
                                    @click="openLink(searchResult.openStreetMaps)"
                                />
                            </div>
                        </div>
                        <div v-else style="text-align: center; padding: 2rem; color: #999">
                            No search result yet
                        </div>
                    </template>
                </Card>

                <!-- Search by Coordinates -->
                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <MapMarker :size="24" />
                            <span>Search by Coordinates</span>
                        </div>
                    </template>
                    <template #content>
                        <div
                            style="
                                display: grid;
                                grid-template-columns: 1fr 1fr auto;
                                gap: 0.5rem;
                                margin-bottom: 1rem;
                            "
                        >
                            <InputText
                                v-model.number="testLat"
                                type="number"
                                step="0.0001"
                                placeholder="Latitude"
                            />
                            <InputText
                                v-model.number="testLng"
                                type="number"
                                step="0.0001"
                                placeholder="Longitude"
                            />
                            <Button
                                label="Find"
                                icon="pi pi-search"
                                @click="testSearchByCoordinates"
                            />
                        </div>

                        <div
                            v-if="coordinateResult"
                            style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1rem"
                        >
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    gap: 1rem;
                                    margin-bottom: 1rem;
                                "
                            >
                                <img
                                    :src="coordinateResult.flagPng"
                                    :alt="coordinateResult.flagAlt"
                                    style="
                                        width: 60px;
                                        height: 40px;
                                        object-fit: cover;
                                        border-radius: 4px;
                                    "
                                />
                                <div>
                                    <h3 style="margin: 0">{{ coordinateResult.name }}</h3>
                                    <Badge
                                        :value="`${coordinateResult.distance} km away`"
                                        severity="info"
                                    />
                                </div>
                            </div>

                            <div
                                style="
                                    display: grid;
                                    grid-template-columns: 1fr 1fr;
                                    gap: 0.5rem;
                                    font-size: 0.9rem;
                                "
                            >
                                <div><strong>Capital:</strong> {{ coordinateResult.capital }}</div>
                                <div><strong>Region:</strong> {{ coordinateResult.region }}</div>
                                <div>
                                    <strong>Population:</strong>
                                    {{ (coordinateResult.population / 1000000).toFixed(2) }}M
                                </div>
                                <div>
                                    <strong>Area:</strong>
                                    {{ (coordinateResult.area / 1000).toFixed(0) }}K km²
                                </div>
                            </div>
                        </div>
                        <div v-else style="text-align: center; padding: 2rem; color: #999">
                            No coordinate search result yet
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Countries Table -->
            <Card>
                <template #title>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                        <ChartBar :size="24" />
                        <span>All Countries (First 20)</span>
                    </div>
                </template>
                <template #content>
                    <DataTable
                        :value="countries.slice(0, 20)"
                        :paginator="false"
                        stripedRows
                        sortField="population"
                        :sortOrder="-1"
                    >
                        <Column header="Flag" style="width: 60px">
                            <template #body="slotProps">
                                <img
                                    :src="slotProps.data.flagPng"
                                    :alt="slotProps.data.flagAlt"
                                    style="
                                        width: 40px;
                                        height: 27px;
                                        object-fit: cover;
                                        border-radius: 2px;
                                    "
                                />
                            </template>
                        </Column>
                        <Column field="name" header="Country" sortable style="min-width: 150px" />
                        <Column field="capital" header="Capital" sortable />
                        <Column field="region" header="Region" sortable />
                        <Column
                            field="subregion"
                            header="Subregion"
                            sortable
                            style="min-width: 150px"
                        />
                        <Column field="population" header="Population" sortable>
                            <template #body="slotProps">
                                {{ (slotProps.data.population / 1000000).toFixed(2) }}M
                            </template>
                        </Column>
                        <Column field="area" header="Area (km²)" sortable>
                            <template #body="slotProps">
                                {{ (slotProps.data.area / 1000).toFixed(0) }}K
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>
    </div>
</template>

<style scoped>
h1,
h3 {
    margin: 0;
}
</style>
