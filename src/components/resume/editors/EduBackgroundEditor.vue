<template>
	<view class="editor-placeholder">
		<text class="title">教育背景编辑器</text>
		<text class="desc">该编辑器待完善，当前可先保存原始数据。</text>
		<button class="save-btn" @click="saveData">保存</button>
	</view>
</template>

<script setup>
const props = defineProps({
	module: { type: Object, required: true }
})
const emit = defineEmits(['save'])
const saveData = () => emit('save', props.module)
</script>

<style scoped lang="scss">
.editor-placeholder { padding: 20rpx; }
.title { display: block; font-size: 30rpx; margin-bottom: 12rpx; color: #111827; }
.desc { display: block; font-size: 24rpx; margin-bottom: 20rpx; color: #6b7280; }
.save-btn { background: #007aff; color: #fff; border-radius: 12rpx; font-size: 28rpx; }
</style>
