<script setup>
import { ref } from 'vue'
import { fetchWeatherAtTime } from '@/services/weatherService'

// Test coordinates: San José, Costa Rica
const latitude = ref(9.9333)
const longitude = ref(-84.0833)
const date = ref(new Date())
const loading = ref(false)
const error = ref(null)
const weatherData = ref(null)

async function testWeather() {
  loading.value = true
  error.value = null
  weatherData.value = null

  try {
    console.log('🌤️ Testing weather service...')
    console.log('Location:', { latitude: latitude.value, longitude: longitude.value })
    console.log('Date:', date.value)

    const result = await fetchWeatherAtTime({
      latitude: latitude.value,
      longitude: longitude.value,
      date: date.value,
      useCache: false // Disable cache for testing
    })

    if (result) {
      weatherData.value = result
      console.log('✅ Weather data received:', result)
    } else {
      error.value = 'No weather data returned'
      console.log('⚠️ No weather data returned')
    }
  } catch (err) {
    error.value = err.message || 'Failed to fetch weather data'
    console.error('❌ Error:', err)
  } finally {
    loading.value = false
  }
}

// Auto-load on mount
testWeather()
</script>

<template>
  <div style="padding: 2rem; max-width: 1200px; margin: 0 auto">
    <h1>🌤️ Weather Service Test</h1>
    <p style="color: #666; margin-bottom: 2rem">Testing Open-Meteo Archive API</p>

    <!-- Test Controls -->
    <Card style="margin-bottom: 2rem">
      <template #title>Test Parameters</template>
      <template #content>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600">Latitude</label>
            <InputText 
              v-model.number="latitude" 
              type="number" 
              step="0.0001"
              style="width: 100%"
            />
            <small style="color: #666">San José, Costa Rica: 9.9333</small>
          </div>

          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600">Longitude</label>
            <InputText 
              v-model.number="longitude" 
              type="number" 
              step="0.0001"
              style="width: 100%"
            />
            <small style="color: #666">San José, Costa Rica: -84.0833</small>
          </div>

          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600">Date</label>
            <DatePicker 
              v-model="date" 
              dateFormat="yy-mm-dd"
              style="width: 100%"
            />
            <small style="color: #666">Historical data only</small>
          </div>

          <div style="display: flex; align-items: flex-end">
            <Button 
              label="Test Weather API" 
              icon="pi pi-cloud" 
              @click="testWeather"
              :loading="loading"
              style="width: 100%"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" style="text-align: center; padding: 3rem">
      <ProgressSpinner />
      <p style="margin-top: 1rem; color: #666">Fetching weather data from Open-Meteo...</p>
    </div>

    <!-- Error State -->
    <Message v-if="error && !loading" severity="error" :closable="false">
      <div style="display: flex; align-items: center; gap: 1rem">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem"></i>
        <div>
          <strong>Error fetching weather data</strong>
          <p style="margin: 0.5rem 0 0 0">{{ error }}</p>
          <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem">
            Note: Open-Meteo Archive API has a 5-day delay. Try a date from last week.
          </p>
        </div>
      </div>
    </Message>

    <!-- Weather Data Display -->
    <div v-if="weatherData && !loading">
      <!-- Main Weather Info -->
      <Card style="margin-bottom: 1rem">
        <template #title>
          <div style="display: flex; align-items: center; gap: 1rem">
            <i :class="weatherData.weatherCode.primeIcon" style="font-size: 2rem; color: #3b82f6"></i>
            <div>
              <div>{{ weatherData.weatherCode.description }}</div>
              <small style="font-weight: normal; color: #666">
                {{ weatherData.timestamp }} {{ weatherData.timezoneAbbreviation }}
              </small>
            </div>
          </div>
        </template>
        <template #content>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem">
            <!-- Temperature -->
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
                <i class="pi pi-sun" style="color: #f59e0b"></i>
                <strong>Temperature</strong>
              </div>
              <div style="font-size: 2rem; font-weight: bold; color: #ef4444">
                {{ weatherData.temperature.value }}{{ weatherData.temperature.unit }}
              </div>
            </div>

            <!-- Precipitation -->
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
                <i class="pi pi-cloud" style="color: #3b82f6"></i>
                <strong>Precipitation</strong>
              </div>
              <div style="font-size: 2rem; font-weight: bold; color: #3b82f6">
                {{ weatherData.precipitation.value }} {{ weatherData.precipitation.unit }}
              </div>
            </div>

            <!-- Humidity -->
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
                <i class="pi pi-cloud" style="color: #06b6d4"></i>
                <strong>Humidity</strong>
              </div>
              <div style="font-size: 2rem; font-weight: bold; color: #06b6d4">
                {{ weatherData.humidity.value }}{{ weatherData.humidity.unit }}
              </div>
            </div>

            <!-- Cloud Cover -->
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem">
                <i class="pi pi-cloud" style="color: #64748b"></i>
                <strong>Cloud Cover</strong>
              </div>
              <div style="font-size: 2rem; font-weight: bold; color: #64748b">
                {{ weatherData.cloudCover.value }}{{ weatherData.cloudCover.unit }}
              </div>
              <small style="color: #666">{{ weatherData.cloudCover.description }}</small>
            </div>
          </div>
        </template>
      </Card>

      <!-- Pressure & Wind -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 1rem">
        <Card>
          <template #title>
            <i class="pi pi-chart-line"></i> Atmospheric Pressure
          </template>
          <template #content>
            <div style="display: flex; flex-direction: column; gap: 1rem">
              <div>
                <strong>Surface Pressure</strong>
                <div style="font-size: 1.5rem; font-weight: bold; color: #8b5cf6">
                  {{ weatherData.pressure.surface.value }} {{ weatherData.pressure.surface.unit }}
                </div>
              </div>
              <Divider />
              <div>
                <strong>Mean Sea Level Pressure</strong>
                <div style="font-size: 1.5rem; font-weight: bold; color: #8b5cf6">
                  {{ weatherData.pressure.msl.value }} {{ weatherData.pressure.msl.unit }}
                </div>
              </div>
            </div>
          </template>
        </Card>

        <Card>
          <template #title>
            <i class="pi pi-flag"></i> Wind Conditions
          </template>
          <template #content>
            <div style="display: flex; flex-direction: column; gap: 1rem">
              <div>
                <strong>Wind Speed</strong>
                <div style="font-size: 1.5rem; font-weight: bold; color: #10b981">
                  {{ weatherData.wind.speed.value }} {{ weatherData.wind.speed.unit }}
                </div>
              </div>
              <Divider />
              <div>
                <strong>Wind Direction</strong>
                <div style="font-size: 1.5rem; font-weight: bold; color: #10b981">
                  {{ weatherData.wind.direction.value }}° ({{ weatherData.wind.direction.cardinal }})
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Raw JSON Data -->
      <Card>
        <template #title>
          <i class="pi pi-code"></i> Raw JSON Response
        </template>
        <template #content>
          <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; font-size: 0.85rem">{{ JSON.stringify(weatherData, null, 2) }}</pre>
        </template>
      </Card>
    </div>

    <!-- Helper Info -->
    <Card style="margin-top: 2rem; background: #eff6ff">
      <template #content>
        <div style="display: flex; gap: 1rem">
          <i class="pi pi-info-circle" style="color: #3b82f6; font-size: 1.5rem"></i>
          <div>
            <strong style="color: #1e40af">Important Notes:</strong>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; color: #1e40af">
              <li>Open-Meteo Archive API has a <strong>5-day delay</strong></li>
              <li>For recent data (last 5 days), use the Forecast API with past_days parameter</li>
              <li>Coordinates: San José, Costa Rica (9.9333, -84.0833)</li>
              <li>Try dates from last week for best results</li>
            </ul>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
h1 {
  margin-bottom: 0.5rem;
}

label {
  color: #374151;
}

small {
  display: block;
  margin-top: 0.25rem;
}
</style>
