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
})
</script>

<template>
    <div style="padding: 2rem">
        <h1>QuakeX - PrimeVue + Store Testing</h1>

        <div style="display: flex; gap: 1rem; margin: 2rem 0">
            <Card style="flex: 1">
                <template #title> <i class="pi pi-list"></i> Total Earthquakes </template>
                <template #content>
                    <h2 style="font-size: 2.5rem; margin: 0">{{ store.statistics.total }}</h2>
                </template>
            </Card>

            <Card style="flex: 1">
                <template #title> <i class="pi pi-chart-line"></i> Average Magnitude </template>
                <template #content>
                    <h2 style="font-size: 2.5rem; margin: 0">
                        {{ store.statistics.avgMagnitude }}
                        <Badge value="Mw" severity="info" />
                    </h2>
                </template>
            </Card>

            <Card style="flex: 1">
                <template #title> <i class="pi pi-arrows-v"></i> Average Depth </template>
                <template #content>
                    <h2 style="font-size: 2.5rem; margin: 0">
                        {{ store.statistics.avgDepth }}
                        <span style="font-size: 1rem"> km</span>
                    </h2>
                </template>
            </Card>

            <Card style="flex: 1">
                <template #title> <i class="pi pi-exclamation-triangle"></i> Strongest </template>
                <template #content>
                    <h2 style="font-size: 2.5rem; margin: 0" v-if="store.statistics.strongest">
                        <Badge
                            :value="`M${store.statistics.strongest.magnitude}`"
                            severity="danger"
                        />
                    </h2>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem">
                        {{ store.statistics.strongest?.place }}
                    </p>
                </template>
            </Card>
        </div>

        <div style="margin-top: 2rem">
            <Button
                label="Success"
                severity="success"
                icon="pi pi-check"
                style="margin-right: 1rem"
            />
            <Button
                label="Info"
                severity="info"
                icon="pi pi-info-circle"
                style="margin-right: 1rem"
            />
            <Button
                label="Warning"
                severity="warning"
                icon="pi pi-exclamation-triangle"
                style="margin-right: 1rem"
            />
            <Button label="Danger" severity="danger" icon="pi pi-times" />
        </div>
    </div>
</template>
