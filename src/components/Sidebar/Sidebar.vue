<template>
    <view class="sidebar">
        <!-- Logo 区域 -->
        <view class="logo-section">
            <view class="logo-icon">
                <text class="logo-star">✦</text>
            </view>
            <view class="logo-text">
                <text class="logo-title">AI 求职助手</text>
                <text class="logo-subtitle">智能匹配 · 精准求职</text>
            </view>
        </view>

        <!-- 身份切换 -->
        <view class="role-switch">
            <view class="role-btn active">
                <text class="role-icon">🎓</text>
                <text>学生</text>
            </view>
            <view class="role-btn">
                <text class="role-icon">👥</text>
                <text>辅导员</text>
            </view>
        </view>

        <!-- 导航菜单 -->
        <view class="nav-menu">
            <view 
                class="nav-item" 
                :class="{ active: currentPage === 'home' }"
                @click="switchPage('home')"
            >
                <text class="nav-icon">🏠</text>
                <text class="nav-text">首页</text>
            </view>
            <view 
                class="nav-item"
                :class="{ active: currentPage === 'job' }"
                @click="switchPage('job')"
            >
                <text class="nav-icon">◎</text>
                <text class="nav-text">职位推荐</text>
            </view>
            <view 
                class="nav-item"
                :class="{ active: currentPage === 'resume' }"
                @click="switchPage('resume')"
            >
                <text class="nav-icon">📄</text>
                <text class="nav-text">简历优化</text>
            </view>
            <view 
                class="nav-item"
                :class="{ active: currentPage === 'interview' }"
                @click="switchPage('interview')"
            >
                <text class="nav-icon">💬</text>
                <text class="nav-text">模拟面试</text>
            </view>
        </view>

        <view class="sidebar-footer">
            <view class="sidebar-footer-item">
                <view>
                    <image
                        src="https://java-ai-wrm.oss-cn-beijing.aliyuncs.com/2026/03/26b32fb2-0452-4117-9605-a90087ffb85c.png"
                        mode="scaleToFill"
                        class="avatar-image"
                    />
                </view>
                <view class="avatar-info">
                    <view>
                        <text>111</text>
                    </view>
                    <view>
                        <text>111</text>
                    </view>
                </view>
                <view>
                    <icon
                        type=""
                        :size="23"
                        color=""
                    />
                </view>
            </view>

        </view>
        <!-- 底部区域 -->
        <!-- <view class="sidebar-footer">
            <view class="issue-badge">
                <text class="issue-icon">N</text>
                <text class="issue-text">1 Issue</text>
                <text class="issue-close" @click.stop="closeIssue">×</text>
            </view>
            <view class="settings-icon" @click.stop="openSettings">⚙</view>
        </view> -->
    </view>
</template>

<script setup>
import { ref } from 'vue'

// 当前页面
const currentPage = ref('home')

// 切换页面
const switchPage = (page) => {
    currentPage.value = page
    // 触发事件通知父组件
    emit('page-change', page)
}

// 定义事件
const emit = defineEmits(['page-change'])

// 关闭 Issue
const closeIssue = () => {
    console.log('关闭 Issue 提示')
}

// 打开设置
const openSettings = () => {
    console.log('打开设置')
}
</script>

<style lang="scss" scoped>
$sidebar-bg: #1e3a8a;
$sidebar-width: 240px;

.sidebar {
    width: $sidebar-width;
    background: $sidebar-bg;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 24px;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
}

.logo-section {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
}

.logo-star {
    font-size: 24px;
    color: #ffffff;
}

.logo-text {
    display: flex;
    flex-direction: column;
}

.logo-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 4px;
}

.logo-subtitle {
    font-size: 12px;
    opacity: 0.8;
}

.role-switch {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
}

.role-btn {
    flex: 1;
    padding: 10px 16px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 14px;

    &.active {
        background: #ffffff;
        color: $sidebar-bg;
        font-weight: 500;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.2);
    }
}

.nav-menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.nav-item {
    padding: 14px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s;

    &.active {
        background: rgba(255, 255, 255, 0.15);
    }

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
}

.nav-icon {
    font-size: 18px;
    width: 20px;
}

.nav-text {
    font-size: 15px;
}

.sidebar-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24rpx;
    border-top: 2rpx solid rgba(255, 255, 255, 0.1);
}
.sidebar-footer-item{
    display: flex;
    margin-bottom: 60rpx;
}
.avatar-info{
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-left: 40rpx;
    margin-bottom: 20rpx;
    font-size: 30rpx;

}
.avatar-image{
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
}

.issue-badge {
    background: #ef4444;
    padding: 8px 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
}

.issue-icon {
    font-weight: 600;
}

.issue-close {
    margin-left: 4px;
    cursor: pointer;
    opacity: 0.8;

    &:hover {
        opacity: 1;
    }
}

.settings-icon {
    font-size: 20px;
    opacity: 0.8;
    cursor: pointer;

    &:hover {
        opacity: 1;
    }
}
</style>
