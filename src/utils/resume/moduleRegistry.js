/**
 * 模块组件注册表
 * 用于动态加载不同的简历模块组件
 */

const moduleComponents = {
	BASE_INFO_1: () => import('@/components/resume/modules/BaseInfo1.vue'),
	BASE_INFO_2: () => import('@/components/resume/modules/BaseInfo2.vue'),
	EDU_BACKGROUND_1: () => import('@/components/resume/modules/EduBackground1.vue'),
	WORK_EXPERIENCE_1: () => import('@/components/resume/modules/WorkExperience1.vue'),
	JOB_INTENTION_1: () => import('@/components/resume/modules/JobIntention1.vue'),
	SELF_EVALUATION_1: () => import('@/components/resume/modules/SelfEvaluation1.vue')
}

const editorComponents = {
	BASE_INFO_OPTIONS: () => import('@/components/resume/editors/BaseInfoEditor.vue'),
	EDU_BACKGROUND_OPTIONS: () => import('@/components/resume/editors/EduBackgroundEditor.vue'),
	WORK_EXPERIENCE_OPTIONS: () => import('@/components/resume/editors/WorkExperienceEditor.vue')
}

export function getModuleComponent(module) {
	if (!module?.cptName) return moduleComponents.BASE_INFO_1
	return moduleComponents[module.cptName] || moduleComponents.BASE_INFO_1
}

export function getEditorComponent(module) {
	if (!module?.cptOptionsName) return editorComponents.BASE_INFO_OPTIONS
	return editorComponents[module.cptOptionsName] || editorComponents.BASE_INFO_OPTIONS
}

export function registerModuleComponent(name, component) {
	moduleComponents[name] = component
}

export function registerEditorComponent(name, component) {
	editorComponents[name] = component
}
