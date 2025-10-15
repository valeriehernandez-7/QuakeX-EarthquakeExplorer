import { createRouter, createWebHistory } from 'vue-router'
import EarthquakeTest from '@/views/EarthquakeTest.vue'
import WeatherTest from '@/views/WeatherTest.vue'
import ElevationTest from '@/views/ElevationTest.vue'
import CountriesTest from '@/views/CountriesTest.vue'
import DrillTest from '@/views/DrillTest.vue'

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
            path: '/elevation-test',
            name: 'elevation-test',
            component: ElevationTest,
        },
        {
            path: '/countries-test',
            name: 'countries-test',
            component: CountriesTest,
        },
        {
            path: '/drill-test',
            name: 'drill-test',
            component: DrillTest,
        },
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

export default router
