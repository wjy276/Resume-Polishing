/**
 * 智简优面 - 简历数据模板与新建简历引导
 * 基于鱼皮简历指南提炼，提供简历完整度检测 / 填写顺序 / 占比建议 / 写法规范，
 * 供后续 AI Agent 或前端功能复用，不改动现有简历数据结构。
 */

// ========== 类型定义（JS 版，保留原 TS 结构） ==========

/**
 * @typedef {Object} BasicInfo
 * @property {string} name
 * @property {''|'男'|'女'} gender
 * @property {number|null} age
 * @property {string} jobIntention 求职意向
 * @property {string} identity 身份：如"大三学生"、"3年工作经验"
 * @property {string} phone
 * @property {string} email
 * @property {string} wechat
 * @property {string} photo 头像URL
 * @property {string} blogUrl
 * @property {string} githubUrl
 * @property {string} portfolioUrl
 * @property {string} expectedSalary 期望薪资（建议不填）
 */

// ========== 空白简历模板（新建时生成） ==========

let idCounter = 0
export function generateId() {
	return `item_${Date.now()}_${++idCounter}`
}

/**
 * 生成完整空结构（与鱼皮指南一致）
 * 注意：当前编辑器的数据模型是另一套结构，本函数保留给后续 Agent 使用，
 * 编辑器新建简历走 createSampleResume（预填示例内容），避免影响既有功能。
 */
export function createEmptyResume() {
	return {
		templateId: 'default',
		targetPosition: '',

		basicInfo: {
			name: '',
			gender: '',
			age: null,
			jobIntention: '',
			identity: '',
			phone: '',
			email: '',
			wechat: '',
			photo: '',
			blogUrl: '',
			githubUrl: '',
			portfolioUrl: '',
			expectedSalary: '',
		},

		education: [
			{
				id: generateId(),
				school: '',
				major: '',
				degree: '',
				startDate: '',
				endDate: '',
				rank: '',
				gpa: '',
				courses: [],
				certifications: [],
			},
		],

		skills: [],
		projects: [],
		awards: [],
		workExperience: [],
		research: [],
		campusExperience: [],

		personalSummary: {
			content: '',
		},
	}
}

// ========== 编辑器数据 → 模板数据 ==========

function stripHtml(html) {
	return String(html || '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/\s+/g, ' ')
		.trim()
}

function splitDateRange(date) {
	const [s, e] = String(date || '').split(' - ')
	return {
		startDate: (s || '').trim(),
		endDate: (e || '').trim(),
	}
}

/**
 * 把编辑器现有简历数据映射成模板结构，用于完整度检测
 * @param {Object} editorResume - 编辑器中的简历（store.activeResume）
 * @returns {Object} 模板结构简历
 */
export function mapEditorResumeToTemplate(editorResume = {}) {
	const b = editorResume.basic || {}
	const eduList = Array.isArray(editorResume.education) ? editorResume.education : []
	const expList = Array.isArray(editorResume.experience) ? editorResume.experience : []
	const projList = Array.isArray(editorResume.projects) ? editorResume.projects : []
	const certList = Array.isArray(editorResume.certificates)
		? editorResume.certificates
		: (editorResume.customData?.certificates || [])
	const skillText = stripHtml(editorResume.skillContent)
	const summaryText = stripHtml(editorResume.selfEvaluationContent)
	const careerIntent = editorResume.customData?.careerIntent || {}

	return {
		templateId: editorResume.templateId || 'classic',
		targetPosition: careerIntent.targetRole || b.title || '',

		basicInfo: {
			name: b.name || '',
			gender: '',
			age: null,
			jobIntention: b.title || '',
			identity: b.employementStatus || '',
			phone: b.phone || '',
			email: b.email || '',
			wechat: '',
			photo: b.photo || '',
			blogUrl: '',
			githubUrl: '',
			portfolioUrl: '',
			expectedSalary: '',
		},

		education: eduList.map((e) => ({
			id: e.id || generateId(),
			school: e.school || '',
			major: e.major || '',
			degree: e.degree || '',
			startDate: e.startDate || '',
			endDate: e.endDate || '',
			rank: '',
			gpa: e.gpa || '',
			courses: [],
			certifications: [],
		})),

		skills: skillText
			? [
					{
						id: generateId(),
						category: '',
						skillName: skillText.slice(0, 40),
						proficiency: '熟悉',
						details: skillText,
						practice: skillText,
					},
				]
			: [],

		projects: projList.map((p) => {
			const { startDate, endDate } = splitDateRange(p.date)
			return {
				id: p.id || generateId(),
				name: p.name || '',
				startDate,
				endDate,
				description: stripHtml(p.description),
				techStack: [],
				isImportant: false,
				onlineUrl: p.link || '',
				responsibilities: [],
			}
		}),

		awards: certList.map((c) => ({
			id: c.id || generateId(),
			name: c.name || c.title || '',
			level: '',
			rank: '',
			date: c.date || '',
			category: '其他',
		})),

		workExperience: expList.map((x) => {
			const { startDate, endDate } = splitDateRange(x.date)
			return {
				id: x.id || generateId(),
				company: x.company || '',
				position: x.position || '',
				startDate,
				endDate,
				role: '',
				techStack: [],
				achievements: [],
			}
		}),

		research: [],
		campusExperience: [],

		personalSummary: {
			content: summaryText,
		},
	}
}

// ========== 模块完整度检测 ==========

/**
 * @typedef {Object} ModuleStatus
 * @property {string} key
 * @property {string} label
 * @property {boolean} filled
 * @property {number} fillRate 0-100
 * @property {boolean} required 是否必填
 * @property {string} tips 该模块的引导提示
 */

function calcBasicInfoRate(info) {
	const requiredFields = ['name', 'phone', 'jobIntention']
	const optionalFields = ['gender', 'age', 'email', 'identity', 'photo']
	const reqFilled = requiredFields.filter((f) => !!info[f]).length
	const optFilled = optionalFields.filter((f) => !!info[f]).length
	return Math.round((reqFilled / requiredFields.length) * 70 + (optFilled / optionalFields.length) * 30)
}

function calcEducationRate(eduList) {
	if (!eduList.length) return 0
	const edu = eduList[0]
	const fields = ['school', 'major', 'degree', 'startDate', 'endDate']
	const filled = fields.filter((f) => !!edu[f]).length
	return Math.round((filled / fields.length) * 100)
}

function calcSkillsRate(skills) {
	if (!skills.length) return 0
	const hasDetails = skills.filter((s) => s.details && s.practice).length
	return Math.round((hasDetails / Math.max(skills.length, 3)) * 100)
}

function calcProjectsRate(projects) {
	if (!projects.length) return 0
	let score = 0
	projects.forEach((p) => {
		if (p.name) score += 10
		if (p.description) score += 10
		if (p.techStack.length > 0) score += 10
		if (p.responsibilities.length > 0) score += 20
		if (p.responsibilities.some((r) => r.result)) score += 20
		if (p.onlineUrl) score += 15
		if (p.isImportant) score += 15
	})
	return Math.min(100, Math.round(score / Math.max(projects.length, 2)))
}

function calcAwardsRate(awards) {
	if (!awards.length) return 0
	return Math.min(100, awards.length * 25)
}

function calcWorkRate(workList) {
	if (!workList.length) return 0
	const work = workList[0]
	const fields = ['company', 'position', 'startDate', 'endDate', 'role']
	const filled = fields.filter((f) => !!work[f]).length
	const achieveRate = work.achievements.length > 0 ? 30 : 0
	return Math.round((filled / fields.length) * 70 + achieveRate)
}

/**
 * 检测简历各模块的填写状态（接收模板结构简历）
 */
export function detectResumeModules(resume) {
	return [
		{
			key: 'basicInfo',
			label: '个人信息',
			filled: !!(resume.basicInfo.name && resume.basicInfo.phone),
			fillRate: calcBasicInfoRate(resume.basicInfo),
			required: true,
			tips: '一行放多个信息，保持精简。建议放蓝底/白底证件照。',
		},
		{
			key: 'education',
			label: '教育背景',
			filled: resume.education.some((e) => !!e.school && !!e.major),
			fillRate: calcEducationRate(resume.education),
			required: true,
			tips: '排名高于前20%建议写上，相关高分课程可补分数。',
		},
		{
			key: 'skills',
			label: '专业技能',
			filled: resume.skills.length > 0,
			fillRate: calcSkillsRate(resume.skills),
			required: true,
			tips: '分行罗列别堆一段话，每项补技术细节+能做什么。',
		},
		{
			key: 'projects',
			label: '项目经历',
			filled: resume.projects.length > 0,
			fillRate: calcProjectsRate(resume.projects),
			required: true,
			tips: '简历核心！介绍1-2句带过，重点写你做了什么+效果。',
		},
		{
			key: 'awards',
			label: '荣誉奖项',
			filled: resume.awards.length > 0,
			fillRate: calcAwardsRate(resume.awards),
			required: false,
			tips: '按认可度从高到低排列，编程相关的优先。',
		},
		{
			key: 'workExperience',
			label: '工作/实习经历',
			filled: resume.workExperience.length > 0,
			fillRate: calcWorkRate(resume.workExperience),
			required: false,
			tips: '突出你的地位和贡献，写具体技术和量化成果。',
		},
		{
			key: 'research',
			label: '科研经历',
			filled: resume.research.length > 0,
			fillRate: 0,
			required: false,
			tips: '有科研成果建议写上，体现学术能力。',
		},
		{
			key: 'campusExperience',
			label: '校园经历',
			filled: resume.campusExperience.length > 0,
			fillRate: 0,
			required: false,
			tips: '社团/学生干部经历，体现组织和沟通能力。',
		},
		{
			key: 'personalSummary',
			label: '个人优势',
			filled: !!resume.personalSummary.content,
			fillRate: resume.personalSummary.content ? 100 : 0,
			required: false,
			tips: '2-3句话概括核心竞争力，别写空话。',
		},
	]
}

/**
 * 检测编辑器简历各模块的填写状态（内部先映射成模板结构）
 */
export function detectEditorResumeModules(editorResume = {}) {
	return detectResumeModules(mapEditorResumeToTemplate(editorResume))
}

/**
 * 判断简历当前模式：writing / optimizing / mixed
 */
export function detectResumeMode(resume) {
	const modules = detectResumeModules(resume)
	const requiredModules = modules.filter((m) => m.required)
	const filledRequired = requiredModules.filter((m) => m.filled).length

	if (filledRequired <= 1) return 'writing' // 空白简历
	if (filledRequired >= 3) return 'optimizing' // 已有内容
	return 'mixed' // 部分填写
}

/**
 * 判断编辑器简历当前模式
 */
export function detectEditorResumeMode(editorResume = {}) {
	return detectResumeMode(mapEditorResumeToTemplate(editorResume))
}

// ========== 推荐填写顺序 ==========

export function getFillOrder() {
	return [
		'basicInfo', // 1. 先填基本信息
		'education', // 2. 教育背景
		'skills', // 3. 专业技能
		'projects', // 4. 项目经历（核心）
		'workExperience', // 5. 实习经历
		'awards', // 6. 荣誉奖项
		'campusExperience', // 7. 校园经历
		'research', // 8. 科研经历
		'personalSummary', // 9. 个人优势
	]
}

// ========== 占比建议（用于前端展示） ==========

export const SECTION_WEIGHT = {
	basicInfo: { min: 5, max: 10 },
	education: { min: 10, max: 15 },
	skills: { min: 20, max: 30 },
	projects: { min: 30, max: 50 }, // 核心！占比最大
	awards: { min: 0, max: 10 },
	workExperience: { min: 0, max: 15 },
	research: { min: 0, max: 10 },
	campusExperience: { min: 0, max: 10 },
	personalSummary: { min: 0, max: 5 },
}

// ========== 写法规范（给AI做内部参考，同时展示给用户） ==========

export const WRITING_RULES = {
	basicInfo: {
		do: [
			'同类信息放一行，保持间距合理',
			'照片清晰端正，蓝底/白底均可',
			'个人网站链接保持简短好记',
		],
		dont: [
			'每个信息独占一行，浪费空间',
			'放复杂冗长的URL',
			'写期望薪资（除非特殊情况）',
		],
	},
	skills: {
		do: [
			'分行罗列，同一类技术写同一行',
			'每项补充掌握的技术细节和知识点',
			'加半句"能用它做什么"体现实践力',
			'了解的技术对比可以补充，体现选型能力',
		],
		dont: [
			'一句话堆所有技术名词',
			'只写技术名不写细节',
			'只写理论不写实践',
		],
	},
	projects: {
		do: [
			'项目介绍1-2句带过，重点写你做的事',
			'分点逐行写，每点独占一行',
			'万能公式：在xx条件下，用xx技术实现xx，实测带来xx效果',
			'"实测"二字突出真实性',
			'尽量放可在线访问的项目地址',
			'大众化项目改名换皮+自主新功能，增加区分度',
		],
		dont: [
			'项目介绍过多，自己工作没写多少',
			'写得太笼统不具体',
			'硬编没有的成果数据',
			'不写线上项目地址',
		],
	},
	workExperience: {
		do: [
			'突出你在公司的地位和角色',
			'写具体用到的技术',
			'写做了什么成果，不是学到了什么',
		],
		dont: [
			'"参与文档编写"这种模糊描述',
			'"参与系统开发"不说明技术',
			'写"收获很大""学到了很多"',
		],
	},
	awards: {
		do: [
			'按认可度从高到低排列',
			'编程相关竞赛优先',
			'非编程奖项也可以写（总比没有好）',
		],
		dont: ['把无关紧要的奖放前面'],
	},
}

// ========== 模板核心结构提示（渲染给用户看） ==========

export const STRUCTURE_HINTS = [
	{
		id: 'project-formula',
		icon: '🚀',
		title: '项目经历 · 万能公式',
		steps: ['背景条件', '所用技术', '做了什么', '量化效果'],
		example: '例：在日活 100w 的业务背景下，用 Redis 缓存热点数据，实现接口响应从 300ms 降到 40ms。',
	},
	{
		id: 'skill-structure',
		icon: '⚡',
		title: '专业技能 · 别只写技术名',
		steps: ['技术名', '掌握程度', '技术细节', '实践经历'],
		example: '例：熟悉 Vue3 + TypeScript，掌握组合式 API 与响应式原理，曾用于企业后台系统开发。',
	},
]
