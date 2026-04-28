/**
 * 简历模板完整数据结构
 */
export const defaultResumeTemplate = {
	ID: '',
	NAME: '我的简历',
	TITLE: '个人简历',
	LAYOUT: 'classical',
	COMPONENTS: [],
	GLOBAL_STYLE: {
		themeColor: '#2c3e50',
		firstTitleFontSize: '48rpx',
		secondTitleFontSize: '36rpx',
		textFontSize: '28rpx',
		secondTitleColor: '#333333',
		textFontColor: '#666666',
		secondTitleWeight: 600,
		textFontWeight: 400,
		pTopBottom: '20rpx',
		pLeftRight: '30rpx',
		modelMarginTop: '30rpx',
		modelMarginBottom: '30rpx',
		leftWidth: '35%',
		rightWidth: '65%',
		leftThemeColor: '#f5f5f5',
		rightThemeColor: '#ffffff'
	}
}

/**
 * 单个物料组件数据结构
 */
export const defaultModuleItem = {
	keyId: '',
	model: 'BASE_INFO',
	cptName: 'BASE_INFO_1',
	cptOptionsName: 'BASE_INFO_OPTIONS',
	cptTitle: '基础信息',
	layout: 'center',
	show: true,
	style: {
		textColor: '#333333',
		textFontSize: '28rpx',
		themeColor: '#2c3e50',
		pTop: '20rpx',
		pBottom: '20rpx',
		pLeftRight: '30rpx'
	},
	data: {}
}

export const MODULE_TYPES = {
	RESUME_TITLE: 'RESUME_TITLE',
	BASE_INFO: 'BASE_INFO',
	JOB_INTENTION: 'JOB_INTENTION',
	EDU_BACKGROUND: 'EDU_BACKGROUND',
	WORK_EXPERIENCE: 'WORK_EXPERIENCE',
	INTERNSHIP_EXPERIENCE: 'INTERNSHIP_EXPERIENCE',
	PROJECT_EXPERIENCE: 'PROJECT_EXPERIENCE',
	CAMPUS_EXPERIENCE: 'CAMPUS_EXPERIENCE',
	SKILL_SPECIALTIES: 'SKILL_SPECIALTIES',
	AWARDS: 'AWARDS',
	HOBBIES: 'HOBBIES',
	SELF_EVALUATION: 'SELF_EVALUATION'
}

export function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0
		const v = c === 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16)
	})
}

function htmlToPlainText(html = '') {
	return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function normalizeResumeForTemplate(resume = {}) {
	const experience = (resume.experience || []).map((item) => {
		const rawDate = item.date || ''
		const [startDate = '', endDate = ''] = rawDate.includes(' - ')
			? rawDate.split(' - ').map((v) => v.trim())
			: [item.startDate || '', item.endDate || '']
		return {
			...item,
			description: item.description || item.details || '',
			startDate: item.startDate || startDate,
			endDate: item.endDate || endDate,
		}
	})

	const projects = (resume.projects || []).map((item) => {
		const rawDate = item.date || ''
		const [startDate = '', endDate = ''] = rawDate.includes(' - ')
			? rawDate.split(' - ').map((v) => v.trim())
			: [item.startDate || '', item.endDate || '']
		return {
			...item,
			description: item.description || item.details || '',
			startDate: item.startDate || startDate,
			endDate: item.endDate || endDate,
		}
	})

	const education = (resume.education || []).map((item) => ({
		...item,
		highlights: item.highlights?.length ? item.highlights : (item.description ? [htmlToPlainText(item.description)] : []),
	}))

	const certificates = resume.certificates?.length
		? resume.certificates
		: (resume.customData?.certificates || []).map((item) => ({
			...item,
			name: item.name || item.title || '',
		}))

	const skills = resume.skills?.length
		? resume.skills
		: (resume.skillContent ? [{ category: '技能', items: [htmlToPlainText(resume.skillContent)] }] : [])

	return {
		...resume,
		summary: resume.summary || resume.selfEvaluationContent || '',
		experience,
		projects,
		education,
		certificates,
		skills,
	}
}
