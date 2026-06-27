/**
 * 简历 Store — 完全重写版（setup-style + reactive + deep watch）
 *
 * 设计原则：
 *   1. 简历对象本身是 reactive，编辑器/预览都直接读写它的属性 → 天然实时响应。
 *   2. v-model 直接绑 store.activeResume.basic.name 这种路径，不再走 action 包装。
 *   3. 持久化通过对 resumes 的 deep watch + 300ms debounce 自动完成。
 *   4. 多简历切换通过替换 activeResumeId 实现，模板 ref 不变。
 */

import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'
import { createBlankResume, createNewResume, generateId } from '@/utils/resume/initialData'
import { toApiPayload, fromApiResponse, mergeMenuSections, mergeResumeWithDraft } from '@/utils/resume/serializer'
import {
	fetchResumeList,
	fetchResumeDetail,
	createResumeApi,
	updateResumeApi,
	deleteResumeApi,
} from '@/api/resume'

const STORAGE_KEY = 'magic_resume_store'
const SAVE_DEBOUNCE_MS = 800
const API_SAVE_DEBOUNCE_MS = 1200

// AI 优化结果回写时用的模块字段映射
export const SECTION_FIELD_MAP = {
	skills:         { type: 'top', field: 'skillContent' },
	selfEvaluation: { type: 'top', field: 'selfEvaluationContent' },
	experience:     { type: 'list', field: 'experience', html: 'details' },
	projects:       { type: 'list', field: 'projects', html: 'description' },
	education:      { type: 'list', field: 'education', html: 'description' },
}

export const useResumeStore = defineStore('resume', () => {
	// ════════════════════════════════════════════════════════════════
	// 1. 状态
	// ════════════════════════════════════════════════════════════════
	const resumes = reactive({}) // { [id]: ResumeData }
	const activeResumeId = ref(null)
	const listLoading = ref(false)
	const saving = ref(false)
	const syncError = ref('')

	// ════════════════════════════════════════════════════════════════
	// 2. 派生
	// ════════════════════════════════════════════════════════════════
	/**
	 * 当前简历 —— 返回的是 reactive 原对象（不是 clone）。
	 * 组件做 v-model="store.activeResume.basic.name" 即可直接读写。
	 */
	const activeResume = computed(() =>
		activeResumeId.value ? resumes[activeResumeId.value] || null : null
	)

	const allResumes = computed(() =>
		Object.values(resumes).sort(
			(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
	)

	// ════════════════════════════════════════════════════════════════
	// 3. CRUD —— 只做"新增/删除/切换"这种不能用 v-model 解决的事
	//    具体字段的修改全部交给 v-model 直接干，store 不再写一堆 update*
	// ════════════════════════════════════════════════════════════════
	function _hasToken() {
		return !!uni.getStorageSync('token')
	}

	function _replaceAllResumes(list) {
		Object.keys(resumes).forEach((k) => { delete resumes[k] })
		for (const r of list) {
			if (r?.id) resumes[r.id] = r
		}
	}

	function _normalizeResumeMenu(resume) {
		if (!resume) return resume
		if (resume.menuSections?.length) {
			resume.menuSections = mergeMenuSections(resume.menuSections)
		}
		return resume
	}

	function _upsertResume(resume) {
		if (!resume?.id) return
		resumes[resume.id] = _normalizeResumeMenu(resume)
	}

	/** 仅本地创建（未登录降级） */
	function createResume(overrides = {}) {
		const r = createNewResume(overrides)
		resumes[r.id] = r
		activeResumeId.value = r.id
		return r.id
	}

	/** 从后端拉取简历列表 */
	async function fetchAllFromServer() {
		if (!_hasToken()) {
			loadFromLocal()
			return { success: false, message: '请先登录' }
		}

		listLoading.value = true
		syncError.value = ''
		hydrated = false

		try {
			const res = await fetchResumeList({ pageNum: 1, pageSize: 100 })
			if (!res.ok) {
				syncError.value = res.message || '加载失败'
				loadFromLocal()
				return { success: false, message: syncError.value }
			}

			const records = res.data?.records || (Array.isArray(res.data) ? res.data : [])
			const mapped = records
				.map((row) => fromApiResponse(row))
				.filter(Boolean)

			_replaceAllResumes(mapped)
			if (!activeResumeId.value && mapped.length) {
				activeResumeId.value = mapped[0].id
			}
			_performSave()
			hydrated = true
			return { success: true, count: mapped.length }
		} catch (e) {
			console.error('fetchAllFromServer:', e)
			syncError.value = '加载简历失败'
			loadFromLocal()
			return { success: false, message: syncError.value }
		} finally {
			listLoading.value = false
		}
	}

	/** 创建简历并同步到后端 */
	async function createResumeOnServer(overrides = {}) {
		const draft = createBlankResume({
			title: overrides.title || `新建简历 ${Object.keys(resumes).length + 1}`,
			templateId: overrides.templateId || 'classic',
			...overrides,
		})

		if (!_hasToken()) {
			const id = createResume(overrides)
			uni.showToast({ title: '未登录，已仅存本地', icon: 'none' })
			return { success: true, id }
		}

		listLoading.value = true
		syncError.value = ''
		try {
			const payload = toApiPayload(draft)
			const res = await createResumeApi(payload)
			if (!res.ok) {
				syncError.value = res.message || '创建失败'
				uni.showToast({ title: syncError.value, icon: 'none' })
				return { success: false, message: syncError.value }
			}

			let created = fromApiResponse(res.data, {
				templateId: draft.templateId,
				menuSections: draft.menuSections,
				globalSettings: draft.globalSettings,
			})

			// 部分接口只返回 resumeId，再拉一次详情
			if (!created && res.data?.resumeId) {
				const detailRes = await fetchResumeDetail(res.data.resumeId)
				if (detailRes.ok) {
					created = fromApiResponse(detailRes.data, {
						templateId: draft.templateId,
						menuSections: draft.menuSections,
						globalSettings: draft.globalSettings,
					})
				}
			}
			if (!created && typeof res.data === 'string') {
				const detailRes = await fetchResumeDetail(res.data)
				if (detailRes.ok) created = fromApiResponse(detailRes.data)
			}

			if (!created) {
				return { success: false, message: '创建成功但数据解析失败' }
			}

			_upsertResume(mergeResumeWithDraft(draft, created))
			activeResumeId.value = created.id
			_performSave()
			hydrated = true
			return { success: true, id: created.id }
		} catch (e) {
			console.error('createResumeOnServer:', e)
			syncError.value = '创建简历失败'
			return { success: false, message: syncError.value }
		} finally {
			listLoading.value = false
		}
	}

	/** 拉取单份简历详情（进入编辑器前） */
	async function loadResumeFromServer(resumeId) {
		if (!resumeId) return { success: false }
		if (!_hasToken()) {
			if (resumes[resumeId]) {
				activeResumeId.value = resumeId
				return { success: true }
			}
			return { success: false, message: '简历不存在' }
		}

		try {
			const res = await fetchResumeDetail(resumeId)
			if (!res.ok) {
				return { success: false, message: res.message || '加载失败' }
			}
			const local = resumes[resumeId]
			const resume = fromApiResponse(res.data, local || {})
			if (!resume) return { success: false, message: '数据解析失败' }
			_upsertResume(local ? mergeResumeWithDraft(local, resume) : resume)
			activeResumeId.value = resumeId
			_performSave()
			return { success: true }
		} catch (e) {
			console.error('loadResumeFromServer:', e)
			return { success: false, message: '加载失败' }
		}
	}

	function addResume(resumeData) {
		const id = resumeData.id || generateId()
		resumes[id] = { ...resumeData, id }
		return id
	}

	function deleteResume(id) {
		if (!resumes[id]) return
		delete resumes[id]
		if (activeResumeId.value === id) {
			const left = Object.keys(resumes)
			activeResumeId.value = left.length ? left[0] : null
		}
	}

	async function deleteResumeOnServer(id) {
		if (!resumes[id]) {
			return { success: false, message: '简历不存在' }
		}

		if (_hasToken()) {
			try {
				const res = await deleteResumeApi(id)
				if (!res.ok) {
					return { success: false, message: res.message || '删除失败' }
				}
			} catch (error) {
				console.error('删除简历失败:', error)
				return { success: false, message: '删除失败，请重试' }
			}
		}

		// 删除本地数据
		deleteResume(id)
		_performSave()
		return { success: true }
	}

	function setActiveResume(id) {
		activeResumeId.value = id
	}

	function updateResume(id, partial) {
		if (!resumes[id]) return
		Object.assign(resumes[id], partial, { updatedAt: new Date().toISOString() })
	}

	function updateResumeTitle(title) {
		if (activeResume.value) activeResume.value.title = title
	}

	// ─── menuSections / 切换模块 ──────────────────────────────
	function setActiveSection(sectionId) {
		if (activeResume.value) activeResume.value.activeSection = sectionId
	}

	function setTemplateId(templateId) {
		if (activeResume.value && templateId) activeResume.value.templateId = templateId
	}

	function updateMenuSections(sections) {
		if (activeResume.value) activeResume.value.menuSections = sections
	}

	function removeMenuSection(sectionId) {
		const r = activeResume.value
		if (!r || sectionId === 'basic') return
		r.menuSections = (r.menuSections || []).filter((s) => s.id !== sectionId)
		if (sectionId === 'experience') r.experience = []
		if (sectionId === 'projects') r.projects = []
		if (sectionId === 'education') r.education = []
		if (sectionId === 'skills') r.skillContent = ''
		if (sectionId === 'selfEvaluation') r.selfEvaluationContent = ''
		if (r.customData && r.customData[sectionId]) delete r.customData[sectionId]
		if (r.activeSection === sectionId) {
			const fallback = r.menuSections.find((s) => s.enabled) || r.menuSections[0]
			r.activeSection = fallback?.id || 'basic'
		}
	}

	function toggleSectionVisibility(sectionId) {
		const r = activeResume.value
		if (!r) return
		const sections = (r.menuSections || []).map((s) =>
			s.id === sectionId ? { ...s, enabled: !s.enabled } : s
		)
		const cur = sections.find((s) => s.id === r.activeSection)
		if (cur && cur.enabled === false) {
			const enabled = sections.filter((s) => s.enabled).sort((a, b) => a.order - b.order)
			const fb = enabled.find((s) => s.id === 'basic') || enabled[0]
			if (fb) r.activeSection = fb.id
		}
		r.menuSections = sections
	}

	function reorderSections(from, to) {
		const r = activeResume.value
		if (!r) return
		const list = [...(r.menuSections || [])]
		if (from < 0 || to < 0 || from >= list.length || to >= list.length) return
		const [item] = list.splice(from, 1)
		list.splice(to, 0, item)
		r.menuSections = list.map((s, i) => ({ ...s, order: i }))
	}

	function updateGlobalSettings(partial) {
		if (!activeResume.value) return
		if (!activeResume.value.globalSettings) activeResume.value.globalSettings = {}
		Object.assign(activeResume.value.globalSettings, partial)
	}

	function setThemeColor(color) {
		updateGlobalSettings({ themeColor: color })
	}

	// ─── 列表项 CRUD（只做 add / delete / reorder；编辑全靠 v-model）──
	function _list(field) {
		const r = activeResume.value
		if (!r) return null
		if (!Array.isArray(r[field])) r[field] = []
		return r[field]
	}

	function _add(field, item) {
		const list = _list(field)
		if (!list) return null
		const newItem = { id: generateId(), visible: true, ...item }
		list.push(newItem)
		return newItem.id
	}

	function _remove(field, id) {
		const list = _list(field)
		if (!list) return
		const idx = list.findIndex((it) => it.id === id)
		if (idx >= 0) list.splice(idx, 1)
	}

	function _reorder(field, from, to) {
		const list = _list(field)
		if (!list) return
		if (from < 0 || to < 0 || from >= list.length || to >= list.length) return
		const [item] = list.splice(from, 1)
		list.splice(to, 0, item)
	}

	const addExperience    = (item) => _add('experience', item)
	const deleteExperience = (id) => _remove('experience', id)
	const reorderExperience = (f, t) => _reorder('experience', f, t)

	const addProject     = (item) => _add('projects', item)
	const deleteProject  = (id) => _remove('projects', id)
	const reorderProjects = (f, t) => _reorder('projects', f, t)

	const addEducation     = (item) => _add('education', item)
	const deleteEducation  = (id) => _remove('education', id)
	const reorderEducation = (f, t) => _reorder('education', f, t)

	// ─── 兼容旧 action 名（让没改完的旧代码不报错；内部都改成直接 mutate）─
	function updateBasicInfo(partial) {
		if (!activeResume.value) return
		if (!activeResume.value.basic) activeResume.value.basic = {}
		Object.assign(activeResume.value.basic, partial)
	}
	function updateExperience(id, partial) {
		const item = (activeResume.value?.experience || []).find((e) => e.id === id)
		if (item) Object.assign(item, partial)
	}
	function updateProject(id, partial) {
		const item = (activeResume.value?.projects || []).find((e) => e.id === id)
		if (item) Object.assign(item, partial)
	}
	function updateEducation(id, partial) {
		const item = (activeResume.value?.education || []).find((e) => e.id === id)
		if (item) Object.assign(item, partial)
	}
	function updateSkillContent(html) {
		if (activeResume.value) activeResume.value.skillContent = html
	}
	function updateSelfEvaluation(html) {
		if (activeResume.value) activeResume.value.selfEvaluationContent = html
	}

	// ─── 自定义模块 / 证书 ───
	function _customList(sectionId) {
		const r = activeResume.value
		if (!r || !sectionId) return null
		if (!r.customData) r.customData = {}
		if (!Array.isArray(r.customData[sectionId])) r.customData[sectionId] = []
		return r.customData[sectionId]
	}
	function updateCustomSection(sectionId, items) {
		const list = _customList(sectionId)
		if (list) {
			activeResume.value.customData[sectionId] = items
		}
	}
	function addCustomItem(sectionId, item) {
		const list = _customList(sectionId)
		if (!list) return null
		const newItem = { id: generateId(), visible: true, ...item }
		list.push(newItem)
		return newItem.id
	}
	function updateCustomItem(sectionId, id, partial) {
		const list = _customList(sectionId)
		if (!list) return
		const it = list.find((x) => x.id === id)
		if (it) Object.assign(it, partial)
	}
	function deleteCustomItem(sectionId, id) {
		const list = _customList(sectionId)
		if (!list) return
		const idx = list.findIndex((x) => x.id === id)
		if (idx >= 0) list.splice(idx, 1)
	}
	function reorderCustomItems(sectionId, from, to) {
		const list = _customList(sectionId)
		if (!list) return
		if (from < 0 || to < 0 || from >= list.length || to >= list.length) return
		const [item] = list.splice(from, 1)
		list.splice(to, 0, item)
	}

	// ─── AI 优化结果回写 ───
	function applyOptimizedModule(moduleId, html) {
		if (!moduleId || !html || !activeResume.value) return
		const cfg = SECTION_FIELD_MAP[moduleId]
		if (cfg?.type === 'top') {
			activeResume.value[cfg.field] = html
			return
		}
		if (cfg?.type === 'list') {
			const list = activeResume.value[cfg.field] || []
			if (list.length) {
				list[0][cfg.html] = html
			} else if (cfg.field === 'experience') {
				addExperience({ company: '', position: '', date: '', details: html })
			} else if (cfg.field === 'projects') {
				addProject({ name: '', role: '', date: '', description: html })
			} else if (cfg.field === 'education') {
				addEducation({ school: '', major: '', degree: '', startDate: '', endDate: '', description: html })
			}
			return
		}
		if (moduleId.startsWith('custom') || moduleId === 'certificates') {
			const items = activeResume.value.customData?.[moduleId] || []
			if (items.length) {
				updateCustomItem(moduleId, items[0].id, { description: html })
			} else {
				addCustomItem(moduleId, { title: '', description: html })
			}
		}
	}

	// ════════════════════════════════════════════════════════════════
	// 4. 持久化 —— deep watch + debounce，业务代码完全无感
	// ════════════════════════════════════════════════════════════════
	let saveTimer = null
	let apiSaveTimer = null
	let hydrated = false
	let apiSaveInFlight = false

	async function _saveActiveToServer() {
		const r = activeResume.value
		if (!r?.id || !_hasToken() || apiSaveInFlight) return

		apiSaveInFlight = true
		saving.value = true
		try {
			const res = await updateResumeApi(r.id, toApiPayload(r))
			if (!res.ok) {
				syncError.value = res.message || '保存失败'
				console.warn('简历保存失败:', res.message)
			} else {
				syncError.value = ''
				const updated = fromApiResponse(res.data)
				if (updated) {
					resumes[r.id] = mergeResumeWithDraft(r, { ...updated, id: r.id })
				}
			}
		} catch (e) {
			console.error('_saveActiveToServer:', e)
		} finally {
			apiSaveInFlight = false
			saving.value = false
		}
	}

	function scheduleApiSave() {
		if (!hydrated || !_hasToken() || !activeResumeId.value) return
		if (apiSaveTimer) clearTimeout(apiSaveTimer)
		apiSaveTimer = setTimeout(() => {
			apiSaveTimer = null
			_saveActiveToServer()
		}, API_SAVE_DEBOUNCE_MS)
	}

	function _performSave() {
		try {
			uni.setStorageSync(STORAGE_KEY, JSON.stringify({
				resumes: JSON.parse(JSON.stringify(resumes)),
				activeResumeId: activeResumeId.value,
			}))
		} catch (e) {
			console.error('保存简历失败:', e)
		}
	}

	function scheduleSave() {
		if (!hydrated) return
		if (saveTimer) clearTimeout(saveTimer)
		saveTimer = setTimeout(() => {
			saveTimer = null
			_performSave()
		}, SAVE_DEBOUNCE_MS)
		scheduleApiSave()
	}

	// 任何字段变化都触发 debounced 本地 + 远端保存
	watch([resumes, activeResumeId], scheduleSave, { deep: true })

	function saveToLocal() {
		if (saveTimer) { clearTimeout(saveTimer); saveTimer = null }
		_performSave()
	}

	function flushSave() {
		saveToLocal()
		if (apiSaveTimer) {
			clearTimeout(apiSaveTimer)
			apiSaveTimer = null
		}
		return _saveActiveToServer()
	}

	function loadFromLocal() {
		try {
			const raw = uni.getStorageSync(STORAGE_KEY)
			if (!raw) { hydrated = true; return false }
			const data = typeof raw === 'string' ? JSON.parse(raw) : raw
			if (data?.resumes) {
				Object.keys(resumes).forEach((k) => { delete resumes[k] })
				Object.entries(data.resumes).forEach(([id, r]) => {
					resumes[id] = _normalizeResumeMenu(r)
				})
				activeResumeId.value = data.activeResumeId || null
				hydrated = true
				return true
			}
		} catch (e) {
			console.error('加载简历失败:', e)
		}
		hydrated = true
		return false
	}

	return {
		// state
		resumes,
		activeResumeId,
		listLoading,
		saving,
		syncError,
		// computed
		activeResume,
		allResumes,
		// resume lifecycle
		createResume,
		createResumeOnServer,
		fetchAllFromServer,
		loadResumeFromServer,
		addResume,
		deleteResume,
		deleteResumeOnServer,
		setActiveResume,
		updateResume,
		updateResumeTitle,
		// section management
		setActiveSection,
		setTemplateId,
		updateMenuSections,
		removeMenuSection,
		toggleSectionVisibility,
		reorderSections,
		updateGlobalSettings,
		setThemeColor,
		// list CRUD
		addExperience, deleteExperience, reorderExperience, updateExperience,
		addProject,    deleteProject,    reorderProjects,   updateProject,
		addEducation,  deleteEducation,  reorderEducation,  updateEducation,
		// rich text top-level
		updateBasicInfo,
		updateSkillContent,
		updateSelfEvaluation,
		// custom modules
		updateCustomSection,
		addCustomItem,
		updateCustomItem,
		deleteCustomItem,
		reorderCustomItems,
		// AI
		applyOptimizedModule,
		// persistence
		saveToLocal,
		flushSave,
		loadFromLocal,
		saveActiveToServer: _saveActiveToServer,
	}
})
