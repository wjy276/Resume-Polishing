<template>
	<view class="template-choose-page">
		<Sidebar />
		<view class="main-content">
			<view class="header">
				<text class="title">选择简历模板</text>
				<text class="desc">参考热门简历样式，支持预览、切换、再编辑和 PDF 导出</text>
			</view>

			<view class="template-grid">
				<view
					v-for="item in templateList"
					:key="item.layout"
					class="template-card"
					:class="{ active: selectedTemplate === item.layout }"
				>
					<view class="template-preview" @click="openPreview(item.layout)">
						<ResumePreview :resume="previewResumeData" :template="item.layout" />
					</view>
					<view class="template-meta">
						<text class="name">{{ item.name }}</text>
						<text class="tag">{{ item.layout }}</text>
						<text class="intro">{{ item.description }}</text>
					</view>
					<view class="card-actions">
						<view class="action-btn preview-btn" @click="openPreview(item.layout)">
							<text class="btn-text">预览</text>
						</view>
						<view class="action-btn use-btn" @click="useTemplate(item.layout)">
							<text class="btn-text">使用此模板</text>
						</view>
					</view>
				</view>
			</view>

			<view class="action-bar">
				<view class="action-btn back-btn" @click="goBack">
					<text class="btn-text">返回</text>
				</view>
				<view class="action-btn next-btn" @click="confirmTemplate">
					<text class="btn-text">使用该模板继续</text>
				</view>
			</view>
		</view>

		<view v-if="showPreviewModal" class="preview-modal" @click.self="closePreview">
			<view class="preview-modal-card">
				<view class="preview-modal-header">
					<text class="preview-modal-title">模板预览</text>
					<view class="action-btn back-btn" @click="closePreview">
						<text class="btn-text">关闭</text>
					</view>
				</view>
				<view class="preview-modal-body">
					<ResumePreview :resume="previewResumeData" :template="previewTemplate" />
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { ResumePreview, DEFAULT_TEMPLATES, getDefaultTemplateId } from '@/components/ResumeTemplates'

const selectedTemplate = ref(getDefaultTemplateId())
const source = ref('create')
const showPreviewModal = ref(false)
const previewTemplate = ref(getDefaultTemplateId())
const templateList = DEFAULT_TEMPLATES

const previewResumeData = {
	basic: {
		name: '宋哈娜',
		job: '高级前端工程师',
		phone: '13001138000',
		email: 'zhangsan@example.com',
		location: '北京市朝阳区'
	},
	summary: '5年前端开发经验，擅长 React / Vue 体系，注重性能优化与工程化落地。',
	education: [
		{
			school: '北京邮电大学',
			major: '软件工程',
			degree: '本科',
			startDate: '2019/09',
			endDate: '2023/06',
			highlights: ['连续两年校级奖学金']
		}
	],
	experience: [
		{
			company: '某互联网科技公司',
			position: '高级前端工程师',
			startDate: '2023/07',
			endDate: '至今',
			description: '负责核心业务平台前端架构与性能优化',
			achievements: ['首屏加载提升 40%', '组件库覆盖 60+ 页面']
		}
	],
	projects: [
		{
			name: '智能投递平台',
			role: '前端负责人',
			startDate: '2024/01',
			endDate: '2024/12',
			description: '搭建模块化页面系统与埋点体系',
			techStack: ['Vue3', 'TypeScript', 'Pinia'],
			highlights: ['投递转化率提升 22%']
		}
	],
	skills: [
		{ category: '前端框架', items: ['React', 'Vue', 'Next.js'] },
		{ category: '工程化', items: ['Vite', 'ESLint', 'CI/CD'] }
	],
	certificates: [{ name: 'PMP' }]
}

onLoad((query) => {
	source.value = query?.source || 'create'
	if (query?.templateId) {
		selectedTemplate.value = query.templateId
	} else if (query?.template) {
		selectedTemplate.value = query.template
	}
})

const openPreview = (layout) => {
	previewTemplate.value = layout
	showPreviewModal.value = true
}

const closePreview = () => {
	showPreviewModal.value = false
}

const useTemplate = (layout) => {
	selectedTemplate.value = layout
	confirmTemplate()
}

const confirmTemplate = () => {
	uni.setStorageSync('selectedResumeTemplate', selectedTemplate.value)

	uni.navigateTo({
		url: `/pages/Resume/ResumeTemplate?templateId=${encodeURIComponent(selectedTemplate.value)}&source=${source.value}`
	})
}

const goBack = () => {
	uni.navigateBack()
}
</script>

<style scoped lang="scss">
.template-choose-page {
	display: flex;
	height: 100vh;
	background: #f8fafc;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 56rpx;
	overflow-y: auto;
}

.header {
	margin-bottom: 40rpx;
}

.title {
	display: block;
	font-size: 52rpx;
	font-weight: 700;
	color: #111827;
	margin-bottom: 12rpx;
}

.desc {
	font-size: 28rpx;
	color: #6b7280;
}

.template-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 28rpx;
}

.template-card {
	background: #ffffff;
	border: 2rpx solid #e5e7eb;
	border-radius: 20rpx;
	padding: 24rpx;
	cursor: pointer;
	transition: all 0.25s ease;

	&.active {
		border-color: #3b82f6;
		box-shadow: 0 10rpx 28rpx rgba(59, 130, 246, 0.18);
		transform: translateY(-2rpx);
	}
}

.template-preview {
	height: 420rpx;
	border-radius: 14rpx;
	overflow: hidden;
	background: #ffffff;
	border: 1rpx solid #e5e7eb;
	margin-bottom: 18rpx;
}

.template-preview :deep(.resume-preview-wrapper) {
	border-radius: 0;
	box-shadow: none;
	transform: scale(0.52);
	transform-origin: top left;
	width: 192%;
	height: 192%;
}

.template-preview :deep(.resume-content) {
	padding: 20rpx;
	min-height: auto;
}

.name {
	display: block;
	font-size: 32rpx;
	font-weight: 600;
	color: #111827;
	margin-bottom: 8rpx;
}

.tag {
	display: inline-block;
	font-size: 22rpx;
	color: #2563eb;
	background: #eff6ff;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
	margin-bottom: 10rpx;
}

.intro {
	display: block;
	font-size: 25rpx;
	color: #6b7280;
	line-height: 1.6;
}

.card-actions {
	display: flex;
	gap: 12rpx;
	margin-top: 14rpx;
}

.card-actions .action-btn {
	flex: 1;
	padding: 12rpx 0;
	border-radius: 999px;
	text-align: center;
}

.card-actions .preview-btn {
	background: #f3f4f6;
	border: 1rpx solid #e5e7eb;
}

.card-actions .use-btn {
	background: #111827;
}

.card-actions .preview-btn .btn-text {
	color: #4b5563;
	font-size: 24rpx;
}

.card-actions .use-btn .btn-text {
	color: #ffffff;
	font-size: 24rpx;
}

.action-bar {
	margin-top: 36rpx;
	display: flex;
	justify-content: flex-end;
	gap: 20rpx;
}

.action-btn {
	padding: 18rpx 38rpx;
	border-radius: 12rpx;
	cursor: pointer;
}

.back-btn {
	background: #ffffff;
	border: 2rpx solid #d1d5db;
}

.next-btn {
	background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #374151;
}

.next-btn .btn-text {
	color: #ffffff;
}

.preview-modal {
	position: fixed;
	inset: 0;
	background: rgba(15, 23, 42, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.preview-modal-card {
	width: 88%;
	max-width: 1100px;
	max-height: 88vh;
	background: #ffffff;
	border-radius: 18rpx;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.preview-modal-header {
	padding: 18rpx 24rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-bottom: 1rpx solid #e5e7eb;
}

.preview-modal-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #111827;
}

.preview-modal-body {
	padding: 24rpx;
	overflow-y: auto;
}

@media (max-width: 1200px) {
	.template-grid {
		grid-template-columns: 1fr;
	}
}
</style>