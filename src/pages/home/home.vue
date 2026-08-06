<template>
	<view class="page-layout">
		<!-- 侧边栏 -->
		<Sidebar />

		<!-- 主内容区 -->
		<view class="page-main home-main">
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
						:src="displayAvatar"
						class="user-avatar"
						mode="aspectFill"
						@error="onAvatarError"
					/>
				</view>
			</view>

			<!-- 欢迎横幅 -->
			<view class="welcome-banner">
				<view class="banner-content">
					<text class="greeting">{{ greeting }}，{{ userName }}！</text>
					<text class="description">今天有 {{ todayJobs }} 个新岗位等待您的探索，立即开始您的求职之旅吧！</text>
					<button class="start-btn" @click="startExplore">
						开始探索
						<text class="btn-arrow">→</text>
					</button>
				</view>
			</view>

			<!-- 功能卡片区域 -->
			<view class="cards-container">
				<view class="card-item resume-card" @click="goToResume">
					<view class="card-header">
						<view class="card-icon resume-icon">
							<text class="icon-text">📄</text>
						</view>
						<view class="status-badge">已优化 23 份</view>
					</view>
					<view class="card-body">
						<text class="card-title">简历优化</text>
						<text class="card-desc">AI 智能分析简历，根据目标岗位自动优化，提供专业修改建议</text>
						<button class="action-btn resume-btn">
							开始优化
							<text class="btn-arrow">→</text>
						</button>
					</view>
				</view>

				<view class="card-item job-card" @click="goToJob">
					<view class="card-header">
						<view class="card-icon job-icon">
							<text class="icon-text">💼</text>
						</view>
						<view class="status-badge">今日新增 156 个</view>
					</view>
					<view class="card-body">
						<text class="card-title">职位推荐</text>
						<text class="card-desc">基于技能画像智能匹配，精准推荐最适合您的岗位</text>
						<button class="action-btn job-btn">
							查看推荐
							<text class="btn-arrow">→</text>
						</button>
					</view>
				</view>

				<view class="card-item interview-card" @click="goToInterview">
					<view class="card-header">
						<view class="card-icon interview-icon">
							<text class="icon-text">💬</text>
						</view>
						<view class="status-badge">已完成 12 次</view>
					</view>
					<view class="card-body">
						<text class="card-title">模拟面试</text>
						<text class="card-desc">AI 模拟真实面试场景，提升面试技巧，增强自信心</text>
						<button class="action-btn interview-btn">
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
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { useUserStore } from '@/stores/user'
import { DEFAULT_AVATAR, resolveAvatar } from '@/utils/avatar'

const userStore = useUserStore()
const { userInfo, isLogin } = storeToRefs(userStore)

const searchKeyword = ref('')
const avatarLoadFailed = ref(false)
const todayJobs = ref(156)

const userAvatar = computed(() =>
	resolveAvatar(isLogin.value ? userInfo.value?.avatar : '')
)
const displayAvatar = computed(() =>
	avatarLoadFailed.value ? DEFAULT_AVATAR : userAvatar.value
)

const userName = computed(() => {
	if (isLogin.value && userInfo.value) {
		return userInfo.value.nickname || userInfo.value.username || '同学'
	}
	return '张同学'
})

const greeting = computed(() => {
	const hour = new Date().getHours()
	if (hour < 6) return '夜深了'
	if (hour < 9) return '早上好'
	if (hour < 12) return '上午好'
	if (hour < 14) return '中午好'
	if (hour < 18) return '下午好'
	return '晚上好'
})

watch(userAvatar, () => {
	avatarLoadFailed.value = false
})

function onAvatarError() {
	avatarLoadFailed.value = true
}

const startExplore = () => {
	window.location.href = '/#/pages/Job/Job'
}

const goToResume = () => {
	window.location.href = '/#/pages/Resume/Resume'
}

const goToJob = () => {
	window.location.href = '/#/pages/Job/Job'
}

const goToInterview = () => {
	window.location.href = '/#/pages/Interview/Interview'
}
</script>

<style scoped lang="scss">
.home-main {
	margin-left: var(--sidebar-width, 240px);
	padding: 24px 32px 40px;
}

// 顶部搜索栏
.top-bar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24px;
}

.search-wrapper {
	display: flex;
	align-items: center;
	width: 480px;
	height: 44px;
	background: var(--bg-card);
	border-radius: var(--radius-md);
	padding: 0 16px;
	border: 1px solid var(--border-color);
	transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

	&:focus-within {
		border-color: var(--primary-light);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
}

.search-icon {
	font-size: 16px;
	margin-right: 10px;
	opacity: 0.5;
}

.search-input {
	flex: 1;
	height: 100%;
	border: none;
	outline: none;
	font-size: 14px;
	background: transparent;

	&::placeholder {
		color: var(--text-muted);
	}
}

.top-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.notification {
	position: relative;
	cursor: pointer;
	padding: 8px;
	border-radius: var(--radius-sm);
	transition: background var(--transition-fast);

	&:hover {
		background: rgba(0, 0, 0, 0.05);
	}
}

.bell-icon {
	font-size: 20px;
}

.badge {
	position: absolute;
	top: 4px;
	right: 4px;
	background: var(--danger-color);
	color: white;
	font-size: 10px;
	padding: 1px 5px;
	border-radius: 10px;
	min-width: 16px;
	text-align: center;
	font-weight: 600;
}

.user-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	cursor: pointer;
	border: 2px solid var(--border-color);
	transition: border-color var(--transition-fast);

	&:hover {
		border-color: var(--primary-light);
	}
}

// 欢迎横幅
.welcome-banner {
	background: linear-gradient(135deg, #1e40af, #06b6d4);
	border-radius: var(--radius-lg);
	padding: 36px 40px;
	margin-bottom: 24px;
	color: white;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -10%;
		width: 300px;
		height: 300px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 50%;
	}

	&::after {
		content: '';
		position: absolute;
		bottom: -30%;
		right: 10%;
		width: 200px;
		height: 200px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 50%;
	}
}

.banner-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
	position: relative;
	z-index: 1;
}

.greeting {
	font-size: 28px;
	font-weight: 700;
}

.description {
	font-size: 15px;
	opacity: 0.95;
	max-width: 600px;
	line-height: 1.5;
}

.start-btn {
	background: white;
	color: #1e40af;
	border: none;
	border-radius: var(--radius-md);
	padding: 10px 24px;
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	margin-top: 4px;
	width: fit-content;
	transition: all 0.25s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(255, 255, 255, 0.25);
	}

	&:active {
		transform: translateY(0);
	}
}

.btn-arrow {
	font-size: 16px;
	transition: transform 0.2s ease;
}

.start-btn:hover .btn-arrow {
	transform: translateX(4px);
}

// 功能卡片
.cards-container {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	margin-bottom: 24px;
}

.card-item {
	background: var(--bg-card);
	border-radius: var(--radius-lg);
	padding: 24px;
	border: 1px solid var(--border-color);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;

	&:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		border-color: transparent;
	}
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.card-icon {
	width: 48px;
	height: 48px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;

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
	color: var(--text-secondary);
	font-size: 12px;
	padding: 4px 10px;
	border-radius: 20px;
	font-weight: 500;
}

.card-body {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.card-title {
	font-size: 18px;
	font-weight: 600;
	color: var(--text-primary);
}

.card-desc {
	font-size: 13px;
	color: var(--text-secondary);
	line-height: 1.6;
}

.action-btn {
	color: white;
	border: none;
	border-radius: var(--radius-md);
	padding: 10px 20px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	transition: all 0.25s ease;
	margin-top: 8px;
	width: fit-content;

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
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	&:active {
		transform: translateY(0);
	}
}

// 底部区域
.bottom-section {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20px;
}

.section-item {
	background: var(--bg-card);
	border-radius: var(--radius-md);
	padding: 20px 24px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border: 1px solid var(--border-color);
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		border-color: var(--primary-light);
		box-shadow: var(--shadow-sm);
	}
}

.section-left {
	display: flex;
	align-items: center;
	gap: 12px;
}

.section-icon {
	font-size: 20px;
}

.section-title {
	font-size: 15px;
	font-weight: 500;
	color: var(--text-primary);
}

.section-action {
	color: var(--primary-light);
	font-size: 13px;
	cursor: pointer;
	font-weight: 500;
	transition: color 0.2s;

	&:hover {
		color: var(--primary-color);
	}
}

// Responsive
@media (max-width: 1200px) {
	.cards-container {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 768px) {
	.cards-container {
		grid-template-columns: 1fr;
	}

	.bottom-section {
		grid-template-columns: 1fr;
	}

	.search-wrapper {
		width: 300px;
	}
}
</style>