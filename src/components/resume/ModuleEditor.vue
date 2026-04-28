<template>
	<view v-if="show" class="module-editor-mask" @click="handleClose">
		<view class="editor-content" @click.stop>
			<view class="editor-header">
				<text class="editor-title">{{ module?.cptTitle || '编辑模块' }}</text>
				<view class="close-btn" @click="handleClose">X</view>
			</view>

			<scroll-view class="editor-body" scroll-y>
				<component
					:is="currentEditorComponent"
					:module="module"
					@save="handleSave"
				/>
			</scroll-view>

			<view class="editor-footer">
				<button class="btn-cancel" @click="handleClose">取消</button>
				<button class="btn-save" @click="handleSaveFromChild">保存</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { getEditorComponent } from '@/utils/resume/moduleRegistry'

const props = defineProps({
	show: {
		type: Boolean,
		default: false
	},
	module: {
		type: Object,
		default: null
	}
})

const emit = defineEmits(['update:show', 'save'])

const currentEditorComponent = computed(() => {
	if (!props.module) return null
	return getEditorComponent(props.module)
})

const handleClose = () => emit('update:show', false)

const handleSave = (updatedModule) => {
	emit('save', updatedModule)
	handleClose()
}

const handleSaveFromChild = () => {
	uni.$emit('editorSave')
}
</script>

<style lang="scss" scoped>
.module-editor-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 999;
	display: flex;
	align-items: flex-end;

	.editor-content {
		width: 100%;
		max-height: 80vh;
		background: #fff;
		border-radius: 30rpx 30rpx 0 0;
		display: flex;
		flex-direction: column;
		animation: slideUp 0.3s ease-out;

		.editor-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx;
			border-bottom: 1px solid #eee;

			.editor-title {
				font-size: 32rpx;
				font-weight: 600;
			}

			.close-btn {
				width: 60rpx;
				height: 60rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 40rpx;
				color: #999;
			}
		}

		.editor-body {
			flex: 1;
			padding: 30rpx;
		}

		.editor-footer {
			display: flex;
			gap: 20rpx;
			padding: 30rpx;
			border-top: 1px solid #eee;

			button {
				flex: 1;
				height: 88rpx;
				line-height: 88rpx;
				border-radius: 12rpx;
				font-size: 30rpx;
			}

			.btn-cancel {
				background: #f5f5f5;
				color: #666;
			}

			.btn-save {
				background: #007aff;
				color: #fff;
			}
		}
	}
}

@keyframes slideUp {
	from { transform: translateY(100%); }
	to { transform: translateY(0); }
}
</style>
