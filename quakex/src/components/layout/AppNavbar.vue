<template>
    <div class="app-navbar">
        <Toolbar>
            <template #start>
                <div class="navbar-brand">
                    <i class="pi pi-map-marker text-xl mr-2" style="color: #ef4444" />
                    <span class="font-bold text-xl">QuakeX</span>
                    <Tag value="Beta" severity="info" class="ml-2" />
                </div>
            </template>

            <template #center>
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

            <template #end>
                <div class="navbar-actions">
                    <Button
                        icon="pi pi-filter"
                        label="Filters"
                        outlined
                        @click="$emit('toggleFilters')"
                        class="mr-2"
                    />
                    <Button
                        icon="pi pi-refresh"
                        :loading="store.loading"
                        @click="refreshData"
                        severity="secondary"
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

defineEmits(['toggleFilters'])

const refreshData = async () => {
    await store.fetchEarthquakes({
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        minMagnitude: 2.5,
    })
}
</script>

<style scoped>
.app-navbar {
    border-bottom: 1px solid var(--surface-border);
    background: var(--surface-section);
}

.navbar-brand {
    display: flex;
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
