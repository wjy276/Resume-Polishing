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
				v-for="item in menuItems"
				:key="item.id"
				class="nav-item"
				:class="{ active: currentPage === item.id }"
				@click="switchPage(item.id)"
			>
				<text class="nav-icon">{{ item.icon }}</text>
				<text class="nav-text">{{ item.name }}</text>
			</view>
		</view>

		<!-- 用户信息 -->
		<view class="user-info">
			<view class="avatar-wrapper">
				<image
					src="https://java-ai-wrm.oss-cn-beijing.aliyuncs.com/2026/03/26b32fb2-0452-4117-9605-a90087ffb85c.png"
					mode="aspectFill"
					class="avatar-image"
				/>
				<view class="avatar-details">
					<text class="name">张同学</text>
					<text class="major">计算机科学与技术</text>
				</view>
			</view>
			<text class="settings-icon">⚙</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

// 导航菜单配置
const menuItems = ref([
	{ id: 'home', name: '首页', icon: '🏠' },
	{ id: 'job', name: '职位推荐', icon: '◎' },
	{ id: 'resume', name: '简历优化', icon: '📄' },
	{ id: 'interview', name: '模拟面试', icon: '💬' },
	{ id: 'my', name: '我的', icon: '👤' }
])

// 当前页面
const currentPage = ref('home')

// 切换页面
const switchPage = (pageId) => {
	currentPage.value = pageId
	
	// 使用 uni-app 路由跳转
	const pageMap = {
		home: '/pages/Home/Home',
		job: '/pages/Job/Job',
		resume: '/pages/Resume/Resume',
		interview: '/pages/Interview/Interview', 
		my: '/pages/My/My'
	}

	if (pageMap[pageId]) {
		uni.navigateTo({ 
			url: pageMap[pageId],
			fail: () => {
				// 如果页面已打开，使用 switchTab
				console.log('页面已打开或跳转失败')
			}
		})
	}
}
</script>

<style scoped lang="scss">
$sidebar-bg: #1e3a8a;
$sidebar-width: 400rpx;

.sidebar {
	width: $sidebar-width;
	background: $sidebar-bg;
	color: #ffffff;
	display: flex;
	flex-direction: column;
	padding: 48rpx;
	height: 100vh;
	position: fixed;
	left: 0;
	top: 0;
	z-index: 1000;
	box-shadow: 4rpx 0 16rpx rgba(0, 0, 0, 0.1);
}

.logo-section {
	display: flex;
	align-items: center;
	margin-bottom: 64rpx;
	padding-bottom: 48rpx;
	border-bottom: 2rpx solid rgba(255, 255, 255, 0.1);
}

.logo-icon {
	width: 96rpx;
	height: 96rpx;
	background: linear-gradient(135deg, #3b82f6, #06b6d4);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
	flex-shrink: 0;
}

.logo-star {
	font-size: 48rpx;
	color: #ffffff;
}

.logo-text {
	display: flex;
	flex-direction: column;
}

.logo-title {
	font-size: 40rpx;
	font-weight: 600;
	margin-bottom: 8rpx;
	white-space: nowrap;
}

.logo-subtitle {
	font-size: 24rpx;
	opacity: 0.8;
	white-space: nowrap;
}

.role-switch {
	display: flex;
	gap: 16rpx;
	margin-bottom: 48rpx;
}

.role-btn {
	flex: 1;
	padding: 20rpx 32rpx;
	border-radius: 16rpx;
	background: rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	cursor: pointer;
	transition: all 0.3s;
	font-size: 28rpx;
	border: none;
	color: #ffffff;

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
	gap: 16rpx;
}

.nav-item {
	padding: 28rpx 32rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	gap: 24rpx;
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
	font-size: 36rpx;
	width: 40rpx;
	text-align: center;
}

.nav-text {
	font-size: 30rpx;
}

.user-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 70rpx;
	padding-top: 48rpx;
	border-top: 2rpx solid rgba(255, 255, 255, 0.1);
}

.avatar-wrapper {
	display: flex;
	align-items: center;
	gap: 24rpx;
	flex: 1;
}

.avatar-image {
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	flex-shrink: 0;
}

.avatar-details {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	overflow: hidden;
}

.name {
	font-size: 28rpx;
	font-weight: 500;
	white-space: nowrap;
}

.major {
	font-size: 24rpx;
	opacity: 0.8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.settings-icon {
	font-size: 40rpx;
	opacity: 0.8;
	cursor: pointer;
	flex-shrink: 0;
	transition: opacity 0.3s;

	&:hover {
		opacity: 1;
	}
}
</style>