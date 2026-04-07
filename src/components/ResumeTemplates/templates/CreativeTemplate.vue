<template>
	<view class="creative-template">
		<!-- 头部信息 -->
		<view class="header-section">
			<view class="avatar-area">
				<view class="avatar-placeholder">
					<text class="avatar-text">{{ resume.basic?.name?.charAt(0) || '姓' }}</text>
				</view>
			</view>
			<view class="info-area">
				<text class="name">{{ resume.basic?.name || '姓名' }}</text>
				<text class="job-title">{{ resume.basic?.job || '求职岗位' }}</text>
				<view class="contact-tags">
					<text v-if="resume.basic?.phone" class="contact-tag">{{ resume.basic?.phone }}</text>
					<text v-if="resume.basic?.email" class="contact-tag">{{ resume.basic?.email }}</text>
					<text v-if="resume.basic?.location" class="contact-tag">{{ resume.basic?.location }}</text>
				</view>
			</view>
		</view>

		<!-- 个人简介 -->
		<view v-if="resume.summary" class="resume-section summary-section">
			<view class="section-icon">✨</view>
			<view class="section-body">
				<text class="section-title">关于我</text>
				<text class="summary-text">{{ resume.summary }}</text>
			</view>
		</view>

		<!-- 教育背景 -->
		<view v-if="resume.education?.length" class="resume-section">
			<view class="section-icon">🎓</view>
			<view class="section-body">
				<text class="section-title">教育背景</text>
				<view v-for="(edu, index) in resume.education" :key="index" class="timeline-item">
					<view class="timeline-dot"></view>
					<view class="timeline-content">
						<view class="item-header">
							<text class="school-name">{{ edu.school }}</text>
							<text class="date-badge">{{ edu.startDate }} - {{ edu.endDate || '至今' }}</text>
						</view>
						<view class="item-detail">
							<text v-if="edu.major" class="detail-text">{{ edu.major }}</text>
							<text v-if="edu.degree" class="detail-text">{{ edu.degree }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 工作经历 -->
		<view v-if="resume.experience?.length" class="resume-section">
			<view class="section-icon">💼</view>
			<view class="section-body">
				<text class="section-title">工作经历</text>
				<view v-for="(exp, index) in resume.experience" :key="index" class="timeline-item">
					<view class="timeline-dot"></view>
					<view class="timeline-content">
						<view class="item-header">
							<text class="company-name">{{ exp.company }}</text>
							<text class="date-badge">{{ exp.startDate }} - {{ exp.endDate || '至今' }}</text>
						</view>
						<text v-if="exp.position" class="position-text">{{ exp.position }}</text>
						<view v-if="exp.achievements?.length" class="achievements-list">
							<text v-for="(a, i) in exp.achievements" :key="i" class="achievement-item">◆ {{ a }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 项目经验 -->
		<view v-if="resume.projects?.length" class="resume-section">
			<view class="section-icon">🚀</view>
			<view class="section-body">
				<text class="section-title">项目经验</text>
				<view v-for="(project, index) in resume.projects" :key="index" class="project-card">
					<view class="project-header">
						<text class="project-name">{{ project.name }}</text>
						<text class="date-text">{{ project.startDate }} - {{ project.endDate || '至今' }}</text>
					</view>
					<text v-if="project.role" class="role-text">{{ project.role }}</text>
					<view v-if="project.techStack?.length" class="tech-stack">
						<text v-for="(tech, i) in project.techStack" :key="i" class="tech-tag">{{ tech }}</text>
					</view>
					<view v-if="project.highlights?.length" class="highlights-list">
						<text v-for="(h, i) in project.highlights" :key="i" class="highlight-item">◆ {{ h }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 技能 -->
		<view v-if="resume.skills?.length" class="resume-section">
			<view class="section-icon">⚡</view>
			<view class="section-body">
				<text class="section-title">专业技能</text>
				<view class="skills-grid">
					<view v-for="(skill, index) in resume.skills" :key="index" class="skill-group">
						<text v-if="skill.category" class="category-label">{{ skill.category }}</text>
						<view class="skill-tags">
							<text v-for="(item, i) in skill.items" :key="i" class="skill-tag">{{ item }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 证书 -->
		<view v-if="resume.certificates?.length" class="resume-section">
			<view class="section-icon">🏆</view>
			<view class="section-body">
				<text class="section-title">证书荣誉</text>
				<view class="certificates-list">
					<view v-for="(cert, index) in resume.certificates" :key="index" class="cert-item">
						<text class="cert-name">{{ cert.name }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	resume: {
		type: Object,
		required: true
	}
})
</script>

<style scoped lang="scss">
.creative-template {
	font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
	color: #1f2937;
	line-height: 1.6;
	background: linear-gradient(180deg, #faf5ff 0%, #ffffff 100%);
	padding: 32rpx;
	border-radius: 16rpx;
}

/* 头部 */
.header-section {
	display: flex;
	align-items: center;
	gap: 32rpx;
	padding: 32rpx;
	background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
	border-radius: 16rpx;
	margin-bottom: 32rpx;
}

.avatar-area {
	flex-shrink: 0;
}

.avatar-placeholder {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-text {
	font-size: 48rpx;
	font-weight: 700;
	color: #ffffff;
}

.info-area {
	flex: 1;
}

.name {
	font-size: 44rpx;
	font-weight: 700;
	color: #ffffff;
	display: block;
	margin-bottom: 8rpx;
}

.job-title {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
	display: block;
	margin-bottom: 16rpx;
}

.contact-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.contact-tag {
	font-size: 20rpx;
	color: #ffffff;
	background: rgba(255, 255, 255, 0.2);
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
}

/* 模块 */
.resume-section {
	display: flex;
	gap: 16rpx;
	margin-bottom: 32rpx;
	page-break-inside: avoid;
}

.section-icon {
	width: 48rpx;
	height: 48rpx;
	background: linear-gradient(135deg, #7c3aed, #a855f7);
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	flex-shrink: 0;
}

.section-body {
	flex: 1;
}

.section-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #7c3aed;
	display: block;
	margin-bottom: 16rpx;
}

/* 时间线 */
.timeline-item {
	position: relative;
	padding-left: 24rpx;
	padding-bottom: 24rpx;
	border-left: 3rpx solid #e9d5ff;

	&:last-child {
		padding-bottom: 0;
		border-left-color: transparent;
	}
}

.timeline-dot {
	position: absolute;
	left: -9rpx;
	top: 6rpx;
	width: 16rpx;
	height: 16rpx;
	background: #7c3aed;
	border-radius: 50%;
}

.timeline-content {
	padding-left: 8rpx;
}

.item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.school-name,
.company-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #1f2937;
}

.date-badge {
	font-size: 20rpx;
	color: #7c3aed;
	background: #f5f3ff;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;
}

.item-detail {
	display: flex;
	gap: 16rpx;
}

.detail-text {
	font-size: 22rpx;
	color: #6b7280;
}

.position-text {
	font-size: 22rpx;
	color: #7c3aed;
	font-weight: 500;
	display: block;
	margin-bottom: 8rpx;
}

.achievements-list,
.highlights-list {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.achievement-item,
.highlight-item {
	font-size: 22rpx;
	color: #4b5563;
}

/* 项目卡片 */
.project-card {
	background: #ffffff;
	border: 2rpx solid #e9d5ff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
}

.project-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.project-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #1f2937;
}

.date-text {
	font-size: 20rpx;
	color: #9ca3af;
}

.role-text {
	font-size: 22rpx;
	color: #7c3aed;
	display: block;
	margin-bottom: 12rpx;
}

.tech-stack {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-bottom: 12rpx;
}

.tech-tag {
	font-size: 20rpx;
	color: #7c3aed;
	background: #faf5ff;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;
	border: 1rpx solid #e9d5ff;
}

/* 技能 */
.skills-grid {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.skill-group {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.category-label {
	font-size: 22rpx;
	font-weight: 600;
	color: #6b7280;
}

.skill-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.skill-tag {
	font-size: 22rpx;
	color: #4b5563;
	background: #f3f4f6;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
}

/* 证书 */
.certificates-list {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.cert-item {
	background: linear-gradient(135deg, #fef3c7, #fde68a);
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
}

.cert-name {
	font-size: 22rpx;
	color: #92400e;
}

/* 打印样式 */
@media print {
	.header-section {
		background: #7c3aed !important;
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}

	.creative-template {
		background: #ffffff;
		padding: 0;
	}
}
</style>
