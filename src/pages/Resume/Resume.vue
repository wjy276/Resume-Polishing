<template>
    <Sidebar @page-change="handlePageChange">
        <view class="page-content">
            <view class="header">
                <text class="title">简历优化</text>
                <text class="subtitle">专业诊断，打造完美简历</text>
            </view>

            <!-- 上传区域 -->
            <view class="upload-section">
                <view class="upload-card">
                    <text class="upload-icon">📄</text>
                    <text class="upload-title">上传简历</text>
                    <text class="upload-desc">支持 PDF、Word 格式，最大 10MB</text>
                    <button class="upload-btn">选择文件</button>
                </view>
            </view>

            <!-- 简历诊断项 -->
            <view class="resume-items">
                <view class="resume-item">
                    <view class="item-header">
                        <text class="item-icon">📝</text>
                        <text class="item-title">基本信息完整性</text>
                        <text class="item-score">85 分</text>
                    </view>
                    <view class="progress-bar">
                        <view class="progress-fill" style="width: 85%"></view>
                    </view>
                    <view class="item-suggestions">
                        <text class="suggestion-text">• 建议添加个人作品集链接</text>
                    </view>
                </view>

                <view class="resume-item">
                    <view class="item-header">
                        <text class="item-icon">💼</text>
                        <text class="item-title">项目经历描述</text>
                        <text class="item-score">92 分</text>
                    </view>
                    <view class="progress-bar">
                        <view class="progress-fill" style="width: 92%"></view>
                    </view>
                    <view class="item-suggestions">
                        <text class="suggestion-text">• 项目描述清晰，突出了技术栈</text>
                        <text class="suggestion-text">• 建议量化项目成果</text>
                    </view>
                </view>

                <view class="resume-item">
                    <view class="item-header">
                        <text class="item-icon">🎯</text>
                        <text class="item-title">技能匹配度</text>
                        <text class="item-score">78 分</text>
                    </view>
                    <view class="progress-bar">
                        <view class="progress-fill" style="width: 78%"></view>
                    </view>
                    <view class="item-suggestions">
                        <text class="suggestion-text">• 建议补充 Vue3 相关项目经验</text>
                        <text class="suggestion-text">• 增加 TypeScript 技能描述</text>
                    </view>
                </view>
            </view>

            <!-- AI 建议 -->
            <view class="ai-suggestions">
                <view class="ai-header">
                    <text class="ai-icon">✨</text>
                    <text class="ai-title">AI 智能建议</text>
                </view>
                <view class="ai-content">
                    <text class="ai-text">您的简历整体质量不错！建议在项目经历中更多展示技术深度和解决问题的能力。可以补充具体的性能优化案例和技术选型思考。</text>
                </view>
            </view>
        </view>
    </Sidebar>
</template>

<script>
import Sidebar from '@/components/Sidebar/Sidebar.vue'

export default {
    name: 'Resume',
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

.upload-section {
    margin-bottom: 32px;
}

.upload-card {
    background: linear-gradient(135deg, #3b82f6, #06b6d4);
    padding: 40px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    
    .upload-icon {
        font-size: 64px;
        display: block;
        margin-bottom: 16px;
    }
    
    .upload-title {
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
        display: block;
        margin-bottom: 8px;
    }
    
    .upload-desc {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        display: block;
        margin-bottom: 24px;
    }
    
    .upload-btn {
        background: #ffffff;
        color: #3b82f6;
        border: none;
        padding: 12px 40px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
    }
}

.resume-items {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
}

.resume-item {
    background: #ffffff;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .item-icon {
        font-size: 24px;
    }
    
    .item-title {
        flex: 1;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
    }
    
    .item-score {
        font-size: 18px;
        font-weight: 700;
        color: #3b82f6;
    }
}

.progress-bar {
    height: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 12px;
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #10b981);
        border-radius: 4px;
        transition: width 0.3s;
    }
}

.item-suggestions {
    .suggestion-text {
        display: block;
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin-bottom: 4px;
    }
}

.ai-suggestions {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    padding: 24px;
    border-radius: 12px;
    border: 2px solid #f59e0b;
}

.ai-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    
    .ai-icon {
        font-size: 24px;
    }
    
    .ai-title {
        font-size: 18px;
        font-weight: 600;
        color: #92400e;
    }
}

.ai-content {
    .ai-text {
        font-size: 15px;
        line-height: 1.8;
        color: #78350f;
    }
}
</style>