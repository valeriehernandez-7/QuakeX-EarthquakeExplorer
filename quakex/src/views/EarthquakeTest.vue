<script setup>
import { useAppStore } from '@/stores/appStore'
import { fetchEarthquakes, saveToJSON } from '@/services/usgsService'
import { onMounted } from 'vue'

const store = useAppStore()

onMounted(async () => {
    await loadEarthquakes()
})

async function loadEarthquakes() {
    store.setLoading(true)
    store.clearError()

    try {
        // Fetch earthquakes from last 7 days with M4.5+
        const earthquakes = await fetchEarthquakes({
            startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            minMagnitude: 4.5, // Only significant earthquakes for testing
        })

        if (earthquakes.length === 0) {
            store.setError('No earthquakes found for the specified criteria')
        } else {
            store.setEarthquakes(earthquakes)
        }
    } catch (error) {
        store.setError('Failed to load earthquake data from USGS')
    } finally {
        store.setLoading(false)
    }
}

function exportData() {
    saveToJSON(store.earthquakes, `earthquakes_M4.5_last7days_${Date.now()}.json`)
}
</script>

<template>
    <div style="padding: 2rem">
        <div
            style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
            "
        >
            <h1>QuakeX - Real USGS Data Testing</h1>
            <div style="display: flex; gap: 1rem">
                <Button
                    label="Refresh Data"
                    icon="pi pi-refresh"
                    @click="loadEarthquakes"
                    :loading="store.loading"
                />
                <Button
                    label="Export to JSON"
                    icon="pi pi-download"
                    severity="secondary"
                    @click="exportData"
                    :disabled="store.earthquakes.length === 0"
                />
            </div>
        </div>

        <!-- Loading State -->
        <div
            v-if="store.loading"
            style="display: flex; justify-content: center; align-items: center; min-height: 300px"
        >
            <div style="text-align: center">
                <ProgressSpinner />
                <p style="margin-top: 1rem; color: #666">Loading earthquake data from USGS...</p>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="store.error">
            <Message severity="error" :closable="false">
                <div style="display: flex; align-items: center; gap: 1rem">
                    <i class="pi pi-exclamation-triangle" style="font-size: 2rem"></i>
                    <div>
                        <strong>Error</strong>
                        <p style="margin: 0.5rem 0 0 0">{{ store.error }}</p>
                    </div>
                </div>
            </Message>
            <Button
                label="Try Again"
                icon="pi pi-refresh"
                @click="loadEarthquakes"
                style="margin-top: 1rem"
            />
        </div>

        <!-- Data Display -->
        <div v-else-if="store.earthquakes.length > 0">
            <!-- Statistics Cards -->
            <div
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
                            <i class="pi pi-list"></i>
                            <span>Total Earthquakes</span>
                        </div>
                    </template>
                    <template #content>
                        <h2 style="font-size: 2.5rem; margin: 0; color: #3b82f6">
                            {{ store.statistics.total }}
                        </h2>
                        <p style="margin-top: 0.5rem; font-size: 0.9rem; color: #666">
                            Last 7 days (M4.5+)
                        </p>
                    </template>
                </Card>

                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <i class="pi pi-chart-line"></i>
                            <span>Average Magnitude</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem">
                            <h2 style="font-size: 2.5rem; margin: 0; color: #10b981">
                                {{ store.statistics.avgMagnitude }}
                            </h2>
                            <Badge value="Mw" severity="info" />
                        </div>
                    </template>
                </Card>

                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <i class="pi pi-arrows-v"></i>
                            <span>Average Depth</span>
                        </div>
                    </template>
                    <template #content>
                        <div style="display: flex; align-items: baseline; gap: 0.5rem">
                            <h2 style="font-size: 2.5rem; margin: 0; color: #f59e0b">
                                {{ store.statistics.avgDepth }}
                            </h2>
                            <span style="font-size: 1rem; color: #666">km</span>
                        </div>
                    </template>
                </Card>

                <Card>
                    <template #title>
                        <div style="display: flex; align-items: center; gap: 0.5rem">
                            <i class="pi pi-exclamation-triangle"></i>
                            <span>Strongest Event</span>
                        </div>
                    </template>
                    <template #content>
                        <div v-if="store.statistics.strongest">
                            <Badge
                                :value="`M${store.statistics.strongest.magnitude}`"
                                severity="danger"
                                style="font-size: 1.5rem; padding: 0.5rem 1rem"
                            />
                            <p style="margin: 0.75rem 0 0 0; font-size: 0.9rem; color: #666">
                                {{ store.statistics.strongest.place }}
                            </p>
                            <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #999">
                                {{ new Date(store.statistics.strongest.time).toLocaleDateString() }}
                            </p>
                        </div>
                    </template>
                </Card>
            </div>

            <!-- Sample Data Preview -->
            <Card>
                <template #title>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                        <i class="pi pi-table"></i>
                        <span>Recent Earthquakes (First 10)</span>
                    </div>
                </template>
                <template #content>
                    <DataTable
                        :value="store.earthquakes.slice(0, 10)"
                        :paginator="false"
                        stripedRows
                    >
                        <Column field="magnitude" header="Magnitude" sortable>
                            <template #body="slotProps">
                                <Badge
                                    :value="`M${slotProps.data.magnitude}`"
                                    :severity="
                                        slotProps.data.magnitude >= 6
                                            ? 'danger'
                                            : slotProps.data.magnitude >= 5
                                              ? 'warning'
                                              : 'info'
                                    "
                                />
                            </template>
                        </Column>
                        <Column field="place" header="Location" sortable style="min-width: 250px">
                            <template #body="slotProps">
                                <div style="display: flex; align-items: center; gap: 0.5rem">
                                    <i class="pi pi-map-marker" style="color: #ef4444"></i>
                                    <span>{{ slotProps.data.place }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column field="depth" header="Depth (km)" sortable>
                            <template #body="slotProps"> {{ slotProps.data.depth }} km </template>
                        </Column>
                        <Column field="time" header="Date & Time" sortable>
                            <template #body="slotProps">
                                <div>
                                    <div>
                                        {{ new Date(slotProps.data.time).toLocaleDateString() }}
                                    </div>
                                    <div style="font-size: 0.85rem; color: #666">
                                        {{ new Date(slotProps.data.time).toLocaleTimeString() }}
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <Column field="status" header="Status" sortable>
                            <template #body="slotProps">
                                <Tag
                                    :value="slotProps.data.status"
                                    :severity="
                                        slotProps.data.status === 'reviewed'
                                            ? 'success'
                                            : 'secondary'
                                    "
                                />
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>

            <!-- Test Buttons -->
            <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap">
                <Button label="Success Test" severity="success" icon="pi pi-check" />
                <Button label="Info Test" severity="info" icon="pi pi-info-circle" />
                <Button label="Warning Test" severity="warning" icon="pi pi-exclamation-triangle" />
                <Button label="Danger Test" severity="danger" icon="pi pi-times" />
            </div>
        </div>

        <!-- Empty State -->
        <div v-else style="text-align: center; padding: 4rem 2rem">
            <i class="pi pi-inbox" style="font-size: 4rem; color: #ccc"></i>
            <h3 style="margin-top: 1rem; color: #666">No earthquake data available</h3>
            <p style="color: #999">Click "Refresh Data" to load earthquakes from USGS</p>
        </div>

        <!-- Last Update Info -->
        <div
            v-if="store.lastUpdate"
            style="margin-top: 2rem; text-align: center; color: #999; font-size: 0.85rem"
        >
            Last updated: {{ new Date(store.lastUpdate).toLocaleString() }}
        </div>
    </div>
</template>
