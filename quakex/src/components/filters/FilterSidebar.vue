<template>
    <Drawer
        :visible="modelValue"
        @update:visible="$emit('update:modelValue', $event)"
        position="left"
        class="filter-sidebar"
        :style="{ width: '350px' }"
    >
        <template #header>
            <div class="sidebar-header">
                <i class="pi pi-filter mr-2"></i>
                <span class="font-bold">Filters</span>
            </div>
        </template>

        <div class="sidebar-content p-4">
            <!-- Magnitude Range -->
            <div class="filter-section mb-4">
                <label class="block mb-2 font-semibold">
                    <i class="pi pi-chart-line mr-2"></i>
                    Magnitude Range
                </label>
                <Slider v-model="filters.magnitudeRange" :min="0" :max="10" :step="0.1" range />
                <div class="flex justify-between mt-2 text-sm text-gray-600">
                    <span>M{{ filters.magnitudeRange[0] }}</span>
                    <span>M{{ filters.magnitudeRange[1] }}</span>
                </div>
            </div>

            <!-- Date Range -->
            <div class="filter-section mb-4">
                <label class="block mb-2 font-semibold">
                    <i class="pi pi-calendar mr-2"></i>
                    Date Range
                </label>
                <Calendar
                    v-model="filters.dateRange"
                    selectionMode="range"
                    dateFormat="yy-mm-dd"
                    :showIcon="true"
                    :manualInput="false"
                    placeholder="Select date range"
                />
            </div>

            <!-- Depth Categories -->
            <div class="filter-section mb-4">
                <label class="block mb-2 font-semibold">
                    <i class="pi pi-arrow-down mr-2"></i>
                    Depth Categories
                </label>
                <div class="flex flex-column gap-2">
                    <div v-for="category in depthCategories" :key="category.key">
                        <Checkbox
                            v-model="filters.depthCategories"
                            :inputId="category.key"
                            :value="category.key"
                        />
                        <label :for="category.key" class="ml-2">
                            {{ category.label }} ({{ category.range }})
                        </label>
                    </div>
                </div>
            </div>

            <!-- Time Period Quick Filters -->
            <div class="filter-section mb-4">
                <label class="block mb-2 font-semibold">
                    <i class="pi pi-clock mr-2"></i>
                    Quick Time Filters
                </label>
                <div class="grid grid-cols-2 gap-2">
                    <Button
                        v-for="period in timePeriods"
                        :key="period.value"
                        :label="period.label"
                        size="small"
                        outlined
                        @click="selectTimePeriod(period)"
                    />
                </div>
            </div>

            <!-- Statistics Summary -->
            <div class="filter-section mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 class="font-semibold mb-2">Current Results</h4>
                <div class="text-sm">
                    <p><strong>Total:</strong> {{ store.statistics.total }}</p>
                    <p><strong>Avg Magnitude:</strong> M{{ store.statistics.avgMagnitude }}</p>
                    <p><strong>Strongest:</strong> M{{ store.statistics.strongest?.magnitude }}</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
                <Button label="Apply Filters" @click="applyFilters" class="flex-1" />
                <Button label="Reset" @click="resetFilters" severity="secondary" outlined />
            </div>
        </div>
    </Drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { TIME_PERIODS, DEPTH_CATEGORIES } from '@/utils/constants'

const props = defineProps({
    modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const store = useAppStore()

const filters = ref({
    magnitudeRange: [2.5, 10.0],
    dateRange: null,
    depthCategories: [],
})

const depthCategories = [
    { key: 'SHALLOW', label: 'Shallow', range: '0-70km' },
    { key: 'INTERMEDIATE', label: 'Intermediate', range: '70-300km' },
    { key: 'DEEP', label: 'Deep', range: '>300km' },
]

const timePeriods = Object.values(TIME_PERIODS)

const selectTimePeriod = (period) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period.days)

    filters.value.dateRange = [startDate, endDate]
}

const applyFilters = () => {
    store.updateFilters(filters.value)
    emit('update:modelValue', false)
}

const resetFilters = () => {
    filters.value = {
        magnitudeRange: [2.5, 10.0],
        dateRange: null,
        depthCategories: [],
    }
    store.resetFilters()
}
</script>
