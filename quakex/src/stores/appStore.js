import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
    // State
    const earthquakes = ref([])
    const filters = ref({
        magnitudeRange: [2.5, 10.0],
        dateRange: {
            start: null,
            end: null,
        },
        depthCategories: [], // ['SHALLOW', 'INTERMEDIATE', 'DEEP']
    })
    const selectedEarthquake = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const lastUpdate = ref(null)

    const dataRange = ref({
        start: null,
        end: null,
    })

    // Getters
    const filteredEarthquakes = computed(() => {
        return earthquakes.value.filter((eq) => {
            // Filter by magnitude
            const [minMag, maxMag] = filters.value.magnitudeRange
            if (eq.magnitude < minMag || eq.magnitude > maxMag) {
                return false
            }

            // Filter by date range
            if (filters.value.dateRange.start && filters.value.dateRange.end) {
                const eqTime = new Date(eq.time).getTime()
                const startTime = new Date(filters.value.dateRange.start).getTime()
                const endTime = new Date(filters.value.dateRange.end).getTime()
                if (eqTime < startTime || eqTime > endTime) {
                    return false
                }
            }

            // Filter by depth categories (if any selected)
            if (filters.value.depthCategories.length > 0) {
                const depthCategory = getDepthCategoryKey(eq.depth)
                if (!filters.value.depthCategories.includes(depthCategory)) {
                    return false
                }
            }

            return true
        })
    })

    const statistics = computed(() => {
        const filtered = filteredEarthquakes.value

        if (filtered.length === 0) {
            return {
                total: 0,
                avgMagnitude: 0,
                avgDepth: 0,
                strongest: null,
            }
        }

        const total = filtered.length
        const avgMagnitude = filtered.reduce((sum, eq) => sum + eq.magnitude, 0) / total
        const avgDepth = filtered.reduce((sum, eq) => sum + eq.depth, 0) / total
        const strongest = filtered.reduce((max, eq) => (eq.magnitude > max.magnitude ? eq : max))

        return {
            total,
            avgMagnitude: Number(avgMagnitude.toFixed(2)),
            avgDepth: Math.round(avgDepth),
            strongest,
        }
    })

    // Actions
    function setEarthquakes(data) {
        earthquakes.value = data
        lastUpdate.value = new Date()
    }

    function updateFilters(newFilters) {
        filters.value = { ...filters.value, ...newFilters }
    }

    function selectEarthquake(earthquake) {
        selectedEarthquake.value = earthquake
    }

    function setLoading(state) {
        loading.value = state
    }

    function setError(errorMessage) {
        error.value = errorMessage
    }

    function clearError() {
        error.value = null
    }

    function resetFilters() {
        filters.value = {
            magnitudeRange: [2.5, 10.0],
            dateRange: {
                start: null,
                end: null,
            },
            depthCategories: [],
        }
    }

    function needsDataFetch(requestedStart, requestedEnd) {
        if (earthquakes.value.length === 0) {
            console.log('No data in store, fetch needed')
            return true
        }

        if (!dataRange.value.start || !dataRange.value.end) {
            console.log('No data range tracking, fetch needed')
            return true
        }

        const currentStart = new Date(dataRange.value.start).getTime()
        const currentEnd = new Date(dataRange.value.end).getTime()
        const reqStart = new Date(requestedStart).getTime()
        const reqEnd = new Date(requestedEnd).getTime()

        const needsOlderData = reqStart < currentStart
        const needsNewerData = reqEnd > currentEnd

        if (needsOlderData || needsNewerData) {
            console.log('Data outside current range:', {
                current: {
                    start: dataRange.value.start,
                    end: dataRange.value.end,
                },
                requested: {
                    start: requestedStart,
                    end: requestedEnd,
                },
                needsOlderData,
                needsNewerData,
            })
        }

        return needsOlderData || needsNewerData
    }

    /**
     * Fetch earthquakes from USGS API
     */
    async function fetchEarthquakes(params = {}) {
        try {
            setLoading(true)
            clearError()

            const { fetchEarthquakes } = await import('@/services/usgsService')
            const newEarthquakes = await fetchEarthquakes(params)

            // Merge existing data
            const existingIds = new Set(earthquakes.value.map((eq) => eq.id))
            const uniqueNewEarthquakes = newEarthquakes.filter((eq) => !existingIds.has(eq.id))

            earthquakes.value = [...earthquakes.value, ...uniqueNewEarthquakes]

            // Update range tracking
            if (params.startTime) {
                const startTime = new Date(params.startTime)
                if (!dataRange.value.start || startTime < new Date(dataRange.value.start)) {
                    dataRange.value.start = startTime
                }
            }

            if (params.endTime) {
                const endTime = new Date(params.endTime)
                if (!dataRange.value.end || endTime > new Date(dataRange.value.end)) {
                    dataRange.value.end = endTime
                }
            } else {
                // if no end time use now()
                const now = new Date()
                if (!dataRange.value.end || now > new Date(dataRange.value.end)) {
                    dataRange.value.end = now
                }
            }

            lastUpdate.value = new Date()

            console.log('Data loaded:', {
                total: earthquakes.value.length,
                new: uniqueNewEarthquakes.length,
                range: {
                    start: dataRange.value.start,
                    end: dataRange.value.end,
                },
            })

            return newEarthquakes
        } catch (error) {
            setError(`Failed to fetch earthquakes: ${error.message}`)
            console.error('Error fetching earthquakes:', error)
            return []
        } finally {
            setLoading(false)
        }
    }

    // Helper function for depth category
    function getDepthCategoryKey(depth) {
        if (depth < 70) return 'SHALLOW'
        if (depth < 300) return 'INTERMEDIATE'
        return 'DEEP'
    }

    return {
        // State
        earthquakes,
        filters,
        selectedEarthquake,
        loading,
        error,
        lastUpdate,
        dataRange,

        // Getters
        filteredEarthquakes,
        statistics,

        // Actions
        setEarthquakes,
        updateFilters,
        selectEarthquake,
        setLoading,
        setError,
        clearError,
        resetFilters,
        fetchEarthquakes,
        needsDataFetch,
    }
})
