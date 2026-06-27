<template>
	<view class="save-template-mask" v-if="visible" @click.self="handleClose">
		<view class="save-template-dialog">
			<view class="dialog-header">
				<text class="dialog-title">保存为模板</text>
				<text class="dialog-close" @click="handleClose">×</text>
			</view>

			<view class="dialog-body">
				<view class="form-group">
					<text class="form-label">模板名称</text>
					<input
						v-model="templateName"
						class="form-input"
						placeholder="输入模板名称"
					/>
				</view>

				<view class="form-group">
					<text class="form-label">模板描述</text>
					<textarea
						v-model="templateDesc"
						class="form-textarea"
						placeholder="描述这个模板的特点..."
						rows="3"
					></textarea>
				</view>

				<view class="form-group">
					<text class="form-label">模板分类</text>
					<view class="category-options">
						<view
							v-for="cat in categories"
							:key="cat.value"
							class="category-option"
							:class="{ active: selectedCategory === cat.value }"
							@click="selectedCategory = cat.value"
						>
							<text>{{ cat.label }}</text>
						</view>
					</view>
				</view>

				<view class="form-group">
					<view class="checkbox-row" @click="isPublic = !isPublic">
						<view class="checkbox" :class="{ checked: isPublic }">
							<text v-if="isPublic">✓</text>
						</view>
						<text class="checkbox-label">公开模板（其他用户可见）</text>
					</view>
				</view>

				<view class="dialog-footer">
					<view class="footer-btn cancel" @click="handleClose">
						<text>取消</text>
					</view>
					<view
						class="footer-btn confirm"
						:class="{ disabled: !templateName.trim() || saving }"
						@click="handleSave"
					>
						<text>{{ saving ? '保存中...' : '保存模板' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useTemplateStore } from '@/stores/template'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
	resumeData: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['update:visible', 'saved'])

const templateStore = useTemplateStore()

const templateName = ref('')
const templateDesc = ref('')
const selectedCategory = ref('custom')
const isPublic = ref(true)
const saving = ref(false)

const categories = [
	{ value: 'tech', label: '技术' },
	{ value: 'design', label: '设计' },
	{ value: 'business', label: '商务' },
	{ value: 'custom', label: '自定义' },
]

function handleClose() {
	emit('update:visible', false)
	resetForm()
}

function resetForm() {
	templateName.value = ''
	templateDesc.value = ''
	selectedCategory.value = 'custom'
	isPublic.value = true
	saving.value = false
}

async function handleSave() {
	if (!templateName.value.trim() || !props.resumeData || saving.value) return

	saving.value = true

	try {
		const result = await templateStore.saveAsTemplate(props.resumeData, {
			name: templateName.value,
			description: templateDesc.value,
			category: selectedCategory.value,
			isPublic: isPublic.value,
		})

		if (result.success) {
			uni.showToast({ title: '保存成功', icon: 'success' })
			emit('saved', result.data)
			handleClose()
		} else {
			uni.showToast({ title: result.message || '保存失败', icon: 'none' })
		}
	} catch (e) {
		uni.showToast({ title: '保存失败', icon: 'none' })
	} finally {
		saving.value = false
	}
}
</script>

<style scoped lang="scss">
$primary: #2563eb;

.save-template-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
}

.save-template-dialog {
	width: 480px;
	max-width: 90vw;
	background: #fff;
	border-radius: 16px;
	overflow: hidden;
}

.dialog-header {
	padding: 20px 24px;
	border-bottom: 1px solid #e5e7eb;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.dialog-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
}

.dialog-close {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
	color: #6b7280;
	cursor: pointer;
	border-radius: 6px;

	&:hover {
		background: #f3f4f6;
		color: #111827;
	}
}

.dialog-body {
	padding: 24px;
}

.form-group {
	margin-bottom: 20px;
}

.form-label {
	display: block;
	font-size: 14px;
	font-weight: 500;
	color: #374151;
	margin-bottom: 8px;
}

.form-input {
	width: 100%;
	padding: 10px 14px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 14px;

	&:focus {
		outline: none;
		border-color: $primary;
	}
}

.form-textarea {
	width: 100%;
	padding: 10px 14px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 14px;
	font-family: inherit;
	resize: vertical;

	&:focus {
		outline: none;
		border-color: $primary;
	}
}

.category-options {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.category-option {
	padding: 8px 16px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 13px;
	color: #6b7280;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: $primary;
		color: $primary;
	}

	&.active {
		background: $primary;
		border-color: $primary;
		color: #fff;
	}
}

.checkbox-row {
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
}

.checkbox {
	width: 20px;
	height: 20px;
	border: 2px solid #d1d5db;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	color: #fff;
	transition: all 0.2s;

	&.checked {
		background: $primary;
		border-color: $primary;
	}
}

.checkbox-label {
	font-size: 14px;
	color: #374151;
}

.dialog-footer {
	display: flex;
	gap: 12px;
	justify-content: flex-end;
	margin-top: 24px;
}

.footer-btn {
	padding: 10px 24px;
	border-radius: 8px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;

	&.cancel {
		background: #f3f4f6;
		color: #374151;

		&:hover {
			background: #e5e7eb;
		}
	}

	&.confirm {
		background: $primary;
		color: #fff;

		&:hover {
			opacity: 0.9;
		}

		&.disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}
</style>
