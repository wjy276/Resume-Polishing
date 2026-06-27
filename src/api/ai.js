/**
 * AI Agent API — 对接 FastAPI 智能简历优化服务
 * 基础地址: http://localhost:8000/api
 */

const AI_BASE_URL = 'http://localhost:8000/api'

function aiRequest(options) {
	const { url, method = 'GET', data, query, formData } = options

	let fullUrl = url.startsWith('http') ? url : `${AI_BASE_URL}${url}`
	if (query && Object.keys(query).length) {
		const qs = Object.entries(query)
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join('&')
		if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs
	}

	const header = { 'Content-Type': 'application/json' }
	let requestData = data
	if (formData) {
		delete header['Content-Type']
		requestData = formData
	}

	return new Promise((resolve) => {
		uni.request({
			url: fullUrl,
			method,
			data: requestData,
			header,
			timeout: 60000,
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

/** 健康检查 */
export function checkAIHealth() {
	return aiRequest({ url: '/health' })
}

/** 创建优化会话 */
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
export function updateSessionState(sessionId, updates) {
	return aiRequest({
		url: '/sessions/state',
		method: 'PUT',
		data: { session_id: sessionId, updates },
	})
}

/** 删除会话 */
export function deleteSession(sessionId) {
	return aiRequest({ url: `/sessions/${sessionId}`, method: 'DELETE' })
}

/** 上传简历文件（支持浏览器 File 对象） */
export function uploadResumeFile(sessionId, file) {
	const formData = new FormData()
	formData.append('file', file)

	return aiRequest({
		url: '/upload/resume',
		method: 'POST',
		query: { session_id: sessionId },
		formData,
	})
}

/** 上传简历文本（直接粘贴内容） */
export function uploadResumeText(sessionId, text) {
	return aiRequest({
		url: '/upload/resume',
		method: 'POST',
		query: { session_id: sessionId },
		data: { text },
	})
}

/** 运行单个 Agent */
export function runAgent(agentKey, sessionId, extra = {}) {
	return aiRequest({
		url: `/agents/${agentKey}/run`,
		method: 'POST',
		data: { session_id: sessionId, extra },
	})
}

/** 运行完整流水线 */
export function runPipeline(sessionId, fromAgent = null, extra = {}) {
	return aiRequest({
		url: '/pipeline/run',
		method: 'POST',
		data: { session_id: sessionId, from_agent: fromAgent, extra },
	})
}

/** 获取 Agent 列表 */
export function listAgents() {
	return aiRequest({ url: '/agents' })
}
