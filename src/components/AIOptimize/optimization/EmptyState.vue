<template>
	<div class="empty-state">
		<svg class="empty-icon" viewBox="0 0 48 48" fill="none" aria-hidden="true">
			<circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2.5" opacity="0.25"/>
			<path d="M15 24l6 6 12-13" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		<p class="empty-title">{{ title }}</p>
		<p class="empty-desc">{{ desc }}</p>
		<button v-if="showAction" class="btn-reanalyze" @click="$emit('reanalyze')">
			<svg viewBox="0 0 16 16" fill="none"><path d="M13.5 8a5.5 5.5 0 11-1.6-3.9M13.5 2v2.5H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
			重新分析
		</button>
	</div>
</template>

<script setup>
defineProps({
	title: { type: String, default: '暂无分析结果' },
	desc: { type: String, default: '点击「AI 优化」将自动解析简历并生成匹配分析。' },
	showAction: { type: Boolean, default: true },
})

defineEmits(['reanalyze'])
</script>

<style scoped>
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 56px 24px;
	text-align: center;
	background: var(--bg-card, #ffffff);
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 16px;
}

.empty-icon {
	width: 48px;
	height: 48px;
	color: var(--color-success, #10b981);
	margin-bottom: 14px;
}

.empty-title {
	margin: 0;
	font-size: 15px;
	font-weight: 600;
	color: var(--text-primary, #111827);
}

.empty-desc {
	margin: 8px 0 0;
	font-size: 13px;
	line-height: 1.6;
	color: var(--text-secondary, #6b7280);
	max-width: 260px;
}

.btn-reanalyze {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 36px;
	padding: 0 16px;
	margin-top: 18px;
	background: #ffffff;
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	color: var(--text-secondary, #6b7280);
	cursor: pointer;
	transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reanalyze svg {
	width: 14px;
	height: 14px;
}

.btn-reanalyze:hover {
	background: #f9fafb;
	border-color: #d1d5db;
	color: var(--text-primary, #111827);
}

.btn-reanalyze:hover svg {
	transform: rotate(180deg);
	transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
