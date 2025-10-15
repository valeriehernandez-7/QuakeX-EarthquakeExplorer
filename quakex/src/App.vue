<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
    <div>
        <Toolbar>
            <template #start>
                <h2 style="margin: 0">QuakeX - Testing</h2>
            </template>
            <template #end>
                <div style="display: flex; gap: 1rem">
                    <Button
                        label="Earthquakes"
                        icon="pi pi-globe"
                        @click="$router.push('/')"
                        text
                    />
                    <Button
                        label="Weather"
                        icon="pi pi-cloud"
                        @click="$router.push('/weather-test')"
                        text
                    />
                    <Button
                        label="Elevation"
                        icon="pi pi-angle-double-up"
                        @click="$router.push('/elevation-test')"
                        text
                    />
                    <Button
                        label="Countries"
                        icon="pi pi-flag"
                        @click="$router.push('/countries-test')"
                        text
                    />
                    <Button
                        label="Drill"
                        icon="pi pi-server"
                        @click="$router.push('/drill-test')"
                        text
                    />
                </div>
            </template>
        </Toolbar>

        <RouterView />
    </div>
</template>
