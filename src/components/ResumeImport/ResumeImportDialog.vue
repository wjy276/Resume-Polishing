<template>
	<transition name="fade-scale">
		<view class="import-dialog-mask" v-if="visible" @click.self="handleClose">
			<view class="import-dialog">
				<view class="dialog-header">
					<text class="dialog-title">📥 导入简历</text>
					<text class="dialog-close" @click="handleClose">×</text>
				</view>

				<view class="dialog-body">
					<view class="import-tabs">
						<view
							v-for="tab in tabs"
							:key="tab.key"
							class="import-tab"
							:class="{ active: activeTab === tab.key }"
							@click="activeTab = tab.key"
						>
							<text class="tab-icon">{{ tab.icon }}</text>
							<text>{{ tab.label }}</text>
						</view>
					</view>

					<view class="import-content">
						<view v-if="activeTab === 'file'" class="file-upload-area" :class="{ 'drag-active': isDragging }" @dragenter.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @dragover.prevent @drop.prevent="handleDrop">
							<view class="upload-icon">📄</view>
							<text class="upload-hint">拖拽文件到此处，或点击选择</text>
							<text class="upload-subhint">支持 PDF、Word、TXT 格式</text>
							<view class="upload-btn" @click="selectFile">
								<text>选择文件</text>
							</view>
							<view v-if="selectedFile" class="selected-file">
								<text class="file-name">{{ selectedFile.name }}</text>
								<text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
								<text class="file-remove" @click="selectedFile = null">×</text>
							</view>
						</view>

						<view v-if="activeTab === 'text'" class="text-paste-area">
							<textarea
								v-model="pasteText"
								class="paste-textarea"
								placeholder="将简历内容粘贴到这里..."
								rows="12"
							></textarea>
							<text class="char-count">{{ pasteText.length }} 字符</text>
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
							:class="{ disabled: !canImport, loading: importing }"
							@click="handleImport"
						>
							<text v-if="!importing">{{ importing ? '导入中...' : '开始导入' }}</text>
							<view v-else class="btn-spinner"></view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</transition>
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

const tabs = [
	{ key: 'file', label: '文件上传', icon: '📁' },
	{ key: 'text', label: '文本粘贴', icon: '📝' },
	{ key: 'json', label: 'JSON 导入', icon: '📋' },
]

const activeTab = ref('file')
const selectedFile = ref(null)
const pasteText = ref('')
const jsonText = ref('')
const importing = ref(false)
const isDragging = ref(false)

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
	isDragging.value = false
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

function handleDrop(e) {
	isDragging.value = false
	const file = e.dataTransfer.files?.[0]
	if (file && /\.(pdf|doc|docx|txt)$/i.test(file.name)) {
		selectedFile.value = file
	}
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
.fade-scale-enter-active, 
.fade-scale-leave-active { 
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
}
.fade-scale-enter-from, 
.fade-scale-leave-to { 
	opacity: 0; 
	transform: scale(0.95);
}

.import-dialog-mask {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.45);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
	padding: 20px;
}

.import-dialog {
	width: 560px;
	max-width: 90vw;
	max-height: 85vh;
	background: var(--bg-card);
	border-radius: var(--radius-lg);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-shadow: var(--shadow-lg);
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.dialog-header {
	padding: 16px 20px;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: linear-gradient(to right, var(--bg-card), var(--bg-page));
}

.dialog-title {
	font-size: 16px;
	font-weight: 600;
	color: var(--text-primary);
}

.dialog-close {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
	color: var(--text-muted);
	cursor: pointer;
	border-radius: var(--radius-sm);
	transition: all var(--transition-fast);

	&:hover {
		background: var(--bg-page);
		color: var(--text-primary);
	}
}

.dialog-body {
	padding: 20px;
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
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	font-size: 14px;
	color: var(--text-secondary);
	cursor: pointer;
	transition: all var(--transition-fast);
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	background: var(--bg-page);

	.tab-icon {
		font-size: 16px;
	}

	&:hover {
		border-color: var(--primary-light);
		color: var(--primary-light);
	}

	&.active {
		background: var(--primary-light);
		border-color: var(--primary-light);
		color: #fff;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
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
	gap: 12px;
}

.file-upload-area {
	padding: 40px 20px;
	border: 2px dashed var(--border-color);
	border-radius: var(--radius-md);
	transition: all var(--transition-fast);
	background: var(--bg-page);

	&:hover, &.drag-active {
		border-color: var(--primary-light);
		background: rgba(37, 99, 235, 0.03);
	}
}

.upload-icon {
	font-size: 48px;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-5px); }
}

.upload-hint {
	font-size: 14px;
	color: var(--text-primary);
	font-weight: 500;
}

.upload-subhint {
	font-size: 12px;
	color: var(--text-muted);
}

.upload-btn {
	padding: 10px 24px;
	background: var(--primary-light);
	color: #fff;
	border-radius: var(--radius-sm);
	font-size: 14px;
	cursor: pointer;
	transition: all var(--transition-fast);
	box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
	}
}

.selected-file {
	padding: 12px 16px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	margin-top: 8px;
}

.file-name {
	font-size: 14px;
	color: var(--text-primary);
	font-weight: 500;
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-size {
	font-size: 12px;
	color: var(--text-muted);
	flex-shrink: 0;
}

.file-remove {
	font-size: 18px;
	color: var(--text-muted);
	cursor: pointer;
	padding: 4px;
	transition: all var(--transition-fast);

	&:hover {
		color: var(--danger-color);
	}
}

.paste-textarea,
.json-textarea {
	width: 100%;
	padding: 12px;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	font-size: 14px;
	font-family: inherit;
	resize: vertical;
	min-height: 200px;
	background: var(--bg-page);
	transition: all var(--transition-fast);

	&:focus {
		outline: none;
		border-color: var(--primary-light);
		background: var(--bg-card);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
}

.char-count {
	font-size: 12px;
	color: var(--text-muted);
	align-self: flex-end;
}

.json-hint {
	font-size: 12px;
	color: var(--text-muted);
	align-self: flex-start;
}

.dialog-footer {
	display: flex;
	gap: 10px;
	margin-top: 20px;
	justify-content: flex-end;
}

.footer-btn {
	padding: 10px 24px;
	border-radius: var(--radius-sm);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all var(--transition-fast);

	&.cancel {
		background: var(--bg-page);
		color: var(--text-secondary);

		&:hover {
			background: var(--border-color);
			color: var(--text-primary);
		}
	}

	&.confirm {
		background: linear-gradient(135deg, var(--primary-light), #3b82f6);
		color: #fff;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

		&:hover:not(.disabled) {
			transform: translateY(-1px);
			box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
		}

		&.disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		
		&.loading {
			pointer-events: none;
			min-width: 100px;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
}

.btn-spinner {
	width: 16px;
	height: 16px;
	border: 2px solid rgba(255,255,255,0.3);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>