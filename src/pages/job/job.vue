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
					<input
						class="filter-input"
						v-model="filters.keyword"
						placeholder="请输入职位名称/公司"
						@confirm="handleSearch"
					/>
				</view>
				<view class="filter-item">
					<text class="filter-label">城市</text>
					<input
						class="filter-input"
						v-model="filters.city"
						placeholder="请输入城市"
						@confirm="handleSearch"
					/>
				</view>
				<view class="filter-item">
					<text class="filter-label">行业</text>
					<input
						class="filter-input"
						v-model="filters.industry"
						placeholder="请输入行业"
						@confirm="handleSearch"
					/>
				</view>
				<view class="filter-item">
					<text class="filter-label">薪资</text>
					<input
						class="filter-input"
						v-model="filters.salary"
						placeholder="如: 15-30"
						@confirm="handleSearch"
					/>
				</view>
				<view class="filter-actions">
					<view class="search-btn" @click="handleSearch">搜索</view>
					<view class="reset-btn" @click="resetFilters">重置</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner">
					<view class="spinner-item"></view>
					<view class="spinner-item"></view>
					<view class="spinner-item"></view>
				</view>
				<text class="loading-text">正在为您匹配职位...</text>
			</view>

			<!-- 职位列表 -->
			<view v-else class="job-list">
				<view class="job-count">共找到 <text class="count">{{ jobList.length }}</text> 个职位</view>

				<view class="job-card" v-for="job in jobList" :key="job.id" @click="viewJob(job)">
					<view class="job-header">
						<view class="job-title-row">
							<text class="job-title">{{ job.title }}</text>
							<view v-if="job.hot" class="hot-tag">热招</view>
						</view>
						<text class="job-salary">{{ job.salary }}</text>
					</view>

					<view class="job-company-info">
						<text class="job-company">{{ job.company }}</text>
						<text class="company-divider">|</text>
						<text class="company-scale">{{ job.companyInfo?.scale }}</text>
						<text class="company-divider">|</text>
						<text class="company-industry">{{ job.companyInfo?.industry }}</text>
					</view>

					<view class="job-tags">
						<view class="job-tag" v-for="tag in job.tags" :key="tag">{{ tag }}</view>
					</view>

					<view class="job-skills">
						<view class="skill-tag" v-for="skill in job.skills" :key="skill">{{ skill }}</view>
					</view>

					<view class="job-footer">
						<view class="job-match">
							<text class="match-label">匹配度</text>
							<view class="match-bar">
								<view class="match-fill" :style="{ width: job.match + '%' }"></view>
							</view>
							<text class="match-value">{{ job.match }}%</text>
						</view>
						<view class="job-meta">
							<text class="publish-time">{{ job.publishTime }}</text>
							<view class="hr-info">
								<view class="hr-online" :class="{ online: job.hr?.online }"></view>
								<text class="hr-name">{{ job.hr?.name }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="jobList.length === 0" class="empty-state">
					<text class="empty-icon">🔍</text>
					<text class="empty-text">暂无匹配职位，请调整筛选条件</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { generateJobs, searchJobs } from '@/utils/jobDataGenerator.js'

// 筛选条件
const filters = ref({
	keyword: '',
	city: '',
	industry: '',
	salary: ''
})

// 职位列表
const jobList = ref([])

// 加载状态
const loading = ref(false)

// 获取职位列表
const fetchJobs = () => {
	loading.value = true

	// 模拟网络延迟
	setTimeout(() => {
		const searchFilters = {}
		if (filters.value.keyword) searchFilters.keyword = filters.value.keyword
		if (filters.value.city) searchFilters.city = filters.value.city
		if (filters.value.salary) searchFilters.salary = filters.value.salary

		jobList.value = Object.keys(searchFilters).length > 0
			? searchJobs(searchFilters)
			: generateJobs(15)
		loading.value = false
	}, 500)
}

// 搜索职位
const handleSearch = () => {
	fetchJobs()
}

// 重置筛选
const resetFilters = () => {
	filters.value = {
		keyword: '',
		city: '',
		industry: '',
		salary: ''
	}
	fetchJobs()
}

// 查看职位详情
const viewJob = (job) => {
	console.log('查看职位详情:', job)
	// 可以跳转到详情页或打开弹窗
}

// 初始化
onMounted(() => {
	fetchJobs()
})


// API 基础地址
const BASE_URL = 'http://81.71.75.85:6008/api'

// 接口
const getjobs=()=>{
	uni.request({
		url: `${BASE_URL}/v3/api-docs`,
		method: 'GET',
		success: (res) => {
			this.jobList = res.data;
		},
		fail: (err) => {
			console.log(err);
		}
	});
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
	padding: 64rpx;
	overflow-y: auto;
}

.page-header {
	margin-bottom: 48rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.page-title {
	font-size: 56rpx;
	font-weight: 600;
	color: #111827;
}

.page-subtitle {
	font-size: 32rpx;
	color: #6b7280;
}

.filter-section {
	display: flex;
	gap: 24rpx;
	margin-bottom: 48rpx;
	background: #ffffff;
	padding: 32rpx 40rpx;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	align-items: flex-end;
	flex-wrap: wrap;
}

.filter-item {
	flex: 1;
	min-width: 180rpx;
}

.filter-label {
	font-size: 24rpx;
	color: #6b7280;
	display: block;
	margin-bottom: 12rpx;
}

.filter-input {
	width: 100%;
	padding: 20rpx 24rpx;
	border: 2rpx solid #e5e7eb;
	border-radius: 12rpx;
	font-size: 28rpx;
	outline: none;
	transition: all 0.3s;

	&:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 3rpx rgba(59, 130, 246, 0.1);
	}
}

.filter-actions {
	display: flex;
	gap: 16rpx;
}

.search-btn {
	padding: 20rpx 48rpx;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #ffffff;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
	}

	&:active {
		transform: translateY(0);
	}
}

.reset-btn {
	padding: 20rpx 32rpx;
	background: #f3f4f6;
	color: #6b7280;
	border-radius: 12rpx;
	font-size: 28rpx;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		background: #e5e7eb;
	}
}

// 加载状态
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.loading-spinner {
	display: flex;
	gap: 16rpx;
	margin-bottom: 24rpx;

	.spinner-item {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3b82f6, #06b6d4);
		animation: bounce 1.4s ease-in-out infinite;

		&:nth-child(1) { animation-delay: 0s; }
		&:nth-child(2) { animation-delay: 0.2s; }
		&:nth-child(3) { animation-delay: 0.4s; }
	}
}

@keyframes bounce {
	0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
	40% { transform: scale(1.2); opacity: 1; }
}

.loading-text {
	font-size: 28rpx;
	color: #6b7280;
}

// 职位列表
.job-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.job-count {
	font-size: 28rpx;
	color: #6b7280;
	margin-bottom: 16rpx;

	.count {
		color: #3b82f6;
		font-weight: 600;
	}
}

.job-card {
	background: #ffffff;
	padding: 40rpx;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	border: 2rpx solid transparent;

	&:hover {
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
		transform: translateY(-4rpx);
		border-color: rgba(59, 130, 246, 0.2);
	}
}

.job-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 16rpx;
}

.job-title-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.job-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #111827;
}

.hot-tag {
	padding: 4rpx 16rpx;
	background: linear-gradient(135deg, #ef4444, #f97316);
	color: #ffffff;
	font-size: 20rpx;
	border-radius: 6rpx;
}

.job-salary {
	font-size: 32rpx;
	font-weight: 700;
	color: #10b981;
}

.job-company-info {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.job-company {
	font-size: 28rpx;
	color: #374151;
	font-weight: 500;
}

.company-divider {
	color: #d1d5db;
	font-size: 24rpx;
}

.company-scale,
.company-industry {
	font-size: 24rpx;
	color: #9ca3af;
}

.job-tags {
	display: flex;
	gap: 12rpx;
	margin-bottom: 20rpx;
	flex-wrap: wrap;
}

.job-tag {
	padding: 8rpx 20rpx;
	background: #f0f9ff;
	color: #3b82f6;
	border-radius: 8rpx;
	font-size: 24rpx;
}

.job-skills {
	display: flex;
	gap: 12rpx;
	margin-bottom: 24rpx;
	flex-wrap: wrap;
}

.skill-tag {
	padding: 6rpx 16rpx;
	background: #f8fafc;
	color: #64748b;
	border-radius: 6rpx;
	font-size: 22rpx;
	border: 1rpx solid #e2e8f0;
}

.job-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 20rpx;
	border-top: 1rpx solid #f3f4f6;
}

.job-match {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.match-label {
	font-size: 26rpx;
	color: #6b7280;
}

.match-bar {
	width: 160rpx;
	height: 12rpx;
	background: #e5e7eb;
	border-radius: 6rpx;
	overflow: hidden;
}

.match-fill {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #10b981);
	border-radius: 6rpx;
	transition: width 0.5s ease;
}

.match-value {
	font-size: 26rpx;
	font-weight: 600;
	color: #3b82f6;
	min-width: 80rpx;
}

.job-meta {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.publish-time {
	font-size: 24rpx;
	color: #9ca3af;
}

.hr-info {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.hr-online {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #9ca3af;

	&.online {
		background: #10b981;
		box-shadow: 0 0 8rpx rgba(16, 185, 129, 0.5);
	}
}

.hr-name {
	font-size: 24rpx;
	color: #6b7280;
}

// 空状态
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 24rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #9ca3af;
}
</style>
