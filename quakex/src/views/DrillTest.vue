<!-- src/views/DrillTest.vue -->
<template>
    <div class="drill-test">
        <Card class="test-card">
            <template #title>Apache Drill Integration Test</template>
            <template #content>
                <div v-if="loading" class="loading">
                    <ProgressSpinner />
                    <p>Running integration tests...</p>
                </div>

                <div v-else class="results">
                    <div class="test-section">
                        <h3>Drill Core Tests</h3>
                        <div v-for="(result, test) in drillResults" :key="test" class="test-result">
                            <Tag :severity="result ? 'success' : 'danger'">
                                {{ result ? 'PASS' : 'FAIL' }}
                            </Tag>
                            <span class="test-name">{{ formatTestName(test) }}</span>
                        </div>
                    </div>

                    <div class="test-section">
                        <h3>Service Integration Tests</h3>
                        <div
                            v-for="(result, service) in integrationResults"
                            :key="service"
                            class="test-result"
                        >
                            <Tag :severity="result ? 'success' : 'danger'">
                                {{ result ? 'PASS' : 'FAIL' }}
                            </Tag>
                            <span class="test-name">{{ formatServiceName(service) }}</span>
                        </div>
                    </div>

                    <Button
                        label="Run Tests Again"
                        icon="pi pi-refresh"
                        @click="runTests"
                        class="retry-button"
                    />
                </div>
            </template>
        </Card>

        <Card class="actions-card" v-if="!loading">
            <template #title>Quick Actions</template>
            <template #content>
                <div class="action-buttons">
                    <Button
                        label="Test Basic Query"
                        icon="pi pi-database"
                        @click="testBasicQuery"
                        severity="secondary"
                    />
                    <Button
                        label="List Tables"
                        icon="pi pi-table"
                        @click="listTables"
                        severity="secondary"
                    />
                    <Button
                        label="Fetch Countries"
                        icon="pi pi-flag"
                        @click="fetchCountriesData"
                        severity="secondary"
                    />
                    <Button
                        label="Fetch Earthquakes"
                        icon="pi pi-globe"
                        @click="fetchEarthquakesData"
                        severity="secondary"
                    />
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { runDrillIntegrationTest, testServiceIntegrations } from '@/services/drillTest.js'
import { executeQuery, listAvailableTables } from '@/services/drillService.js'
import { fetchAllCountries } from '@/services/countriesService.js'
import { fetchEarthquakes } from '@/services/usgsService.js'

const loading = ref(false)
const drillResults = ref({})
const integrationResults = ref({})

const runTests = async () => {
    loading.value = true
    try {
        drillResults.value = await runDrillIntegrationTest()
        integrationResults.value = await testServiceIntegrations()
    } catch (error) {
        console.error('Test execution failed:', error)
    } finally {
        loading.value = false
    }
}

const testBasicQuery = async () => {
    try {
        const result = await executeQuery('SELECT 1 as test_value, CURRENT_DATE as today')
        console.log('Basic query result:', result.rows[0])
    } catch (error) {
        console.error('Basic query failed:', error)
    }
}

const listTables = async () => {
    try {
        const tables = await listAvailableTables()
        console.log('Available tables:', tables)
    } catch (error) {
        console.error('Table listing failed:', error)
    }
}

const fetchCountriesData = async () => {
    try {
        const countries = await fetchAllCountries()
        console.log(`Fetched ${countries.length} countries`)
        console.log('First country:', countries[0])
    } catch (error) {
        console.error('Countries fetch failed:', error)
    }
}

const fetchEarthquakesData = async () => {
    try {
        const earthquakes = await fetchEarthquakes({ limit: 5 })
        console.log(`Fetched ${earthquakes.length} earthquakes`)
        console.log('First earthquake:', earthquakes[0])
    } catch (error) {
        console.error('Earthquakes fetch failed:', error)
    }
}

const formatTestName = (test) => {
    return test.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())
}

const formatServiceName = (service) => {
    return service.charAt(0).toUpperCase() + service.slice(1) + ' Service'
}

// Run tests on component mount
runTests()
</script>

<style scoped>
.drill-test {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
}

.test-card,
.actions-card {
    margin-bottom: 2rem;
}

.loading {
    text-align: center;
    padding: 2rem;
}

.test-section {
    margin-bottom: 2rem;
}

.test-section h3 {
    margin-bottom: 1rem;
    color: var(--surface-900);
}

.test-result {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    background: var(--surface-50);
    border-radius: 4px;
}

.test-name {
    font-weight: 500;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.retry-button {
    margin-top: 1rem;
}
</style>
