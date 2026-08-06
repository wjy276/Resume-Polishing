/**
 * 简历 Store — 完全重写版（setup-style + reactive + deep watch）
 *
 * 设计原则：
 *   1. 简历对象本身是 reactive，编辑器/预览都直接读写它的属性 → 天然实时响应。
 *   2. v-model 直接绑 store.activeResume.basic.name 这种路径，不再走 action 包装。
 *   3. 持久化通过对 resumes 的 deep watch + 500ms debounce 自动完成。
 *   4. 多简历切换通过替换 activeResumeId 实现，模板 ref 不变。
 */

import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'
import { createBlankResume, createNewResume, generateId, DEFAULT_GLOBAL_SETTINGS, DEFAULT_PHOTO_CONFIG, DEFAULT_FIELD_ORDER } from '@/utils/resume/initialData'
import { toApiPayload, toSafeApiPayload, fromApiResponse, mergeMenuSections, mergeResumeWithDraft } from '@/utils/resume/serializer'
import {
	fetchResumeList,
	fetchResumeDetail,
	createResumeApi,
	updateResumeApi,
	deleteResumeApi,
} from '@/api/resume'

const STORAGE_KEY = 'magic_resume_store'
const SAVE_DEBOUNCE_MS = 500
const API_SAVE_DEBOUNCE_MS = 2000

// AI 返回的菜单项 → 前端菜单格式
const AI_SECTION_MAP = {
	basic: { title: '基本信息', icon: '👤' },
	education: { title: '教育背景', icon: '🎓' },
	experience: { title: '工作经历', icon: '💼' },
	projects: { title: '项目经历', icon: '🚀' },
	certificates: { title: '荣誉证书', icon: '🏆' },
	skills: { title: '专业技能', icon: '⚡' },
	selfEvaluation: { title: '自我评价', icon: '💬' },
}

function normalizeMenuSectionsFromAI(menuSections) {
	if (!Array.isArray(menuSections) || menuSections.length === 0) {
		return [{ id: 'basic', title: '基本信息', icon: '👤', enabled: true, order: 0 }]
	}
	return menuSections.map((id, index) => {
		const config = AI_SECTION_MAP[id] || { title: id, icon: '📂' }
		return {
			id,
			title: config.title,
			icon: config.icon,
			enabled: true,
			order: index,
		}
	})
}

// AI 优化结果回写时用的模块字段映射
export const SECTION_FIELD_MAP = {
	summary:        { type: 'top', field: 'selfEvaluationContent' },
	skills:         { type: 'top', field: 'skillContent' },
	selfEvaluation: { type: 'top', field: 'selfEvaluationContent' },
	experience:     { type: 'list', field: 'experience', html: 'details' },
	projects:       { type: 'list', field: 'projects', html: 'description' },
	education:      { type: 'list', field: 'education', html: 'description' },
	certifications: { type: 'custom', field: 'certifications' },
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

	/** 将纯文本转为简单 HTML（适配 RichTextEditor 格式） */
	function toHtml(text) {
		if (!text) return ''
		if (text.startsWith('<')) return text
		const lines = text.split('\n').filter(Boolean)
		if (lines.length <= 1) return `<p>${text}</p>`
		return '<ul>' + lines.map(l => `<li>${l}</li>`).join('') + '</ul>'
	}

	/** 从 AI 解析数据创建简历（数据已是编辑器格式） */
	async function createResumeFromParsedData(editorData, title = '') {
		if (!editorData) return { success: false, message: '解析数据为空' }

		console.log('========== [Store 接收数据] ==========')
		console.log('1. 基本信息:', editorData.basic)
		console.log('2. 教育背景:', editorData.education)
		console.log('3. 工作经历:', editorData.experience)
		console.log('4. 项目经历:', editorData.projects)
		console.log('5. 专业技能:', editorData.skillContent)
		console.log('6. 自我评价:', editorData.selfEvaluationContent)
		console.log('=====================================')

		// 智能转换：如果工作经历为空但项目经历不为空，尝试将项目经历转换为工作经历
		let projects = editorData.projects || []
		let experience = editorData.experience || []
		
		console.log('[检查项目经历字段]')
		projects.forEach((p, i) => {
			console.log(`项目${i+1}:`, {
				name: p.name,
				role: p.role,
				company: p.company,
				position: p.position,
				date: p.date,
				hasDescription: !!p.description,
				descriptionLength: p.description?.length || 0,
			})
		})
		
		if (experience.length === 0 && projects.length > 0) {
			console.log('[智能转换] 工作经历为空，尝试将项目经历转换为工作经历')
			// 更宽松的条件：只要有描述内容的项目经历都可能是工作经历
			const workLikeProjects = projects.filter(p => 
				p.description || p.details || p.role || p.company || p.position
			)
			console.log('[智能转换] 匹配到', workLikeProjects.length, '条可能的工作经历')
			
			if (workLikeProjects.length > 0) {
				experience = workLikeProjects.map(p => ({
					company: p.company || p.name || '未知公司',
					position: p.position || p.role || '未知职位',
					date: p.date || '',
					details: p.details || p.description || '',
				}))
				// 从项目经历中移除已转换的
				projects = projects.filter(p => 
					!p.description && !p.details && !p.role && !p.company && !p.position
				)
				console.log('[智能转换] 转换完成')
				console.log('[智能转换] 工作经历:', experience)
				console.log('[智能转换] 剩余项目经历:', projects)
			}
		}

		// 后端返回的已是编辑器格式，直接使用
		const draft = {
			id: generateId(),
			title: title || editorData.title || '导入简历',
			templateId: editorData.templateId || 'classic',
			activeSection: editorData.activeSection || 'basic',
			globalSettings: { ...DEFAULT_GLOBAL_SETTINGS, ...(editorData.globalSettings || {}) },
			menuSections: normalizeMenuSectionsFromAI([
				...new Set([
					...(editorData.menuSections || []),
					...(editorData.selfEvaluationContent ? ['selfEvaluation'] : []),
				]),
			]),
			basic: {
				name: editorData.basic?.name || '',
				title: editorData.basic?.title || editorData.basic?.jobIntention || '',
				email: editorData.basic?.email || '',
				phone: editorData.basic?.phone || '',
				location: editorData.basic?.location || '',
				birthDate: editorData.basic?.birthDate || '',
				employementStatus: editorData.basic?.employementStatus || editorData.basic?.employmentStatus || '',
				photo: editorData.basic?.photo || '',
				photoConfig: { ...DEFAULT_PHOTO_CONFIG, ...(editorData.basic?.photoConfig || {}) },
				fieldOrder: editorData.basic?.fieldOrder?.length ? editorData.basic.fieldOrder : [...DEFAULT_FIELD_ORDER],
				icons: {
					email: '📧',
					phone: '',
					location: '📍',
					birthDate: '📅',
					employementStatus: '💼',
					...(editorData.basic?.icons || {}),
				},
				customFields: editorData.basic?.customFields || [],
				layout: editorData.basic?.layout || 'left',
			},
			experience: experience.map(exp => {
				let details = exp.details || exp.description || ''
				if (!details || details === '<p></p>') {
					const parts = []
					if (Array.isArray(exp.responsibilities)) parts.push(exp.responsibilities.join('\n'))
					else if (exp.responsibilities) parts.push(exp.responsibilities)
					if (Array.isArray(exp.technologies) && exp.technologies.length) parts.push('技术栈：' + exp.technologies.join(', '))
					details = toHtml(parts.join('\n'))
				} else {
					details = toHtml(details)
				}
				return {
					id: generateId(),
					company: exp.company || '',
					position: exp.position || exp.title || '',
					date: exp.date || '',
					details,
					visible: exp.visible !== false,
				}
			}),
			projects: projects.map(proj => ({
				id: generateId(),
				name: proj.name || '',
				role: proj.role || '',
				date: proj.date || '',
				description: toHtml(proj.description || (Array.isArray(proj.highlights) ? proj.highlights.join('\n') : proj.highlights || '') || (Array.isArray(proj.technologies) && proj.technologies.length ? '技术栈：' + proj.technologies.join(', ') : '')),
				link: proj.link || '',
				visible: proj.visible !== false,
			})),
			education: (editorData.education || []).map(edu => ({
				id: generateId(),
				school: edu.school || '',
				major: edu.major || '',
				degree: edu.degree || '',
				startDate: edu.startDate || '',
				endDate: edu.endDate || '',
				isCurrent: edu.isCurrent || false,
				description: toHtml(edu.description || ''),
				visible: edu.visible !== false,
			})),
			skillContent: toHtml(editorData.skillContent || ''),
			selfEvaluationContent: toHtml(editorData.selfEvaluationContent || ''),
			customData: {
				...(editorData.customData || {}),
				certificates: (editorData.certificates || []).map(cert => ({
					id: generateId(),
					title: cert.name || '',
					date: cert.issueDate || '',
					issuer: cert.issuer || '',
					description: '',
				})),
			},
		}

		console.log('========== [Store 转换后] ==========')
		console.log('1. 基本信息:', draft.basic)
		console.log('2. 教育背景数量:', draft.education.length)
		console.log('3. 工作经历数量:', draft.experience.length)
		console.log('4. 项目经历数量:', draft.projects.length)
		console.log('5. 专业技能长度:', draft.skillContent.length)
		console.log('6. 自我评价长度:', draft.selfEvaluationContent.length)
		console.log('===================================')

		if (!_hasToken()) {
			resumes[draft.id] = draft
			activeResumeId.value = draft.id
			_performSave()
			uni.showToast({ title: '未登录，已仅存本地', icon: 'none' })
			return { success: true, id: draft.id }
		}

		listLoading.value = true
		syncError.value = ''
		let payload = null
		let usedSafe = false
		try {
			payload = toApiPayload(draft)
			console.log('========== [发送给 Java 后端] ==========')
			console.log('Payload 基本信息:', payload.basic)
			console.log('Payload 教育背景:', payload.education)
			console.log('Payload 工作经历:', payload.experience)
			console.log('Payload 项目经历:', payload.projects)
			console.log('Payload 专业技能:', payload.skillContent)
			console.log('Payload 自我评价:', payload.selfEvaluationContent)
			console.log('=======================================')
			
			let res = await createResumeApi(payload)
			console.log('[Java 后端响应]:', res)

			// 服务端 500 时尝试用精简 payload
			if (!res.ok && res.raw && (res.raw.code === 500 || res.message?.includes('500')) && !usedSafe) {
				console.warn('[createResumeFromParsedData] 服务端 500，尝试精简 payload 重试')
				usedSafe = true
				payload = toSafeApiPayload(draft)
				res = await createResumeApi(payload)
				console.log('[Java 后端精简响应]:', res)
			}
			
			if (!res.ok) {
				syncError.value = res.message || '创建失败'
				console.warn('[createResumeFromParsedData] 创建失败:', { payload, response: res.raw })
				return { success: false, message: syncError.value }
			}

			let created = fromApiResponse(res.data, draft)
			console.log('[fromApiResponse 转换后]:', created)

			if (!created && res.data?.resumeId) {
				const detailRes = await fetchResumeDetail(res.data.resumeId)
				if (detailRes.ok) {
					created = fromApiResponse(detailRes.data, draft)
				}
			}

			if (!created) {
				// 使用本地数据
				_upsertResume(draft)
				activeResumeId.value = draft.id
				_performSave()
				hydrated = true
				return { success: true, id: draft.id }
			}

			const merged = mergeResumeWithDraft(draft, created)
			console.log('[合并后最终数据]:', merged)
			_upsertResume(merged)
			activeResumeId.value = created.id
			_performSave()
			hydrated = true
			return { success: true, id: created.id }
		} catch (e) {
			console.error('createResumeFromParsedData:', e)
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

	function updateCareerIntent(partial) {
		const r = activeResume.value
		if (!r) return
		if (!r.customData) r.customData = {}
		if (!r.customData.careerIntent) r.customData.careerIntent = {}
		Object.assign(r.customData.careerIntent, partial)
		r.updatedAt = new Date().toISOString()
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
		if (!cfg) return

		if (cfg.type === 'top') {
			activeResume.value[cfg.field] = html
			return
		}
		if (cfg.type === 'list') {
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
		if (cfg.type === 'custom') {
			const items = activeResume.value.customData?.[cfg.field] || []
			if (items.length) {
				updateCustomItem(cfg.field, items[0].id, { description: html })
			} else {
				addCustomItem(cfg.field, { title: '', description: html })
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
	let apiSaveRetryCount = 0
	let apiSaveFailureCooldownUntil = 0
	let apiSaveSuccessPauseUntil = 0
	let lastSavedPayloadHash = null
	let lastSavedAt = 0
	const API_SAVE_MAX_RETRIES = 1
	const API_SAVE_COOLDOWN_MS = 30000
	const API_SAVE_MIN_INTERVAL_MS = 5000
	const API_SAVE_PAUSE_AFTER_SUCCESS_MS = 5000

	function _hashString(str) {
		let h = 0
		for (let i = 0; i < str.length; i++) {
			const c = str.charCodeAt(i)
			h = ((h << 5) - h + c) | 0
		}
		return String(h)
	}

	async function _saveActiveToServer(useSafePayload = false) {
		const r = activeResume.value
		if (!r?.id || !_hasToken() || apiSaveInFlight) return

		// 失败冷却期：服务端异常时暂停自动保存，避免无限重试
		if (Date.now() < apiSaveFailureCooldownUntil) return

		apiSaveInFlight = true
		saving.value = true
		let payload = null
		try {
			payload = useSafePayload ? toSafeApiPayload(r) : toApiPayload(r)
			const payloadJson = JSON.stringify(payload)
			const payloadHash = _hashString(payloadJson)
			const payloadSizeKb = Math.round(payloadJson.length / 1024)

			// 内容未变化，跳过
			if (payloadHash === lastSavedPayloadHash && Date.now() - lastSavedAt < API_SAVE_MIN_INTERVAL_MS) {
				return
			}

			console.log(`[save] resumeId=${r.id} mode=${useSafePayload ? 'safe' : 'full'} size=${payloadSizeKb}KB`)

			const res = await updateResumeApi(r.id, payload)
			if (!res.ok) {
				const status = res.code ?? res.statusCode ?? res.raw?.code
				const message = res.message || '保存失败'
				const isServerError = status === 500 || message.includes('500')
				const isGatewayError = status === 502 || status === 503 || message.includes('502') || message.includes('Bad Gateway')
				syncError.value = message

				// 服务端异常：立即进入较长冷却期，避免连续重试压垮后端
				if (isServerError || isGatewayError) {
					apiSaveFailureCooldownUntil = Date.now() + API_SAVE_COOLDOWN_MS
					apiSaveRetryCount = 0
					if (isGatewayError) {
						uni.showToast?.({ title: '无法连接到后端服务，已暂停自动保存', icon: 'none', duration: 3000 })
					}
					console.warn(`[save] 服务端异常 ${status || 500}，暂停 ${API_SAVE_COOLDOWN_MS / 1000}s`, { message, size: payloadJson.length })
					return
				}

				// 业务错误（如 401/400）少量重试
				if (apiSaveRetryCount < API_SAVE_MAX_RETRIES) {
					apiSaveRetryCount += 1
					const backoffMs = 5000 * apiSaveRetryCount
					setTimeout(() => scheduleApiSave(), backoffMs)
				} else {
					apiSaveRetryCount = 0
					apiSaveFailureCooldownUntil = Date.now() + API_SAVE_COOLDOWN_MS
					uni.showToast?.({ title: '简历同步失败，请检查网络或稍后重试', icon: 'none', duration: 3000 })
				}
			} else {
				apiSaveRetryCount = 0
				apiSaveFailureCooldownUntil = 0
				syncError.value = ''
				lastSavedPayloadHash = payloadHash
				lastSavedAt = Date.now()
				// 保存成功后暂停下一轮自动保存，避免 merge 服务端回写数据触发再次保存
				apiSaveSuccessPauseUntil = Date.now() + API_SAVE_PAUSE_AFTER_SUCCESS_MS

				// 用服务端返回数据合并，但尽量不改变引用对象上的字段命名，减少 watch 触发
				const updated = fromApiResponse(res.data)
				if (updated) {
					resumes[r.id] = mergeResumeWithDraft(r, { ...updated, id: r.id })
				}
				console.log('[save] ok')
			}
		} catch (e) {
			console.error('[save] 异常:', e?.message || e)
			apiSaveFailureCooldownUntil = Date.now() + API_SAVE_COOLDOWN_MS
		} finally {
			apiSaveInFlight = false
			saving.value = false
		}
	}

	function scheduleApiSave() {
		if (!hydrated || !_hasToken() || !activeResumeId.value) return
		const now = Date.now()
		// 保存成功后暂停期内，忽略自动保存调度
		if (now < apiSaveSuccessPauseUntil) return
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

	// 切换简历时重置保存状态，避免上一份简历的暂停/哈希影响新简历
	watch(activeResumeId, (newId, oldId) => {
		if (newId !== oldId) {
			lastSavedPayloadHash = null
			lastSavedAt = 0
			apiSaveSuccessPauseUntil = 0
			apiSaveFailureCooldownUntil = 0
			apiSaveRetryCount = 0
		}
	})

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
		// 手动保存时临时解除成功暂停，确保用户点击保存按钮能立即执行
		const prevPause = apiSaveSuccessPauseUntil
		apiSaveSuccessPauseUntil = 0
		const promise = _saveActiveToServer()
		promise?.finally?.(() => {
			// 如果手动保存失败，恢复原来的暂停保护；成功则由 _saveActiveToServer 重新设置
			if (syncError.value) apiSaveSuccessPauseUntil = prevPause
		})
		return promise
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
		createResumeFromParsedData,
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
		// career intent
		updateCareerIntent,
		// AI
		applyOptimizedModule,
		// persistence
		saveToLocal,
		flushSave,
		loadFromLocal,
		saveActiveToServer: _saveActiveToServer,
	}
})
