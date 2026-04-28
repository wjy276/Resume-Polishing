export const THEME_COLORS = [
	'#000000', '#1A1A1A', '#333333', '#4D4D4D',
	'#0047AB', '#8B0000', '#FF4500', '#4B0082', '#2E8B57',
]

export const STANDARD_MODULES = {
	skills:         { id: 'skills',         icon: '⚡', title: '专业技能' },
	experience:     { id: 'experience',     icon: '💼', title: '工作经历' },
	projects:       { id: 'projects',       icon: '🚀', title: '项目经历' },
	education:      { id: 'education',      icon: '🎓', title: '教育背景' },
	selfEvaluation: { id: 'selfEvaluation', icon: '💬', title: '自我评价' },
	certificates:   { id: 'certificates',   icon: '🏆', title: '荣誉证书' },
}

export const DEFAULT_FIELD_ORDER = [
	{ id: 'f1', key: 'name',              label: '姓名',     visible: true },
	{ id: 'f2', key: 'title',             label: '职位',     visible: true },
	{ id: 'f3', key: 'email',             label: '邮箱',     visible: true },
	{ id: 'f4', key: 'phone',             label: '电话',     visible: true },
	{ id: 'f5', key: 'location',          label: '所在地',   visible: true },
	{ id: 'f6', key: 'birthDate',         label: '出生年月', visible: true },
	{ id: 'f7', key: 'employementStatus', label: '求职状态', visible: true },
]

export const DEFAULT_PHOTO_CONFIG = {
	width: 90,
	height: 110,
	aspectRatio: '3:4',
	borderRadius: 'none',
	customBorderRadius: 0,
	visible: true,
}

export const DEFAULT_GLOBAL_SETTINGS = {
	themeColor:       '#000000',
	fontFamily:       'default',
	baseFontSize:     14,
	pagePadding:      32,
	paragraphSpacing: 12,
	lineHeight:       1.5,
	sectionSpacing:   16,
	headerSize:       18,
	subheaderSize:    15,
	useIconMode:      true,
	centerSubtitle:   true,
}

export const DEFAULT_MENU_SECTIONS = [
	{ id: 'basic',          title: '基本信息', icon: '👤', enabled: true,  order: 0 },
	{ id: 'experience',     title: '工作经历', icon: '💼', enabled: true,  order: 1 },
	{ id: 'projects',       title: '项目经历', icon: '🚀', enabled: true,  order: 2 },
	{ id: 'education',      title: '教育背景', icon: '🎓', enabled: true,  order: 3 },
	{ id: 'skills',         title: '专业技能', icon: '⚡', enabled: true,  order: 4 },
	{ id: 'selfEvaluation', title: '自我评价', icon: '💬', enabled: false, order: 5 },
]

export const initialResumeState = {
	title: '新建简历',
	templateId: 'classic',
	basic: {
		name: '宋哈娜',
		title: '高级前端工程师',
		employementStatus: '离职',
		email: 'zhangsan@example.com',
		phone: '13800138000',
		location: '北京市朝阳区',
		birthDate: '2025-01',
		photo: '',
		photoConfig: { ...DEFAULT_PHOTO_CONFIG },
		fieldOrder: [...DEFAULT_FIELD_ORDER],
		icons: {
			email: '📧',
			phone: '📱',
			location: '📍',
			birthDate: '📅',
			employementStatus: '💼',
		},
		customFields: [
			{ id: 'cf1', label: '个人网站', value: 'https://zhangsan.dev', icon: '🌐', visible: true },
		],
		layout: 'left',
	},
	education: [
		{
			id: 'edu1',
			school: '北京大学',
			major: '计算机科学与技术',
			degree: '本科',
			startDate: '2013-09',
			endDate: '2017-06',
			gpa: '',
			description: '主修课程：数据结构、算法设计、操作系统、计算机网络、Web开发技术',
			visible: true,
		},
	],
	experience: [
		{
			id: 'exp1',
			company: '某互联网公司',
			position: '高级前端工程师',
			date: '2021-07 - 2026-12',
			details: '<ul><li>负责公司核心产品前端架构设计与开发</li><li>主导前端工程化体系建设，提升团队研发效率约 30%</li><li>技术选型及架构设计，推动组件库建设</li></ul>',
			visible: true,
		},
		{
			id: 'exp2',
			company: '另一家公司',
			position: '前端开发工程师',
			date: '2019-06 - 2021-06',
			details: '<ul><li>参与公司核心业务系统开发维护</li><li>基于 React 技术栈构建高质量 Web 应用</li></ul>',
			visible: true,
		},
	],
	projects: [
		{
			id: 'proj1',
			name: '企业级低代码平台',
			role: '负责人',
			date: '2022-06 - 2023-12',
			description: '<ul><li>基于 React 搭建可视化搭建平台，服务数百家合作商户</li><li>设计拖拽编排引擎，支持组件自由组合</li><li>实现属性配置、事件绑定等低代码核心能力</li></ul>',
			visible: true,
			link: '',
		},
	],
	certificates: [],
	customData: {},
	skillContent: '<ul><li>前端框架：熟悉 React、Vue.js，熟悉 Next.js、Nuxt.js 等 SSR 框架</li><li>开发语言：TypeScript、JavaScript(ES6+)、HTML5、CSS3</li><li>工程化工具：Webpack、Vite、Rollup、Babel、ESLint</li><li>测试工具：Jest、React Testing Library、Cypress</li></ul>',
	selfEvaluationContent: '<p>5 年前端开发经验，熟悉主流技术栈，有大型项目架构设计经验，具备良好的团队协作和沟通能力。</p>',
	activeSection: 'basic',
	menuSections: [...DEFAULT_MENU_SECTIONS],
	globalSettings: { ...DEFAULT_GLOBAL_SETTINGS },
}

export function generateId() {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function createNewResume(overrides = {}) {
	const now = new Date().toISOString()
	return {
		...JSON.parse(JSON.stringify(initialResumeState)),
		id: generateId(),
		createdAt: now,
		updatedAt: now,
		...overrides,
	}
}
