<template>
	<section class="score-card">
		<div class="score-ring">
			<svg viewBox="0 0 80 80" aria-hidden="true">
				<circle class="score-ring-bg" cx="40" cy="40" r="34" />
				<circle
					class="score-ring-progress"
					cx="40"
					cy="40"
					r="34"
					:stroke="ringColor"
					:stroke-dasharray="circumference"
					:stroke-dashoffset="dashOffset"
				/>
			</svg>
			<div class="score-value">
				<span class="score-number" :style="{ color: ringColor }">{{ score }}</span>
				<span class="score-label">匹配度</span>
			</div>
		</div>

		<div class="score-info">
			<h3 class="summary-title">分析结论</h3>
			<p class="summary-text">{{ summary || '已根据目标岗位对简历进行诊断，并给出模块级优化建议。' }}</p>
			<div v-if="dimensions.length" class="score-dimensions">
				<span v-for="d in dimensions" :key="d.label" class="dimension-tag">
					<i class="dimension-dot" :style="{ background: dimColor(d.score) }" />
					<span class="dimension-label">{{ d.label }}</span>
					<b class="dimension-score" :style="{ color: dimColor(d.score) }">{{ d.score }}</b>
				</span>
			</div>
		</div>
	</section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	score: { type: Number, default: 75 },
	summary: { type: String, default: '' },
	dimensions: { type: Array, default: () => [] },
})

const R = 34
const circumference = computed(() => 2 * Math.PI * R)

const ringColor = computed(() => {
	if (props.score >= 80) return '#10B981'
	if (props.score >= 60) return '#F59E0B'
	return '#EF4444'
})

const dashOffset = computed(() => {
	const p = Math.min(100, Math.max(0, props.score))
	return circumference.value * (1 - p / 100)
})

function dimColor(score) {
	if (score >= 80) return '#10B981'
	if (score >= 60) return '#F59E0B'
	return '#EF4444'
}
</script>

<style scoped>
.score-card {
	background: var(--bg-card, #ffffff);
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 16px;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	padding: 16px;
	display: flex;
	align-items: center;
	gap: 16px;
	margin-bottom: 12px;
}

.score-ring {
	position: relative;
	width: 80px;
	height: 80px;
	flex-shrink: 0;
}

.score-ring svg {
	width: 100%;
	height: 100%;
	transform: rotate(-90deg);
}

.score-ring-bg {
	fill: none;
	stroke: #f3f4f6;
	stroke-width: 6;
}

.score-ring-progress {
	fill: none;
	stroke-width: 6;
	stroke-linecap: round;
	transition: stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.score-value {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	pointer-events: none;
}

.score-number {
	font-size: 26px;
	font-weight: 700;
	line-height: 1;
}

.score-label {
	font-size: 11px;
	color: var(--text-muted, #9ca3af);
	margin-top: 2px;
}

.score-info {
	flex: 1;
	min-width: 0;
}

.summary-title {
	font-size: 15px;
	font-weight: 600;
	color: var(--text-primary, #111827);
	margin: 0;
}

.summary-text {
	font-size: 13px;
	color: var(--text-secondary, #6b7280);
	line-height: 1.6;
	margin: 6px 0 0;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.score-dimensions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	margin-top: 10px;
}

.dimension-tag {
	display: inline-flex;
	align-items: center;
	gap: 5px;
	padding: 4px 8px;
	background: #f9fafb;
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 6px;
	font-size: 11px;
	color: var(--text-secondary, #6b7280);
}

.dimension-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	flex-shrink: 0;
}

.dimension-label {
	white-space: nowrap;
}

.dimension-score {
	font-weight: 600;
	margin-left: 1px;
}
</style>
