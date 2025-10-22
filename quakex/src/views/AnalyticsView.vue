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
                                                <div class="kpi-icon">
                                                    <DatabaseOutline
                                                        :size="50"
                                                        fillColor="#3b82f6"
                                                    />
                                                </div>
                                                <div class="kpi-details">
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
                                                <div class="kpi-icon">
                                                    <ChartLineVariant
                                                        :size="50"
                                                        fillColor="#3b82f6"
                                                    />
                                                </div>
                                                <div class="kpi-details">
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
                                                <div class="kpi-icon">
                                                    <AlertCircleOutline
                                                        :size="50"
                                                        fillColor="#3b82f6"
                                                    />
                                                </div>
                                                <div class="kpi-details">
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
                                                <div class="kpi-icon">
                                                    <ArrowCollapseDown
                                                        :size="50"
                                                        fillColor="#3b82f6"
                                                    />
                                                </div>
                                                <div class="kpi-details">
                                                    <span class="kpi-value"
                                                        >{{ countryStats.avg_depth || '0' }} km
                                                    </span>
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
                                            <TableLarge :size="50" fillColor="#3b82f6" />
                                            <span>Recorded Events</span>
                                        </div>
                                    </template>
                                    <template #content>
                                        <DataTable
                                            ref="eventsDataTable"
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
                                                    <Tag
                                                        :value="`M ${data.magnitude}`"
                                                        :severity="
                                                            getMagnitudeSeverity(data.magnitude)
                                                        "
                                                    />
                                                </template>
                                            </Column>

                                            <Column
                                                field="depth"
                                                header="Depth"
                                                sortable
                                                style="min-width: 100px"
                                            >
                                                <template #body="{ data }">
                                                    {{ data.depth }} km
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

                                            <Column
                                                field="url"
                                                header="Details"
                                                style="min-width: 100px"
                                            >
                                                <template #body="{ data }">
                                                    <a
                                                        :href="data.url"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        class="usgs-link"
                                                    >
                                                        <i class="pi pi-external-link"></i>
                                                    </a>
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
                                            <CalendarRange :size="50" fillColor="#3b82f6" />
                                            <span>Activity Timeline</span>
                                        </div>
                                        <div class="chart-actions">
                                            <Button
                                                icon="pi pi-image"
                                                label="Export PNG"
                                                @click="
                                                    exportChartPNG(timelineChart, 'timeline_chart')
                                                "
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
                                                class="h-[20rem]"
                                            />
                                        </div>
                                        <div class="chart-footer-note">
                                            <InformationOutline :size="16" fillColor="#64748b" />
                                            <span
                                                >Monthly event count showing temporal patterns of
                                                seismic activity. Variations may indicate increased
                                                regional activity or aftershock sequences.</span
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

                    <!-- TAB 2: TRENDS -->
                    <TabPanel value="1">
                        <div class="tab-content">
                            <!-- Global KPI Cards -->
                            <div class="kpi-grid">
                                <Card class="kpi-card">
                                    <template #content>
                                        <div class="kpi-content">
                                            <div class="kpi-icon">
                                                <DatabaseOutline :size="50" fillColor="#3b82f6" />
                                            </div>
                                            <div class="kpi-details">
                                                <span class="kpi-value">{{
                                                    globalStats?.total_events || 0
                                                }}</span>
                                                <span class="kpi-label">Total Events</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>

                                <Card class="kpi-card">
                                    <template #content>
                                        <div class="kpi-content">
                                            <div class="kpi-icon">
                                                <ChartLineVariant :size="50" fillColor="#10b981" />
                                            </div>
                                            <div class="kpi-details">
                                                <span class="kpi-value"
                                                    >M
                                                    {{ globalStats?.avg_magnitude || '0.0' }}</span
                                                >
                                                <span class="kpi-label">Average Magnitude</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>

                                <Card class="kpi-card">
                                    <template #content>
                                        <div class="kpi-content">
                                            <div class="kpi-icon">
                                                <AlertCircleOutline
                                                    :size="50"
                                                    fillColor="#ef4444"
                                                />
                                            </div>
                                            <div class="kpi-details">
                                                <span class="kpi-value"
                                                    >M
                                                    {{ globalStats?.max_magnitude || '0.0' }}</span
                                                >
                                                <span class="kpi-label">Maximum Magnitude</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>

                                <Card class="kpi-card">
                                    <template #content>
                                        <div class="kpi-content">
                                            <div class="kpi-icon">
                                                <EarthBox :size="50" fillColor="#8b5cf6" />
                                            </div>
                                            <div class="kpi-details">
                                                <span class="kpi-value">{{
                                                    availableCountries.length
                                                }}</span>
                                                <span class="kpi-label">Countries Affected</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>
                            </div>

                            <!-- Magnitude Distribution Chart -->
                            <Card class="chart-card">
                                <template #title>
                                    <div class="card-title">
                                        <TrendingUp :size="20" fillColor="#3b82f6" />
                                        <span>Magnitude Distribution</span>
                                    </div>
                                    <div class="chart-actions">
                                        <Button
                                            icon="pi pi-image"
                                            label="Export PNG"
                                            @click="
                                                exportChartPNG(
                                                    magnitudeChart,
                                                    'magnitude_distribution',
                                                )
                                            "
                                            size="small"
                                            outlined
                                            :disabled="loadingGlobalData"
                                        />
                                    </div>
                                </template>
                                <template #content>
                                    <div v-if="loadingGlobalData" class="chart-loading">
                                        <ProgressSpinner
                                            style="width: 50px; height: 50px"
                                            strokeWidth="4"
                                        />
                                    </div>
                                    <div v-else class="chart-container">
                                        <Chart
                                            ref="magnitudeChart"
                                            type="bar"
                                            :data="magnitudeDistributionData"
                                            :options="magnitudeChartOptions"
                                            class="h-[20rem]"
                                        />
                                        <div class="chart-footer-note">
                                            <InformationOutline :size="16" fillColor="#3b82f6" />
                                            <span
                                                >Most events fall in the minor to light magnitude
                                                ranges, which is consistent with global seismic
                                                patterns</span
                                            >
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Top Countries Table -->
                            <Card class="data-card">
                                <template #title>
                                    <div class="card-title">
                                        <TableLarge :size="20" fillColor="#3b82f6" />
                                        <span>Top 20 Most Active Countries</span>
                                    </div>
                                </template>
                                <template #content>
                                    <div v-if="loadingGlobalData" class="table-loading">
                                        <ProgressSpinner
                                            style="width: 50px; height: 50px"
                                            strokeWidth="4"
                                        />
                                    </div>
                                    <DataTable
                                        v-else
                                        ref="countriesDataTable"
                                        :value="topCountriesData"
                                        :paginator="true"
                                        :rows="10"
                                        :rowsPerPageOptions="[10, 20]"
                                        tableStyle="min-width: 50rem"
                                        class="countries-table"
                                        @row-click="onCountryRowClick"
                                        :rowHover="true"
                                    >
                                        <template #header>
                                            <div class="table-header">
                                                <span class="table-description"
                                                    >Click on any country to view detailed analysis
                                                    in the Explorer tab</span
                                                >
                                                <Button
                                                    icon="pi pi-download"
                                                    label="Export CSV"
                                                    @click="exportTopCountriesCSV"
                                                    size="small"
                                                    outlined
                                                />
                                            </div>
                                        </template>
                                        <Column field="rank" header="#" style="width: 60px">
                                            <template #body="slotProps">
                                                <Badge
                                                    :value="slotProps.data.rank"
                                                    :severity="
                                                        getRankBadgeSeverity(slotProps.data.rank)
                                                    "
                                                />
                                            </template>
                                        </Column>
                                        <Column
                                            field="country_name"
                                            header="Country"
                                            sortable
                                            style="width: 100px"
                                        >
                                            <template #body="slotProps">
                                                <div class="country-cell">
                                                    <strong>{{
                                                        slotProps.data.country_name
                                                    }}</strong>
                                                    <small class="country-region">{{
                                                        slotProps.data.subregion
                                                    }}</small>
                                                </div>
                                            </template>
                                        </Column>
                                        <Column
                                            field="total_events"
                                            header="Total Events"
                                            sortable
                                            style="width: 120px"
                                        >
                                            <template #body="slotProps">
                                                <span class="event-count">{{
                                                    slotProps.data.total_events
                                                }}</span>
                                            </template>
                                        </Column>
                                        <Column
                                            field="major_events"
                                            header="Major Events"
                                            sortable
                                            style="width: 100px"
                                        >
                                            <template #body="slotProps">
                                                <span
                                                    :class="
                                                        slotProps.data.major_events > 0
                                                            ? 'major-count'
                                                            : 'minor-count'
                                                    "
                                                    >{{ slotProps.data.major_events }}</span
                                                >
                                            </template>
                                        </Column>
                                        <Column
                                            field="avg_magnitude"
                                            header="Avg Mag"
                                            sortable
                                            style="width: 100px"
                                        >
                                            <template #body="slotProps">
                                                <Tag
                                                    :value="`M ${slotProps.data.avg_magnitude}`"
                                                    :severity="
                                                        getMagnitudeSeverity(
                                                            slotProps.data.avg_magnitude,
                                                        )
                                                    "
                                                />
                                            </template>
                                        </Column>
                                        <Column
                                            field="max_magnitude"
                                            header="Max Mag"
                                            sortable
                                            style="width: 100px"
                                        >
                                            <template #body="slotProps">
                                                <Tag
                                                    :value="`M ${slotProps.data.max_magnitude}`"
                                                    :severity="
                                                        getMagnitudeSeverity(
                                                            slotProps.data.max_magnitude,
                                                        )
                                                    "
                                                />
                                            </template>
                                        </Column>
                                        <Column
                                            field="min_magnitude"
                                            header="Min Mag"
                                            sortable
                                            style="width: 100px"
                                        >
                                            <template #body="slotProps">
                                                <Tag
                                                    :value="`M ${slotProps.data.min_magnitude}`"
                                                    :severity="
                                                        getMagnitudeSeverity(
                                                            slotProps.data.min_magnitude,
                                                        )
                                                    "
                                                />
                                            </template>
                                        </Column>
                                    </DataTable>
                                </template>
                            </Card>

                            <!-- Global Timeline Chart -->
                            <Card class="chart-card">
                                <template #title>
                                    <div class="card-title">
                                        <CalendarRange :size="20" fillColor="#3b82f6" />
                                        <span>Global Activity Timeline</span>
                                    </div>
                                    <div class="chart-actions">
                                        <Button
                                            icon="pi pi-image"
                                            label="Export PNG"
                                            @click="exportChartPNG(monthlyChart, 'global_timeline')"
                                            size="small"
                                            outlined
                                            :disabled="loadingGlobalData"
                                        />
                                    </div>
                                </template>
                                <template #content>
                                    <div v-if="loadingGlobalData" class="chart-loading">
                                        <ProgressSpinner
                                            style="width: 50px; height: 50px"
                                            strokeWidth="4"
                                        />
                                    </div>
                                    <div v-else class="chart-container">
                                        <Chart
                                            ref="monthlyChart"
                                            type="line"
                                            :data="globalTimelineData"
                                            :options="globalTimelineOptions"
                                            class="h-[20rem]"
                                        />
                                        <div class="chart-footer-note">
                                            <InformationOutline :size="16" fillColor="#3b82f6" />
                                            <span
                                                >Daily fluctuations are natural. Significant spikes
                                                may indicate aftershock sequences or swarm
                                                activity</span
                                            >
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Monthly Comparison Table -->
                            <Card class="data-card">
                                <template #title>
                                    <div class="card-title">
                                        <ArrowCollapseDown :size="20" fillColor="#3b82f6" />
                                        <span>Monthly Comparison</span>
                                    </div>
                                </template>
                                <template #content>
                                    <div v-if="loadingGlobalData" class="table-loading">
                                        <ProgressSpinner
                                            style="width: 50px; height: 50px"
                                            strokeWidth="4"
                                        />
                                    </div>
                                    <DataTable
                                        v-else
                                        :value="monthlyComparisonData"
                                        tableStyle="min-width: 50rem"
                                        class="monthly-table"
                                    >
                                        <Column field="month" header="Month" sortable>
                                            <template #body="slotProps">
                                                <strong>{{ slotProps.data.month }}</strong>
                                            </template>
                                        </Column>
                                        <Column
                                            field="total_events"
                                            header="Total Events"
                                            sortable
                                        />
                                        <Column
                                            field="avg_magnitude"
                                            header="Avg Magnitude"
                                            sortable
                                        >
                                            <template #body="slotProps">
                                                <Tag
                                                    :value="`M ${slotProps.data.avg_magnitude}`"
                                                    :severity="
                                                        getMagnitudeSeverity(
                                                            slotProps.data.avg_magnitude,
                                                        )
                                                    "
                                                />
                                            </template>
                                        </Column>
                                        <Column field="max_magnitude" header="Max Event" sortable>
                                            <template #body="slotProps">
                                                <Tag
                                                    :value="`M ${slotProps.data.max_magnitude}`"
                                                    :severity="
                                                        getMagnitudeSeverity(
                                                            slotProps.data.max_magnitude,
                                                        )
                                                    "
                                                />
                                            </template>
                                        </Column>
                                        <Column field="avg_depth" header="Avg Depth (km)" sortable>
                                            <template #body="slotProps">
                                                <span>{{ slotProps.data.avg_depth }} km</span>
                                            </template>
                                        </Column>
                                    </DataTable>
                                </template>
                            </Card>
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
    getGlobalStatistics,
    getTopCountries,
    getMagnitudeDistribution,
    getDailyTimeline,
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

// Trends Tab Data
const loadingGlobalData = ref(false)
const globalStats = ref({})
const topCountriesData = ref([])
const magnitudeDistribution = ref([])
const globalTimeline = ref([])
const monthlyComparison = ref([])

// UI
const actionsMenu = ref(null)

// DataTable refs
const eventsDataTable = ref(null)
const countriesDataTable = ref(null)

// Chart refs
const timelineChart = ref(null)
const magnitudeChart = ref(null)
const monthlyChart = ref(null)

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

    const labels = countryTimeline.value.map((item) => formatMonthLabel(item.month))
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
            ticks: {
                stepSize: 1,
            },
        },
    },
}))

/**
 * Computed: Magnitude distribution chart data
 */
const magnitudeDistributionData = computed(() => {
    if (!magnitudeDistribution.value || magnitudeDistribution.value.length === 0) {
        return { labels: [], datasets: [] }
    }

    const labels = magnitudeDistribution.value.map((item) => item.magnitude_range)
    const data = magnitudeDistribution.value.map((item) => item.count)

    return {
        labels,
        datasets: [
            {
                label: 'Number of Events',
                data,
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#dc2626'],
                borderColor: ['#2563eb', '#059669', '#d97706', '#dc2626', '#b91c1c'],
                borderWidth: 1,
            },
        ],
    }
})

/**
 * Computed: Magnitude chart options
 */
const magnitudeChartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    return `Events: ${context.parsed.y}`
                },
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Events',
            },
        },
        x: {
            title: {
                display: true,
                text: 'Magnitude Range',
            },
        },
    },
}))

/**
 * Computed: Global timeline chart data
 */
const globalTimelineData = computed(() => {
    if (!globalTimeline.value || globalTimeline.value.length === 0) {
        return { labels: [], datasets: [] }
    }

    const labels = globalTimeline.value.map((item) => {
        const date = new Date(item.event_date)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
    const data = globalTimeline.value.map((item) => item.event_count)

    return {
        labels,
        datasets: [
            {
                label: 'Daily Events',
                data,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    }
})

/**
 * Computed: Global timeline options
 */
const globalTimelineOptions = computed(() => ({
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
            ticks: {
                maxTicksLimit: 15,
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
 * Computed: Monthly comparison data with formatted month names
 */
const monthlyComparisonData = computed(() => {
    if (!monthlyComparison.value || monthlyComparison.value.length === 0) {
        return []
    }

    return monthlyComparison.value.map((item) => ({
        ...item,
        month: formatMonthLabel(item.month),
    }))
})

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
        // Get total events count and global stats
        const stats = await getGlobalStatisticsTotal(months.value)
        if (stats) {
            totalEvents.value = stats.total_events || 0
            globalStats.value = stats
        }

        // Get country list
        const countries = await getCountryList(months.value)
        if (countries) {
            availableCountries.value = countries.map((c) => c.country_name).sort()
        }

        // Load global data for Trends tab
        await loadGlobalData()
    } catch (err) {
        console.error('Failed to load initial data:', err)
    }
}

/**
 * Load global data for Trends tab
 */
async function loadGlobalData() {
    try {
        loadingGlobalData.value = true

        // Load all data in parallel
        const [topCountries, magDistribution, timeline, monthlyStats] = await Promise.all([
            getTopCountries(months.value, 20),
            getMagnitudeDistribution(months.value),
            getDailyTimeline(months.value),
            getGlobalStatistics(months.value),
        ])

        // Add rank to top countries
        if (topCountries) {
            topCountriesData.value = topCountries.map((country, index) => ({
                ...country,
                rank: index + 1,
            }))
        }

        if (magDistribution) {
            magnitudeDistribution.value = magDistribution
        }

        if (timeline) {
            globalTimeline.value = timeline
        }

        if (monthlyStats) {
            monthlyComparison.value = monthlyStats
        }

        console.log('[AnalyticsView] Global data loaded successfully')
    } catch (err) {
        console.error('Failed to load global data:', err)
    } finally {
        loadingGlobalData.value = false
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
    const headers = [
        'Date (DD-MMM)',
        'Year (YYYY)',
        'Time (UTC)',
        'Magnitude',
        'Depth (km)',
        'Location',
        'Significance',
        'USGS URL',
    ]
    const rows = countryData.value.map((event) => [
        formatDate(event.time),
        event.magnitude,
        event.depth,
        `"${event.place}"`,
        event.significance,
        event.url || '',
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
 * Export Top Countries table to CSV
 */
function exportTopCountriesCSV() {
    if (!topCountriesData.value || topCountriesData.value.length === 0) {
        console.warn('No data to export')
        return
    }

    // Create CSV content
    const headers = [
        'Rank',
        'Country',
        'Region',
        'Sub Region',
        'Total Events',
        'Major Events (>5.9)',
        'Avg Magnitude',
        'Max Magnitude',
        'Min Magnitude',
    ]
    const rows = topCountriesData.value.map((country) => [
        country.rank,
        `"${country.country_name}"`,
        `"${country.region || 'N/A'}"`,
        `"${country.subregion || 'N/A'}"`,
        country.total_events,
        country.major_events,
        country.avg_magnitude,
        country.max_magnitude,
        country.min_magnitude,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().getTime()
    link.setAttribute('href', url)
    link.setAttribute('download', `top_countries_${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Get badge severity based on rank
 */
function getRankBadgeSeverity(rank) {
    if (rank === 1) return 'danger'
    if (rank === 2) return 'warn'
    if (rank === 3) return 'info'
    if (rank > 3) return 'secondary'
    return null
}

/**
 * Get magnitude tag severity
 */
function getMagnitudeSeverity(magnitude) {
    if (magnitude >= 7.0) return 'danger'
    if (magnitude >= 6.0) return 'warn'
    if (magnitude >= 5.0) return 'info'
    return 'secondary'
}

/**
 * Handle country row click - switch to Explorer tab with selected country
 */
function onCountryRowClick(event) {
    const countryName = event.data.country_name
    if (countryName) {
        selectedCountry.value = countryName
        activeTab.value = '0' // Switch to Explorer tab
        // The onCountrySelect will be triggered automatically by the watch or we can call it
        onCountrySelect({ value: countryName })
    }
}

/**
 * Export chart to PNG
 */
function exportChartPNG(chartRef, filename) {
    if (!chartRef || !chartRef.value) {
        console.warn('Chart reference not found')
        return
    }

    const canvas = chartRef.value.$el.querySelector('canvas')
    if (!canvas) {
        console.warn('Canvas not found in chart')
        return
    }

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    const timestamp = new Date().getTime()
    link.download = `${filename}_${timestamp}.png`
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
        month: 'short',
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
 * Format month label (YYYY-MM to "Aug 2025")
 */
function formatMonthLabel(monthString) {
    if (!monthString) return ''
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
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

.kpi-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(59, 130, 246, 0.1);
}

.kpi-details {
    display: flex;
    flex-direction: column;
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

/* Card Title with Actions - Updated for better layout */
.data-card :deep(.p-card-title),
.chart-card :deep(.p-card-title) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.125rem;
    font-weight: 600;
}

.chart-actions {
    display: flex;
    gap: 0.5rem;
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
    padding: 0.75rem;
    background: var(--surface-50);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Chart */
.chart-container {
    height: 350px;
    margin-bottom: 1rem;
}

/* USGS Link */
.usgs-link {
    color: var(--primary-color);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    transition: color 0.2s;
}

.usgs-link:hover {
    color: var(--primary-color-text);
}

.usgs-link i {
    font-size: 1rem;
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

/* Trends Tab Specific Styles */
.chart-loading,
.table-loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
}

.countries-table {
    cursor: pointer;
}

.countries-table :deep(.p-datatable-tbody > tr:hover) {
    background: var(--surface-hover);
}

.country-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.country-region {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

.event-count {
    font-weight: 600;
    color: var(--text-color);
}

.major-count {
    color: #ef4444;
    font-weight: 600;
}

.minor-count {
    color: var(--text-color-secondary);
}

.monthly-table {
    font-size: 0.95rem;
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
