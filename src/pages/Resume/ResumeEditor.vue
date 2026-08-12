<template>
	<div class="workbench-page">
		<!-- ── Header ── -->
		<header class="editor-header">
			<div class="header-left">
				<button
					class="menu-btn"
					:class="{ open: !sidePanelCollapsed }"
					@click="sidePanelCollapsed = !sidePanelCollapsed"
					title="切换设置面板"
					aria-label="切换设置面板"
				>
					<svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
				</button>
				<!-- <button class="back-btn" @click="goBack" title="返回">
					<svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button> -->
				<span class="logo-text" @click="goBack">智简优面</span>
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
					:class="{ saved: saveFlash }"
					:value="resumeTitle"
					@input="handleTitleInput"
					@blur="handleTitleBlur"
					placeholder="简历名称"
					:key="activeResume?.id"
				/>
				<button class="save-btn" :class="{ saved: saveFlash }" @click="handleSave" :disabled="saving">
					<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><path d="M2 2h9l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 2v4H5V2M5 14v-4h6v4" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
					<span class="save-label">{{ saving ? '保存中...' : '保存' }}</span>
				</button>
				<button class="ai-optimize-btn" @click="openAIPanel">
					<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
					<span class="ai-label">AI 优化</span>
				</button>
				<button class="export-btn" @click="exportPdf" :disabled="exportingPdf">
					<svg viewBox="0 0 16 16" fill="none" style="width:14px;height:14px"><path d="M8 2v9M5 8l3 3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
					<span class="export-label">{{ exportingPdf ? '导出中…' : '导出 PDF' }}</span>
				</button>
			</div>
		</header>

		<!-- ── 3-panel body ── -->
		<div class="editor-body" :class="{ 'analysis-open': showAnalysisPanel, 'side-panel-open': !sidePanelCollapsed }">

			<!-- Left: SidePanel -->
			<transition name="slide-left">
				<div v-show="!sidePanelCollapsed" class="panel panel-side" :class="{ 'panel-side--open': !sidePanelCollapsed }">
					<SidePanel />
				</div>
			</transition>

			<!-- Center: EditPanel -->
			<transition name="slide-left">
				<div v-show="!editPanelCollapsed" class="panel panel-edit">
					<EditPanel @ai-optimize="openAIPanel" />
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

		<AIOptimizeAnalysisPanel
			:visible="showAnalysisPanel"
			:apply-module="applyModuleWithPreview"
			:apply-modules="applyModulesWithPreview"
			@close="showAnalysisPanel = false"
			@regenerate="openAIPanel"
			@apply-all="handleApplyAllOptimizations"
			@apply-module="applyModuleWithPreview"
			@option-action="handleAIOptionAction"
		/>

		<FormatPreviewDialog
			v-if="previewState"
			:visible="true"
			:sections="previewState.sections"
			@close="closePreview"
			@apply="confirmPreviewApply"
		/>

		<SaveAsTemplateDialog
			v-model:visible="showSaveTemplate"
			:resume-data="activeResume"
			@saved="handleTemplateSaved"
		/>

		<!-- 全局登录弹窗：token 过期时复用登录弹窗 -->
		<LoginPopup
			:visible="userStore.loginPopupVisible"
			:tip="userStore.tokenExpired ? '登录已过期，请重新登录' : ''"
			@update:visible="userStore.closeLoginPopup()"
			@success="userStore.closeLoginPopup()"
		/>

		<button class="mobile-ai-fab" @click="openAIPanel" aria-label="AI 优化">
			<svg viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
			<span>AI</span>
		</button>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onLoad } from '@dcloudio/uni-app'
import { useResumeStore } from '@/stores/resume'
import { editorResumeToAgentInput } from '@/utils/resume/agentAdapter'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { useCareerIntentStore } from '@/stores/careerIntent'
import { useUserStore } from '@/stores/user'
import { createNewResume } from '@/utils/resume/initialData'
import { normalizeMenuSection } from '@/utils/resume/serializer'
import SidePanel from '@/components/resume/SidePanel.vue'
import EditPanel from '@/components/resume/EditPanel.vue'
import ClassicTemplate from '@/components/resume/ClassicTemplate.vue'
import LoginPopup from '@/components/LoginPopup/LoginPopup.vue'
import AIOptimizeDialog from '@/components/AIOptimize/AIOptimizeDialog.vue'
import ChatDialog from '@/components/AIOptimize/ChatDialog.vue'
import AIOptimizeAnalysisPanel from '@/components/AIOptimize/AIOptimizeAnalysisPanel.vue'
import FormatPreviewDialog from '@/components/AIOptimize/optimization/FormatPreviewDialog.vue'
import SaveAsTemplateDialog from '@/components/TemplateGallery/SaveAsTemplateDialog.vue'

const A4_WIDTH_PX = 794   // 210mm at 96dpi

const store = useResumeStore()
const aiStore = useAIOptimizeStore()
const careerIntentStore = useCareerIntentStore()
const userStore = useUserStore()
// storeToRefs ensures activeResume stays reactive and always reflects latest store state
const { activeResume } = storeToRefs(store)

// Track whether career_profiler has been run for current resume to avoid duplicate calls
const careerProfileRunForId = ref(null)

const sidePanelCollapsed = ref(false)
const editPanelCollapsed = ref(false)
const previewPanelRef = ref(null)
const previewScrollRef = ref(null)
const manualScale = ref(null)  // null = auto-fit
const showSaveTemplate = ref(false)
const showAIDialog = ref(false)
const showChatDialog = ref(false)
const showAnalysisPanel = ref(false)
let pendingModuleIds = []
let aiPanelTask = null

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

// ── AI analysis panel open/close → re-measure ─────────────────────
watch(showAnalysisPanel, () => {
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
	window.addEventListener('beforeunload', handleBeforeUnload)
})

// ── onLoad ────────────────────────────────────────────────────────
	onLoad(async (options) => {
		store.loadFromLocal()

		// 加载当前用户的求职意向提示词
		const userInfo = userStore.userInfo
		const userId = userInfo?.userId || userInfo?.id
		if (userId) {
			careerIntentStore.setUserId(String(userId))
			await careerIntentStore.fetchCareerIntent(String(userId))
		}

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

		// 进入简历页面时，如果有求职意向，先同步到 AI 会话
		if (activeResume.value?.customData?.careerIntent?.targetRole?.trim()) {
			await runCareerProfiler()
		}

		if (aiOptimize === '1') {
			setTimeout(() => aiStore.openPanel(), 500)
		}
	})

onUnmounted(() => {
	resizeObs?.disconnect()
	window.removeEventListener('beforeunload', handleBeforeUnload)
	store.flushSave()
})

function handleBeforeUnload(e) {
	if (!store.hasUnsavedChanges) return
	e.preventDefault()
	e.returnValue = ''
}

// ── Navigation ───────────────────────────────────────────────────
function goBack() {
	const doNav = () =>
		uni.navigateBack({ delta: 1, fail: () => uni.reLaunch({ url: '/pages/Resume/Resume' }) })

	if (store.hasUnsavedChanges) {
		uni.showModal({
			title: '未保存的更改',
			content: '简历有尚未保存的修改，确定要退出吗？',
			confirmText: '退出',
			cancelText: '继续编辑',
			success: (res) => {
				if (res.confirm) doNav()
			},
		})
		return
	}

	// View Transition API：浏览器支持时走过渡，避免页面切换白屏闪烁
	if (typeof document !== 'undefined' && document.startViewTransition) {
		document.startViewTransition(doNav)
	} else {
		doNav()
	}
}

const saving = ref(false)
const saveFlash = ref(false)
const exportingPdf = ref(false)

function getCareerIntentFormData() {
	// 优先从当前简历的 customData 读取，若不存在则 fallback 到用户全局求职意向
	let ci = activeResume.value?.customData?.careerIntent
	if (!ci?.targetRole?.trim() && careerIntentStore.isFilled) {
		ci = {
			targetRole: careerIntentStore.targetRole,
			experienceYear: careerIntentStore.experienceYear,
			targetCities: careerIntentStore.targetCities,
			coreSkills: careerIntentStore.coreSkills,
			extraInfo: careerIntentStore.extraInfo,
		}
	}
	if (!ci?.targetRole?.trim()) return null

	const targetCities = (ci.targetCities || '').split(/[,，]/).map(s => s.trim()).filter(Boolean)
	const coreSkills = (ci.coreSkills || '').split(/[,，]/).map(s => s.trim()).filter(Boolean)

	return {
		targetRole: ci.targetRole.trim(),
		experienceYear: (ci.experienceYear || '').trim(),
		targetCities,
		coreSkills,
		extraInfo: (ci.extraInfo || '').trim()
	}
}

function buildCareerProfileQuery(formData) {
	const parts = []
	if (formData.targetRole) parts.push(`目标岗位：${formData.targetRole}`)
	if (formData.experienceYear) parts.push(`工作年限：${formData.experienceYear}`)
	if (formData.targetCities?.length) parts.push(`目标城市：${formData.targetCities.join('、')}`)
	if (formData.coreSkills?.length) parts.push(`核心技能：${formData.coreSkills.join('、')}`)
	if (formData.extraInfo) parts.push(`补充信息：${formData.extraInfo}`)
	return parts.join('\n')
}

async function runCareerProfiler() {
	const formData = getCareerIntentFormData()
	if (!formData) return { success: false, message: '无求职意向' }

	const userQuery = buildCareerProfileQuery(formData)

	const initRes = await aiStore.initSession(true, userQuery)
	if (!initRes.success) return initRes

	return await aiStore.submitProfile(formData)
}

async function handleSave() {
	if (!activeResume.value) return

	saving.value = true
	try {
		const result = await store.saveActiveToServer()
		if (result?.success) {
			uni.showToast({ title: result.skipped ? '内容未变化' : '保存成功', icon: result.skipped ? 'none' : 'success' })
			saveFlash.value = true
			setTimeout(() => { saveFlash.value = false }, 400)
			// 保存后同步更新求职画像到 AI 会话
			await runCareerProfiler()
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

function openAIPanel() {
	const resume = activeResume.value
	if (!resume || aiPanelTask) return

	// 立即打开右侧面板，避免用户多次点击才出现
	showAnalysisPanel.value = true

	aiPanelTask = (async () => {
		try {
			// 先调用 career_profiler 建立求职画像
			await runCareerProfiler()

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

			// 1. 解析简历（上传 + 简历解析 agent）
			const parseRes = await aiStore.parseExistingResume(resumeText)
			if (!parseRes.success) {
				uni.showToast({ title: parseRes.message || '简历解析失败', icon: 'none' })
				return
			}

			// 2. 运行 agent 链：诊断 + 策略 + 模块优化（agent5）
			// 把弹窗中已粘贴的目标岗位 JD 传给后端，避免用户重复输入
			const optRes = await aiStore.runFullOptimization({
				prompt: '',
				jdText: careerIntentStore.jdText || '',
				moduleIds: pendingModuleIds,
				skipParse: true,
			})
			if (!optRes.success) {
				uni.showToast({ title: optRes.message || '匹配分析失败', icon: 'none' })
			}
		} finally {
			aiPanelTask = null
		}
	})()
}

async function handleChatSubmit(profileData) {
	showChatDialog.value = false

	// 如果聊天中补充了求职意向，回写到简历
	const ci = activeResume.value?.customData?.careerIntent || {}
	if (profileData.targetRole && !ci.targetRole) {
		store.updateCareerIntent({
			targetRole: profileData.targetRole,
			experienceYear: profileData.experienceYear || '',
			targetCities: profileData.targetCities || '',
			coreSkills: profileData.coreSkills || '',
			extraInfo: profileData.extraInfo || ''
		})
	}

	const res = await aiStore.runFullOptimization({
		prompt: Object.entries(profileData).filter(([,v]) => v).map(([k,v]) => `${k}：${v}`).join('\n'),
		jdText: careerIntentStore.jdText || '',
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

async function persistAfterApply() {
	store.saveToLocal()
	await store.saveActiveToServer()
}

const previewState = ref(null)
let previewResolver = null

const moduleLabelMap = {
	basic: '基本信息',
	education: '教育背景',
	experience: '工作经历',
	projects: '项目经历',
	skills: '专业技能',
	summary: '自我评价',
	certifications: '证书资质',
}

function moduleLabel(key) {
	return moduleLabelMap[key] || key
}

function getModuleOriginalHtml(module) {
	const r = activeResume.value
	if (!r) return ''
	switch (module) {
		case 'summary': return r.selfEvaluationContent || ''
		case 'skills': return r.skillContent || ''
		case 'experience': return r.experience?.[0]?.details || ''
		case 'projects': return r.projects?.[0]?.description || ''
		case 'education': return r.education?.[0]?.description || ''
		case 'certifications': return r.customData?.certifications?.[0]?.description || ''
		default: return r.customData?.[module]?.[0]?.description || ''
	}
}

function openFormatPreview(sections) {
	return new Promise((resolve) => {
		previewResolver = resolve
		previewState.value = { sections }
	})
}

function closePreview() {
	if (previewResolver) previewResolver(false)
	previewResolver = null
	previewState.value = null
}

async function confirmPreviewApply(strategy, merged) {
	let count = 0
	for (const item of merged) {
		if (!item?.html) continue
		store.applyOptimizedModule(item.module, item.html)
		count++
	}
	if (count > 0) {
		await persistAfterApply()
		uni.showToast({ title: `成功应用 ${count} 条格式化的优化建议`, icon: 'success' })
	}
	if (previewResolver) previewResolver(true)
	previewResolver = null
	previewState.value = null
}

async function applyModuleWithPreview(module) {
	const item = aiStore.moduleResults?.[module]
	if (!item?.optimized_html) return false
	return openFormatPreview([{
		module,
		label: moduleLabel(module),
		originalHtml: getModuleOriginalHtml(module),
		aiHtml: item.optimized_html,
	}])
}

async function applyModulesWithPreview(modules) {
	const sections = (modules || [])
		.map((m) => {
			const item = aiStore.moduleResults?.[m]
			return {
				module: m,
				label: moduleLabel(m),
				originalHtml: getModuleOriginalHtml(m),
				aiHtml: item?.optimized_html || '',
			}
		})
		.filter((s) => s.aiHtml)
	if (!sections.length) return false
	return openFormatPreview(sections)
}

function handleApplyAllOptimizations() {
	const modules = Object.keys(aiStore.moduleResults || {}).filter((m) => aiStore.moduleResults?.[m]?.optimized_html)
	applyModulesWithPreview(modules)
}

function handleAIOptionAction(option) {
	console.log('[AI Option Action]', option)
	// Parent can extend: e.g. track accepted/ignored issues in a set
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
	if (typeof window === 'undefined' || exportingPdf.value) return
	const el = document.getElementById('resume-preview')
	if (!el) return
	exportingPdf.value = true

	try {
		const styles = Array.from(document.styleSheets)
			.map(sheet => {
				try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n') }
				catch { return '' }
			}).join('\n')

		const html = `<!DOCTYPE html><html><head>
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
</div></body></html>`

		// 用 Blob URL + 隐藏 iframe 异步加载打印文档，避免 document.write 阻塞主线程
		const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
		const url = URL.createObjectURL(blob)
		const iframe = document.createElement('iframe')
		iframe.setAttribute('aria-hidden', 'true')
		iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;'
		iframe.onload = () => {
			setTimeout(() => {
				try {
					iframe.contentWindow.focus()
					iframe.contentWindow.print()
				} catch (e) {
					console.error('[export] 打印失败:', e)
					uni.showToast({ title: '导出失败，请重试', icon: 'none' })
				}
				setTimeout(() => {
					URL.revokeObjectURL(url)
					iframe.remove()
				}, 60000)
			}, 300)
		}
		document.body.appendChild(iframe)
		iframe.src = url
	} catch (e) {
		console.error('[export] 导出异常:', e)
		uni.showToast({ title: '导出失败', icon: 'none' })
	} finally {
		exportingPdf.value = false
	}
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
	height: 56px;
	min-height: 56px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px 0 8px;
	border-bottom: 1px solid var(--border-color);
	background: var(--bg-card);
	z-index: 50;
	flex-shrink: 0;
	gap: 8px;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.menu-btn {
	display: none;
	width: 30px;
	height: 30px;
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
	&.open { color: var(--color-accent-primary); background: var(--color-accent-subtle); }
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
	transition: color 150ms ease, background var(--transition-fast);
	white-space: nowrap;
	position: relative;

	.tab-icon { font-size: 12px; }

	&::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 0;
		height: 2px;
		background: var(--color-accent-primary);
		border-radius: 2px;
		transition: width 150ms ease, left 150ms ease;
	}

	&:hover { 
		background: var(--bg-page); 
		color: var(--text-primary); 
		transform: translateY(-1px);
	}
	&.active { 
		background: var(--color-accent-subtle);
		color: var(--color-accent-primary);
		font-weight: 600;
	}
	&.active::after {
		width: 100%;
		left: 0;
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
		border-color: var(--color-border-focus);
		background: var(--bg-card);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
	}

	&.saved {
		animation: saveFlash 400ms ease;
	}

	@media (max-width: 768px) { display: none; }
}

@keyframes saveFlash {
	0%, 100% { border-color: var(--color-border-subtle); }
	50% { border-color: var(--color-success); box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
}

.export-btn {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 6px 14px;
	background: #2563eb;
	color: #fff;
	border: none;
	border-radius: var(--radius-sm);
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: all var(--transition-fast);
	white-space: nowrap;

	&:hover { 
		background: #1d4ed8; 
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
	}
	&:active { 
		background: #1e40af; 
		transform: translateY(0) scale(0.98);
		transition-duration: 80ms;
	}
	&:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

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
	background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-hover));
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
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}
	&:active { 
		transform: translateY(0) scale(0.98);
		transition-duration: 80ms;
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
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
	}
	&:active { 
		background: #047857;
		transform: translateY(0) scale(0.98);
		transition-duration: 80ms;
	}
	&:disabled { 
		opacity: 0.5; 
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
	&.saved {
		animation: saveFlash 400ms ease;
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
	transition: padding-right 0.3s ease;
}

.editor-body.analysis-open {
	padding-right: 360px;
}

/* ── H5 输入框 pointer-events 修复（仅作用于简历编辑器内部，避免影响全局页面） ── */
:deep(.workbench-page) {
	uni-input,
	uni-textarea,
	uni-input *,
	uni-textarea * {
		pointer-events: auto !important;
	}

	uni-input input,
	uni-textarea textarea,
	.uni-input-input,
	.uni-textarea-textarea {
		pointer-events: auto !important;
		user-select: text !important;
		-webkit-user-select: text !important;
		-moz-user-select: text !important;
		-ms-user-select: text !important;
		cursor: text !important;
	}
}

/* ── Panels ── */
.panel {
	height: 100%;
	overflow: hidden;
	flex-shrink: 0;
}

.panel-side {
	width: 280px;
	border-right: 1px solid var(--border-color);
	background: var(--bg-card);
	transition: width var(--transition-normal), opacity var(--transition-normal);
	overscroll-behavior: contain;
}

.panel-edit {
	width: 340px;
	border-right: 1px solid var(--border-color);
	background: var(--bg-card);
	overflow-y: auto;
	overscroll-behavior: contain;
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
	overscroll-behavior: contain;
	scroll-behavior: smooth;
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
	will-change: transform;
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
	will-change: transform;
	
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

.mobile-ai-fab {
	display: none;
	position: fixed;
	right: 16px;
	bottom: 24px;
	z-index: 80;
	align-items: center;
	gap: 5px;
	padding: 12px 18px;
	border: none;
	border-radius: 9999px;
	background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-hover));
	color: #fff;
	font-size: 13px;
	font-weight: 600;
	box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
	cursor: pointer;
	transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms ease;

	svg { width: 15px; height: 15px; }

	&:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(99, 102, 241, 0.4); }
	&:active { transform: translateY(0) scale(0.97); transition-duration: 80ms; }
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

/* ── Laptop（1024-1279px）：AI 面板作为可折叠抽屉，不挤压正文 ── */
@media (max-width: 1279px) {
	.editor-body.analysis-open {
		padding-right: 0;
	}
}

/* ── Tablet（768-1023px）：左侧面板变为汉堡抽屉 ── */
@media (max-width: 1023px) {
	.menu-btn { display: flex; }

	.panel-side {
		position: fixed;
		top: 56px;
		bottom: 0;
		left: 0;
		width: 280px;
		z-index: 45;
		box-shadow: 8px 0 24px rgba(0, 0, 0, 0.08);
		transform: translateX(-100%);
	}
	.panel-side.panel-side--open {
		transform: translateX(0);
	}

	.slide-left-enter-active,
	.slide-left-leave-active {
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
	}
	.slide-left-enter-from,
	.slide-left-leave-to {
		width: 280px !important;
		transform: translateX(-100%);
		opacity: 0;
	}
	.slide-left-enter-to {
		transform: translateX(0);
	}

	.editor-body.side-panel-open::after {
		content: '';
		position: fixed;
		inset: 56px 0 0 0;
		background: rgba(0, 0, 0, 0.2);
		z-index: 44;
		pointer-events: none;
	}
}

/* ── Mobile（<768px）：单栏预览 + 底部固定 AI 入口 ── */
@media (max-width: 767px) {
	.panel-edit { display: none !important; }
	.mobile-ai-fab { display: flex; }
	.preview-scroll { padding: 16px 12px 96px; }
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
