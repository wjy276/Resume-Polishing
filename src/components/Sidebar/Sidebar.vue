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
	z-index: 1000;
	box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
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
	flex-shrink: 0;
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
	white-space: nowrap;
}

.logo-subtitle {
	font-size: 12px;
	opacity: 0.8;
	white-space: nowrap;
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
	text-align: center;
}

.nav-text {
	font-size: 15px;
}

.user-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 70rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid rgba(255, 255, 255, 0.1);
}

.avatar-wrapper {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: 1;
}

.avatar-image {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	flex-shrink: 0;
}

.avatar-details {
	display: flex;
	flex-direction: column;
	gap: 4px;
	overflow: hidden;
}

.name {
	font-size: 14px;
	font-weight: 500;
	white-space: nowrap;
}

.major {
	font-size: 12px;
	opacity: 0.8;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.settings-icon {
	font-size: 20px;
	opacity: 0.8;
	cursor: pointer;
	flex-shrink: 0;
	transition: opacity 0.3s;

	&:hover {
		opacity: 1;
	}
}
</style>