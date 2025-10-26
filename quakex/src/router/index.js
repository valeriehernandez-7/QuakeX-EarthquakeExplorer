import { createRouter, createWebHistory } from 'vue-router'

import MapView from '@/views/MapView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'map',
            component: MapView,
        },
        {
            path: '/analytics',
            name: 'analytics',
            component: AnalyticsView,
        },
        {
            path: '/about',
            name: 'about',
            component: AboutView,
        },
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

export default router
