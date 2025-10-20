<!-- src/views/DrillTestView.vue -->
<template>
    <div class="drill-test-view">
        <!-- Header Section -->
        <Card class="header-card">
            <template #title>
                <div class="header-title">
                    <i class="pi pi-database"></i>
                    Apache Drill Analytics Test
                </div>
            </template>
            <template #subtitle>
                Testing multi-month earthquake analytics with real data (Jul-Sep 2025)
            </template>
            <template #content>
                <div class="header-content">
                    <div class="period-info">
                        <Tag icon="pi pi-calendar" severity="info">
                            {{ periodText }}
                        </Tag>
                        <Tag icon="pi pi-chart-line" severity="success">
                            {{ totalEvents.toLocaleString() }} total events
                        </Tag>
                        <Tag icon="pi pi-globe" severity="warning">
                            {{ uniqueCountries }} countries
                        </Tag>
                    </div>
                    <div class="action-buttons">
                        <Button
                            label="Run All Tests"
                            icon="pi pi-play"
                            @click="runAllTests"
                            :loading="loading"
                            severity="primary"
                        />
                        <Button
                            label="Clear Cache"
                            icon="pi pi-refresh"
                            @click="clearCache"
                            severity="secondary"
                            outlined
                        />
                    </div>
                </div>
            </template>
        </Card>

        <!-- Loading State -->
        <Card v-if="loading" class="loading-card">
            <template #content>
                <div class="loading-content">
                    <ProgressSpinner />
                    <p>Executing Drill queries...</p>
                    <small>This may take a few seconds</small>
                </div>
            </template>
        </Card>

        <!-- Results Section -->
        <div v-else class="results-section">
            <!-- Global Statistics -->
            <Card class="section-card">
                <template #title>
                    <i class="pi pi-chart-bar"></i>
                    Global Statistics
                </template>
                <template #content>
                    <div class="stats-grid">
                        <div class="stat-card" v-for="stat in globalStats" :key="stat.month">
                            <h4>{{ stat.month }}</h4>
                            <div class="stat-values">
                                <div class="stat-item">
                                    <span class="label">Events:</span>
                                    <span class="value">{{ stat.total_events }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">Avg Mag:</span>
                                    <span class="value">{{ stat.avg_magnitude }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">Max Mag:</span>
                                    <span class="value">{{ stat.max_magnitude }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="label">Avg Depth:</span>
                                    <span class="value">{{ stat.avg_depth }} km</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Top Countries -->
            <Card class="section-card">
                <template #title>
                    <i class="pi pi-flag"></i>
                    Top 20 Countries by Activity
                </template>
                <template #content>
                    <DataTable :value="topCountries" :rows="10" paginator responsiveLayout="scroll">
                        <Column field="country_name" header="Country" sortable>
                            <template #body="slotProps">
                                <Tag :value="slotProps.data.country_name" severity="info" />
                            </template>
                        </Column>
                        <Column field="region" header="Region" sortable></Column>
                        <Column field="total_events" header="Events" sortable>
                            <template #body="slotProps">
                                <Badge :value="slotProps.data.total_events" />
                            </template>
                        </Column>
                        <Column field="avg_magnitude" header="Avg Mag" sortable>
                            <template #body="slotProps">
                                M{{ slotProps.data.avg_magnitude }}
                            </template>
                        </Column>
                        <Column field="max_magnitude" header="Max Mag" sortable>
                            <template #body="slotProps">
                                <Tag
                                    :value="'M' + slotProps.data.max_magnitude"
                                    :severity="getMagnitudeSeverity(slotProps.data.max_magnitude)"
                                />
                            </template>
                        </Column>
                        <Column field="tsunami_events" header="Tsunamis" sortable>
                            <template #body="slotProps">
                                <Badge
                                    v-if="slotProps.data.tsunami_events > 0"
                                    :value="slotProps.data.tsunami_events"
                                    severity="danger"
                                />
                                <span v-else>-</span>
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>

            <!-- Strongest Earthquakes -->
            <Card class="section-card">
                <template #title>
                    <i class="pi pi-bolt"></i>
                    Strongest Earthquakes (Top 10)
                </template>
                <template #content>
                    <DataTable :value="strongestEarthquakes" responsiveLayout="scroll">
                        <Column field="magnitude" header="Magnitude" sortable>
                            <template #body="slotProps">
                                <Tag
                                    :value="'M' + slotProps.data.magnitude"
                                    :severity="getMagnitudeSeverity(slotProps.data.magnitude)"
                                />
                            </template>
                        </Column>
                        <Column field="place" header="Location" sortable>
                            <template #body="slotProps">
                                <div class="location-cell">
                                    <div class="place">
                                        {{ truncateText(slotProps.data.place, 50) }}
                                    </div>
                                    <small class="country">{{ slotProps.data.country_name }}</small>
                                </div>
                            </template>
                        </Column>
                        <Column field="depth" header="Depth" sortable>
                            <template #body="slotProps"> {{ slotProps.data.depth }} km </template>
                        </Column>
                        <Column field="time" header="Date" sortable>
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.time) }}
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>

            <!-- Magnitude Distribution -->
            <Card class="section-card">
                <template #title>
                    <i class="pi pi-chart-line"></i>
                    Magnitude Distribution
                </template>
                <template #content>
                    <DataTable :value="magnitudeDistribution" responsiveLayout="scroll">
                        <Column field="magnitude_range" header="Range" sortable></Column>
                        <Column field="count" header="Count" sortable>
                            <template #body="slotProps">
                                <ProgressBar
                                    :value="(slotProps.data.count / totalEvents) * 100"
                                    :showValue="false"
                                />
                                {{ slotProps.data.count }}
                            </template>
                        </Column>
                        <Column field="avg_magnitude" header="Avg Magnitude" sortable>
                            <template #body="slotProps">
                                M{{ slotProps.data.avg_magnitude }}
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>

            <!-- Country Explorer -->
            <Card class="section-card">
                <template #title>
                    <i class="pi pi-search"></i>
                    Country Explorer
                </template>
                <template #content>
                    <div class="country-explorer">
                        <div class="country-selector">
                            <Select
                                v-model="selectedCountry"
                                :options="countryList"
                                optionLabel="country_name"
                                optionValue="country_name"
                                placeholder="Select a country..."
                                :filter="true"
                                showClear
                                class="w-full"
                            />
                            <Button
                                label="Load Country Data"
                                icon="pi pi-search"
                                @click="loadCountryData"
                                :disabled="!selectedCountry"
                                severity="info"
                            />
                        </div>

                        <div v-if="countryData" class="country-results">
                            <h4>Earthquakes in {{ selectedCountry }}</h4>
                            <DataTable
                                :value="countryData"
                                :rows="5"
                                paginator
                                responsiveLayout="scroll"
                            >
                                <Column field="magnitude" header="Mag" sortable>
                                    <template #body="slotProps">
                                        <Tag
                                            :value="slotProps.data.magnitude"
                                            :severity="
                                                getMagnitudeSeverity(slotProps.data.magnitude)
                                            "
                                        />
                                    </template>
                                </Column>
                                <Column field="place" header="Location" sortable>
                                    <template #body="slotProps">
                                        {{ truncateText(slotProps.data.place, 40) }}
                                    </template>
                                </Column>
                                <Column field="depth" header="Depth" sortable>
                                    <template #body="slotProps">
                                        {{ slotProps.data.depth }} km
                                    </template>
                                </Column>
                                <Column field="time" header="Date" sortable>
                                    <template #body="slotProps">
                                        {{ formatDate(slotProps.data.time) }}
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Tsunami Events -->
            <Card class="section-card">
                <template #title>
                    <i class="pi pi-exclamation-triangle"></i>
                    Tsunami Events
                </template>
                <template #content>
                    <DataTable :value="tsunamiEvents" :rows="5" paginator responsiveLayout="scroll">
                        <Column field="magnitude" header="Magnitude" sortable>
                            <template #body="slotProps">
                                <Tag
                                    :value="'M' + slotProps.data.magnitude"
                                    :severity="getMagnitudeSeverity(slotProps.data.magnitude)"
                                />
                            </template>
                        </Column>
                        <Column field="place" header="Location" sortable>
                            <template #body="slotProps">
                                {{ truncateText(slotProps.data.place, 50) }}
                            </template>
                        </Column>
                        <Column field="country_name" header="Country" sortable></Column>
                        <Column field="time" header="Date" sortable>
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.time) }}
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>

            <!-- Daily Timeline -->
            <Card class="section-card">
                <template #title>
                    <i class="pi pi-calendar"></i>
                    Daily Activity Timeline
                </template>
                <template #content>
                    <DataTable
                        :value="dailyTimeline"
                        :rows="10"
                        paginator
                        responsiveLayout="scroll"
                    >
                        <Column field="event_date" header="Date" sortable>
                            <template #body="slotProps">
                                {{ formatDate(slotProps.data.event_date) }}
                            </template>
                        </Column>
                        <Column field="event_count" header="Events" sortable>
                            <template #body="slotProps">
                                <Badge :value="slotProps.data.event_count" />
                            </template>
                        </Column>
                        <Column field="avg_magnitude" header="Avg Mag" sortable>
                            <template #body="slotProps">
                                M{{ slotProps.data.avg_magnitude }}
                            </template>
                        </Column>
                        <Column field="max_magnitude" header="Max Mag" sortable>
                            <template #body="slotProps">
                                <Tag
                                    :value="'M' + slotProps.data.max_magnitude"
                                    :severity="getMagnitudeSeverity(slotProps.data.max_magnitude)"
                                />
                            </template>
                        </Column>
                    </DataTable>
                </template>
            </Card>
        </div>

        <!-- Error Display -->
        <Dialog v-model:visible="showError" header="Query Error" :modal="true" :closable="true">
            <p>{{ errorMessage }}</p>
            <template #footer>
                <Button label="OK" icon="pi pi-check" @click="showError = false" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
    getGlobalStatistics,
    getTopCountries,
    getStrongestEarthquakes,
    getMagnitudeDistribution,
    getEarthquakesByCountry,
    getCountryList,
    getTsunamiEvents,
    getDailyTimeline,
    clearCache,
} from '@/services/drillService.js'
import { getLastThreeMonths, getPeriodText } from '@/utils/analyticsHelpers'

// Reactive state
const loading = ref(false)
const globalStats = ref([])
const topCountries = ref([])
const strongestEarthquakes = ref([])
const magnitudeDistribution = ref([])
const countryList = ref([])
const selectedCountry = ref(null)
const countryData = ref(null)
const tsunamiEvents = ref([])
const dailyTimeline = ref([])
const showError = ref(false)
const errorMessage = ref('')

// Computed properties
const periodText = computed(() => getPeriodText())
const months = computed(() => getLastThreeMonths())

const totalEvents = computed(() => {
    return globalStats.value.reduce((sum, stat) => sum + stat.total_events, 0)
})

const uniqueCountries = computed(() => {
    return countryList.value.length
})

// Methods
const runAllTests = async () => {
    loading.value = true
    try {
        await Promise.all([
            loadGlobalStatistics(),
            loadTopCountries(),
            loadStrongestEarthquakes(),
            loadMagnitudeDistribution(),
            loadCountryList(),
            loadTsunamiEvents(),
            loadDailyTimeline(),
        ])
    } catch (error) {
        showError.value = true
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
}

const loadGlobalStatistics = async () => {
    try {
        globalStats.value = (await getGlobalStatistics(months.value)) || []
        console.log('Global Statistics:', globalStats.value)
    } catch (error) {
        console.error('Error loading global statistics:', error)
        globalStats.value = []
    }
}

const loadTopCountries = async () => {
    try {
        topCountries.value = (await getTopCountries(months.value, 20)) || []
        console.log('Top Countries:', topCountries.value)
    } catch (error) {
        console.error('Error loading top countries:', error)
        topCountries.value = []
    }
}

const loadStrongestEarthquakes = async () => {
    try {
        strongestEarthquakes.value = (await getStrongestEarthquakes(months.value, 10)) || []
        console.log('Strongest Earthquakes:', strongestEarthquakes.value)
    } catch (error) {
        console.error('Error loading strongest earthquakes:', error)
        strongestEarthquakes.value = []
    }
}

const loadMagnitudeDistribution = async () => {
    try {
        magnitudeDistribution.value = (await getMagnitudeDistribution(months.value)) || []
        console.log('Magnitude Distribution:', magnitudeDistribution.value)
    } catch (error) {
        console.error('Error loading magnitude distribution:', error)
        magnitudeDistribution.value = []
    }
}

const loadCountryList = async () => {
    try {
        countryList.value = (await getCountryList(months.value)) || []
        console.log('Country List:', countryList.value)
    } catch (error) {
        console.error('Error loading country list:', error)
        countryList.value = []
    }
}

const loadCountryData = async () => {
    if (!selectedCountry.value) return

    try {
        countryData.value =
            (await getEarthquakesByCountry(selectedCountry.value, months.value, 100)) || []
    } catch (error) {
        console.error('Error loading country data:', error)
        countryData.value = []
    }
}

const loadTsunamiEvents = async () => {
    try {
        tsunamiEvents.value = (await getTsunamiEvents(months.value)) || []
        console.log('Tsunami Events:', tsunamiEvents.value)
    } catch (error) {
        console.error('Error loading tsunami events:', error)
        tsunamiEvents.value = []
    }
}

const loadDailyTimeline = async () => {
    try {
        dailyTimeline.value = (await getDailyTimeline(months.value)) || []
        console.log('Daily Timeline:', dailyTimeline.value)
    } catch (error) {
        console.error('Error loading daily timeline:', error)
        dailyTimeline.value = []
    }
}

const getMagnitudeSeverity = (magnitude) => {
    if (magnitude >= 7.0) return 'danger'
    if (magnitude >= 6.0) return 'warning'
    if (magnitude >= 5.0) return 'info'
    return 'success'
}

const truncateText = (text, length) => {
    if (!text) return ''
    return text.length > length ? text.substring(0, length) + '...' : text
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
}

const testDirectQuery = async () => {
    try {
        console.log('Testing direct query to Drill...')

        // Query simple y directa
        const testQuery = `
            SELECT COUNT(*) as count 
            FROM dfs.\`/data/earthquakes-2025-07.json\`
        `

        const response = await fetch('/api/drill/query.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                queryType: 'SQL',
                query: testQuery,
            }),
        })

        console.log('Direct query response status:', response.status)
        console.log('Direct query response ok:', response.ok)

        const data = await response.json()
        console.log('Direct query result:', data)

        if (data.rows && data.rows.length > 0) {
            console.log('Direct query successful. Count:', data.rows[0].count)
        } else {
            console.log('Direct query returned no data')
            console.log('Full response:', data)
        }
    } catch (error) {
        console.error('Direct query test failed:', error)
    }
}

const testUnionQuery = async () => {
    try {
        console.log('Testing UNION query...')

        const testQuery = `
            SELECT COUNT(*) as count, '2025-07' as month 
            FROM dfs.quakex.\`earthquakes-2025-07.json\`
            UNION ALL
            SELECT COUNT(*) as count, '2025-08' as month 
            FROM dfs.quakex.\`earthquakes-2025-08.json\`
        `

        const response = await fetch('/api/drill/query.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queryType: 'SQL', query: testQuery }),
        })

        const data = await response.json()
        console.log('UNION query result:', data)

        if (data.queryState === 'FAILED') {
            console.error('UNION query failed:', data.errorMessage)
        } else {
            console.log('UNION query successful:', data.rows)
        }
    } catch (error) {
        console.error('UNION query test failed:', error)
    }
}

// Lifecycle
onMounted(async () => {
    console.log('Starting comprehensive Drill diagnostics...')

    // 1. Prueba directa básica
    await testDirectQuery()

    // 2. Prueba UNION
    await testUnionQuery()

    // 3. Solo entonces pruebas complejas
    console.log('Now running main queries...')
    await runAllTests()

    console.log('All diagnostics completed')
})
</script>

<style scoped>
.drill-test-view {
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
}

.header-card {
    margin-bottom: 1.5rem;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary-color);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.period-info {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
}

.loading-card {
    margin-bottom: 1.5rem;
}

.loading-content {
    text-align: center;
    padding: 2rem;
}

.loading-content p {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

.section-card {
    margin-bottom: 1.5rem;
}

.section-card :deep(.p-card-title) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    padding: 1rem;
    background: var(--surface-50);
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
}

.stat-card h4 {
    margin: 0 0 0.75rem 0;
    color: var(--text-color);
    font-size: 1rem;
}

.stat-values {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-item .label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

.stat-item .value {
    font-weight: 600;
    color: var(--text-color);
}

.country-explorer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.country-selector {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
}

.country-results {
    margin-top: 1rem;
}

.country-results h4 {
    margin-bottom: 1rem;
    color: var(--text-color);
}

.location-cell {
    display: flex;
    flex-direction: column;
}

.location-cell .place {
    font-weight: 500;
}

.location-cell .country {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

/* Responsive design */
@media (max-width: 768px) {
    .drill-test-view {
        padding: 1rem;
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
    }

    .country-selector {
        flex-direction: column;
        align-items: stretch;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}

/* Table improvements */
:deep(.p-datatable) {
    font-size: 0.875rem;
}

:deep(.p-datatable .p-column-header-content) {
    font-weight: 600;
}

:deep(.p-progressbar) {
    height: 0.5rem;
    margin-right: 0.5rem;
}
</style>
