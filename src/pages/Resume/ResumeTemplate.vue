<!-- 简历优化 -->
<!-- 时间： 2026.4.1-->

<template>
	<view class="resume-template">
		<!-- 侧边栏 -->
		<Sidebar />

		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 顶部搜索栏 -->
			<view class="header">
				<view class="search-bar">
					<text class="search-icon"></text>
					<input type="text" placeholder="搜索岗位、公司或关键词..." class="search-input" />
				</view>
				<view class="header-right">
					<view class="notification-badge">
						<text class="bell-icon">🔔</text>
						<view class="badge-count">3</view>
					</view>
					<image src="/static/avatar.png" class="user-avatar" mode="aspectFill" />
				</view>
			</view>

			<!-- 标题与进度 -->
			<view class="title-section">
				<view class="title-left">
					<text class="main-title">简历优化器</text>
					<text class="sub-title">AI 智能分析简历，按模块优化提升匹配度</text>
				</view>
				<view class="progress-section">
					<text class="progress-label">优化进度</text>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
					</view>
					<text class="progress-value">{{ progressPercent }}%</text>
					<view class="re-upload-btn" @click="handleReUpload">
						<text class="btn-text">重新上传</text>
					</view>
				</view>
			</view>

			<!-- 简历模块网格 -->
			<view class="modules-grid">
				<!-- 个人介绍 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">👤</text>
							</view>
							<text class="module-title">个人介绍</text>
						</view>
						<view class="ai-optimize" @click="handleOptimize('personal')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">AI 优化</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<text class="content-text">张同学</text>
							<text class="content-text">前端工程师 | 3 年经验</text>
							<text class="content-text">手机：138****8888 | 邮箱：zhang@example.com</text>
							<text class="content-text">求职意向：前端开发工程师 | 期望薪资：20-30K</text>
						</view>
					</view>
				</view>

				<!-- 教育背景 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">🎓</text>
							</view>
							<text class="module-title">教育背景</text>
						</view>
						<view class="ai-optimize" @click="handleOptimize('education')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">AI 优化</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<text class="content-text">某某大学 | 计算机科学与技术 | 本科</text>
							<text class="content-text">2019.09 - 2023.06</text>
							<text class="content-text">主修课程：数据结构、算法设计、计算机网络、Web 开发</text>
						</view>
					</view>
				</view>

				<!-- 工作经历 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">💼</text>
							</view>
							<text class="module-title">工作经历</text>
						</view>
						<view class="ai-optimize" @click="handleOptimize('work')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">AI 优化</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<text class="content-text">ABC 科技有限公司 | 前端开发工程师</text>
							<text class="content-text">2023.07 - 至今</text>
							<text class="content-text">负责公司核心产品的前端开发，使用 Vue3 + TypeScript 技术栈</text>
						</view>
					</view>
				</view>

				<!-- 项目经验 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">📦</text>
							</view>
							<text class="module-title">项目经验</text>
						</view>
						<view class="ai-optimize" @click="handleOptimize('project')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">AI 优化</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<text class="content-text">校园电商平台 | 前端负责人</text>
							<text class="content-text">2022.03 - 2022.12</text>
							<text class="content-text">独立完成平台前端架构设计和核心功能开发</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部操作区 -->
			<view class="footer-actions">
				<view class="footer-left">
					<view class="action-btn" @click="handleExportPDF">
						<text class="btn-icon">⬇️</text>
						<text class="btn-text">导出 PDF</text>
					</view>
					<view class="action-btn save-btn" @click="handleSaveVersion">
						<text class="btn-text">保存版本</text>
					</view>
				</view>
				<view class="footer-right">
					<view class="status-info">
						<text class="status-text">已优化 {{ optimizedCount }}/5 个模块</text>
					</view>
					<view class="optimize-all-btn" @click="handleOptimizeAll">
						<text class="btn-text">一键优化全部</text>
						<text class="sparkle-icon">✨</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 优化进度
const progressPercent = ref(0)
const optimizedCount = ref(0)

// AI 优化处理
const handleOptimize = (type) => {
	console.log('优化类型:', type)
	
	// 模拟优化过程
	uni.showLoading({
		title: 'AI 优化中...',
		mask: true
	})

	setTimeout(() => {
		uni.hideLoading()
		optimizedCount.value = Math.min(optimizedCount.value + 1, 5)
		progressPercent.value = Math.round((optimizedCount.value / 5) * 100)
		
		uni.showToast({
			title: '优化完成',
			icon: 'success'
		})
	}, 1500)
}

// 一键优化全部
const handleOptimizeAll = () => {
	console.log('一键优化全部')
	
	uni.showLoading({
		title: 'AI 优化中...',
		mask: true
	})

	setTimeout(() => {
		uni.hideLoading()
		optimizedCount.value = 5
		progressPercent.value = 100
		
		uni.showToast({
			title: '全部优化完成',
			icon: 'success'
		})
	}, 2000)
}

// 导出 PDF
const handleExportPDF = () => {
	uni.showToast({
		title: '导出功能开发中',
		icon: 'none'
	})
}

// 保存版本
const handleSaveVersion = () => {
	uni.showToast({
		title: '保存功能开发中',
		icon: 'none'
	})
}

// 重新上传
const handleReUpload = () => {
	uni.showModal({
		title: '提示',
		content: '确定要重新上传简历吗？当前未保存的内容将会丢失。',
		success: (res) => {
			if (res.confirm) {
				optimizedCount.value = 0
				progressPercent.value = 0
				uni.navigateBack()
			}
		}
	})
}
</script>

<style scoped lang="scss">
.resume-template {
	display: flex;
	height: 100vh;
	background-color: #f5f7fa;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 0;
	overflow-y: auto;
	background-color: #f5f7fa;
}

// 顶部搜索栏
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 48rpx;
	background-color: #ffffff;
	border-bottom: 2rpx solid #f0f2f5;
}

.search-bar {
	display: flex;
	align-items: center;
	width: 60%;
	padding: 20rpx 32rpx;
	background-color: #f5f7fa;
	border-radius: 48rpx;
	border: 2rpx solid #e8eaed;
}

.search-icon {
	font-size: 32rpx;
	margin-right: 16rpx;
}

.search-input {
	flex: 1;
	font-size: 28rpx;
	color: #333333;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.notification-badge {
	position: relative;
	display: flex;
	align-items: center;
}

.bell-icon {
	font-size: 40rpx;
}

.badge-count {
	position: absolute;
	top: -8rpx;
	right: -8rpx;
	background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
	color: #ffffff;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	font-weight: 600;
}

.user-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	border: 4rpx solid #e8eaed;
}

// 标题与进度
.title-section {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 48rpx 48rpx 32rpx;
}

.title-left {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.main-title {
	font-size: 56rpx;
	font-weight: 700;
	color: #1a1a1a;
}

.sub-title {
	font-size: 28rpx;
	color: #666666;
}

.progress-section {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.progress-label {
	font-size: 28rpx;
	color: #666666;
}

.progress-bar {
	width: 300rpx;
	height: 16rpx;
	background-color: #e8eaed;
	border-radius: 8rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #06b6d4);
	border-radius: 8rpx;
	transition: width 0.3s ease;
}

.progress-value {
	font-size: 28rpx;
	color: #3b82f6;
	font-weight: 600;
	width: 60rpx;
	text-align: center;
}

.re-upload-btn {
	padding: 16rpx 32rpx;
	background-color: #ffffff;
	border: 2rpx solid #e8eaed;
	border-radius: 12rpx;
	
	.btn-text {
		font-size: 26rpx;
		color: #666666;
		font-weight: 500;
	}
}

// 简历模块网格
.modules-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 32rpx;
	padding: 0 48rpx 48rpx;
}

.module-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
	
	&:hover {
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
		transform: translateY(-4rpx);
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.icon-box {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
	border-radius: 16rpx;
}

.module-icon {
	font-size: 36rpx;
}

.module-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.ai-optimize {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
	border-radius: 24rpx;
	cursor: pointer;
	transition: all 0.3s ease;
	
	&:hover {
		background: linear-gradient(135deg, #bae6fd, #e0f2fe);
	}
}

.sparkle-icon {
	font-size: 28rpx;
}

.optimize-text {
	font-size: 26rpx;
	color: #0284c7;
	font-weight: 500;
}

.card-content {
	background: linear-gradient(135deg, #f9fafb, #f3f4f6);
	border-radius: 16rpx;
	padding: 24rpx;
}

.content-box {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.content-text {
	font-size: 28rpx;
	color: #4b5563;
	line-height: 1.8;
}

// 底部操作区
.footer-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 48rpx;
	background-color: #ffffff;
	border-top: 2rpx solid #f0f2f5;
	position: sticky;
	bottom: 0;
}

.footer-left {
	display: flex;
	gap: 24rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx 32rpx;
	background-color: #ffffff;
	border: 2rpx solid #e8eaed;
	border-radius: 16rpx;
	cursor: pointer;
	transition: all 0.3s ease;
	
	&:hover {
		border-color: #3b82f6;
		background-color: #f0f9ff;
	}
	
	&:active {
		transform: scale(0.98);
	}
}

.btn-icon {
	font-size: 32rpx;
}

.btn-text {
	font-size: 28rpx;
	color: #666666;
	font-weight: 500;
}

.save-btn {
	.btn-text {
		color: #666666;
	}
}

.footer-right {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.status-info {
	padding: 16rpx 24rpx;
	background: linear-gradient(135deg, #dcfce7, #bbf7d0);
	border-radius: 24rpx;
}

.status-text {
	font-size: 26rpx;
	color: #16a34a;
	font-weight: 500;
}

.optimize-all-btn {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx 40rpx;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	border-radius: 16rpx;
	cursor: pointer;
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
	transition: all 0.3s ease;
	
	&:hover {
		box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.4);
		transform: translateY(-2rpx);
	}
	
	&:active {
		transform: translateY(0);
	}
	
	.btn-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 600;
	}
	
	.sparkle-icon {
		font-size: 32rpx;
	}
}
</style>