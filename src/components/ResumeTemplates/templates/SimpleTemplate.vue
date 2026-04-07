<template>
	<view class="simple-template">
		<!-- 头部信息 -->
		<view class="header-section">
			<view class="basic-info">
				<text class="name">{{ resume.basic?.name || '姓名' }}</text>
				<text class="job-title">{{ resume.basic?.job || '求职岗位' }}</text>
				<view class="contact-info">
					<text v-if="resume.basic?.phone" class="contact-item">{{ resume.basic?.phone }}</text>
					<text v-if="resume.basic?.email" class="contact-item">{{ resume.basic?.email }}</text>
					<text v-if="resume.basic?.location" class="contact-item">{{ resume.basic?.location }}</text>
				</view>
			</view>
		</view>

		<!-- 个人简介 -->
		<view v-if="resume.summary" class="resume-section">
			<view class="section-header">
				<text class="section-title">个人简介</text>
			</view>
			<view class="section-content">
				<text class="summary-text">{{ resume.summary }}</text>
			</view>
		</view>

		<!-- 教育背景 -->
		<view v-if="resume.education?.length" class="resume-section">
			<view class="section-header">
				<text class="section-title">教育背景</text>
			</view>
			<view class="section-content">
				<view v-for="(edu, index) in resume.education" :key="index" class="education-item">
					<view class="item-header">
						<text class="school-name">{{ edu.school }}</text>
						<text class="date-range">{{ edu.startDate }} - {{ edu.endDate || '至今' }}</text>
					</view>
					<view class="item-detail">
						<text v-if="edu.major" class="major">{{ edu.major }}</text>
						<text v-if="edu.degree" class="degree">{{ edu.degree }}</text>
					</view>
					<view v-if="edu.highlights?.length" class="item-highlights">
						<text v-for="(h, i) in edu.highlights" :key="i" class="highlight-item">• {{ h }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 工作经历 -->
		<view v-if="resume.experience?.length" class="resume-section">
			<view class="section-header">
				<text class="section-title">工作经历</text>
			</view>
			<view class="section-content">
				<view v-for="(exp, index) in resume.experience" :key="index" class="experience-item">
					<view class="item-header">
						<text class="company-name">{{ exp.company }}</text>
						<text class="date-range">{{ exp.startDate }} - {{ exp.endDate || '至今' }}</text>
					</view>
					<view class="item-detail">
						<text v-if="exp.position" class="position">{{ exp.position }}</text>
					</view>
					<view v-if="exp.description" class="item-description">
						<text>{{ exp.description }}</text>
					</view>
					<view v-if="exp.achievements?.length" class="item-achievements">
						<text v-for="(a, i) in exp.achievements" :key="i" class="achievement-item">• {{ a }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 项目经验 -->
		<view v-if="resume.projects?.length" class="resume-section">
			<view class="section-header">
				<text class="section-title">项目经验</text>
			</view>
			<view class="section-content">
				<view v-for="(project, index) in resume.projects" :key="index" class="project-item">
					<view class="item-header">
						<text class="project-name">{{ project.name }}</text>
						<text class="date-range">{{ project.startDate }} - {{ project.endDate || '至今' }}</text>
					</view>
					<view v-if="project.role" class="item-detail">
						<text class="role">{{ project.role }}</text>
					</view>
					<view v-if="project.description" class="item-description">
						<text>{{ project.description }}</text>
					</view>
					<view v-if="project.techStack?.length" class="tech-stack">
						<text class="tech-label">技术栈：</text>
						<text v-for="(tech, i) in project.techStack" :key="i" class="tech-tag">{{ tech }}</text>
					</view>
					<view v-if="project.highlights?.length" class="item-highlights">
						<text v-for="(h, i) in project.highlights" :key="i" class="highlight-item">• {{ h }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 技能 -->
		<view v-if="resume.skills?.length" class="resume-section">
			<view class="section-header">
				<text class="section-title">专业技能</text>
			</view>
			<view class="section-content">
				<view v-for="(skill, index) in resume.skills" :key="index" class="skill-category">
					<text v-if="skill.category" class="category-name">{{ skill.category }}：</text>
					<text class="skill-items">{{ skill.items?.join('、') }}</text>
				</view>
			</view>
		</view>

		<!-- 证书 -->
		<view v-if="resume.certificates?.length" class="resume-section">
			<view class="section-header">
				<text class="section-title">证书荣誉</text>
			</view>
			<view class="section-content">
				<view v-for="(cert, index) in resume.certificates" :key="index" class="certificate-item">
					<text class="cert-name">{{ cert.name }}</text>
					<text v-if="cert.date" class="cert-date">{{ cert.date }}</text>
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
.simple-template {
	font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
	color: #1e293b;
	line-height: 1.6;
}

/* 头部 */
.header-section {
	padding-bottom: 32rpx;
	border-bottom: 4rpx solid #2563eb;
	margin-bottom: 32rpx;
}

.basic-info {
	text-align: center;
}

.name {
	font-size: 48rpx;
	font-weight: 700;
	color: #1e293b;
	display: block;
	margin-bottom: 12rpx;
}

.job-title {
	font-size: 32rpx;
	color: #2563eb;
	font-weight: 500;
	display: block;
	margin-bottom: 20rpx;
}

.contact-info {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 24rpx;
}

.contact-item {
	font-size: 24rpx;
	color: #64748b;
}

/* 模块 */
.resume-section {
	margin-bottom: 32rpx;
	page-break-inside: avoid;
}

.section-header {
	margin-bottom: 16rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2563eb;
	padding-bottom: 8rpx;
	border-bottom: 2rpx solid #e2e8f0;
	display: block;
}

.section-content {
	padding-left: 8rpx;
}

/* 教育经历 */
.education-item,
.experience-item,
.project-item {
	margin-bottom: 24rpx;
	page-break-inside: avoid;
}

.item-header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 8rpx;
}

.school-name,
.company-name,
.project-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #1e293b;
}

.date-range {
	font-size: 22rpx;
	color: #64748b;
}

.item-detail {
	margin-bottom: 8rpx;
}

.major,
.degree,
.position,
.role {
	font-size: 24rpx;
	color: #475569;
	margin-right: 16rpx;
}

.item-description {
	font-size: 24rpx;
	color: #475569;
	margin-bottom: 8rpx;
	line-height: 1.6;
}

.item-achievements,
.item-highlights {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.achievement-item,
.highlight-item {
	font-size: 24rpx;
	color: #475569;
	line-height: 1.6;
}

/* 技术栈 */
.tech-stack {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8rpx;
	margin-top: 8rpx;
}

.tech-label {
	font-size: 22rpx;
	color: #64748b;
}

.tech-tag {
	font-size: 20rpx;
	color: #2563eb;
	background: #eff6ff;
	padding: 4rpx 12rpx;
	border-radius: 4rpx;
}

/* 技能 */
.skill-category {
	margin-bottom: 8rpx;
}

.category-name {
	font-size: 24rpx;
	color: #1e293b;
	font-weight: 500;
}

.skill-items {
	font-size: 24rpx;
	color: #475569;
}

/* 证书 */
.certificate-item {
	display: flex;
	justify-content: space-between;
	margin-bottom: 8rpx;
}

.cert-name {
	font-size: 24rpx;
	color: #475569;
}

.cert-date {
	font-size: 22rpx;
	color: #94a3b8;
}

/* 打印样式 */
@media print {
	.simple-template {
		font-size: 11pt;
	}

	.name {
		font-size: 20pt;
	}

	.job-title {
		font-size: 12pt;
	}

	.section-title {
		font-size: 12pt;
	}

	.school-name,
	.company-name,
	.project-name {
		font-size: 11pt;
	}

	.item-description,
	.achievement-item,
	.highlight-item {
		font-size: 10pt;
	}
}
</style>
