<template>
	<view class="score-card">
		<view class="score-card-header">
			<text class="score-card-title">📊 本轮评分</text>
			<text class="score-card-value">{{ score }}分</text>
		</view>
		<view class="score-card-feedback">
			<text>{{ feedback }}</text>
		</view>
	</view>
</template>

<script setup>
defineProps({
	score: {
		type: [Number, String],
		default: 0,
	},
	feedback: {
		type: String,
		default: '',
	},
})
</script>

<style scoped lang="scss">
.score-card {
	background: linear-gradient(135deg, #f0fdf4, #ffffff);
	border: 1px solid #bbf7d0;
	border-radius: 12px;
	padding: 16px 20px;
	margin: 8px 0 8px 52px;
	max-width: 400px;
	animation: fadeInUp 0.4s ease;
}

.score-card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
}

.score-card-title {
	font-size: 13px;
	font-weight: 600;
	color: #059669;
	display: flex;
	align-items: center;
	gap: 6px;
}

.score-card-value {
	font-size: 24px;
	font-weight: 700;
	color: #059669;
}

.score-card-feedback {
	font-size: 13px;
	color: #4b5563;
	line-height: 1.6;
	padding: 10px;
	background: rgba(255, 255, 255, 0.6);
	border-radius: 8px;
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@media (max-width: 768px) {
	.score-card {
		margin-left: 0;
		max-width: 100%;
	}
}
</style>
