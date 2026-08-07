<template>
	<div class="diff-comparison">
		<div class="diff-column original">
			<div class="diff-label original">当前版本</div>
			<div class="diff-text">{{ originalText || '（无原文）' }}</div>
		</div>
		<div class="diff-column suggested">
			<div class="diff-label suggested">AI 建议</div>
			<div class="diff-text">{{ suggestedText || '（无建议文本）' }}</div>
		</div>
	</div>
</template>

<script setup>
defineProps({
	originalText: { type: String, default: '' },
	suggestedText: { type: String, default: '' },
})
</script>

<style scoped>
.diff-comparison {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 10px;
}

@media (max-width: 380px) {
	.diff-comparison {
		grid-template-columns: 1fr;
	}
}

.diff-column {
	padding: 10px;
	border-radius: 8px;
	font-size: 12.5px;
	line-height: 1.6;
	min-width: 0;
}

.diff-column.original {
	background: #fef2f2;
	color: #991b1b;
}

.diff-column.suggested {
	background: #ecfdf5;
	color: #065f46;
}

.diff-label {
	font-size: 11px;
	font-weight: 600;
	margin-bottom: 6px;
	letter-spacing: 0.03em;
}

.diff-label.original { color: #ef4444; }
.diff-label.suggested { color: #10b981; }

.diff-text {
	word-break: break-word;
	white-space: pre-wrap;
}

.diff-column.original .diff-text {
	text-decoration: line-through;
	text-decoration-color: rgba(153, 27, 27, 0.35);
}

.diff-column.suggested .diff-text {
	text-decoration: underline;
	text-decoration-color: rgba(6, 95, 70, 0.35);
	text-underline-offset: 2px;
}
</style>
