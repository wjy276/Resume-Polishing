<template>
    <Sidebar @page-change="handlePageChange">
        <view class="page-content">
            <view class="header">
                <text class="title">模拟面试</text>
                <text class="subtitle">AI 面试官，实战演练提升面试能力</text>
            </view>

            <!-- 面试模式选择 -->
            <view class="mode-section">
                <view class="mode-card active">
                    <text class="mode-icon">🎯</text>
                    <text class="mode-title">智能面试</text>
                    <text class="mode-desc">AI 根据岗位自动出题</text>
                    <text class="mode-tag">推荐</text>
                </view>
                <view class="mode-card">
                    <text class="mode-icon">📚</text>
                    <text class="mode-title">专项练习</text>
                    <text class="mode-desc">选择特定知识点练习</text>
                </view>
                <view class="mode-card">
                    <text class="mode-icon">⏱️</text>
                    <text class="mode-title">全真模拟</text>
                    <text class="mode-desc">完整面试流程体验</text>
                </view>
            </view>

            <!-- 面试记录 -->
            <view class="interview-records">
                <view class="section-title">最近面试记录</view>
                
                <view class="record-item">
                    <view class="record-header">
                        <text class="record-title">前端开发模拟面试</text>
                        <text class="record-score">85 分</text>
                    </view>
                    <view class="record-info">
                        <text class="record-date">2024-03-20 14:30</text>
                        <text class="record-duration">用时 25 分钟</text>
                    </view>
                    <view class="record-tags">
                        <text class="record-tag">JavaScript</text>
                        <text class="record-tag">Vue</text>
                        <text class="record-tag">CSS</text>
                    </view>
                </view>

                <view class="record-item">
                    <view class="record-header">
                        <text class="record-title">数据结构专项练习</text>
                        <text class="record-score">92 分</text>
                    </view>
                    <view class="record-info">
                        <text class="record-date">2024-03-19 10:15</text>
                        <text class="record-duration">用时 18 分钟</text>
                    </view>
                    <view class="record-tags">
                        <text class="record-tag">算法</text>
                        <text class="record-tag">数据结构</text>
                    </view>
                </view>
            </view>

            <!-- 开始面试按钮 -->
            <view class="start-section">
                <button class="start-btn">
                    <text class="btn-icon">▶️</text>
                    <text class="btn-text">开始面试</text>
                </button>
            </view>
        </view>
    </Sidebar>
</template>

<script>
import Sidebar from '@/components/Sidebar/Sidebar.vue'

export default {
    name: 'Interview',
    components: {
        Sidebar
    },
    methods: {
        handlePageChange(page) {
            console.log('页面切换到:', page)
        }
    }
}
</script>

<style lang="scss" scoped>
.page-content {
    padding: 32px;
    background-color: #f9fafb;
    min-height: 100vh;
}

.header {
    margin-bottom: 32px;
    
    .title {
        font-size: 28px;
        font-weight: 600;
        color: #111827;
        display: block;
        margin-bottom: 8px;
    }
    
    .subtitle {
        font-size: 16px;
        color: #6b7280;
        display: block;
    }
}

.mode-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 32px;
}

.mode-card {
    background: #ffffff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
    text-align: center;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &.active {
        border: 2px solid #3b82f6;
        background: #eff6ff;
    }
    
    .mode-icon {
        font-size: 48px;
        display: block;
        margin-bottom: 16px;
    }
    
    .mode-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        display: block;
        margin-bottom: 8px;
    }
    
    .mode-desc {
        font-size: 14px;
        color: #6b7280;
        display: block;
        margin-bottom: 12px;
    }
    
    .mode-tag {
        background: #ef4444;
        color: #ffffff;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        position: absolute;
        top: 12px;
        right: 12px;
    }
}

.interview-records {
    margin-bottom: 32px;
    
    .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 16px;
    }
}

.record-item {
    background: #ffffff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 16px;
}

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .record-title {
        font-size: 16px;
        font-weight: 600;
        color: #111827;
    }
    
    .record-score {
        font-size: 20px;
        font-weight: 700;
        color: #10b981;
    }
}

.record-info {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
    
    .record-date,
    .record-duration {
        font-size: 14px;
        color: #6b7280;
    }
}

.record-tags {
    display: flex;
    gap: 8px;
    
    .record-tag {
        padding: 4px 12px;
        background: #f3f4f6;
        color: #374151;
        border-radius: 4px;
        font-size: 12px;
    }
}

.start-section {
    text-align: center;
}

.start-btn {
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    color: #ffffff;
    border: none;
    padding: 16px 60px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }
}

.btn-icon {
    font-size: 20px;
}
</style>
