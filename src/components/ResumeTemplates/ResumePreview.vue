<template>
	<view class="resume-preview-wrapper" :class="templateClass">
		<!-- 简历内容区域 - 用于屏幕显示和打印 -->
		<view id="resume-content" class="resume-content">
			<component :is="activeTemplateComponent" :resume="normalizedResume" />
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { getTemplateComponent } from './registry'
import { normalizeResumeForTemplate } from '@/utils/resume/dataTransform'

const props = defineProps({
	resume: {
		type: Object,
		required: true
	},
	template: {
		type: String,
		default: 'simple'
	}
})

const templateClass = computed(() => `template-${props.template}`)
const activeTemplateComponent = computed(() => getTemplateComponent(props.template))
const normalizedResume = computed(() => normalizeResumeForTemplate(props.resume))
</script>

<style scoped lang="scss">
.resume-preview-wrapper {
	background: #ffffff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.resume-content {
	padding: 40rpx;
	min-height: 600rpx;
}

/* ========== 打印样式 ========== */
@media print {
	/* 隐藏不需要打印的元素 */
	.no-print,
	.sidebar,
	.action-buttons,
	.template-selector,
	.footer-actions {
		display: none !important;
	}

	/* 设置纸张 */
	@page {
		size: A4;
		margin: 1.5cm;
	}

	/* 全局打印样式 */
	body {
		background: #fff !important;
	}

	.resume-preview-wrapper {
		box-shadow: none;
		border-radius: 0;
	}

	.resume-content {
		padding: 0;
		width: 100%;
		max-width: none;
	}

	/* 强制打印背景色 */
	* {
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
	}

	/* 避免内容被分页截断 */
	.resume-section,
	.experience-item,
	.project-item,
	.education-item {
		page-break-inside: avoid;
	}

	/* 模块标题前避免分页 */
	.section-title {
		page-break-after: avoid;
	}
}
</style>
