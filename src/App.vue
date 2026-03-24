<template>
    <view class="app-container">
        <!-- 固定侧边栏 -->
        <view class="sidebar-fixed">
            <Sidebar />
        </view>
        
        
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import Home from '@/pages/home/home.vue'
import Job from '@/pages/job/job.vue'
import Resume from '@/pages/Resume/Resume.vue'
import Interview from '@/pages/Interview/Interview.vue'
import My from '@/pages/my/my.vue'

// 当前页面
const currentPage = ref('home')

// 监听页面切换事件
const handlePageChange = (page) => {
    console.log('页面切换到:', page)
    currentPage.value = page
}

onMounted(() => {
    console.log('App 挂载完成')
    uni.$on('pageChange', handlePageChange)
})

onUnmounted(() => {
    console.log('App 卸载')
    uni.$off('pageChange', handlePageChange)
})
</script>

<style>
/* 全局样式 */
page {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #0f172a;
}

.app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #0f172a;
}

.sidebar-fixed {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 240px;
    z-index: 1000;
    overflow: hidden;
    background: linear-gradient(180deg, #0f172a 0%, #0c1524 100%);
}

.main-content {
    flex: 1;
    margin-left: 240px;
    height: 100vh;
    overflow-y: auto;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.page-wrapper {
    min-height: 100%;
    animation: fadeIn 0.3s ease-in-out;
    padding: 24px;
    box-sizing: border-box;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 滚动条美化 */
.main-content::-webkit-scrollbar {
    width: 6px;
}

.main-content::-webkit-scrollbar-track {
    background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.main-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
