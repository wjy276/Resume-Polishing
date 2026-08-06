<!-- 个人详情页面 -->

<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main my-main">
			<!-- 用户信息头部 -->
			<view class="user-header">
				<view class="avatar-section">
					<image
						:src="displayAvatar"
						class="user-avatar"
						mode="aspectFill"
						@error="onAvatarError"
					/>
				<view class="user-info">
					<text class="user-name">{{ displayUserName }}</text>
					<text class="user-major">{{ displayUserMajor }}</text>
					<text class="user-stats">{{ displayUserStats }}</text>
				</view>
				</view>
				<button class="edit-btn" @click="editProfile">编辑资料</button>
			</view>

			<!-- 功能菜单 -->
			<view class="menu-section">
				<view class="menu-group">
					<text class="group-title">求职管理</text>
					<view class="menu-item" v-for="item in jobMenus" :key="item.id" @click="handleMenuClick(item)">
						<text class="menu-icon">{{ item.icon }}</text>
						<text class="menu-text">{{ item.name }}</text>
						<text class="menu-arrow">›</text>
					</view>
				</view>

				<view class="menu-group">
					<text class="group-title">学习中心</text>
					<view class="menu-item" v-for="item in studyMenus" :key="item.id" @click="handleMenuClick(item)">
						<text class="menu-icon">{{ item.icon }}</text>
						<text class="menu-text">{{ item.name }}</text>
						<view class="menu-extra">
							<text class="menu-badge" v-if="item.badge">{{ item.badge }}</text>
							<text class="menu-arrow">›</text>
						</view>
					</view>
				</view>

				<view class="menu-group">
					<text class="group-title">设置</text>
					<view class="menu-item" v-for="item in settingMenus" :key="item.id" @click="handleMenuClick(item)">
						<text class="menu-icon">{{ item.icon }}</text>
						<text class="menu-text">{{ item.name }}</text>
						<text class="menu-arrow">›</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { useUserStore } from '@/stores/user'
import { DEFAULT_AVATAR, resolveAvatar } from '@/utils/avatar'

const userStore = useUserStore()
const { userInfo, isLogin } = storeToRefs(userStore)

const avatarLoadFailed = ref(false)

const userAvatar = computed(() =>
	resolveAvatar(isLogin.value ? userInfo.value?.avatar : '')
)
const displayAvatar = computed(() =>
	avatarLoadFailed.value ? DEFAULT_AVATAR : userAvatar.value
)

const displayUserName = computed(() => {
	if (isLogin.value && userInfo.value) {
		return userInfo.value.nickname || userInfo.value.username || '张同学'
	}
	return '张同学'
})

const displayUserMajor = computed(() => {
	if (isLogin.value && userInfo.value?.email) {
		return userInfo.value.email
	}
	return '计算机科学与技术 · 本科应届生'
})

const displayUserStats = computed(() => {
	if (isLogin.value) return '已登录 | 求职意向：前端工程师'
	return '未登录 | 点击登录账号'
})

watch(userAvatar, () => {
	avatarLoadFailed.value = false
})

function onAvatarError() {
	avatarLoadFailed.value = true
}

onMounted(() => {
	userStore.checkLogin()
})

const jobMenus = ref([
	{ id: 'resume', name: '我的简历', icon: '📄' },
	{ id: 'applications', name: '投递记录', icon: '📤' },
	{ id: 'favorites', name: '收藏岗位', icon: '❤️' },
	{ id: 'interviews', name: '面试安排', icon: '📅' }
])

const studyMenus = ref([
	{ id: 'courses', name: '学习课程', icon: '📚' },
	{ id: 'practice', name: '练习记录', icon: '✍️' },
	{ id: 'mock', name: '模拟面试', icon: '💬', badge: '新' }
])

const settingMenus = ref([
	{ id: 'notification', name: '消息通知', icon: '🔔' },
	{ id: 'privacy', name: '隐私设置', icon: '🔒' },
	{ id: 'feedback', name: '帮助与反馈', icon: '💬' },
	{ id: 'about', name: '关于我们', icon: 'ℹ️' }
])

const handleMenuClick = (item) => {
	uni.showToast({
		title: `功能开发中：${item.name}`,
		icon: 'none'
	})
}

const editProfile = () => {
	console.log('编辑资料')
}
</script>

<style scoped lang="scss">
.my-main {
	margin-left: var(--sidebar-width, 240px);
	padding: 20px 32px 40px;
}

// 用户信息头部
.user-header {
	background: var(--bg-card);
	padding: 28px 32px;
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--border-color);
	margin-bottom: 20px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	transition: all 0.25s ease;

	&:hover {
		box-shadow: var(--shadow-md);
	}
}

.avatar-section {
	display: flex;
	align-items: center;
	gap: 20px;
}

.user-avatar {
	width: 72px;
	height: 72px;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid var(--border-color);
}

.user-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.user-name {
	font-size: 20px;
	font-weight: 700;
	color: var(--text-primary);
}

.user-major {
	font-size: 14px;
	color: var(--text-secondary);
}

.user-stats {
	font-size: 13px;
	color: var(--primary-light);
}

.edit-btn {
	background: var(--primary-light);
	color: #fff;
	border: none;
	padding: 8px 20px;
	border-radius: var(--radius-sm);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}
}

// 功能菜单
.menu-section {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.menu-group {
	background: var(--bg-card);
	border-radius: var(--radius-md);
	overflow: hidden;
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--border-color);
	transition: all 0.25s ease;

	&:hover {
		box-shadow: var(--shadow-md);
	}
}

.group-title {
	display: block;
	padding: 14px 20px;
	background: #f9fafb;
	font-size: 13px;
	font-weight: 600;
	color: var(--text-secondary);
	border-bottom: 1px solid var(--border-color);
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 14px 20px;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		background: #f9fafb;
	}

	&:not(:last-child) {
		border-bottom: 1px solid #f3f4f6;
	}
}

.menu-icon {
	font-size: 20px;
	margin-right: 12px;
	width: 24px;
	text-align: center;
}

.menu-text {
	flex: 1;
	font-size: 14px;
	color: var(--text-primary);
}

.menu-extra {
	display: flex;
	align-items: center;
	gap: 8px;
}

.menu-badge {
	background: var(--danger-color);
	color: #fff;
	padding: 2px 8px;
	border-radius: 10px;
	font-size: 11px;
	font-weight: 500;
}

.menu-arrow {
	font-size: 20px;
	color: var(--text-muted);
}
</style>