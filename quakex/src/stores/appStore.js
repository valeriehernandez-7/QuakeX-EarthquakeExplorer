import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
    // State
    const earthquakes = ref([])
    const filters = ref({
        magnitudeRange: [2.5, 10.0],
        dateRange: {
            start: null,
            end: null
        },
        depthCategories: [] // Optional: ['SHALLOW', 'INTERMEDIATE', 'DEEP']
    })
    const selectedEarthquake = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const lastUpdate = ref(null)

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
                strongest: null
            }
        }

        const total = filtered.length
        const avgMagnitude =
            filtered.reduce((sum, eq) => sum + eq.magnitude, 0) / total
        const avgDepth = filtered.reduce((sum, eq) => sum + eq.depth, 0) / total
        const strongest = filtered.reduce((max, eq) =>
            eq.magnitude > max.magnitude ? eq : max
        )

        return {
            total,
            avgMagnitude: Number(avgMagnitude.toFixed(2)),
            avgDepth: Math.round(avgDepth),
            strongest
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
                end: null
            },
            depthCategories: []
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
        resetFilters
    }
})