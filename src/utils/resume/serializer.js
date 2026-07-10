import {
	DEFAULT_FIELD_ORDER,
	DEFAULT_GLOBAL_SETTINGS,
	DEFAULT_MENU_SECTIONS,
	DEFAULT_PHOTO_CONFIG,
	generateId,
} from './initialData'

/**
 * 简历 ↔ 后端 序列化器
 *
 * 设计原则：
 *   1. 只上传"内容"，剥掉所有模板/UI 状态：
 *      - templateId / globalSettings / menuSections / activeSection
 *      - basic.layout / basic.photoConfig / basic.fieldOrder / basic.icons
 *   2. 日期统一规范成 startDate / endDate / current 三段式，
 *      避免后端再去 split "2021-07 - 至今" 这种前端拼出来的字符串。
 *   3. 富文本字段保留原始 HTML（带 <ul><li>...），后端按 TEXT/LONGTEXT 存。
 *   4. 反序列化只补默认模板字段，不覆盖用户编辑过的内容。
 */

// ─────────────────────────────────────────────────────────────
// 工具
// ─────────────────────────────────────────────────────────────
const CURRENT_TOKEN = '至今'

/** 解析 "YYYY-MM - YYYY-MM" / "YYYY-MM - 至今" 这种合并字符串 */
function parseDateRange(dateStr) {
	if (!dateStr || typeof dateStr !== 'string') {
		return { startDate: '', endDate: '', current: false }
	}
	const s = dateStr.trim()
	if (!s) return { startDate: '', endDate: '', current: false }
	// 注意：日期本身就含 "-"（如 "2021-07"），所以分隔符必须要求 "-" 两侧都是空白
	const parts = s.split(/\s+-\s+/)
	const start = (parts[0] || '').trim()
	const tail = (parts[1] || '').trim()
	const current = tail === CURRENT_TOKEN || tail === '现在' || tail === 'present'

	return {
		startDate: start,
		endDate: current ? '' : tail,
		current,
	}
}

/** 把 startDate/endDate/current 拼回前端显示用的合并字符串 */
function buildDateRange(start, end, current) {
	if (!start) return current ? CURRENT_TOKEN : ''
	return current ? `${start} - ${CURRENT_TOKEN}` : `${start} - ${end || ''}`
}

function pickIfNonEmpty(obj, keys) {
	const out = {}
	for (const k of keys) {
		const v = obj?.[k]
		if (v !== undefined && v !== null && v !== '') out[k] = v
	}
	return out
}

// ─────────────────────────────────────────────────────────────
// 前端 → 后端：toBackendPayload(resume)
// ─────────────────────────────────────────────────────────────
export function toBackendPayload(resume) {
	if (!resume || typeof resume !== 'object') {
		throw new Error('serializer.toBackendPayload: resume 不能为空')
	}

	// ─ 1) 基本信息：去掉 layout / photoConfig / fieldOrder / icons ─
	const b = resume.basic || {}
	const basic = {
		name: b.name || '',
		title: b.title || '',
		email: b.email || '',
		phone: b.phone || '',
		location: b.location || '',
		birthDate: b.birthDate || '',
		employementStatus: b.employementStatus || '',
		photo: b.photo || '',
		customFields: (b.customFields || [])
			.filter((f) => f && (f.label || f.value)) // 完全空白的丢掉
			.map((f) => ({
				label: f.label || '',
				value: f.value || '',
			})),
	}

	// ─ 2) 工作经历 ─
	const experience = (resume.experience || []).map((it) => {
		const { startDate, endDate, current } = parseDateRange(it.date)
		return {
			id: it.id,
			company: it.company || '',
			position: it.position || '',
			startDate,
			endDate,
			current,
			details: it.details || '',
		}
	})

	// ─ 3) 项目经历 ─
	const projects = (resume.projects || []).map((it) => {
		const { startDate, endDate, current } = parseDateRange(it.date)
		return {
			id: it.id,
			name: it.name || '',
			role: it.role || '',
			link: it.link || '',
			startDate,
			endDate,
			current,
			description: it.description || '',
		}
	})

	// ─ 4) 教育经历（store 里已经是分开的 startDate/endDate/isCurrent）─
	const education = (resume.education || []).map((it) => ({
		id: it.id,
		school: it.school || '',
		major: it.major || '',
		degree: it.degree || '',
		startDate: it.startDate || '',
		endDate: it.isCurrent ? '' : (it.endDate || ''),
		current: !!it.isCurrent,
		description: it.description || '',
	}))

	// ─ 5) 自定义模块（含证书）─
	const customModules = {}
	const customData = resume.customData || {}
	const menuSections = resume.menuSections || []
	for (const sid of Object.keys(customData)) {
		const items = customData[sid]
		if (!Array.isArray(items) || !items.length) continue
		const meta = menuSections.find((s) => s.id === sid)
		customModules[sid] = {
			title: meta?.title || sid,
			items: items.map((it) => ({
				id: it.id,
				title: it.title || '',
				subtitle: it.subtitle || '',
				issuer: it.issuer || '',
				date: it.date || '',
				dateRange: it.dateRange || '',
				description: it.description || '',
			})),
		}
	}

	return {
		id: resume.id || null,
		title: resume.title || '未命名简历',
		basic,
		experience,
		projects,
		education,
		skillContent: resume.skillContent || '',
		selfEvaluationContent: resume.selfEvaluationContent || '',
		customModules,
		createdAt: resume.createdAt || null,
		updatedAt: new Date().toISOString(),
	}
}

// ─────────────────────────────────────────────────────────────
// 后端 → 前端：fromBackendPayload(payload, { defaults })
// 把 startDate/endDate/current 拼回 date 字符串，
// 并合并默认模板字段（globalSettings / menuSections / templateId 等）
// ─────────────────────────────────────────────────────────────
export function fromBackendPayload(payload, defaults = {}) {
	if (!payload || typeof payload !== 'object') return null

	const experience = (payload.experience || []).map((it) => ({
		id: it.id,
		visible: true,
		company: it.company || '',
		position: it.position || '',
		date: buildDateRange(it.startDate, it.endDate, it.current),
		details: it.details || '',
	}))

	const projects = (payload.projects || []).map((it) => ({
		id: it.id,
		visible: true,
		name: it.name || '',
		role: it.role || '',
		link: it.link || '',
		date: buildDateRange(it.startDate, it.endDate, it.current),
		description: it.description || '',
	}))

	const education = (payload.education || []).map((it) => ({
		id: it.id,
		visible: true,
		school: it.school || '',
		major: it.major || '',
		degree: it.degree || '',
		startDate: it.startDate || '',
		endDate: it.current ? '' : (it.endDate || ''),
		isCurrent: !!it.current,
		description: it.description || '',
	}))

	const customData = {}
	const extraMenu = []
	const customModules = payload.customModules || {}
	for (const sid of Object.keys(customModules)) {
		const mod = customModules[sid]
		customData[sid] = (mod?.items || []).map((it) => ({
			id: it.id,
			visible: true,
			title: it.title || '',
			subtitle: it.subtitle || '',
			issuer: it.issuer || '',
			date: it.date || '',
			dateRange: it.dateRange || '',
			description: it.description || '',
		}))
		// 如果是 certificates 之外的自定义模块，要补到 menuSections
		if (sid !== 'certificates') {
			extraMenu.push({
				id: sid,
				title: mod?.title || sid,
				icon: '📂',
				enabled: true,
				order: 99,
			})
		}
	}

	// 默认模板字段（如果调用方未提供，全部使用空对象/默认值）
	const baseDefaults = {
		templateId: 'classic',
		globalSettings: {},
		menuSections: [],
		activeSection: 'basic',
		basic: {
			layout: 'left',
			photoConfig: { visible: true },
			fieldOrder: [],
			icons: {},
			customFields: [],
		},
		...defaults,
	}

	return {
		id: payload.id || null,
		title: payload.title || '未命名简历',
		createdAt: payload.createdAt || new Date().toISOString(),
		updatedAt: payload.updatedAt || new Date().toISOString(),
		templateId: baseDefaults.templateId,
		globalSettings: { ...baseDefaults.globalSettings },
		menuSections: [...baseDefaults.menuSections, ...extraMenu],
		activeSection: baseDefaults.activeSection,
		basic: {
			...baseDefaults.basic,
			name: payload.basic?.name || '',
			title: payload.basic?.title || '',
			email: payload.basic?.email || '',
			phone: payload.basic?.phone || '',
			location: payload.basic?.location || '',
			birthDate: payload.basic?.birthDate || '',
			employementStatus: payload.basic?.employementStatus || '',
			photo: payload.basic?.photo || '',
			customFields: (payload.basic?.customFields || []).map((f, i) => ({
				id: `cf_${i}`,
				label: f.label || '',
				value: f.value || '',
				visible: true,
				icon: '🔗',
			})),
		},
		experience,
		projects,
		education,
		skillContent: payload.skillContent || '',
		selfEvaluationContent: payload.selfEvaluationContent || '',
		customData,
	}
}

// ─────────────────────────────────────────────────────────────
// 与 Spring Boot /v1/resume-data 对齐（创建/更新/查询）
// ─────────────────────────────────────────────────────────────

function safeJsonParse(val, fallback) {
	if (val == null || val === '') return fallback
	if (typeof val === 'object') return val
	try {
		return JSON.parse(val)
	} catch {
		return fallback
	}
}

/** 后端标题 → 前端 section id（与 EditPanel panelMap 一致） */
const TITLE_TO_SECTION_ID = {
	基本信息: 'basic',
	工作经历: 'experience',
	工作经验: 'experience',
	项目经历: 'projects',
	项目经验: 'projects',
	教育背景: 'education',
	教育经历: 'education',
	专业技能: 'skills',
	技能特长: 'skills',
	自我评价: 'selfEvaluation',
	个人介绍: 'selfEvaluation',
	荣誉证书: 'certificates',
	证书列表: 'certificates',
}

const SECTION_ID_ALIASES = {
	basic: 'basic',
	base: 'basic',
	baseInfo: 'basic',
	basicInfo: 'basic',
	experience: 'experience',
	workExperience: 'experience',
	work_experience: 'experience',
	projects: 'projects',
	project: 'projects',
	projectExperience: 'projects',
	project_experience: 'projects',
	education: 'education',
	educationExperience: 'education',
	education_experience: 'education',
	skills: 'skills',
	skill: 'skills',
	professionalSkills: 'skills',
	professional_skills: 'skills',
	selfEvaluation: 'selfEvaluation',
	self_evaluation: 'selfEvaluation',
	certificates: 'certificates',
	certificate: 'certificates',
}

const RENDERABLE_SECTION_IDS = new Set([
	'basic',
	'experience',
	'projects',
	'education',
	'skills',
	'selfEvaluation',
	'certificates',
])

/** 规范化菜单项：修复 enabled 默认值、sectionKey/id 映射 */
export function normalizeMenuSection(s) {
	if (!s || typeof s !== 'object') return null
	let id = s.sectionKey || s.sectionId || s.id
	const titleId = TITLE_TO_SECTION_ID[s.title]
	if (!id || /^\d+$/.test(String(id))) {
		id = titleId
	} else {
		id = SECTION_ID_ALIASES[id] || titleId || id
	}
	if (!id) return null
	const normalizedId = String(id)
	if (!RENDERABLE_SECTION_IDS.has(normalizedId) && !normalizedId.startsWith('custom')) {
		return null
	}
	return {
		id: normalizedId,
		title: s.title || DEFAULT_MENU_SECTIONS.find((item) => item.id === normalizedId)?.title || '',
		icon: s.icon || DEFAULT_MENU_SECTIONS.find((item) => item.id === normalizedId)?.icon || '📂',
		// 后端未传 enabled 时默认为 true（此前 undefined 会被当成 false 导致无法切换模块）
		enabled: s.enabled === 0 || s.enabled === false ? false : true,
		order: s.displayOrder ?? s.order ?? 0,
	}
}

/** 合并远端简历与本地草稿，避免新建后被空数据覆盖导致模板/模块丢失 */
export function mergeResumeWithDraft(draft, remote) {
	if (!remote) return draft
	if (!draft) return remote

	const pickList = (remoteList, draftList) =>
		Array.isArray(remoteList) && remoteList.length ? remoteList : (draftList || [])

	const prefer = (remoteVal, draftVal) => {
		if (remoteVal === undefined || remoteVal === null) return draftVal
		if (typeof remoteVal === 'string' && !remoteVal.trim() && typeof draftVal === 'string' && draftVal.trim()) {
			return draftVal
		}
		return remoteVal
	}

	const draftBasic = draft.basic || {}
	const remoteBasic = remote.basic || {}

	return {
		...draft,
		...remote,
		id: remote.id || draft.id,
		title: prefer(remote.title, draft.title),
		templateId: remote.templateId || draft.templateId || 'classic',
		menuSections: remote.menuSections?.length ? remote.menuSections : draft.menuSections,
		globalSettings: { ...draft.globalSettings, ...remote.globalSettings },
		activeSection: remote.activeSection || draft.activeSection,
		basic: {
			...draftBasic,
			...remoteBasic,
			name: prefer(remoteBasic.name, draftBasic.name),
			title: prefer(remoteBasic.title, draftBasic.title),
			email: prefer(remoteBasic.email, draftBasic.email),
			phone: prefer(remoteBasic.phone, draftBasic.phone),
			location: prefer(remoteBasic.location, draftBasic.location),
			birthDate: prefer(remoteBasic.birthDate, draftBasic.birthDate),
			employementStatus: prefer(remoteBasic.employementStatus, draftBasic.employementStatus),
			photo: prefer(remoteBasic.photo, draftBasic.photo),
			layout: remoteBasic.layout || draftBasic.layout,
			fieldOrder: remoteBasic.fieldOrder?.length ? remoteBasic.fieldOrder : draftBasic.fieldOrder,
			photoConfig: remoteBasic.photoConfig || draftBasic.photoConfig,
			icons: Object.keys(remoteBasic.icons || {}).length ? remoteBasic.icons : draftBasic.icons,
			customFields: remoteBasic.customFields?.length ? remoteBasic.customFields : draftBasic.customFields,
		},
		experience: pickList(remote.experience, draft.experience),
		projects: pickList(remote.projects, draft.projects),
		education: pickList(remote.education, draft.education),
		skillContent: prefer(remote.skillContent, draft.skillContent),
		selfEvaluationContent: prefer(remote.selfEvaluationContent, draft.selfEvaluationContent),
		customData: { ...draft.customData, ...remote.customData },
	}
}

/** 合并 API 菜单与默认菜单，保证空白简历也有完整可切换模块 */
export function mergeMenuSections(apiSections = []) {
	const normalized = (apiSections || []).map(normalizeMenuSection).filter(Boolean)
	const byId = new Map()
	for (const section of normalized) {
		const existing = byId.get(section.id)
		if (!existing || section.order < existing.order) {
			byId.set(section.id, section)
		}
	}
	for (const def of DEFAULT_MENU_SECTIONS) {
		if (!byId.has(def.id)) {
			byId.set(def.id, { ...def })
		}
	}
	return Array.from(byId.values()).sort((a, b) => a.order - b.order)
}

/** 前端简历 → POST/PUT 请求体（与 Swagger ResumeDataCreateRequest 对齐） */
export function toApiPayload(resume) {
	if (!resume) throw new Error('toApiPayload: resume 不能为空')

	const b = resume.basic || {}
	const certificates = (resume.customData?.certificates || []).map((it) => ({
		id: it.id,
		name: it.title || it.name || '',
		issuer: it.issuer || '',
		issueDate: it.date || it.issueDate || '',
		description: it.description || '',
		visible: it.visible === false ? 0 : 1,
	}))

	return {
		title: resume.title || '未命名简历',
		templateId: resume.templateId || 'classic',
		activeSection: resume.activeSection || 'basic',
		globalSettings: resume.globalSettings || {},
		customData: resume.customData || {},
		menuSections: mergeMenuSections(resume.menuSections || []).map((s) => ({
			sectionKey: s.id,
			title: s.title,
			icon: s.icon,
			enabled: s.enabled === false ? 0 : 1,
			displayOrder: s.order ?? 0,
		})),
		basic: {
			name: b.name || '',
			title: b.title || '',
			email: b.email || '',
			phone: b.phone || '',
			location: b.location || '',
			birthDate: b.birthDate || '',
			employementStatus: b.employementStatus || '',
			employmentStatus: b.employementStatus || '',
			photo: b.photo || '',
			layout: b.layout || 'left',
			photoConfig: b.photoConfig || {},
			fieldOrder: b.fieldOrder || [],
			icons: b.icons || {},
			customFields: (b.customFields || []).map((f) => ({
				label: f.label || '',
				value: f.value || '',
			})),
		},
		experience: (resume.experience || []).map((it) => ({
			id: it.id,
			company: it.company || '',
			position: it.position || '',
			date: it.date || '',
			dateRange: it.date || '',
			details: it.details || '',
			visible: it.visible === false ? 0 : 1,
		})),
		projects: (resume.projects || []).map((it) => ({
			id: it.id,
			name: it.name || '',
			role: it.role || '',
			link: it.link || '',
			date: it.date || '',
			dateRange: it.date || '',
			description: it.description || '',
			visible: it.visible === false ? 0 : 1,
		})),
		education: (resume.education || []).map((it) => ({
			id: it.id,
			school: it.school || '',
			major: it.major || '',
			degree: it.degree || '',
			startDate: it.startDate || '',
			endDate: it.isCurrent ? '' : (it.endDate || ''),
			current: !!it.isCurrent,
			description: it.description || '',
			visible: it.visible === false ? 0 : 1,
		})),
		certificates,
		skillContent: resume.skillContent || '',
		selfEvaluationContent: resume.selfEvaluationContent || '',
	}
}

/** 后端 ResumeDataResponse → 前端编辑器结构 */
export function fromApiResponse(data, defaults = {}) {
	if (!data || typeof data !== 'object') return null

	const resumeId = data.resumeId || data.id
	if (!resumeId) return null

	// 仅对后端已保存的菜单做规范化，不补充默认模块列表；
	// 合并/补全交由调用方（mergeResumeWithDraft 或编辑器 visibleSections）完成，
	// 以避免新建空白简历时被强制加上全部默认模块。
	const rawApiSections = (data.menuSections || []).map(normalizeMenuSection).filter(Boolean)
	const menuSections = rawApiSections

	const certificates = (data.certificates || []).map((c) => ({
		id: c.certificateId || String(c.id) || generateId(),
		visible: c.visible !== 0,
		title: c.name || '',
		issuer: c.issuer || '',
		date: c.issueDate || c.date || '',
		description: c.description || '',
	}))

	const customData = safeJsonParse(data.customData, {})
	if (certificates.length) customData.certificates = certificates

	const experience = (data.experience || []).map((it) => ({
		id: it.experienceId || it.id || generateId(),
		visible: it.visible !== 0,
		company: it.company || '',
		position: it.position || '',
		date: it.dateRange || it.date || '',
		details: it.details || '',
	}))

	const projects = (data.projects || []).map((it) => ({
		id: it.projectId || it.id || generateId(),
		visible: it.visible !== 0,
		name: it.name || '',
		role: it.role || '',
		link: it.link || '',
		date: it.dateRange || it.date || '',
		description: it.description || '',
	}))

	const education = (data.education || []).map((it) => ({
		id: it.educationId || it.id || generateId(),
		visible: it.visible !== 0,
		school: it.school || '',
		major: it.major || '',
		degree: it.degree || '',
		startDate: it.startDate || '',
		endDate: it.endDate || '',
		isCurrent: !it.endDate && !!it.startDate,
		description: it.description || '',
	}))

	// 处理 basic 信息 - 支持嵌套结构和展平结构
	const basicData = data.basic || data
	const fieldOrder = safeJsonParse(basicData.fieldOrder || data.fieldOrder, null)
	const icons = safeJsonParse(basicData.icons || data.icons, {})
	const photoConfig = safeJsonParse(basicData.photoConfig || data.photoConfig, null)
	const customFieldsRaw = safeJsonParse(basicData.customFields || data.customFields, [])
	const activeSection = data.activeSection || 'basic'

	return {
		id: resumeId,
		title: data.title || '未命名简历',
		createdAt: data.createTime || data.createdAt || new Date().toISOString(),
		updatedAt: data.updateTime || data.updatedAt || new Date().toISOString(),
		templateId: data.templateId || defaults.templateId || 'classic',
		globalSettings: {
			...DEFAULT_GLOBAL_SETTINGS,
			...safeJsonParse(data.globalSettings, {}),
			...(defaults.globalSettings || {}),
		},
		menuSections: menuSections.length
			? menuSections
			: defaults.menuSections
				? [...defaults.menuSections]
				: [],
		activeSection: menuSections.some((s) => s.id === activeSection) ? activeSection : 'basic',
		basic: {
			layout: basicData.layout || 'left',
			photoConfig: photoConfig || { ...DEFAULT_PHOTO_CONFIG },
			fieldOrder: fieldOrder || [...DEFAULT_FIELD_ORDER],
			icons,
			customFields: (customFieldsRaw || []).map((f, i) => ({
				id: f.id || `cf_${i}`,
				label: f.label || '',
				value: f.value || '',
				visible: f.visible !== false,
				icon: f.icon || '🔗',
			})),
			name: basicData.name || '',
			title: basicData.positionTitle || basicData.title || '',
			employementStatus: basicData.employmentStatus || basicData.employementStatus || '',
			email: basicData.email || '',
			phone: basicData.phone || '',
			location: basicData.location || '',
		birthDate: basicData.birthDate || '',
		photo: basicData.photo || '',
	},
	experience,
	projects,
	education,
	skillContent: data.skillContent || '',
	selfEvaluationContent: data.selfEvaluationContent || '',
	customData,
}
}

// ─────────────────────────────────────────────────────────────
// 给 Node 测试 / 单测用的导出
// ─────────────────────────────────────────────────────────────
export const _internal = { parseDateRange, buildDateRange, pickIfNonEmpty }
