/**
 * 简历模板组件索引
 */

import TemplateSelector from './TemplateSelector.vue'
import ResumePreview from './ResumePreview.vue'
import { DEFAULT_TEMPLATES, TEMPLATE_REGISTRY, getTemplateComponent, getTemplateConfig, getDefaultTemplateId } from './registry'

export {
	TemplateSelector,
	ResumePreview,
	DEFAULT_TEMPLATES,
	TEMPLATE_REGISTRY,
	getTemplateComponent,
	getTemplateConfig,
	getDefaultTemplateId
}

export default {
	TemplateSelector,
	ResumePreview
}
