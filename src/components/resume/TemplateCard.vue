<template>
	<view class="template-card" @click="handleClick">
		<view class="card-image-wrapper">
			<image
				:src="template.previewUrl"
				class="preview-image"
				mode="aspectFill"
				lazy-load
			/>
			<view v-if="template.isHot" class="hot-badge">热门</view>
			<view v-if="template.isNew" class="new-badge">新</view>
		</view>

		<view class="card-info">
			<text class="template-name">{{ template.NAME }}</text>
			<view class="template-meta">
				<text class="usage-count">{{ formatNumber(template.VIEWS || 0) }}次使用</text>
				<text class="like-count">点赞 {{ formatNumber(template.LIKES || 0) }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	template: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['select'])

const handleClick = () => {
	emit('select', props.template)
}

const formatNumber = (num) => {
	const n = Number(num) || 0
	if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
	return `${n}`
}
</script>

<style lang="scss" scoped>
.template-card {
	background: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
	}

	.card-image-wrapper {
		position: relative;
		width: 100%;
		height: 400rpx;
		background: #f5f5f5;

		.preview-image {
			width: 100%;
			height: 100%;
		}

		.hot-badge,
		.new-badge {
			position: absolute;
			top: 20rpx;
			color: #fff;
			padding: 8rpx 20rpx;
			border-radius: 20rpx;
			font-size: 24rpx;
		}

		.hot-badge {
			left: 20rpx;
			background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
		}

		.new-badge {
			right: 20rpx;
			background: linear-gradient(135deg, #4facfe, #00f2fe);
		}
	}

	.card-info {
		padding: 24rpx;

		.template-name {
			display: block;
			font-size: 30rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 16rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.template-meta {
			display: flex;
			justify-content: space-between;
			font-size: 24rpx;
			color: #999;
		}
	}
}
</style>
