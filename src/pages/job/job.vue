<template>
	<view class="job-container">
		<!-- 侧边栏 -->
		<Sidebar />
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 顶部 -->
			<view class="page-header">
				<text class="page-title">职位推荐</text>
				<text class="page-subtitle">基于技能画像智能匹配，精准推荐最适合您的岗位</text>
			</view>

			<!-- 筛选区域 -->
			<view class="filter-section">
				<view class="filter-item">
					<text class="filter-label">职位</text>
					<input class="filter-input" placeholder="请输入职位名称" />
				</view>
				<view class="filter-item">
					<text class="filter-label">城市</text>
					<input class="filter-input" placeholder="请输入城市" />
				</view>
				<view class="filter-item">
					<text class="filter-label">行业</text>
					<input class="filter-input" placeholder="请输入行业" />
				</view>
				<view class="filter-item">
					<text class="filter-label">薪资</text>
					<input class="filter-input" placeholder="请输入薪资范围" />
				</view>
			</view>

			<!-- 职位列表 -->
			<view class="job-list">
				<view class="job-card" v-for="job in jobList" :key="job.id" @click="viewJob(job.id)">
					<view class="job-header">
						<text class="job-title">{{ job.title }}</text>
						<text class="job-salary">{{ job.salary }}</text>
					</view>
					<text class="job-company">{{ job.company }}</text>
					<view class="job-tags">
						<view class="job-tag" v-for="tag in job.tags" :key="tag">{{ tag }}</view>
					</view>
					<view class="job-match">
						<text class="match-label">匹配度</text>
						<view class="match-bar">
							<view class="match-fill" :style="{ width: job.match + '%' }"></view>
						</view>
						<text class="match-value">{{ job.match }}%</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

const jobList = ref([
	{
		id: 1,
		title: '高级前端工程师',
		salary: '25-40K',
		company: '某知名互联网公司',
		tags: ['北京', '3-5 年', '本科', '前端'],
		match: 95
	},
	{
		id: 2,
		title: '全栈开发工程师',
		salary: '20-35K',
		company: '某科技创新公司',
		tags: ['上海', '3-5 年', '本科', '全栈'],
		match: 88
	},
	{
		id: 3,
		title: '移动端开发工程师',
		salary: '18-30K',
		company: '某互联网企业',
		tags: ['深圳', '1-3 年', '本科', '移动端'],
		match: 82
	}
])

const viewJob = (jobId) => {
	console.log('查看职位详情:', jobId)
}
</script>

<style scoped lang="scss">
.job-container {
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

.filter-section {
	display: flex;
	gap: 16px;
	margin-bottom: 24px;
	background: #ffffff;
	padding: 20px;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-item {
	flex: 1;
}

.filter-label {
	font-size: 12px;
	color: #6b7280;
	display: block;
	margin-bottom: 8px;
}

.filter-input {
	width: 100%;
	padding: 10px 12px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 14px;
	outline: none;
}

.job-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.job-card {
	background: #ffffff;
	padding: 24px;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
}

.job-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.job-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
}

.job-salary {
	font-size: 18px;
	font-weight: 700;
	color: #10b981;
}

.job-company {
	font-size: 14px;
	color: #6b7280;
	margin-bottom: 12px;
}

.job-tags {
	display: flex;
	gap: 8px;
	margin-bottom: 16px;
	flex-wrap: wrap;
}

.job-tag {
	padding: 4px 12px;
	background: #eff6ff;
	color: #3b82f6;
	border-radius: 4px;
	font-size: 12px;
}

.job-match {
	display: flex;
	align-items: center;
	gap: 12px;
}

.match-label {
	font-size: 14px;
	color: #6b7280;
}

.match-bar {
	flex: 1;
	height: 6px;
	background: #e5e7eb;
	border-radius: 3px;
	overflow: hidden;
}

.match-fill {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #10b981);
	border-radius: 3px;
	transition: width 0.3s;
}

.match-value {
	font-size: 14px;
	font-weight: 600;
	color: #3b82f6;
	min-width: 45px;
	text-align: right;
}
</style>
