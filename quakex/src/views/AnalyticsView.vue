<template>
    <div class="analytics-view">
        <AppNavbar />

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
            <ProgressSpinner />
            <p class="loading-text">QuakeX</p>
            <small class="loading-subtext">Preparing Seismic Activity Analysis</small>
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
                                            id="eventsDataTable"
                                            :value="countryData"
                                            :paginator="true"
                                            :rows="10"
                                            :rowsPerPageOptions="[10, 25, 50]"
                                            sortField="time"
                                            :sortOrder="-1"
                                            stripedRows
                                            showGridlines
                                            :exportExplorerCSVFilename="exportExplorerCSVFilename"
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
                                                        @click="exportCountryEventsCSV"
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
                                                id="timelineChart"
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
                                            @click="exportChartPNG('magnitudeChart')"
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
                                            id="magnitudeChart"
                                            type="bar"
                                            :data="magnitudeDistributionData"
                                            :options="magnitudeChartOptions"
                                            class="h-[23rem]"
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
                                        id="countriesDataTable"
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
                                            @click="exportChartPNG('monthlyChart')"
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
                                            id="monthlyChart"
                                            type="line"
                                            :data="globalTimelineData"
                                            :options="globalTimelineOptions"
                                            class="h-[23rem]"
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

                    <!-- TAB 3: CRITICAL EVENTS ANALYTICS -->
                    <TabPanel value="2">
                        <div class="tab-content">
                            <!-- Filter Configuration Card -->
                            <Card class="selector-card">
                                <template #content>
                                    <div class="critical-filters">
                                        <div class="filter-group">
                                            <label class="filter-label">
                                                <AlertOctagon :size="20" fillColor="#ef4444" />
                                                <span
                                                    >Magnitude Threshold: M
                                                    {{ criticalThreshold.toFixed(1) }}</span
                                                >
                                            </label>
                                            <Slider
                                                v-model="criticalThreshold"
                                                :min="4.5"
                                                :max="7.0"
                                                :step="0.1"
                                                class="threshold-slider"
                                            />
                                            <div class="slider-labels">
                                                <span>M 4.5</span>
                                                <span>M 7.0</span>
                                            </div>
                                            <small class="filter-hint"
                                                >{{ criticalEvents.length }} critical events
                                                found</small
                                            >
                                        </div>
                                    </div>
                                </template>
                            </Card>

                            <!-- Critical KPI Cards -->
                            <div class="kpi-grid">
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
                                                <span class="kpi-value">{{
                                                    criticalStats.total_events || 0
                                                }}</span>
                                                <span class="kpi-label">Critical Events</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>

                                <Card class="kpi-card">
                                    <template #content>
                                        <div class="kpi-content">
                                            <div class="kpi-icon">
                                                <ChartLineVariant :size="50" fillColor="#3b82f6" />
                                            </div>
                                            <div class="kpi-details">
                                                <span class="kpi-value"
                                                    >M
                                                    {{ criticalStats.avg_magnitude || '0.0' }}</span
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
                                                <AlertOctagon :size="50" fillColor="#dc2626" />
                                            </div>
                                            <div class="kpi-details">
                                                <span class="kpi-value"
                                                    >M
                                                    {{ criticalStats.max_magnitude || '0.0' }}</span
                                                >
                                                <span class="kpi-label">Maximum</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>

                                <Card class="kpi-card">
                                    <template #content>
                                        <div class="kpi-content">
                                            <div class="kpi-icon">
                                                <WavesArrowUp :size="50" fillColor="#0ea5e9" />
                                            </div>
                                            <div class="kpi-details">
                                                <span class="kpi-value">{{
                                                    criticalStats.tsunami_events || 0
                                                }}</span>
                                                <span class="kpi-label">Tsunami Alerts</span>
                                            </div>
                                        </div>
                                    </template>
                                </Card>
                            </div>

                            <!-- Critical Events Timeline Chart -->
                            <Card class="chart-card">
                                <template #title>
                                    <div class="card-title">
                                        <TrendingUp :size="20" fillColor="#ef4444" />
                                        <span>Critical Events Timeline</span>
                                    </div>
                                    <div class="chart-actions">
                                        <Button
                                            icon="pi pi-image"
                                            label="Export PNG"
                                            @click="exportChartPNG('criticalTimelineChart')"
                                            size="small"
                                            outlined
                                        />
                                    </div>
                                </template>
                                <template #content>
                                    <div class="chart-container">
                                        <Chart
                                            v-if="
                                                criticalTimelineData.datasets &&
                                                criticalTimelineData.datasets.length > 0
                                            "
                                            id="criticalTimelineChart"
                                            type="scatter"
                                            :data="criticalTimelineData"
                                            :options="criticalTimelineOptions"
                                            class="h-[25rem]"
                                        />
                                        <div v-else class="empty-state">
                                            <AlertOctagon :size="48" fillColor="#94a3b8" />
                                            <p>No critical events found for this threshold</p>
                                        </div>
                                    </div>
                                    <div class="chart-footer-note">
                                        <InformationOutline :size="16" />
                                        <span
                                            >Each point represents a critical event. Color indicates
                                            magnitude intensity.</span
                                        >
                                    </div>
                                </template>
                            </Card>

                            <!-- Critical Events Table -->
                            <Card class="data-card">
                                <template #title>
                                    <div class="card-title">
                                        <TableLarge :size="20" fillColor="#ef4444" />
                                        <span>Critical Events Log</span>
                                    </div>
                                </template>
                                <template #content>
                                    <DataTable
                                        :value="criticalEvents"
                                        :paginator="true"
                                        :rows="10"
                                        :rowsPerPageOptions="[10, 25, 50]"
                                        sortField="time"
                                        :sortOrder="-1"
                                        stripedRows
                                        showGridlines
                                        class="events-table"
                                    >
                                        <template #header>
                                            <div class="table-header">
                                                <span class="table-description"
                                                    >Earthquakes with magnitude ≥
                                                    {{ criticalThreshold.toFixed(1) }}</span
                                                >
                                                <Button
                                                    icon="pi pi-download"
                                                    label="Export CSV"
                                                    @click="exportCriticalEventsCSV"
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
                                                    :value="'M ' + data.magnitude"
                                                    :severity="getMagnitudeSeverity(data.magnitude)"
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
                                                {{ data.depth?.toFixed(1) || 'N/A' }} km
                                            </template>
                                        </Column>
                                        <Column
                                            field="place"
                                            header="Location"
                                            style="min-width: 250px"
                                        >
                                            <template #body="{ data }">
                                                {{ data.place || 'Unknown' }}
                                            </template>
                                        </Column>
                                        <Column
                                            field="tsunami"
                                            header="Tsunami"
                                            sortable
                                            style="width: 100px"
                                        >
                                            <template #body="{ data }">
                                                <Tag
                                                    v-if="data.tsunami === 1"
                                                    value="Yes"
                                                    severity="danger"
                                                    icon="pi pi-exclamation-triangle"
                                                />
                                                <Tag
                                                    v-if="data.tsunami === 0"
                                                    value="No"
                                                    severity="success"
                                                    icon="pi pi-check-circle"
                                                />
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
                                        <InformationOutline :size="16" />
                                        <span
                                            >Events are sorted by date (most recent first). Click
                                            column headers to sort by different criteria.</span
                                        >
                                    </div>
                                </template>
                            </Card>

                            <!-- Depth vs Magnitude Scatter Chart -->
                            <Card class="chart-card">
                                <template #title>
                                    <div class="card-title">
                                        <ChartScatterPlot :size="20" fillColor="#3b82f6" />
                                        <span>Depth vs Magnitude Analysis</span>
                                    </div>
                                    <div class="chart-actions">
                                        <Button
                                            icon="pi pi-image"
                                            label="Export PNG"
                                            @click="exportChartPNG('depthMagnitudeChart')"
                                            size="small"
                                            outlined
                                        />
                                    </div>
                                </template>
                                <template #content>
                                    <div class="chart-container chart-fixed-height">
                                        <Chart
                                            v-if="
                                                depthMagnitudeData.datasets &&
                                                depthMagnitudeData.datasets.length > 0
                                            "
                                            id="depthMagnitudeChart"
                                            type="scatter"
                                            :data="depthMagnitudeData"
                                            :options="depthMagnitudeOptions"
                                            class="h-[25rem]"
                                        />
                                        <div v-else class="empty-state">
                                            <p>No data available for analysis</p>
                                        </div>
                                    </div>
                                    <div class="chart-footer-note">
                                        <InformationOutline :size="16" />
                                        <span
                                            >Explores the relationship between earthquake depth and
                                            magnitude. Most seismic activity occurs at shallow
                                            depths.</span
                                        >
                                    </div>
                                </template>
                            </Card>

                            <!-- Depth Distribution Chart -->
                            <Card class="chart-card">
                                <template #title>
                                    <div class="card-title">
                                        <ArrowCollapseDown :size="20" fillColor="#3b82f6" />
                                        <span>Depth Distribution</span>
                                    </div>
                                    <div class="chart-actions">
                                        <Button
                                            icon="pi pi-image"
                                            label="Export PNG"
                                            @click="exportChartPNG('depthDistributionChart')"
                                            size="small"
                                            outlined
                                        />
                                    </div>
                                </template>
                                <template #content>
                                    <div class="chart-container chart-fixed-height">
                                        <Chart
                                            v-if="
                                                depthDistributionData.labels &&
                                                depthDistributionData.labels.length > 0
                                            "
                                            id="depthDistributionChart"
                                            type="bar"
                                            :data="depthDistributionData"
                                            :options="depthDistributionOptions"
                                            class="h-[25rem]"
                                        />
                                        <div v-else class="empty-state">
                                            <p>No data available</p>
                                        </div>
                                    </div>
                                    <div class="chart-footer-note">
                                        <InformationOutline :size="16" />
                                        <span
                                            >Distribution by depth category. Shallow earthquakes
                                            (0-70km) are more common and potentially more
                                            damaging.</span
                                        >
                                    </div>
                                </template>
                            </Card>

                            <!-- Hourly Distribution Chart -->
                            <Card class="chart-card">
                                <template #title>
                                    <div class="card-title">
                                        <ClockTimeEight :size="20" fillColor="#3b82f6" />
                                        <span>Hourly Distribution</span>
                                    </div>
                                    <div class="chart-actions">
                                        <Button
                                            icon="pi pi-image"
                                            label="Export PNG"
                                            @click="exportChartPNG('hourlyDistributionChart')"
                                            size="small"
                                            outlined
                                        />
                                    </div>
                                </template>
                                <template #content>
                                    <div class="chart-container chart-fixed-height">
                                        <Chart
                                            v-if="
                                                hourlyDistributionData.labels &&
                                                hourlyDistributionData.labels.length > 0
                                            "
                                            id="hourlyDistributionChart"
                                            type="bar"
                                            :data="hourlyDistributionData"
                                            :options="hourlyDistributionOptions"
                                            class="h-[25rem]"
                                        />
                                        <div v-else class="empty-state">
                                            <p>No data available</p>
                                        </div>
                                    </div>
                                    <div class="chart-footer-note">
                                        <InformationOutline :size="16" />
                                        <span
                                            >Events by hour of day (UTC). Note: Earthquakes occur
                                            randomly; no correlation with time of day.</span
                                        >
                                    </div>
                                </template>
                            </Card>
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
    getCriticalEvents,
    getDepthDistribution,
    getHourlyDistribution,
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
import ChartScatterPlot from 'vue-material-design-icons/ChartScatterPlot.vue'
import WavesArrowUp from 'vue-material-design-icons/WavesArrowUp.vue'
import ClockTimeEight from 'vue-material-design-icons/ClockTimeEight.vue'

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

// Critical Events Tab Data
const criticalThreshold = ref(5.0)
const allEarthquakes = ref([]) // All events loaded from global data
const depthDistributionData_raw = ref([])
const hourlyDistributionData_raw = ref([])

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
const exportExplorerCSVFilename = computed(() => {
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
                minBarLength: 2,
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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
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
 * Computed: Critical events filtered by threshold
 */
const criticalEvents = computed(() => {
    if (!allEarthquakes.value || allEarthquakes.value.length === 0) {
        return []
    }
    return allEarthquakes.value.filter((event) => event.magnitude >= criticalThreshold.value)
})

/**
 * Computed: Critical events statistics
 */
const criticalStats = computed(() => {
    if (criticalEvents.value.length === 0) {
        return {
            total_events: 0,
            avg_magnitude: '0.0',
            max_magnitude: '0.0',
            tsunami_events: 0,
        }
    }

    const total = criticalEvents.value.length
    const avgMag =
        criticalEvents.value.reduce((sum, event) => sum + (event.magnitude || 0), 0) / total
    const maxMag = Math.max(...criticalEvents.value.map((e) => e.magnitude || 0))
    const tsunamiCount = criticalEvents.value.filter((e) => e.tsunami === 1).length

    return {
        total_events: total,
        avg_magnitude: avgMag.toFixed(1),
        max_magnitude: maxMag.toFixed(1),
        tsunami_events: tsunamiCount,
    }
})

/**
 * Computed: Critical events timeline scatter chart data
 */
const criticalTimelineData = computed(() => {
    if (criticalEvents.value.length === 0) {
        return { datasets: [] }
    }

    // Group by magnitude ranges for different colors
    const ranges = [
        { min: 7.0, max: 10, label: 'M ≥ 7.0', color: '#991b1b' },
        { min: 6.0, max: 6.9, label: 'M 6.0 - 6.9', color: '#ef4444' },
        { min: 5.0, max: 5.9, label: 'M 5.0 - 5.9', color: '#f59e0b' },
        { min: 4.5, max: 4.9, label: 'M 4.5 - 4.9', color: '#3b82f6' },
    ]

    const datasets = ranges.map((range) => {
        const events = criticalEvents.value.filter(
            (e) => e.magnitude >= range.min && e.magnitude <= range.max,
        )

        const data = events.map((event) => {
            // Parse ISO date string to Date object then to timestamp
            const date = new Date(event.time)
            return {
                x: date.getTime(), // Timestamp in milliseconds
                y: event.magnitude,
                label: `${event.place} - ${date.toLocaleDateString()}`,
            }
        })

        return {
            label: range.label,
            data,
            backgroundColor: range.color,
            borderColor: range.color,
            pointRadius: 6,
            pointHoverRadius: 8,
        }
    })

    return { datasets: datasets.filter((d) => d.data.length > 0) }
})

/**
 * Computed: Critical events timeline options
 */
const criticalTimelineOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const date = new Date(context.parsed.x)
                    const dateStr = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                        timeZoneName: 'short',
                    })
                    return `M ${context.parsed.y.toFixed(1)} on ${dateStr}`
                },
            },
        },
    },
    scales: {
        x: {
            type: 'linear',
            title: {
                display: true,
                text: 'Date',
            },
            ticks: {
                callback: function (value) {
                    const date = new Date(value)
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                },
                maxTicksLimit: 10,
            },
        },
        y: {
            title: {
                display: true,
                text: 'Magnitude',
            },
            beginAtZero: false,
        },
    },
}))

/**
 * Computed: Depth vs Magnitude scatter data
 */
const depthMagnitudeData = computed(() => {
    if (criticalEvents.value.length === 0) {
        return { datasets: [] }
    }

    const data = criticalEvents.value.map((event) => ({
        x: event.depth || 0,
        y: event.magnitude,
    }))

    return {
        datasets: [
            {
                label: 'Critical Events',
                data,
                backgroundColor: (context) => {
                    const mag = context.raw.y
                    return getMagnitudeColor(mag)
                },
                borderColor: 'rgba(0, 0, 0, 0.2)',
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    }
})

/**
 * Computed: Depth vs Magnitude options
 */
const depthMagnitudeOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    return `M ${context.parsed.y.toFixed(1)} at ${context.parsed.x.toFixed(1)} km depth`
                },
            },
        },
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Depth (km)',
            },
            beginAtZero: true,
        },
        y: {
            title: {
                display: true,
                text: 'Magnitude',
            },
            beginAtZero: false,
        },
    },
}))

/**
 * Computed: Depth Distribution chart data
 */
const depthDistributionData = computed(() => {
    if (!depthDistributionData_raw.value || depthDistributionData_raw.value.length === 0) {
        return { labels: [], datasets: [] }
    }

    const labels = depthDistributionData_raw.value.map((item) => item.depth_category)
    const data = depthDistributionData_raw.value.map((item) => item.count)
    const percentages = depthDistributionData_raw.value.map((item) => item.percentage)

    return {
        labels,
        datasets: [
            {
                label: 'Number of Events',
                data,
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderColor: ['#2563eb', '#059669', '#d97706'],
                borderWidth: 1,
            },
        ],
    }
})

/**
 * Computed: Depth Distribution options
 */
const depthDistributionOptions = computed(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const index = context.dataIndex
                    const percentage = depthDistributionData_raw.value[index]?.percentage || 0
                    return `Events: ${context.parsed.x} (${percentage}%)`
                },
            },
        },
    },
    scales: {
        x: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Events',
            },
        },
        y: {
            title: {
                display: false,
            },
        },
    },
}))

/**
 * Computed: Hourly Distribution chart data
 */
const hourlyDistributionData = computed(() => {
    if (!hourlyDistributionData_raw.value || hourlyDistributionData_raw.value.length === 0) {
        return { labels: [], datasets: [] }
    }

    const labels = hourlyDistributionData_raw.value.map(
        (item) => String(item.hour).padStart(2, '0') + ':00',
    )
    const data = hourlyDistributionData_raw.value.map((item) => item.count)

    return {
        labels,
        datasets: [
            {
                label: 'Number of Events',
                data,
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1,
            },
        ],
    }
})

/**
 * Computed: Hourly Distribution options
 */
const hourlyDistributionOptions = computed(() => ({
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
        x: {
            title: {
                display: true,
                text: 'Hour (UTC)',
            },
        },
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Events',
            },
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

        // Load all earthquakes for Critical Events tab
        await loadCriticalEventsData()
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
 * Load all earthquakes for critical events analysis
 */
async function loadCriticalEventsData() {
    try {
        // Load all earthquakes and additional distribution data in parallel
        const [earthquakes, depthDist, hourlyDist] = await Promise.all([
            getCriticalEvents(months.value, 5000),
            getDepthDistribution(months.value),
            getHourlyDistribution(months.value),
        ])

        if (earthquakes) {
            allEarthquakes.value = earthquakes
            console.log(
                `[AnalyticsView] Loaded ${earthquakes.length} earthquakes for critical analysis`,
            )
        }

        if (depthDist) {
            depthDistributionData_raw.value = depthDist
        }

        if (hourlyDist) {
            hourlyDistributionData_raw.value = hourlyDist
        }
    } catch (err) {
        console.error('Failed to load critical events data:', err)
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
 * Export country events table from explorer tab to CSV
 */
function exportCountryEventsCSV() {
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
    link.setAttribute('download', `QuakeX_${exportExplorerCSVFilename.value}.csv`)
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
    const timestamp = new Date().toISOString().slice(0, 10)
    link.setAttribute('href', url)
    link.setAttribute('download', `QuakeX_top_active_countries_${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Export Critical Events table to CSV
 */
function exportCriticalEventsCSV() {
    if (!criticalEvents.value || criticalEvents.value.length === 0) {
        console.warn('No critical events to export')
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
        'Latitude',
        'Longitude',
        'Tsunami Alert',
        'USGS URL',
    ]
    const rows = criticalEvents.value.map((event) => [
        formatDate(event.time),
        event.magnitude,
        event.depth?.toFixed(1) || 'N/A',
        `"${event.place || 'Unknown'}"`,
        event.latitude?.toFixed(4) || '',
        event.longitude?.toFixed(4) || '',
        event.tsunami || 0,
        event.url || '',
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().slice(0, 10)
    link.setAttribute('href', url)
    link.setAttribute(
        'download',
        `QuakeX_critical_events_M${criticalThreshold.value}_${timestamp}.csv`,
    )
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
function exportChartPNG(chartId) {
    setTimeout(() => {
        let canvas = null
        const chartComponent = document.getElementById(chartId)
        if (chartComponent) {
            canvas = chartComponent.querySelector('canvas')
        }

        if (!canvas) {
            console.warn('Canvas not found for chart:', chartId)
            return
        }

        if (typeof canvas.toDataURL !== 'function') {
            console.warn('canvas.toDataURL is not a function. Canvas element:', canvas)
            return
        }

        try {
            const url = canvas.toDataURL('image/png')
            const link = document.createElement('a')
            const timestamp = new Date().toISOString().slice(0, 10)
            link.download = `QuakeX_${chartId}_${timestamp}.png`
            link.href = url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Error exporting chart:', err)
        }
    }, 100)
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/**
 * Format month label (YYYY-MM to "Aug 2025")
 */
function formatMonthLabel(monthString) {
    if (!monthString) return ''
    const [year, month] = monthString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
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
    margin-top: 5px;
    background: var(--surface-50);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Chart */
.chart-container {
    height: 400px;
    margin-bottom: 1rem;
    column-gap: 1rem;
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

/* Critical Events Tab Specific Styles */
.critical-filters {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.filter-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--text-color);
    font-size: 1rem;
}

.threshold-slider {
    width: 100%;
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: var(--text-color-secondary);
    margin-top: -0.5rem;
}

.filter-hint {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

.chart-fixed-height {
    height: 400px;
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
