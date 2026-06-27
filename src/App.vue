<template>
	<view class="app-container">
		<slot />
		<TokenExpiredPopup
			:visible="showExpiredPopup"
			@update:visible="showExpiredPopup = $event"
			@confirm="showExpiredPopup = false"
			@cancel="showExpiredPopup = false"
		/>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLaunch } from '@dcloudio/uni-app'
import TokenExpiredPopup from '@/components/TokenExpiredPopup/TokenExpiredPopup.vue'

const showExpiredPopup = ref(false)

onLaunch(() => {
	uni.$on('token-expired', () => {
		showExpiredPopup.value = true
	})
})

console.log('App.vue 已加载')
</script>

<style lang="scss">
/* 全局样式 */
page {
	height: 100%;
	margin: 0;
	padding: 0;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
	height: 100vh;
	width: 100vw;
	overflow: hidden;
}

/* 滚动条美化 */
::-webkit-scrollbar {
	width: 6px;
}

::-webkit-scrollbar-track {
	background: transparent;
}

::-webkit-scrollbar-thumb {
	background: #cbd5e1;
	border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
	background: #94a3b8;
}

/* ========== 全局打印样式 ========== */
@media print {
	/* 隐藏侧边栏 */
	.sidebar,
	.sidebar-container,
	[class*="Sidebar"],
	aside {
		display: none !important;
	}

	/* 隐藏页面标题区域 */
	.title-section,
	.progress-section,
	.file-info,
	.loading-container,
	.no-data-container {
		display: none !important;
	}

	/* 隐藏模块优化卡片区域 */
	.modules-section,
	.modules-grid,
	.module-card {
		display: none !important;
	}

	/* 隐藏模板选择器 */
	.template-selector,
	.template-grid {
		display: none !important;
	}

	/* 隐藏底部操作区 */
	.footer-actions,
	.footer-left,
	.footer-right {
		display: none !important;
	}

	/* 隐藏预览区域的操作按钮 */
	.preview-header,
	.preview-actions {
		display: none !important;
	}

	/* 隐藏所有按钮 */
	button,
	.action-btn,
	.optimize-btn,
	.export-btn,
	.save-btn,
	.re-upload-btn,
	.ai-optimize,
	.optimize-all-btn {
		display: none !important;
	}

	/* 隐藏优化进度 */
	.progress-bar,
	.progress-fill,
	.progress-value,
	.progress-label {
		display: none !important;
	}

	/* 隐藏状态信息 */
	.status-info,
	.status-text {
		display: none !important;
	}

	/* 隐藏预览弹窗背景 */
	.preview-modal {
		position: static !important;
		background: none !important;
	}

	/* 隐藏弹窗头部和按钮 */
	.modal-header,
	.modal-actions,
	.modal-btn {
		display: none !important;
	}

	/* ========== 简历内容显示样式 ========== */

	/* 重置主内容区布局 */
	.main-content {
		margin-left: 0 !important;
		padding: 0 !important;
		width: 100% !important;
		max-width: none !important;
		background: #fff !important;
	}

	/* 重置内容包装器 */
	.content-wrapper {
		display: block !important;
		flex-direction: column !important;
		gap: 0 !important;
		padding: 0 !important;
	}

	/* 预览区域全宽显示 */
	.preview-section {
		width: 100% !important;
		flex: none !important;
	}

	.preview-container {
		box-shadow: none !important;
		border-radius: 0 !important;
	}

	/* 简历内容区域 */
	#resume-content,
	.resume-content {
		padding: 0 !important;
		width: 100% !important;
	}

	/* 简历模板样式重置 */
	.simple-template,
	.professional-template,
	.creative-template,
	.classic-template {
		padding: 0 !important;
		background: #fff !important;
		box-shadow: none !important;
		border-radius: 0 !important;
	}

	/* ========== 纸张设置 ========== */
	@page {
		size: A4;
		margin: 1.5cm;
	}

	/* ========== 字体和颜色 ========== */
	body {
		background: #fff !important;
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
	}

	/* 强制打印背景色 */
	* {
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
		color-adjust: exact !important;
	}

	/* ========== 分页控制 ========== */
	.resume-section,
	.education-item,
	.experience-item,
	.project-item,
	.skill-category,
	.certificate-item {
		page-break-inside: avoid;
	}

	.section-title,
	.section-header {
		page-break-after: avoid;
	}

	/* ========== 字体大小调整（打印使用pt单位） ========== */
	.name {
		font-size: 20pt !important;
	}

	.job-title {
		font-size: 12pt !important;
	}

	.section-title {
		font-size: 12pt !important;
	}

	.school-name,
	.company-name,
	.project-name {
		font-size: 11pt !important;
	}

	.item-description,
	.achievement-item,
	.highlight-item,
	.summary-text,
	.skill-text,
	.contact-item {
		font-size: 10pt !important;
	}

	.date-range,
	.date-badge,
	.date-text {
		font-size: 9pt !important;
	}

	/* ========== 移除阴影和圆角 ========== */
	* {
		box-shadow: none !important;
	}

	.module-card,
	.preview-container,
	.template-card {
		border-radius: 0 !important;
		box-shadow: none !important;
	}
}

/* ========== 打印预览模式 ========== */
body.printing {
	background: #f0f0f0 !important;
}

body.printing .sidebar,
body.printing .title-section,
body.printing .modules-section,
body.printing .footer-actions,
body.printing .template-selector {
	display: none !important;
}

body.printing .main-content {
	margin-left: 0 !important;
}

body.printing .preview-section {
	width: 100% !important;
	max-width: 800px !important;
	margin: 20px auto !important;
}
</style>
