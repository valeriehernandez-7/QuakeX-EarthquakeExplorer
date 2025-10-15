import {
    testDrillConnection,
    executeQuery,
    listAvailableTables,
    getTableSchema,
    getFilteredEarthquakesByPeriod,
    getStatisticsForPeriod,
    getMagnitudeDistributionForPeriod,
    getDepthDistributionForPeriod,
    getTemporalDistributionForPeriod,
    getStrongestEarthquakesForPeriod,
} from './drillService.js'
import { fetchAllCountries, saveCountriesForDrill } from './countriesService.js'
import { fetchEarthquakesForPeriod } from './usgsService.js'
import { cacheElevationForPeriod } from './elevationService.js'
import { cacheWeatherForPeriod } from './weatherService.js'

/**
 * Comprehensive Drill Service Integration Test
 * Tests all aspects of Apache Drill integration with TIME_PERIODS system
 *
 * All tests use the NEW time period-based functions
 * No legacy/deprecated functions are used
 */

/**
 * Run comprehensive Drill integration tests
 * @returns {Promise<Object>} Test results object
 */
export async function runDrillIntegrationTest() {
    console.log('=== Starting Apache Drill Integration Test ===')
    console.log('Testing TIME_PERIODS-based workflow (no legacy functions)')
    console.log('')

    const testResults = {
        drillConnection: false,
        basicQuery: false,
        tableListing: false,
        schemaQuery: false,
        sampleDataQuery: false,
        countriesIntegration: false,
        earthquakesIntegration: false,
        periodStatistics: false,
        periodDistributions: false,
    }

    try {
        // Test 1: Basic Drill Connection
        console.log('1. Testing Drill connection...')
        testResults.drillConnection = await testDrillConnection()
        console.log(`   ✓ Drill connection: ${testResults.drillConnection ? 'PASS' : 'FAIL'}`)

        if (!testResults.drillConnection) {
            console.error('   ✗ Cannot proceed - Drill connection failed')
            return testResults
        }

        // Test 2: Basic SQL Query
        console.log('\n2. Testing basic SQL query...')
        const basicResult = await executeQuery(
            'SELECT 1 as test_value, CURRENT_TIMESTAMP as current_time',
        )
        testResults.basicQuery = basicResult && basicResult.rows.length > 0
        console.log(`   ✓ Basic query: ${testResults.basicQuery ? 'PASS' : 'FAIL'}`)
        if (testResults.basicQuery) {
            console.log('   → Query result:', basicResult.rows[0])
        }

        // Test 3: List Available Tables
        console.log('\n3. Testing table listing...')
        const tables = await listAvailableTables()
        testResults.tableListing = Array.isArray(tables) && tables.length > 0
        console.log(`   ✓ Table listing: ${testResults.tableListing ? 'PASS' : 'FAIL'}`)
        if (testResults.tableListing) {
            console.log(`   → Found ${tables.length} tables:`, tables)
        }

        // Test 4: Query Schema Information
        console.log('\n4. Testing schema inference...')
        try {
            const schema = await getTableSchema('sample-earthquakes.json')
            testResults.schemaQuery = Array.isArray(schema) && schema.length > 0

            console.log(`   ✓ Schema query: ${testResults.schemaQuery ? 'PASS' : 'FAIL'}`)

            if (testResults.schemaQuery) {
                console.log(`   → Retrieved ${schema.length} columns`)
                console.log(
                    '   → Sample columns:',
                    schema.slice(0, 3).map((col) => col.COLUMN_NAME),
                )
            }
        } catch (error) {
            console.log('   ✗ Schema query: FAIL -', error.message)
            testResults.schemaQuery = false
        }

        // Test 5: Sample Data Query
        console.log('\n5. Testing sample data query...')
        try {
            const sampleQuery = `
                SELECT * 
                FROM dfs.quakex.\`sample-earthquakes.json\`
                LIMIT 5
            `
            const sampleResult = await executeQuery(sampleQuery)
            testResults.sampleDataQuery = sampleResult && sampleResult.rows.length > 0
            console.log(`   ✓ Sample data query: ${testResults.sampleDataQuery ? 'PASS' : 'FAIL'}`)
            if (testResults.sampleDataQuery) {
                console.log(`   → Retrieved ${sampleResult.rows.length} sample earthquakes`)
                const firstEq = sampleResult.rows[0]
                console.log(`   → First sample: M${firstEq.magnitude} at ${firstEq.place}`)
            }
        } catch (error) {
            console.log('   ✗ Sample data query: FAIL -', error.message)
            testResults.sampleDataQuery = false
        }

        // ============================================
        // SERVICE INTEGRATION TESTS
        // ============================================

        // Test 6: Countries Integration
        console.log('\n6. Testing countries integration...')
        try {
            const countries = await fetchAllCountries()
            testResults.countriesIntegration = Array.isArray(countries) && countries.length > 0
            console.log(
                `   ✓ Countries fetch: ${testResults.countriesIntegration ? 'PASS' : 'FAIL'}`,
            )
            if (testResults.countriesIntegration) {
                console.log(`   → Retrieved ${countries.length} countries`)

                // Test saving countries for Drill
                const saved = await saveCountriesForDrill()
                console.log(`   ✓ Countries save for Drill: ${saved ? 'PASS' : 'FAIL'}`)
                if (saved) {
                    console.log('   → File saved: countries.json')
                }
            }
        } catch (error) {
            console.log('   ✗ Countries integration: FAIL -', error.message)
            testResults.countriesIntegration = false
        }

        // Test 7: Earthquakes Integration (TIME_PERIODS-based)
        console.log('\n7. Testing earthquakes integration with TIME_PERIODS...')
        try {
            console.log('   → Fetching earthquakes for LAST_WEEK period...')
            const earthquakes = await fetchEarthquakesForPeriod('LAST_WEEK', {
                saveForDrill: true,
                minMagnitude: 2.5,
            })
            testResults.earthquakesIntegration = Array.isArray(earthquakes)
            console.log(
                `   ✓ Earthquakes fetch: ${testResults.earthquakesIntegration ? 'PASS' : 'FAIL'}`,
            )
            if (testResults.earthquakesIntegration) {
                console.log(`   → Retrieved ${earthquakes.length} earthquakes`)
                console.log('   → File saved: earthquakes_last_week.json')

                if (earthquakes.length > 0) {
                    const sample = earthquakes[0]
                    console.log(`   → Sample: M${sample.magnitude} at ${sample.place}`)
                }
            }
        } catch (error) {
            console.log('   ✗ Earthquakes integration: FAIL -', error.message)
            testResults.earthquakesIntegration = false
        }

        // Test 8: Period-based Statistics
        console.log('\n8. Testing period-based statistics...')
        try {
            const stats = await getStatisticsForPeriod('LAST_WEEK')
            testResults.periodStatistics = stats !== null && stats.total_earthquakes !== undefined
            console.log(`   ✓ Period statistics: ${testResults.periodStatistics ? 'PASS' : 'FAIL'}`)
            if (testResults.periodStatistics) {
                console.log('   → Statistics for LAST_WEEK:')
                console.log(`      • Total: ${stats.total_earthquakes}`)
                console.log(`      • Avg Magnitude: ${stats.avg_magnitude}`)
                console.log(`      • Max Magnitude: ${stats.max_magnitude}`)
                console.log(`      • Avg Depth: ${stats.avg_depth_km} km`)
            }
        } catch (error) {
            console.log('   ✗ Period statistics: FAIL -', error.message)
            testResults.periodStatistics = false
        }

        // Test 9: Period-based Distributions
        console.log('\n9. Testing period-based distributions...')
        try {
            // Test magnitude distribution
            const magDist = await getMagnitudeDistributionForPeriod('LAST_WEEK')
            const depthDist = await getDepthDistributionForPeriod('LAST_WEEK')
            const temporalDist = await getTemporalDistributionForPeriod('LAST_WEEK')

            testResults.periodDistributions =
                magDist !== null && depthDist !== null && temporalDist !== null

            console.log(
                `   ✓ Period distributions: ${testResults.periodDistributions ? 'PASS' : 'FAIL'}`,
            )
            if (testResults.periodDistributions) {
                console.log(`   → Magnitude distribution: ${magDist.length} categories`)
                console.log(`   → Depth distribution: ${depthDist.length} categories`)
                console.log(`   → Temporal distribution: ${temporalDist.length} days`)

                // Show sample magnitude distribution
                if (magDist.length > 0) {
                    console.log('   → Top magnitude category:', {
                        category: magDist[0].category,
                        count: magDist[0].count,
                        percentage: magDist[0].percentage + '%',
                    })
                }
            }
        } catch (error) {
            console.log('   ✗ Period distributions: FAIL -', error.message)
            testResults.periodDistributions = false
        }

        // ============================================
        // ADVANCED ANALYTICS TESTS
        // ============================================

        console.log('\n10. Testing advanced analytics...')

        // Test filtered queries
        if (testResults.earthquakesIntegration) {
            try {
                console.log('   → Testing magnitude filter (M >= 5.0)...')
                const strongEarthquakes = await getFilteredEarthquakesByPeriod({
                    timePeriod: 'LAST_WEEK',
                    minMagnitude: 5.0,
                })

                if (strongEarthquakes) {
                    console.log(`   ✓ Filtered query: PASS (found ${strongEarthquakes.length})`)
                }

                // Test strongest earthquakes
                console.log('   → Testing strongest earthquakes query...')
                const strongest = await getStrongestEarthquakesForPeriod('LAST_WEEK', null, 5)

                if (strongest && strongest.length > 0) {
                    console.log(`   ✓ Strongest query: PASS (top ${strongest.length})`)
                    console.log('   → Strongest earthquake:', {
                        magnitude: strongest[0].magnitude,
                        place: strongest[0].place,
                    })
                }
            } catch (error) {
                console.log('   ✗ Advanced analytics: FAIL -', error.message)
            }
        }

        // ============================================
        // INTEGRATION WORKFLOW TEST
        // ============================================

        console.log('\n11. Testing complete data pipeline...')
        console.log('   → This tests: USGS → Save → Drill Query workflow')

        if (testResults.earthquakesIntegration) {
            try {
                // Step 1: Fetch and save (already done in test 7)
                console.log('   ✓ Step 1: Fetch from USGS and save → COMPLETE')

                // Step 2: Query the saved data
                console.log('   → Step 2: Query saved data with Drill...')
                const queriedData = await getFilteredEarthquakesByPeriod({
                    timePeriod: 'LAST_WEEK',
                    minMagnitude: 4.0,
                })

                if (queriedData) {
                    console.log(
                        `   ✓ Step 2: Query saved data → COMPLETE (${queriedData.length} results)`,
                    )
                    console.log('   ✓ Complete pipeline: PASS')
                } else {
                    console.log('   ✗ Step 2: Query failed')
                }
            } catch (error) {
                console.log('   ✗ Pipeline test: FAIL -', error.message)
            }
        } else {
            console.log('   → Skipped (requires earthquake data)')
        }
    } catch (error) {
        console.error('\n✗ Comprehensive test failed:', error)
    }

    // ============================================
    // TEST RESULTS SUMMARY
    // ============================================

    console.log('\n' + '='.repeat(60))
    console.log('TEST RESULTS SUMMARY')
    console.log('='.repeat(60))

    const categories = {
        'Core Drill Tests': [
            'drillConnection',
            'basicQuery',
            'tableListing',
            'schemaQuery',
            'sampleDataQuery',
        ],
        'Service Integration': ['countriesIntegration', 'earthquakesIntegration'],
        'Period-based Analytics': ['periodStatistics', 'periodDistributions'],
    }

    Object.entries(categories).forEach(([category, tests]) => {
        console.log(`\n${category}:`)
        tests.forEach((test) => {
            const status = testResults[test] ? '✓ PASS' : '✗ FAIL'
            const label = test
                .replace(/([A-Z])/g, ' $1')
                .trim()
                .replace(/^./, (str) => str.toUpperCase())
            console.log(`   ${status} - ${label}`)
        })
    })

    // Calculate pass rate
    const total = Object.keys(testResults).length
    const passed = Object.values(testResults).filter((v) => v === true).length
    const passRate = ((passed / total) * 100).toFixed(0)

    console.log('\n' + '='.repeat(60))
    console.log(`Overall: ${passed}/${total} tests passed (${passRate}%)`)
    console.log('='.repeat(60))

    return testResults
}

/**
 * Test individual service integrations
 * Tests weather and elevation services
 * @returns {Promise<Object>} Integration test results
 */
export async function testServiceIntegrations() {
    console.log('\n=== Testing Additional Service Integrations ===\n')

    const integrationResults = {
        elevation: false,
        weather: false,
    }

    // Test Elevation Service
    console.log('Testing elevation service...')
    try {
        const { fetchElevation } = await import('./elevationService.js')
        const elevation = await fetchElevation({ latitude: 35.6892, longitude: 139.6917 })
        integrationResults.elevation = elevation !== null
        console.log(`   ✓ Elevation service: ${integrationResults.elevation ? 'PASS' : 'FAIL'}`)
        if (integrationResults.elevation) {
            console.log(`   → Tokyo elevation: ${elevation.elevation}m (${elevation.description})`)
        }
    } catch (error) {
        console.log('   ✗ Elevation service: FAIL -', error.message)
    }

    // Test Weather Service - FIXED
    console.log('\nTesting weather service...')
    try {
        const { fetchWeatherAtTime } = await import('./weatherService.js')
        const weather = await fetchWeatherAtTime({
            latitude: 35.6892,
            longitude: 139.6917,
            date: new Date('2024-10-20'), // Use date parameter instead of datetime
        })
        integrationResults.weather = weather !== null
        console.log(`   ✓ Weather service: ${integrationResults.weather ? 'PASS' : 'FAIL'}`)
        if (integrationResults.weather) {
            console.log(`   → Tokyo weather: ${weather.weatherCode?.description || 'N/A'}`)
        }
    } catch (error) {
        console.log('   ✗ Weather service: FAIL -', error.message)
    }

    return integrationResults
}

/**
 * Quick smoke test for development
 * Uses file access instead of table listing for reliability
 * @returns {Promise<boolean>} True if all critical tests pass
 */
export async function quickSmokeTest() {
    console.log('=== Quick Smoke Test ===\n')

    try {
        // 1. Connection test
        console.log('1. Testing connection...')
        const connected = await testDrillConnection()
        if (!connected) {
            console.log('   ✗ FAIL - Drill not available')
            return false
        }
        console.log('   ✓ PASS')

        // 2. Basic query test
        console.log('2. Testing basic query...')
        const result = await executeQuery('SELECT 1 as test')
        if (!result || !result.rows) {
            console.log('   ✗ FAIL - Query failed')
            return false
        }
        console.log('   ✓ PASS')

        // 3. File access test (reliable alternative to table listing)
        console.log('3. Testing file access...')
        const sampleResult = await executeQuery(
            'SELECT COUNT(*) as count FROM dfs.quakex.`sample-earthquakes.json`',
        )
        if (!sampleResult || sampleResult.rows.length === 0) {
            console.log('   ✗ FAIL - Cannot access sample data')
            return false
        }
        console.log(`   ✓ PASS (sample data count: ${sampleResult.rows[0].count})`)

        console.log('\n✓ All smoke tests passed!')
        return true
    } catch (error) {
        console.error('✗ Smoke test failed:', error.message)
        return false
    }
}
