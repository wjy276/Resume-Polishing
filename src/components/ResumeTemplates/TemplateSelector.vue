<template>
	<view class="template-selector">
		<view class="selector-header">
			<text class="selector-title">选择简历模板</text>
			<text class="selector-subtitle">选择喜欢的风格，一键生成专业简历</text>
		</view>

		<view class="template-grid">
			<view
				v-for="(config, key) in templateConfig"
				:key="key"
				class="template-card"
				:class="{ active: selectedTemplate === key }"
				@click="selectTemplate(key)"
			>
				<view class="template-preview" :style="getPreviewStyle(key)">
					<view class="preview-header" :style="{ backgroundColor: config.colors.primary }">
						<view class="preview-avatar"></view>
						<view class="preview-info">
							<view class="preview-name"></view>
							<view class="preview-job"></view>
						</view>
					</view>
					<view class="preview-content">
						<view class="preview-section"></view>
						<view class="preview-section short"></view>
						<view class="preview-section"></view>
					</view>
				</view>
				<view class="template-info">
					<text class="template-name">{{ config.name }}</text>
					<text class="template-desc">{{ config.description }}</text>
				</view>
				<view v-if="selectedTemplate === key" class="selected-badge">
					<text class="check-icon">✓</text>
				</view>
			</view>
		</view>

		<view class="selector-actions">
			<view class="action-btn preview-btn" @click="handlePreview">
				<text class="btn-icon">👁️</text>
				<text class="btn-text">预览效果</text>
			</view>
			<view class="action-btn export-btn" @click="handleExport">
				<text class="btn-icon">📄</text>
				<text class="btn-text">导出 PDF</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { templateConfig, templateTypes } from '@/utils/resumeData.js'

// Props
const props = defineProps({
	modelValue: {
		type: String,
		default: templateTypes.SIMPLE
	}
})

// Emits
const emit = defineEmits(['update:modelValue', 'preview', 'export'])

// 当前选中的模板
const selectedTemplate = ref(props.modelValue)

// 获取预览样式
const getPreviewStyle = (key) => {
	const config = templateConfig[key]
	return {
		borderColor: config.colors.primary,
		'--primary-color': config.colors.primary,
		'--secondary-color': config.colors.secondary,
		'--accent-color': config.colors.accent
	}
}

// 选择模板
const selectTemplate = (key) => {
	selectedTemplate.value = key
	emit('update:modelValue', key)
}

// 预览
const handlePreview = () => {
	emit('preview', selectedTemplate.value)
}

// 导出
const handleExport = () => {
	emit('export', selectedTemplate.value)
}
</script>

<style scoped lang="scss">
.template-selector {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 32rpx;
}

.selector-header {
	margin-bottom: 32rpx;
}

.selector-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #1a1a1a;
	display: block;
	margin-bottom: 8rpx;
}

.selector-subtitle {
	font-size: 26rpx;
	color: #6b7280;
}

.template-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 24rpx;
	margin-bottom: 32rpx;
}

.template-card {
	position: relative;
	background: #f9fafb;
	border: 3rpx solid #e5e7eb;
	border-radius: 16rpx;
	padding: 16rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:hover {
		border-color: var(--primary-color, #3b82f6);
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}

	&.active {
		border-color: var(--primary-color, #3b82f6);
		background: #f0f9ff;
	}
}

.template-preview {
	background: #ffffff;
	border-radius: 8rpx;
	overflow: hidden;
	margin-bottom: 16rpx;
	aspect-ratio: 3/4;
}

.preview-header {
	display: flex;
	align-items: center;
	padding: 12rpx;
	gap: 12rpx;
}

.preview-avatar {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.3);
}

.preview-info {
	flex: 1;
}

.preview-name {
	width: 60%;
	height: 8rpx;
	background: rgba(255, 255, 255, 0.5);
	border-radius: 4rpx;
	margin-bottom: 6rpx;
}

.preview-job {
	width: 40%;
	height: 6rpx;
	background: rgba(255, 255, 255, 0.3);
	border-radius: 3rpx;
}

.preview-content {
	padding: 12rpx;
}

.preview-section {
	height: 8rpx;
	background: #e5e7eb;
	border-radius: 4rpx;
	margin-bottom: 8rpx;

	&.short {
		width: 60%;
	}
}

.template-info {
	text-align: center;
}

.template-name {
	font-size: 26rpx;
	font-weight: 600;
	color: #1a1a1a;
	display: block;
	margin-bottom: 4rpx;
}

.template-desc {
	font-size: 22rpx;
	color: #6b7280;
}

.selected-badge {
	position: absolute;
	top: 12rpx;
	right: 12rpx;
	width: 36rpx;
	height: 36rpx;
	background: #3b82f6;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	color: #ffffff;
	font-size: 24rpx;
	font-weight: bold;
}

.selector-actions {
	display: flex;
	gap: 24rpx;
}

.action-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	padding: 24rpx;
	border-radius: 16rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:active {
		transform: scale(0.98);
	}
}

.preview-btn {
	background: #f3f4f6;
	border: 2rpx solid #e5e7eb;

	&:hover {
		background: #e5e7eb;
	}

	.btn-text {
		color: #374151;
	}
}

.export-btn {
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);

	&:hover {
		box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.4);
	}

	.btn-text {
		color: #ffffff;
	}
}

.btn-icon {
	font-size: 32rpx;
}

.btn-text {
	font-size: 28rpx;
	font-weight: 500;
}

@media (max-width: 1200px) {
	.template-grid {
		grid-template-columns: repeat(2, 1fr);
	}
}

@media (max-width: 768px) {
	.template-grid {
		grid-template-columns: 1fr;
	}
}
</style>
