<template>
	<view class="import-dialog-mask" v-if="visible" @click.self="handleClose">
		<view class="import-dialog">
			<view class="dialog-header">
				<text class="dialog-title">导入简历</text>
				<text class="dialog-close" @click="handleClose">×</text>
			</view>

			<view class="dialog-body">
				<view class="import-tabs">
					<view
						class="import-tab"
						:class="{ active: activeTab === 'file' }"
						@click="activeTab = 'file'"
					>
						<text>文件上传</text>
					</view>
					<view
						class="import-tab"
						:class="{ active: activeTab === 'text' }"
						@click="activeTab = 'text'"
					>
						<text>文本粘贴</text>
					</view>
					<view
						class="import-tab"
						:class="{ active: activeTab === 'json' }"
						@click="activeTab = 'json'"
					>
						<text>JSON 导入</text>
					</view>
				</view>

				<view class="import-content">
					<view v-if="activeTab === 'file'" class="file-upload-area">
						<view class="upload-icon">📄</view>
						<text class="upload-hint">支持 PDF、Word、TXT 格式</text>
					<view class="upload-btn" @click="selectFile">
						<text>选择文件</text>
					</view>
					<view v-if="selectedFile" class="selected-file">
							<text class="file-name">{{ selectedFile.name }}</text>
							<text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
						</view>
					</view>

					<view v-if="activeTab === 'text'" class="text-paste-area">
						<textarea
							v-model="pasteText"
							class="paste-textarea"
							placeholder="将简历内容粘贴到这里..."
							rows="12"
						></textarea>
					</view>

					<view v-if="activeTab === 'json'" class="json-import-area">
						<textarea
							v-model="jsonText"
							class="json-textarea"
							placeholder='粘贴 JSON 格式的简历数据...'
							rows="12"
						></textarea>
						<text class="json-hint">支持标准简历 JSON 格式</text>
					</view>
				</view>

				<view class="dialog-footer">
					<view class="footer-btn cancel" @click="handleClose">
						<text>取消</text>
					</view>
					<view
						class="footer-btn confirm"
						:class="{ disabled: !canImport }"
						@click="handleImport"
					>
						<text>{{ importing ? '导入中...' : '开始导入' }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { useResumeStore } from '@/stores/resume'
import { parsedToEditorResume } from '@/utils/resume/agentAdapter'
import { generateId } from '@/utils/resume/initialData'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:visible', 'imported'])

const aiStore = useAIOptimizeStore()
const resumeStore = useResumeStore()

const activeTab = ref('file')
const selectedFile = ref(null)
const pasteText = ref('')
const jsonText = ref('')
const importing = ref(false)

const canImport = computed(() => {
	if (importing.value) return false
	if (activeTab.value === 'file') return !!selectedFile.value
	if (activeTab.value === 'text') return pasteText.value.trim().length > 0
	if (activeTab.value === 'json') return jsonText.value.trim().length > 0
	return false
})

function handleClose() {
	emit('update:visible', false)
	resetState()
}

function resetState() {
	activeTab.value = 'file'
	selectedFile.value = null
	pasteText.value = ''
	jsonText.value = ''
	importing.value = false
}

function selectFile() {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = '.pdf,.doc,.docx,.txt'
	input.onchange = (e) => {
		const file = e.target.files?.[0]
		if (file) {
			selectedFile.value = file
		}
	}
	input.click()
}

function formatFileSize(bytes) {
	if (bytes < 1024) return bytes + ' B'
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
	return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleImport() {
	if (!canImport.value) return

	importing.value = true

	try {
		let resumeData = null
		let title = ''

		if (activeTab.value === 'file') {
			title = `导入简历 - ${selectedFile.value?.name || ''}`
			resumeData = await importFromFile()
		} else if (activeTab.value === 'text') {
			title = '导入简历 - 文本粘贴'
			resumeData = await importFromText()
		} else if (activeTab.value === 'json') {
			title = '导入简历 - JSON'
			resumeData = await importFromJson()
		}

		if (resumeData) {
			// 使用 AI 解析的数据创建简历
			const result = await resumeStore.createResumeFromParsedData(resumeData, title)
			if (result.success) {
				uni.showToast({ title: '导入成功', icon: 'success' })
				emit('imported', result.id)
				handleClose()
			} else {
				uni.showToast({ title: result.message || '导入失败', icon: 'none' })
			}
		}
	} catch (e) {
		console.error('导入失败:', e)
		uni.showToast({ title: '导入失败', icon: 'none' })
	} finally {
		importing.value = false
	}
}

async function importFromFile() {
	if (!selectedFile.value) return null

	const initRes = await aiStore.initSession(true, '')
	if (!initRes.success) {
		uni.showToast({ title: 'AI 服务不可用', icon: 'none' })
		return null
	}

	const parseRes = await aiStore.uploadAndParse(selectedFile.value)
	if (parseRes.success && parseRes.data) {
		return parseRes.data
	}

	uni.showToast({ title: '解析失败', icon: 'none' })
	return null
}

async function importFromText() {
	if (!pasteText.value.trim()) return null

	const initRes = await aiStore.initSession(true, '')
	if (!initRes.success) {
		uni.showToast({ title: 'AI 服务不可用', icon: 'none' })
		return null
	}

	const parseRes = await aiStore.uploadTextAndParse(pasteText.value)
	if (parseRes.success && parseRes.data) {
		return parseRes.data
	}

	uni.showToast({ title: '解析失败', icon: 'none' })
	return null
}

async function importFromJson() {
	if (!jsonText.value.trim()) return null

	try {
		const data = JSON.parse(jsonText.value)
		const resumeData = parsedToEditorResume(data)
		if (resumeData) {
			resumeData.id = generateId()
			resumeData.title = data.title || '导入简历'
			return resumeData
		}
	} catch (e) {
		uni.showToast({ title: 'JSON 格式错误', icon: 'none' })
	}

	return null
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$primary-light: #3b82f6;

.import-dialog-mask {
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

.import-dialog {
	width: 560px;
	max-width: 90vw;
	max-height: 80vh;
	background: #fff;
	border-radius: 16px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
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
	overflow-y: auto;
}

.import-tabs {
	display: flex;
	gap: 8px;
	margin-bottom: 20px;
}

.import-tab {
	flex: 1;
	padding: 10px 16px;
	text-align: center;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 14px;
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

.import-content {
	min-height: 240px;
}

.file-upload-area,
.text-paste-area,
.json-import-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}

.upload-icon {
	font-size: 48px;
}

.upload-hint {
	font-size: 14px;
	color: #6b7280;
}

.upload-btn {
	padding: 10px 24px;
	background: $primary;
	color: #fff;
	border-radius: 8px;
	font-size: 14px;
	cursor: pointer;
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}
}

.selected-file {
	padding: 12px 16px;
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	width: 100%;
}

.file-name {
	font-size: 14px;
	color: #111827;
	font-weight: 500;
}

.file-size {
	font-size: 12px;
	color: #6b7280;
}

.paste-textarea,
.json-textarea {
	width: 100%;
	padding: 12px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 14px;
	font-family: inherit;
	resize: vertical;
	min-height: 200px;

	&:focus {
		outline: none;
		border-color: $primary;
	}
}

.json-hint {
	font-size: 12px;
	color: #6b7280;
	align-self: flex-start;
}

.dialog-footer {
	display: flex;
	gap: 12px;
	margin-top: 24px;
	justify-content: flex-end;
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
