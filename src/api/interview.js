/**
 * 模拟面试 API 层
 * 由 interview-deploy 部署版（scripts/common.js）迁移而来
 * 模拟面试是独立后端，不与其他模块共用 API_BASE_URL
 */

import { useUserStore } from '@/stores/user'

/**
 * 模拟面试接口基础地址（独立后端）
 * 默认 http://8.138.138.71:8000/api，可通过 VITE_INTERVIEW_API_BASE_URL 覆盖
 */
const INTERVIEW_API_BASE_URL =
	import.meta.env.VITE_INTERVIEW_API_BASE_URL || 'http://8.138.138.71:8000/api'

/**
 * 识别后端业务错误码（HTTP 200 但 code 非 0/200 时）
 * 例如：code 1007 = Token 已过期
 */
function createBusinessError(payload) {
	if (!payload || typeof payload !== 'object') return null
	if (payload.code === undefined || payload.code === null) return null
	const code = Number(payload.code)
	if (Number.isNaN(code) || code === 0 || code === 200) return null
	const err = new Error(payload.message || `业务错误：${code}`)
	err.code = code
	return err
}

function handleAuthFailure(payload) {
	if (!payload || typeof payload !== 'object') return
	const code = Number(payload.code)
	if (code === 401 || code === 1007) {
		try {
			useUserStore().markTokenExpired()
		} catch (err) {
			console.error('[interview] handle auth failure failed:', err)
		}
	}
}

/**
 * POST 请求封装（与部署版 apiPost 行为一致：HTTP 2xx 即视为成功，返回原始 JSON）
 */
async function interviewPost(path, body) {
	const headers = { 'Content-Type': 'application/json' }
	const token = uni.getStorageSync('token')
	if (token) headers.Authorization = `Bearer ${token}`

	const res = await fetch(`${INTERVIEW_API_BASE_URL}${path}`, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	})
	if (!res.ok) {
		let detail = ''
		try {
			const text = await res.text()
			if (text) detail = ` | ${text.slice(0, 300)}`
		} catch (err) {
			console.error('[interview] read error body failed:', err)
		}
		if (res.status === 401) {
			try {
				useUserStore().markTokenExpired()
			} catch (err) {
				console.error('[interview] handle auth failure failed:', err)
			}
			throw new Error('登录已过期，请重新登录')
		}
		const error = new Error(`API Error: ${res.status}${detail}`)
		error.status = res.status
		throw error
	}

	const payload = await res.json()
	const businessError = createBusinessError(payload)
	if (businessError) {
		handleAuthFailure(payload)
		throw businessError
	}
	return payload
}

/**
 * GET 请求封装（用于会话状态校验等）
 */
async function interviewGet(path) {
	const headers = {}
	const token = uni.getStorageSync('token')
	if (token) headers.Authorization = `Bearer ${token}`

	const res = await fetch(`${INTERVIEW_API_BASE_URL}${path}`, {
		method: 'GET',
		headers,
	})
	if (!res.ok) {
		let detail = ''
		try {
			const text = await res.text()
			if (text) detail = ` | ${text.slice(0, 300)}`
		} catch (err) {
			console.error('[interview] read error body failed:', err)
		}
		const error = new Error(`API Error: ${res.status}${detail}`)
		error.status = res.status
		throw error
	}
	return res.json()
}

/**
 * SSE 流式请求（部署版 apiStream）
 * 当前对话页未使用，保留供后续流式场景使用
 */
export async function interviewStream(path, body, onChunk, onDone) {
	const headers = { 'Content-Type': 'application/json' }
	const token = uni.getStorageSync('token')
	if (token) headers.Authorization = `Bearer ${token}`

	const res = await fetch(`${INTERVIEW_API_BASE_URL}${path}`, {
		method: 'POST',
		headers,
		body: JSON.stringify(body),
	})
	if (!res.ok) {
		let detail = ''
		try {
			const text = await res.text()
			if (text) detail = ` | ${text.slice(0, 300)}`
		} catch (err) {
			console.error('[interview] read error body failed:', err)
		}
		throw new Error(`API Error: ${res.status}${detail}`)
	}

	const reader = res.body.getReader()
	const decoder = new TextDecoder()
	let buffer = ''

	while (true) {
		const { done, value } = await reader.read()
		if (done) break
		buffer += decoder.decode(value, { stream: true })
		const lines = buffer.split('\n\n')
		buffer = lines.pop()
		for (const line of lines) {
			const match = line.match(/^event: (\w+)\ndata: (.+)$/m)
			if (!match) continue
			const [, event, data] = match
			const payload = JSON.parse(data)
			if (event === 'token' && onChunk) onChunk(payload.chunk)
			if (event === 'done' && onDone) onDone(payload)
		}
	}
}

/** 开始面试：POST /interview/start */
export function startInterview({ jobTitle, sessionId = null }) {
	return interviewPost('/interview/start', {
		job_title: jobTitle,
		session_id: sessionId,
	})
}

/** 获取下一题：POST /interview/next */
export function fetchNextQuestion({ sessionId }) {
	return interviewPost('/interview/next', { session_id: sessionId })
}

/** 提交回答：POST /interview/answer */
export function submitAnswer({ sessionId, answer }) {
	return interviewPost('/interview/answer', {
		session_id: sessionId,
		answer,
	})
}

/** 结束面试并生成总结：POST /interview/stop */
export function stopInterview({ sessionId }) {
	return interviewPost('/interview/stop', { session_id: sessionId })
}

/** 查看总结：POST /interview/summary */
export function requestSummary({ sessionId, trigger = '查看总结' }) {
	return interviewPost('/interview/summary', {
		session_id: sessionId,
		trigger,
	})
}

/** 获取会话状态（用于校验会话是否仍有效）：GET /interview/{session_id} */
export function getInterviewSession(sessionId) {
	return interviewGet(`/interview/${encodeURIComponent(sessionId)}`)
}

/** TTS 语音合成：POST /voice/tts，返回可播放的音频 URL */
export async function fetchTtsAudio(text) {
	const headers = { 'Content-Type': 'application/json' }
	const token = uni.getStorageSync('token')
	if (token) headers.Authorization = `Bearer ${token}`

	const res = await fetch(`${INTERVIEW_API_BASE_URL}/voice/tts`, {
		method: 'POST',
		headers,
		body: JSON.stringify({ text }),
	})
	if (!res.ok) {
		let detail = ''
		try {
			const text = await res.text()
			if (text) detail = ` | ${text.slice(0, 300)}`
		} catch (err) {
			console.error('[interview] read TTS error body failed:', err)
		}
		throw new Error(`TTS failed: ${res.status}${detail}`)
	}
	const blob = await res.blob()
	return URL.createObjectURL(blob)
}

/** WebSocket ASR 语音识别连接（部署版 createASRConnection） */
export function createASRConnection(onResult, onError) {
	let base = INTERVIEW_API_BASE_URL
	const pageProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
	if (base.startsWith('/')) {
		base = `${pageProtocol}//${window.location.host}/api`
	} else {
		base = base.replace(/^https?:/, pageProtocol)
	}

	const url = `${base}/voice/ws/asr`
	console.log('[interview] ASR connecting:', url)
	const ws = new WebSocket(url)

	let opened = false
	const openTimer = setTimeout(() => {
		if (!opened && ws.readyState !== WebSocket.OPEN) {
			try {
				ws.close()
			} catch (err) {
				console.error('[interview] close timeout ws failed:', err)
			}
			if (onError) onError(new Error('语音识别服务连接超时'))
		}
	}, 10000)

	ws.onopen = () => {
		opened = true
		clearTimeout(openTimer)
		console.log('[interview] ASR WebSocket connected')
	}
	ws.onmessage = (event) => {
		try {
			const data = JSON.parse(event.data)
			const nested = data.data
			if (
				nested &&
				typeof nested === 'object' &&
				(nested.type === 'error' || nested.type === 'closed')
			) {
				if (onError) onError(new Error(nested.message || '语音识别服务连接失败'))
				return
			}
			if (data.type === 'result' && onResult) {
				const sentence = nested?.payload?.output?.sentence
				onResult({
					event: nested?.header?.event || '',
					text: sentence?.text || nested?.payload?.result || '',
					sentenceEnd: !!sentence?.sentence_end,
					raw: data,
				})
			}
		} catch (err) {
			console.error('ASR message parse failed:', err)
		}
	}
	ws.onerror = (err) => {
		clearTimeout(openTimer)
		if (onError) onError(err)
	}
	ws.onclose = () => clearTimeout(openTimer)
	return ws
}
