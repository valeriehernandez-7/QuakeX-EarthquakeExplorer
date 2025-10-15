<template>
    <Drawer
        :visible="modelValue"
        @update:visible="$emit('update:modelValue', $event)"
        position="left"
        class="filter-sidebar"
    >
        <template #header>
            <div class="sidebar-header">
                <i class="pi pi-filter mr-2"></i>
                <span>Filters</span>
            </div>
        </template>

        <div class="sidebar-content">
            <p>Filter sidebar - to be implemented in next feature</p>
            <Button label="Close" @click="$emit('update:modelValue', false)" />
        </div>
    </Drawer>
</template>

<script setup>
defineProps({
    modelValue: Boolean,
})

defineEmits(['update:modelValue'])
</script>
