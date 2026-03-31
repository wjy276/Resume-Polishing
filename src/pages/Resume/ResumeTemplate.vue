<template>
	<view class="template-container">
		<!-- 侧边栏 -->
		<Sidebar />

		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 顶部 -->
			<view class="page-header">
				<text class="page-title">简历分析结果</text>
				<text class="page-subtitle">AI 智能分析您的简历，提供专业优化建议</text>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner">
					<view class="spinner-item"></view>
					<view class="spinner-item"></view>
					<view class="spinner-item"></view>
				</view>
				<text class="loading-text">正在分析简历...</text>
			</view>

			<!-- 简历信息 -->
			<view v-else-if="resumeData" class="resume-content">
				<!-- 文件信息 -->
				<view class="info-card">
					<view class="card-header">
						<text class="card-icon">📄</text>
						<text class="card-title">文件信息</text>
					</view>
					<view class="card-body">
						<view class="info-row">
							<text class="info-label">文件名称</text>
							<text class="info-value">{{ resumeData.fileName || '未命名' }}</text>
						</view>
						<view class="info-row" v-if="resumeData.score">
							<text class="info-label">简历评分</text>
							<text class="info-value score">{{ resumeData.score }}分</text>
						</view>
					</view>
				</view>

				<!-- 简历解析内容 -->
				<view class="info-card" v-if="resumeData.parsedContent">
					<view class="card-header">
						<text class="card-icon">📋</text>
						<text class="card-title">简历内容</text>
					</view>
					<view class="card-body">
						<view class="content-section" v-if="resumeData.parsedContent.name">
							<text class="section-title">姓名</text>
							<text class="section-text">{{ resumeData.parsedContent.name }}</text>
						</view>
						<view class="content-section" v-if="resumeData.parsedContent.phone">
							<text class="section-title">电话</text>
							<text class="section-text">{{ resumeData.parsedContent.phone }}</text>
						</view>
						<view class="content-section" v-if="resumeData.parsedContent.email">
							<text class="section-title">邮箱</text>
							<text class="section-text">{{ resumeData.parsedContent.email }}</text>
						</view>
						<view class="content-section" v-if="resumeData.parsedContent.education">
							<text class="section-title">教育背景</text>
							<text class="section-text">{{ resumeData.parsedContent.education }}</text>
						</view>
						<view class="content-section" v-if="resumeData.parsedContent.experience">
							<text class="section-title">工作经历</text>
							<text class="section-text">{{ resumeData.parsedContent.experience }}</text>
						</view>
						<view class="content-section" v-if="resumeData.parsedContent.skills">
							<text class="section-title">技能特长</text>
							<text class="section-text">{{ resumeData.parsedContent.skills }}</text>
						</view>
					</view>
				</view>

				<!-- AI优化建议 -->
				<view class="info-card suggestion-card" v-if="resumeData.suggestions && resumeData.suggestions.length">
					<view class="card-header">
						<text class="card-icon">✨</text>
						<text class="card-title">AI 优化建议</text>
					</view>
					<view class="card-body">
						<view class="suggestion-item" v-for="(item, index) in resumeData.suggestions" :key="index">
							<text class="suggestion-bullet">•</text>
							<text class="suggestion-text">{{ item }}</text>
						</view>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="action-buttons">
					<view class="btn btn-primary" @click="handleOptimize">
						<text class="btn-text">一键优化</text>
					</view>
					<view class="btn btn-secondary" @click="handleReUpload">
						<text class="btn-text">重新上传</text>
					</view>
				</view>
			</view>

			<!-- 无数据状态 -->
			<view v-else class="empty-state">
				<text class="empty-icon">📭</text>
				<text class="empty-text">暂无简历数据</text>
				<view class="btn btn-primary" @click="goBack">
					<text class="btn-text">返回上传</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

// 简历数据
const resumeData = ref(null)
const loading = ref(true)

// 解析URL参数
const parseUrlParams = () => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	const options = currentPage.options || {}

	if (options.data) {
		try {
			// 解码并解析JSON
			const decodedData = decodeURIComponent(options.data)
			resumeData.value = JSON.parse(decodedData)
			console.log('解析的简历数据:', resumeData.value)
		} catch (e) {
			console.error('解析参数失败:', e)
			uni.showToast({
				title: '数据解析失败',
				icon: 'none'
			})
		}
	}

	loading.value = false
}

// 一键优化
const handleOptimize = () => {
	uni.showToast({
		title: '功能开发中',
		icon: 'none'
	})
}

// 重新上传
const handleReUpload = () => {
	uni.navigateBack()
}

// 返回上传页面
const goBack = () => {
	uni.navigateBack()
}

onMounted(() => {
	parseUrlParams()
})
</script>

<style scoped lang="scss">
.template-container {
	display: flex;
	height: 100vh;
	background-color: #f9fafb;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 64rpx;
	overflow-y: auto;
}

.page-header {
	margin-bottom: 48rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.page-title {
	font-size: 56rpx;
	font-weight: 600;
	color: #111827;
}

.page-subtitle {
	font-size: 32rpx;
	color: #6b7280;
}

// 加载状态
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.loading-spinner {
	display: flex;
	gap: 16rpx;
	margin-bottom: 24rpx;

	.spinner-item {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3b82f6, #06b6d4);
		animation: bounce 1.4s ease-in-out infinite;

		&:nth-child(1) { animation-delay: 0s; }
		&:nth-child(2) { animation-delay: 0.2s; }
		&:nth-child(3) { animation-delay: 0.4s; }
	}
}

@keyframes bounce {
	0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
	40% { transform: scale(1.2); opacity: 1; }
}

.loading-text {
	font-size: 28rpx;
	color: #6b7280;
}

// 信息卡片
.info-card {
	background: #ffffff;
	border-radius: 24rpx;
	margin-bottom: 32rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

.card-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 32rpx;
	background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
	border-bottom: 2rpx solid #e5e7eb;
}

.card-icon {
	font-size: 40rpx;
}

.card-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1e40af;
}

.card-body {
	padding: 32rpx;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f3f4f6;

	&:last-child {
		border-bottom: none;
	}
}

.info-label {
	font-size: 28rpx;
	color: #6b7280;
}

.info-value {
	font-size: 28rpx;
	color: #111827;
	font-weight: 500;

	&.score {
		color: #10b981;
		font-weight: 700;
	}
}

.content-section {
	margin-bottom: 32rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.section-title {
	font-size: 26rpx;
	color: #6b7280;
	margin-bottom: 12rpx;
	display: block;
}

.section-text {
	font-size: 30rpx;
	color: #111827;
	line-height: 1.6;
	display: block;
}

// 建议卡片
.suggestion-card {
	.card-header {
		background: linear-gradient(135deg, #fef3c7, #fde68a);
	}

	.card-title {
		color: #92400e;
	}
}

.suggestion-item {
	display: flex;
	align-items: flex-start;
	gap: 16rpx;
	margin-bottom: 20rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.suggestion-bullet {
	color: #f59e0b;
	font-size: 28rpx;
	line-height: 1.6;
}

.suggestion-text {
	font-size: 28rpx;
	color: #78350f;
	line-height: 1.6;
	flex: 1;
}

// 操作按钮
.action-buttons {
	display: flex;
	gap: 24rpx;
	margin-top: 48rpx;
}

.btn {
	flex: 1;
	padding: 28rpx 48rpx;
	border-radius: 16rpx;
	text-align: center;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		transform: translateY(-2rpx);
	}

	&:active {
		transform: translateY(0);
	}
}

.btn-primary {
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);

	.btn-text {
		color: #ffffff;
	}
}

.btn-secondary {
	background: #f3f4f6;

	.btn-text {
		color: #6b7280;
	}
}

.btn-text {
	font-size: 30rpx;
	font-weight: 500;
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 32rpx;
}

.empty-text {
	font-size: 32rpx;
	color: #9ca3af;
	margin-bottom: 48rpx;
}
</style>