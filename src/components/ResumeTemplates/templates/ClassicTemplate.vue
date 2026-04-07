<template>
	<view class="classic-template">
		<!-- 头部信息 -->
		<view class="header-section">
			<text class="name">{{ resume.basic?.name || '姓名' }}</text>
			<view class="divider"></view>
			<view class="contact-row">
				<text v-if="resume.basic?.phone" class="contact-item">{{ resume.basic?.phone }}</text>
				<text v-if="resume.basic?.email" class="contact-separator">|</text>
				<text v-if="resume.basic?.email" class="contact-item">{{ resume.basic?.email }}</text>
				<text v-if="resume.basic?.location" class="contact-separator">|</text>
				<text v-if="resume.basic?.location" class="contact-item">{{ resume.basic?.location }}</text>
			</view>
		</view>

		<!-- 个人简介 -->
		<view v-if="resume.summary" class="resume-section">
			<text class="section-title">个人简介</text>
			<view class="section-underline"></view>
			<text class="section-content">{{ resume.summary }}</text>
		</view>

		<!-- 教育背景 -->
		<view v-if="resume.education?.length" class="resume-section">
			<text class="section-title">教育背景</text>
			<view class="section-underline"></view>
			<view v-for="(edu, index) in resume.education" :key="index" class="item-block">
				<view class="item-row">
					<text class="item-title">{{ edu.school }}</text>
					<text class="item-date">{{ edu.startDate }} - {{ edu.endDate || '至今' }}</text>
				</view>
				<view class="item-sub">
					<text v-if="edu.major">{{ edu.major }}</text>
					<text v-if="edu.degree" class="separator">|</text>
					<text v-if="edu.degree">{{ edu.degree }}</text>
				</view>
				<view v-if="edu.highlights?.length" class="item-list">
					<text v-for="(h, i) in edu.highlights" :key="i" class="list-item">• {{ h }}</text>
				</view>
			</view>
		</view>

		<!-- 工作经历 -->
		<view v-if="resume.experience?.length" class="resume-section">
			<text class="section-title">工作经历</text>
			<view class="section-underline"></view>
			<view v-for="(exp, index) in resume.experience" :key="index" class="item-block">
				<view class="item-row">
					<text class="item-title">{{ exp.company }}</text>
					<text class="item-date">{{ exp.startDate }} - {{ exp.endDate || '至今' }}</text>
				</view>
				<text v-if="exp.position" class="item-sub">{{ exp.position }}</text>
				<view v-if="exp.description" class="item-desc">
					<text>{{ exp.description }}</text>
				</view>
				<view v-if="exp.achievements?.length" class="item-list">
					<text v-for="(a, i) in exp.achievements" :key="i" class="list-item">• {{ a }}</text>
				</view>
			</view>
		</view>

		<!-- 项目经验 -->
		<view v-if="resume.projects?.length" class="resume-section">
			<text class="section-title">项目经验</text>
			<view class="section-underline"></view>
			<view v-for="(project, index) in resume.projects" :key="index" class="item-block">
				<view class="item-row">
					<text class="item-title">{{ project.name }}</text>
					<text class="item-date">{{ project.startDate }} - {{ project.endDate || '至今' }}</text>
				</view>
				<text v-if="project.role" class="item-sub">{{ project.role }}</text>
				<view v-if="project.techStack?.length" class="tech-row">
					<text class="tech-label">技术栈：</text>
					<text class="tech-text">{{ project.techStack.join('、') }}</text>
				</view>
				<view v-if="project.highlights?.length" class="item-list">
					<text v-for="(h, i) in project.highlights" :key="i" class="list-item">• {{ h }}</text>
				</view>
			</view>
		</view>

		<!-- 技能 -->
		<view v-if="resume.skills?.length" class="resume-section">
			<text class="section-title">专业技能</text>
			<view class="section-underline"></view>
			<view v-for="(skill, index) in resume.skills" :key="index" class="skill-row">
				<text v-if="skill.category" class="skill-category">{{ skill.category }}：</text>
				<text class="skill-text">{{ skill.items?.join('、') }}</text>
			</view>
		</view>

		<!-- 证书 -->
		<view v-if="resume.certificates?.length" class="resume-section">
			<text class="section-title">证书荣誉</text>
			<view class="section-underline"></view>
			<view class="cert-row">
				<text v-for="(cert, index) in resume.certificates" :key="index" class="cert-item">
					{{ cert.name }}<text v-if="index < resume.certificates.length - 1">、</text>
				</text>
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
.classic-template {
	font-family: 'SimSun', 'STSong', serif;
	color: #111827;
	line-height: 1.8;
}

/* 头部 */
.header-section {
	text-align: center;
	padding-bottom: 24rpx;
	border-bottom: 3rpx solid #000000;
	margin-bottom: 32rpx;
}

.name {
	font-size: 48rpx;
	font-weight: 700;
	color: #000000;
	display: block;
	margin-bottom: 16rpx;
	letter-spacing: 8rpx;
}

.divider {
	width: 120rpx;
	height: 3rpx;
	background: #000000;
	margin: 0 auto 16rpx;
}

.contact-row {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-wrap: wrap;
}

.contact-item {
	font-size: 24rpx;
	color: #374151;
}

.contact-separator {
	font-size: 24rpx;
	color: #9ca3af;
	margin: 0 16rpx;
}

/* 模块 */
.resume-section {
	margin-bottom: 32rpx;
	page-break-inside: avoid;
}

.section-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #000000;
	display: block;
	margin-bottom: 8rpx;
}

.section-underline {
	width: 100%;
	height: 2rpx;
	background: #000000;
	margin-bottom: 16rpx;
}

.section-content {
	font-size: 24rpx;
	color: #374151;
	text-indent: 2em;
	line-height: 1.8;
}

/* 项目块 */
.item-block {
	margin-bottom: 20rpx;
	page-break-inside: avoid;
}

.item-row {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 8rpx;
}

.item-title {
	font-size: 26rpx;
	font-weight: 600;
	color: #111827;
}

.item-date {
	font-size: 22rpx;
	color: #6b7280;
}

.item-sub {
	font-size: 24rpx;
	color: #374151;
	margin-bottom: 8rpx;
}

.separator {
	margin: 0 8rpx;
	color: #9ca3af;
}

.item-desc {
	font-size: 24rpx;
	color: #374151;
	margin-bottom: 8rpx;
	line-height: 1.6;
}

.item-list {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.list-item {
	font-size: 24rpx;
	color: #374151;
	line-height: 1.6;
}

/* 技术栈 */
.tech-row {
	display: flex;
	margin-bottom: 8rpx;
}

.tech-label {
	font-size: 24rpx;
	color: #374151;
	font-weight: 500;
}

.tech-text {
	font-size: 24rpx;
	color: #374151;
}

/* 技能 */
.skill-row {
	display: flex;
	margin-bottom: 8rpx;
}

.skill-category {
	font-size: 24rpx;
	color: #111827;
	font-weight: 600;
}

.skill-text {
	font-size: 24rpx;
	color: #374151;
}

/* 证书 */
.cert-row {
	font-size: 24rpx;
	color: #374151;
	line-height: 1.6;
}

.cert-item {
	font-size: 24rpx;
}

/* 打印样式 */
@media print {
	.classic-template {
		font-family: 'SimSun', serif;
	}

	.name {
		font-size: 22pt;
		letter-spacing: 4pt;
	}

	.section-title {
		font-size: 12pt;
	}

	.item-title {
		font-size: 11pt;
	}

	.section-content,
	.list-item,
	.item-desc,
	.skill-text,
	.cert-item {
		font-size: 10.5pt;
	}
}
</style>
