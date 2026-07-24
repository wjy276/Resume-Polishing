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
	startCoaching,
	answerCoaching,
	finishCoaching,
	getCoachingStatus,
	fetchEditorFormat,
} from '@/api/ai'
import { parsedToEditorResume, editorResumeToAgentInput } from '@/utils/resume/agentAdapter'

export const OPTIMIZE_STEPS = [
	{ key: 'init', label: '初始化', icon: '⚙' },
	{ key: 'parse', label: '解析简历', icon: '📄' },
	{ key: 'profile', label: '求职画像', icon: '🧭' },
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
	const profileData = ref(null)
	const chainRunning = ref(false)
	const chainProgress = ref('')

	const coachingQuestions = ref([])
	const coachingAnswers = ref([])
	const coachingResult = ref(null)
	const coachingFinished = ref(false)

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
			currentStep.value = hasResume ? 'parse' : 'profile'

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
			// 1. 上传文件
			const uploadRes = await uploadResumeFile(file, sessionId.value)
			if (!uploadRes.ok) {
				error.value = uploadRes.message || '上传失败'
				return { success: false, message: error.value }
			}

			// 2. 调用解析 Agent（传入上传的文件路径）
			const filePath = uploadRes.data?.file_path
			const parseRes = await runAgent('resume_parser', filePath ? { resume_file_path: filePath } : {}, sessionId.value)
			if (!parseRes.ok) {
				error.value = parseRes.message || '解析失败'
				return { success: false, message: error.value }
			}

			// 3. 获取编辑器格式数据（后端已转换好）
			sessionId.value = parseRes.data?.session_id || uploadRes.data?.session_id || sessionId.value
			const formatRes = await fetchEditorFormat(sessionId.value)
			if (!formatRes.ok) {
				error.value = formatRes.message || '获取解析结果失败'
				return { success: false, message: error.value }
			}

			const editorData = formatRes.data

			// 详细日志：检查 AI 返回的数据完整性
			console.log('========== [AI 解析结果] ==========')
			console.log('1. 基本信息:', editorData?.basic)
			console.log('2. 教育背景数量:', editorData?.education?.length)
			console.log('3. 工作经历数量:', editorData?.experience?.length)
			console.log('4. 项目经历数量:', editorData?.projects?.length)
			console.log('5. 专业技能:', editorData?.skillContent?.substring(0, 200))
			console.log('6. 自我评价:', editorData?.selfEvaluationContent?.substring(0, 200))
			console.log('7. 完整数据:', JSON.stringify(editorData, null, 2))
			console.log('===================================')

			if (!editorData) {
				error.value = '解析结果为空'
				return { success: false, message: error.value }
			}

			// 保存解析结果
			parsedResumeRaw.value = editorData
			parsedResumeForEditor.value = editorData
			parseConfirmed.value = false
			currentStep.value = 'parse'

			return { success: true, data: editorData }
		} catch (e) {
			console.error('[AI] 解析失败:', e)
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
			// 1. 上传文本
			const uploadRes = await uploadResumeText(text, sessionId.value)
			if (!uploadRes.ok) {
				error.value = uploadRes.message || '上传失败'
				return { success: false, message: error.value }
			}

			// 2. 调用解析 Agent（传入原文文本）
			const parseRes = await runAgent('resume_parser', { raw_resume_text: text }, sessionId.value)
			if (!parseRes.ok) {
				error.value = parseRes.message || '解析失败'
				return { success: false, message: error.value }
			}

			// 3. 获取编辑器格式数据（后端已转换好）
			sessionId.value = parseRes.data?.session_id || uploadRes.data?.session_id || sessionId.value
			const formatRes = await fetchEditorFormat(sessionId.value)
			if (!formatRes.ok) {
				error.value = formatRes.message || '获取解析结果失败'
				return { success: false, message: error.value }
			}

			const editorData = formatRes.data

			console.log('[AI] 编辑器格式数据:', editorData)

			if (!editorData) {
				error.value = '解析结果为空'
				return { success: false, message: error.value }
			}

			// 保存解析结果
			parsedResumeRaw.value = editorData
			parsedResumeForEditor.value = editorData
			parseConfirmed.value = false
			currentStep.value = 'parse'

			return { success: true, data: editorData }
		} catch (e) {
			console.error('[AI] 解析失败:', e)
			error.value = '解析失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
			loadingAgent.value = ''
		}
	}

	function confirmParsedResume() {
		parseConfirmed.value = true
		currentStep.value = 'profile'
	}

	async function runAgentByKey(agentKey, extra = {}) {
		loading.value = true
		loadingAgent.value = agentKey
		error.value = ''

		try {
			const res = await runAgent(agentKey, extra, sessionId.value)
			if (!res.ok) {
				error.value = res.message || `${agentKey} 运行失败`
				return { success: false, message: error.value }
			}
			if (res.data?.session_id) {
				sessionId.value = res.data.session_id
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

	function _buildProfileQuery(formData) {
		const parts = []
		if (formData.targetRole) parts.push(`目标岗位：${formData.targetRole}`)
		if (formData.experienceYear) parts.push(`工作年限：${formData.experienceYear}`)
		if (formData.targetCities?.length) parts.push(`目标城市：${formData.targetCities.join('、')}`)
		if (formData.coreSkills?.length) parts.push(`核心技能：${formData.coreSkills.join('、')}`)
		if (formData.extraInfo) parts.push(`补充说明：${formData.extraInfo}`)
		return parts.join('\n')
	}

	function _transformJD(backendJD) {
		if (!backendJD) return null
		const skills = Array.isArray(backendJD.skills) ? backendJD.skills : []
		return {
			job_title: backendJD.job_title || '',
			company: backendJD.company || '',
			hard_skills: skills.map((s) => (typeof s === 'string' ? { name: s } : s)),
			soft_skills: [],
			experience: '',
			education: '',
			keywords: skills,
			description: backendJD.description || '',
			location: backendJD.location || '',
			salary_range: backendJD.salary_range || '',
		}
	}

	function _transformDiagnosis(backendDiagnosis) {
		if (!backendDiagnosis) return null
		const moduleDiagnoses = backendDiagnosis.module_diagnoses || []
		const weakPoints = moduleDiagnoses.map((d) => ({
			module: d.module,
			name: d.module_label || d.module,
			description: d.problems_found?.join('；') || d.recommended_direction || '',
			evidence: d.evidence_excerpt || '',
			suggestion: d.recommended_direction || '',
			priority: d.severity || 'medium',
		}))
		const priorityQueue = (backendDiagnosis.priority_fix_order || []).map((m) => ({
			module: m,
			name: moduleDiagnoses.find((d) => d.module === m)?.module_label || m,
		}))
		const highCount = weakPoints.filter((w) => w.priority === 'high').length
		const matchScore = Math.max(0, Math.min(100, Math.round(85 - highCount * 10 - weakPoints.length * 2)))
		return {
			match_score: matchScore,
			matched: (backendDiagnosis.strengths_in_original || []).map((s) => ({ name: s })),
			gaps: weakPoints.filter((w) => w.priority === 'high'),
			weak_points: weakPoints,
			priority_queue: priorityQueue,
			executive_summary: backendDiagnosis.executive_summary || '',
			target_role_focus: backendDiagnosis.target_role_focus || '',
			diagnosis_markdown: backendDiagnosis.diagnosis_markdown || '',
		}
	}

	function _transformModuleRewrites(backendRewrites) {
		if (!backendRewrites?.rewrites) return {}
		const result = {}
		for (const r of backendRewrites.rewrites) {
			result[r.module] = {
				optimized_html: r.rewritten ? `<p>${r.rewritten}</p>` : '',
				change_summary: r.change_summary ? [r.change_summary] : [],
				keywords_added: r.keywords_added || [],
				original: r.original || '',
			}
		}
		return result
	}

	async function submitProfile(formData) {
		loading.value = true
		loadingAgent.value = 'career_profiler'
		error.value = ''
		try {
			const userQuery = _buildProfileQuery(formData)
			const res = await runAgent('career_profiler', { user_query: userQuery }, sessionId.value)
			if (!res.ok) {
				error.value = res.message || '提交求职画像失败'
				return { success: false, message: error.value }
			}
			if (res.data?.session_id) {
				sessionId.value = res.data.session_id
			}
			profileData.value = formData
			careerProfile.value = res.data?.result?.career_intent || res.data?.career_intent || res.data
			return { success: true, data: careerProfile.value }
		} catch (e) {
			error.value = '提交求职画像失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
			loadingAgent.value = ''
		}
	}

	async function runJDAgent(jdInput) {
		const res = await runAgentByKey('jd_matcher', { target_jd_text: jdInput })
		if (res.success && res.data) {
			jdStructured.value = _transformJD(res.data?.result?.target_jd || res.data?.target_jd) || res.data
			jdText.value = jdInput
		}
		return res
	}

	async function runPostJDChain(moduleIds = []) {
		chainRunning.value = true
		error.value = ''

		chainProgress.value = '诊断简历问题…'
		const diagRes = await runAgentByKey('resume_diagnostician')
		if (!diagRes.success) {
			chainRunning.value = false
			chainProgress.value = ''
			return diagRes
		}
		diagnosisReport.value = _transformDiagnosis(
			diagRes.data?.result?.resume_diagnosis || diagRes.data?.resume_diagnosis
		)

		chainProgress.value = '制定优化策略…'
		const stratRes = await runAgentByKey('strategy_planner')
		if (!stratRes.success) {
			chainRunning.value = false
			chainProgress.value = ''
			return stratRes
		}
		optimizationPlan.value = stratRes.data?.result?.optimization_plan || stratRes.data?.optimization_plan

		if (moduleIds.length > 0) {
			chainProgress.value = '预计算模块优化…'
			const modRes = await runAgent('module_optimizer', { modules: moduleIds }, sessionId.value)
			if (modRes.ok) {
				const transformed = _transformModuleRewrites(
					modRes.data?.result?.module_rewrites || modRes.data?.module_rewrites
				)
				for (const [key, val] of Object.entries(transformed)) {
					moduleResults.value[key] = val
				}
			}
		}

		chainRunning.value = false
		chainProgress.value = ''
		currentStep.value = 'optimize'
		return { success: true }
	}

	async function runModuleOptimizer(moduleId, style = 'standard') {
		if (moduleResults.value[moduleId]) {
			return { success: true, data: moduleResults.value[moduleId] }
		}
		const res = await runAgentByKey('module_optimizer', {
			modules: [moduleId],
			style,
		})
		if (res.success && res.data) {
			const transformed = _transformModuleRewrites(
				res.data?.result?.module_rewrites || res.data?.module_rewrites
			)
			if (transformed[moduleId]) {
				moduleResults.value[moduleId] = transformed[moduleId]
			}
		}
		return res
	}

	/**
	 * 分模块优化（新接口）
	 * @param {string} moduleKey - 模块key (summary/experience/projects/skills/education/certifications)
	 * @param {Object} options - 选项
	 * @param {string} options.style - 优化风格 (conservative/standard/aggressive)
	 * @param {string} options.content - 原始内容
	 * @param {string[]} options.modules - 指定优化的模块列表（可选）
	 * @param {string} options.refineFeedback - 整体反馈（可选）
	 * @param {Object} options.moduleRefineFeedback - 模块级别反馈（可选）
	 */
	async function optimizeModule(moduleKey, options = {}) {
		if (!sessionId.value) {
			const initRes = await initSession(true, '')
			if (!initRes.success) return initRes
		}

		// 如果已有缓存结果且没有反馈要求，直接返回缓存
		if (moduleResults.value[moduleKey] && !options.refineFeedback && !options.moduleRefineFeedback) {
			return { success: true, data: moduleResults.value[moduleKey] }
		}

		loading.value = true
		loadingAgent.value = 'module_optimizer'
		error.value = ''

		try {
			const extra = {}

			if (options.modules && options.modules.length > 0) {
				extra.modules = options.modules
			}

			if (options.refineFeedback) {
				extra.refine_feedback = options.refineFeedback
			}

			if (options.moduleRefineFeedback) {
				extra.module_refine_feedback = options.moduleRefineFeedback
			}

			const res = await runAgent('module_optimizer', extra, sessionId.value)
			if (!res.ok) {
				error.value = res.message || '模块优化失败'
				return { success: false, message: error.value }
			}
			if (res.data?.session_id) {
				sessionId.value = res.data.session_id
			}

			// 解析返回结果
			const transformed = _transformModuleRewrites(
				res.data?.result?.module_rewrites || res.data?.module_rewrites
			)
			console.log('[AI] 模块优化结果:', transformed)

			if (moduleKey && transformed[moduleKey]) {
				moduleResults.value[moduleKey] = transformed[moduleKey]
			}

			// 返回优化后的内容
			const data = moduleKey ? transformed[moduleKey] : transformed
			return { 
				success: true, 
				data: data || res.data 
			}
		} catch (e) {
			console.error('[AI] 模块优化失败:', e)
			error.value = '模块优化失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
			loadingAgent.value = ''
		}
	}

	/**
	 * 预解析已存在的简历（点击 AI 优化时立即调用）
	 * @param {string} resumeText - 简历原始文本
	 */
	async function parseExistingResume(resumeText) {
		if (!sessionId.value) {
			const initRes = await initSession(true, '')
			if (!initRes.success) return initRes
		}
		loading.value = true
		loadingAgent.value = 'resume_parser'
		error.value = ''

		try {
			const uploadRes = await uploadResumeText(resumeText, sessionId.value)
			if (!uploadRes.ok) {
				error.value = '上传简历失败'
				return { success: false, message: error.value }
			}
			const parseRes = await runAgent('resume_parser', { raw_resume_text: resumeText }, sessionId.value)
			if (!parseRes.ok) {
				error.value = parseRes.message || '解析失败'
				return { success: false, message: error.value }
			}
			sessionId.value = parseRes.data?.session_id || uploadRes.data?.session_id || sessionId.value
			return { success: true }
		} catch (e) {
			error.value = '简历解析失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
			loadingAgent.value = ''
		}
	}

	/**
	 * 一键全流程优化（弹窗模式）
	 * @param {Object} opts
	 * @param {string} [opts.prompt] - 优化提示/求职方向
	 * @param {string} [opts.jdText] - 目标岗位 JD
	 * @param {string[]} [opts.moduleIds] - 要优化的模块列表
	 * @param {boolean} [opts.skipParse] - 跳过上传+解析（已预解析时使用）
	 */
	async function runFullOptimization(opts = {}) {
		const { prompt, jdText, moduleIds, skipParse } = opts
		error.value = ''
		chainRunning.value = true

		try {
			// 0. 确保有会话
			if (!sessionId.value) {
				const initRes = await initSession(true, '')
				if (!initRes.success) return initRes
			}

			// 1. 上传简历文本 + 解析（除非已预解析）
			if (!skipParse) {
				chainProgress.value = '解析简历…'
				const parseRes = await runAgent('resume_parser', {}, sessionId.value)
				if (!parseRes.ok) {
					error.value = parseRes.message || '解析失败'
					return { success: false, message: error.value }
				}
			}
			if (prompt) {
				chainProgress.value = '分析求职方向…'
				const profRes = await runAgent('career_profiler', { user_query: prompt }, sessionId.value)
				if (!profRes.ok) {
					error.value = profRes.message || '求职方向分析失败'
					return { success: false, message: error.value }
				}
				careerProfile.value = profRes.data?.career_profile || profRes.data
			}

			// 3. 解析 JD
			if (jdText) {
				chainProgress.value = '解析目标岗位…'
				const jdRes = await runAgent('jd_matcher', { target_jd_text: jdText }, sessionId.value)
				if (!jdRes.ok) {
					error.value = jdRes.message || 'JD 解析失败'
					return { success: false, message: error.value }
				}
				jdStructured.value = _transformJD(
					jdRes.data?.result?.target_jd || jdRes.data?.target_jd
				) || jdRes.data
			}

			// 4. 诊断
			chainProgress.value = '诊断简历问题…'
			const diagRes = await runAgent('resume_diagnostician', {}, sessionId.value)
			if (!diagRes.ok) {
				error.value = diagRes.message || '诊断失败'
				return { success: false, message: error.value }
			}
			diagnosisReport.value = diagRes.data?.diagnosis_report || diagRes.data

			// 5. 策略规划
			chainProgress.value = '制定优化策略…'
			const stratRes = await runAgent('strategy_planner', {}, sessionId.value)
			if (!stratRes.ok) {
				error.value = stratRes.message || '策略规划失败'
				return { success: false, message: error.value }
			}
			optimizationPlan.value = stratRes.data?.optimization_plan || stratRes.data

			// 6. 模块预优化
			if (moduleIds && moduleIds.length > 0) {
				chainProgress.value = '预计算模块优化…'
				const modRes = await runAgent('module_optimizer', { modules: moduleIds }, sessionId.value)
				if (modRes.ok) {
					const transformed = _transformModuleRewrites(
						modRes.data?.result?.module_rewrites || modRes.data?.module_rewrites
					)
					for (const [key, val] of Object.entries(transformed)) {
						moduleResults.value[key] = val
					}
				}
			}

			chainRunning.value = false
			chainProgress.value = ''
			currentStep.value = 'optimize'
			return { success: true }
		} catch (e) {
			chainRunning.value = false
			chainProgress.value = ''
			error.value = '优化失败'
			return { success: false, message: error.value }
		}
	}

	async function runFactChecker() {
		const res = await runAgentByKey('fact_checker')
		if (res.success && res.data) {
			factCheckResult.value = res.data?.result || res.data
		}
		return res
	}

	async function startCoachingQuiz() {
		if (!sessionId.value) {
			const initRes = await initSession(true, '')
			if (!initRes.success) return initRes
		}
		loading.value = true
		error.value = ''
		try {
			const res = await startCoaching(sessionId.value)
			if (!res.ok) {
				error.value = res.message || '开始职业引导失败'
				return { success: false, message: error.value }
			}
			if (res.data?.session_id) sessionId.value = res.data.session_id
			coachingQuestions.value = res.data?.question ? [res.data.question] : (res.data?.questions || [])
			coachingAnswers.value = []
			coachingFinished.value = false
			coachingResult.value = null
			return { success: true, data: res.data }
		} catch (e) {
			error.value = '开始职业引导失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
		}
	}

	async function answerCoachingQuestion(questionId, answer) {
		loading.value = true
		error.value = ''
		try {
			const res = await answerCoaching(questionId, answer, sessionId.value)
			if (!res.ok) {
				error.value = res.message || '提交答案失败'
				return { success: false, message: error.value }
			}
			if (res.data?.session_id) sessionId.value = res.data.session_id
			coachingAnswers.value.push({ question_id: questionId, answer })
			if (res.data?.finished || res.data?.is_finished) {
				coachingFinished.value = true
			}
			return { success: true, data: res.data }
		} catch (e) {
			error.value = '提交答案失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
		}
	}

	async function finishCoachingQuiz() {
		loading.value = true
		error.value = ''
		try {
			const res = await finishCoaching(sessionId.value)
			if (!res.ok) {
				error.value = res.message || '完成职业引导失败'
				return { success: false, message: error.value }
			}
			if (res.data?.session_id) sessionId.value = res.data.session_id
			coachingFinished.value = true
			coachingResult.value = res.data?.result || res.data
			return { success: true, data: res.data }
		} catch (e) {
			error.value = '完成职业引导失败'
			return { success: false, message: error.value }
		} finally {
			loading.value = false
		}
	}

	async function loadCoachingStatus() {
		if (!sessionId.value) return { success: false, message: '请先创建会话' }
		const res = await getCoachingStatus(sessionId.value)
		if (res.ok && res.data) {
			coachingQuestions.value = res.data.questions || []
			coachingAnswers.value = res.data.answers || []
			coachingFinished.value = res.data.finished || false
			coachingResult.value = res.data.result || null
		}
		return { success: res.ok, data: res.data }
	}

	async function refreshSession() {
		if (!sessionId.value) return { success: false }
		const res = await getSession(sessionId.value)
		if (res.ok && res.data) {
			const state = res.data.state || res.data
			if (state.career_intent) careerProfile.value = state.career_intent
			if (state.target_jd) jdStructured.value = _transformJD(state.target_jd)
			if (state.resume_diagnosis) diagnosisReport.value = _transformDiagnosis(state.resume_diagnosis)
			if (state.optimization_plan) optimizationPlan.value = state.optimization_plan
			if (state.module_rewrites) {
				const transformed = _transformModuleRewrites(state.module_rewrites)
				for (const [key, val] of Object.entries(transformed)) {
					moduleResults.value[key] = val
				}
			}
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
		profileData.value = null
		chainRunning.value = false
		chainProgress.value = ''
		coachingQuestions.value = []
		coachingAnswers.value = []
		coachingResult.value = null
		coachingFinished.value = false
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
		profileData,
		chainRunning,
		chainProgress,
		coachingQuestions,
		coachingAnswers,
		coachingResult,
		coachingFinished,
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
		submitProfile,
		runJDAgent,
		runPostJDChain,
		runModuleOptimizer,
		optimizeModule,
		parseExistingResume,
		runFullOptimization,
		runFactChecker,
		startCoachingQuiz,
		answerCoachingQuestion,
		finishCoachingQuiz,
		loadCoachingStatus,
		refreshSession,
		goToStep,
		nextStep,
		prevStep,
		openPanel,
		closePanel,
		resetSession,
	}
})
