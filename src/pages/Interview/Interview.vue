<!-- 模拟面试首页：由 interview-deploy/interview.html 迁移 -->

<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main interview-main">
			<view class="interview-page-wrapper">
				<!-- 顶部导航栏 -->
				<view class="top-nav">
					<view class="search-box">
						<text class="search-icon">🔍</text>
						<input
							v-model="searchKeyword"
							class="search-input"
							placeholder="搜索面试类型、岗位..."
							placeholder-class="search-placeholder"
						/>
					</view>
					<view class="nav-right">
						<view class="notification-bell">
							<text class="bell-icon">🔔</text>
							<view class="badge"></view>
						</view>
						<view class="avatar-dropdown">
							<image
								class="nav-avatar"
								:src="displayAvatar"
								mode="aspectFill"
								@error="avatarLoadFailed = true"
							/>
						</view>
					</view>
				</view>

				<!-- 主内容区 -->
				<view class="content-area">
					<view class="interview-header">
						<text class="page-title">模拟面试</text>
						<text class="page-subtitle">AI语音对话模拟真实面试场景</text>
					</view>

					<!-- 目标岗位 -->
					<view class="job-input-section">
						<text class="section-title">🎯 目标岗位</text>
						<view class="job-input-wrapper">
							<text class="input-icon">💼</text>
							<input
								v-model="jobTitle"
								class="job-input"
								placeholder="请输入目标岗位，如：前端开发工程师"
								placeholder-class="input-placeholder"
							/>
						</view>
						<view class="hot-jobs">
							<text class="hot-jobs-label">热门岗位：</text>
							<text
								v-for="job in hotJobs"
								:key="job"
								class="tag"
								@click="selectJob(job)"
							>
								{{ job }}
							</text>
						</view>
					</view>

					<!-- 面试配置 -->
					<view class="config-section">
						<text class="section-title">🛠 面试配置</text>
						<view class="config-row">
							<text class="config-label">面试模式</text>
							<view class="radio-group">
								<view
									class="radio-item"
									:class="{ active: interviewStore.mode === 'voice' }"
									@click="selectMode('voice')"
								>
									<text>🎤 语音对话</text>
								</view>
								<view
									class="radio-item"
									:class="{ active: interviewStore.mode === 'text' }"
									@click="selectMode('text')"
								>
									<text>💬 文字输入</text>
								</view>
							</view>
						</view>
						<view class="config-row">
							<text class="config-label">语音播放</text>
							<view class="radio-group">
								<view
									class="radio-item"
									:class="{ active: interviewStore.ttsEnabled }"
									@click="selectTts(true)"
								>
									<text>🔊 开启</text>
								</view>
								<view
									class="radio-item"
									:class="{ active: !interviewStore.ttsEnabled }"
									@click="selectTts(false)"
								>
									<text>🔇 关闭</text>
								</view>
							</view>
						</view>
					</view>

					<!-- 开始面试 -->
					<view class="cta-banner">
						<view class="cta-text">
							<text class="cta-title">准备好了吗？</text>
							<text class="cta-desc">AI 将根据您的简历智能生成面试问题，现在开始模拟真实面试场景</text>
						</view>
						<button class="btn-start" :disabled="interviewStore.isStarting" @click="startInterview">
							<view v-if="interviewStore.isStarting" class="start-spinner"></view>
							<text>{{ interviewStore.isStarting ? '准备中...' : '📞 开始面试' }}</text>
						</button>
					</view>

					<!-- 历史记录 -->
					<view class="history-section">
						<view class="history-header">
							<view class="history-title-wrapper">
								<text class="history-title-icon">🕐</text>
								<text class="history-title">历史记录</text>
							</view>
							<text class="view-all" @click="viewAllRecords">查看全部 →</text>
						</view>

						<view v-if="filteredHistory.length === 0" class="empty-history">
							<text>暂无面试记录</text>
						</view>

						<view
							v-for="record in filteredHistory"
							:key="record.id"
							class="history-item"
							@click="viewRecord(record)"
						>
							<view class="history-item-left">
								<view class="history-icon"><text>💬</text></view>
								<view class="history-info">
									<text class="history-title-text">{{ record.title }}</text>
									<text class="history-meta">{{ record.date }} · {{ record.duration }}</text>
									<text v-if="record.phase" class="history-phase">
										{{ phaseName(record.phase) }}
									</text>
								</view>
							</view>
							<view class="history-right">
								<view class="history-score">
									<text class="score-value" :class="scoreClass(record.score)">
										{{ record.score }}
									</text>
									<text class="score-label">综合评分</text>
								</view>
								<button class="btn-detail" @click.stop="viewRecord(record)">查看详情</button>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { useUserStore } from '@/stores/user'
import { useInterviewStore } from '@/stores/interview'
import { DEFAULT_AVATAR, resolveAvatar } from '@/utils/avatar'

const userStore = useUserStore()
const interviewStore = useInterviewStore()

const hotJobs = [
	'前端开发工程师',
	'后端开发工程师',
	'算法工程师',
	'产品经理',
	'全栈工程师',
	'数据分析师',
]

const jobTitle = ref('')
const searchKeyword = ref('')
const avatarLoadFailed = ref(false)

const displayAvatar = computed(() =>
	avatarLoadFailed.value ? DEFAULT_AVATAR : resolveAvatar(userStore.isLogin ? userStore.userInfo?.avatar : '')
)

const filteredHistory = computed(() => {
	const keyword = searchKeyword.value.trim().toLowerCase()
	const records = interviewStore.history
	if (!keyword) return records
	return records.filter((r) => (r.title || '').toLowerCase().includes(keyword))
})

const scoreClass = (score) => {
	if (score >= 85) return 'high'
	if (score >= 70) return 'mid'
	return 'low'
}

const phaseName = (phase) => {
	const map = { technical: '技术面试', behavioral: '综合面试', closing: '收尾环节' }
	return map[phase] || '面试'
}

const selectJob = (job) => {
	jobTitle.value = job
}

const selectMode = (mode) => {
	interviewStore.setMode(mode)
}

const selectTts = (enabled) => {
	interviewStore.setTtsEnabled(enabled)
}

const startInterview = async () => {
	const title = jobTitle.value.trim()
	if (!title) {
		uni.showToast({ title: '请输入目标岗位', icon: 'none' })
		return
	}
	const sessionId = await interviewStore.start(title)
	if (sessionId) {
		window.location.href = '/#/pages/Interview/InterviewChat'
	}
}

const viewAllRecords = () => {
	uni.showToast({ title: '查看全部记录', icon: 'none' })
}

const viewRecord = (record) => {
	uni.showToast({ title: `查看记录：${record.title}`, icon: 'none' })
}

onMounted(() => {
	userStore.checkLogin()
	// 清掉可能残留的旧会话，避免带着失效 session_id 进入对话页
	interviewStore.clearCurrent()
	interviewStore.loadConfig()
	interviewStore.loadHistory()
})
</script>

<style scoped lang="scss">
$content-bg: #f0f2f5;
$card-bg: #ffffff;
$title-color: #111827;
$subtitle-color: #6b7280;
$muted-color: #9ca3af;
$border-color: #e5e7eb;
$primary-blue: #3b82f6;
$primary-dark: #1a3a6b;

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
	padding: 0 28px;
	flex-shrink: 0;
}

.search-box {
	position: relative;
	width: 320px;
	height: 38px;
	background: #f9fafb;
	border: 1px solid $border-color;
	border-radius: 10px;
	display: flex;
	align-items: center;
	padding: 0 14px;
	gap: 8px;

	.search-icon {
		font-size: 14px;
		color: $muted-color;
	}

	.search-input {
		flex: 1;
		border: none;
		background: transparent;
		font-size: 13px;
		color: $title-color;
		outline: none;
	}
}

.search-placeholder,
.input-placeholder {
	color: $muted-color;
}

.nav-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.notification-bell {
	position: relative;
	cursor: pointer;
	padding: 8px;
	border-radius: 10px;
	transition: background 0.2s;

	&:hover {
		background: #f3f4f6;
	}

	.bell-icon {
		font-size: 16px;
		color: $subtitle-color;
	}

	.badge {
		position: absolute;
		top: 5px;
		right: 5px;
		width: 8px;
		height: 8px;
		background: #ef4444;
		border-radius: 50%;
		border: 2px solid $card-bg;
	}
}

.avatar-dropdown {
	.nav-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}
}

/* ── 主内容区 ── */
.content-area {
	flex: 1;
	overflow-y: auto;
	padding: 24px 28px;
	max-width: 1248px;
}

.interview-header {
	margin-bottom: 24px;
}

.page-title {
	font-size: 22px;
	font-weight: 600;
	color: $title-color;
	display: block;
	margin-bottom: 6px;
}

.page-subtitle {
	font-size: 14px;
	color: $subtitle-color;
	display: block;
}

/* ── 目标岗位 ── */
.job-input-section {
	background: $card-bg;
	border-radius: 14px;
	border: 1px solid $border-color;
	padding: 28px;
	margin-bottom: 20px;
}

.section-title {
	font-size: 16px;
	font-weight: 600;
	color: #1f2937;
	display: block;
	margin-bottom: 20px;
}

.job-input-wrapper {
	position: relative;
	margin-bottom: 16px;

	.input-icon {
		position: absolute;
		left: 14px;
		top: 50%;
		transform: translateY(-50%);
		color: $muted-color;
		font-size: 16px;
	}

	.job-input {
		width: 100%;
		height: 44px;
		border: 1px solid $border-color;
		border-radius: 10px;
		padding: 0 16px 0 44px;
		font-size: 14px;
		background: #fafafa;
		outline: none;
		transition: all 0.2s;

		&:focus {
			border-color: $primary-blue;
			background: $card-bg;
			box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		}
	}
}

.hot-jobs {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.hot-jobs-label {
	font-size: 13px;
	color: $muted-color;
}

.tag {
	display: inline-flex;
	align-items: center;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 500;
	background: #f3f4f6;
	color: $subtitle-color;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background: #dbeafe;
		color: #2563eb;
	}
}

/* ── 面试配置 ── */
.config-section {
	background: $card-bg;
	border-radius: 14px;
	border: 1px solid $border-color;
	padding: 24px 28px;
	margin-bottom: 20px;
}

.config-row {
	display: flex;
	align-items: flex-start;
	gap: 24px;
	margin-bottom: 16px;

	&:last-child {
		margin-bottom: 0;
	}
}

.config-label {
	font-size: 13px;
	color: $subtitle-color;
	min-width: 80px;
	padding-top: 8px;
}

.radio-group {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.radio-item {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 16px;
	border: 1px solid $border-color;
	border-radius: 8px;
	cursor: pointer;
	font-size: 13px;
	color: $subtitle-color;
	transition: all 0.2s;
	background: $card-bg;

	&:hover {
		border-color: #d1d5db;
	}

	&.active {
		border-color: $primary-blue;
		background: #eff6ff;
		color: #2563eb;
	}
}

/* ── CTA Banner ── */
.cta-banner {
	background: linear-gradient(135deg, $primary-dark, $primary-blue);
	border-radius: 14px;
	padding: 28px 32px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 28px;
}

.cta-text {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.cta-title {
	font-size: 20px;
	font-weight: 600;
	color: #ffffff;
}

.cta-desc {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.8);
}

.btn-start {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 14px 32px;
	background: #ffffff;
	color: $primary-dark;
	border: none;
	border-radius: 12px;
	font-size: 15px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s;

	&:hover:not(:disabled) {
		background: #f8fafc;
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

.start-spinner {
	width: 16px;
	height: 16px;
	border: 2px solid #e5e7eb;
	border-top-color: $primary-blue;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
	display: inline-block;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

/* ── 历史记录 ── */
.history-section {
	margin-bottom: 20px;
}

.history-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.history-title-wrapper {
	display: flex;
	align-items: center;
	gap: 8px;
}

.history-title-icon {
	font-size: 16px;
	color: $muted-color;
}

.history-title {
	font-size: 16px;
	font-weight: 600;
	color: #1f2937;
}

.view-all {
	font-size: 13px;
	color: $primary-blue;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 4px;
}

.history-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.empty-history {
	text-align: center;
	color: $muted-color;
	padding: 40px;
	font-size: 14px;
	background: $card-bg;
	border: 1px solid $border-color;
	border-radius: 12px;
}

.history-item {
	background: $card-bg;
	border-radius: 12px;
	border: 1px solid $border-color;
	padding: 18px 22px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.2s;
	cursor: pointer;

	&:hover {
		border-color: #d1d5db;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}
}

.history-item-left {
	display: flex;
	align-items: center;
	gap: 14px;
}

.history-icon {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	background: #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	color: $muted-color;
	font-size: 16px;
}

.history-info {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.history-title-text {
	font-size: 14px;
	font-weight: 600;
	color: #1f2937;
}

.history-meta {
	font-size: 12px;
	color: $muted-color;
}

.history-phase {
	font-size: 11px;
	color: $primary-blue;
	font-weight: 500;
}

.history-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.history-score {
	text-align: center;
}

.score-value {
	font-size: 22px;
	font-weight: 700;
	line-height: 1;
	display: block;

	&.high {
		color: #10b981;
	}

	&.mid {
		color: #f59e0b;
	}

	&.low {
		color: #ef4444;
	}
}

.score-label {
	font-size: 11px;
	color: $muted-color;
	margin-top: 2px;
	display: block;
}

.btn-detail {
	padding: 8px 16px;
	border: 1px solid $border-color;
	border-radius: 8px;
	background: $card-bg;
	color: $subtitle-color;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: $primary-blue;
		color: $primary-blue;
	}
}

@media (max-width: 768px) {
	.config-row {
		flex-direction: column;
		gap: 12px;
	}

	.cta-banner {
		flex-direction: column;
		gap: 16px;
		text-align: center;
	}

	.search-box {
		width: 200px;
	}

	.history-item {
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.history-right {
		width: 100%;
		justify-content: space-between;
	}
}
</style>
