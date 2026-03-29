<template>
	<view class="sidebar">
		<!-- 页面切换加载遮罩 -->
		<view class="loading-overlay" :class="{ show: isNavigating }">
			<view class="loading-spinner">
				<view class="spinner-ring"></view>
				<view class="spinner-ring"></view>
				<view class="spinner-ring"></view>
			</view>
			<text class="loading-text">{{ loadingText }}</text>
		</view>

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
		<view class="user-info" @click="handleUserClick">
			<view class="avatar-wrapper">
				<image
					:src="userAvatar"
					mode="aspectFill"
					class="avatar-image"
				/>
				<view class="avatar-details">
					<text class="name">{{ userName }}</text>
					<text class="major">{{ userMajor }}</text>
				</view>
			</view>
			<text class="settings-icon" v-if="userStore.isLogin">⚙</text>
			<text class="login-hint" v-else>登录</text>
		</view>

		<!-- 登录/注册弹窗 -->
		<LoginPopup
			v-model:visible="showLoginPopup"
			@success="handleLoginSuccess"
		/>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()

// 登录弹窗状态
const showLoginPopup = ref(false)

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

// 导航加载状态
const isNavigating = ref(false)
const loadingText = ref('加载中...')

// 用户信息计算属性
const userName = computed(() => {
	if (userStore.isLogin && userStore.userInfo) {
		return userStore.userInfo.nickname || userStore.userInfo.username || '用户'
	}
	return '未登录'
})

const userMajor = computed(() => {
	if (userStore.isLogin) {
		return userStore.userInfo?.email || '点击登录'
	}
	return '点击登录账号'
})

const userAvatar = computed(() => {
	if (userStore.isLogin && userStore.userInfo?.avatar) {
		return userStore.userInfo.avatar
	}
	return 'https://java-ai-wrm.oss-cn-beijing.aliyuncs.com/2026/03/26b32fb2-0452-4117-9605-a90087ffb85c.png'
})

// 加载文字配置
const loadingTexts = {
	home: '正在进入首页...',
	job: '正在加载职位...',
	resume: '正在准备简历...',
	interview: '正在启动面试...',
	my: '正在加载个人中心...'
}

// 根据当前路由路径获取页面ID
const getPageIdFromRoute = () => {
	const pages = getCurrentPages()
	if (pages.length > 0) {
		const currentPage = pages[pages.length - 1]
		const route = currentPage.route || ''
		// 匹配路由路径
		if (route.includes('Home')) return 'home'
		if (route.includes('Job')) return 'job'
		if (route.includes('Resume')) return 'resume'
		if (route.includes('Interview')) return 'interview'
		if (route.includes('My')) return 'my'
	}
	return 'home'
}

// 切换页面
const switchPage = (pageId) => {
	// 如果正在导航或已经是当前页面，直接返回
	if (isNavigating.value || currentPage.value === pageId) return

	// 显示加载动画
	isNavigating.value = true
	loadingText.value = loadingTexts[pageId] || '加载中...'

	// 先更新状态，确保高光立即显示
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
		// 延迟一点跳转，让动画先显示
		setTimeout(() => {
			uni.redirectTo({
				url: pageMap[pageId],
				success: () => {
					// 页面跳转成功后隐藏加载
					setTimeout(() => {
						isNavigating.value = false
					}, 100)
				},
				fail: () => {
					// 如果 redirectTo 失败，尝试 navigateTo
					uni.navigateTo({
						url: pageMap[pageId],
						success: () => {
							setTimeout(() => {
								isNavigating.value = false
							}, 100)
						},
						fail: () => {
							isNavigating.value = false
							console.log('页面跳转失败')
						}
					})
				}
			})
		}, 150)
	}
}

// 点击用户区域
const handleUserClick = () => {
	if (userStore.isLogin) {
		// 已登录，跳转到个人中心
		switchPage('my')
	} else {
		// 未登录，显示登录弹窗
		showLoginPopup.value = true
	}
}

// 登录成功回调
const handleLoginSuccess = () => {
	uni.showToast({
		title: '登录成功',
		icon: 'success'
	})
}

// 组件挂载时同步当前页面状态
onMounted(() => {
	currentPage.value = getPageIdFromRoute()
	// 检查登录状态
	userStore.checkLogin()
})
</script>

<style scoped lang="scss">
$sidebar-bg: #1e3a8a;
$sidebar-width: 400rpx;

// 加载遮罩样式
.loading-overlay {
	position: fixed;
	top: 0;
	left: $sidebar-width;
	right: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(8rpx);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	opacity: 0;
	visibility: hidden;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	&.show {
		opacity: 1;
		visibility: visible;

		.loading-spinner {
			.spinner-ring {
				animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;

				&:nth-child(1) {
					animation-delay: -0.45s;
				}
				&:nth-child(2) {
					animation-delay: -0.3s;
				}
				&:nth-child(3) {
					animation-delay: -0.15s;
				}
			}
		}

		.loading-text {
			animation: fadeInUp 0.4s ease forwards;
		}
	}
}

.loading-spinner {
	display: flex;
	gap: 16rpx;
	margin-bottom: 32rpx;

	.spinner-ring {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3b82f6, #06b6d4);
		animation: none;
	}
}

.loading-text {
	font-size: 28rpx;
	color: #1e3a8a;
	font-weight: 500;
	letter-spacing: 2rpx;
	opacity: 0;
	transform: translateY(20rpx);
}

@keyframes spin {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(0.5);
		opacity: 0.5;
	}
	100% {
		transform: scale(1);
		opacity: 1;
	}
}

@keyframes fadeInUp {
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

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
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;

	// 点击波纹效果基础
	&::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width 0.6s ease, height 0.6s ease;
	}

	&.active {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
		box-shadow:
			0 4rpx 12rpx rgba(0, 0, 0, 0.15),
			inset 0 1rpx 0 rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(8rpx);
		border: 1rpx solid rgba(255, 255, 255, 0.2);

		.nav-text {
			font-weight: 600;
			letter-spacing: 1rpx;
		}

		.nav-icon {
			transform: scale(1.1);
			filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
		}

		// 左侧高光指示条
		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: 50%;
			transform: translateY(-50%);
			width: 6rpx;
			height: 60%;
			background: linear-gradient(180deg, #ffffff, rgba(255, 255, 255, 0.6));
			border-radius: 0 3rpx 3rpx 0;
			box-shadow: 0 0 12rpx rgba(255, 255, 255, 0.5);
		}
	}

	&:hover:not(.active) {
		background: rgba(255, 255, 255, 0.12);
		transform: translateX(8rpx);
	}

	&:active {
		transform: scale(0.98);
		background: rgba(255, 255, 255, 0.2);

		&::before {
			width: 200%;
			height: 200%;
		}
	}
}

.nav-icon {
	font-size: 36rpx;
	width: 40rpx;
	text-align: center;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-text {
	font-size: 30rpx;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.login-hint {
	font-size: 26rpx;
	color: #93c5fd;
	font-weight: 500;
	cursor: pointer;
	flex-shrink: 0;
}
</style>