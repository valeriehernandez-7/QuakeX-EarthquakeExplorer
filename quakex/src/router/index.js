import { createRouter, createWebHistory } from 'vue-router'
import EarthquakeTest from '@/views/EarthquakeTest.vue'
import WeatherTest from '@/views/WeatherTest.vue'
import CountriesTest from '@/views/CountriesTest.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'earthquake-test',
            component: EarthquakeTest,
        },
        {
            path: '/weather-test',
            name: 'weather-test',
            component: WeatherTest,
        },
        {
            path: '/countries-test',
            name: 'countries-test',
            component: CountriesTest,
        },
    ],
    scrollBehavior() {
        return { top: 0 }
    }
})

export default router
