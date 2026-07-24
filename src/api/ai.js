/**
 * AI Agent API — 对接 FastAPI 智能简历优化服务
 * 基础地址: http://localhost:8000/api
 *
 * 会话管理：由后端通过 Cookie 自动管理，前端无需手动传递 session_id
 */

// 开发环境使用代理，生产环境使用完整 URL
const AI_BASE_URL = import.meta.env.DEV ? '/ai-api' : 'http://localhost:8000/api'

function getAIBaseUrl() {
	return AI_BASE_URL
}

/**
 * 统一 AI 请求封装（基于 uni.request）
 * 自动携带 Cookie，支持跨域会话保持
 */
function aiRequest(options) {
	const { url, method = 'GET', data, query, timeout } = options

	let fullUrl = url.startsWith('http') ? url : `${AI_BASE_URL}${url}`
	if (query && Object.keys(query).length) {
		const qs = Object.entries(query)
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join('&')
		if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs
	}

	return new Promise((resolve) => {
		uni.request({
			url: fullUrl,
			method,
			data,
			header: { 'Content-Type': 'application/json' },
			timeout: timeout || 60000,
			withCredentials: true,
			success: (res) => {
				const body = res.data
				const code = body?.code
				const ok = res.statusCode === 200 && (code === 0 || code === 200)
				resolve({
					ok,
					code,
					message: body?.message || (ok ? '' : `HTTP ${res.statusCode}`),
					data: body?.data,
					raw: body,
				})
			},
			fail: () => {
				resolve({
					ok: false,
					code: -1,
					message: 'AI 服务连接失败',
					data: null,
					raw: null,
				})
			},
		})
	})
}

/**
 * 文件上传专用请求（multipart/form-data）
 */
function uploadFile(url, fileOrBlob, filename = 'resume.txt', sessionId = null) {
	const formData = new FormData()
	formData.append('file', fileOrBlob, filename)

	let fullUrl = url.startsWith('http') ? url : `${getAIBaseUrl()}${url}`
	if (sessionId) {
		const sep = fullUrl.includes('?') ? '&' : '?'
		fullUrl += `${sep}session_id=${encodeURIComponent(sessionId)}`
	}

	return fetch(fullUrl, {
		method: 'POST',
		body: formData,
		credentials: 'include',
	})
		.then(async (res) => {
			const body = await res.json()
			const code = body?.code
			const ok = res.ok && (code === 0 || code === 200)
			return {
				ok,
				code,
				message: body?.message || (ok ? '' : `HTTP ${res.status}`),
				data: body?.data,
				raw: body,
			}
		})
		.catch(() => ({
			ok: false,
			code: -1,
			message: '上传失败',
			data: null,
			raw: null,
		}))
}

// ==================== 系统接口 ====================

/**
 * 健康检查
 * 返回 { ok: boolean, message: string, data?: { status: string, model: string, session_count: number } }
 */
export function checkAIHealth() {
	return aiRequest({ url: '/health', timeout: 5000 })
}

/** 获取 Agent 列表 */
export function listAgents() {
	return aiRequest({ url: '/agents' })
}

// ==================== 会话接口 ====================

/** 创建会话（可选，后端会自动创建） */
export function createSession(params = {}) {
	return aiRequest({
		url: '/sessions',
		method: 'POST',
		data: {
			has_resume: params.hasResume ?? true,
			user_query: params.userQuery || null,
			target_jd_text: params.targetJdText || null,
		},
	})
}

/** 获取会话状态 */
export function getSession(sessionId) {
	return aiRequest({ url: `/sessions/${sessionId}` })
}

/** 更新会话状态 */
export function updateSessionState(updates) {
	return aiRequest({
		url: '/sessions/state',
		method: 'PUT',
		data: { updates },
	})
}

/** 删除会话 */
export function deleteSession(sessionId) {
	return aiRequest({ url: `/sessions/${sessionId}`, method: 'DELETE' })
}

// ==================== 文件接口 ====================

/** 上传简历文件 */
export function uploadResumeFile(file, sessionId = null) {
	return uploadFile('/upload/resume', file, file.name, sessionId)
}

/** 上传简历文本（粘贴内容转换为 txt 文件） */
export function uploadResumeText(text, sessionId = null) {
	const blob = new Blob([text], { type: 'text/plain' })
	return uploadFile('/upload/resume', blob, 'resume.txt', sessionId)
}

// ==================== 简历接口 ====================

/** 获取编辑器格式的简历数据 */
export function fetchEditorFormat(sessionId) {
	return aiRequest({
		url: `/resume/editor-format/${sessionId}`,
		method: 'GET',
	})
}

// ==================== JD 接口 ====================

/** 独立解析 JD 原文（不依赖简历与向量库） */
export function parseJD(jdText) {
	return aiRequest({
		url: '/jd/parse',
		method: 'POST',
		data: { jd_text: jdText },
	})
}

// ==================== Agent 接口 ====================

/** 运行单个 Agent */
export function runAgent(agentKey, extra = {}, sessionId = null) {
	const data = { extra }
	if (sessionId) data.session_id = sessionId
	return aiRequest({
		url: `/agents/${agentKey}/run`,
		method: 'POST',
		data,
	})
}

/** 运行完整流水线 */
export function runPipeline(fromAgent = null, extra = {}, sessionId = null) {
	const data = { from_agent: fromAgent, extra }
	if (sessionId) data.session_id = sessionId
	return aiRequest({
		url: '/pipeline/run',
		method: 'POST',
		data,
	})
}

// ==================== 职业引导接口 ====================

/** 开始职业引导测试，返回第一题 */
export function startCoaching(sessionId = null) {
	const data = {}
	if (sessionId) data.session_id = sessionId
	return aiRequest({
		url: '/coaching/start',
		method: 'POST',
		data,
	})
}

/** 提交一题答案，返回下一题或完成提示 */
export function answerCoaching(questionId, answer, sessionId = null) {
	const data = { question_id: questionId, answer }
	if (sessionId) data.session_id = sessionId
	return aiRequest({
		url: '/coaching/answer',
		method: 'POST',
		data,
	})
}

/** 完成测试，计算结果并生成职业意向 */
export function finishCoaching(sessionId = null) {
	const data = {}
	if (sessionId) data.session_id = sessionId
	return aiRequest({
		url: '/coaching/finish',
		method: 'POST',
		data,
	})
}

/** 获取职业引导当前状态 */
export function getCoachingStatus(sessionId) {
	return aiRequest({ url: `/coaching/status/${sessionId}` })
}
