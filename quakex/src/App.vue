<template>
    <div id="app">
        <router-view />
        <Toast />
    </div>
</template>

<script setup>
import Toast from 'primevue/toast'
</script>

<style>
#app {
    height: 100vh;
    font-family: 'Inter', sans-serif;
}

/* Global styles for PrimeVue Aura theme */
.p-component {
    font-family: 'Inter', sans-serif;
}

/* Ensure proper sizing for map components */
.leaflet-container {
    font-family: 'Inter', sans-serif;
}
</style>
