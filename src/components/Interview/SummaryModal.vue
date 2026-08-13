<template>
	<view class="summary-modal-overlay" @click.self="$emit('close')">
		<view class="summary-modal">
			<view class="summary-modal-header">
				<text class="summary-modal-title">面试总结</text>
				<button class="btn-modal-close" @click="$emit('close')">×</button>
			</view>

			<view class="summary-modal-body">
				<view class="summary-score-section">
					<view class="score-circle" :style="{ '--score': score }">
						<view class="score-circle-inner">
							<text class="score-num">{{ score }}</text>
							<text class="score-label">综合评分</text>
						</view>
					</view>
				</view>

				<view v-if="summary.summary_text" class="summary-section">
					<view class="summary-text">
						<text>{{ summary.summary_text }}</text>
					</view>
				</view>

				<view class="summary-section">
					<view class="summary-section-title">
						<view class="icon strength"><text>✓</text></view>
						<text>优势</text>
					</view>
					<view class="summary-list">
						<view v-for="(item, index) in summary.strengths || []" :key="index" class="summary-list-item">
							<text>{{ item }}</text>
						</view>
						<text v-if="!(summary.strengths || []).length" class="summary-empty">暂无</text>
					</view>
				</view>

				<view class="summary-section">
					<view class="summary-section-title">
						<view class="icon weakness"><text>!</text></view>
						<text>待提升</text>
					</view>
					<view class="summary-list">
						<view v-for="(item, index) in summary.weaknesses || []" :key="index" class="summary-list-item">
							<text>{{ item }}</text>
						</view>
						<text v-if="!(summary.weaknesses || []).length" class="summary-empty">暂无</text>
					</view>
				</view>

				<view class="summary-section">
					<view class="summary-section-title">
						<view class="icon improvement"><text>→</text></view>
						<text>改进建议</text>
					</view>
					<view class="summary-list">
						<view v-for="(item, index) in summary.improvements || []" :key="index" class="summary-list-item">
							<text>{{ item }}</text>
						</view>
						<text v-if="!(summary.improvements || []).length" class="summary-empty">暂无</text>
					</view>
				</view>

				<view v-if="(summary.score_details || []).length" class="score-details">
					<view
						v-for="(detail, index) in summary.score_details"
						:key="index"
						class="score-detail-item"
					>
						<text class="score-detail-label">{{ detail.label }}</text>
						<text class="score-detail-value">{{ detail.value }}</text>
					</view>
				</view>
			</view>

			<view class="summary-modal-footer">
				<button class="btn-summary-action secondary" @click="$emit('view-detail')">
					查看详细评分
				</button>
				<button class="btn-summary-action primary" @click="$emit('back-home')">
					返回首页
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	summary: {
		type: Object,
		default: () => ({}),
	},
})

defineEmits(['close', 'back-home', 'view-detail'])

const score = computed(() => props.summary.overall_score || 0)
</script>

<style scoped lang="scss">
.summary-modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.summary-modal {
	background: #ffffff;
	border-radius: 16px;
	width: 90%;
	max-width: 520px;
	max-height: 85vh;
	overflow-y: auto;
	animation: slideUp 0.3s ease;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.summary-modal-header {
	padding: 20px 24px;
	border-bottom: 1px solid #e5e7eb;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.summary-modal-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
}

.btn-modal-close {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	border: none;
	background: #f3f4f6;
	color: #6b7280;
	font-size: 18px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s;

	&:hover {
		background: #e5e7eb;
		color: #374151;
	}
}

.summary-modal-body {
	padding: 24px;
}

.summary-score-section {
	text-align: center;
	margin-bottom: 28px;
}

.score-circle {
	width: 120px;
	height: 120px;
	border-radius: 50%;
	background: conic-gradient(#10b981 calc(var(--score) * 1%), #e5e7eb 0);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		width: 100px;
		height: 100px;
		border-radius: 50%;
		background: #ffffff;
	}
}

.score-circle-inner {
	position: relative;
	z-index: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.score-num {
	font-size: 36px;
	font-weight: 700;
	color: #059669;
	line-height: 1;
}

.score-label {
	font-size: 12px;
	color: #6b7280;
	margin-top: 4px;
}

.summary-section {
	margin-bottom: 20px;

	&:last-child {
		margin-bottom: 0;
	}
}

.summary-section-title {
	font-size: 14px;
	font-weight: 600;
	color: #374151;
	margin-bottom: 12px;
	display: flex;
	align-items: center;
	gap: 8px;
}

.icon {
	width: 24px;
	height: 24px;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;

	&.strength {
		background: #d1fae5;
		color: #059669;
	}

	&.weakness {
		background: #fee2e2;
		color: #ef4444;
	}

	&.improvement {
		background: #dbeafe;
		color: #2563eb;
	}
}

.summary-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.summary-list-item {
	font-size: 13px;
	color: #4b5563;
	padding: 8px 12px;
	background: #f9fafb;
	border-radius: 8px;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	line-height: 1.5;
}

.summary-empty {
	font-size: 13px;
	color: #9ca3af;
}

.summary-text {
	font-size: 13px;
	color: #4b5563;
	line-height: 1.7;
	padding: 12px;
	background: #f9fafb;
	border-radius: 8px;
}

.score-details {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
	margin-top: 16px;
}

.score-detail-item {
	background: #f9fafb;
	border-radius: 8px;
	padding: 12px;
	text-align: center;
}

.score-detail-label {
	font-size: 11px;
	color: #9ca3af;
	margin-bottom: 4px;
	display: block;
}

.score-detail-value {
	font-size: 18px;
	font-weight: 700;
	color: #1f2937;
}

.summary-modal-footer {
	padding: 16px 24px;
	border-top: 1px solid #e5e7eb;
	display: flex;
	justify-content: center;
	gap: 12px;
}

.btn-summary-action {
	padding: 10px 24px;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	border: none;
	transition: all 0.2s;

	&.primary {
		background: #1a3a6b;
		color: #ffffff;

		&:hover {
			background: #243f6e;
		}
	}

	&.secondary {
		background: #ffffff;
		color: #374151;
		border: 1px solid #e5e7eb;

		&:hover {
			background: #f9fafb;
		}
	}
}
</style>
