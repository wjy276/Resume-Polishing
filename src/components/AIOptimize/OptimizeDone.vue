<template>
	<div class="optimize-done">
		<div class="done-icon">✓</div>
		<h3>优化完成</h3>
		<p>你的简历已优化，可以导出或继续编辑</p>

		<div class="stats" v-if="optimizedCount > 0">
			<div class="stat-item">
				<span class="stat-value">{{ optimizedCount }}</span>
				<span class="stat-label">模块已优化</span>
			</div>
		</div>

		<div class="actions">
			<button class="action-btn primary" @click="handleBackEditor">
				返回编辑器
			</button>
			<button class="action-btn secondary" @click="handleRestart">
				重新开始
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'

const aiStore = useAIOptimizeStore()

const optimizedCount = computed(() => {
	return Object.keys(aiStore.moduleResults).length
})

function handleBackEditor() {
	aiStore.closePanel()
}

async function handleRestart() {
	await aiStore.resetSession()
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$success: #10b981;

.optimize-done {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: 40px 24px;
	text-align: center;
}

.done-icon {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: linear-gradient(135deg, #d1fae5, #a7f3d0);
	color: $success;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 40px;
	font-weight: 700;
	margin-bottom: 20px;
}

h3 {
	font-size: 20px;
	font-weight: 600;
	color: #111827;
	margin: 0 0 8px;
}

p {
	font-size: 14px;
	color: #6b7280;
	margin: 0 0 24px;
}

.stats {
	display: flex;
	gap: 24px;
	margin-bottom: 32px;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.stat-value {
	font-size: 28px;
	font-weight: 700;
	color: $primary;
}

.stat-label {
	font-size: 12px;
	color: #6b7280;
}

.actions {
	display: flex;
	flex-direction: column;
	gap: 12px;
	width: 100%;
	max-width: 240px;
}

.action-btn {
	padding: 14px 24px;
	border: none;
	border-radius: 10px;
	font-size: 15px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;

	&.primary {
		background: linear-gradient(135deg, $primary, #3b82f6);
		color: #fff;

		&:hover { opacity: 0.9; }
	}

	&.secondary {
		background: #f3f4f6;
		color: #374151;

		&:hover { background: #e5e7eb; }
	}
}
</style>
