import ClassicTemplate from './templates/ClassicTemplate.vue'
import CreativeTemplate from './templates/CreativeTemplate.vue'
import ProfessionalTemplate from './templates/ProfessionalTemplate.vue'
import SimpleTemplate from './templates/SimpleTemplate.vue'

/**
 * @typedef {Object} ResumeTemplate
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} thumbnail
 * @property {string} layout
 * @property {{primary: string, secondary: string, background: string, text: string}} colorScheme
 * @property {{sectionGap: number, itemGap: number, contentPadding: number}} spacing
 * @property {{layout?: 'left'|'center'|'right'}} basic
 * @property {string[]=} availableSections
 */

const classicConfig = {
	id: 'classic',
	name: '经典模板',
	description: '传统简约的简历布局，适合大多数求职场景',
	thumbnail: 'classic',
	layout: 'classic',
	colorScheme: {
		primary: '#000000',
		secondary: '#4b5563',
		background: '#ffffff',
		text: '#212529'
	},
	spacing: {
		sectionGap: 16,
		itemGap: 12,
		contentPadding: 32
	},
	basic: { layout: 'left' },
	availableSections: ['skills', 'experience', 'projects', 'education', 'selfEvaluation', 'certificates']
}

const modernConfig = {
	id: 'professional',
	name: '现代商务',
	description: '结构专业、阅读高效，适合产品与运营岗位',
	thumbnail: 'professional',
	layout: 'professional',
	colorScheme: {
		primary: '#1e3a5f',
		secondary: '#475569',
		background: '#ffffff',
		text: '#0f172a'
	},
	spacing: {
		sectionGap: 18,
		itemGap: 12,
		contentPadding: 32
	},
	basic: { layout: 'left' },
	availableSections: ['skills', 'experience', 'projects', 'education', 'selfEvaluation', 'certificates']
}

const creativeConfig = {
	id: 'creative',
	name: '创意模板',
	description: '视觉风格更鲜明，适合设计与内容岗位',
	thumbnail: 'creative',
	layout: 'creative',
	colorScheme: {
		primary: '#7c3aed',
		secondary: '#a78bfa',
		background: '#ffffff',
		text: '#1f2937'
	},
	spacing: {
		sectionGap: 18,
		itemGap: 12,
		contentPadding: 32
	},
	basic: { layout: 'center' },
	availableSections: ['skills', 'experience', 'projects', 'education', 'selfEvaluation', 'certificates']
}

const simpleConfig = {
	id: 'simple',
	name: '简约模板',
	description: '干净利落，突出项目与技能，适合技术岗',
	thumbnail: 'simple',
	layout: 'simple',
	colorScheme: {
		primary: '#2563eb',
		secondary: '#64748b',
		background: '#ffffff',
		text: '#1e293b'
	},
	spacing: {
		sectionGap: 16,
		itemGap: 10,
		contentPadding: 28
	},
	basic: { layout: 'center' },
	availableSections: ['skills', 'experience', 'projects', 'education', 'selfEvaluation', 'certificates']
}

/**
 * @typedef {{config: ResumeTemplate, component: any}} TemplateRegistryEntry
 */

/** @type {TemplateRegistryEntry[]} */
export const TEMPLATE_REGISTRY = [
	{ config: classicConfig, component: ClassicTemplate },
	{ config: modernConfig, component: ProfessionalTemplate },
	{ config: creativeConfig, component: CreativeTemplate },
	{ config: simpleConfig, component: SimpleTemplate }
]

export const DEFAULT_TEMPLATES = TEMPLATE_REGISTRY.map((entry) => entry.config)

export function getTemplateComponent(layout) {
	return TEMPLATE_REGISTRY.find((entry) => entry.config.layout === layout)?.component || ClassicTemplate
}

export function getTemplateConfig(layout) {
	return TEMPLATE_REGISTRY.find((entry) => entry.config.layout === layout)?.config || classicConfig
}

export function getDefaultTemplateId() {
	return DEFAULT_TEMPLATES[0]?.layout || 'classic'
}
