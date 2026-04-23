<template>
	<view class="job-detail-container">
		<!-- 侧边栏 -->
		<Sidebar />
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 页面头部 -->
			<view class="page-header">
				<view class="header-left">
					<view class="back-btn" @click="goBack">
						<text class="back-icon">←</text>
						<text class="back-text">返回列表</text>
					</view>
					<view class="title-section">
						<text class="job-title">{{ jobInfo.title }}</text>
						<view class="job-tags">
							<text class="tag" v-for="tag in jobInfo.tags" :key="tag">{{ tag }}</text>
						</view>
						<text class="company-location">{{ jobInfo.company }} · {{ jobInfo.location }}</text>
					</view>
				</view>
				<view class="header-actions">
					<view class="action-btn" @click="toggleFavorite">
						<text class="action-icon" :class="{ favorited: isFavorited }">
							{{ isFavorited ? '❤️' : '🤍' }}
						</text>
						<text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
					</view>
					<view class="action-btn" @click="shareJob">
						<text class="action-icon">📤</text>
						<text class="action-text">分享</text>
					</view>
				</view>
			</view>

			<!-- 内容区域 -->
			<view class="content-wrapper">
				<!-- 左侧主要内容 -->
				<view class="left-section">
					<!-- 职位基本信息卡片 -->
					<view class="info-card">
						<view class="company-logo">
							<text class="logo-text">{{ jobInfo.companyNameShort }}</text>
						</view>
						<view class="info-details">
							<view class="salary-section">
								<text class="salary">{{ jobInfo.salary }}</text>
								<view class="source-badge">{{ jobInfo.source }}</view>
							</view>
							<view class="basic-info">
								<view class="info-item">
									<text class="info-icon">📍</text>
									<text class="info-text">{{ jobInfo.location }}</text>
								</view>
								<view class="info-item">
									<text class="info-icon">⏱</text>
									<text class="info-text">{{ jobInfo.experience }}</text>
								</view>
								<view class="info-item">
									<text class="info-icon">🎓</text>
									<text class="info-text">{{ jobInfo.education }}</text>
								</view>
							</view>
							<view class="skills-section">
								<text class="skills-title">技能要求</text>
								<view class="skills-list">
									<view 
										class="skill-tag" 
										v-for="skill in jobInfo.skills" 
										:key="skill.name"
										:class="{ matched: skill.matched }"
									>
										<text class="skill-icon" v-if="skill.matched">✓</text>
										<text class="skill-text">{{ skill.name }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 职位描述 -->
					<view class="description-card">
						<view class="card-header">
							<text class="header-icon">📄</text>
							<text class="header-title">职位描述</text>
						</view>
						<view class="description-content">
							<text class="description-text">
								{{ jobInfo.description }}
							</text>
							<view class="responsibilities">
								<text class="section-title">主要职责：</text>
								<view class="responsibility-item" v-for="(item, index) in jobInfo.responsibilities" :key="index">
									<text class="bullet">•</text>
									<text class="responsibility-text">{{ item }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 右侧信息栏 -->
				<view class="right-section">
					<!-- AI匹配度卡片 -->
					<view class="match-card">
						<text class="match-label">AI 匹配度</text>
						<text class="match-value">{{ jobInfo.matchScore }}%</text>
						<text class="match-desc">与您的简历匹配度一般</text>
					</view>

					<!-- 公司信息卡片 -->
					<view class="company-card">
						<view class="card-header">
							<text class="header-icon">🏢</text>
							<text class="header-title">公司信息</text>
						</view>
						<view class="company-info">
							<view class="info-row">
								<text class="label">公司规模</text>
								<text class="value">{{ jobInfo.companyInfo.scale }}</text>
							</view>
							<view class="info-row">
								<text class="label">所属行业</text>
								<text class="value">{{ jobInfo.companyInfo.industry }}</text>
							</view>
							<view class="info-row">
								<text class="label">融资阶段</text>
								<text class="value">{{ jobInfo.companyInfo.financingStage }}</text>
							</view>
							<view class="info-row">
								<text class="label">公司地址</text>
								<text class="value">{{ jobInfo.companyInfo.address }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

// API 基础地址
const BASE_URL = 'http://81.71.75.85:6008/api'

const jobId = ref('')
const isFavorited = ref(false)
const jobData = ref(null)
const loading = ref(true)

// 解析JSON数组
const parseJsonArray = (str) => {
	if (!str) return []
	try {
		return JSON.parse(str)
	} catch {
		return []
	}
}

// 职位信息
const jobInfo = ref({
	title: '社区运营',
	tags: ['小米生态', '用户增长', '内容运营'],
	company: '小米科技',
	location: '北京',
	companyNameShort: '米',
	salary: '0.8-1.5K',
	source: 'BOSS直聘',
	experience: '3-5年',
	education: '本科',
	skills: [
		{ name: '社群运营', matched: true },
		{ name: '内容策划', matched: true },
		{ name: '数据分析', matched: false },
		{ name: '用户增长', matched: false }
	],
	description: '我们正在寻找一位经验丰富的社区运营专家加入我们的用户增长团队。你将负责小米社区的日常运营管理，策划并执行各类线上活动，提升用户活跃度和社区影响力，打造高质量的用户交流生态。',
	responsibilities: [
		'负责小米社区的整体运营策略制定与执行',
		'策划并组织线上线下用户活动，提升社区活跃度',
		'分析社区用户数据，优化运营策略和内容方向',
		'与产品、市场团队紧密合作，推动用户增长目标达成'
	],
	matchScore: 50,
	companyInfo: {
		scale: '5000-10000人',
		industry: '互联网/IT',
		financingStage: '已上市',
		address: '北京市海淀区西二旗'
	}
})

// 返回列表
const goBack = () => {
	uni.navigateBack()
}

// 切换收藏状态
const toggleFavorite = () => {
	isFavorited.value = !isFavorited.value
	uni.showToast({
		title: isFavorited.value ? '已收藏' : '已取消收藏',
		icon: 'success'
	})
}

// 分享职位
const shareJob = () => {
	uni.showActionSheet({
		itemList: ['微信', '朋友圈', 'QQ', '复制链接'],
		success: (res) => {
			console.log('选择了分享渠道:', res.tapIndex)
			uni.showToast({
				title: '分享成功',
				icon: 'success'
			})
		}
	})
}

// 获取职位详情
const getJobDetail = (positionId) => {
	console.log('=== 获取职位详情 ===')
	console.log('positionId:', positionId)
	loading.value = true

	uni.request({
		url: `${BASE_URL}/v1/position/${positionId}`,
		method: 'GET',
		header: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		success: (res) => {
			console.log('=== 职位详情接口响应 ===')
			console.log('HTTP状态码:', res.statusCode)
			console.log('完整响应数据:', JSON.stringify(res.data, null, 2))
			console.log('code:', res.data?.code)
			console.log('data:', res.data?.data)

			if (res.statusCode === 200 && (res.data?.code === 0 || res.data?.code === 200)) {
				jobData.value = res.data.data
				console.log('=== jobData 赋值成功 ===')
				console.log('jobData.value:', JSON.stringify(jobData.value, null, 2))
			} else if (res.statusCode === 404) {
				uni.showToast({
					title: '职位不存在',
					icon: 'none'
				})
			} else {
				uni.showToast({
					title: res.data?.message || '获取职位详情失败',
					icon: 'none'
				})
			}
		},
		fail: (err) => {
			console.error('=== 获取职位详情失败 ===')
			console.error('错误:', err)
			uni.showToast({
				title: '网络错误',
				icon: 'none'
			})
		},
		complete: () => {
			loading.value = false
		}
	})
}

onMounted(() => {
	// 获取路由参数
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	jobId.value = currentPage.options.id || ''

	if (jobId.value) {
		getJobDetail(jobId.value)
	}
})
</script>

<style scoped lang="scss">
.job-detail-container {
	display: flex;
	height: 100vh;
	background-color: #f9fafb;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 48rpx 64rpx;
	overflow-y: auto;
}

// 页面头部
.page-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 48rpx;
	padding-bottom: 32rpx;
	border-bottom: 1px solid #e5e7eb;
}

.header-left {
	flex: 1;
}

.back-btn {
	display: inline-flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 24rpx;
	cursor: pointer;
	transition: opacity 0.3s;
	
	&:hover {
		opacity: 0.7;
	}
}

.back-icon {
	font-size: 32rpx;
	color: #6b7280;
}

.back-text {
	font-size: 28rpx;
	color: #6b7280;
}

.title-section {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.job-title {
	font-size: 56rpx;
	font-weight: 700;
	color: #111827;
}

.job-tags {
	display: flex;
	gap: 16rpx;
}

.tag {
	padding: 8rpx 24rpx;
	background: #f3e8ff;
	color: #9333ea;
	border-radius: 8rpx;
	font-size: 24rpx;
}

.company-location {
	font-size: 32rpx;
	color: #6b7280;
}

.header-actions {
	display: flex;
	gap: 24rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 32rpx;
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 12rpx;
	cursor: pointer;
	transition: all 0.3s;
	
	&:hover {
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
}

.action-icon {
	font-size: 32rpx;
	
	&.favorited {
		animation: heartbeat 0.5s ease-in-out;
	}
}

.action-text {
	font-size: 28rpx;
	color: #374151;
}

@keyframes heartbeat {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.2); }
}

// 内容布局
.content-wrapper {
	display: grid;
	grid-template-columns: 1fr 400rpx;
	gap: 48rpx;
}

.left-section {
	display: flex;
	flex-direction: column;
	gap: 48rpx;
}

.right-section {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

// 卡片通用样式
.info-card,
.description-card,
.match-card,
.company-card {
	background: #ffffff;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
}

.card-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 32rpx 40rpx;
	border-bottom: 1px solid #f3f4f6;
}

.header-icon {
	font-size: 36rpx;
}

.header-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #111827;
}

// 职位基本信息卡片
.info-card {
	padding: 48rpx;
	display: flex;
	gap: 40rpx;
}

.company-logo {
	width: 160rpx;
	height: 160rpx;
	background: linear-gradient(135deg, #3b82f6, #06b6d4);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.logo-text {
	font-size: 64rpx;
	font-weight: 700;
	color: #ffffff;
}

.info-details {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.salary-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.salary {
	font-size: 56rpx;
	font-weight: 700;
	color: #ea580c;
}

.source-badge {
	padding: 8rpx 24rpx;
	background: #eff6ff;
	color: #3b82f6;
	border-radius: 24rpx;
	font-size: 28rpx;
}

.basic-info {
	display: flex;
	gap: 32rpx;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.info-icon {
	font-size: 28rpx;
}

.info-text {
	font-size: 28rpx;
	color: #6b7280;
}

.skills-section {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.skills-title {
	font-size: 28rpx;
	color: #374151;
	font-weight: 500;
}

.skills-list {
	display: flex;
	gap: 16rpx;
	flex-wrap: wrap;
}

.skill-tag {
	padding: 12rpx 24rpx;
	background: #f3f4f6;
	border: 1px solid #e5e7eb;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	gap: 8rpx;
	
	&.matched {
		background: #dcfce7;
		border-color: #86efac;
	}
}

.skill-icon {
	color: #22c55e;
	font-weight: 700;
}

.skill-text {
	font-size: 26rpx;
	color: #374151;
}

// 职位描述卡片
.description-card {
	padding: 40rpx;
}

.description-content {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.description-text {
	font-size: 30rpx;
	color: #475569;
	line-height: 1.8;
}

.responsibilities {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.section-title {
	font-size: 30rpx;
	color: #374151;
	font-weight: 600;
	margin-bottom: 8rpx;
}

.responsibility-item {
	display: flex;
	gap: 12rpx;
	align-items: flex-start;
}

.bullet {
	color: #6b7280;
	font-size: 30rpx;
	flex-shrink: 0;
}

.responsibility-text {
	font-size: 30rpx;
	color: #475569;
	line-height: 1.6;
}

// AI匹配度卡片
.match-card {
	padding: 48rpx;
	background: linear-gradient(135deg, #06b6d4, #3b82f6);
	color: #ffffff;
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.match-label {
	font-size: 32rpx;
	opacity: 0.9;
}

.match-value {
	font-size: 96rpx;
	font-weight: 700;
}

.match-desc {
	font-size: 28rpx;
	opacity: 0.9;
}

// 公司信息卡片
.company-card {
	padding: 40rpx;
}

.company-info {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 24rpx;
	border-bottom: 1px solid #f3f4f6;
	
	&:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
}

.label {
	font-size: 28rpx;
	color: #6b7280;
}

.value {
	font-size: 28rpx;
	color: #111827;
	font-weight: 500;
}
</style>
