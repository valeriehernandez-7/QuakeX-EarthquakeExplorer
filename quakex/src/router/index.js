import { createRouter, createWebHistory } from 'vue-router'
import EarthquakeTest from '../views/EarthquakeTest.vue'
import WeatherTest from '../views/WeatherTest.vue'

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
    ],
})

export default router
