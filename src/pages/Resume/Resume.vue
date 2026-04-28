<template>
	<view class="resume-page">
		<Sidebar />

		<view class="main-content">
			<!-- Alert banner -->
			<view class="alert-banner alert-warn">
				<text class="alert-icon">⚠</text>
				<view class="alert-body">
					<text class="alert-title">建议尽快配置同步备份</text>
					<text class="alert-desc">简历数据仅保存在本地，清除浏览器数据可能导致丢失</text>
				</view>
				<button class="alert-action" @click="goToSettings">前往设置</button>
			</view>

			<!-- Title row -->
			<view class="title-row">
				<text class="page-title">我的简历</text>
				<view class="title-actions">
					<button class="btn-outline" @click="showImportTip">
						<text>⬆ 导入简历</text>
					</button>
					<button class="btn-primary" @click="createResume">
						<text>＋ 新建简历</text>
					</button>
				</view>
			</view>

			<!-- Resume grid -->
			<view class="resume-grid">
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
					<!-- Mini preview -->
					<view class="card-preview" ref="cardRefs" @click="editResume(resume.id)">
						<view class="preview-scaler" :style="scalerStyle(resume)">
							<div class="preview-inner" :style="previewInnerStyle(resume)">
								<ClassicTemplate :data="resume" />
							</div>
						</view>
						<!-- Gradient fade at bottom -->
						<view class="card-fade" />
						<!-- Title overlay -->
						<view class="card-overlay">
							<text class="card-resume-title">{{ resume.title || '未命名简历' }}</text>
							<text class="card-meta">经典模板 · {{ formatDate(resume.createdAt) }}</text>
						</view>
					</view>

					<!-- Footer actions -->
					<view class="card-footer">
						<button class="card-btn" @click="editResume(resume.id)">编辑</button>
						<button class="card-btn card-btn-danger" @click="confirmDelete(resume)">删除</button>
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
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import ClassicTemplate from '@/components/resume/ClassicTemplate.vue'
import { useResumeStore } from '@/stores/resume'

const store = useResumeStore()
const deleteTarget = ref(null)

// card width for scaling; roughly 200px per card column
const CARD_PREVIEW_WIDTH = 200
const A4_WIDTH_PX = 793.7

const allResumes = computed(() => store.allResumes)

onLoad(() => {
	store.loadFromLocal()
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

function createResume() {
	const id = store.createResume({ title: `新建简历 ${Object.keys(store.resumes).length + 1}` })
	uni.navigateTo({ url: `/pages/Resume/ResumeEditor?id=${id}` })
}

function editResume(id) {
	store.setActiveResume(id)
	uni.navigateTo({ url: `/pages/Resume/ResumeEditor?id=${id}` })
}

function confirmDelete(resume) {
	deleteTarget.value = resume
}

function doDelete() {
	if (deleteTarget.value) {
		store.deleteResume(deleteTarget.value.id)
		deleteTarget.value = null
	}
}

function goToSettings() {
	uni.showToast({ title: '设置功能开发中', icon: 'none' })
}

function showImportTip() {
	uni.showToast({ title: '导入功能开发中', icon: 'none' })
}
</script>

<style scoped lang="scss">
.resume-page {
	display: flex;
	height: 100vh;
	background: #f9fafb;
	overflow: hidden;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 0 32px 40px;
	overflow-y: auto;
	min-width: 0;
}

/* Alert */
.alert-banner {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 16px;
	border-radius: 8px;
	border: 1px solid;
	margin: 20px 0 0;
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
	border-radius: 5px;
	padding: 4px 12px;
	font-size: 12px;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;

	&:hover { background: #fee2e2; }
}

/* Title row */
.title-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 28px 0 20px;
}

.page-title {
	font-size: 28px;
	font-weight: 700;
	color: #111827;
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
	padding: 7px 16px;
	border: 1px solid #d1d5db;
	border-radius: 7px;
	background: #fff;
	font-size: 13px;
	color: #374151;
	cursor: pointer;
	transition: all 0.15s;

	&:hover { border-color: #9ca3af; background: #f9fafb; }
}

.btn-primary {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 7px 16px;
	background: #111827;
	color: #fff;
	border: none;
	border-radius: 7px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;

	&:hover { background: #1f2937; }
}

/* Grid */
.resume-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 20px;
}

/* Card base */
.resume-card {
	border: 1px solid #e5e7eb;
	border-radius: 10px;
	overflow: hidden;
	background: #fff;
	aspect-ratio: 210 / 297;
	display: flex;
	flex-direction: column;
	transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
	cursor: pointer;

	&:hover {
		border-color: rgba(37, 99, 235, 0.4);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}
}

/* Create card */
.card-new {
	border-style: dashed;

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
	transition: background 0.15s;

	.card-new:hover & { background: #dbeafe; }
}

.plus-icon { font-size: 22px; color: #6b7280; .card-new:hover & { color: #2563eb; } }

.card-new-title { font-size: 14px; font-weight: 600; color: #111827; }

.card-new-desc { font-size: 12px; color: #9ca3af; }

/* Preview area */
.card-preview {
	flex: 1;
	position: relative;
	overflow: hidden;
	background: #f9fafb;
}

.preview-scaler {
	pointer-events: none;
}

.preview-inner {
	pointer-events: none;
}

/* Gradient fade */
.card-fade {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	height: 55%;
	background: linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 40%, transparent 100%);
	pointer-events: none;
}

/* Title overlay at bottom of preview */
.card-overlay {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 8px 10px 10px;
	z-index: 2;
}

.card-resume-title {
	display: block;
	font-size: 13px;
	font-weight: 600;
	color: #111827;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-meta {
	display: block;
	font-size: 11px;
	color: #6b7280;
	margin-top: 2px;
}

/* Card footer */
.card-footer {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 6px;
	padding: 6px 8px 8px;
	border-top: 1px solid #f3f4f6;
	background: #fff;
	flex-shrink: 0;
}

.card-btn {
	padding: 5px;
	border: 1px solid #e5e7eb;
	border-radius: 5px;
	background: #fff;
	font-size: 12px;
	color: #374151;
	cursor: pointer;
	text-align: center;
	transition: background 0.15s;

	&:hover { background: #f3f4f6; }
}

.card-btn-danger {
	color: #ef4444;

	&:hover { background: #fef2f2; border-color: #fca5a5; }
}

/* Delete modal */
.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.45);
	z-index: 100;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-box {
	background: #fff;
	border-radius: 12px;
	padding: 28px 28px 20px;
	width: 380px;
	max-width: 90vw;
	box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
}

.modal-title { display: block; font-size: 17px; font-weight: 700; color: #111827; margin-bottom: 10px; }

.modal-desc { display: block; font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 20px; }

.modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
}

.btn-danger {
	padding: 7px 18px;
	background: #ef4444;
	color: #fff;
	border: none;
	border-radius: 6px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;

	&:hover { background: #dc2626; }
}

@media (max-width: 1200px) {
	.main-content { margin-left: 240px; }
}
</style>
