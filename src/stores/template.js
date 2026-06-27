/**
 * 模板状态管理
 * 管理社区模板的加载、使用、保存
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
	fetchTemplateList,
	fetchTemplateDetail,
	createTemplateApi,
	useTemplateApi,
	fetchHotTemplates,
} from '@/api/template'
import { toApiPayload, fromApiResponse } from '@/utils/resume/serializer'
import { generateId } from '@/utils/resume/initialData'

export const useTemplateStore = defineStore('template', () => {
	const templates = ref([])
	const hotTemplates = ref([])
	const loading = ref(false)
	const error = ref('')

	const allTemplates = computed(() => templates.value)

	async function loadTemplates(params = {}) {
		loading.value = true
		error.value = ''
		try {
			const res = await fetchTemplateList(params)
			if (res.ok) {
				const records = res.data?.records || (Array.isArray(res.data) ? res.data : [])
				templates.value = records.map(normalizeTemplate)
				return { success: true, count: templates.value.length }
			} else {
				error.value = res.message || '加载模板失败'
				return { success: false, message: error.value }
			}
		} catch (e) {
			error.value = '加载模板失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
		}
	}

	async function loadHotTemplates(limit = 10) {
		try {
			const res = await fetchHotTemplates(limit)
			if (res.ok) {
				const records = Array.isArray(res.data) ? res.data : []
				hotTemplates.value = records.map(normalizeTemplate)
				return { success: true }
			}
			return { success: false }
		} catch (e) {
			return { success: false }
		}
	}

	async function getTemplate(templateId) {
		try {
			const res = await fetchTemplateDetail(templateId)
			if (res.ok) {
				return { success: true, data: normalizeTemplate(res.data) }
			}
			return { success: false, message: res.message }
		} catch (e) {
			return { success: false, message: '获取模板失败' }
		}
	}

	async function saveAsTemplate(resumeData, options = {}) {
		const { name = '', description = '', category = 'custom', isPublic = true } = options

		const templatePayload = {
			templateId: generateId(),
			name: name || resumeData.title || '未命名模板',
			description: description || '',
			category,
			isPublic: isPublic ? 1 : 0,
			thumbnail: '',
			templateData: JSON.stringify(extractTemplateData(resumeData)),
		}

		try {
			const res = await createTemplateApi(templatePayload)
			if (res.ok) {
				return { success: true, data: res.data }
			}
			return { success: false, message: res.message || '保存模板失败' }
		} catch (e) {
			return { success: false, message: '保存模板失败' }
		}
	}

	async function useTemplate(templateId) {
		try {
			const res = await useTemplateApi(templateId)
			if (res.ok) {
				return { success: true, data: res.data }
			}
			return { success: false, message: res.message || '使用模板失败' }
		} catch (e) {
			return { success: false, message: '使用模板失败' }
		}
	}

	function normalizeTemplate(t) {
		if (!t) return null
		let templateData = {}
		if (typeof t.templateData === 'string') {
			try { templateData = JSON.parse(t.templateData) } catch {}
		} else if (typeof t.templateData === 'object') {
			templateData = t.templateData
		}
		return {
			id: t.templateId || t.id,
			name: t.name || '未命名模板',
			description: t.description || '',
			category: t.category || 'custom',
			isPublic: t.isPublic === 1 || t.isPublic === true,
			thumbnail: t.thumbnail || '',
			author: t.author || t.username || '匿名',
			usageCount: t.usageCount || 0,
			createdAt: t.createTime || t.createdAt,
			templateData,
		}
	}

	function extractTemplateData(resume) {
		return {
			templateId: resume.templateId || 'classic',
			globalSettings: resume.globalSettings || {},
			menuSections: (resume.menuSections || []).map(s => ({
				id: s.id,
				title: s.title,
				icon: s.icon,
				enabled: s.enabled,
				order: s.order,
			})),
			basic: {
				layout: resume.basic?.layout || 'left',
				photoConfig: resume.basic?.photoConfig || {},
				fieldOrder: resume.basic?.fieldOrder || [],
				icons: resume.basic?.icons || {},
				customFields: resume.basic?.customFields || [],
			},
		}
	}

	return {
		templates,
		hotTemplates,
		loading,
		error,
		allTemplates,
		loadTemplates,
		loadHotTemplates,
		getTemplate,
		saveAsTemplate,
		useTemplate,
	}
})
