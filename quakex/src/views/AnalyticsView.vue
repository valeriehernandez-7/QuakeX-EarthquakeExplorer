<template>
    <div class="analytics-view">
        <AppNavbar />

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <ProgressSpinner />
            <p class="loading-text">QuakeX</p>
            <small class="loading-subtext">Preparing data for analysis</small>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
            <Message severity="error" :closable="false">
                <div class="error-content">
                    <p class="error-title">Failed to prepare analytics!</p>
                    <p class="error-message">{{ error }}</p>
                </div>
            </Message>
        </div>

        <!-- Main Content -->
        <div v-else class="analytics-container">
            <!-- Header -->
            <div class="analytics-header">
                <div class="header-content">
                    <div class="header-title">
                        <ChartLineVariant :size="32" fillColor="#3b82f6" />
                        <div class="title-text">
                            <h1>Seismic Activity Analysis</h1>
                            <p class="period-text">{{ periodText }} • {{ totalEvents }} events</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <Button
                            icon="pi pi-ellipsis-v"
                            @click="toggleActionsMenu"
                            aria-label="Actions"
                            text
                            rounded
                        />
                        <Menu ref="actionsMenu" :model="actionsMenuItems" :popup="true" />
                    </div>
                </div>
            </div>

            <!-- Tabs Navigation -->
            <Tabs v-model:value="activeTab" class="analytics-tabs">
                <TabList>
                    <Tab value="0">
                        <div class="tab-header">
                            <MapMarkerRadius :size="18" />
                            <span>Explorer</span>
                        </div>
                    </Tab>
                    <Tab value="1">
                        <div class="tab-header">
                            <TrendingUp :size="18" />
                            <span>Trends</span>
                        </div>
                    </Tab>
                    <Tab value="2">
                        <div class="tab-header">
                            <AlertOctagon :size="18" />
                            <span>Critical</span>
                        </div>
                    </Tab>
                    <Tab value="3">
                        <div class="tab-header">
                            <SelectionSearch :size="18" />
                            <span>Advanced</span>
                        </div>
                    </Tab>
                </TabList>

                <TabPanels>
                    <!-- TAB 1: EXPLORER -->
                    <TabPanel value="0">
                        <div class="tab-content">
                            <!-- Country Selector -->
                            <Card class="selector-card">
                                <template #content>
                                    <div class="country-selector">
                                        <label for="country-select" class="selector-label">
                                            <EarthBox :size="20" fillColor="#3b82f6" />
                                            <span>Select Country</span>
                                        </label>
                                        <AutoComplete
                                            id="country-select"
                                            v-model="selectedCountry"
                                            :suggestions="filteredCountries"
                                            @complete="searchCountry"
                                            @item-select="onCountrySelect"
                                            placeholder="Search by country name..."
                                            dropdown
                                            forceSelection
                                            class="country-autocomplete"
                                        />
                                        <small class="selector-hint"
                                            >{{ availableCountries.length }} countries
                                            available</small
                                        >
                                    </div>
                                </template>
                            </Card>

                            <!-- Loading country data -->
                            <div v-if="loadingCountryData" class="country-loading">
                                <ProgressSpinner style="width: 40px; height: 40px" />
                                <p>Loading country data...</p>
                            </div>

                            <!-- Country Data -->
                            <div v-else-if="selectedCountry && countryData">
                                <!-- KPI Cards -->
                                <div class="kpi-grid">
                                    <Card class="kpi-card">
                                        <template #content>
                                            <div class="kpi-content">
                                                <DatabaseOutline :size="24" fillColor="#3b82f6" />
                                                <div class="kpi-data">
                                                    <span class="kpi-value">{{
                                                        countryStats.total_events || 0
                                                    }}</span>
                                                    <span class="kpi-label">Events</span>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>

                                    <Card class="kpi-card">
                                        <template #content>
                                            <div class="kpi-content">
                                                <ChartLineVariant :size="24" fillColor="#10b981" />
                                                <div class="kpi-data">
                                                    <span class="kpi-value"
                                                        >M
                                                        {{
                                                            countryStats.avg_magnitude || '0.0'
                                                        }}</span
                                                    >
                                                    <span class="kpi-label">Average</span>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>

                                    <Card class="kpi-card">
                                        <template #content>
                                            <div class="kpi-content">
                                                <AlertCircleOutline
                                                    :size="24"
                                                    fillColor="#ef4444"
                                                />
                                                <div class="kpi-data">
                                                    <span class="kpi-value"
                                                        >M
                                                        {{
                                                            countryStats.max_magnitude || '0.0'
                                                        }}</span
                                                    >
                                                    <span class="kpi-label">Strongest</span>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>

                                    <Card class="kpi-card">
                                        <template #content>
                                            <div class="kpi-content">
                                                <ArrowCollapseDown :size="24" fillColor="#f59e0b" />
                                                <div class="kpi-data">
                                                    <span class="kpi-value"
                                                        >{{
                                                            countryStats.avg_depth || '0'
                                                        }}
                                                        km</span
                                                    >
                                                    <span class="kpi-label">Avg Depth</span>
                                                </div>
                                            </div>
                                        </template>
                                    </Card>
                                </div>

                                <!-- Events Table -->
                                <Card class="data-card">
                                    <template #title>
                                        <div class="card-title">
                                            <TableLarge :size="24" fillColor="#3b82f6" />
                                            <span>Recorded Events</span>
                                        </div>
                                    </template>
                                    <template #content>
                                        <DataTable
                                            :value="countryData"
                                            :paginator="true"
                                            :rows="10"
                                            :rowsPerPageOptions="[10, 25, 50]"
                                            sortField="time"
                                            :sortOrder="-1"
                                            stripedRows
                                            showGridlines
                                            :exportFilename="exportFilename"
                                            class="events-table"
                                        >
                                            <template #header>
                                                <div class="table-header">
                                                    <span class="table-description"
                                                        >Complete list of seismic events for the
                                                        selected country during the analysis
                                                        period.</span
                                                    >
                                                    <Button
                                                        icon="pi pi-download"
                                                        label="Export CSV"
                                                        @click="exportTableCSV"
                                                        size="small"
                                                        outlined
                                                    />
                                                </div>
                                            </template>

                                            <Column
                                                field="time"
                                                header="Date"
                                                sortable
                                                style="min-width: 180px"
                                            >
                                                <template #body="{ data }">
                                                    {{ formatDate(data.time) }}
                                                </template>
                                            </Column>

                                            <Column
                                                field="magnitude"
                                                header="Magnitude"
                                                sortable
                                                style="min-width: 120px"
                                            >
                                                <template #body="{ data }">
                                                    <span
                                                        class="magnitude-badge"
                                                        :style="{
                                                            background: getMagnitudeColor(
                                                                data.magnitude,
                                                            ),
                                                        }"
                                                    >
                                                        M {{ data.magnitude.toFixed(1) }}
                                                    </span>
                                                </template>
                                            </Column>

                                            <Column
                                                field="depth"
                                                header="Depth"
                                                sortable
                                                style="min-width: 100px"
                                            >
                                                <template #body="{ data }">
                                                    {{ data.depth.toFixed(1) }} km
                                                </template>
                                            </Column>

                                            <Column
                                                field="place"
                                                header="Location"
                                                style="min-width: 250px"
                                            >
                                                <template #body="{ data }">
                                                    {{ data.place }}
                                                </template>
                                            </Column>

                                            <Column
                                                field="significance"
                                                header="Significance"
                                                sortable
                                                style="min-width: 120px"
                                            >
                                                <template #body="{ data }">
                                                    {{ data.significance }}
                                                </template>
                                            </Column>
                                        </DataTable>
                                        <div class="table-footer-note">
                                            <InformationOutline :size="16" fillColor="#64748b" />
                                            <span
                                                >Events are sorted by date (most recent first).
                                                Click column headers to sort by different
                                                criteria.</span
                                            >
                                        </div>
                                    </template>
                                </Card>

                                <!-- Timeline Chart -->
                                <Card class="chart-card">
                                    <template #title>
                                        <div class="card-title">
                                            <CalendarRange :size="24" fillColor="#3b82f6" />
                                            <span>Activity Timeline</span>
                                        </div>
                                        <div class="chart-actions">
                                            <Button
                                                icon="pi pi-image"
                                                label="Export PNG"
                                                @click="exportChartPNG('timelineChart')"
                                                size="small"
                                                outlined
                                            />
                                        </div>
                                    </template>
                                    <template #content>
                                        <div class="chart-container">
                                            <Chart
                                                ref="timelineChart"
                                                type="line"
                                                :data="timelineChartData"
                                                :options="timelineChartOptions"
                                                class="h-[25rem]"
                                            />
                                        </div>
                                        <div class="chart-footer-note">
                                            <InformationOutline :size="16" fillColor="#64748b" />
                                            <span
                                                >Daily event count showing temporal patterns of
                                                seismic activity. Clusters may indicate aftershock
                                                sequences.</span
                                            >
                                        </div>
                                    </template>
                                </Card>
                            </div>

                            <!-- No country selected -->
                            <div v-else class="empty-state">
                                <EarthBox :size="64" fillColor="#94a3b8" />
                                <h3>Select a country to view analysis</h3>
                                <p>
                                    Choose from {{ availableCountries.length }} countries with
                                    recorded seismic activity
                                </p>
                            </div>
                        </div>
                    </TabPanel>

                    <!-- TAB 2: TRENDS (Placeholder) -->
                    <TabPanel value="1">
                        <div class="tab-content placeholder-content">
                            <TrendingUp :size="64" fillColor="#94a3b8" />
                            <h3>Global Trends</h3>
                            <p>Coming in next implementation phase</p>
                        </div>
                    </TabPanel>

                    <!-- TAB 3: CRITICAL (Placeholder) -->
                    <TabPanel value="2">
                        <div class="tab-content placeholder-content">
                            <AlertOctagon :size="64" fillColor="#94a3b8" />
                            <h3>Critical Events</h3>
                            <p>Coming in next implementation phase</p>
                        </div>
                    </TabPanel>

                    <!-- TAB 4: ADVANCED (Placeholder) -->
                    <TabPanel value="3">
                        <div class="tab-content placeholder-content">
                            <SelectionSearch :size="64" fillColor="#94a3b8" />
                            <h3>Advanced Analytics</h3>
                            <p>Coming in next implementation phase</p>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getLastThreeMonths, getPeriodText, formatMonth } from '@/utils/analyticsHelpers'
import {
    ensureDataAvailable,
    getCountryList,
    getEarthquakesByCountry,
    getCountryStatistics,
    getCountryTimeline,
    getGlobalStatisticsTotal,
} from '@/services/drillService'

// Icons
import ChartLineVariant from 'vue-material-design-icons/ChartLineVariant.vue'
import MapMarkerRadius from 'vue-material-design-icons/MapMarkerRadius.vue'
import TrendingUp from 'vue-material-design-icons/TrendingUp.vue'
import AlertOctagon from 'vue-material-design-icons/AlertOctagon.vue'
import SelectionSearch from 'vue-material-design-icons/SelectionSearch.vue'
import EarthBox from 'vue-material-design-icons/EarthBox.vue'
import DatabaseOutline from 'vue-material-design-icons/DatabaseOutline.vue'
import AlertCircleOutline from 'vue-material-design-icons/AlertCircleOutline.vue'
import ArrowCollapseDown from 'vue-material-design-icons/ArrowCollapseDown.vue'
import TableLarge from 'vue-material-design-icons/TableLarge.vue'
import CalendarRange from 'vue-material-design-icons/CalendarRange.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'

// State
const loading = ref(true)
const error = ref(null)
const months = ref([])
const activeTab = ref('0')

// Data
const availableCountries = ref([])
const filteredCountries = ref([])
const selectedCountry = ref(null)
const loadingCountryData = ref(false)
const countryData = ref([])
const countryStats = ref({})
const countryTimeline = ref([])
const totalEvents = ref(0)

// UI
const actionsMenu = ref(null)
const timelineChart = ref(null)

/**
 * Computed: Period text for header
 */
const periodText = computed(() => {
    return getPeriodText(months.value)
})

/**
 * Computed: Export filename for CSV
 */
const exportFilename = computed(() => {
    if (!selectedCountry.value) return 'earthquakes_export'
    const countryName = selectedCountry.value.replace(/\s+/g, '_')
    return `earthquakes_${countryName}_${months.value[0]}_to_${months.value[months.value.length - 1]}`
})

/**
 * Computed: Timeline chart data
 */
const timelineChartData = computed(() => {
    if (!countryTimeline.value || countryTimeline.value.length === 0) {
        return {
            labels: [],
            datasets: [],
        }
    }

    const labels = countryTimeline.value.map((item) => formatDateShort(item.event_date))
    const data = countryTimeline.value.map((item) => item.event_count)

    return {
        labels,
        datasets: [
            {
                label: 'Events per Month',
                data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    }
})

/**
 * Computed: Timeline chart options
 */
const timelineChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    scales: {
        x: {
            display: true,
            title: {
                display: true,
                text: 'Date',
            },
        },
        y: {
            display: true,
            title: {
                display: true,
                text: 'Number of Events',
            },
            beginAtZero: true,
        },
    },
}))

/**
 * Actions menu items
 */
const actionsMenuItems = ref([
    {
        label: 'Export Report',
        icon: 'pi pi-file-pdf',
        command: () => {
            console.log('Export report - to be implemented')
        },
    },
    {
        label: 'Download Data',
        icon: 'pi pi-download',
        command: () => {
            console.log('Download data - to be implemented')
        },
    },
    {
        separator: true,
    },
    {
        label: 'About Analytics',
        icon: 'pi pi-info-circle',
        command: () => {
            console.log('About analytics - to be implemented')
        },
    },
])

/**
 * Initialize analytics
 */
async function initializeAnalytics() {
    try {
        loading.value = true
        error.value = null
        months.value = getLastThreeMonths()

        // Ensure data availability
        const dataReady = await ensureDataAvailable(months.value)

        if (!dataReady) {
            error.value = 'Failed to prepare analytics data. Please check if data files exist.'
            return
        }

        // Load initial data
        await loadInitialData()
    } catch (err) {
        console.error('Analytics initialization failed:', err)
        error.value = err.message || 'An unexpected error occurred'
    } finally {
        loading.value = false
    }
}

/**
 * Load initial data
 */
async function loadInitialData() {
    try {
        // Get total events count
        const globalStats = await getGlobalStatisticsTotal(months.value)
        if (globalStats) {
            totalEvents.value = globalStats['total_events'] || 0
        }

        // Get country list
        const countries = await getCountryList(months.value)
        if (countries) {
            availableCountries.value = countries.map((c) => c.country_name).sort()
        }
    } catch (err) {
        console.error('Failed to load initial data:', err)
    }
}

/**
 * Search country in autocomplete
 */
function searchCountry(event) {
    const query = event.query.toLowerCase()
    filteredCountries.value = availableCountries.value.filter((country) =>
        country.toLowerCase().includes(query),
    )
}

/**
 * Handle country selection
 */
async function onCountrySelect(event) {
    const country = event.value
    if (!country) return

    try {
        loadingCountryData.value = true

        // Load country data in parallel
        const [events, stats, timeline] = await Promise.all([
            getEarthquakesByCountry(country, months.value, 1000),
            getCountryStatistics(country, months.value),
            getCountryTimeline(country, months.value),
        ])
        countryData.value = events || []
        countryStats.value = stats || {}
        countryTimeline.value = timeline || []

        console.log('\nEvents *** : ', countryData.value)
        console.log('\nStats *** : ', countryStats.value)
        console.log('\nTimeline *** : ', countryTimeline.value)
    } catch (err) {
        console.error('Failed to load country data:', err)
    } finally {
        loadingCountryData.value = false
    }
}

/**
 * Toggle actions menu
 */
function toggleActionsMenu(event) {
    actionsMenu.value.toggle(event)
}

/**
 * Export table to CSV
 */
function exportTableCSV() {
    if (!countryData.value || countryData.value.length === 0) {
        console.warn('No data to export')
        return
    }

    // Create CSV content
    const headers = ['Date', 'Magnitude', 'Depth (km)', 'Location', 'Significance']
    const rows = countryData.value.map((event) => [
        formatDate(event.time),
        event.magnitude.toFixed(1),
        event.depth.toFixed(1),
        `"${event.place}"`,
        event.significance,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${exportFilename.value}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Export chart to PNG
 */
function exportChartPNG(chartRef) {
    const chart = chartRef === 'timelineChart' ? timelineChart.value : null
    if (!chart) return

    const canvas = chart.$el.querySelector('canvas')
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${exportFilename.value}_timeline.png`
    link.href = url
    link.click()
}

/**
 * Format date for display
 */
function formatDate(timestamp) {
    if (!timestamp) return ''
    return new Date(timestamp).toLocaleString('en-US', {
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

/**
 * Format date short (for charts)
 */
function formatDateShort(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Get magnitude color
 */
function getMagnitudeColor(magnitude) {
    if (magnitude < 4.0) return '#10b981' // Green
    if (magnitude < 5.0) return '#3b82f6' // Blue
    if (magnitude < 6.0) return '#f59e0b' // Yellow
    if (magnitude < 7.0) return '#ef4444' // Red
    return '#991b1b' // Dark Red
}

// Initialize on mount
onMounted(() => {
    initializeAnalytics()
})
</script>

<style scoped>
.analytics-view {
    min-height: 100vh;
    background: var(--surface-ground);
}

/* Loading & Error States */
.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
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

.error-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.error-title {
    font-weight: 600;
    font-size: 1.125rem;
}

.error-message {
    color: var(--text-color-secondary);
}

/* Analytics Container */
.analytics-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
}

/* Header */
.analytics-header {
    margin-bottom: 2rem;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: var(--surface-card);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-title {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.title-text h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
}

.period-text {
    margin: 0.25rem 0 0 0;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Tabs */
.analytics-tabs {
    background: var(--surface-card);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tab-content {
    padding: 1.5rem 0;
}

/* Country Selector */
.selector-card {
    margin-bottom: 1.5rem;
}

.country-selector {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.selector-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-color);
}

.country-autocomplete {
    width: 100%;
}

.selector-hint {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

/* KPI Grid */
.kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.kpi-card {
    background: linear-gradient(135deg, var(--surface-card) 0%, var(--surface-50) 100%);
}

.kpi-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.kpi-data {
    display: flex;
    flex-direction: column;
}

.kpi-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color);
    line-height: 1;
}

.kpi-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-top: 0.25rem;
}

/* Data Card */
.data-card,
.chart-card {
    margin-bottom: 1.5rem;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.125rem;
    font-weight: 600;
}

/* Table */
.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.table-description {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

.events-table :deep(.p-datatable-thead) {
    background: var(--surface-50);
}

.magnitude-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
}

.table-footer-note,
.chart-footer-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Chart */
.chart-container {
    height: 400px;
    margin-bottom: 1rem;
}

.chart-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

/* Empty State */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
}

.empty-state h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--text-color);
}

.empty-state p {
    margin: 0;
    color: var(--text-color-secondary);
}

/* Placeholder Content */
.placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    text-align: center;
}

.placeholder-content h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--text-color);
}

.placeholder-content p {
    margin: 0;
    color: var(--text-color-secondary);
}

/* Loading Country Data */
.country-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .analytics-container {
        padding: 1rem;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .kpi-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .chart-container {
        height: 300px;
    }
}
</style>
