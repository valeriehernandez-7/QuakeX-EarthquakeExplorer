<template>
    <Drawer
        v-model:visible="isVisible"
        position="right"
        class="filter-sidebar"
        header="Earthquake Filters"
    >
        <template #header>
            <div class="flex items-center gap-3">
                <FilterIcon :size="28" fillColor="#3b82f6" />
                <div>
                    <h3 class="text-xl font-bold m-0">Filters</h3>
                    <p class="text-sm text-gray-500 m-0">Refine your earthquake search</p>
                </div>
            </div>
        </template>

        <div class="filter-content">
            <!-- Magnitude Range Section -->
            <div class="filter-section">
                <div class="section-header">
                    <ChartLineIcon :size="20" fillColor="#ef4444" />
                    <span class="section-title">Magnitude Range</span>
                </div>

                <div class="magnitude-display">
                    <Tag
                        :value="`M${localFilters.magnitudeRange[0].toFixed(1)}`"
                        severity="success"
                    />
                    <span class="text-gray-500">to</span>
                    <Tag
                        :value="`M${localFilters.magnitudeRange[1].toFixed(1)}`"
                        severity="danger"
                    />
                </div>

                <Slider
                    v-model="localFilters.magnitudeRange"
                    :min="0"
                    :max="10"
                    :step="0.1"
                    range
                    class="mt-3"
                />

                <div class="magnitude-legend">
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #10b981"></div>
                        <span>Minor (0.0 - 3.9)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #3b82f6"></div>
                        <span>Light (4.0 - 4.9)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #f59e0b"></div>
                        <span>Moderate (5.0 - 5.9)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #ef4444"></div>
                        <span>Strong (6.0 - 6.9)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-dot" style="background: #991b1b"></div>
                        <span>Major (+ 7.0)</span>
                    </div>
                </div>
            </div>

            <Divider />

            <!-- Date Range Section -->
            <div class="filter-section">
                <div class="section-header">
                    <CalendarIcon :size="20" fillColor="#8b5cf6" />
                    <span class="section-title">Date Range</span>
                </div>

                <DatePicker
                    v-model="localDateRange"
                    selectionMode="range"
                    dateFormat="M dd, yy"
                    :showIcon="true"
                    :manualInput="false"
                    placeholder="Select date range"
                    class="w-full"
                    :maxDate="new Date()"
                />

                <div class="quick-filters">
                    <Button
                        v-for="period in quickPeriods"
                        :key="period.value"
                        :label="period.label"
                        size="small"
                        :outlined="!isPeriodSelected(period)"
                        :severity="isPeriodSelected(period) ? 'primary' : 'secondary'"
                        @click="selectTimePeriod(period)"
                    >
                        <template #icon>
                            <component :is="period.icon" :size="16" class="mr-1" />
                        </template>
                    </Button>
                </div>
            </div>

            <Divider />

            <!-- Depth Categories Section -->
            <div class="filter-section">
                <div class="section-header">
                    <LayersIcon :size="20" fillColor="#10b981" />
                    <span class="section-title">Depth Categories</span>
                </div>

                <div class="depth-categories">
                    <div
                        v-for="category in depthCategories"
                        :key="category.key"
                        class="category-item"
                        :class="{ selected: localFilters.depthCategories.includes(category.key) }"
                        @click="toggleDepthCategory(category.key)"
                    >
                        <Checkbox
                            v-model="localFilters.depthCategories"
                            :inputId="category.key"
                            :value="category.key"
                            :binary="false"
                        />
                        <label :for="category.key" class="category-label">
                            <component :is="category.icon" :size="18" :fillColor="category.color" />
                            <div>
                                <div class="font-semibold">{{ category.label }}</div>
                                <div class="text-xs text-gray-500">{{ category.range }}</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <Divider />

            <!-- Current Results Summary -->
            <div class="filter-section results-summary">
                <div class="section-header">
                    <ChartBarIcon :size="20" fillColor="#f59e0b" />
                    <span class="section-title">Current Results</span>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <EarthIcon :size="24" fillColor="#3b82f6" />
                        <div>
                            <div class="stat-value">{{ store.statistics.total }}</div>
                            <div class="stat-label">Total Events</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <ChartLineIcon :size="24" fillColor="#ef4444" />
                        <div>
                            <div class="stat-value">M {{ store.statistics.avgMagnitude }}</div>
                            <div class="stat-label">Avg Magnitude</div>
                        </div>
                    </div>

                    <div class="stat-card" v-if="store.statistics.strongest">
                        <AlertIcon :size="24" fillColor="#991b1b" />
                        <div>
                            <div class="stat-value">
                                M {{ store.statistics.strongest.magnitude }}
                            </div>
                            <div class="stat-label">Strongest</div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <LayersIcon :size="24" fillColor="#10b981" />
                        <div>
                            <div class="stat-value">{{ store.statistics.avgDepth }} km</div>
                            <div class="stat-label">Avg Depth</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="filter-actions">
                <Button
                    label="Clear"
                    icon="pi pi-filter-slash"
                    @click="resetFilters"
                    severity="secondary"
                    outlined
                    class="flex-item"
                />
                <Button label="Apply" icon="pi pi-check" @click="applyFilters" class="flex-item" />
            </div>
        </template>
    </Drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { TIME_PERIODS } from '@/utils/constants'

// Material Design Icons
import FilterIcon from 'vue-material-design-icons/Filter.vue'
import ChartLineIcon from 'vue-material-design-icons/ChartLine.vue'
import CalendarIcon from 'vue-material-design-icons/Calendar.vue'
import LayersIcon from 'vue-material-design-icons/Layers.vue'
import ChartBarIcon from 'vue-material-design-icons/ChartBar.vue'
import EarthIcon from 'vue-material-design-icons/Earth.vue'
import AlertIcon from 'vue-material-design-icons/Alert.vue'
import ClockOutline from 'vue-material-design-icons/ClockOutline.vue'
import CalendarToday from 'vue-material-design-icons/CalendarToday.vue'
import CalendarMonth from 'vue-material-design-icons/CalendarMonth.vue'
import CalendarRange from 'vue-material-design-icons/CalendarRange.vue'
import CalendarStar from 'vue-material-design-icons/CalendarStar.vue'
import ArrowDownBoldCircle from 'vue-material-design-icons/ArrowDownBoldCircle.vue'
import ArrowDownCircle from 'vue-material-design-icons/ArrowDownCircle.vue'
import ArrowCollapseDown from 'vue-material-design-icons/ArrowCollapseDown.vue'

const props = defineProps({
    visible: Boolean,
})

const emit = defineEmits(['update:visible'])

const store = useAppStore()

// Local state for filters (working copy)
const localFilters = ref({
    magnitudeRange: [2.5, 10.0],
    depthCategories: [],
})

const localDateRange = ref(null)

// Computed for drawer visibility
const isVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value),
})

// Depth categories with icons
const depthCategories = [
    {
        key: 'SHALLOW',
        label: 'Shallow',
        range: '0 - 70 km',
        icon: ArrowDownBoldCircle,
        color: '#ef4444',
        description: 'Most dangerous, near surface',
    },
    {
        key: 'INTERMEDIATE',
        label: 'Intermediate',
        range: '70 - 300 km',
        icon: ArrowDownCircle,
        color: '#f59e0b',
        description: 'Moderate depth',
    },
    {
        key: 'DEEP',
        label: 'Deep',
        range: '> 300 km',
        icon: ArrowCollapseDown,
        color: '#10b981',
        description: 'Less surface impact',
    },
]

// Quick time period filters
const quickPeriods = [
    {
        ...TIME_PERIODS.TODAY,
        icon: CalendarToday,
    },
    {
        ...TIME_PERIODS.LAST_WEEK,
        icon: CalendarRange,
    },
    {
        ...TIME_PERIODS.LAST_MONTH,
        icon: CalendarMonth,
    },
    {
        ...TIME_PERIODS.LAST_YEAR,
        icon: CalendarStar,
    },
]

// Track selected period for UI feedback
const selectedPeriod = ref(null)

const isPeriodSelected = (period) => {
    return selectedPeriod.value?.value === period.value
}

const selectTimePeriod = (period) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period.days)

    localDateRange.value = [startDate, endDate]
    selectedPeriod.value = period
}

const toggleDepthCategory = (key) => {
    const index = localFilters.value.depthCategories.indexOf(key)
    if (index > -1) {
        localFilters.value.depthCategories.splice(index, 1)
    } else {
        localFilters.value.depthCategories.push(key)
    }
}

const applyFilters = async () => {
    // Convert localDateRange array to store format (object with start/end)
    const dateRangeForStore =
        localDateRange.value && localDateRange.value.length === 2
            ? {
                  start: localDateRange.value[0],
                  end: localDateRange.value[1],
              }
            : { start: null, end: null }

    if (dateRangeForStore.start && dateRangeForStore.end) {
        const needsFetch = store.needsDataFetch(dateRangeForStore.start, dateRangeForStore.end)

        if (needsFetch) {
            console.log('Fetching additional data for date range:', {
                start: dateRangeForStore.start.toISOString(),
                end: dateRangeForStore.end.toISOString(),
            })

            try {
                await store.fetchEarthquakes({
                    startTime: dateRangeForStore.start,
                    endTime: dateRangeForStore.end,
                    minMagnitude: localFilters.value.magnitudeRange[0],
                })

                console.log('Additional data loaded successfully')
            } catch (error) {
                console.error('Failed to fetch additional data:', error)
            }
        } else {
            console.log('Data already available for requested range')
        }
    }

    // Update store filters
    store.updateFilters({
        magnitudeRange: localFilters.value.magnitudeRange,
        dateRange: dateRangeForStore,
        depthCategories: localFilters.value.depthCategories,
    })

    // Close drawer
    isVisible.value = false

    console.log('Filters applied:', {
        magnitude: localFilters.value.magnitudeRange,
        dateRange: dateRangeForStore,
        depth: localFilters.value.depthCategories,
    })
}

const resetFilters = () => {
    localFilters.value = {
        magnitudeRange: [2.5, 10.0],
        depthCategories: [],
    }
    localDateRange.value = null
    selectedPeriod.value = null

    store.resetFilters()
}

// Sync local filters with store when drawer opens
watch(
    () => props.visible,
    (visible) => {
        if (visible) {
            // Sync from store to local
            localFilters.value.magnitudeRange = [...store.filters.magnitudeRange]
            localFilters.value.depthCategories = [...store.filters.depthCategories]

            // Convert store date format to Calendar component format
            if (store.filters.dateRange.start && store.filters.dateRange.end) {
                localDateRange.value = [
                    new Date(store.filters.dateRange.start),
                    new Date(store.filters.dateRange.end),
                ]
            } else {
                localDateRange.value = null
            }
        }
    },
)
</script>

<style scoped>
.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}

/* Magnitude Section */
.magnitude-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.magnitude-legend {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

/* Quick Filters */
.quick-filters {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-top: 1rem;
}

/* Depth Categories */
.depth-categories {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.category-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.category-item:hover {
    border-color: #3b82f6;
    background: #eff6ff;
}

.category-item.selected {
    border-color: #3b82f6;
    background: #eff6ff;
}

.category-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    flex: 1;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-value {
    font-size: 1.25rem;
    font-weight: bold;
    color: #1f2937;
}

.stat-label {
    font-size: 0.75rem;
    color: #6b7280;
}

/* Footer Actions */
.filter-actions {
    gap: 0.75rem;
    display: grid;
}

/* Responsive */
@media (max-width: 768px) {
    .filter-sidebar {
        width: 100% !important;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>
