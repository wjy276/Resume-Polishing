<template>
	<view class="base-info-module">
		<view v-if="module.data?.isShow?.avatar" class="avatar-wrapper">
			<image
				:src="module.data.avatar"
				class="avatar"
				mode="aspectFill"
			/>
		</view>

		<view class="name" :style="nameStyle">
			{{ module.data?.name || '姓名' }}
		</view>

		<view class="contact-info">
			<view v-if="module.data?.isShow?.phoneNumber" class="contact-item">
				<text class="icon">手机:</text>
				<text>{{ module.data.phoneNumber }}</text>
			</view>
			<view v-if="module.data?.isShow?.email" class="contact-item">
				<text class="icon">邮箱:</text>
				<text>{{ module.data.email }}</text>
			</view>
			<view v-if="module.data?.isShow?.address" class="contact-item">
				<text class="icon">地址:</text>
				<text>{{ module.data.address }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	module: {
		type: Object,
		required: true
	},
	globalStyle: {
		type: Object,
		default: () => ({})
	}
})

const nameStyle = computed(() => ({
	fontSize: props.module.style?.textFontSize || props.globalStyle?.firstTitleFontSize || '36rpx',
	color: props.module.style?.textColor || props.globalStyle?.themeColor || '#2c3e50',
	fontWeight: props.module.style?.fontWeight || props.globalStyle?.secondTitleWeight || 600
}))
</script>

<style lang="scss" scoped>
.base-info-module {
	text-align: center;
	padding: 40rpx 0;

	.avatar-wrapper {
		margin-bottom: 20rpx;
		.avatar {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			border: 4rpx solid #fff;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}
	}

	.name {
		font-size: 36rpx;
		font-weight: 600;
		margin-bottom: 20rpx;
	}

	.contact-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20rpx;
		font-size: 26rpx;
		color: #666;

		.contact-item {
			display: flex;
			align-items: center;
			gap: 8rpx;

			.icon { font-size: 24rpx; }
		}
	}
}
</style>
