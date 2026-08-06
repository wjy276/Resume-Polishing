import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { fetchUserCareerIntent, saveUserCareerIntent } from '@/api/careerIntent'

const STORAGE_KEY = 'career_intent_store'

export const useCareerIntentStore = defineStore('careerIntent', () => {
	// State
	const userId = ref('')
	const status = ref(0) // 0=未填写，1=已填写
	const targetRole = ref('')
	const experienceYear = ref('')
	const targetCities = ref('')
	const coreSkills = ref('')
	const extraInfo = ref('')
	const jdText = ref('')
	const promptText = ref('')
	const loading = ref(false)
	const error = ref('')

	// Computed
	const isFilled = computed(() => status.value === 1)
	const isEmpty = computed(() => status.value === 0)

	const formData = computed(() => ({
		user_id: userId.value,
		status: status.value,
		target_role: targetRole.value,
		experience_year: experienceYear.value,
		target_cities: targetCities.value,
		core_skills: coreSkills.value,
		extra_info: extraInfo.value,
		jd_text: jdText.value,
		prompt_text: promptText.value,
	}))

	// 自动持久化到 localStorage
	watch([userId, status, targetRole, experienceYear, targetCities, coreSkills, extraInfo, jdText, promptText], () => {
		saveToLocal()
	}, { deep: true })

	function loadFromLocal() {
		try {
			const raw = uni.getStorageSync(STORAGE_KEY)
			if (raw) {
				const data = typeof raw === 'string' ? JSON.parse(raw) : raw
				syncFromResponse(data, false)
			}
		} catch (e) {
			console.error('load career intent from local failed:', e)
		}
	}

	function saveToLocal() {
		try {
			uni.setStorageSync(STORAGE_KEY, JSON.stringify(formData.value))
		} catch (e) {
			console.error('save career intent to local failed:', e)
		}
	}

	/**
	 * 从后端加载用户求职意向；失败或无用户ID时回退到本地
	 */
	async function fetchCareerIntent(uid) {
		loadFromLocal()

		if (!uid) {
			return { success: isFilled.value, message: isFilled.value ? '使用本地求职意向' : '缺少用户ID' }
		}

		loading.value = true
		error.value = ''
		try {
			const res = await fetchUserCareerIntent(uid)
			if (!res.ok) {
				error.value = res.message || '获取求职意向失败'
				return { success: isFilled.value, message: error.value }
			}

			const data = res.data || {}
			syncFromResponse(data)
			return { success: true, data }
		} catch (e) {
			error.value = '获取求职意向失败'
			return { success: isFilled.value, message: error.value }
		} finally {
			loading.value = false
		}
	}

	/**
	 * 保存用户求职意向。
	 * 已登录用户同步到后端；未登录用户仅保存到本地，也可供后续简历使用。
	 */
	async function saveCareerIntent(updates = {}) {
		loading.value = true
		error.value = ''
		try {
			const payload = {
				user_id: userId.value,
				status: 1,
				target_role: updates.targetRole ?? targetRole.value,
				experience_year: updates.experienceYear ?? experienceYear.value,
				target_cities: updates.targetCities ?? targetCities.value,
				core_skills: updates.coreSkills ?? coreSkills.value,
				extra_info: updates.extraInfo ?? extraInfo.value,
				jd_text: updates.jdText ?? jdText.value,
				prompt_text: buildPromptText(updates),
			}

			// 先同步本地状态，保证无论是否联网都能立即使用
			syncFromResponse(payload)

			// 有用户ID时才同步到后端
			if (userId.value) {
				const res = await saveUserCareerIntent(payload)
				if (!res.ok) {
					error.value = res.message || '保存求职意向失败'
					return { success: false, message: error.value }
				}
				syncFromResponse(res.data || {})
			}

			return { success: true, data: formData.value }
		} catch (e) {
			error.value = '保存求职意向失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
		}
	}

	/**
	 * 构建用于简历优化的提示词
	 */
	function buildPromptText(overrides = {}) {
		const tr = overrides.targetRole ?? targetRole.value
		const ey = overrides.experienceYear ?? experienceYear.value
		const tc = overrides.targetCities ?? targetCities.value
		const cs = overrides.coreSkills ?? coreSkills.value
		const ei = overrides.extraInfo ?? extraInfo.value
		const jd = overrides.jdText ?? jdText.value

		const parts = []
		if (tr) parts.push(`目标岗位：${tr}`)
		if (ey) parts.push(`工作年限：${ey}`)
		if (tc) parts.push(`目标城市：${tc}`)
		if (cs) parts.push(`核心技能：${cs}`)
		if (ei) parts.push(`补充信息：${ei}`)
		if (jd) parts.push(`目标岗位 JD：${jd}`)

		return parts.join('\n')
	}

	/**
	 * 用后端响应数据或本地数据同步状态
	 */
	function syncFromResponse(data, persist = true) {
		if (data.user_id) userId.value = data.user_id
		status.value = data.status ?? 1
		targetRole.value = data.target_role || data.targetRole || ''
		experienceYear.value = data.experience_year || data.experienceYear || ''
		targetCities.value = data.target_cities || data.targetCities || ''
		coreSkills.value = data.core_skills || data.coreSkills || ''
		extraInfo.value = data.extra_info || data.extraInfo || ''
		jdText.value = data.jd_text || data.jdText || ''
		promptText.value = data.prompt_text || data.promptText || buildPromptText()
		if (persist) saveToLocal()
	}

	/**
	 * 设置当前用户ID
	 */
	function setUserId(uid) {
		userId.value = uid
	}

	/**
	 * 重置状态
	 */
	function reset() {
		userId.value = ''
		status.value = 0
		targetRole.value = ''
		experienceYear.value = ''
		targetCities.value = ''
		coreSkills.value = ''
		extraInfo.value = ''
		jdText.value = ''
		promptText.value = ''
		error.value = ''
		loading.value = false
		try {
			uni.removeStorageSync(STORAGE_KEY)
		} catch (e) {}
	}

	// 初始化时从本地加载
	loadFromLocal()

	return {
		userId,
		status,
		targetRole,
		experienceYear,
		targetCities,
		coreSkills,
		extraInfo,
		jdText,
		promptText,
		loading,
		error,
		isFilled,
		isEmpty,
		formData,
		fetchCareerIntent,
		saveCareerIntent,
		buildPromptText,
		setUserId,
		reset,
		loadFromLocal,
		saveToLocal,
	}
})
