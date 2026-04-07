/**
 * 简历数据结构定义
 * 用于简历渲染和PDF导出
 */

export const resumeDataStructure = {
	// 基本信息
	basic: {
		name: '',           // 姓名
		job: '',            // 求职岗位
		phone: '',          // 电话
		email: '',          // 邮箱
		location: '',       // 所在地
		avatar: ''          // 头像URL
	},

	// 个人简介
	summary: '',

	// 教育背景
	education: [
		{
			school: '',      // 学校名称
			major: '',       // 专业
			degree: '',      // 学历
			startDate: '',   // 开始时间
			endDate: '',     // 结束时间
			gpa: '',         // GPA
			highlights: []   // 亮点/荣誉
		}
	],

	// 工作经历
	experience: [
		{
			company: '',     // 公司名称
			position: '',    // 职位
			startDate: '',   // 开始时间
			endDate: '',     // 结束时间
			location: '',    // 工作地点
			description: '', // 工作描述
			achievements: [] // 主要成就
		}
	],

	// 项目经验
	projects: [
		{
			name: '',        // 项目名称
			role: '',        // 担任角色
			startDate: '',   // 开始时间
			endDate: '',     // 结束时间
			description: '', // 项目描述
			techStack: [],   // 技术栈
			highlights: []   // 项目亮点
		}
	],

	// 技能列表
	skills: [
		{
			category: '',    // 技能分类
			items: []        // 技能项
		}
	],

	// 证书/荣誉
	certificates: [
		{
			name: '',        // 证书名称
			issuer: '',      // 颁发机构
			date: ''         // 获得时间
		}
	]
}

/**
 * 模板类型定义
 */
export const templateTypes = {
	SIMPLE: 'simple',       // 简约模板
	PROFESSIONAL: 'professional', // 专业模板
	CREATIVE: 'creative',   // 创意模板
	CLASSIC: 'classic'      // 经典模板
}

/**
 * 模板配置
 */
export const templateConfig = {
	[templateTypes.SIMPLE]: {
		name: '简约风格',
		description: '简洁大方，适合技术岗位',
		preview: '/static/templates/simple-preview.png',
		colors: {
			primary: '#2563eb',
			secondary: '#64748b',
			text: '#1e293b',
			background: '#ffffff',
			accent: '#f1f5f9'
		}
	},
	[templateTypes.PROFESSIONAL]: {
		name: '专业商务',
		description: '稳重专业，适合管理岗位',
		preview: '/static/templates/professional-preview.png',
		colors: {
			primary: '#1e3a5f',
			secondary: '#475569',
			text: '#0f172a',
			background: '#ffffff',
			accent: '#e2e8f0'
		}
	},
	[templateTypes.CREATIVE]: {
		name: '创意设计',
		description: '个性鲜明，适合设计岗位',
		preview: '/static/templates/creative-preview.png',
		colors: {
			primary: '#7c3aed',
			secondary: '#a78bfa',
			text: '#1f2937',
			background: '#ffffff',
			accent: '#f5f3ff'
		}
	},
	[templateTypes.CLASSIC]: {
		name: '经典传统',
		description: '传统正式，适合国企/事业单位',
		preview: '/static/templates/classic-preview.png',
		colors: {
			primary: '#000000',
			secondary: '#374151',
			text: '#111827',
			background: '#ffffff',
			accent: '#f3f4f6'
		}
	}
}

/**
 * 将后端返回的数据转换为简历数据结构
 * @param {Object} backendData 后端返回的数据
 * @returns {Object} 标准化的简历数据
 */
export function transformBackendData(backendData) {
	const result = {
		basic: {
			name: backendData.name || '',
			job: backendData.job || '',
			phone: backendData.phone || '',
			email: backendData.email || '',
			location: backendData.location || '',
			avatar: backendData.avatar || ''
		},
		summary: backendData.Personal_Introduction || backendData.Person_original || '',
		education: parseEducation(backendData.Educational_Background || backendData.Educational_original),
		experience: parseExperience(backendData.Work_Experience || backendData.Work_original),
		projects: parseProjects(backendData.Project_Experience || backendData.Project_original),
		skills: parseSkills(backendData.skills || ''),
		certificates: parseCertificates(backendData.certificates || '')
	}
	return result
}

/**
 * 解析教育背景
 */
function parseEducation(text) {
	if (!text) return []
	// 简单解析，实际可能需要更复杂的逻辑
	const lines = text.split('\n').filter(line => line.trim())
	const education = []

	let currentEdu = null
	for (const line of lines) {
		if (line.includes('大学') || line.includes('学院') || line.includes('学校')) {
			if (currentEdu) education.push(currentEdu)
			currentEdu = {
				school: line.trim(),
				major: '',
				degree: '',
				startDate: '',
				endDate: '',
				gpa: '',
				highlights: []
			}
		} else if (currentEdu) {
			if (line.includes('专业')) {
				currentEdu.major = line.replace('专业：', '').replace('专业:', '').trim()
			} else if (line.includes('学历') || line.includes('本科') || line.includes('硕士') || line.includes('博士')) {
				currentEdu.degree = line.trim()
			} else {
				currentEdu.highlights.push(line.trim())
			}
		}
	}
	if (currentEdu) education.push(currentEdu)

	return education.length > 0 ? education : [{ school: text, major: '', degree: '', startDate: '', endDate: '', gpa: '', highlights: [] }]
}

/**
 * 解析工作经历
 */
function parseExperience(text) {
	if (!text) return []
	const lines = text.split('\n').filter(line => line.trim())
	const experience = []

	let currentExp = null
	for (const line of lines) {
		if (line.includes('公司') || line.includes('有限公司') || line.includes('科技')) {
			if (currentExp) experience.push(currentExp)
			currentExp = {
				company: line.trim(),
				position: '',
				startDate: '',
				endDate: '',
				location: '',
				description: '',
				achievements: []
			}
		} else if (currentExp) {
			if (line.includes('职位') || line.includes('岗位')) {
				currentExp.position = line.replace('职位：', '').replace('职位:', '').trim()
			} else if (line.includes('负责') || line.includes('工作')) {
				currentExp.description = line.trim()
			} else {
				currentExp.achievements.push(line.trim())
			}
		}
	}
	if (currentExp) experience.push(currentExp)

	return experience.length > 0 ? experience : [{ company: text, position: '', startDate: '', endDate: '', location: '', description: '', achievements: [] }]
}

/**
 * 解析项目经验
 */
function parseProjects(text) {
	if (!text) return []
	const lines = text.split('\n').filter(line => line.trim())
	const projects = []

	let currentProject = null
	for (const line of lines) {
		if (line.includes('项目') && !line.includes('技术')) {
			if (currentProject) projects.push(currentProject)
			currentProject = {
				name: line.replace('项目名称：', '').replace('项目名称:', '').replace('项目：', '').trim(),
				role: '',
				startDate: '',
				endDate: '',
				description: '',
				techStack: [],
				highlights: []
			}
		} else if (currentProject) {
			if (line.includes('角色') || line.includes('负责')) {
				currentProject.role = line.trim()
			} else if (line.includes('技术栈') || line.includes('技术')) {
				currentProject.techStack = line.replace('技术栈：', '').replace('技术栈:', '').split(/[,，、]/).map(s => s.trim())
			} else {
				currentProject.highlights.push(line.trim())
			}
		}
	}
	if (currentProject) projects.push(currentProject)

	return projects.length > 0 ? projects : [{ name: text, role: '', startDate: '', endDate: '', description: '', techStack: [], highlights: [] }]
}

/**
 * 解析技能
 */
function parseSkills(text) {
	if (!text) return []
	const categories = text.split(/[,，;；\n]/).filter(s => s.trim())
	return [{
		category: '专业技能',
		items: categories
	}]
}

/**
 * 解析证书
 */
function parseCertificates(text) {
	if (!text) return []
	const certs = text.split(/[,，;；\n]/).filter(s => s.trim())
	return certs.map(cert => ({
		name: cert.trim(),
		issuer: '',
		date: ''
	}))
}
