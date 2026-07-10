/**
 * Agent 输出 ↔ 编辑器数据 适配器
 * Agent 1 (resume_parser) 输出 → 编辑器 resume 结构
 * 编辑器 resume 结构 → Agent 输入（用于后续 Agent 读取当前简历）
 */
import { generateId, DEFAULT_GLOBAL_SETTINGS, DEFAULT_PHOTO_CONFIG, DEFAULT_FIELD_ORDER } from './initialData'

/**
 * Agent 1 解析结果 → 编辑器 resume 结构
 * 保留所有原始数据，不丢失任何字段
 * @param {Object} parsed - Agent 1 返回的 resume_structured
 * @returns {Object} 编辑器可用的 resume 数据
 */
export function parsedToEditorResume(parsed) {
	if (!parsed || typeof parsed !== 'object') return null

	console.log('[Adapter] 原始解析数据:', parsed)

	// 处理基本信息 - 保留所有字段
	const basic = {
		name: parsed.name || parsed.basic?.name || '',
		title: parsed.title || parsed.basic?.title || parsed.position || parsed.jobIntention || '',
		email: parsed.email || parsed.basic?.email || '',
		phone: parsed.phone || parsed.basic?.phone || '',
		location: parsed.location || parsed.basic?.location || '',
		birthDate: parsed.birthDate || parsed.basic?.birthDate || '',
		employementStatus: parsed.employementStatus || parsed.employmentStatus || parsed.basic?.employementStatus || parsed.basic?.employmentStatus || '',
		photo: parsed.photo || parsed.basic?.photo || '',
		photoConfig: { ...DEFAULT_PHOTO_CONFIG, ...(parsed.basic?.photoConfig || parsed.photoConfig || {}) },
		fieldOrder: parsed.basic?.fieldOrder?.length ? parsed.basic.fieldOrder : (parsed.fieldOrder?.length ? parsed.fieldOrder : [...DEFAULT_FIELD_ORDER]),
		icons: {
			email: '📧',
			phone: '📱',
			location: '📍',
			birthDate: '📅',
			employementStatus: '💼',
			...(parsed.basic?.icons || parsed.icons || {}),
		},
		customFields: parsed.basic?.customFields || parsed.customFields || [],
		layout: parsed.basic?.layout || parsed.layout || 'left',
	}

	// 处理工作经历 - 保留所有字段
	const experience = parseExperienceList(parsed.experience || parsed.work_experience || parsed.workExperience || [])
	
	// 处理项目经历 - 保留所有字段
	const projects = parseProjectList(parsed.projects || parsed.project_experience || parsed.projectExperience || [])
	
	// 处理教育背景 - 保留所有字段
	const education = parseEducationList(parsed.education || parsed.education_experience || parsed.educationExperience || [])
	
	// 处理技能 - 保留所有字段
	const skillContent = parseSkillContent(parsed.skills || parsed.skillContent || parsed.skill_content || '')
	
	// 处理自我评价 - 保留所有字段
	const selfEvaluationContent = parseSelfEvaluation(parsed.self_evaluation || parsed.selfEvaluationContent || parsed.selfEvaluation || parsed.summary || '')

	// 处理证书 - 保留所有字段
	const certificates = parseCertificates(parsed.certificates || parsed.certificate || [])

	// 构建 menuSections
	const menuSections = buildMenuSections({
		experience: experience.length > 0,
		projects: projects.length > 0,
		education: education.length > 0,
		skills: !!skillContent,
		selfEvaluation: !!selfEvaluationContent,
		certificates: certificates.length > 0,
	})

	const result = {
		id: generateId(),
		title: parsed.title || '导入简历',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		templateId: parsed.templateId || 'classic',
		activeSection: 'basic',
		basic,
		experience,
		projects,
		education,
		skillContent,
		selfEvaluationContent,
		certificates,
		customData: parsed.customData || {},
		menuSections,
		globalSettings: { ...DEFAULT_GLOBAL_SETTINGS, ...(parsed.globalSettings || {}) },
	}

	console.log('[Adapter] 转换后数据:', result)

	return result
}

function parseExperienceList(list) {
	if (!Array.isArray(list)) return []
	return list.map((item) => {
		let details = item.details || item.description || ''
		if (!details) {
			const parts = []
			if (Array.isArray(item.responsibilities)) parts.push(item.responsibilities.join('\n'))
			else if (item.responsibilities) parts.push(item.responsibilities)
			if (Array.isArray(item.technologies) && item.technologies.length) parts.push('技术栈：' + item.technologies.join(', '))
			details = parts.join('\n')
		}
		return {
			id: generateId(),
			company: item.company || item.company_name || '',
			position: item.position || item.job_title || item.title || '',
			date: buildDateStr(item.start_date || item.startDate, item.end_date || item.endDate, item.current),
			details: wrapHtml(details),
		}
	})
}

function parseProjectList(list) {
	if (!Array.isArray(list)) return []
	return list.map((item) => ({
		id: generateId(),
		name: item.name || item.project_name || '',
		role: item.role || '',
		date: buildDateStr(item.start_date || item.startDate, item.end_date || item.endDate, item.current),
		link: item.link || item.url || '',
		description: wrapHtml(item.description || item.details || (Array.isArray(item.highlights) ? item.highlights.join('\n') : item.highlights || '') || (Array.isArray(item.technologies) && item.technologies.length ? '技术栈：' + item.technologies.join(', ') : '')),
	}))
}

function parseEducationList(list) {
	if (!Array.isArray(list)) return []
	return list.map((item) => ({
		id: generateId(),
		school: item.school || item.school_name || item.institution || '',
		major: item.major || item.field_of_study || '',
		degree: item.degree || '',
		startDate: item.start_date || item.startDate || '',
		endDate: item.end_date || item.endDate || '',
		isCurrent: !!item.current || !!item.isCurrent,
		description: wrapHtml(item.description || item.details || ''),
	}))
}

function parseSkillContent(skills) {
	if (typeof skills === 'string') return wrapHtml(skills)
	if (Array.isArray(skills)) {
		const items = skills.map((s) => typeof s === 'string' ? s : s.name || s.skill || '').filter(Boolean)
		return wrapHtml(items.join('、'))
	}
	return ''
}

function parseSelfEvaluation(text) {
	if (!text) return ''
	return wrapHtml(typeof text === 'string' ? text : JSON.stringify(text))
}

function buildDateStr(start, end, current) {
	if (!start) return ''
	if (current) return `${start} - 至今`
	if (end) return `${start} - ${end}`
	return start
}

function wrapHtml(text) {
	if (!text) return ''
	if (Array.isArray(text)) text = text.join('\n')
	if (text.startsWith('<')) return text
	const lines = text.split('\n').filter(Boolean)
	if (lines.length <= 1) return `<p>${text}</p>`
	return '<ul>' + lines.map((l) => `<li>${l}</li>`).join('') + '</ul>'
}

/**
 * 编辑器 resume → Agent 输入格式
 * 用于将当前简历数据发送给 Agent 2/3/4 等
 */
export function editorResumeToAgentInput(resume) {
	if (!resume) return null

	return {
		name: resume.basic?.name || '',
		title: resume.basic?.title || '',
		email: resume.basic?.email || '',
		phone: resume.basic?.phone || '',
		location: resume.basic?.location || '',
		experience: (resume.experience || []).map((e) => ({
			company: e.company,
			position: e.position,
			date: e.date,
			details: stripHtml(e.details),
		})),
		projects: (resume.projects || []).map((p) => ({
			name: p.name,
			role: p.role,
			date: p.date,
			description: stripHtml(p.description),
		})),
		education: (resume.education || []).map((e) => ({
			school: e.school,
			major: e.major,
			degree: e.degree,
			startDate: e.startDate,
			endDate: e.endDate,
		})),
		skills: stripHtml(resume.skillContent || ''),
		selfEvaluation: stripHtml(resume.selfEvaluationContent || ''),
	}
}

function stripHtml(html) {
	if (!html) return ''
	return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}
