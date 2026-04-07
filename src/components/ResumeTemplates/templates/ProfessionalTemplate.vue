<template>
	<view class="professional-template">
		<!-- 头部信息 -->
		<view class="header-section">
			<view class="header-left">
				<text class="name">{{ resume.basic?.name || '姓名' }}</text>
				<text class="job-title">{{ resume.basic?.job || '求职岗位' }}</text>
			</view>
			<view class="header-right">
				<view v-if="resume.basic?.phone" class="contact-item">
					<text class="contact-icon">📞</text>
					<text class="contact-text">{{ resume.basic?.phone }}</text>
				</view>
				<view v-if="resume.basic?.email" class="contact-item">
					<text class="contact-icon">📧</text>
					<text class="contact-text">{{ resume.basic?.email }}</text>
				</view>
				<view v-if="resume.basic?.location" class="contact-item">
					<text class="contact-icon">📍</text>
					<text class="contact-text">{{ resume.basic?.location }}</text>
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
						<view class="title-area">
							<text class="school-name">{{ edu.school }}</text>
							<text v-if="edu.major" class="major">{{ edu.major }}</text>
						</view>
						<view class="date-area">
							<text class="date-range">{{ edu.startDate }} - {{ edu.endDate || '至今' }}</text>
							<text v-if="edu.degree" class="degree">{{ edu.degree }}</text>
						</view>
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
						<view class="title-area">
							<text class="company-name">{{ exp.company }}</text>
							<text v-if="exp.position" class="position">{{ exp.position }}</text>
						</view>
						<view class="date-area">
							<text class="date-range">{{ exp.startDate }} - {{ exp.endDate || '至今' }}</text>
						</view>
					</view>
					<view v-if="exp.description" class="item-description">
						<text>{{ exp.description }}</text>
					</view>
					<view v-if="exp.achievements?.length" class="item-achievements">
						<text v-for="(a, i) in exp.achievements" :key="i" class="achievement-item">▸ {{ a }}</text>
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
						<view class="title-area">
							<text class="project-name">{{ project.name }}</text>
							<text v-if="project.role" class="role">{{ project.role }}</text>
						</view>
						<view class="date-area">
							<text class="date-range">{{ project.startDate }} - {{ project.endDate || '至今' }}</text>
						</view>
					</view>
					<view v-if="project.description" class="item-description">
						<text>{{ project.description }}</text>
					</view>
					<view v-if="project.techStack?.length" class="tech-stack">
						<text v-for="(tech, i) in project.techStack" :key="i" class="tech-tag">{{ tech }}</text>
					</view>
					<view v-if="project.highlights?.length" class="item-highlights">
						<text v-for="(h, i) in project.highlights" :key="i" class="highlight-item">▸ {{ h }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 技能 -->
		<view v-if="resume.skills?.length" class="resume-section">
			<view class="section-header">
				<text class="section-title">专业技能</text>
			</view>
			<view class="section-content skills-content">
				<view v-for="(skill, index) in resume.skills" :key="index" class="skill-category">
					<text v-if="skill.category" class="category-name">{{ skill.category }}</text>
					<view class="skill-items">
						<text v-for="(item, i) in skill.items" :key="i" class="skill-item">{{ item }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 证书 -->
		<view v-if="resume.certificates?.length" class="resume-section">
			<view class="section-header">
				<text class="section-title">证书荣誉</text>
			</view>
			<view class="section-content">
				<view class="certificates-grid">
					<view v-for="(cert, index) in resume.certificates" :key="index" class="certificate-item">
						<text class="cert-icon">🏆</text>
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
.professional-template {
	font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
	color: #0f172a;
	line-height: 1.6;
}

/* 头部 */
.header-section {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 32rpx;
	background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
	border-radius: 8rpx;
	margin-bottom: 32rpx;
}

.header-left {
	.name {
		font-size: 44rpx;
		font-weight: 700;
		color: #ffffff;
		display: block;
		margin-bottom: 8rpx;
	}

	.job-title {
		font-size: 28rpx;
		color: #94a3b8;
	}
}

.header-right {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.contact-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.contact-icon {
	font-size: 20rpx;
}

.contact-text {
	font-size: 22rpx;
	color: #e2e8f0;
}

/* 模块 */
.resume-section {
	margin-bottom: 32rpx;
	page-break-inside: avoid;
}

.section-header {
	margin-bottom: 16rpx;
	border-left: 6rpx solid #1e3a5f;
	padding-left: 16rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #1e3a5f;
	text-transform: uppercase;
	letter-spacing: 2rpx;
}

.section-content {
	padding-left: 24rpx;
}

/* 教育经历 */
.education-item,
.experience-item,
.project-item {
	margin-bottom: 24rpx;
	padding-bottom: 24rpx;
	border-bottom: 1rpx dashed #e2e8f0;
	page-break-inside: avoid;

	&:last-child {
		border-bottom: none;
	}
}

.item-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 12rpx;
}

.title-area {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.school-name,
.company-name,
.project-name {
	font-size: 28rpx;
	font-weight: 600;
	color: #0f172a;
}

.major,
.position,
.role {
	font-size: 24rpx;
	color: #475569;
}

.date-area {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 4rpx;
}

.date-range {
	font-size: 22rpx;
	color: #64748b;
}

.degree {
	font-size: 22rpx;
	color: #1e3a5f;
	font-weight: 500;
}

.item-description {
	font-size: 24rpx;
	color: #475569;
	margin-bottom: 12rpx;
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
	color: #334155;
	line-height: 1.6;
}

/* 技术栈 */
.tech-stack {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
	margin-top: 12rpx;
}

.tech-tag {
	font-size: 20rpx;
	color: #1e3a5f;
	background: #f1f5f9;
	padding: 6rpx 16rpx;
	border-radius: 4rpx;
	border: 1rpx solid #e2e8f0;
}

/* 技能 */
.skills-content {
	display: flex;
	flex-wrap: wrap;
	gap: 24rpx;
}

.skill-category {
	flex: 1;
	min-width: 200rpx;
}

.category-name {
	font-size: 24rpx;
	font-weight: 600;
	color: #1e3a5f;
	display: block;
	margin-bottom: 8rpx;
}

.skill-items {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.skill-item {
	font-size: 22rpx;
	color: #475569;
	background: #f8fafc;
	padding: 6rpx 12rpx;
	border-radius: 4rpx;
}

/* 证书 */
.certificates-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 16rpx;
}

.certificate-item {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.cert-icon {
	font-size: 24rpx;
}

.cert-name {
	font-size: 24rpx;
	color: #475569;
}

/* 打印样式 */
@media print {
	.header-section {
		background: #1e3a5f !important;
		-webkit-print-color-adjust: exact;
		print-color-adjust: exact;
	}

	.name {
		font-size: 18pt;
	}

	.job-title {
		font-size: 11pt;
	}

	.section-title {
		font-size: 11pt;
	}
}
</style>
