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
</script>

<style lang="scss">
/* ========== CSS Variables ========== */
:root {
	--sidebar-width: 240px;
	--primary-color: #1e3a8a;
	--primary-light: #3b82f6;
	--success-color: #10b981;
	--warning-color: #f59e0b;
	--danger-color: #ef4444;
	--text-primary: #111827;
	--text-secondary: #6b7280;
	--text-muted: #9ca3af;
	--bg-page: #f3f4f6;
	--bg-card: #ffffff;
	--border-color: #e5e7eb;
	--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
	--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	--radius-sm: 6px;
	--radius-md: 10px;
	--radius-lg: 16px;
	--transition-fast: 0.15s ease;
	--transition-normal: 0.25s ease;
}

/* ========== Reset & Base ========== */
*, *::before, *::after {
	box-sizing: border-box;
}

page {
	height: 100%;
	margin: 0;
	padding: 0;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	color: var(--text-primary);
	background: var(--bg-page);
}

body {
	margin: 0;
	padding: 0;
	background: var(--bg-page);
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

/* ========== App Container ========== */
.app-container {
	height: 100vh;
	width: 100vw;
	overflow: hidden;
}

/* ========== Page Layout ========== */
.page-layout {
	display: flex;
	height: 100vh;
	width: 100vw;
	overflow: hidden;
}

.page-main {
	flex: 1;
	margin-left: var(--sidebar-width);
	padding: 24px 32px;
	overflow-y: auto;
	overflow-x: hidden;
	min-width: 0;
	background: var(--bg-page);
}

/* ========== Scrollbar ========== */
::-webkit-scrollbar {
	width: 5px;
	height: 5px;
}

::-webkit-scrollbar-track {
	background: transparent;
}

::-webkit-scrollbar-thumb {
	background: #d1d5db;
	border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
	background: #9ca3af;
}

/* ========== Page Transition ========== */
body.page-transitioning .page-main {
	opacity: 0;
	transform: translateY(8px);
	transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-main {
	opacity: 1;
	transform: translateY(0);
	transition: opacity 0.3s ease, transform 0.3s ease;
}

/* ========== Button Reset ========== */
button {
	font-family: inherit;
	cursor: pointer;
	border: none;
	outline: none;
	background: none;
}

button:focus-visible {
	outline: 2px solid var(--primary-light);
	outline-offset: 2px;
}

/* ========== Input Reset ========== */
input, textarea {
	font-family: inherit;
}

input:focus, textarea:focus {
	outline: none;
}

/* ========== Utility Classes ========== */
.text-truncate {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.flex-center {
	display: flex;
	align-items: center;
	justify-content: center;
}

.flex-between {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* ========== Card Styles ========== */
.card {
	background: var(--bg-card);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-sm);
	border: 1px solid var(--border-color);
	transition: box-shadow var(--transition-fast), transform var(--transition-fast);

	&:hover {
		box-shadow: var(--shadow-md);
	}
}

/* ========== Toast Fix ========== */
uni-toast {
	z-index: 99999 !important;
}

/* ========== Modal Overlay ========== */
.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	padding: 20px;
	animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* ========== Loading Spinner ========== */
.spinner {
	width: 20px;
	height: 20px;
	border: 2px solid var(--border-color);
	border-top-color: var(--primary-light);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* ========== Print Styles ========== */
@media print {
	.sidebar, .sidebar-container, [class*="Sidebar"], aside {
		display: none !important;
	}

	.title-section, .progress-section, .file-info, .loading-container, .no-data-container,
	.modules-section, .modules-grid, .module-card, .template-selector, .template-grid,
	.footer-actions, .footer-left, .footer-right, .preview-header, .preview-actions,
	button, .action-btn, .optimize-btn, .export-btn, .save-btn, .re-upload-btn,
	.ai-optimize, .optimize-all-btn, .progress-bar, .progress-fill, .progress-value,
	.progress-label, .status-info, .status-text, .modal-header, .modal-actions, .modal-btn {
		display: none !important;
	}

	.preview-modal {
		position: static !important;
		background: none !important;
	}

	.main-content, .page-main {
		margin-left: 0 !important;
		padding: 0 !important;
		width: 100% !important;
		max-width: none !important;
		background: #fff !important;
	}

	.content-wrapper {
		display: block !important;
		flex-direction: column !important;
		gap: 0 !important;
		padding: 0 !important;
	}

	.preview-section {
		width: 100% !important;
		flex: none !important;
	}

	.preview-container {
		box-shadow: none !important;
		border-radius: 0 !important;
	}

	#resume-content, .resume-content {
		padding: 0 !important;
		width: 100% !important;
	}

	.simple-template, .professional-template, .creative-template, .classic-template {
		padding: 0 !important;
		background: #fff !important;
		box-shadow: none !important;
		border-radius: 0 !important;
	}

	@page {
		size: A4;
		margin: 1.5cm;
	}

	body {
		background: #fff !important;
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
	}

	* {
		-webkit-print-color-adjust: exact !important;
		print-color-adjust: exact !important;
		color-adjust: exact !important;
		box-shadow: none !important;
	}

	.resume-section, .education-item, .experience-item, .project-item,
	.skill-category, .certificate-item {
		page-break-inside: avoid;
	}

	.section-title, .section-header {
		page-break-after: avoid;
	}

	.name { font-size: 20pt !important; }
	.job-title { font-size: 12pt !important; }
	.section-title { font-size: 12pt !important; }
	.school-name, .company-name, .project-name { font-size: 11pt !important; }
	.item-description, .achievement-item, .highlight-item, .summary-text,
	.skill-text, .contact-item { font-size: 10pt !important; }
	.date-range, .date-badge, .date-text { font-size: 9pt !important; }

	.module-card, .preview-container, .template-card {
		border-radius: 0 !important;
		box-shadow: none !important;
	}
}

body.printing {
	background: #f0f0f0 !important;
}

body.printing .sidebar, body.printing .title-section,
body.printing .modules-section, body.printing .footer-actions,
body.printing .template-selector {
	display: none !important;
}

body.printing .main-content, body.printing .page-main {
	margin-left: 0 !important;
}

body.printing .preview-section {
	width: 100% !important;
	max-width: 800px !important;
	margin: 20px auto !important;
}
</style>