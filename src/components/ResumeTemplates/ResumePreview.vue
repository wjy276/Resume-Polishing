<template>
	<view class="resume-preview-wrapper" :class="templateClass">
		<!-- 简历内容区域 - 用于屏幕显示和打印 -->
		<view id="resume-content" class="resume-content">
			<!-- 简约模板 -->
			<template v-if="template === 'simple'">
				<SimpleTemplate :resume="resume" />
			</template>

			<!-- 专业模板 -->
			<template v-else-if="template === 'professional'">
				<ProfessionalTemplate :resume="resume" />
			</template>

			<!-- 创意模板 -->
			<template v-else-if="template === 'creative'">
				<CreativeTemplate :resume="resume" />
			</template>

			<!-- 经典模板 -->
			<template v-else>
				<ClassicTemplate :resume="resume" />
			</template>
		</view>
	</view>
</template>

<script setup>
import { computed, defineProps } from 'vue'
import SimpleTemplate from './templates/SimpleTemplate.vue'
import ProfessionalTemplate from './templates/ProfessionalTemplate.vue'
import CreativeTemplate from './templates/CreativeTemplate.vue'
import ClassicTemplate from './templates/ClassicTemplate.vue'

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
