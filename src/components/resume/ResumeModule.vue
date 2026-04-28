<template>
	<view
		class="resume-module"
		:class="{ selected: isSelected, editing: isEditing }"
		@click="handleClick"
	>
		<component
			:is="currentModuleComponent"
			:module="module"
			:global-style="globalStyle"
		/>

		<view v-if="isSelected || isEditing" class="module-actions">
			<view class="action-btn" @click.stop="handleMoveUp"><text>上</text></view>
			<view class="action-btn" @click.stop="handleEdit"><text>编</text></view>
			<view class="action-btn" @click.stop="handleDelete"><text>删</text></view>
			<view class="action-btn" @click.stop="handleMoveDown"><text>下</text></view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { getModuleComponent } from '@/utils/resume/moduleRegistry'

const props = defineProps({
	module: {
		type: Object,
		required: true
	},
	globalStyle: {
		type: Object,
		default: () => ({})
	},
	selected: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['select', 'edit', 'delete', 'move-up', 'move-down'])

const isSelected = computed(() => props.selected)
const isEditing = computed(() => false)
const currentModuleComponent = computed(() => getModuleComponent(props.module))

const handleClick = () => {
	emit('select', props.module)
}

const handleEdit = () => {
	emit('edit', props.module)
}

const handleDelete = () => {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这个模块吗？',
		success: (res) => {
			if (res.confirm) {
				emit('delete', props.module.keyId)
			}
		}
	})
}

const handleMoveUp = () => emit('move-up', props.module.keyId)
const handleMoveDown = () => emit('move-down', props.module.keyId)
</script>

<style lang="scss" scoped>
.resume-module {
	position: relative;
	margin-bottom: 30rpx;
	border: 3rpx solid transparent;
	border-radius: 12rpx;
	transition: all 0.3s;

	&.selected {
		border-color: #007aff;
		box-shadow: 0 0 20rpx rgba(0, 122, 255, 0.3);
	}

	&.editing {
		border-color: #ff6b6b;
		box-shadow: 0 0 20rpx rgba(255, 107, 107, 0.3);
	}

	.module-actions {
		position: absolute;
		right: 20rpx;
		top: 20rpx;
		display: flex;
		gap: 10rpx;
		z-index: 10;

		.action-btn {
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(255, 255, 255, 0.95);
			border-radius: 50%;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
			font-size: 32rpx;

			&:active {
				transform: scale(0.9);
			}
		}
	}
}
</style>
