<script setup>
import { getMagnitudeLevel, getDepthCategory, calculateMarkerSize } from '@/utils/helpers'
import { MAGNITUDE_LEVELS, MAP_CONFIG } from '@/utils/constants'

// Test the utilities
console.log('Testing constants and helpers:')
console.log('Magnitude 5.5:', getMagnitudeLevel(5.5))
console.log('Depth 50km:', getDepthCategory(50))
console.log('Marker size for M6.0:', calculateMarkerSize(6.0))
console.log('Map config:', MAP_CONFIG)
</script>

<template>
  <div>
    <h1>QuakeX - Setup Complete</h1>
    <p>Check the browser console for test output</p>
  </div>
</template>
