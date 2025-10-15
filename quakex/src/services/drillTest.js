import {
    testDrillConnection,
    executeQuery,
    listAvailableTables,
    getTableSchema,
} from './drillService.js'
import { fetchAllCountries, saveCountriesForDrill } from './countriesService.js'
import { fetchEarthquakes, fetchEarthquakesForPeriod } from './usgsService.js'
import { fetchElevation } from './elevationService.js'
import { fetchWeatherAtTime } from './weatherService.js'

/**
 * Comprehensive Drill Service Test
 * Tests all aspects of Apache Drill integration
 */
export async function runDrillIntegrationTest() {
    console.log('=== Starting Apache Drill Integration Test ===')

    const testResults = {
        drillConnection: false,
        basicQuery: false,
        tableListing: false,
        schemaQuery: false,
        sampleDataQuery: false,
        countriesIntegration: false,
        earthquakesIntegration: false,
    }

    try {
        // Test 1: Basic Drill Connection
        console.log('1. Testing Drill connection...')
        testResults.drillConnection = await testDrillConnection()
        console.log(`   Drill connection: ${testResults.drillConnection ? 'SUCCESS' : 'FAILED'}`)

        if (!testResults.drillConnection) {
            console.error('Cannot proceed with tests - Drill connection failed')
            return testResults
        }

        // Test 2: Basic SQL Query
        console.log('2. Testing basic SQL query...')
        const basicResult = await executeQuery(
            'SELECT 1 as test_value, CURRENT_TIMESTAMP as current_time',
        )
        testResults.basicQuery = basicResult && basicResult.rows.length > 0
        console.log(`   Basic query: ${testResults.basicQuery ? 'SUCCESS' : 'FAILED'}`)
        if (testResults.basicQuery) {
            console.log('   Query result:', basicResult.rows[0])
        }

        // Test 3: List Available Tables
        console.log('3. Testing table listing...')
        const tables = await listAvailableTables()
        testResults.tableListing = Array.isArray(tables)
        console.log(`   Table listing: ${testResults.tableListing ? 'SUCCESS' : 'FAILED'}`)
        if (testResults.tableListing) {
            console.log('   Available tables:', tables)
        }

        // Test 4: Query Sample Data
        console.log('4. Testing schema query...')
        try {
            const schema = await getTableSchema('sample-earthquakes.json')
            testResults.schemaQuery = Array.isArray(schema) && schema.length > 0

            console.log(`   Schema query: ${testResults.schemaQuery ? 'SUCCESS' : 'FAILED'}`)

            if (testResults.schemaQuery) {
                console.log(
                    `   Retrieved ${schema.length} columns using ${schema[0].METHOD || 'inference'}`,
                )
                console.log(
                    '   Sample columns:',
                    schema.slice(0, 3).map((col) => ({
                        name: col.COLUMN_NAME,
                        type: col.DATA_TYPE,
                    })),
                )
            } else {
                console.log('   No schema information available')
            }
        } catch (error) {
            console.log('   Schema query: FAILED -', error.message)
            testResults.schemaQuery = false
        }

        console.log('5. Testing sample data query...')
        try {
            const sampleQuery = `
                SELECT * 
                FROM dfs.quakex.\`sample-earthquakes.json\`
                LIMIT 5
            `
            const sampleResult = await executeQuery(sampleQuery)
            testResults.sampleDataQuery = sampleResult && sampleResult.rows.length > 0
            console.log(
                `   Sample data query: ${testResults.sampleDataQuery ? 'SUCCESS' : 'FAILED'}`,
            )
            if (testResults.sampleDataQuery) {
                console.log(`   Retrieved ${sampleResult.rows.length} sample earthquakes`)
                console.log('   First sample:', sampleResult.rows[0])
            }
        } catch (error) {
            console.log('   Sample data query: FAILED -', error.message)
            testResults.sampleDataQuery = false
        }

        // Test 6: Countries Integration (renumerar este y los siguientes)
        console.log('6. Testing countries integration...')
        try {
            const countries = await fetchAllCountries()
            testResults.countriesIntegration = Array.isArray(countries) && countries.length > 0
            console.log(
                `   Countries integration: ${testResults.countriesIntegration ? 'SUCCESS' : 'FAILED'}`,
            )
            if (testResults.countriesIntegration) {
                console.log(`   Retrieved ${countries.length} countries`)

                // Test saving countries for Drill
                const saved = await saveCountriesForDrill()
                console.log(`   Countries saved for Drill: ${saved ? 'SUCCESS' : 'FAILED'}`)
            }
        } catch (error) {
            console.log('   Countries integration: FAILED -', error.message)
        }

        // Test 7: Earthquakes Integration
        console.log('7. Testing earthquakes integration...')
        try {
            const earthquakes = await fetchEarthquakesForPeriod('LAST_WEEK', {
                saveForDrill: true,
                minMagnitude: 4.5,
            })
            testResults.earthquakesIntegration = Array.isArray(earthquakes)
            console.log(
                `   Earthquakes integration: ${testResults.earthquakesIntegration ? 'SUCCESS' : 'FAILED'}`,
            )
            if (testResults.earthquakesIntegration) {
                console.log(`   Retrieved ${earthquakes.length} earthquakes`)
            }
        } catch (error) {
            console.log('   Earthquakes integration: FAILED -', error.message)
        }

        console.log('8. Testing complex Drill queries...')
        if (testResults.sampleDataQuery) {
            const complexQueries = [
                {
                    name: 'Magnitude statistics',
                    sql: `
                        SELECT 
                            COUNT(*) as total,
                            AVG(magnitude) as avg_magnitude,
                            MAX(magnitude) as max_magnitude,
                            MIN(magnitude) as min_magnitude
                        FROM dfs.quakex.\`sample-earthquakes.json\`
                    `,
                },
                {
                    name: 'Group by magnitude range',
                    sql: `
                        SELECT 
                            CASE 
                                WHEN magnitude < 4.0 THEN 'Minor'
                                WHEN magnitude < 6.0 THEN 'Moderate' 
                                ELSE 'Major'
                            END as category,
                            COUNT(*) as count
                        FROM dfs.quakex.\`sample-earthquakes.json\`
                        GROUP BY 
                            CASE 
                                WHEN magnitude < 4.0 THEN 'Minor'
                                WHEN magnitude < 6.0 THEN 'Moderate' 
                                ELSE 'Major'
                            END
                    `,
                },
            ]

            for (const query of complexQueries) {
                try {
                    const result = await executeQuery(query.sql)
                    console.log(`   ${query.name}: SUCCESS -`, result.rows[0])
                } catch (error) {
                    console.log(`   ${query.name}: FAILED -`, error.message)
                }
            }
        }
    } catch (error) {
        console.error('Comprehensive test failed:', error)
    }

    console.log('=== Test Results Summary ===')
    Object.entries(testResults).forEach(([test, result]) => {
        console.log(`   ${test}: ${result ? 'PASS' : 'FAIL'}`)
    })

    return testResults
}

/**
 * Test individual service integrations with Drill
 */
export async function testServiceIntegrations() {
    console.log('\n=== Testing Service Integrations ===')

    const integrationResults = {}

    // Test Elevation Service
    console.log('Testing elevation service...')
    try {
        const elevation = await fetchElevation({ latitude: 35.6892, longitude: 139.6917 })
        integrationResults.elevation = elevation !== null
        console.log(`   Elevation service: ${integrationResults.elevation ? 'SUCCESS' : 'FAILED'}`)
        if (integrationResults.elevation) {
            console.log('   Tokyo elevation:', elevation)
        }
    } catch (error) {
        console.log('   Elevation service: FAILED -', error.message)
    }

    // Test Weather Service
    console.log('Testing weather service...')
    try {
        const weather = await fetchWeatherAtTime({
            latitude: 35.6892,
            longitude: 139.6917,
            date: new Date(),
        })
        integrationResults.weather = weather !== null
        console.log(`   Weather service: ${integrationResults.weather ? 'SUCCESS' : 'FAILED'}`)
        if (integrationResults.weather) {
            console.log('   Tokyo weather:', weather.weatherCode.description)
        }
    } catch (error) {
        console.log('   Weather service: FAILED -', error.message)
    }

    return integrationResults
}
