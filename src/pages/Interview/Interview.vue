<!-- 模拟面试 -->
<!-- 按设计规范优化 UI，保持原有功能不变 -->

<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main interview-main">
			<view class="interview-page-wrapper">
				<!-- 顶部导航栏 -->
				<view class="top-nav">
					<view class="search-box">
						<text class="search-icon">🔍</text>
						<input class="search-input" placeholder="搜索面试类型、岗位..." />
					</view>
					<view class="nav-right">
						<view class="notification-bell">
							<text class="bell-icon">🔔</text>
							<text class="badge">3</text>
						</view>
						<view class="avatar-dropdown">
							<image
								class="nav-avatar"
								:src="displayAvatar"
								mode="aspectFill"
								@error="avatarLoadFailed = true"
							/>
							<text class="dropdown-arrow">▼</text>
						</view>
					</view>
				</view>

				<!-- 主内容区 -->
				<view class="content-area">
					<!-- 页面标题 -->
					<view class="title-row">
						<text class="page-title">模拟面试</text>
						<text class="page-subtitle">AI语音对话模拟真实面试场景</text>
					</view>

					<!-- 面试类型卡片 -->
					<view class="mode-section">
						<view
							class="mode-card"
							:class="{ active: currentMode === 'technical' }"
							@click="selectMode('technical')"
						>
							<view class="mode-icon-wrapper blue">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
								</svg>
							</view>
							<text class="mode-title">技术面试</text>
							<text class="mode-desc">前端、后端、算法等技术问题</text>
							<view class="mode-tags">
								<view class="mode-tag">Vue</view>
								<view class="mode-tag">React</view>
								<view class="mode-tag">算法</view>
							</view>
						</view>

						<view
							class="mode-card"
							:class="{ active: currentMode === 'hr' }"
							@click="selectMode('hr')"
						>
							<view class="mode-icon-wrapper purple">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
									<circle cx="9" cy="7" r="4"></circle>
									<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
									<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
								</svg>
							</view>
							<text class="mode-title">HR 面试</text>
							<text class="mode-desc">行为问题、职业规划等</text>
							<view class="mode-tags">
								<view class="mode-tag">自我介绍</view>
								<view class="mode-tag">职业规划</view>
							</view>
						</view>

						<view
							class="mode-card"
							:class="{ active: currentMode === 'project' }"
							@click="selectMode('project')"
						>
							<view class="mode-icon-wrapper orange">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
								</svg>
							</view>
							<text class="mode-title">项目面</text>
							<text class="mode-desc">项目经验、技术深度探讨</text>
							<view class="mode-tags">
								<view class="mode-tag">项目复盘</view>
								<view class="mode-tag">技术难点</view>
							</view>
						</view>
					</view>

					<!-- CTA Banner -->
					<view class="cta-banner">
						<view class="cta-left">
							<text class="cta-title">准备好了吗？</text>
							<text class="cta-desc">AI 将根据您的简历智能生成面试问题，现在开始模拟真实面试场景</text>
						</view>
						<view class="cta-btn" @click="startInterview">
							<text class="cta-btn-icon">📞</text>
							<text class="cta-btn-text">开始面试</text>
						</view>
					</view>

					<!-- 历史记录 -->
					<view class="records-section">
						<view class="section-header">
							<view class="section-title-wrapper">
								<text class="section-icon">🕐</text>
								<text class="section-title">历史记录</text>
							</view>
							<text class="section-more" @click="viewAllRecords">查看全部 →</text>
						</view>

						<view class="record-list">
							<view
								class="record-item"
								v-for="(record, index) in recordList"
								:key="record.id"
								:style="{ animationDelay: `${index * 80}ms` }"
							>
								<view class="record-left">
									<view class="record-icon-wrapper">
										<text class="record-icon">💬</text>
									</view>
									<view class="record-info">
										<text class="record-title">{{ record.title }}</text>
										<text class="record-meta">{{ record.date }} · {{ record.duration }}分钟</text>
									</view>
								</view>
								<view class="record-right">
									<view class="record-score">
										<text class="score-number" :class="scoreClass(record.score)">{{ record.score }}</text>
										<text class="score-label">综合评分</text>
									</view>
									<view class="detail-btn" @click.stop="viewRecord(record)">查看详情</view>
								</view>
							</view>
						</view>
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
import { DEFAULT_AVATAR, resolveAvatar } from '@/utils/avatar'

const userStore = useUserStore()
const avatarLoadFailed = ref(false)

const displayAvatar = computed(() =>
	avatarLoadFailed.value ? DEFAULT_AVATAR : resolveAvatar(userStore.isLogin ? userStore.userInfo?.avatar : '')
)

const currentMode = ref('technical')

const recordList = ref([
	{
		id: 1,
		title: '前端高级开发工程师 - 技术面',
		score: 88,
		date: '2024年3月20日',
		duration: 25
	},
	{
		id: 2,
		title: '产品经理 - 业务面',
		score: 82,
		date: '2024年3月18日',
		duration: 30
	},
	{
		id: 3,
		title: '全栈工程师 - 综合面',
		score: 90,
		date: '2024年3月15日',
		duration: 35
	}
])

const selectMode = (mode) => {
	currentMode.value = mode
}

const scoreClass = (score) => {
	if (score >= 90) return 'high'
	if (score >= 85) return 'medium'
	return 'low'
}

const startInterview = () => {
	window.location.href = '/#/pages/Interview/InterviewTemplate'
}

const viewAllRecords = () => {
	// 查看全部记录
}

const viewRecord = (record) => {
	uni.showToast({ title: `查看记录: ${record.title}`, icon: 'none' })
}
</script>

<style scoped lang="scss">
// 设计规范色值（仅本页使用）
$sidebar-bg: #1e3a5f;
$content-bg: #f0f2f5;
$card-bg: #ffffff;
$title-color: #1a1a2e;
$subtitle-color: #6b7280;
$muted-color: #9ca3af;
$primary-blue: #3b82f6;
$primary-purple: #a855f7;
$primary-orange: #ef4444;
$cta-gradient: linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%);
$score-high: #10b981;
$score-medium: #3b82f6;
$score-low: #f59e0b;
$border-color: #e5e7eb;

.interview-main {
	margin-left: var(--sidebar-width, 240px);
	padding: 0;
	background: $content-bg;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.interview-page-wrapper {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

/* ── 顶部导航栏 ── */
.top-nav {
	height: 56px;
	background: $card-bg;
	border-bottom: 1px solid $border-color;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
	flex-shrink: 0;
}

.search-box {
	width: 360px;
	height: 36px;
	background: #f3f4f6;
	border-radius: 8px;
	display: flex;
	align-items: center;
	padding: 0 12px;
	gap: 8px;

	.search-icon {
		font-size: 14px;
		color: $muted-color;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 14px;
		color: $title-color;
		outline: none;

		&::placeholder {
			color: $muted-color;
		}
	}
}

.nav-right {
	display: flex;
	align-items: center;
	gap: 20px;
}

.notification-bell {
	position: relative;
	cursor: pointer;

	.bell-icon {
		font-size: 18px;
	}

	.badge {
		position: absolute;
		top: -6px;
		right: -6px;
		min-width: 16px;
		height: 16px;
		background: #ef4444;
		color: #fff;
		font-size: 10px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 4px;
	}
}

.avatar-dropdown {
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;

	.nav-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}

	.dropdown-arrow {
		font-size: 10px;
		color: $muted-color;
	}
}

/* ── 主内容区 ── */
.content-area {
	flex: 1;
	overflow-y: auto;
	padding: 24px;
	max-width: 1248px;
}

.title-row {
	margin-bottom: 24px;
	animation: slideDown 0.5s ease;
}

.page-title {
	font-size: 24px;
	font-weight: 700;
	color: $title-color;
	display: block;
}

.page-subtitle {
	font-size: 14px;
	color: $subtitle-color;
	display: block;
	margin-top: 8px;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* ── 面试类型卡片 ── */
.mode-section {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	margin-bottom: 24px;
}

.mode-card {
	background: $card-bg;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	padding: 24px;
	min-height: 180px;
	cursor: pointer;
	transition: all 0.25s;
	border: 2px solid transparent;
	animation: slideUp 0.5s ease backwards;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	&.active {
		border-color: $primary-blue;
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
	}
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.mode-icon-wrapper {
	width: 48px;
	height: 48px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 16px;
	color: #fff;

	svg {
		width: 24px;
		height: 24px;
	}

	&.blue {
		background: $primary-blue;
	}

	&.purple {
		background: $primary-purple;
	}

	&.orange {
		background: $primary-orange;
	}
}

.mode-title {
	font-size: 16px;
	font-weight: 700;
	color: $title-color;
	display: block;
	margin-bottom: 4px;
}

.mode-desc {
	font-size: 13px;
	color: $subtitle-color;
	display: block;
	margin-bottom: 12px;
	line-height: 1.5;
}

.mode-tags {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.mode-tag {
	height: 24px;
	padding: 0 10px;
	background: #f3f4f6;
	color: $subtitle-color;
	font-size: 12px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* ── CTA Banner ── */
.cta-banner {
	background: $cta-gradient;
	border-radius: 12px;
	padding: 32px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
	animation: fadeIn 0.5s ease 0.2s backwards;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

.cta-left {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.cta-title {
	font-size: 20px;
	font-weight: 700;
	color: #fff;
}

.cta-desc {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.85);
}

.cta-btn {
	height: 40px;
	padding: 0 20px;
	background: #fff;
	color: $sidebar-bg;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	transition: all 0.2s;
	flex-shrink: 0;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}
}

.cta-btn-icon {
	font-size: 14px;
}

/* ── 历史记录 ── */
.records-section {
	animation: slideUp 0.5s ease 0.3s backwards;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.section-title-wrapper {
	display: flex;
	align-items: center;
	gap: 8px;
}

.section-icon {
	font-size: 16px;
	color: $muted-color;
}

.section-title {
	font-size: 16px;
	font-weight: 700;
	color: $title-color;
}

.section-more {
	font-size: 13px;
	color: $subtitle-color;
	cursor: pointer;

	&:hover {
		color: $primary-blue;
	}
}

.record-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.record-item {
	background: $card-bg;
	border-radius: 8px;
	padding: 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	cursor: pointer;
	transition: all 0.2s;
	animation: slideInRight 0.5s ease backwards;

	&:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		transform: translateX(4px);
	}
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(-20px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

.record-left {
	display: flex;
	align-items: center;
	gap: 12px;
}

.record-icon-wrapper {
	width: 40px;
	height: 40px;
	background: #f3f4f6;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.record-icon {
	font-size: 18px;
	color: $muted-color;
}

.record-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.record-title {
	font-size: 14px;
	font-weight: 600;
	color: $title-color;
}

.record-meta {
	font-size: 12px;
	color: $muted-color;
}

.record-right {
	display: flex;
	align-items: center;
	gap: 16px;
	flex-shrink: 0;
}

.record-score {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;

	.score-number {
		font-size: 18px;
		font-weight: 700;

		&.high {
			color: $score-high;
		}

		&.medium {
			color: $score-medium;
		}

		&.low {
			color: $score-low;
		}
	}

	.score-label {
		font-size: 12px;
		color: $muted-color;
	}
}

.detail-btn {
	height: 30px;
	padding: 0 12px;
	background: #fff;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	font-size: 13px;
	color: $subtitle-color;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		border-color: $primary-blue;
		color: $primary-blue;
	}
}

/* ── 响应式适配 ── */
@media (max-width: 1024px) {
	.mode-section {
		grid-template-columns: 1fr;
	}

	.cta-banner {
		flex-direction: column;
		gap: 16px;
		text-align: center;
	}
}

@media (max-width: 768px) {
	.search-box {
		width: 200px;
	}

	.record-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.record-right {
		width: 100%;
		justify-content: space-between;
	}
}
</style>
