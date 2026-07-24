<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main job-detail-main">
			<!-- 页面头部 -->
			<view class="detail-header">
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
					<view class="action-btn" :class="{ favorited: isFavorited }" @click="toggleFavorite">
						<text class="action-icon">{{ isFavorited ? '❤️' : '🤍' }}</text>
						<text class="action-text">{{ isFavorited ? '已收藏' : '收藏' }}</text>
					</view>
					<view class="action-btn" @click="shareJob">
						<text class="action-icon">📤</text>
						<text class="action-text">分享</text>
					</view>
				</view>
			</view>

			<!-- 内容区域 -->
			<view class="detail-content">
				<!-- 左侧主要内容 -->
				<view class="left-section">
					<!-- 职位基本信息卡片 -->
					<view class="info-card card">
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
					<view class="description-card card">
						<view class="card-header">
							<text class="header-icon">📄</text>
							<text class="header-title">职位描述</text>
						</view>
						<view class="description-content">
							<text class="description-text">{{ jobInfo.description }}</text>
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
					<view class="match-card card">
						<text class="match-label">AI 匹配度</text>
						<text class="match-value">{{ jobInfo.matchScore }}%</text>
						<text class="match-desc">与您的简历匹配度一般</text>
					</view>

					<!-- 公司信息卡片 -->
					<view class="company-card card">
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
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

const BASE_URL = 'http://81.71.75.85:6008/api'

const jobId = ref('')
const isFavorited = ref(false)
const jobData = ref(null)
const loading = ref(true)

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

const goBack = () => {
	uni.navigateBack()
}

const toggleFavorite = () => {
	isFavorited.value = !isFavorited.value
	uni.showToast({
		title: isFavorited.value ? '已收藏' : '已取消收藏',
		icon: 'success'
	})
}

const shareJob = () => {
	uni.showActionSheet({
		itemList: ['微信', '朋友圈', 'QQ', '复制链接'],
		success: (res) => {
			uni.showToast({ title: '分享成功', icon: 'success' })
		}
	})
}

const getJobDetail = (positionId) => {
	loading.value = true
	uni.request({
		url: `${BASE_URL}/v1/position/${positionId}`,
		method: 'GET',
		header: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		success: (res) => {
			if (res.statusCode === 200 && (res.data?.code === 0 || res.data?.code === 200)) {
				jobData.value = res.data.data
			}
		},
		fail: () => {
			uni.showToast({ title: '网络错误', icon: 'none' })
		},
		complete: () => {
			loading.value = false
		}
	})
}

onMounted(() => {
	const pages = getCurrentPages()
	const currentPage = pages[pages.length - 1]
	jobId.value = currentPage.options.id || ''
	if (jobId.value) {
		getJobDetail(jobId.value)
	}
})
</script>

<style scoped lang="scss">
.job-detail-main {
	padding: 20px 32px 40px;
	overflow-y: auto;
}

.detail-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 24px;
	padding-bottom: 20px;
	border-bottom: 1px solid var(--border-color);
}

.header-left {
	flex: 1;
}

.back-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 16px;
	cursor: pointer;
	transition: all var(--transition-fast);
	color: var(--text-secondary);
	font-size: 14px;
	padding: 4px 8px;
	border-radius: var(--radius-sm);
	
	&:hover {
		background: var(--bg-page);
		color: var(--primary-light);
	}
}

.back-icon {
	font-size: 16px;
}

.title-section {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.job-title {
	font-size: 28px;
	font-weight: 700;
	color: var(--text-primary);
}

.job-tags {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.tag {
	padding: 4px 12px;
	background: rgba(147, 51, 234, 0.1);
	color: #9333ea;
	border-radius: 20px;
	font-size: 12px;
	font-weight: 500;
	transition: all var(--transition-fast);
	
	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(147, 51, 234, 0.2);
	}
}

.company-location {
	font-size: 14px;
	color: var(--text-secondary);
}

.header-actions {
	display: flex;
	gap: 12px;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 10px 16px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition: all var(--transition-fast);
	font-size: 14px;
	color: var(--text-secondary);
	
	&:hover {
		border-color: var(--primary-light);
		color: var(--primary-light);
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}
	
	&.favorited {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.05);
		
		.action-icon {
			animation: heartbeat 0.5s ease-in-out;
		}
	}
}

.action-icon {
	font-size: 16px;
}

@keyframes heartbeat {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.2); }
}

.detail-content {
	display: grid;
	grid-template-columns: 1fr 320px;
	gap: 24px;
}

.left-section {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.right-section {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.card {
	background: var(--bg-card);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--border-color);
	overflow: hidden;
	transition: all var(--transition-normal);
	
	&:hover {
		box-shadow: var(--shadow-md);
	}
}

.card-header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 16px 20px;
	border-bottom: 1px solid var(--bg-page);
	background: linear-gradient(to right, var(--bg-card), var(--bg-page));
}

.header-icon {
	font-size: 18px;
}

.header-title {
	font-size: 15px;
	font-weight: 600;
	color: var(--text-primary);
}

.info-card {
	padding: 24px;
	display: flex;
	gap: 20px;
}

.company-logo {
	width: 80px;
	height: 80px;
	background: linear-gradient(135deg, var(--primary-light), #06b6d4);
	border-radius: var(--radius-md);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	box-shadow: var(--shadow-sm);
}

.logo-text {
	font-size: 32px;
	font-weight: 700;
	color: #ffffff;
}

.info-details {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.salary-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.salary {
	font-size: 28px;
	font-weight: 700;
	color: #ea580c;
}

.source-badge {
	padding: 4px 12px;
	background: rgba(37, 99, 235, 0.1);
	color: var(--primary-light);
	border-radius: 20px;
	font-size: 12px;
	font-weight: 500;
}

.basic-info {
	display: flex;
	gap: 20px;
	flex-wrap: wrap;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 6px;
	color: var(--text-secondary);
	font-size: 14px;
}

.info-icon {
	font-size: 14px;
}

.skills-section {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.skills-title {
	font-size: 13px;
	color: var(--text-secondary);
	font-weight: 500;
}

.skills-list {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.skill-tag {
	padding: 6px 12px;
	background: var(--bg-page);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	color: var(--text-secondary);
	transition: all var(--transition-fast);
	
	&:hover {
		transform: translateY(-1px);
	}
	
	&.matched {
		background: rgba(34, 197, 94, 0.1);
		border-color: rgba(34, 197, 94, 0.3);
		color: #16a34a;
	}
}

.skill-icon {
	font-weight: 700;
}

.description-card {
	padding: 20px;
}

.description-content {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.description-text {
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.8;
}

.responsibilities {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.section-title {
	font-size: 14px;
	color: var(--text-primary);
	font-weight: 600;
	margin-bottom: 4px;
}

.responsibility-item {
	display: flex;
	gap: 8px;
	align-items: flex-start;
}

.bullet {
	color: var(--primary-light);
	font-size: 14px;
	flex-shrink: 0;
}

.responsibility-text {
	font-size: 14px;
	color: var(--text-secondary);
	line-height: 1.6;
}

.match-card {
	padding: 24px;
	background: linear-gradient(135deg, #06b6d4, var(--primary-light));
	color: #ffffff;
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 8px;
	border: none;
}

.match-label {
	font-size: 14px;
	opacity: 0.9;
}

.match-value {
	font-size: 48px;
	font-weight: 700;
}

.match-desc {
	font-size: 13px;
	opacity: 0.9;
}

.company-card {
	padding: 16px;
}

.company-info {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--bg-page);
	
	&:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}
}

.label {
	font-size: 13px;
	color: var(--text-muted);
}

.value {
	font-size: 13px;
	color: var(--text-primary);
	font-weight: 500;
}

@media (max-width: 1024px) {
	.detail-content {
		grid-template-columns: 1fr;
	}
	
	.right-section {
		order: -1;
	}
}
</style>