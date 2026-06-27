/**
 * AI 简历优化流程状态管理
 * 管理优化会话、各 Agent 输出、步骤流转
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
	createSession,
	getSession,
	updateSessionState,
	deleteSession,
	uploadResumeFile,
	uploadResumeText,
	runAgent,
	runPipeline,
} from '@/api/ai'
import { parsedToEditorResume, editorResumeToAgentInput } from '@/utils/resume/agentAdapter'

export const OPTIMIZE_STEPS = [
	{ key: 'init', label: '初始化', icon: '⚙' },
	{ key: 'parse', label: '解析简历', icon: '📄' },
	{ key: 'career', label: '职业方向', icon: '🧭' },
	{ key: 'jd', label: '目标岗位', icon: '🎯' },
	{ key: 'diagnosis', label: '诊断分析', icon: '📊' },
	{ key: 'optimize', label: '模块优化', icon: '✨' },
	{ key: 'done', label: '完成', icon: '✅' },
]

export const useAIOptimizeStore = defineStore('aiOptimize', () => {
	const sessionId = ref(null)
	const currentStep = ref('init')
	const loading = ref(false)
	const loadingAgent = ref('')
	const error = ref('')

	const parsedResumeRaw = ref(null)
	const parsedResumeForEditor = ref(null)
	const parseConfirmed = ref(false)

	const careerProfile = ref(null)
	const jdStructured = ref(null)
	const diagnosisReport = ref(null)
	const optimizationPlan = ref(null)
	const moduleResults = ref({})
	const factCheckResult = ref(null)

	const chatMessages = ref([])
	const jdText = ref('')

	const panelVisible = ref(false)

	const currentStepIndex = computed(() =>
		OPTIMIZE_STEPS.findIndex((s) => s.key === currentStep.value)
	)

	const isStepCompleted = (stepKey) => {
		const idx = OPTIMIZE_STEPS.findIndex((s) => s.key === stepKey)
		return idx < currentStepIndex.value
	}

	const canGoToStep = (stepKey) => {
		const idx = OPTIMIZE_STEPS.findIndex((s) => s.key === stepKey)
		return idx <= currentStepIndex.value
	}

	async function initSession(hasResume = true, userQuery = '') {
		loading.value = true
		error.value = ''

		try {
			const res = await createSession({ hasResume, userQuery })
			if (!res.ok) {
				error.value = res.message || '创建会话失败'
				return { success: false, message: error.value }
			}

			sessionId.value = res.data?.session_id || res.data?.id
			currentStep.value = hasResume ? 'parse' : 'career'
			chatMessages.value = []

			return { success: true, sessionId: sessionId.value }
		} catch (e) {
			error.value = '创建会话失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
		}
	}

	async function uploadAndParse(file) {
		if (!sessionId.value) {
			const initRes = await initSession(true, '')
			if (!initRes.success) return initRes
		}

		loading.value = true
		loadingAgent.value = 'resume_parser'
		error.value = ''

		try {
			const uploadRes = await uploadResumeFile(sessionId.value, file)
			if (!uploadRes.ok) {
				error.value = uploadRes.message || '上传失败'
				return { success: false, message: error.value }
			}

			const parseRes = await runAgent('resume_parser', sessionId.value)
			if (!parseRes.ok) {
				error.value = parseRes.message || '解析失败'
				return { success: false, message: error.value }
			}

			const rawParsed = parseRes.data?.resume_structured || parseRes.data
			parsedResumeRaw.value = rawParsed
			parsedResumeForEditor.value = parsedToEditorResume(rawParsed)
			parseConfirmed.value = false
			currentStep.value = 'parse'

			return { success: true, data: parsedResumeForEditor.value }
		} catch (e) {
			error.value = '解析失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
			loadingAgent.value = ''
		}
	}

	async function uploadTextAndParse(text) {
		if (!sessionId.value) {
			const initRes = await initSession(true, '')
			if (!initRes.success) return initRes
		}

		loading.value = true
		loadingAgent.value = 'resume_parser'
		error.value = ''

		try {
			const uploadRes = await uploadResumeText(sessionId.value, text)
			if (!uploadRes.ok) {
				error.value = uploadRes.message || '上传失败'
				return { success: false, message: error.value }
			}

			const parseRes = await runAgent('resume_parser', sessionId.value)
			if (!parseRes.ok) {
				error.value = parseRes.message || '解析失败'
				return { success: false, message: error.value }
			}

			const rawParsed = parseRes.data?.resume_structured || parseRes.data
			parsedResumeRaw.value = rawParsed
			parsedResumeForEditor.value = parsedToEditorResume(rawParsed)
			parseConfirmed.value = false
			currentStep.value = 'parse'

			return { success: true, data: parsedResumeForEditor.value }
		} catch (e) {
			error.value = '解析失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
			loadingAgent.value = ''
		}
	}

	function confirmParsedResume() {
		parseConfirmed.value = true
		currentStep.value = 'career'
	}

	async function runAgentByKey(agentKey, extra = {}) {
		if (!sessionId.value) return { success: false, message: '请先创建会话' }
		loading.value = true
		loadingAgent.value = agentKey
		error.value = ''

		try {
			const res = await runAgent(agentKey, sessionId.value, extra)
			if (!res.ok) {
				error.value = res.message || `${agentKey} 运行失败`
				return { success: false, message: error.value }
			}
			return { success: true, data: res.data }
		} catch (e) {
			error.value = `${agentKey} 运行失败`
			return { success: false, message: error.value }
		} finally {
			loading.value = false
			loadingAgent.value = ''
		}
	}

	async function runCareerAgent(messages = []) {
		const extra = { messages }
		if (parsedResumeRaw.value) {
			extra.resume_structured = parsedResumeRaw.value
		}
		const res = await runAgentByKey('career_profiler', extra)
		if (res.success && res.data) {
			careerProfile.value = res.data.career_profile || res.data
			chatMessages.value = res.data.messages || messages
		}
		return res
	}

	async function runJDAgent(jdInput) {
		const res = await runAgentByKey('jd_matcher', { jd_text: jdInput })
		if (res.success && res.data) {
			jdStructured.value = res.data.jd_structured || res.data
			jdText.value = jdInput
		}
		return res
	}

	async function runDiagnosisAgent() {
		const res = await runAgentByKey('resume_diagnostician')
		if (res.success && res.data) {
			diagnosisReport.value = res.data.diagnosis_report || res.data
			currentStep.value = 'diagnosis'
		}
		return res
	}

	async function runStrategyAgent() {
		const res = await runAgentByKey('strategy_planner')
		if (res.success && res.data) {
			optimizationPlan.value = res.data.optimization_plan || res.data
		}
		return res
	}

	async function runModuleOptimizer(moduleId, style = 'standard') {
		const res = await runAgentByKey('module_optimizer', {
			module: moduleId,
			style,
		})
		if (res.success && res.data) {
			moduleResults.value[moduleId] = res.data
		}
		return res
	}

	async function runFactChecker() {
		const res = await runAgentByKey('fact_checker')
		if (res.success && res.data) {
			factCheckResult.value = res.data
		}
		return res
	}

	async function refreshSession() {
		if (!sessionId.value) return { success: false }
		const res = await getSession(sessionId.value)
		if (res.ok && res.data) {
			const state = res.data.state || res.data
			if (state.career_profile) careerProfile.value = state.career_profile
			if (state.jd_structured) jdStructured.value = state.jd_structured
			if (state.diagnosis_report) diagnosisReport.value = state.diagnosis_report
			if (state.optimization_plan) optimizationPlan.value = state.optimization_plan
			return { success: true, state }
		}
		return { success: false }
	}

	function goToStep(stepKey) {
		currentStep.value = stepKey
	}

	function nextStep() {
		const idx = currentStepIndex.value
		if (idx < OPTIMIZE_STEPS.length - 1) {
			currentStep.value = OPTIMIZE_STEPS[idx + 1].key
		}
	}

	function prevStep() {
		const idx = currentStepIndex.value
		if (idx > 0) {
			currentStep.value = OPTIMIZE_STEPS[idx - 1].key
		}
	}

	function openPanel() {
		panelVisible.value = true
	}

	function closePanel() {
		panelVisible.value = false
	}

	async function resetSession() {
		if (sessionId.value) {
			await deleteSession(sessionId.value)
		}
		sessionId.value = null
		currentStep.value = 'init'
		loading.value = false
		loadingAgent.value = ''
		error.value = ''
		parsedResumeRaw.value = null
		parsedResumeForEditor.value = null
		parseConfirmed.value = false
		careerProfile.value = null
		jdStructured.value = null
		diagnosisReport.value = null
		optimizationPlan.value = null
		moduleResults.value = {}
		factCheckResult.value = null
		chatMessages.value = []
		jdText.value = ''
	}

	return {
		sessionId,
		currentStep,
		loading,
		loadingAgent,
		error,
		parsedResumeRaw,
		parsedResumeForEditor,
		parseConfirmed,
		careerProfile,
		jdStructured,
		diagnosisReport,
		optimizationPlan,
		moduleResults,
		factCheckResult,
		chatMessages,
		jdText,
		panelVisible,
		currentStepIndex,
		isStepCompleted,
		canGoToStep,
		initSession,
		uploadAndParse,
		uploadTextAndParse,
		confirmParsedResume,
		runAgentByKey,
		runCareerAgent,
		runJDAgent,
		runDiagnosisAgent,
		runStrategyAgent,
		runModuleOptimizer,
		runFactChecker,
		refreshSession,
		goToStep,
		nextStep,
		prevStep,
		openPanel,
		closePanel,
		resetSession,
	}
})
