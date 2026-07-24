<!-- 职位推荐 -->
<!-- 时间 2026.3.31-->

<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main job-main">
			<!-- 顶部 -->
			<view class="title-row">
				<view>
					<text class="page-title">职位推荐</text>
					<text class="page-subtitle">基于技能画像智能匹配，精准推荐最适合您的岗位</text>
				</view>
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
					<view class="search-btn" @click="handleSearch">
						<text class="btn-icon">🔍</text>
						<text class="btn-text">搜索</text>
					</view>
					<view class="reset-btn" @click="resetFilters">
						<text class="btn-icon">↺</text>
						<text class="btn-text">重置</text>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view v-if="loading" class="loading-hint">
				<view class="spinner-container">
					<view class="spinner-ring"></view>
					<view class="spinner-ring"></view>
					<view class="spinner-ring"></view>
				</view>
				<text class="loading-text">正在为您匹配职位...</text>
			</view>

			<!-- 职位列表 -->
			<view v-else class="job-list">
				<view class="job-count">
					<text class="count-label">共找到</text>
					<text class="count-value">{{ pagination.total }}</text>
					<text class="count-label">个职位</text>
				</view>

				<view 
					class="job-card" 
					v-for="(job, index) in jobList" 
					:key="job.id" 
					@click="viewJob(job)"
					:style="{ animationDelay: `${index * 80}ms` }"
				>
					<view class="job-header">
						<view class="job-title-row">
							<text class="job-title">{{ job.title }}</text>
							<view v-if="job.hot" class="hot-tag">
								<text class="hot-icon">🔥</text>
								<text class="hot-text">热招</text>
							</view>
						</view>
						<view class="salary-wrapper">
							<text class="job-salary">{{ job.salary }}</text>
						</view>
					</view>

					<view class="job-company-info">
						<view class="company-badge">
							<text class="company-initial">{{ job.company?.charAt(0) || '?' }}</text>
						</view>
						<view class="company-details">
							<text class="job-company">{{ job.company }}</text>
							<view class="company-meta">
								<text class="company-scale">{{ job.companyInfo?.scale }}</text>
								<text class="divider">·</text>
								<text class="company-industry">{{ job.companyInfo?.industry }}</text>
							</view>
						</view>
					</view>

					<view class="job-tags" v-if="job.tags && job.tags.length > 0">
						<view class="job-tag" v-for="tag in job.tags" :key="tag">{{ tag }}</view>
					</view>

					<view class="job-skills" v-if="job.skills && job.skills.length > 0">
						<view class="skill-tag" v-for="skill in job.skills" :key="skill">{{ skill }}</view>
					</view>

					<view class="job-footer">
						<view class="job-match">
							<view class="match-icon">✨</view>
							<text class="match-label">匹配度</text>
							<view class="match-bar">
								<view class="match-fill" :style="{ width: job.match + '%' }"></view>
							</view>
							<text class="match-value">{{ job.match }}%</text>
						</view>
						<view class="job-meta">
							<view class="meta-item">
								<text class="meta-icon">🕐</text>
								<text class="publish-time">{{ job.publishTime }}</text>
							</view>
							<view class="hr-info" v-if="job.hr?.name">
								<view class="hr-online" :class="{ online: job.hr?.online }"></view>
								<text class="hr-name">{{ job.hr?.name }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="jobList.length === 0" class="empty-state">
					<view class="empty-icon-wrapper">
						<text class="empty-icon">🔍</text>
					</view>
					<text class="empty-title">暂无匹配职位</text>
					<text class="empty-text">请调整筛选条件或尝试其他关键词</text>
					<view class="empty-action" @click="resetFilters">
						<text class="action-text">清除筛选条件</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

const BASE_URL = 'http://81.71.75.85:6008/api'

const filters = ref({
	keyword: '',
	city: '',
	industry: '',
	salary: ''
})

const jobList = ref([])
const loading = ref(false)

const pagination = ref({
	pageNum: 1,
	pageSize: 10,
	total: 0,
	pages: 0
})

const parseSalaryRange = (salaryStr) => {
	if (!salaryStr) return { min: null, max: null }
	const parts = salaryStr.split('-')
	if (parts.length === 2) {
		return {
			min: parseInt(parts[0]) || null,
			max: parseInt(parts[1]) || null
		}
	}
	return { min: null, max: null }
}

const getJobList = () => {
	const token = uni.getStorageSync('token')
	if (!token) {
		uni.showToast({ title: '请先登录', icon: 'none' })
		return
	}

	loading.value = true

	const salaryRange = parseSalaryRange(filters.value.salary)

	const params = {
		pageNum: pagination.value.pageNum,
		pageSize: pagination.value.pageSize
	}
	if (filters.value.keyword) params.keyword = filters.value.keyword
	if (filters.value.industry) params.industry = filters.value.industry
	if (salaryRange.min !== null) params.salaryMin = salaryRange.min
	if (salaryRange.max !== null) params.salaryMax = salaryRange.max

	uni.request({
		url: `${BASE_URL}/v1/position/list`,
		method: 'GET',
		header: {
			'Authorization': 'Bearer ' + token
		},
		data: params,
		success: (res) => {
			const code = res.data?.code
			const isSuccess = code === 0 || code === 200 || code === '0' || code === '200'

			if (res.statusCode === 200 && isSuccess) {
				const data = res.data.data || {}
				const records = data.records || []

				jobList.value = records.map(item => ({
					id: item.positionId,
					title: item.positionName,
					salary: item.salaryRange || '面议',
					company: item.companyName,
					companyInfo: {
						scale: item.companyScale || '',
						industry: item.industry || ''
					},
					tags: [],
					skills: [],
					match: item.matchScore || 85,
					publishTime: item.publishTime || '最近',
					hot: false,
					hr: { name: '', online: false }
				}))

				pagination.value = {
					pageNum: data.current || 1,
					pageSize: data.size || 10,
					total: data.total || 0,
					pages: data.pages || 0
				}
			} else {
				uni.showToast({
					title: res.data?.message || '获取职位列表失败',
					icon: 'none'
				})
			}
		},
		fail: (err) => {
			console.error('获取职位列表失败:', err)
			uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' })
		},
		complete: () => {
			loading.value = false
		}
	})
}

const handleSearch = () => {
	pagination.value.pageNum = 1
	getJobList()
}

const resetFilters = () => {
	filters.value = {
		keyword: '',
		city: '',
		industry: '',
		salary: ''
	}
	pagination.value.pageNum = 1
	getJobList()
}

const viewJob = (job) => {
	window.location.href = `/#/pages/Job/JobItem?id=${job.id}`
}

onMounted(() => {
	getJobList()
})
</script>

<style scoped lang="scss">
.job-main {
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

/* 筛选区域 */
.filter-section {
	display: flex;
	gap: var(--spacing-md);
	margin-bottom: var(--spacing-xl);
	background: var(--bg-card);
	padding: var(--spacing-lg) var(--spacing-xl);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--border-color);
	align-items: flex-end;
	flex-wrap: wrap;
	animation: slideUp 0.5s ease 0.1s backwards;
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

.filter-item {
	flex: 1;
	min-width: 160px;
}

.filter-label {
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
	display: block;
	margin-bottom: var(--spacing-xs);
	font-weight: var(--font-weight-medium);
}

.filter-input {
	width: 100%;
	padding: var(--spacing-sm) var(--spacing-md);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	font-size: var(--font-size-sm);
	outline: none;
	transition: all var(--transition-fast);
	background: var(--bg-card);
	color: var(--text-primary);

	&:focus {
		border-color: var(--primary-light);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	&::placeholder {
		color: var(--text-muted);
	}
}

.filter-actions {
	display: flex;
	gap: var(--spacing-sm);
}

.search-btn {
	padding: var(--spacing-sm) var(--spacing-lg);
	background: linear-gradient(135deg, var(--primary-light), #06b6d4);
	color: #fff;
	border-radius: var(--radius-md);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: all var(--transition-normal);
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
	}

	&:active {
		transform: translateY(0);
	}
}

.btn-icon {
	font-size: var(--font-size-sm);
}

.btn-text {
	display: block;
}

.reset-btn {
	padding: var(--spacing-sm) var(--spacing-md);
	background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
	color: var(--text-secondary);
	border-radius: var(--radius-md);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: all var(--transition-fast);
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);

	&:hover {
		background: linear-gradient(135deg, #e5e7eb, #d1d5db);
		color: var(--text-primary);
		transform: translateY(-1px);
	}
}

/* 加载状态 */
.loading-hint {
	padding: var(--spacing-3xl) 0;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--spacing-md);
}

.spinner-container {
	position: relative;
	width: 48px;
	height: 48px;
}

.spinner-ring {
	position: absolute;
	border: 3px solid transparent;
	border-top-color: var(--primary-light);
	border-radius: 50%;
	animation: spin 1s linear infinite;

	&:nth-child(1) {
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	&:nth-child(2) {
		width: 70%;
		height: 70%;
		top: 15%;
		left: 15%;
		animation-duration: 0.8s;
		animation-direction: reverse;
		border-top-color: #06b6d4;
	}

	&:nth-child(3) {
		width: 40%;
		height: 40%;
		top: 30%;
		left: 30%;
		animation-duration: 0.6s;
		border-top-color: #10b981;
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

.loading-text {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
}

/* 职位列表 */
.job-list {
	display: flex;
	flex-direction: column;
	gap: var(--spacing-md);
}

.job-count {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	margin-bottom: var(--spacing-sm);
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	animation: fadeIn 0.5s ease;
}

.count-label {
	color: var(--text-secondary);
}

.count-value {
	color: var(--primary-light);
	font-weight: var(--font-weight-bold);
	font-size: var(--font-size-lg);
}

.job-card {
	background: var(--bg-card);
	padding: var(--spacing-lg);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--border-color);
	cursor: pointer;
	transition: all var(--transition-normal);
	animation: slideInUp 0.5s ease backwards;

	&:hover {
		box-shadow: var(--shadow-lg);
		transform: translateY(-4px);
		border-color: rgba(59, 130, 246, 0.3);
	}
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.job-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: var(--spacing-sm);
}

.job-title-row {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	flex-wrap: wrap;
}

.job-title {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--text-primary);
	transition: color var(--transition-fast);

	.job-card:hover & {
		color: var(--primary-light);
	}
}

.hot-tag {
	padding: 3px 10px;
	background: linear-gradient(135deg, #ef4444, #f97316);
	color: #fff;
	font-size: var(--font-size-xs);
	border-radius: var(--radius-md);
	font-weight: var(--font-weight-medium);
	display: flex;
	align-items: center;
	gap: 3px;
	box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
	animation: pulse-glow 2s ease infinite;
}

@keyframes pulse-glow {
	0%, 100% {
		box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
	}
	50% {
		box-shadow: 0 2px 12px rgba(239, 68, 68, 0.5);
	}
}

.hot-icon {
	font-size: 10px;
}

.hot-text {
	display: block;
}

.salary-wrapper {
	flex-shrink: 0;
}

.job-salary {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-bold);
	background: linear-gradient(135deg, #10b981, #059669);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.job-company-info {
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	margin-bottom: var(--spacing-md);
}

.company-badge {
	width: 40px;
	height: 40px;
	background: linear-gradient(135deg, var(--primary-light), #06b6d4);
	border-radius: var(--radius-md);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.company-initial {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-bold);
	color: #fff;
}

.company-details {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.job-company {
	font-size: var(--font-size-base);
	color: var(--text-primary);
	font-weight: var(--font-weight-medium);
}

.company-meta {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.company-scale,
.company-industry {
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
}

.divider {
	color: var(--text-muted);
	font-size: var(--font-size-xs);
}

.job-tags {
	display: flex;
	gap: var(--spacing-xs);
	margin-bottom: var(--spacing-sm);
	flex-wrap: wrap;
}

.job-tag {
	padding: 4px 12px;
	background: linear-gradient(135deg, #eff6ff, #dbeafe);
	color: var(--primary-light);
	border-radius: var(--radius-md);
	font-size: var(--font-size-xs);
	font-weight: var(--font-weight-medium);
	transition: all var(--transition-fast);

	&:hover {
		background: linear-gradient(135deg, #dbeafe, #bfdbfe);
		transform: translateY(-1px);
	}
}

.job-skills {
	display: flex;
	gap: var(--spacing-xs);
	margin-bottom: var(--spacing-md);
	flex-wrap: wrap;
}

.skill-tag {
	padding: 3px 10px;
	background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
	color: var(--text-secondary);
	border-radius: var(--radius-sm);
	font-size: var(--font-size-xs);
	border: 1px solid transparent;
	transition: all var(--transition-fast);

	&:hover {
		background: linear-gradient(135deg, #e5e7eb, #d1d5db);
		color: var(--text-primary);
		border-color: var(--border-color);
	}
}

.job-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: var(--spacing-md);
	border-top: 1px solid var(--border-color);
	flex-wrap: wrap;
	gap: var(--spacing-sm);
}

.job-match {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.match-icon {
	font-size: var(--font-size-sm);
}

.match-label {
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
}

.match-bar {
	width: 80px;
	height: 6px;
	background: var(--border-color);
	border-radius: var(--radius-full);
	overflow: hidden;
}

.match-fill {
	height: 100%;
	background: linear-gradient(90deg, var(--primary-light), #10b981);
	border-radius: var(--radius-full);
	transition: width 0.8s ease;
	animation: progressGrow 0.8s ease;
}

@keyframes progressGrow {
	from {
		width: 0;
	}
}

.match-value {
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-semibold);
	color: var(--primary-light);
}

.job-meta {
	display: flex;
	align-items: center;
	gap: var(--spacing-md);
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 4px;
}

.meta-icon {
	font-size: var(--font-size-xs);
	opacity: 0.7;
}

.publish-time {
	font-size: var(--font-size-xs);
	color: var(--text-muted);
}

.hr-info {
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
}

.hr-online {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #d1d5db;
	transition: background var(--transition-fast);

	&.online {
		background: #10b981;
		box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
		animation: pulse-online 2s ease infinite;
	}
}

@keyframes pulse-online {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.6;
	}
}

.hr-name {
	font-size: var(--font-size-xs);
	color: var(--text-secondary);
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: var(--spacing-3xl) 0;
	gap: var(--spacing-md);
	animation: fadeIn 0.5s ease;
}

.empty-icon-wrapper {
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: var(--spacing-sm);
}

.empty-icon {
	font-size: 40px;
}

.empty-title {
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-semibold);
	color: var(--text-primary);
}

.empty-text {
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
}

.empty-action {
	margin-top: var(--spacing-md);
	padding: var(--spacing-sm) var(--spacing-lg);
	background: linear-gradient(135deg, var(--primary-light), #06b6d4);
	color: #fff;
	border-radius: var(--radius-md);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	transition: all var(--transition-normal);
	box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
	}
}

.action-text {
	display: block;
}

/* 响应式适配 */
@media (max-width: 1024px) {
	.filter-section {
		flex-direction: column;
		align-items: stretch;
	}

	.filter-item {
		min-width: 100%;
	}

	.filter-actions {
		justify-content: flex-end;
	}
}

@media (max-width: 768px) {
	.job-main {
		padding: var(--spacing-lg) var(--spacing-md);
	}

	.job-header {
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.salary-wrapper {
		align-self: flex-start;
	}

	.job-footer {
		flex-direction: column;
		align-items: flex-start;
	}

	.job-meta {
		width: 100%;
		justify-content: space-between;
	}
}
</style>