<template>
    <Sidebar @page-change="handlePageChange">
       
    </Sidebar>
</template>

<script setup>
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { ref } from 'vue'

const handlePageChange = (page) => {
    console.log('页面切换到:', page)
}

</script>

<style scoped>

</style>