<!-- 面包屑：面试模拟 -->

<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main interview-main">
			<!-- 顶部 -->
			<view class="title-row">
				<view>
					<text class="page-title">模拟面试</text>
					<text class="page-subtitle">AI 模拟真实面试场景，提升面试技巧，增强自信心</text>
				</view>
			</view>

			<!-- 面试模式 -->
			<view class="mode-section">
				<view
					class="mode-card"
					:class="{ active: currentMode === 'technical' }"
					@click="selectMode('technical')"
					:style="{ animationDelay: '0ms' }"
				>
					<view class="mode-icon-wrapper">
						<text class="mode-icon">💻</text>
					</view>
					<text class="mode-title">技术面试</text>
					<text class="mode-desc">前端、后端、算法等技术问题</text>
					<view class="mode-tag" v-if="currentMode === 'technical'">
						<text class="tag-text">已选择</text>
					</view>
					<view class="mode-check" v-if="currentMode === 'technical'">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<path d="M5 12l5 5L20 7" />
						</svg>
					</view>
				</view>

				<view
					class="mode-card"
					:class="{ active: currentMode === 'hr' }"
					@click="selectMode('hr')"
					:style="{ animationDelay: '100ms' }"
				>
					<view class="mode-icon-wrapper">
						<text class="mode-icon">👥</text>
					</view>
					<text class="mode-title">HR 面试</text>
					<text class="mode-desc">行为问题、职业规划等</text>
					<view class="mode-tag" v-if="currentMode === 'hr'">
						<text class="tag-text">已选择</text>
					</view>
					<view class="mode-check" v-if="currentMode === 'hr'">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<path d="M5 12l5 5L20 7" />
						</svg>
					</view>
				</view>

				<view
					class="mode-card"
					:class="{ active: currentMode === 'project' }"
					@click="selectMode('project')"
					:style="{ animationDelay: '200ms' }"
				>
					<view class="mode-icon-wrapper">
						<text class="mode-icon">📊</text>
					</view>
					<text class="mode-title">项目面</text>
					<text class="mode-desc">项目经验、技术深度探讨</text>
					<view class="mode-tag" v-if="currentMode === 'project'">
						<text class="tag-text">已选择</text>
					</view>
					<view class="mode-check" v-if="currentMode === 'project'">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<path d="M5 12l5 5L20 7" />
						</svg>
					</view>
				</view>
			</view>

			<!-- 面试记录 -->
			<view class="interview-records">
				<view class="section-header">
					<text class="section-title">最近面试记录</text>
					<text class="section-more" @click="viewAllRecords">查看全部 →</text>
				</view>
				<view class="record-list">
					<view 
						class="record-item" 
						v-for="(record, index) in recordList" 
						:key="record.id"
						:style="{ animationDelay: `${index * 100}ms` }"
					>
						<view class="record-header">
							<view class="record-title-wrapper">
								<text class="record-title">{{ record.title }}</text>
							</view>
							<view class="record-score-wrapper">
								<text class="record-score">{{ record.score }}</text>
								<text class="score-label">分</text>
							</view>
						</view>
						<view class="record-info">
							<view class="info-item">
								<text class="info-icon">📅</text>
								<text class="record-date">{{ record.date }}</text>
							</view>
							<view class="info-item">
								<text class="info-icon">⏱</text>
								<text class="record-duration">{{ record.duration }}分钟</text>
							</view>
						</view>
						<view class="record-tags">
							<view class="record-tag" v-for="tag in record.tags" :key="tag">{{ tag }}</view>
						</view>
						<view class="record-progress">
							<view class="progress-bar">
								<view class="progress-fill" :style="{ width: `${record.score}%` }"></view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 开始按钮 -->
			<view class="start-section">
				<button class="start-btn" @click="startInterview">
					<view class="btn-icon-wrapper">
						<text class="btn-icon">🎯</text>
					</view>
					<text class="btn-text">开始面试</text>
					<view class="btn-arrow">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</view>
				</button>
				<text class="start-hint">AI 将根据您的简历智能生成面试问题</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

const currentMode = ref('technical')

const recordList = ref([
	{
		id: 1,
		title: '前端高级开发工程师 - 技术面',
		score: 88,
		date: '2024-03-20',
		duration: 25,
		tags: ['Vue', 'JavaScript', '性能优化']
	},
	{
		id: 2,
		title: '产品经理 - 业务面',
		score: 82,
		date: '2024-03-18',
		duration: 30,
		tags: ['产品设计', '数据分析', '用户研究']
	},
	{
		id: 3,
		title: '全栈工程师 - 综合面',
		score: 90,
		date: '2024-03-15',
		duration: 35,
		tags: ['React', 'Node.js', '数据库']
	}
])

const selectMode = (mode) => {
	currentMode.value = mode
}

const startInterview = () => {
	window.location.href = '/#/pages/Interview/InterviewTemplate'
}

const viewAllRecords = () => {
	// 查看全部记录
}
</script>

<style scoped lang="scss">
.interview-main {
	padding: var(--spacing-xl) var(--spacing-2xl) var(--spacing-3xl);
}

.title-row {
	margin-bottom: var(--spacing-lg);
	animation: slideDown 0.5s ease;
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

.page-title {
	font-size: var(--font-size-3xl);
	font-weight: var(--font-weight-bold);
	color: var(--text-primary);
	display: block;
	letter-spacing: -0.5px;
}

.page-subtitle {
	font-size: var(--font-size-base);
	color: var(--text-secondary);
	display: block;
	margin-top: var(--spacing-xs);
}

.mode-section {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-2xl);
}

.mode-card {
	background: var(--bg-card);
	padding: var(--spacing-xl) var(--spacing-lg);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-sm);
	border: 2px solid transparent;
	cursor: pointer;
	transition: all var(--transition-normal);
	position: relative;
	text-align: center;
	animation: slideUp 0.5s ease backwards;

	&:hover {
		transform: translateY(-6px);
		box-shadow: var(--shadow-lg);
		border-color: rgba(59, 130, 246, 0.2);
	}

	&.active {
		border-color: var(--primary-light);
		background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
		box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), var(--shadow-md);

		.mode-icon-wrapper {
			transform: scale(1.1);
			background: linear-gradient(135deg, var(--primary-light), #06b6d4);
		}

		.mode-title {
			color: var(--primary-light);
		}
	}
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.mode-icon-wrapper {
	width: 72px;
	height: 72px;
	background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
	border-radius: var(--radius-xl);
	display: flex;
	align-items: center;
	justify-content: center;
	margin: 0 auto var(--spacing-md);
	transition: all var(--transition-normal);
}

.mode-icon {
	font-size: 36px;
	display: block;
}

.mode-title {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--text-primary);
	display: block;
	margin-bottom: var(--spacing-xs);
	transition: color var(--transition-fast);
}

.mode-desc {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	display: block;
	margin-bottom: var(--spacing-sm);
	line-height: 1.5;
}

.mode-tag {
	background: linear-gradient(135deg, var(--primary-light), #06b6d4);
	color: #fff;
	padding: 4px 14px;
	border-radius: var(--radius-full);
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	position: absolute;
	top: var(--spacing-md);
	right: var(--spacing-md);
	box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: scale(0.8);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.tag-text {
	display: block;
}

.mode-check {
	position: absolute;
	bottom: var(--spacing-md);
	right: var(--spacing-md);
	width: 24px;
	height: 24px;
	background: var(--primary-light);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	animation: scaleIn 0.3s ease;

	svg {
		width: 14px;
		height: 14px;
	}
}

@keyframes scaleIn {
	from {
		transform: scale(0);
	}
	to {
		transform: scale(1);
	}
}

.interview-records {
	margin-bottom: var(--spacing-2xl);
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: var(--spacing-md);
}

.section-title {
	font-size: var(--font-size-xl);
	font-weight: var(--font-weight-bold);
	color: var(--text-primary);
	display: block;
}

.section-more {
	font-size: var(--font-size-sm);
	color: var(--primary-light);
	cursor: pointer;
	transition: all var(--transition-fast);
	padding: var(--spacing-xs) var(--spacing-sm);
	border-radius: var(--radius-md);

	&:hover {
		background: rgba(59, 130, 246, 0.1);
		transform: translateX(4px);
	}
}

.record-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.record-item {
	background: var(--bg-card);
	padding: var(--spacing-lg);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--border-color);
	transition: all var(--transition-normal);
	animation: slideInRight 0.5s ease backwards;

	&:hover {
		box-shadow: var(--shadow-md);
		transform: translateX(4px);
		border-color: rgba(59, 130, 246, 0.2);
	}
}

@keyframes slideInRight {
	from {
		opacity: 0;
		transform: translateX(-30px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

.record-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--spacing-sm);
}

.record-title-wrapper {
	flex: 1;
	margin-right: var(--spacing-md);
}

.record-title {
	font-size: var(--font-size-base);
	font-weight: var(--font-weight-semibold);
	color: var(--text-primary);
	line-height: 1.4;
}

.record-score-wrapper {
	display: flex;
	align-items: baseline;
	gap: 2px;
}

.record-score {
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-bold);
	background: linear-gradient(135deg, #10b981, #059669);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.score-label {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
}

.record-info {
	display: flex;
	gap: var(--spacing-lg);
	margin-bottom: var(--spacing-sm);
}

.info-item {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.info-icon {
	font-size: var(--font-size-sm);
	opacity: 0.7;
}

.record-date,
.record-duration {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
}

.record-tags {
	display: flex;
	gap: var(--spacing-xs);
	flex-wrap: wrap;
	margin-bottom: var(--spacing-sm);
}

.record-tag {
	padding: 4px 12px;
	background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
	color: var(--text-secondary);
	border-radius: var(--radius-md);
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	border: 1px solid transparent;
	transition: all var(--transition-fast);

	&:hover {
		background: linear-gradient(135deg, #dbeafe, #bfdbfe);
		color: var(--primary-light);
		border-color: rgba(59, 130, 246, 0.3);
	}
}

.record-progress {
	margin-top: var(--spacing-sm);
}

.progress-bar {
	height: 4px;
	background: var(--border-color);
	border-radius: var(--radius-full);
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #10b981, #34d399);
	border-radius: var(--radius-full);
	transition: width 1s ease;
	animation: progressGrow 1s ease;
}

@keyframes progressGrow {
	from {
		width: 0;
	}
}

.start-section {
	text-align: center;
	margin-top: var(--spacing-2xl);
	padding: var(--spacing-xl);
	background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.05));
	border-radius: var(--radius-xl);
	border: 1px dashed rgba(59, 130, 246, 0.3);
	animation: fadeIn 0.6s ease;
}

.start-btn {
	background: linear-gradient(135deg, var(--primary-light), #06b6d4);
	color: #fff;
	border: none;
	padding: var(--spacing-md) var(--spacing-3xl);
	border-radius: var(--radius-lg);
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	cursor: pointer;
	transition: all var(--transition-normal);
	display: inline-flex;
	align-items: center;
	gap: var(--spacing-sm);
	box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35);
	position: relative;
	overflow: hidden;

	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 8px 30px rgba(59, 130, 246, 0.45);

		.btn-arrow {
			transform: translateX(4px);
		}
	}

	&:active {
		transform: translateY(-1px);
	}

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}

	&:hover::before {
		left: 100%;
	}
}

.btn-icon-wrapper {
	width: 32px;
	height: 32px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-icon {
	font-size: 18px;
	display: block;
}

.btn-text {
	display: block;
}

.btn-arrow {
	width: 20px;
	height: 20px;
	transition: transform var(--transition-fast);

	svg {
		width: 100%;
		height: 100%;
	}
}

.start-hint {
	display: block;
	margin-top: var(--spacing-md);
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
}

// 响应式适配
@media (max-width: 1024px) {
	.mode-section {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 768px) {
	.interview-main {
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.mode-section {
		grid-template-columns: 1fr;
	}

	.mode-card {
		display: flex;
		align-items: center;
		text-align: left;
		padding: var(--spacing-md);
	}

	.mode-icon-wrapper {
		width: 56px;
		height: 56px;
		margin: 0 var(--spacing-md) 0 0;
		flex-shrink: 0;
	}

	.mode-icon {
		font-size: 28px;
	}

	.mode-content {
		flex: 1;
	}

	.record-header {
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.record-info {
		flex-wrap: wrap;
		gap: var(--spacing-sm);
	}
}
</style>