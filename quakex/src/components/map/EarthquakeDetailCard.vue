<template>
    <Dialog v-model:visible="visible" modal header="Earthquake Details" :style="{ width: '650px' }">
        <div v-if="selectedEarthquake">
            <p>Earthquake detail card - to be implemented in next feature</p>
            <pre>{{ selectedEarthquake }}</pre>
        </div>
        <div v-else>
            <p>No earthquake selected</p>
        </div>
        <template #footer>
            <Button label="Close" icon="pi pi-times" @click="visible = false" text />
        </template>
    </Dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/appStore'

const store = useAppStore()

const selectedEarthquake = computed(() => store.selectedEarthquake)
const visible = computed({
    get: () => !!store.selectedEarthquake,
    set: (value) => {
        if (!value) {
            store.selectEarthquake(null)
        }
    },
})
</script>
