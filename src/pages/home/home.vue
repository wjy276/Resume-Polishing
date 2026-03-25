<template>
	<view class="home-container">
		<!-- 侧边栏 -->
		<Sidebar />
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 顶部搜索栏 -->
			<view class="top-bar">
				<view class="search-wrapper">
					<text class="search-icon">🔍</text>
					<input 
						v-model="searchKeyword" 
						class="search-input" 
						placeholder="搜索岗位、公司或关键词..." 
						placeholder-class="search-placeholder"
					/>
				</view>
				<view class="top-right">
					<view class="notification">
						<text class="bell-icon">🔔</text>
						<view class="badge">3</view>
					</view>
					<image 
						src="https://java-ai-wrm.oss-cn-beijing.aliyuncs.com/2026/03/26b32fb2-0452-4117-9605-a90087ffb85c.png" 
						class="user-avatar" 
						mode="aspectFill"
					/>
				</view>
			</view>

			<!-- 欢迎横幅 -->
			<view class="welcome-banner">
				<view class="banner-content">
					<text class="greeting">早上好，张同学！</text>
					<text class="description">今天有 156 个新岗位等待您的探索，立即开始您的求职之旅吧！</text>
					<button class="start-btn" @click="startExplore">
						开始探索
						<text class="btn-arrow">→</text>
					</button>
				</view>
			</view>

			<!-- 功能卡片区域 -->
			<view class="cards-container">
				<view class="card-item resume-card">
					<view class="card-header">
						<view class="card-icon resume-icon">
							<text class="icon-text">📄</text>
						</view>
						<view class="status-badge">已优化 23 份</view>
					</view>
					<view class="card-body">
						<text class="card-title">简历优化</text>
						<text class="card-desc">AI 智能分析简历，根据目标岗位自动优化，提供专业修改建议</text>
						<button class="action-btn resume-btn" @click="goToResume">
							开始优化
							<text class="btn-arrow">→</text>
						</button>
					</view>
				</view>

				<view class="card-item job-card">
					<view class="card-header">
						<view class="card-icon job-icon">
							<text class="icon-text">💼</text>
						</view>
						<view class="status-badge">今日新增 156 个</view>
					</view>
					<view class="card-body">
						<text class="card-title">职位推荐</text>
						<text class="card-desc">基于技能画像智能匹配，精准推荐最适合您的岗位</text>
						<button class="action-btn job-btn" @click="goToJob">
							查看推荐
							<text class="btn-arrow">→</text>
						</button>
					</view>
				</view>

				<view class="card-item interview-card">
					<view class="card-header">
						<view class="card-icon interview-icon">
							<text class="icon-text">💬</text>
						</view>
						<view class="status-badge">已完成 12 次</view>
					</view>
					<view class="card-body">
						<text class="card-title">模拟面试</text>
						<text class="card-desc">AI 模拟真实面试场景，提升面试技巧，增强自信心</text>
						<button class="action-btn interview-btn" @click="goToInterview">
							开始面试
							<text class="btn-arrow">→</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 底部区域 -->
			<view class="bottom-section">
				<view class="section-item">
					<view class="section-left">
						<text class="section-icon">⏰</text>
						<text class="section-title">最近使用</text>
					</view>
					<text class="section-action">查看全部 →</text>
				</view>
				<view class="section-item">
					<view class="section-left">
						<text class="section-icon">❤️</text>
						<text class="section-title">收藏岗位</text>
					</view>
					<text class="section-action">查看全部 →</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

const searchKeyword = ref('')

const startExplore = () => {
	console.log('开始探索')
}

const goToResume = () => {
	uni.navigateTo({ url: '/pages/Resume/Resume' })
}

const goToJob = () => {
	uni.navigateTo({ url: '/pages/job/job' })
}

const goToInterview = () => {
	uni.navigateTo({ url: '/pages/Interview/Interview' })
}

console.log('首页已加载')
</script>

<style scoped lang="scss">
.home-container {
	display: flex;
	height: 100vh;
	background-color: #f9fafb;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 48rpx;
	overflow-y: auto;
}

// 顶部搜索栏
.top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 48rpx;
}

.search-wrapper {
	display: flex;
	align-items: center;
	width: 1000rpx;
	height: 88rpx;
	background: #ffffff;
	border-radius: 16rpx;
	padding: 0 32rpx;
	border: 2rpx solid #e5e7eb;
}

.search-icon {
	font-size: 36rpx;
	margin-right: 16rpx;
}

.search-input {
	flex: 1;
	height: 100%;
	border: none;
	outline: none;
	font-size: 28rpx;
}

.search-placeholder {
	color: #9ca3af;
}

.top-right {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.notification {
	position: relative;
	cursor: pointer;
}

.bell-icon {
	font-size: 48rpx;
}

.badge {
	position: absolute;
	top: -16rpx;
	right: -16rpx;
	background: #ef4444;
	color: white;
	font-size: 24rpx;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	min-width: 36rpx;
	text-align: center;
}

.user-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	cursor: pointer;
}

// 欢迎横幅
.welcome-banner {
	background: linear-gradient(135deg, #1e40af, #06b6d4);
	border-radius: 32rpx;
	padding: 64rpx;
	margin-bottom: 64rpx;
	color: white;
}

.banner-content {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.greeting {
	font-size: 56rpx;
	font-weight: 600;
}

.description {
	font-size: 30rpx;
	opacity: 0.95;
}

.start-btn {
	background: white;
	color: #1e40af;
	border: none;
	border-radius: 16rpx;
	padding: 24rpx 48rpx;
	font-size: 30rpx;
	font-weight: 500;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 12rpx;
	margin-top: 16rpx;
	transition: all 0.3s;

	&:hover {
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 24rpx rgba(255, 255, 255, 0.3);
	}
}

.btn-arrow {
	font-size: 32rpx;
}

// 功能卡片
.cards-container {
	display: flex;
	gap: 48rpx;
	margin-bottom: 64rpx;
}

.card-item {
	flex: 1;
	background: white;
	border-radius: 32rpx;
	padding: 48rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	transition: all 0.3s;
	cursor: pointer;

	&:hover {
		transform: translateY(-8rpx);
		box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.15);
	}
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx;
}

.card-icon {
	width: 112rpx;
	height: 112rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 56rpx;

	&.resume-icon {
		background: linear-gradient(135deg, #3b82f6, #06b6d4);
	}

	&.job-icon {
		background: linear-gradient(135deg, #10b981, #059669);
	}

	&.interview-icon {
		background: linear-gradient(135deg, #8b5cf6, #7c3aed);
	}
}

.icon-text {
	color: white;
}

.status-badge {
	background: #f3f4f6;
	color: #6b7280;
	font-size: 26rpx;
	padding: 12rpx 24rpx;
	border-radius: 24rpx;
}

.card-body {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.card-title {
	font-size: 40rpx;
	font-weight: 600;
	color: #1f2937;
}

.card-desc {
	font-size: 28rpx;
	color: #6b7280;
	line-height: 1.6;
}

.action-btn {
	background: #1e40af;
	color: white;
	border: none;
	border-radius: 16rpx;
	padding: 24rpx 40rpx;
	font-size: 30rpx;
	font-weight: 500;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	transition: all 0.3s;
	margin-top: 16rpx;

	&.resume-btn {
		background: linear-gradient(135deg, #3b82f6, #06b6d4);
	}

	&.job-btn {
		background: #111827;
	}

	&.interview-btn {
		background: #111827;
	}

	&:hover {
		opacity: 0.9;
		transform: translateY(-4rpx);
	}
}

// 底部区域
.bottom-section {
	display: flex;
	gap: 48rpx;
}

.section-item {
	flex: 1;
	background: white;
	border-radius: 24rpx;
	padding: 40rpx 48rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.section-left {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.section-icon {
	font-size: 40rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #1f2937;
}

.section-action {
	color: #3b82f6;
	font-size: 28rpx;
	cursor: pointer;
	transition: color 0.3s;

	&:hover {
		color: #2563eb;
	}
}
</style>
