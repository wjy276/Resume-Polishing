<template>
	<view class="my-container">
		<!-- 侧边栏 -->
		<Sidebar />
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 用户信息头部 -->
			<view class="user-header">
				<view class="avatar-section">
					<image 
						src="https://java-ai-wrm.oss-cn-beijing.aliyuncs.com/2026/03/26b32fb2-0452-4117-9605-a90087ffb85c.png" 
						class="user-avatar" 
						mode="aspectFill"
					/>
					<view class="user-info">
						<text class="user-name">张同学</text>
						<text class="user-major">计算机科学与技术 · 本科应届生</text>
						<text class="user-stats">已完善简历 | 求职意向：前端工程师</text>
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
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

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
	console.log('点击菜单:', item.name)
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
.my-container {
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

// 用户信息头部
.user-header {
	background: #ffffff;
	padding: 64rpx;
	border-radius: 32rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
	margin-bottom: 48rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.avatar-section {
	display: flex;
	align-items: center;
	gap: 40rpx;
}

.user-avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
}

.user-info {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.user-name {
	font-size: 48rpx;
	font-weight: 600;
	color: #111827;
}

.user-major {
	font-size: 28rpx;
	color: #6b7280;
}

.user-stats {
	font-size: 26rpx;
	color: #3b82f6;
}

.edit-btn {
	background: #3b82f6;
	color: #ffffff;
	border: none;
	padding: 24rpx 48rpx;
	border-radius: 16rpx;
	font-size: 30rpx;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		background: #2563eb;
	}
}

// 功能菜单
.menu-section {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.menu-group {
	background: #ffffff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.group-title {
	display: block;
	padding: 32rpx 40rpx;
	background: #f9fafb;
	font-size: 28rpx;
	font-weight: 600;
	color: #6b7280;
	border-bottom: 2rpx solid #e5e7eb;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 32rpx 40rpx;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		background: #f9fafb;
	}
}

.menu-icon {
	font-size: 40rpx;
	margin-right: 24rpx;
	width: 48rpx;
	text-align: center;
}

.menu-text {
	flex: 1;
	font-size: 30rpx;
	color: #111827;
}

.menu-extra {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.menu-badge {
	background: #ef4444;
	color: #ffffff;
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.menu-arrow {
	font-size: 48rpx;
	color: #9ca3af;
}
</style>
