<template>
	<view class="interview-container">
		<!-- 侧边栏 -->
		<Sidebar />
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 顶部 -->
			<view class="page-header">
				<text class="page-title">模拟面试</text>
				<text class="page-subtitle">AI 模拟真实面试场景，提升面试技巧，增强自信心</text>
			</view>

			<!-- 面试模式 -->
			<view class="mode-section">
				<view 
					class="mode-card" 
					:class="{ active: currentMode === 'technical' }"
					@click="selectMode('technical')"
				>
					<text class="mode-icon">💻</text>
					<text class="mode-title">技术面试</text>
					<text class="mode-desc">前端、后端、算法等技术问题</text>
					<view class="mode-tag" v-if="currentMode === 'technical'">已选择</view>
				</view>

				<view 
					class="mode-card" 
					:class="{ active: currentMode === 'hr' }"
					@click="selectMode('hr')"
				>
					<text class="mode-icon">👥</text>
					<text class="mode-title">HR 面试</text>
					<text class="mode-desc">行为问题、职业规划等</text>
					<view class="mode-tag" v-if="currentMode === 'hr'">已选择</view>
				</view>

				<view 
					class="mode-card" 
					:class="{ active: currentMode === 'project' }"
					@click="selectMode('project')"
				>
					<text class="mode-icon">📊</text>
					<text class="mode-title">项目面</text>
					<text class="mode-desc">项目经验、技术深度探讨</text>
					<view class="mode-tag" v-if="currentMode === 'project'">已选择</view>
				</view>
			</view>

			<!-- 面试记录 -->
			<view class="interview-records">
				<text class="section-title">最近面试记录</text>
				<view class="record-list">
					<view class="record-item" v-for="record in recordList" :key="record.id">
						<view class="record-header">
							<text class="record-title">{{ record.title }}</text>
							<text class="record-score">{{ record.score }}分</text>
						</view>
						<view class="record-info">
							<text class="record-date">{{ record.date }}</text>
							<text class="record-duration">⏱ {{ record.duration }}分钟</text>
						</view>
						<view class="record-tags">
							<view class="record-tag" v-for="tag in record.tags" :key="tag">{{ tag }}</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 开始按钮 -->
			<view class="start-section">
				<button class="start-btn" @click="startInterview">
					<text class="btn-icon">🎯</text>
					<text class="btn-text">开始面试</text>
				</button>
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
	console.log('开始面试，模式:', currentMode.value)
	// 这里可以跳转到面试详情页面
}
</script>

<style scoped lang="scss">
.interview-container {
	display: flex;
	height: 100vh;
	background-color: #f9fafb;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 32px;
	overflow-y: auto;
}

.page-header {
	margin-bottom: 32px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.page-title {
	font-size: 28px;
	font-weight: 600;
	color: #111827;
}

.page-subtitle {
	font-size: 16px;
	color: #6b7280;
}

.mode-section {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	margin-bottom: 32px;
}

.mode-card {
	background: #ffffff;
	padding: 24px;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: all 0.3s;
	position: relative;
	text-align: center;

	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	&.active {
		border: 2px solid #3b82f6;
		background: #eff6ff;
	}
}

.mode-icon {
	font-size: 48px;
	display: block;
	margin-bottom: 16px;
}

.mode-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
	display: block;
	margin-bottom: 8px;
}

.mode-desc {
	font-size: 14px;
	color: #6b7280;
	display: block;
	margin-bottom: 12px;
}

.mode-tag {
	background: #ef4444;
	color: #ffffff;
	padding: 4px 12px;
	border-radius: 12px;
	font-size: 12px;
	position: absolute;
	top: 12px;
	right: 12px;
}

.interview-records {
	margin-bottom: 32px;
}

.section-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
	margin-bottom: 16px;
	display: block;
}

.record-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.record-item {
	background: #ffffff;
	padding: 20px;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.record-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.record-title {
	font-size: 16px;
	font-weight: 600;
	color: #111827;
}

.record-score {
	font-size: 20px;
	font-weight: 700;
	color: #10b981;
}

.record-info {
	display: flex;
	gap: 16px;
	margin-bottom: 12px;
}

.record-date,
.record-duration {
	font-size: 14px;
	color: #6b7280;
}

.record-tags {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.record-tag {
	padding: 4px 12px;
	background: #f3f4f6;
	color: #374151;
	border-radius: 4px;
	font-size: 12px;
}

.start-section {
	text-align: center;
	margin-top: 40px;
}

.start-btn {
	background: linear-gradient(135deg, #3b82f6, #06b6d4);
	color: #ffffff;
	border: none;
	padding: 16px 60px;
	border-radius: 12px;
	font-size: 18px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s;
	display: inline-flex;
	align-items: center;
	gap: 12px;
	box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
	}
}

.btn-icon {
	font-size: 20px;
}

.btn-text {
	display: block;
}
</style>
