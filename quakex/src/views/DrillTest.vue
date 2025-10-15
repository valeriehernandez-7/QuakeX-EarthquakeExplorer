<!-- src/views/DrillTest.vue - UPDATED VERSION -->
<template>
    <div class="drill-test">
        <!-- Header Card -->
        <Card class="header-card">
            <template #title>
                <div class="header-title">
                    <i class="pi pi-server" style="font-size: 1.5rem; margin-right: 0.5rem"></i>
                    Apache Drill Integration Test
                </div>
            </template>
            <template #subtitle>
                Testing TIME_PERIODS-based workflow with zero deprecated functions
            </template>
        </Card>

        <!-- Loading State -->
        <Card v-if="loading" class="test-card">
            <template #content>
                <div class="loading">
                    <ProgressSpinner />
                    <p>Running comprehensive integration tests...</p>
                    <small>This may take 30-60 seconds</small>
                </div>
            </template>
        </Card>

        <!-- Test Results -->
        <div v-else class="results-container">
            <!-- Summary Card -->
            <Card class="summary-card">
                <template #title>Test Summary</template>
                <template #content>
                    <div class="summary-stats">
                        <div
                            class="stat-item"
                            :class="{ success: allTestsPassed, warning: !allTestsPassed }"
                        >
                            <i
                                :class="
                                    allTestsPassed
                                        ? 'pi pi-check-circle'
                                        : 'pi pi-exclamation-triangle'
                                "
                            ></i>
                            <div class="stat-content">
                                <span class="stat-value">{{ passedTests }}/{{ totalTests }}</span>
                                <span class="stat-label">Tests Passed</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="pi pi-percentage"></i>
                            <div class="stat-content">
                                <span class="stat-value">{{ passRate }}%</span>
                                <span class="stat-label">Pass Rate</span>
                            </div>
                        </div>
                        <div class="stat-item">
                            <i class="pi pi-clock"></i>
                            <div class="stat-content">
                                <span class="stat-value">{{ testDuration }}s</span>
                                <span class="stat-label">Duration</span>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Core Drill Tests -->
            <Card class="test-card">
                <template #title>
                    <div class="section-header">
                        <i class="pi pi-database"></i>
                        Drill Core Tests
                    </div>
                </template>
                <template #content>
                    <div class="test-grid">
                        <div
                            v-for="test in coreTests"
                            :key="test.key"
                            class="test-result"
                            :class="{
                                passed: testResults[test.key],
                                failed: !testResults[test.key],
                            }"
                        >
                            <div class="test-status">
                                <Tag
                                    :severity="testResults[test.key] ? 'success' : 'danger'"
                                    :rounded="true"
                                >
                                    {{ testResults[test.key] ? 'PASS' : 'FAIL' }}
                                </Tag>
                            </div>
                            <div class="test-info">
                                <span class="test-name">{{ test.name }}</span>
                                <small class="test-description">{{ test.description }}</small>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Service Integration Tests -->
            <Card class="test-card">
                <template #title>
                    <div class="section-header">
                        <i class="pi pi-link"></i>
                        Service Integration Tests
                    </div>
                </template>
                <template #content>
                    <div class="test-grid">
                        <div
                            v-for="test in integrationTests"
                            :key="test.key"
                            class="test-result"
                            :class="{
                                passed: testResults[test.key],
                                failed: !testResults[test.key],
                            }"
                        >
                            <div class="test-status">
                                <Tag
                                    :severity="testResults[test.key] ? 'success' : 'danger'"
                                    :rounded="true"
                                >
                                    {{ testResults[test.key] ? 'PASS' : 'FAIL' }}
                                </Tag>
                            </div>
                            <div class="test-info">
                                <span class="test-name">{{ test.name }}</span>
                                <small class="test-description">{{ test.description }}</small>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Period-based Analytics Tests -->
            <Card class="test-card">
                <template #title>
                    <div class="section-header">
                        <i class="pi pi-chart-line"></i>
                        Period-based Analytics Tests
                    </div>
                </template>
                <template #content>
                    <div class="test-grid">
                        <div
                            v-for="test in analyticsTests"
                            :key="test.key"
                            class="test-result"
                            :class="{
                                passed: testResults[test.key],
                                failed: !testResults[test.key],
                            }"
                        >
                            <div class="test-status">
                                <Tag
                                    :severity="testResults[test.key] ? 'success' : 'danger'"
                                    :rounded="true"
                                >
                                    {{ testResults[test.key] ? 'PASS' : 'FAIL' }}
                                </Tag>
                            </div>
                            <div class="test-info">
                                <span class="test-name">{{ test.name }}</span>
                                <small class="test-description">{{ test.description }}</small>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Statistics Display (if available) -->
            <Card v-if="earthquakeStats" class="stats-card">
                <template #title>
                    <div class="section-header">
                        <i class="pi pi-chart-bar"></i>
                        Earthquake Statistics (Last Week)
                    </div>
                </template>
                <template #content>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <i class="pi pi-list"></i>
                            <span class="stat-value">{{ earthquakeStats.total_earthquakes }}</span>
                            <span class="stat-label">Total Earthquakes</span>
                        </div>
                        <div class="stat-box">
                            <i class="pi pi-bolt"></i>
                            <span class="stat-value">{{ earthquakeStats.avg_magnitude }}</span>
                            <span class="stat-label">Avg Magnitude</span>
                        </div>
                        <div class="stat-box">
                            <i class="pi pi-exclamation-triangle"></i>
                            <span class="stat-value">{{ earthquakeStats.max_magnitude }}</span>
                            <span class="stat-label">Max Magnitude</span>
                        </div>
                        <div class="stat-box">
                            <i class="pi pi-arrow-down"></i>
                            <span class="stat-value">{{ earthquakeStats.avg_depth_km }}km</span>
                            <span class="stat-label">Avg Depth</span>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Action Buttons -->
            <Card class="actions-card">
                <template #title>Quick Actions</template>
                <template #content>
                    <div class="action-buttons">
                        <Button
                            label="Test Basic Query"
                            icon="pi pi-database"
                            @click="testBasicQuery"
                            severity="secondary"
                            outlined
                        />
                        <Button
                            label="List Tables"
                            icon="pi pi-table"
                            @click="listTables"
                            severity="secondary"
                            outlined
                        />
                        <Button
                            label="Fetch Countries"
                            icon="pi pi-flag"
                            @click="fetchCountriesData"
                            severity="info"
                            outlined
                        />
                        <Button
                            label="Fetch Earthquakes"
                            icon="pi pi-globe"
                            @click="fetchEarthquakesData"
                            severity="warning"
                            outlined
                        />
                        <Button
                            label="Query Period Data"
                            icon="pi pi-calendar"
                            @click="queryPeriodData"
                            severity="success"
                            outlined
                        />
                    </div>

                    <Divider />

                    <div class="control-buttons">
                        <Button
                            label="Run Tests Again"
                            icon="pi pi-refresh"
                            @click="runTests"
                            class="retry-button"
                            :loading="loading"
                        />
                        <Button
                            label="Run Smoke Test"
                            icon="pi pi-bolt"
                            @click="runSmokeTest"
                            severity="secondary"
                            :loading="loading"
                        />
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
    runDrillIntegrationTest,
    testServiceIntegrations,
    quickSmokeTest,
} from '@/services/drillTest.js'
import {
    executeQuery,
    listAvailableTables,
    getFilteredEarthquakesByPeriod,
    getStatisticsForPeriod,
} from '@/services/drillService.js'
import { fetchAllCountries } from '@/services/countriesService.js'
import { fetchEarthquakesForPeriod } from '@/services/usgsService.js'

// State
const loading = ref(false)
const testResults = ref({})
const earthquakeStats = ref(null)
const testStartTime = ref(0)
const testEndTime = ref(0)

// Test definitions
const coreTests = [
    {
        key: 'drillConnection',
        name: 'Drill Connection',
        description: 'Test Apache Drill connectivity',
    },
    { key: 'basicQuery', name: 'Basic Query', description: 'Execute simple SQL query' },
    { key: 'tableListing', name: 'Table Listing', description: 'List available tables' },
    { key: 'schemaQuery', name: 'Schema Query', description: 'Retrieve table schema' },
    { key: 'sampleDataQuery', name: 'Sample Data Query', description: 'Query sample earthquakes' },
]

const integrationTests = [
    {
        key: 'countriesIntegration',
        name: 'Countries Integration',
        description: 'Fetch and save countries data',
    },
    {
        key: 'earthquakesIntegration',
        name: 'Earthquakes Integration',
        description: 'USGS → Drill pipeline',
    },
]

const analyticsTests = [
    { key: 'periodStatistics', name: 'Period Statistics', description: 'Statistical aggregations' },
    {
        key: 'periodDistributions',
        name: 'Period Distributions',
        description: 'Magnitude, depth, temporal',
    },
]

// Computed properties
const totalTests = computed(() => Object.keys(testResults.value).length)

const passedTests = computed(() => {
    return Object.values(testResults.value).filter((result) => result === true).length
})

const allTestsPassed = computed(() => passedTests.value === totalTests.value)

const passRate = computed(() => {
    if (totalTests.value === 0) return 0
    return Math.round((passedTests.value / totalTests.value) * 100)
})

const testDuration = computed(() => {
    if (testEndTime.value === 0) return 0
    return ((testEndTime.value - testStartTime.value) / 1000).toFixed(1)
})

// Methods
const runTests = async () => {
    loading.value = true
    testStartTime.value = Date.now()
    earthquakeStats.value = null

    try {
        console.log('Starting comprehensive Drill integration tests...')

        // Run main test suite
        const results = await runDrillIntegrationTest()
        testResults.value = results

        // Run additional service tests
        const serviceResults = await testServiceIntegrations()
        Object.assign(testResults.value, serviceResults)

        // Try to get earthquake statistics
        try {
            const stats = await getStatisticsForPeriod('LAST_WEEK')
            if (stats) {
                earthquakeStats.value = stats
                console.log('Earthquake statistics loaded:', stats)
            }
        } catch (error) {
            console.warn('Could not load earthquake statistics:', error.message)
        }

        console.log('All tests completed!')
        console.log('Results:', testResults.value)
    } catch (error) {
        console.error('Test execution failed:', error)
    } finally {
        testEndTime.value = Date.now()
        loading.value = false
    }
}

const runSmokeTest = async () => {
    loading.value = true
    testStartTime.value = Date.now()

    try {
        console.log('Running quick smoke test...')
        const passed = await quickSmokeTest()

        if (passed) {
            console.log('✓ Smoke test passed!')
            alert('✓ Quick smoke test passed! Drill is operational.')
        } else {
            console.error('✗ Smoke test failed!')
            alert('✗ Smoke test failed. Check console for details.')
        }
    } catch (error) {
        console.error('Smoke test error:', error)
        alert('✗ Smoke test error: ' + error.message)
    } finally {
        testEndTime.value = Date.now()
        loading.value = false
    }
}

const testBasicQuery = async () => {
    try {
        console.log('Testing basic query...')
        const result = await executeQuery(
            'SELECT 1 as test_value, CURRENT_TIMESTAMP as current_time',
        )
        console.log('✓ Basic query result:', result.rows[0])
        alert('✓ Basic query successful! Check console for result.')
    } catch (error) {
        console.error('✗ Basic query failed:', error)
        alert('✗ Query failed: ' + error.message)
    }
}

const listTables = async () => {
    try {
        console.log('Listing available tables...')
        const tables = await listAvailableTables()
        console.log(`✓ Found ${tables.length} tables:`, tables)
        alert(`✓ Found ${tables.length} tables. Check console for list.`)
    } catch (error) {
        console.error('✗ Table listing failed:', error)
        alert('✗ Listing failed: ' + error.message)
    }
}

const fetchCountriesData = async () => {
    try {
        console.log('Fetching countries...')
        const countries = await fetchAllCountries()
        console.log(`✓ Fetched ${countries.length} countries`)
        console.log('Sample country:', countries[0])
        alert(`✓ Fetched ${countries.length} countries. Check console for details.`)
    } catch (error) {
        console.error('✗ Countries fetch failed:', error)
        alert('✗ Fetch failed: ' + error.message)
    }
}

const fetchEarthquakesData = async () => {
    try {
        console.log('Fetching earthquakes for LAST_WEEK...')
        const earthquakes = await fetchEarthquakesForPeriod('LAST_WEEK', {
            saveForDrill: true,
            minMagnitude: 2.5,
        })
        console.log(`✓ Fetched ${earthquakes.length} earthquakes`)
        console.log('Sample earthquake:', earthquakes[0])
        alert(`✓ Fetched ${earthquakes.length} earthquakes. Saved as earthquakes_last_week.json`)
    } catch (error) {
        console.error('✗ Earthquakes fetch failed:', error)
        alert('✗ Fetch failed: ' + error.message)
    }
}

const queryPeriodData = async () => {
    try {
        console.log('Querying period data (LAST_WEEK, M >= 5.0)...')
        const filtered = await getFilteredEarthquakesByPeriod({
            timePeriod: 'LAST_WEEK',
            minMagnitude: 5.0,
        })

        if (filtered && filtered.length > 0) {
            console.log(`✓ Found ${filtered.length} strong earthquakes (M >= 5.0)`)
            console.log('Strongest earthquake:', filtered[0])
            alert(`✓ Found ${filtered.length} earthquakes M >= 5.0. Check console.`)
        } else {
            console.log('No earthquakes found matching criteria')
            alert('No earthquakes found with M >= 5.0 in LAST_WEEK')
        }
    } catch (error) {
        console.error('✗ Period query failed:', error)
        alert('✗ Query failed: ' + error.message)
    }
}

// Run tests on mount
onMounted(() => {
    runTests()
})
</script>

<style scoped>
.drill-test {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.header-card {
    margin-bottom: 1.5rem;
}

.header-title {
    display: flex;
    align-items: center;
    color: var(--primary-color);
}

/* Loading State */
.loading {
    text-align: center;
    padding: 3rem;
}

.loading p {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: var(--text-color);
}

.loading small {
    color: var(--text-color-secondary);
}

/* Summary Card */
.summary-card {
    margin-bottom: 1.5rem;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface-50);
    border-radius: 8px;
    border-left: 4px solid var(--primary-color);
}

.stat-item.success {
    border-left-color: var(--green-500);
}

.stat-item.warning {
    border-left-color: var(--orange-500);
}

.stat-item i {
    font-size: 2rem;
    color: var(--primary-color);
}

.stat-item.success i {
    color: var(--green-500);
}

.stat-item.warning i {
    color: var(--orange-500);
}

.stat-content {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Test Cards */
.test-card,
.stats-card,
.actions-card {
    margin-bottom: 1.5rem;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-header i {
    color: var(--primary-color);
}

/* Test Grid */
.test-grid {
    display: grid;
    gap: 0.75rem;
}

.test-result {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--surface-50);
    border-radius: 6px;
    border-left: 4px solid transparent;
    transition: all 0.2s;
}

.test-result.passed {
    border-left-color: var(--green-500);
}

.test-result.failed {
    border-left-color: var(--red-500);
}

.test-result:hover {
    background: var(--surface-100);
    transform: translateX(2px);
}

.test-status {
    flex-shrink: 0;
}

.test-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
}

.test-name {
    font-weight: 600;
    color: var(--text-color);
}

.test-description {
    color: var(--text-color-secondary);
    font-size: 0.875rem;
}

/* Statistics Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: var(--surface-50);
    border-radius: 8px;
    text-align: center;
}

.stat-box i {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.stat-box .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color);
    margin-bottom: 0.25rem;
}

.stat-box .stat-label {
    font-size: 0.875rem;
    color: var(--text-color-secondary);
}

/* Action Buttons */
.action-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.control-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    margin-top: 1rem;
}

.retry-button {
    min-width: 200px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .drill-test {
        padding: 1rem;
    }

    .summary-stats {
        grid-template-columns: 1fr;
    }

    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .action-buttons {
        flex-direction: column;
    }

    .control-buttons {
        flex-direction: column;
    }

    .retry-button {
        width: 100%;
    }
}
</style>
