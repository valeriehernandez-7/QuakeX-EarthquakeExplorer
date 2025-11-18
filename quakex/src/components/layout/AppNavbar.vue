<template>
    <div class="app-navbar">
        <Toolbar>
            <template #start>
                <div class="navbar-brand">
                    <svg fill="#008080"
                        width="10%"
                        viewBox="0 0 24 24"><a href="https://github.com/valeriehernandez-7/QuakeX-EarthquakeExplorer" target="_blank" rel="noopener noreferrer">
                        <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z">
                        </path></a>
                    </svg>
                    <span class="font-bold text-xl" style="color: #008080">QuakeX</span>
                </div>
            </template>

            <template #end>
                <div class="nav-links">
                    <Button
                        label="Map"
                        icon="pi pi-map"
                        text
                        :severity="$route.name === 'map' ? undefined : 'secondary'"
                        @click="$router.push('/')"
                    />
                    <Button
                        label="Analytics"
                        icon="pi pi-chart-bar"
                        text
                        :severity="$route.name === 'analytics' ? undefined : 'secondary'"
                        @click="$router.push('/analytics')"
                    />
                    <Button
                        label="About"
                        icon="pi pi-info-circle"
                        text
                        :severity="$route.name === 'about' ? undefined : 'secondary'"
                        @click="$router.push('/about')"
                    />
                </div>
            </template>
        </Toolbar>
    </div>
</template>

<script setup>
import { useAppStore } from '@/stores/appStore'
import { useRoute } from 'vue-router'

const store = useAppStore()
const route = useRoute()
</script>

<style scoped>
.app-navbar {
    border-bottom: 1px solid var(--surface-border);
    background: var(--surface-section);
}

.navbar-brand {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.nav-links {
    display: flex;
    gap: 0.5rem;
}

.navbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }

    .navbar-actions :deep(.p-button-label) {
        display: none;
    }
}
</style>
