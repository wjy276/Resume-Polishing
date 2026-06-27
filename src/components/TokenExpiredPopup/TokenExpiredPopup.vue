<template>
	<!-- 登录过期弹窗遮罩 -->
	<view class="expired-popup-mask" v-if="visible" @click.stop>
		<view class="expired-popup" @click.stop>
			<!-- 图标 -->
			<view class="expired-icon">
				<text class="icon-clock">⏱</text>
			</view>

			<!-- 标题 -->
			<text class="expired-title">登录已过期</text>
			<text class="expired-desc">您的登录状态已过期，请重新登录以继续使用</text>

			<!-- 按钮 -->
			<view class="expired-actions">
				<view class="action-btn cancel" @click="handleCancel">
					<text>稍后再说</text>
				</view>
				<view class="action-btn confirm" @click="handleConfirm">
					<text>重新登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const handleConfirm = () => {
	emit('update:visible', false)
	emit('confirm')

	const pages = getCurrentPages()
	const currentRoute = pages.length > 0 ? pages[pages.length - 1].route : ''
	if (currentRoute.includes('Login')) return

	uni.navigateTo({
		url: '/pages/Login/Login'
	})
}

const handleCancel = () => {
	emit('update:visible', false)
	emit('cancel')
}
</script>

<style scoped lang="scss">
$primary: #1e3a8a;
$primary-light: #3b82f6;

.expired-popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(8rpx);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10001;
	animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

.expired-popup {
	width: 560rpx;
	background: #ffffff;
	border-radius: 32rpx;
	padding: 60rpx 48rpx 48rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(40rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.expired-icon {
	width: 120rpx;
	height: 120rpx;
	background: linear-gradient(135deg, #fef3c7, #fde68a);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.icon-clock {
	font-size: 56rpx;
}

.expired-title {
	font-size: 36rpx;
	font-weight: 600;
	color: $primary;
	margin-bottom: 16rpx;
}

.expired-desc {
	font-size: 26rpx;
	color: #6b7280;
	text-align: center;
	line-height: 1.6;
	margin-bottom: 40rpx;
}

.expired-actions {
	display: flex;
	gap: 24rpx;
	width: 100%;
}

.action-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.3s;

	&.cancel {
		background: #f3f4f6;
		color: #6b7280;

		&:active {
			background: #e5e7eb;
		}
	}

	&.confirm {
		background: linear-gradient(135deg, $primary, $primary-light);
		color: #ffffff;

		&:active {
			opacity: 0.9;
		}
	}
}
</style>
