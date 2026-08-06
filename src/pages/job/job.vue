<!-- 职位推荐 -->
<!-- 按设计规范优化 UI，保持原有 API 与功能不变 -->

<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main job-main">
			<view class="job-page-wrapper">
				<!-- 顶部导航栏 -->
				<view class="top-nav">
					<view class="search-box">
						<text class="search-icon">🔍</text>
						<input
							class="search-input"
							v-model="filters.keyword"
							placeholder="搜索岗位、公司或关键词..."
							@confirm="handleSearch"
						/>
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
					<!-- 左侧筛选面板 -->
					<view class="filter-panel">
						<view class="filter-header">
							<text class="filter-title-icon">⚙</text>
							<text class="filter-title">筛选条件</text>
						</view>

						<!-- 工作城市 -->
						<view class="filter-group">
							<text class="group-label">工作城市</text>
							<view class="checkbox-list">
								<view
									class="checkbox-item"
									v-for="city in cityOptions"
									:key="city"
									@click="toggleCity(city)"
								>
									<view class="checkbox-box" :class="{ checked: selectedCities.includes(city) }">
										<text v-if="selectedCities.includes(city)" class="checkbox-tick">✓</text>
									</view>
									<text class="checkbox-label">{{ city }}</text>
								</view>
							</view>
						</view>

						<view class="filter-divider"></view>

						<!-- 薪资范围 -->
						<view class="filter-group">
							<text class="group-label">薪资范围</text>
							<view class="salary-slider">
								<input
									type="range"
									class="range-input"
									v-model.number="salaryRange[0]"
									:min="10"
									:max="80"
									@change="handleSearch"
								/>
							</view>
							<view class="salary-labels">
								<text>{{ salaryRange[0] }}K</text>
								<text>{{ salaryRange[1] }}K</text>
							</view>
						</view>

						<view class="filter-divider"></view>

						<!-- 工作经验 -->
						<view class="filter-group">
							<text class="group-label">工作经验</text>
							<view class="radio-list">
								<view
									class="radio-item"
									v-for="exp in experienceOptions"
									:key="exp"
									@click="selectedExperience = exp"
								>
									<view class="radio-circle" :class="{ checked: selectedExperience === exp }">
										<view v-if="selectedExperience === exp" class="radio-dot"></view>
									</view>
									<text class="radio-label">{{ exp }}</text>
								</view>
							</view>
						</view>

						<view class="filter-divider"></view>

						<!-- 技能标签 -->
						<view class="filter-group">
							<text class="group-label">技能标签</text>
							<view class="skill-tags">
								<view
									class="skill-pill"
									:class="{ active: selectedSkills.includes(skill) }"
									v-for="skill in skillOptions"
									:key="skill"
									@click="toggleSkill(skill)"
								>
									{{ skill }}
								</view>
							</view>
						</view>
					</view>

					<!-- 右侧职位列表 -->
					<view class="job-list-area">
						<view class="list-header">
							<text class="list-count">
								共找到 <text class="count-number">{{ pagination.total }}</text> 个匹配岗位
							</text>
							<view class="list-sort">
								<text class="sort-label">排序：</text>
								<view class="sort-select">
									<text>匹配度优先</text>
									<text class="sort-arrow">▼</text>
								</view>
							</view>
						</view>

						<!-- 加载状态 -->
						<view v-if="loading" class="loading-hint">
							<view class="spinner"></view>
							<text class="loading-text">正在为您匹配职位...</text>
						</view>

						<view v-else class="job-list">
							<view
								class="job-card"
								v-for="(job, index) in jobList"
								:key="job.id"
								@click="viewJob(job)"
								:style="{ animationDelay: `${index * 80}ms` }"
							>
								<view class="job-card-left">
									<view class="job-title-line">
										<text class="job-title">{{ job.title }}</text>
										<view class="source-tag">BOSS直聘</view>
									</view>
									<view class="company-info-line">
										<text class="info-icon">🏢</text>
										<text>{{ job.company }}</text>
										<text class="info-divider">|</text>
										<text>{{ job.companyInfo?.industry || '互联网/IT' }}</text>
										<text class="info-divider">|</text>
										<text>{{ job.companyInfo?.scale || '1000-9999人' }}</text>
									</view>
									<view class="skill-match-line">
										<text class="skill-match-label">技能匹配</text>
										<view class="skill-pill matched">✅ React</view>
										<view class="skill-pill matched">✅ Vue</view>
										<view class="skill-pill unmatched">TypeScript</view>
									</view>
									<view class="feature-tags-line">
										<view class="feature-tag green">大厂</view>
										<view class="feature-tag orange">福利好</view>
										<view class="feature-tag purple">成长空间</view>
									</view>
									<view class="action-btns">
										<view class="action-btn" @click.stop>
											<text>👁</text>
											<text>查看详情</text>
										</view>
										<view class="action-btn" @click.stop>
											<text>☆</text>
											<text>收藏岗位</text>
										</view>
									</view>
								</view>
								<view class="job-card-right">
									<text class="job-salary">{{ job.salary }}</text>
									<text class="publish-time">{{ job.publishTime }}</text>
									<view class="match-ring">
										<svg viewBox="0 0 56 56" class="ring-svg">
											<circle class="ring-bg" cx="28" cy="28" r="24"></circle>
											<circle
												class="ring-progress"
												cx="28"
												cy="28"
												r="24"
												:stroke-dasharray="`${2 * Math.PI * 24}`"
												:stroke-dashoffset="`${2 * Math.PI * 24 * (1 - job.match / 100)}`"
											></circle>
										</svg>
										<view class="ring-text">
											<text class="ring-number">{{ job.match }}%</text>
											<text class="ring-label">匹配度</text>
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
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { fetchPositionList } from '@/api/job'
import { useUserStore } from '@/stores/user'
import { DEFAULT_AVATAR, resolveAvatar } from '@/utils/avatar'

const userStore = useUserStore()

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

// 城市筛选（仅 UI，实际搜索仍使用顶部搜索框关键词）
const cityOptions = ['北京', '上海', '深圳', '杭州', '广州', '成都']
const selectedCities = ref([])
const salaryRange = ref([20, 50])
const experienceOptions = ['应届生', '1-3年', '3-5年', '5-10年', '10年以上']
const selectedExperience = ref('')
const skillOptions = ['React', 'Vue', 'TypeScript', 'Node.js', 'Python', 'Go', 'Docker', 'K8s']
const selectedSkills = ref([])
const avatarLoadFailed = ref(false)

const displayAvatar = computed(() =>
	avatarLoadFailed.value ? DEFAULT_AVATAR : resolveAvatar(userStore.isLogin ? userStore.userInfo?.avatar : '')
)

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

const toggleCity = (city) => {
	const idx = selectedCities.value.indexOf(city)
	if (idx > -1) {
		selectedCities.value.splice(idx, 1)
	} else {
		selectedCities.value.push(city)
	}
}

const toggleSkill = (skill) => {
	const idx = selectedSkills.value.indexOf(skill)
	if (idx > -1) {
		selectedSkills.value.splice(idx, 1)
	} else {
		selectedSkills.value.push(skill)
	}
}

const getJobList = async () => {
	if (!userStore.hasToken) {
		uni.showToast({ title: '请先登录', icon: 'none' })
		return
	}

	loading.value = true

	const salaryRangeParsed = parseSalaryRange(filters.value.salary)

	const res = await fetchPositionList({
		pageNum: pagination.value.pageNum,
		pageSize: pagination.value.pageSize,
		keyword: filters.value.keyword || undefined,
		city: filters.value.city || selectedCities.value.join(',') || undefined,
		industry: filters.value.industry || undefined,
		salaryMin: salaryRangeParsed.min,
		salaryMax: salaryRangeParsed.max,
	})

	if (res.ok) {
		const data = res.data || {}
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
			title: res.message || '获取职位列表失败',
			icon: 'none'
		})
	}

	loading.value = false
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
	selectedCities.value = []
	selectedExperience.value = ''
	selectedSkills.value = []
	salaryRange.value = [20, 50]
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
// 设计规范色值（仅本页使用）
$sidebar-bg: #1e3a5f;
$content-bg: #f0f2f5;
$card-bg: #ffffff;
$title-color: #1a1a2e;
$subtitle-color: #6b7280;
$muted-color: #9ca3af;
$primary-blue: #3b82f6;
$matched-green-bg: #dcfce7;
$matched-green-text: #16a34a;
$unmatched-gray-bg: #f3f4f6;
$unmatched-gray-text: #6b7280;
$feature-green-bg: #dcfce7;
$feature-green-text: #16a34a;
$feature-orange-bg: #fef3c7;
$feature-orange-text: #d97706;
$feature-purple-bg: #ede9fe;
$feature-purple-text: #7c3aed;
$salary-red: #ef4444;
$ring-green: #10b981;
$border-color: #e5e7eb;

.job-main {
	margin-left: var(--sidebar-width, 240px);
	padding: 0;
	background: $content-bg;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.job-page-wrapper {
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

/* ── 主内容区：左筛选 + 右列表 ── */
.content-area {
	flex: 1;
	display: flex;
	overflow: hidden;
	padding: 24px;
	gap: 20px;
}

/* ── 左侧筛选面板 ── */
.filter-panel {
	width: 260px;
	background: $card-bg;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	padding: 20px;
	flex-shrink: 0;
	overflow-y: auto;
}

.filter-header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-bottom: 16px;
	border-bottom: 1px solid $border-color;
	margin-bottom: 16px;

	.filter-title-icon {
		font-size: 16px;
		color: $primary-blue;
	}

	.filter-title {
		font-size: 16px;
		font-weight: 700;
		color: $title-color;
	}
}

.filter-group {
	margin-bottom: 16px;

	.group-label {
		font-size: 14px;
		color: #374151;
		display: block;
		margin-bottom: 12px;
	}
}

.filter-divider {
	height: 1px;
	background: $border-color;
	margin: 16px 0;
}

.checkbox-list,
.radio-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.checkbox-item,
.radio-item {
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
}

.checkbox-box {
	width: 16px;
	height: 16px;
	border: 2px solid #d1d5db;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s;

	&.checked {
		background: $primary-blue;
		border-color: $primary-blue;
	}

	.checkbox-tick {
		color: #fff;
		font-size: 10px;
	}
}

.checkbox-label,
.radio-label {
	font-size: 14px;
	color: #4b5563;
}

.radio-circle {
	width: 16px;
	height: 16px;
	border: 2px solid #d1d5db;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.15s;

	&.checked {
		border-color: $primary-blue;
	}

	.radio-dot {
		width: 8px;
		height: 8px;
		background: $primary-blue;
		border-radius: 50%;
	}
}

.salary-slider {
	margin-bottom: 8px;
}

.range-input {
	width: 100%;
	accent-color: $primary-blue;
}

.salary-labels {
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: $subtitle-color;
}

.skill-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.skill-pill {
	height: 28px;
	padding: 0 12px;
	border-radius: 20px;
	background: $unmatched-gray-bg;
	color: #4b5563;
	font-size: 13px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.15s;

	&.active {
		background: $primary-blue;
		color: #fff;
	}
}

/* ── 右侧职位列表 ── */
.job-list-area {
	flex: 1;
	overflow-y: auto;
	min-width: 0;
}

.list-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16px;
}

.list-count {
	font-size: 14px;
	color: $subtitle-color;

	.count-number {
		color: $primary-blue;
		font-weight: 700;
	}
}

.list-sort {
	display: flex;
	align-items: center;
	gap: 6px;

	.sort-label {
		font-size: 13px;
		color: $subtitle-color;
	}

	.sort-select {
		background: $card-bg;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 4px 10px;
		font-size: 13px;
		color: $title-color;
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;

		.sort-arrow {
			font-size: 10px;
			color: $muted-color;
		}
	}
}

.job-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.job-card {
	background: $card-bg;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	padding: 24px;
	min-height: 180px;
	display: flex;
	gap: 20px;
	cursor: pointer;
	transition: all 0.25s;
	animation: slideInUp 0.5s ease backwards;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-2px);
	}
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.job-card-left {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.job-title-line {
	display: flex;
	align-items: center;
	gap: 8px;

	.job-title {
		font-size: 16px;
		font-weight: 700;
		color: $title-color;
	}

	.source-tag {
		padding: 2px 8px;
		background: #eff6ff;
		color: $primary-blue;
		font-size: 12px;
		border-radius: 4px;
	}
}

.company-info-line {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: $subtitle-color;

	.info-icon {
		font-size: 12px;
		color: $muted-color;
	}

	.info-divider {
		color: $border-color;
	}
}

.skill-match-line {
	display: flex;
	align-items: center;
	gap: 6px;
	flex-wrap: wrap;
	margin-top: 4px;

	.skill-match-label {
		font-size: 12px;
		color: $muted-color;
		margin-right: 4px;
	}

	.skill-pill {
		height: 22px;
		padding: 0 8px;
		border-radius: 4px;
		font-size: 12px;
		display: flex;
		align-items: center;

		&.matched {
			background: $matched-green-bg;
			color: $matched-green-text;
		}

		&.unmatched {
			background: $unmatched-gray-bg;
			color: $unmatched-gray-text;
		}
	}
}

.feature-tags-line {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;

	.feature-tag {
		height: 22px;
		padding: 0 8px;
		border-radius: 4px;
		font-size: 12px;
		display: flex;
		align-items: center;

		&.green {
			background: $feature-green-bg;
			color: $feature-green-text;
		}

		&.orange {
			background: $feature-orange-bg;
			color: $feature-orange-text;
		}

		&.purple {
			background: $feature-purple-bg;
			color: $feature-purple-text;
		}
	}
}

.action-btns {
	display: flex;
	gap: 8px;
	margin-top: 8px;
}

.action-btn {
	height: 30px;
	padding: 0 12px;
	border: 1px solid #d1d5db;
	border-radius: 6px;
	font-size: 13px;
	color: #4b5563;
	display: flex;
	align-items: center;
	gap: 4px;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		border-color: $primary-blue;
		color: $primary-blue;
	}
}

.job-card-right {
	width: 160px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 8px;
}

.job-salary {
	font-size: 20px;
	font-weight: 700;
	color: $salary-red;
}

.publish-time {
	font-size: 12px;
	color: $muted-color;
}

.match-ring {
	position: relative;
	width: 56px;
	height: 56px;
	margin-top: 4px;

	.ring-svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.ring-bg {
		fill: none;
		stroke: #e5e7eb;
		stroke-width: 4;
	}

	.ring-progress {
		fill: none;
		stroke: $ring-green;
		stroke-width: 4;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.8s ease;
	}

	.ring-text {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.ring-number {
			font-size: 12px;
			font-weight: 700;
			color: $title-color;
		}

		.ring-label {
			font-size: 10px;
			color: $muted-color;
		}
	}
}

/* ── 加载与空状态 ── */
.loading-hint {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80px 0;
	gap: 16px;

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e5e7eb;
		border-top-color: $primary-blue;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-text {
		font-size: 14px;
		color: $subtitle-color;
	}
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80px 0;
	gap: 12px;
	background: $card-bg;
	border-radius: 12px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

	.empty-icon-wrapper {
		width: 80px;
		height: 80px;
		background: #f3f4f6;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.empty-icon {
		font-size: 36px;
	}

	.empty-title {
		font-size: 16px;
		font-weight: 700;
		color: $title-color;
	}

	.empty-text {
		font-size: 13px;
		color: $subtitle-color;
	}

	.empty-action {
		margin-top: 8px;
		padding: 8px 20px;
		background: $primary-blue;
		color: #fff;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
	}
}

/* ── 响应式适配 ── */
@media (max-width: 1200px) {
	.content-area {
		flex-direction: column;
		overflow-y: auto;
	}

	.filter-panel {
		width: 100%;
	}

	.job-list-area {
		overflow: visible;
	}
}

@media (max-width: 768px) {
	.search-box {
		width: 200px;
	}

	.job-card {
		flex-direction: column;
	}

	.job-card-right {
		width: 100%;
		align-items: flex-start;
		flex-direction: row;
		justify-content: space-between;
	}
}
</style>
