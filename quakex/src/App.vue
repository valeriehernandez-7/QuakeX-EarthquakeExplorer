<script setup>
import { useAppStore } from '@/stores/appStore'
import { onMounted } from 'vue'

const store = useAppStore()

onMounted(() => {
  // Test data
  const testEarthquakes = [
    {
      id: '1',
      magnitude: 5.5,
      depth: 50,
      latitude: 35.0,
      longitude: 139.0,
      place: 'Tokyo, Japan',
      time: new Date(),
      url: 'https://example.com',
      significance: 500,
    },
    {
      id: '2',
      magnitude: 6.2,
      depth: 150,
      latitude: -33.0,
      longitude: -70.0,
      place: 'Santiago, Chile',
      time: new Date(),
      url: 'https://example.com',
      significance: 700,
    },
  ]

  store.setEarthquakes(testEarthquakes)

  console.log('Store test:')
  console.log('Total earthquakes:', store.earthquakes.length)
  console.log('Filtered earthquakes:', store.filteredEarthquakes.length)
  console.log('Statistics:', store.statistics)
})
</script>

<template>
  <div style="padding: 2rem">
    <h1>QuakeX - Store Testing</h1>
    <div v-if="store.earthquakes.length > 0">
      <h2>Statistics</h2>
      <p>Total: {{ store.statistics.total }}</p>
      <p>Average Magnitude: {{ store.statistics.avgMagnitude }}</p>
      <p>Average Depth: {{ store.statistics.avgDepth }} km</p>
      <p v-if="store.statistics.strongest">
        Strongest: M{{ store.statistics.strongest.magnitude }} -
        {{ store.statistics.strongest.place }}
      </p>
    </div>
  </div>
</template>
