<template>
	<view class="base-info-editor">
		<view class="form-item">
			<text class="label">头像</text>
			<view class="avatar-upload" @click="chooseAvatar">
				<image
					v-if="localData.avatar"
					:src="localData.avatar"
					class="preview-avatar"
					mode="aspectFill"
				/>
				<text v-else class="upload-text">点击上传头像</text>
			</view>
			<view class="switch-wrapper">
				<text class="switch-label">显示头像</text>
				<switch :checked="!!localData.isShow?.avatar" @change="toggleField('avatar')" />
			</view>
		</view>

		<view class="form-item">
			<text class="label">姓名</text>
			<input class="input" v-model="localData.name" placeholder="请输入姓名" />
		</view>

		<view class="form-item">
			<text class="label">手机号</text>
			<input class="input" v-model="localData.phoneNumber" placeholder="请输入手机号" />
			<view class="switch-wrapper">
				<text class="switch-label">显示手机号</text>
				<switch :checked="!!localData.isShow?.phoneNumber" @change="toggleField('phoneNumber')" />
			</view>
		</view>

		<view class="form-item">
			<text class="label">邮箱</text>
			<input class="input" v-model="localData.email" placeholder="请输入邮箱" type="email" />
			<view class="switch-wrapper">
				<text class="switch-label">显示邮箱</text>
				<switch :checked="!!localData.isShow?.email" @change="toggleField('email')" />
			</view>
		</view>

		<view class="form-item">
			<text class="label">地址</text>
			<input class="input" v-model="localData.address" placeholder="请输入地址" />
			<view class="switch-wrapper">
				<text class="switch-label">显示地址</text>
				<switch :checked="!!localData.isShow?.address" @change="toggleField('address')" />
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
	module: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['save'])

const localData = ref({
	...props.module.data,
	isShow: props.module.data?.isShow || {}
})

function chooseAvatar() {
	uni.chooseImage({
		count: 1,
		success: (res) => {
			localData.value.avatar = res.tempFilePaths[0]
		}
	})
}

function toggleField(field) {
	if (!localData.value.isShow) localData.value.isShow = {}
	localData.value.isShow[field] = !localData.value.isShow[field]
}

function saveData() {
	emit('save', {
		...props.module,
		data: localData.value
	})
}

function handleEditorSave() {
	saveData()
}

onMounted(() => {
	uni.$on('editorSave', handleEditorSave)
})

onUnmounted(() => {
	uni.$off('editorSave', handleEditorSave)
})
</script>

<style lang="scss" scoped>
.base-info-editor {
	.form-item {
		margin-bottom: 40rpx;

		.label {
			display: block;
			font-size: 28rpx;
			color: #333;
			margin-bottom: 16rpx;
			font-weight: 500;
		}

		.input {
			width: 100%;
			height: 80rpx;
			padding: 0 20rpx;
			background: #f5f5f5;
			border-radius: 12rpx;
			font-size: 28rpx;
			box-sizing: border-box;
		}

		.avatar-upload {
			width: 100%;
			height: 200rpx;
			background: #f5f5f5;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 20rpx;

			.preview-avatar {
				width: 160rpx;
				height: 160rpx;
				border-radius: 50%;
			}

			.upload-text {
				color: #999;
				font-size: 28rpx;
			}
		}

		.switch-wrapper {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 20rpx;

			.switch-label {
				font-size: 26rpx;
				color: #666;
			}
		}
	}
}
</style>
