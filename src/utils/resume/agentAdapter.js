/**
 * Agent 输出 ↔ 编辑器数据 适配器
 * Agent 1 (resume_parser) 输出 → 编辑器 resume 结构
 * 编辑器 resume 结构 → Agent 输入（用于后续 Agent 读取当前简历）
 */
import { generateId } from './initialData'

/**
 * Agent 1 解析结果 → 编辑器 resume 结构
 * @param {Object} parsed - Agent 1 返回的 resume_structured
 * @returns {Object} 编辑器可用的 resume 数据
 */
export function parsedToEditorResume(parsed) {
	if (!parsed || typeof parsed !== 'object') return null

	const result = {
		id: generateId(),
		title: parsed.title || '导入简历',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		templateId: 'classic',
		activeSection: 'basic',
		basic: {
			name: parsed.name || parsed.basic?.name || '',
			title: parsed.title || parsed.basic?.title || parsed.position || '',
			email: parsed.email || parsed.basic?.email || '',
			phone: parsed.phone || parsed.basic?.phone || '',
			location: parsed.location || parsed.basic?.location || '',
			birthDate: parsed.birthDate || parsed.basic?.birthDate || '',
			employementStatus: parsed.employementStatus || parsed.basic?.employementStatus || '',
			photo: '',
			photoConfig: {
				width: 90,
				height: 110,
				aspectRatio: '3:4',
				borderRadius: 'none',
				customBorderRadius: 0,
				visible: true,
			},
			fieldOrder: [
				{ id: 'f1', key: 'name', label: '姓名', visible: true },
				{ id: 'f2', key: 'title', label: '职位', visible: true },
				{ id: 'f3', key: 'email', label: '邮箱', visible: true },
				{ id: 'f4', key: 'phone', label: '电话', visible: true },
				{ id: 'f5', key: 'location', label: '所在地', visible: true },
				{ id: 'f6', key: 'birthDate', label: '出生年月', visible: true },
				{ id: 'f7', key: 'employementStatus', label: '求职状态', visible: true },
			],
			icons: {
				email: '📧',
				phone: '📱',
				location: '📍',
				birthDate: '📅',
				employementStatus: '💼',
			},
			customFields: [],
		},
		experience: parseExperienceList(parsed.experience || parsed.work_experience || []),
		projects: parseProjectList(parsed.projects || parsed.project_experience || []),
		education: parseEducationList(parsed.education || parsed.education_experience || []),
		skillContent: parseSkillContent(parsed.skills || parsed.skillContent || parsed.skill_content || ''),
		selfEvaluationContent: parseSelfEvaluation(parsed.self_evaluation || parsed.selfEvaluationContent || parsed.summary || ''),
		menuSections: [
			{ id: 'basic', title: '基本信息', icon: '👤', enabled: true, order: 0 },
			{ id: 'experience', title: '工作经历', icon: '💼', enabled: true, order: 1 },
			{ id: 'projects', title: '项目经历', icon: '🚀', enabled: true, order: 2 },
			{ id: 'education', title: '教育背景', icon: '🎓', enabled: true, order: 3 },
			{ id: 'skills', title: '专业技能', icon: '⚡', enabled: true, order: 4 },
			{ id: 'selfEvaluation', title: '自我评价', icon: '💬', enabled: false, order: 5 },
		],
		globalSettings: {
			themeColor: '#000000',
			fontFamily: 'default',
			baseFontSize: 14,
			pagePadding: 32,
			paragraphSpacing: 12,
			lineHeight: 1.5,
			sectionSpacing: 16,
			headerSize: 18,
			subheaderSize: 15,
			useIconMode: true,
			centerSubtitle: true,
		},
	}

	return result
}

function parseExperienceList(list) {
	if (!Array.isArray(list)) return []
	return list.map((item) => ({
		id: generateId(),
		company: item.company || item.company_name || '',
		position: item.position || item.job_title || '',
		date: buildDateStr(item.start_date || item.startDate, item.end_date || item.endDate, item.current),
		details: wrapHtml(item.details || item.description || item.responsibilities || ''),
	}))
}

function parseProjectList(list) {
	if (!Array.isArray(list)) return []
	return list.map((item) => ({
		id: generateId(),
		name: item.name || item.project_name || '',
		role: item.role || '',
		date: buildDateStr(item.start_date || item.startDate, item.end_date || item.endDate, item.current),
		link: item.link || item.url || '',
		description: wrapHtml(item.description || item.details || ''),
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
