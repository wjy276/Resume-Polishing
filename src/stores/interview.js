/**
 * 模拟面试状态管理
 * 由 interview-deploy 部署版（scripts/interview.js + interview-chat.js）迁移而来
 * 负责：会话状态、面试配置、消息流、历史记录、开始/提问/作答/结束等业务逻辑
 */

import { defineStore } from 'pinia'
import {
	startInterview as startInterviewApi,
	fetchNextQuestion as fetchNextQuestionApi,
	submitAnswer as submitAnswerApi,
	stopInterview as stopInterviewApi,
	getInterviewSession,
} from '@/api/interview'

const STORAGE_KEYS = {
	current: 'interview_current',
	history: 'interview_history',
	config: 'interview_config',
}

const PHASE_NAMES = {
	technical: '技术面试',
	behavioral: '综合面试',
	closing: '收尾环节',
}

let messageSeq = 0

function readStorage(key, fallback) {
	try {
		const value = uni.getStorageSync(key)
		return value === '' || value === null || value === undefined ? fallback : value
	} catch {
		return fallback
	}
}

function writeStorage(key, value) {
	try {
		uni.setStorageSync(key, value)
	} catch (err) {
		console.error(`[interview] storage write failed: ${key}`, err)
	}
}

function formatTime(date = new Date()) {
	const h = String(date.getHours()).padStart(2, '0')
	const m = String(date.getMinutes()).padStart(2, '0')
	return `${h}:${m}`
}

function formatDate(date = new Date()) {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function nextId() {
	messageSeq += 1
	return `${Date.now()}-${messageSeq}`
}

function unwrapPayload(payload) {
	if (
		payload &&
		typeof payload === 'object' &&
		payload.data &&
		typeof payload.data === 'object'
	) {
		return payload.data
	}
	return payload
}

export const useInterviewStore = defineStore('interview', {
	state: () => ({
		sessionId: '',
		jobTitle: '',
		normalizedTitle: '',
		openingReply: '',
		status: 'idle',
		phase: 'technical',
		mode: 'voice',
		ttsEnabled: true,
		messages: [],
		startTime: 0,

		isStarting: false,
		isInterviewing: false,
		isThinking: false,
		isStopping: false,
		isRecording: false,
		isStreaming: false,

		summary: null,
		summaryVisible: false,
		history: [],
	}),

	getters: {
		phaseName: (state) => PHASE_NAMES[state.phase] || '模拟面试',
	},

	actions: {
		// ==================== 配置 ====================
		loadConfig() {
			const saved = readStorage(STORAGE_KEYS.config, null)
			if (saved) {
				this.mode = saved.mode || 'voice'
				this.ttsEnabled = saved.tts !== undefined ? !!saved.tts : true
			}
			return { mode: this.mode, tts: this.ttsEnabled }
		},

		saveConfig() {
			writeStorage(STORAGE_KEYS.config, {
				mode: this.mode,
				tts: this.ttsEnabled,
			})
		},

		setMode(mode) {
			this.mode = mode
			this.saveConfig()
		},

		setTtsEnabled(enabled) {
			this.ttsEnabled = !!enabled
			this.saveConfig()
		},

		// ==================== 历史记录 ====================
		loadHistory() {
			this.history = readStorage(STORAGE_KEYS.history, []) || []
			return this.history
		},

		addHistory(record) {
			this.history.unshift(record)
			writeStorage(STORAGE_KEYS.history, this.history.slice(0, 50))
		},

		// ==================== 当前会话持久化 ====================
		loadCurrent() {
			const saved = readStorage(STORAGE_KEYS.current, null)
			if (!saved) return null

			this.sessionId = saved.sessionId || ''
			this.jobTitle = saved.jobTitle || ''
			this.normalizedTitle = saved.normalizedTitle || ''
			this.openingReply = saved.openingReply || ''
			this.status = saved.status || 'interviewing'
			this.phase = saved.phase || 'technical'
			this.mode = saved.mode || this.mode
			this.ttsEnabled = saved.tts !== undefined ? !!saved.tts : this.ttsEnabled
			this.messages = Array.isArray(saved.messages) ? saved.messages : []
			this.startTime = saved.startTime || 0
			this.isInterviewing = true
			return saved
		},

		persistCurrent() {
			writeStorage(STORAGE_KEYS.current, {
				sessionId: this.sessionId,
				jobTitle: this.jobTitle,
				normalizedTitle: this.normalizedTitle,
				openingReply: this.openingReply,
				status: this.status,
				phase: this.phase,
				mode: this.mode,
				tts: this.ttsEnabled,
				messages: this.messages,
				startTime: this.startTime,
			})
		},

		clearCurrent() {
			this.sessionId = ''
			this.jobTitle = ''
			this.normalizedTitle = ''
			this.openingReply = ''
			this.status = 'idle'
			this.phase = 'technical'
			this.messages = []
			this.startTime = 0
			this.isInterviewing = false
			this.isThinking = false
			this.isRecording = false
			this.isStreaming = false
			this.summary = null
			this.summaryVisible = false
			try {
				uni.removeStorageSync(STORAGE_KEYS.current)
			} catch (err) {
				console.error('[interview] clear current failed:', err)
			}
		},

		// ==================== 会话校验 ====================
		async validateCurrentSession() {
			if (!this.sessionId) return false
			try {
				await getInterviewSession(this.sessionId)
				return true
			} catch (err) {
				console.warn('[interview] session invalid:', err)
				this.clearCurrent()
				return false
			}
		},

		handleSessionLost(err) {
			const message = err?.message || ''
			const isLost =
				err?.status === 404 ||
				message.includes('会话不存在') ||
				message.includes('会话已结束')
			if (!isLost) return false

			this.clearCurrent()
			uni.showToast({ title: '会话已失效，请重新开始面试', icon: 'none' })
			setTimeout(() => {
				window.location.href = '/#/pages/Interview/Interview'
			}, 800)
			return true
		},

		// ==================== 消息 ====================
		addMessage(role, content, extra = {}) {
			const msg = {
				id: nextId(),
				type: 'message',
				role,
				content,
				time: formatTime(),
				decision: extra.decision || null,
				score: extra.score || null,
				feedback: extra.feedback || null,
				isOpening: !!extra.isOpening,
			}
			this.messages.push(msg)
			this.persistCurrent()
			return msg
		},

		addScoreCard(score, feedback) {
			const card = {
				id: nextId(),
				type: 'score',
				score,
				feedback,
				time: formatTime(),
			}
			this.messages.push(card)
			this.persistCurrent()
			return card
		},

		// ==================== 面试流程 ====================
		async start(jobTitle) {
			if (this.isStarting) return ''
			const title = (jobTitle || '').trim()
			this.isStarting = true

			try {
				const raw = await startInterviewApi({
					jobTitle: title,
					sessionId: null,
				})
				console.log('[interview] start response:', raw)
				const data = unwrapPayload(raw)
				this.sessionId =
					data.session_id ||
					data.sessionId ||
					data.id ||
					data.session ||
					data.interview_id ||
					data.conversation_id ||
					(typeof raw === 'object' && typeof raw.data === 'string' ? raw.data : '') ||
					''
				if (!this.sessionId) throw new Error('未获取到会话 ID')

				this.jobTitle = title
				this.normalizedTitle = data.job_title_normalized || data.normalizedTitle || title
				this.openingReply = data.reply || data.opening_reply || data.openingReply || ''
				this.status = data.status || 'interviewing'
				this.phase = data.phase || 'technical'
				this.messages = []
				this.startTime = Date.now()
				this.isInterviewing = true
				this.saveConfig()

				if (this.openingReply) {
					this.addMessage('interviewer', this.openingReply, { isOpening: true })
				}
				this.persistCurrent()
				return this.sessionId
			} catch (err) {
				console.error('[interview] start failed:', err)
				uni.showToast({ title: `开始面试失败：${err.message}`, icon: 'none' })
				return ''
			} finally {
				this.isStarting = false
			}
		},

		async fetchNext() {
			if (!this.sessionId || this.isThinking) return
			this.isThinking = true

			try {
				const raw = await fetchNextQuestionApi({ sessionId: this.sessionId })
				const data = unwrapPayload(raw)
				this.applyInterviewData(data)
			} catch (err) {
				console.error('[interview] fetch next failed:', err)
				if (this.handleSessionLost(err)) return
				this.addMessage('interviewer', '抱歉，获取题目失败，请刷新页面重试。')
			} finally {
				this.isThinking = false
			}
		},

		async submitAnswer(answerText) {
			const text = (answerText || '').trim()
			if (!this.sessionId || !text) return

			this.addMessage('user', text)
			this.isThinking = true

			try {
				console.log('[interview] submit answer session:', this.sessionId)
				const raw = await submitAnswerApi({
					sessionId: this.sessionId,
					answer: text,
				})
				const data = unwrapPayload(raw)
				if (data.score !== undefined && data.feedback) {
					this.addScoreCard(data.score, data.feedback)
				}
				if (data.phase) this.phase = data.phase
				if (data.question) {
					this.addMessage('interviewer', data.question, { decision: data.decision })
				}
				if (data.status) this.status = data.status
				this.persistCurrent()
			} catch (err) {
				console.error('[interview] submit answer failed:', err)
				if (this.handleSessionLost(err)) return
				this.addMessage('interviewer', '抱歉，提交失败，请重试。')
			} finally {
				this.isThinking = false
			}
		},

		async stop() {
			if (!this.sessionId || this.isStopping) return
			this.isStopping = true

			try {
				const raw = await stopInterviewApi({ sessionId: this.sessionId })
				const data = unwrapPayload(raw)
				this.summary = data
				this.summaryVisible = true
				if (data.status) this.status = data.status
				this.persistCurrent()
			} catch (err) {
				console.error('[interview] stop failed:', err)
				if (this.handleSessionLost(err)) return
				uni.showToast({ title: `生成总结失败：${err.message}`, icon: 'none' })
			} finally {
				this.isStopping = false
			}
		},

		finishInterview() {
			if (!this.summary) return
			this.addHistory({
				id: Date.now(),
				title: `${this.jobTitle || '模拟面试'} - 面试`,
				date: formatDate(),
				duration: '20分钟',
				score: this.summary.overall_score || 0,
				phase: this.phase,
				sessionId: this.sessionId,
			})
			this.clearCurrent()
		},

		applyInterviewData(data) {
			if (data.phase) this.phase = data.phase
			if (data.question) {
				this.addMessage('interviewer', data.question, { decision: data.decision })
			}
			if (data.status) this.status = data.status
			this.persistCurrent()
		},
	},
})
