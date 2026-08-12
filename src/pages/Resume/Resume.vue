<template>
	<view class="page-layout">
		<Sidebar />

		<view class="page-main resume-main">
			<!-- Alert banner -->
			<view v-if="!isLoggedIn" class="alert-banner alert-warn">
				<text class="alert-icon">⚠</text>
				<view class="alert-body">
					<text class="alert-title">请先登录</text>
					<text class="alert-desc">登录后简历将自动同步到云端，多端可访问</text>
				</view>
			</view>
			<view v-else-if="store.syncError" class="alert-banner alert-warn">
				<text class="alert-icon">⚠</text>
				<view class="alert-body">
					<text class="alert-title">同步异常</text>
					<text class="alert-desc">{{ store.syncError }}</text>
				</view>
				<button class="alert-action" @click="refreshList">重试</button>
			</view>

			<!-- Title row -->
			<view class="title-row">
				<text class="page-title">我的简历</text>
				<view class="title-actions">
					<button class="btn-outline" @click="showImportDialog = true">
						<text>⬆ 导入简历</text>
					</button>
					<button class="btn-outline" @click="showTemplateGallery = true">
						<text>📋 模板广场</text>
					</button>
					<button class="btn-primary" @click="createResume">
						<text>＋ 新建简历</text>
					</button>
				</view>
			</view>

			<!-- AI 优化入口卡片 -->
			<view class="ai-entry-card" @click="goToAIOptimize">
				<view class="ai-entry-left">
					<view class="ai-entry-icon">✨</view>
					<view class="ai-entry-content">
						<text class="ai-entry-title">求职意向</text>
						<text class="ai-entry-desc">填写求职方向与目标岗位 JD，作为所有简历优化的提示词</text>
					</view>
				</view>
				<button class="ai-entry-btn">{{ careerIntentStore.isFilled ? '查看/修改' : '去填写' }}</button>
			</view>

			<view v-if="store.listLoading" class="loading-hint">
				<view class="spinner" style="margin: 0 auto 12px"></view>
				正在加载简历...
			</view>

			<!-- Resume grid -->
			<view v-else class="resume-grid">
				<!-- Create new card -->
				<view class="resume-card card-new" @click="createResume">
					<view class="card-new-inner">
						<view class="plus-circle">
							<text class="plus-icon">＋</text>
						</view>
						<text class="card-new-title">新建简历</text>
						<text class="card-new-desc">选一个新简历从头写起</text>
					</view>
				</view>

				<!-- Existing resume cards -->
				<view
					v-for="resume in allResumes"
					:key="resume.id"
					class="resume-card"
				>
					<view class="card-preview" ref="cardRefs" @click="editResume(resume.id)">
						<view class="preview-scaler" :style="scalerStyle(resume)">
							<div class="preview-inner" :style="previewInnerStyle(resume)">
								<ClassicTemplate :data="resume" />
							</div>
						</view>
						<view class="card-fade" />
						<view class="card-overlay">
							<text class="card-resume-title">{{ resume.title || '未命名简历' }}</text>
							<text class="card-meta">经典模板 · {{ formatDate(resume.createdAt) }}</text>
						</view>
					</view>

					<view class="card-footer">
						<button class="card-btn" @click.stop="editResume(resume.id)">编辑</button>
						<button class="card-btn card-btn-danger" @click.stop="confirmDelete(resume)">删除</button>
					</view>
				</view>
			</view>
		</view>

		<!-- Delete confirm modal -->
		<view v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
			<view class="modal-box">
				<text class="modal-title">删除简历</text>
				<text class="modal-desc">确定要删除「{{ deleteTarget.title || '未命名简历' }}」吗？此操作无法撤销。</text>
				<view class="modal-actions">
					<button class="btn-outline" @click="deleteTarget = null">取消</button>
					<button class="btn-danger" @click="doDelete">确认删除</button>
				</view>
			</view>
		</view>

		<!-- Upload resume modal -->
		<view v-if="showUpload" class="modal-overlay" @click.self="showUpload = false">
			<view class="modal-box upload-modal">
				<text class="modal-title">上传简历</text>
				<text class="modal-desc">支持 PDF、Word 格式，AI 将自动解析为结构化数据</text>

				<view class="upload-area" @click="triggerFileInput" :class="{ dragging: isDragging }">
					<input
						ref="fileInput"
						type="file"
						accept=".pdf,.doc,.docx"
						style="display: none"
						@change="handleFileSelect"
					/>
					<view class="upload-icon">📄</view>
					<text class="upload-text" v-if="!selectedFile">点击选择文件或拖拽到此处</text>
					<text class="upload-text" v-else>{{ selectedFile.name }}</text>
					<text class="upload-hint">支持 PDF、DOC、DOCX 格式</text>
				</view>

				<view class="modal-actions">
					<button class="btn-outline" @click="showUpload = false">取消</button>
					<button class="btn-primary" @click="handleUpload" :disabled="!selectedFile || uploading">
						{{ uploading ? '上传中...' : '开始解析' }}
					</button>
				</view>
			</view>
		</view>

		<!-- Import dialog -->
		<ResumeImportDialog
			v-model:visible="showImportDialog"
			@imported="handleImported"
		/>

		<!-- Template gallery -->
		<view v-if="showTemplateGallery" class="modal-overlay" @click.self="showTemplateGallery = false">
			<view class="modal-box gallery-modal">
				<TemplateGallery @close="showTemplateGallery = false" />
			</view>
		</view>
	</view>

	<!-- Career Intent Dialog (outside page-layout to avoid overflow:hidden clipping) -->
	<CareerIntentDialog
		:visible="showCareerIntentDialog"
		@update:visible="showCareerIntentDialog = $event"
		@saved="handleCareerIntentSaved"
	/>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import ClassicTemplate from '@/components/resume/ClassicTemplate.vue'
import ResumeImportDialog from '@/components/ResumeImport/ResumeImportDialog.vue'
import TemplateGallery from '@/components/TemplateGallery/TemplateGallery.vue'
import CareerIntentDialog from '@/components/AIOptimize/CareerIntentDialog.vue'
import { useResumeStore } from '@/stores/resume'
import { useUserStore } from '@/stores/user'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { useCareerIntentStore } from '@/stores/careerIntent'

const store = useResumeStore()
const userStore = useUserStore()
const aiStore = useAIOptimizeStore()
const careerIntentStore = useCareerIntentStore()
const deleteTarget = ref(null)

const showUpload = ref(false)
const showImportDialog = ref(false)
const showTemplateGallery = ref(false)
const showCareerIntentDialog = ref(false)
const selectedFile = ref(null)
const uploading = ref(false)
const isDragging = ref(false)
const fileInput = ref(null)

const isLoggedIn = computed(() => userStore.hasToken)

const CARD_PREVIEW_WIDTH = 200
const A4_WIDTH_PX = 793.7

const allResumes = computed(() => store.allResumes)

async function refreshList() {
	await store.fetchAllFromServer()
}

onLoad(async () => {
	refreshList()
	await initCareerIntent()
})

async function initCareerIntent() {
	const userInfo = userStore.userInfo
	const userId = userInfo?.userId || userInfo?.id
	if (userId) {
		careerIntentStore.setUserId(String(userId))
	}

	await careerIntentStore.fetchCareerIntent(userId ? String(userId) : '')
	if (careerIntentStore.isEmpty) {
		// 未填写：首次进入自动弹出求职意向弹窗
		showCareerIntentDialog.value = true
	}
}

onShow(() => {
	if (userStore.hasToken) refreshList()
})

function scalerStyle(resume) {
	const scale = CARD_PREVIEW_WIDTH / A4_WIDTH_PX
	return {
		width: `${A4_WIDTH_PX}px`,
		height: `${A4_WIDTH_PX * (297 / 210)}px`,
		transform: `scale(${scale})`,
		transformOrigin: 'top left',
		position: 'absolute',
		top: '0',
		left: '0',
	}
}

function previewInnerStyle(resume) {
	const gs = resume?.globalSettings || {}
	return {
		padding: `${gs.pagePadding ?? 32}px`,
		background: '#fff',
		width: '100%',
		height: '100%',
		boxSizing: 'border-box',
	}
}

function formatDate(iso) {
	if (!iso) return ''
	try {
		const d = new Date(iso)
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	} catch {
		return ''
	}
}

async function createResume() {
	uni.showLoading({ title: '创建中...' })
	try {
		const result = await store.createResumeOnServer({
			title: `新建简历 ${store.allResumes.length + 1}`,
		})
		if (result.success && result.id) {
			window.location.href = `/#/pages/Resume/ResumeEditor?id=${result.id}`
		}
	} finally {
		uni.hideLoading()
	}
}

async function editResume(id) {
	store.setActiveResume(id)
	if (userStore.hasToken) {
		uni.showLoading({ title: '加载中...' })
		await store.loadResumeFromServer(id)
		uni.hideLoading()
	}
	window.location.href = `/#/pages/Resume/ResumeEditor?id=${id}`
}

function confirmDelete(resume) {
	deleteTarget.value = resume
}

async function doDelete() {
	if (!deleteTarget.value) return
	const id = deleteTarget.value.id
	deleteTarget.value = null

	uni.showLoading({ title: '删除中...' })
	const result = await store.deleteResumeOnServer(id)
	uni.hideLoading()

	if (result.success) {
		uni.showToast({ title: '删除成功', icon: 'success' })
		await refreshList()
	} else {
		uni.showToast({ title: result.message || '删除失败', icon: 'none' })
	}
}

function triggerFileInput() {
	fileInput.value?.click()
}

function handleFileSelect(e) {
	const file = e.target.files?.[0]
	if (file) {
		selectedFile.value = file
	}
}

async function handleUpload() {
	if (!selectedFile.value) return
	uploading.value = true

	try {
		const result = await aiStore.uploadAndParse(selectedFile.value)

		if (result.success && result.data) {
			const resumeResult = await store.createResumeFromParsedData(
				result.data,
				`导入简历 - ${selectedFile.value.name}`
			)

			if (resumeResult.success && resumeResult.id) {
				uni.showToast({ title: '解析成功', icon: 'success' })
				showUpload.value = false
				await refreshList()
				window.location.href = `/#/pages/Resume/ResumeEditor?id=${resumeResult.id}`
			} else {
				uni.showToast({ title: resumeResult.message || '创建失败', icon: 'none' })
			}
		} else {
			uni.showToast({ title: result.message || '解析失败', icon: 'none' })
		}
	} catch (e) {
		console.error('上传失败:', e)
		uni.showToast({ title: '上传失败', icon: 'none' })
	} finally {
		uploading.value = false
	}
}

function handleImported(resumeId) {
	if (resumeId) {
		refreshList()
		window.location.href = `/#/pages/Resume/ResumeEditor?id=${resumeId}`
	}
}

function goToAIOptimize() {
	showCareerIntentDialog.value = true
}

function handleCareerIntentSaved() {
	showCareerIntentDialog.value = false
}
</script>

<style scoped lang="scss">
.resume-main {
	padding: 20px 32px 40px;
}

/* Alert */
.alert-banner {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 16px;
	border-radius: var(--radius-md);
	border: 1px solid;
	margin-bottom: 20px;
	animation: slideUp 0.3s ease;
}

.alert-warn {
	border-color: #fca5a5;
	background: rgba(254, 242, 242, 0.6);
	color: #991b1b;
}

.alert-icon { font-size: 14px; flex-shrink: 0; }
.alert-body { flex: 1; min-width: 0; }
.alert-title { display: block; font-size: 13px; font-weight: 600; color: #991b1b; }
.alert-desc { display: block; font-size: 12px; color: #b91c1c; margin-top: 2px; }

.alert-action {
	background: transparent;
	border: 1px solid #fca5a5;
	color: #991b1b;
	border-radius: var(--radius-sm);
	padding: 4px 12px;
	font-size: 12px;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;
	transition: all 0.15s;

	&:hover { background: #fee2e2; }
}

/* Title row */
.title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.loading-hint {
	padding: 48px 0;
	text-align: center;
	font-size: 14px;
	color: var(--text-secondary);
}

.page-title {
	font-size: 24px;
	font-weight: 700;
	color: var(--text-primary);
}

.title-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.btn-outline {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 8px 16px;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	background: var(--bg-card);
	font-size: 13px;
	color: var(--text-secondary);
	cursor: pointer;
	transition: all 0.15s;

	&:hover { border-color: var(--primary-light); background: #eff6ff; color: var(--primary-light); }
}

.btn-primary {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 8px 16px;
	background: var(--text-primary);
	color: #fff;
	border: none;
	border-radius: var(--radius-sm);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;

	&:hover { background: #374151; }
}

/* AI Entry Card */
.ai-entry-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20px 24px;
	margin-bottom: 24px;
	background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
	border: 1px solid #bfdbfe;
	border-radius: var(--radius-md);
	cursor: pointer;
	transition: all 0.25s ease;

	&:hover {
		border-color: #93c5fd;
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
		transform: translateY(-2px);
	}
}

.ai-entry-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.ai-entry-icon {
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	border-radius: 12px;
	font-size: 24px;
}

.ai-entry-content {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.ai-entry-title {
	font-size: 16px;
	font-weight: 600;
	color: #1e40af;
}

.ai-entry-desc {
	font-size: 13px;
	color: #3b82f6;
}

.ai-entry-btn {
	padding: 10px 20px;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
	border-radius: var(--radius-sm);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;

	&:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
}

/* Grid */
.resume-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 20px;
}

/* Card base */
.resume-card {
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	overflow: hidden;
	background: var(--bg-card);
	aspect-ratio: 210 / 297;
	display: flex;
	flex-direction: column;
	transition: all 0.25s ease;
	cursor: pointer;

	&:hover {
		border-color: rgba(37, 99, 235, 0.4);
		box-shadow: var(--shadow-lg);
		transform: translateY(-3px);
	}
}

/* Create card */
.card-new {
	border-style: dashed;
	border-color: #d1d5db;

	&:hover { border-color: #93c5fd; background: #eff6ff; }
}

.card-new-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	gap: 10px;
	padding: 20px;
	text-align: center;
}

.plus-circle {
	width: 52px;
	height: 52px;
	border-radius: 50%;
	background: #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;

	.card-new:hover & { background: #dbeafe; }
}

.plus-icon { font-size: 22px; color: #6b7280; transition: color 0.2s; .card-new:hover & { color: #2563eb; } }
.card-new-title { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.card-new-desc { font-size: 12px; color: var(--text-muted); }

/* Preview area */
.card-preview {
	flex: 1;
	position: relative;
	overflow: hidden;
	background: #f9fafb;
}

.preview-scaler { pointer-events: none; }
.preview-inner { pointer-events: none; }

/* Gradient fade */
.card-fade {
	position: absolute;
	left: 0; right: 0; bottom: 0;
	height: 55%;
	background: linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 40%, transparent 100%);
	pointer-events: none;
}

/* Title overlay */
.card-overlay {
	position: absolute;
	left: 0; right: 0; bottom: 0;
	padding: 8px 10px 10px;
	z-index: 2;
}

.card-resume-title {
	display: block;
	font-size: 13px;
	font-weight: 600;
	color: var(--text-primary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-meta {
	display: block;
	font-size: 11px;
	color: var(--text-secondary);
	margin-top: 2px;
}

/* Card footer */
.card-footer {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 6px;
	padding: 6px 8px 8px;
	border-top: 1px solid #f3f4f6;
	background: var(--bg-card);
	flex-shrink: 0;
}

.card-btn {
	padding: 5px;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	background: var(--bg-card);
	font-size: 12px;
	color: var(--text-secondary);
	cursor: pointer;
	text-align: center;
	transition: all 0.15s;

	&:hover { background: #f3f4f6; }
}

.card-btn-danger {
	color: var(--danger-color);

	&:hover { background: #fef2f2; border-color: #fca5a5; }
}

/* Delete modal */
.modal-box {
	background: var(--bg-card);
	border-radius: var(--radius-md);
	padding: 28px 28px 20px;
	width: 380px;
	max-width: 90vw;
	box-shadow: var(--shadow-lg);
	animation: slideUp 0.25s ease;
}

.modal-title { display: block; font-size: 17px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
.modal-desc { display: block; font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px; }

.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}

.btn-danger {
	padding: 8px 18px;
	background: var(--danger-color);
	color: #fff;
	border: none;
	border-radius: var(--radius-sm);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;

	&:hover { background: #dc2626; }
}

/* Upload modal */
.upload-modal {
	width: 480px;
}

.upload-area {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12px;
	padding: 40px 20px;
	margin: 20px 0;
	border: 2px dashed #d1d5db;
	border-radius: var(--radius-md);
	background: #f9fafb;
	cursor: pointer;
	transition: all 0.2s;

	&:hover, &.dragging {
		border-color: #3b82f6;
		background: #eff6ff;
	}
}

.upload-icon { font-size: 48px; }
.upload-text { font-size: 14px; color: var(--text-secondary); }
.upload-hint { font-size: 12px; color: var(--text-muted); }

/* Gallery modal */
.gallery-modal {
	width: 90vw;
	max-width: 1000px;
	max-height: 85vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
</style>
