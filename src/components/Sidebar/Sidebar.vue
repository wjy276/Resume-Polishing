<template>
	<view class="sidebar">
		<!-- Logo 区域 -->
		<view class="logo-section" @click="navigate('home')">
			<view class="logo-icon">
				<text class="logo-star">✦</text>
			</view>
			<view class="logo-text">
				<text class="logo-title">AI 求职助手</text>
				<text class="logo-subtitle">智能匹配 · 精准求职</text>
			</view>
		</view>

		<!-- 导航菜单 -->
		<view class="nav-menu">
			<view
				v-for="item in menuItems"
				:key="item.id"
				class="nav-item"
				:class="{ active: currentPage === item.id }"
				@click="navigate(item.id)"
			>
				<text class="nav-icon">{{ item.icon }}</text>
				<text class="nav-text">{{ item.name }}</text>
			</view>
		</view>

		<!-- 用户信息 -->
		<view class="user-info" @click="handleUserClick">
			<view class="avatar-wrapper">
				<image
					:src="displayAvatar"
					mode="aspectFill"
					class="avatar-image"
					@error="onAvatarError"
				/>
				<view class="avatar-details">
					<text class="name">{{ userName }}</text>
					<text class="major">{{ userMajor }}</text>
				</view>
			</view>
			<text class="settings-icon" v-if="isLogin" @click.stop="handleSettingsClick">⚙</text>
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
import { DEFAULT_AVATAR, resolveAvatar } from '@/utils/avatar'

// 登录弹窗状态
const showLoginPopup = ref(false)

// 登录状态
const isLogin = ref(false)
const userInfo = ref(null)

// 导航菜单配置
const menuItems = ref([
	{ id: 'home', name: '首页', icon: '🏠' },
	{ id: 'job', name: '职位推荐', icon: '◎' },
	{ id: 'resume', name: '简历优化', icon: '📄' },
	{ id: 'interview', name: '模拟面试', icon: '💬' },
	{ id: 'my', name: '我的', icon: '👤' }
])

// 当前页面 - 从 URL hash 计算（H5 hash 路由模式）
const currentPage = computed(() => {
	const hash = window.location.hash || ''
	if (hash.includes('/Job')) return 'job'
	if (hash.includes('/Resume/ResumeEditor')) return 'resume'
	if (hash.includes('/Resume')) return 'resume'
	if (hash.includes('/Interview')) return 'interview'
	if (hash.includes('/My')) return 'my'
	return 'home'
})

// 用户信息计算属性
const userName = computed(() => {
	if (isLogin.value && userInfo.value) {
		return userInfo.value.nickname || userInfo.value.username || '用户'
	}
	return '未登录'
})

const userMajor = computed(() => {
	if (isLogin.value && userInfo.value) {
		return userInfo.value.email || '已登录'
	}
	return '点击登录账号'
})

const avatarLoadFailed = ref(false)

const userAvatar = computed(() =>
	resolveAvatar(isLogin.value ? userInfo.value?.avatar : '')
)

const displayAvatar = computed(() =>
	avatarLoadFailed.value ? DEFAULT_AVATAR : userAvatar.value
)

function onAvatarError() {
	avatarLoadFailed.value = true
}

// 检查登录状态
const checkLoginStatus = () => {
	const token = uni.getStorageSync('token')
	const storedUserInfo = uni.getStorageSync('userInfo')

	if (token && storedUserInfo) {
		isLogin.value = true
		userInfo.value = storedUserInfo
	} else {
		isLogin.value = false
		userInfo.value = null
	}
}

// 页面映射
const pageMap = {
	home: '/#/pages/Home/Home',
	job: '/#/pages/Job/Job',
	resume: '/#/pages/Resume/Resume',
	interview: '/#/pages/Interview/Interview',
	my: '/#/pages/My/My'
}

// 导航 - 使用 window.location 直接跳转，避免 uni-app 路由的闪烁问题
const navigate = (pageId) => {
	if (currentPage.value === pageId) return

	const url = pageMap[pageId]
	if (url) {
		// 添加淡入动画类
		document.body.classList.add('page-transitioning')
		setTimeout(() => {
			window.location.href = url
		}, 50)
	}
}

// 点击设置图标
const handleSettingsClick = (e) => {
	if (e) e.stopPropagation()
	if (!isLogin.value) return

	uni.showActionSheet({
		itemList: ['退出登录'],
		success: (res) => {
			if (res.tapIndex === 0) {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					confirmText: '确定',
					cancelText: '取消',
					success: (modalRes) => {
						if (modalRes.confirm) {
							uni.removeStorageSync('token')
							uni.removeStorageSync('userInfo')
							isLogin.value = false
							userInfo.value = null
							uni.showToast({ title: '已退出登录', icon: 'success' })
							setTimeout(() => {
								window.location.href = '/#/pages/Home/Home'
							}, 500)
						}
					}
				})
			}
		}
	})
}

// 点击用户区域
const handleUserClick = () => {
	if (isLogin.value) {
		navigate('my')
	} else {
		showLoginPopup.value = true
	}
}

// 登录成功回调
const handleLoginSuccess = () => {
	checkLoginStatus()
}

// 组件挂载时检查登录状态
onMounted(() => {
	checkLoginStatus()
})
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
	padding: 32px 24px;
	height: 100vh;
	position: fixed;
	left: 0;
	top: 0;
	z-index: 1000;
	box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

.logo-section {
	display: flex;
	align-items: center;
	margin-bottom: 40px;
	padding-bottom: 24px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}
}

.logo-icon {
	width: 44px;
	height: 44px;
	background: linear-gradient(135deg, #3b82f6, #06b6d4);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 12px;
	flex-shrink: 0;
}

.logo-star {
	font-size: 22px;
	color: #ffffff;
}

.logo-text {
	display: flex;
	flex-direction: column;
}

.logo-title {
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 2px;
	white-space: nowrap;
}

.logo-subtitle {
	font-size: 12px;
	opacity: 0.7;
	white-space: nowrap;
}

.nav-menu {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.nav-item {
	padding: 12px 16px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	gap: 12px;
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	border: none;
	background: transparent;
	color: inherit;

	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 3px;
		background: #60a5fa;
		border-radius: 0 3px 3px 0;
		opacity: 0;
		transform: scaleY(0);
		transition: all 0.25s ease;
	}

	&.active {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08));
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15);

		&::before {
			opacity: 1;
			transform: scaleY(1);
		}

		.nav-text {
			font-weight: 600;
		}

		.nav-icon {
			transform: scale(1.1);
		}
	}

	&:hover:not(.active) {
		background: rgba(255, 255, 255, 0.1);
		transform: translateX(4px);
	}

	&:active {
		transform: scale(0.98);
	}
}

.nav-icon {
	font-size: 18px;
	width: 24px;
	text-align: center;
	transition: all 0.25s ease;
	display: inline-block;
}

.nav-text {
	font-size: 14px;
	transition: all 0.25s ease;
}

.user-info {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: auto;
	padding-top: 20px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}
}

.avatar-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: 1;
	min-width: 0;
}

.avatar-image {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	flex-shrink: 0;
	border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar-details {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
	overflow: hidden;
}

.name {
	font-size: 13px;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.major {
	font-size: 11px;
	opacity: 0.7;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.settings-icon {
	font-size: 18px;
	opacity: 0.7;
	cursor: pointer;
	flex-shrink: 0;
	transition: opacity 0.2s;
	padding: 4px;

	&:hover {
		opacity: 1;
	}
}

.login-hint {
	font-size: 12px;
	color: #93c5fd;
	font-weight: 500;
	cursor: pointer;
	flex-shrink: 0;
	padding: 4px 8px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.1);
	transition: background 0.2s;

	&:hover {
		background: rgba(255, 255, 255, 0.2);
	}
}
</style>