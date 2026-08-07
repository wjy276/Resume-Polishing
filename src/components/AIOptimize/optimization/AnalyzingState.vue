<template>
	<div class="analyzing-state" role="status" aria-live="polite">
		<div class="spinner-ring" />
		<p class="analyzing-title">AI 正在分析您的简历...</p>
		<p class="analyzing-text">{{ text || '正在对比目标岗位关键词...' }}</p>
		<div class="analyzing-dots" aria-hidden="true">
			<i />
			<i />
			<i />
		</div>
	</div>
</template>

<script setup>
defineProps({
	text: { type: String, default: '' },
})
</script>

<style scoped>
.analyzing-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 56px 24px;
	text-align: center;
	background: var(--bg-card, #ffffff);
	border-radius: 16px;
	border: 1px solid var(--border-color, #e5e7eb);
}

.spinner-ring {
	width: 40px;
	height: 40px;
	border: 3px solid var(--border-color, #e5e7eb);
	border-top-color: var(--color-accent-primary, #6366f1);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.analyzing-title {
	margin: 16px 0 0;
	font-size: 15px;
	font-weight: 600;
	color: var(--text-primary, #111827);
}

.analyzing-text {
	margin: 8px 0 0;
	font-size: 13px;
	color: var(--text-secondary, #6b7280);
	transition: opacity 200ms ease;
}

.analyzing-dots {
	display: flex;
	gap: 5px;
	margin-top: 16px;
}

.analyzing-dots i {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--color-accent-primary, #6366f1);
	animation: dotPulse 1.2s ease-in-out infinite;
}

.analyzing-dots i:nth-child(2) { animation-delay: 0.15s; }
.analyzing-dots i:nth-child(3) { animation-delay: 0.3s; }

@keyframes dotPulse {
	0%, 100% { opacity: 0.25; transform: translateY(0); }
	50% { opacity: 1; transform: translateY(-3px); }
}
</style>
