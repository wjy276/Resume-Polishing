<template>
	<div class="workbench-page">
		<!-- ── Header ── -->
		<header class="editor-header">
			<div class="header-left">
				<button class="back-btn" @click="goBack" title="返回">
					<svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
				<span class="logo-text" @click="goBack">魔方简历</span>
				<div class="divider-v" />
				<div class="backup-badge">
					<svg viewBox="0 0 14 14" fill="none" style="width:11px;height:11px"><circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
					本地存储
				</div>
			</div>

			<!-- Center: section tabs (visible on ≥ 960px) -->
			<div class="header-tabs">
				<button
					v-for="s in visibleSections"
					:key="s.id"
					class="header-tab"
					:class="{ active: activeSection === s.id }"
					@click="store.setActiveSection(s.id)"
				>
					<span class="tab-icon">{{ s.icon }}</span>
					<span class="tab-label">{{ s.title }}</span>
				</button>
			</div>

			<div class="header-right">
				<input
					class="title-input"
					:value="resumeTitle"
					@input="handleTitleInput"
					@blur="handleTitleBlur"
					placeholder="简历名称"
					:key="activeResume?.id"
				/>
				<button class="save-btn" @click="handleSave" :disabled="saving">
					<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><path d="M2 2h9l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 2v4H5V2M5 14v-4h6v4" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
					<span class="save-label">{{ saving ? '保存中...' : '保存' }}</span>
				</button>
				<button class="ai-optimize-btn" @click="openAIPanel">
					<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
					<span class="ai-label">AI 优化</span>
				</button>
				<button class="export-btn" @click="exportPdf">
					<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
					<span class="export-label">导出 PDF</span>
				</button>
			</div>
		</header>

		<!-- ── 3-panel body ── -->
		<div class="editor-body">

			<!-- Left: SidePanel -->
			<transition name="slide-left">
				<div v-show="!sidePanelCollapsed" class="panel panel-side">
					<SidePanel />
				</div>
			</transition>

			<!-- Center: EditPanel -->
			<transition name="slide-left">
				<div v-show="!editPanelCollapsed" class="panel panel-edit">
					<EditPanel />
				</div>
			</transition>

			<!-- Right: Preview (always rendered for PDF export) -->
			<div class="panel panel-preview" ref="previewPanelRef">
				<div class="preview-scroll" ref="previewScrollRef">
					<div
						class="a4-scale-wrap"
						:style="a4ScaleWrapStyle"
					>
						<div
							id="resume-preview"
							class="a4-paper"
							:style="paperStyle"
						>
							<ClassicTemplate
								v-if="activeResume"
								:data="activeResume"
								:variant="activeTemplateId"
							/>
						</div>
					</div>
				</div>

				<!-- Floating layout controls -->
				<div class="layout-dock">
					<button
						class="dock-btn"
						:class="{ active: sidePanelCollapsed }"
						@click="sidePanelCollapsed = !sidePanelCollapsed"
						title="设置面板"
					>
						<svg viewBox="0 0 16 16" fill="none"><rect x="1.5" y="1.5" width="5" height="13" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="1.5" width="5.5" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="10" width="5.5" height="4.5" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>
					</button>
					<div class="dock-divider" />
					<button
						class="dock-btn"
						:class="{ active: editPanelCollapsed }"
						@click="editPanelCollapsed = !editPanelCollapsed"
						title="编辑面板"
					>
						<svg viewBox="0 0 16 16" fill="none"><path d="M2 12.5L4.5 10 11 3.5l2 2-6.5 6.5L4 14l-2-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 5.5l2 2" stroke="currentColor" stroke-width="1.3"/></svg>
					</button>
					<div class="dock-divider" />
					<span class="dock-zoom-label">{{ Math.round(previewScale * 100) }}%</span>
					<button class="dock-btn" @click="adjustZoom(-0.1)" title="缩小">
						<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
					</button>
					<button class="dock-btn" @click="adjustZoom(0.1)" title="放大">
						<svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
					</button>
					<button class="dock-btn" @click="resetZoom" title="适应宽度">
						<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="0.8" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="2" width="5" height="5" rx="0.8" stroke="currentColor" stroke-width="1.4"/><rect x="2" y="9" width="5" height="5" rx="0.8" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="9" width="5" height="5" rx="0.8" stroke="currentColor" stroke-width="1.4"/></svg>
					</button>
				</div>
			</div>
		</div>

		<AIOptimizeDialog
			:visible="showAIDialog"
			@close="showAIDialog = false"
		/>
		<ChatDialog
			:visible="showChatDialog"
			@close="showChatDialog = false"
			@submit="handleChatSubmit"
		/>

		<SaveAsTemplateDialog
			v-model:visible="showSaveTemplate"
			:resume-data="activeResume"
			@saved="handleTemplateSaved"
		/>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onLoad } from '@dcloudio/uni-app'
import { useResumeStore } from '@/stores/resume'
import { editorResumeToAgentInput } from '@/utils/resume/agentAdapter'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { createNewResume } from '@/utils/resume/initialData'
import { normalizeMenuSection } from '@/utils/resume/serializer'
import SidePanel from '@/components/resume/SidePanel.vue'
import EditPanel from '@/components/resume/EditPanel.vue'
import ClassicTemplate from '@/components/resume/ClassicTemplate.vue'
import AIOptimizeDialog from '@/components/AIOptimize/AIOptimizeDialog.vue'
import ChatDialog from '@/components/AIOptimize/ChatDialog.vue'
import SaveAsTemplateDialog from '@/components/TemplateGallery/SaveAsTemplateDialog.vue'

const A4_WIDTH_PX = 794   // 210mm at 96dpi

const store = useResumeStore()
const aiStore = useAIOptimizeStore()
// storeToRefs ensures activeResume stays reactive and always reflects latest store state
const { activeResume } = storeToRefs(store)

const sidePanelCollapsed = ref(false)
const editPanelCollapsed = ref(false)
const previewPanelRef = ref(null)
const previewScrollRef = ref(null)
const manualScale = ref(null)  // null = auto-fit
const showSaveTemplate = ref(false)
const showAIDialog = ref(false)
const showChatDialog = ref(false)
let pendingModuleIds = []

const resumeTitle = computed(() => activeResume.value?.title || '未命名简历')
const activeSection = computed(() => activeResume.value?.activeSection || 'basic')

const visibleSections = computed(() =>
	(activeResume.value?.menuSections || [])
		.map(s => normalizeMenuSection(s))
		.filter(s => s && s.enabled)
		.sort((a, b) => a.order - b.order)
)

const gs = computed(() => activeResume.value?.globalSettings || {})
const activeTemplateId = computed(() => activeResume.value?.templateId || 'classic')

// ── Preview scaling ──────────────────────────────────────────────
const previewPanelWidth = ref(800)

function measurePreviewPanel() {
	if (previewPanelRef.value) {
		previewPanelWidth.value = previewPanelRef.value.clientWidth
	}
}

const autoScale = computed(() => {
	const avail = previewPanelWidth.value - 48  // 24px padding each side
	return Math.min(1, avail / A4_WIDTH_PX)
})

const previewScale = computed(() => manualScale.value ?? autoScale.value)

const a4ScaleWrapStyle = computed(() => {
	const s = previewScale.value
	return {
		width: `${A4_WIDTH_PX}px`,
		height: `${A4_WIDTH_PX * (297 / 210)}px`,
		transform: `scale(${s})`,
		transformOrigin: 'top center',
		marginBottom: `${A4_WIDTH_PX * (297 / 210) * (s - 1)}px`,
	}
})

const paperStyle = computed(() => ({
	width: `${A4_WIDTH_PX}px`,
	minHeight: `${A4_WIDTH_PX * (297 / 210)}px`,
	padding: `${gs.value.pagePadding ?? 32}px`,
	fontFamily: gs.value.fontFamily === 'default' ? 'inherit' : gs.value.fontFamily,
	background: '#fff',
	boxSizing: 'border-box',
}))

function adjustZoom(delta) {
	const current = previewScale.value
	manualScale.value = Math.min(1.5, Math.max(0.3, +(current + delta).toFixed(1)))
}

function resetZoom() {
	manualScale.value = null
}

// ── Panel collapse watch → re-measure ────────────────────────────
watch([sidePanelCollapsed, editPanelCollapsed], () => {
	nextTick(measurePreviewPanel)
})

// ── Resize observer ──────────────────────────────────────────────
let resizeObs = null

onMounted(() => {
	measurePreviewPanel()
	if (typeof ResizeObserver !== 'undefined' && previewPanelRef.value) {
		resizeObs = new ResizeObserver(() => measurePreviewPanel())
		resizeObs.observe(previewPanelRef.value)
	}
	// Collapse side panel on narrow screens
	if (window.innerWidth < 1200) sidePanelCollapsed.value = true
	if (window.innerWidth < 900) editPanelCollapsed.value = true
})

// ── onLoad ────────────────────────────────────────────────────────
onLoad(async (options) => {
	store.loadFromLocal()
	const resumeId = options?.id
	const templateId = options?.templateId
	const aiOptimize = options?.aiOptimize

	if (resumeId) {
		store.setActiveResume(resumeId)
		const token = uni.getStorageSync('token')
		if (token) {
			const result = await store.loadResumeFromServer(resumeId)
			if (!result.success && !store.resumes[resumeId]) {
				uni.showToast({ title: result.message || '简历不存在', icon: 'none' })
				setTimeout(() => goBack(), 1200)
				return
			}
		} else if (!store.resumes[resumeId]) {
			uni.showToast({ title: '简历不存在', icon: 'none' })
			setTimeout(() => goBack(), 1200)
			return
		}
	} else if (!store.activeResume) {
		const keys = Object.keys(store.resumes)
		if (keys.length) {
			store.activeResumeId = keys[0]
		} else {
			const result = await store.createResumeOnServer({ title: '我的简历' })
			if (!result.success) {
				const resume = createNewResume({ title: '我的简历' })
				store.resumes[resume.id] = resume
				store.activeResumeId = resume.id
				store.saveToLocal()
			}
		}
	}

	if (templateId) {
		store.setTemplateId(decodeURIComponent(templateId))
	}

	if (aiOptimize === '1') {
		setTimeout(() => aiStore.openPanel(), 500)
	}
})

onUnmounted(() => {
	resizeObs?.disconnect()
	store.flushSave()
})

// ── Navigation ───────────────────────────────────────────────────
function goBack() {
	uni.navigateBack({ delta: 1, fail: () => uni.reLaunch({ url: '/pages/Resume/Resume' }) })
}

const saving = ref(false)

async function handleSave() {
	if (!activeResume.value) return
	
	saving.value = true
	try {
		const result = await store.saveActiveToServer()
		if (result?.success) {
			uni.showToast({ title: '保存成功', icon: 'success' })
		} else {
			uni.showToast({ title: result?.message || '保存失败', icon: 'none' })
		}
	} catch (e) {
		console.error('保存失败:', e)
		uni.showToast({ title: '保存失败', icon: 'none' })
	} finally {
		saving.value = false
	}
}

async function openAIPanel() {
	const resume = activeResume.value
	if (!resume) return

	const agentInput = editorResumeToAgentInput(resume)
	const textParts = []
	if (agentInput.name) textParts.push(`姓名：${agentInput.name}`)
	if (agentInput.title) textParts.push(`求职意向：${agentInput.title}`)
	if (agentInput.education?.length) {
		textParts.push('\n【教育背景】')
		agentInput.education.forEach(e => textParts.push(`${e.school} ${e.major} ${e.degree}`))
	}
	if (agentInput.experience?.length) {
		textParts.push('\n【工作经历】')
		agentInput.experience.forEach(e => textParts.push(`${e.company} ${e.position} ${e.date}\n${e.details}`))
	}
	if (agentInput.projects?.length) {
		textParts.push('\n【项目经历】')
		agentInput.projects.forEach(p => textParts.push(`${p.name}\n${p.description}`))
	}
	if (agentInput.skills) textParts.push(`\n【技能】\n${agentInput.skills}`)
	if (agentInput.selfEvaluation) textParts.push(`\n【自我评价】\n${agentInput.selfEvaluation}`)
	const resumeText = textParts.join('\n')

	const sections = resume?.menuSections || []
	pendingModuleIds = sections.filter(s => s.enabled && s.id !== 'basic').map(s => s.id)

	const parseRes = await aiStore.parseExistingResume(resumeText)
	if (!parseRes.success) {
		return
	}

	showChatDialog.value = true
}

async function handleChatSubmit(profileData) {
	showChatDialog.value = false

	const res = await aiStore.runFullOptimization({
		prompt: Object.entries(profileData).filter(([,v]) => v).map(([k,v]) => `${k}：${v}`).join('\n'),
		jdText: '',
		moduleIds: pendingModuleIds,
		skipParse: true,
	})

	if (res.success) {
		showAIDialog.value = true
	}
}

function handleTemplateSaved() {
	uni.showToast({ title: '模板已保存', icon: 'success' })
}

function handleTitleInput(e) {
	store.updateResumeTitle(e?.target?.value ?? '')
}

function handleTitleBlur(e) {
	const value = (e?.target?.value || '').trim()
	if (!value) {
		store.updateResumeTitle('未命名简历')
	}
}

// ── PDF export ───────────────────────────────────────────────────
function exportPdf() {
	if (typeof window === 'undefined') return
	const el = document.getElementById('resume-preview')
	if (!el) return

	const styles = Array.from(document.styleSheets)
		.map(sheet => {
			try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n') }
			catch { return '' }
		}).join('\n')

	const win = window.open('', '_blank')
	if (!win) { uni.showToast({ title: '请允许弹出窗口', icon: 'none' }); return }

	win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>${resumeTitle.value}</title>
<style>
  *{box-sizing:border-box;}
  body{margin:0;padding:0;background:#fff;}
  @page{size:A4;margin:0;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
  ${styles}
</style></head><body>
<div style="width:210mm;min-height:297mm;padding:${gs.value.pagePadding ?? 32}px;font-family:${gs.value.fontFamily === 'default' ? 'inherit' : (gs.value.fontFamily || 'inherit')}">
${el.innerHTML}
</div></body></html>`)
	win.document.close()
	setTimeout(() => { win.focus(); win.print() }, 700)
}
</script>

<style scoped lang="scss">
.workbench-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;
	background: var(--bg-page);
}

/* ── Header ──────────────────────────────── */
.editor-header {
	height: 52px;
	min-height: 52px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px 0 8px;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-card);
	z-index: 30;
	flex-shrink: 0;
	gap: 8px;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.back-btn {
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	color: var(--text-secondary);
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition: background var(--transition-fast), color var(--transition-fast), transform 0.1s ease;

	svg { width: 16px; height: 16px; }
	&:hover { background: var(--bg-page); color: var(--text-primary); }
	&:active { transform: scale(0.95); }
}

.logo-text {
	font-size: 15px;
	font-weight: 700;
	color: var(--text-primary);
	cursor: pointer;
	white-space: nowrap;
	transition: color var(--transition-fast), transform 0.1s ease;
	&:hover { color: var(--primary-light); }
	&:active { transform: scale(0.98); }
}

.divider-v {
	width: 1px;
	height: 16px;
	background: var(--border-color);
	flex-shrink: 0;
}

.backup-badge {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 2px 8px;
	border-radius: 9999px;
	font-size: 10.5px;
	font-weight: 500;
	border: 1px solid #fcd34d;
	background: #fffbeb;
	color: #92400e;
	white-space: nowrap;
	cursor: default;
	transition: all var(--transition-fast);
	
	&:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}
}

/* Center tabs */
.header-tabs {
	display: flex;
	align-items: center;
	gap: 2px;
	flex: 1;
	justify-content: center;
	overflow: hidden;
	padding: 0 8px;

	@media (max-width: 900px) { display: none; }
}

.header-tab {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	border: none;
	background: transparent;
	border-radius: var(--radius-sm);
	font-size: 12px;
	color: var(--text-secondary);
	cursor: pointer;
	transition: all var(--transition-fast);
	white-space: nowrap;
	position: relative;

	.tab-icon { font-size: 12px; }

	&:hover { 
		background: var(--bg-page); 
		color: var(--text-primary); 
		transform: translateY(-1px);
	}
	&.active { 
		background: rgba(37, 99, 235, 0.1); 
		color: var(--primary-light); 
		font-weight: 600;
		box-shadow: inset 0 1px 2px rgba(37, 99, 235, 0.1);
	}

	@media (max-width: 1100px) {
		.tab-label { display: none; }
		.tab-icon { font-size: 14px; }
	}
}

.header-right {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.title-input {
	width: 168px;
	min-height: 40px;
	padding: 10px 12px;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-sm);
	font-size: 14px;
	line-height: 1.45;
	color: var(--text-primary);
	outline: none;
	background: var(--bg-page);
	box-sizing: border-box;
	transition: all var(--transition-fast);

	&:focus {
		border-color: var(--primary-light);
		background: var(--bg-card);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
	}

	@media (max-width: 768px) { display: none; }
}

.export-btn {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 6px 14px;
	background: var(--text-primary);
	color: #fff;
	border: none;
	border-radius: var(--radius-sm);
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: all var(--transition-fast);
	white-space: nowrap;

	&:hover { 
		background: #374151; 
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}
	&:active { 
		background: #1f2937; 
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.export-label { display: none; }
		padding: 6px 10px;
	}
}

.ai-optimize-btn {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 6px 14px;
	background: linear-gradient(135deg, var(--primary-light), #3b82f6);
	color: #fff;
	border: none;
	border-radius: var(--radius-sm);
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: all var(--transition-fast);
	white-space: nowrap;
	position: relative;
	overflow: hidden;

	&:hover { 
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	}
	&:active { 
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.ai-label { display: none; }
		padding: 6px 10px;
	}
}

.save-template-btn {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 6px 14px;
	background: var(--bg-card);
	color: #374151;
	border: 1px solid #d1d5db;
	border-radius: var(--radius-sm);
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: all var(--transition-fast);
	white-space: nowrap;

	&:hover { 
		background: var(--bg-page); 
		border-color: #9ca3af;
		transform: translateY(-1px);
	}
	&:active { 
		background: var(--border-color);
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.template-label { display: none; }
		padding: 6px 10px;
	}
}

.save-btn {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 6px 14px;
	background: var(--success-color);
	color: #fff;
	border: none;
	border-radius: var(--radius-sm);
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: all var(--transition-fast);
	white-space: nowrap;

	&:hover { 
		background: #059669; 
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}
	&:active { 
		background: #047857;
		transform: translateY(0);
	}
	&:disabled { 
		opacity: 0.5; 
		cursor: not-allowed;
		transform: none;
	}

	@media (max-width: 640px) {
		.save-label { display: none; }
		padding: 6px 10px;
	}
}

/* ── Editor body ──────────────────────────── */
.editor-body {
	flex: 1;
	display: flex;
	overflow: hidden;
	min-height: 0;
}

/* ── Panels ── */
.panel {
	height: 100%;
	overflow: hidden;
	flex-shrink: 0;
}

.panel-side {
	width: 256px;
	border-right: 1px solid var(--border-color);
	background: #fafafa;
	transition: width var(--transition-normal), opacity var(--transition-normal);
}

.panel-edit {
	width: 340px;
	border-right: 1px solid var(--border-color);
	background: var(--bg-card);
	overflow-y: auto;
	transition: width var(--transition-normal), opacity var(--transition-normal);
}

.panel-preview {
	flex: 1;
	position: relative;
	background: var(--bg-page);
	overflow: hidden;
	min-width: 0;
}

/* Slide transition */
.slide-left-enter-active,
.slide-left-leave-active {
	transition: width var(--transition-normal), opacity var(--transition-normal);
	overflow: hidden;
}
.slide-left-enter-from,
.slide-left-leave-to {
	width: 0 !important;
	opacity: 0;
}

/* ── Preview scroll ── */
.preview-scroll {
	height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 28px 0 80px;
	scrollbar-width: thin;
	scrollbar-color: #d1d5db transparent;
	
	&::-webkit-scrollbar {
		width: 5px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 10px;
	}
	&::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}
}

.a4-scale-wrap {
	flex-shrink: 0;
	transform-origin: top center;
	transition: transform 0.2s ease;
}

.a4-paper {
	background: var(--bg-card);
	box-shadow:
		0 1px 3px rgba(0,0,0,0.08),
		0 8px 32px rgba(0,0,0,0.10),
		0 0 0 1px rgba(0,0,0,0.04);
	transition: box-shadow 0.3s ease;
	
	&:hover {
		box-shadow:
			0 1px 3px rgba(0,0,0,0.12),
			0 12px 40px rgba(0,0,0,0.15),
			0 0 0 1px rgba(0,0,0,0.06);
	}
}

/* ── Floating dock ── */
.layout-dock {
	position: absolute;
	bottom: 20px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	align-items: center;
	gap: 2px;
	padding: 5px 8px;
	background: rgba(255,255,255,0.95);
	backdrop-filter: blur(12px);
	border: 1px solid var(--border-color);
	border-radius: 9999px;
	box-shadow: var(--shadow-md);
	z-index: 20;
	white-space: nowrap;
	transition: all var(--transition-fast);
	
	&:hover {
		box-shadow: var(--shadow-lg);
		transform: translateX(-50%) translateY(-2px);
	}
}

.dock-btn {
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	color: var(--text-secondary);
	border-radius: 50%;
	cursor: pointer;
	transition: all var(--transition-fast);

	svg { width: 14px; height: 14px; }

	&:hover { 
		background: var(--bg-page); 
		color: var(--text-primary);
		transform: scale(1.1);
	}
	&.active { 
		background: rgba(37, 99, 235, 0.1); 
		color: var(--primary-light);
	}
}

.dock-divider {
	width: 1px;
	height: 16px;
	background: var(--border-color);
	margin: 0 3px;
}

.dock-zoom-label {
	font-size: 11px;
	font-weight: 600;
	color: var(--text-secondary);
	min-width: 34px;
	text-align: center;
}

/* ── Responsive ── */
@media (max-width: 1200px) {
	.panel-side {
		width: 220px;
	}
	.panel-edit {
		width: 300px;
	}
}

@media (max-width: 900px) {
	.editor-header {
		padding: 0 8px;
	}
	
	.title-input {
		width: 120px;
	}
}
</style>