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
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onLoad } from '@dcloudio/uni-app'
import { useResumeStore } from '@/stores/resume'
import { createNewResume } from '@/utils/resume/initialData'
import SidePanel from '@/components/resume/SidePanel.vue'
import EditPanel from '@/components/resume/EditPanel.vue'
import ClassicTemplate from '@/components/resume/ClassicTemplate.vue'

const A4_WIDTH_PX = 794   // 210mm at 96dpi

const store = useResumeStore()
// storeToRefs ensures activeResume stays reactive and always reflects latest store state
const { activeResume } = storeToRefs(store)

const sidePanelCollapsed = ref(false)
const editPanelCollapsed = ref(false)
const previewPanelRef = ref(null)
const previewScrollRef = ref(null)
const manualScale = ref(null)  // null = auto-fit

const resumeTitle = computed(() => activeResume.value?.title || '未命名简历')
const activeSection = computed(() => activeResume.value?.activeSection || 'basic')

const visibleSections = computed(() =>
	(activeResume.value?.menuSections || [])
		.filter(s => s.enabled)
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

onUnmounted(() => {
	resizeObs?.disconnect()
})

// ── onLoad ────────────────────────────────────────────────────────
onLoad((options) => {
	const loaded = store.loadFromLocal()
	const resumeId = options?.id
	const templateId = options?.templateId

	if (resumeId && store.resumes[resumeId]) {
		store.setActiveResume(resumeId)
		return
	}

	if (!store.activeResume) {
		if (!loaded || !Object.keys(store.resumes).length) {
			const resume = createNewResume({ title: '我的简历' })
			store.resumes[resume.id] = resume
			store.activeResumeId = resume.id
			store.saveToLocal()
		} else {
			store.activeResumeId = Object.keys(store.resumes)[0]
		}
	}

	if (templateId) {
		store.setTemplateId(decodeURIComponent(templateId))
	}
})

// ── Navigation ───────────────────────────────────────────────────
function goBack() {
	uni.navigateBack({ delta: 1, fail: () => uni.reLaunch({ url: '/pages/Resume/Resume' }) })
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
	background: #f9fafb;
}

/* ── Header ──────────────────────────────── */
.editor-header {
	height: 52px;
	min-height: 52px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px 0 8px;
	border-bottom: 1px solid #e5e7eb;
	background: #fff;
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
	color: #6b7280;
	border-radius: 6px;
	cursor: pointer;
	transition: background 0.12s, color 0.12s;

	svg { width: 16px; height: 16px; }
	&:hover { background: #f3f4f6; color: #111827; }
}

.logo-text {
	font-size: 15px;
	font-weight: 700;
	color: #111827;
	cursor: pointer;
	white-space: nowrap;
	transition: color 0.15s;
	&:hover { color: #2563eb; }
}

.divider-v {
	width: 1px;
	height: 16px;
	background: #e5e7eb;
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
	border-radius: 6px;
	font-size: 12px;
	color: #6b7280;
	cursor: pointer;
	transition: background 0.12s, color 0.12s;
	white-space: nowrap;

	.tab-icon { font-size: 12px; }

	&:hover { background: #f3f4f6; color: #374151; }
	&.active { background: #eff6ff; color: #2563eb; font-weight: 600; }

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
	width: 160px;
	padding: 5px 10px;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	font-size: 12.5px;
	color: #111827;
	outline: none;
	background: #f9fafb;
	transition: border-color 0.15s, background 0.15s;

	&:focus { border-color: #93c5fd; background: #fff; }

	@media (max-width: 768px) { display: none; }
}

.export-btn {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 6px 14px;
	background: #111827;
	color: #fff;
	border: none;
	border-radius: 7px;
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: background 0.15s;
	white-space: nowrap;

	&:hover { background: #374151; }
	&:active { background: #1f2937; }

	@media (max-width: 640px) {
		.export-label { display: none; }
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
	border-right: 1px solid #e5e7eb;
	background: #fafafa;
}

.panel-edit {
	width: 340px;
	border-right: 1px solid #e5e7eb;
	background: #fff;
	overflow-y: auto;
}

.panel-preview {
	flex: 1;
	position: relative;
	background: #f0f2f5;
	overflow: hidden;
	min-width: 0;
}

/* Slide transition */
.slide-left-enter-active,
.slide-left-leave-active {
	transition: width 0.22s ease, opacity 0.22s ease;
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
}

.a4-scale-wrap {
	flex-shrink: 0;
	transform-origin: top center;
}

.a4-paper {
	background: #fff;
	box-shadow:
		0 1px 3px rgba(0,0,0,0.08),
		0 8px 32px rgba(0,0,0,0.10),
		0 0 0 1px rgba(0,0,0,0.04);
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
	border: 1px solid #e5e7eb;
	border-radius: 9999px;
	box-shadow: 0 4px 20px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06);
	z-index: 20;
	white-space: nowrap;
}

.dock-btn {
	width: 30px;
	height: 30px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	color: #6b7280;
	border-radius: 50%;
	cursor: pointer;
	transition: background 0.12s, color 0.12s;

	svg { width: 14px; height: 14px; }

	&:hover { background: #f3f4f6; color: #111827; }
	&.active { background: #eff6ff; color: #2563eb; }
}

.dock-divider {
	width: 1px;
	height: 16px;
	background: #e5e7eb;
	margin: 0 3px;
}

.dock-zoom-label {
	font-size: 11px;
	font-weight: 600;
	color: #6b7280;
	min-width: 34px;
	text-align: center;
}
</style>
