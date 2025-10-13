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
                        label="Countries"
                        icon="pi pi-flag"
                        @click="$router.push('/countries-test')"
                        text
                    />
                </div>
            </template>
        </Toolbar>

        <RouterView />
    </div>
</template>
