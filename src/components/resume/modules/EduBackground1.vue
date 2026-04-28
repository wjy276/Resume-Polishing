<template>
	<view class="module-placeholder">
		<text class="title">{{ module?.cptTitle || '教育背景' }}</text>
		<text class="desc">EDU_BACKGROUND_1 模块待完善</text>
	</view>
</template>

<script setup>
defineProps({
	module: { type: Object, default: () => ({}) }
})
</script>

<style scoped lang="scss">
.module-placeholder { padding: 24rpx; border: 2rpx dashed #d1d5db; border-radius: 12rpx; }
.title { display: block; font-size: 30rpx; color: #111827; margin-bottom: 8rpx; }
.desc { font-size: 24rpx; color: #6b7280; }
</style>
