<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main interview-main">
			<!-- 页面头部 -->
			<view class="interview-header">
				<view class="header-left">
					<text class="page-title">模拟面试</text>
					<text class="page-subtitle">AI语音对话模拟真实面试场景</text>
				</view>
				<view class="header-right">
					<view class="status-badge" :class="{ 'status-ended': !isInterviewActive }">
						<view class="status-dot"></view>
						<text class="status-text">{{ isInterviewActive ? '面试进行中' : '面试已结束' }}</text>
					</view>
					<button class="end-btn" @click="endInterview">
						<text class="end-icon">✕</text>
						<text class="end-text">结束面试</text>
					</button>
				</view>
			</view>

			<!-- 面试对话区域 -->
			<view class="chat-container" ref="chatContainer">
				<view v-for="(msg, index) in messages" :key="index"
					class="message-row"
					:class="msg.role === 'interviewer' ? 'interviewer' : 'candidate'">
					<view class="avatar-circle" :class="msg.role">
						<text class="avatar-icon">{{ msg.role === 'interviewer' ? '💬' : '👤' }}</text>
					</view>
					<view class="message-bubble" :class="msg.role">
						<text class="message-text">{{ msg.content }}</text>
						<text class="message-time">{{ msg.time }}</text>
					</view>
				</view>

				<!-- AI 正在输入提示 -->
				<view v-if="isAIThinking" class="message-row interviewer">
					<view class="avatar-circle interviewer">
						<text class="avatar-icon">💬</text>
					</view>
					<view class="message-bubble interviewer thinking">
						<view class="typing-indicator">
							<view class="dot"></view>
							<view class="dot"></view>
							<view class="dot"></view>
						</view>
					</view>
				</view>
			</view>

			<!-- 语音输入区域 -->
			<view class="voice-input-section">
				<view class="voice-hint">
					<text class="mic-icon">🎤</text>
					<text class="hint-text">{{ voiceHintText }}</text>
				</view>

				<view class="voice-controls">
					<view class="control-btn play-btn" :class="{ disabled: !canReplay }" @click="replayLastMessage">
						<text class="btn-icon">🔊</text>
					</view>
					<view class="control-btn mic-btn" :class="{ active: isRecording, disabled: isAIThinking }" @click="toggleRecording">
						<text class="btn-icon">🎤</text>
					</view>
				</view>

				<text class="voice-tip">提示：点击麦克风录音并保存音频文件，或在上方输入框直接输入回答</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { request } from '@/utils/http.js'

const BASE_URL = 'http://81.71.75.85:6008/api'

const isInterviewActive = ref(true)
const isRecording = ref(false)
const isAIThinking = ref(false)
const recognizedText = ref('')
const isSpeaking = ref(false)
const isInitialized = ref(false)
const messages = ref([])
const chatContainer = ref(null)

let mediaRecorder = null
let audioChunks = []
let currentUtterance = null
let recordingStartTime = 0

const voiceHintText = computed(() => {
	if (isRecording.value) return '正在录音...'
	if (isAIThinking.value) return '面试官正在思考...'
	if (isSpeaking.value) return '面试官正在说话...'
	return '点击麦克风开始录音'
})

const canReplay = computed(() => {
	const lastInterviewerMsg = [...messages.value].reverse().find(m => m.role === 'interviewer')
	return !!lastInterviewerMsg
})

const formatTime = () => {
	const now = new Date()
	return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const addMessage = (role, content) => {
	messages.value.push({ role, content, time: formatTime() })
	nextTick(() => scrollToBottom())
}

const scrollToBottom = () => {
	const container = document.querySelector('.chat-container')
	if (container) container.scrollTop = container.scrollHeight
}

const stopAllSpeech = () => {
	if (window.speechSynthesis) {
		if (currentUtterance) {
			currentUtterance.onend = null
			currentUtterance.onerror = null
		}
		window.speechSynthesis.cancel()
	}
	isSpeaking.value = false
	currentUtterance = null
}

const startRecording = async () => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
		})

		let mimeType = 'audio/webm'
		let extension = 'webm'

		if (MediaRecorder.isTypeSupported('audio/mp4')) { mimeType = 'audio/mp4'; extension = 'm4a' }
		else if (MediaRecorder.isTypeSupported('audio/mp4;codecs="aac"')) { mimeType = 'audio/mp4;codecs="aac"'; extension = 'm4a' }
		else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) { mimeType = 'audio/webm;codecs=opus'; extension = 'webm' }

		mediaRecorder = new MediaRecorder(stream, { mimeType })
		audioChunks = []
		recordingStartTime = Date.now()

		mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.push(event.data) }
		mediaRecorder.onstop = () => saveRecording(extension, mimeType)
		mediaRecorder.onerror = () => {
			isRecording.value = false
			uni.showToast({ title: '录音出错，请重试', icon: 'none' })
		}

		mediaRecorder.start(1000)
		isRecording.value = true
	} catch (error) {
		let errorMsg = '启动录音失败'
		if (error.name === 'NotAllowedError') errorMsg = '请允许访问麦克风'
		else if (error.name === 'NotFoundError') errorMsg = '未找到麦克风设备'
		uni.showToast({ title: errorMsg, icon: 'none' })
	}
}

const stopRecording = () => {
	if (mediaRecorder && isRecording.value) {
		mediaRecorder.stop()
		mediaRecorder.stream.getTracks().forEach(track => track.stop())
		isRecording.value = false
	}
}

const saveRecording = async () => {
	if (audioChunks.length === 0) {
		uni.showToast({ title: '录音数据为空', icon: 'none' })
		return
	}

	const duration = Math.round((Date.now() - recordingStartTime) / 1000)
	addMessage('candidate', `语音消息 (${duration}秒)`)
	audioChunks = []
	uni.showToast({ title: `录音成功 (${duration}秒)`, icon: 'success' })

	isAIThinking.value = true
	setTimeout(() => {
		const nextQuestion = getFallbackResponse('')
		addMessage('interviewer', nextQuestion)
		speakMessage(nextQuestion)
		isAIThinking.value = false
	}, 800)
}

const toggleRecording = async () => {
	if (isAIThinking.value) return
	if (isRecording.value) { stopRecording(); return }
	stopAllSpeech()
	await startRecording()
}

const speakMessage = (text) => {
	if (!window.speechSynthesis) return
	stopAllSpeech()

	const utterance = new SpeechSynthesisUtterance(text)
	currentUtterance = utterance
	utterance.lang = 'zh-CN'
	utterance.rate = 1
	utterance.pitch = 1
	utterance.volume = 1

	const voices = window.speechSynthesis.getVoices()
	const chineseVoice = voices.find(v => v.lang.includes('zh-CN') || v.lang.includes('zh'))
	if (chineseVoice) utterance.voice = chineseVoice

	utterance.onstart = () => isSpeaking.value = true
	utterance.onend = () => { isSpeaking.value = false; currentUtterance = null }
	utterance.onerror = () => { isSpeaking.value = false; currentUtterance = null }

	setTimeout(() => window.speechSynthesis.speak(utterance), 100)
}

const replayLastMessage = () => {
	if (!canReplay.value) return
	const lastInterviewerMsg = [...messages.value].reverse().find(m => m.role === 'interviewer')
	if (lastInterviewerMsg) speakMessage(lastInterviewerMsg.content)
}

const endInterview = () => {
	uni.showModal({
		title: '结束面试',
		content: '确定要结束当前面试吗？',
		success: async (res) => {
			if (res.confirm) {
				stopAllSpeech()
				if (mediaRecorder && isRecording.value) {
					try { mediaRecorder.stop(); mediaRecorder.stream?.getTracks().forEach(t => t.stop()) } catch (e) {}
				}

				const sessionId = uni.getStorageSync('sessionId')
				if (sessionId) {
					try {
						await request({ url: `/v1/mock-interview/session/${sessionId}/end`, method: 'POST', data: { messages: messages.value, endTime: new Date().toISOString() }})
						uni.removeStorageSync('sessionId')
					} catch (e) {}
				}

				isInterviewActive.value = false
				uni.showToast({ title: '面试已结束', icon: 'success' })
				setTimeout(() => uni.navigateBack(), 1500)
			}
		}
	})
}

const currentQuestionIndex = ref(0)
const frontendInterviewQuestions = [
	{ id: 1, question: '你好！我是今天的面试官，很高兴能和你交流。首先，请简单介绍一下你自己，包括你的技术背景和项目经验。', followUp: '好的，感谢你的介绍。' },
	{ id: 2, question: '你提到你有前端开发经验，能详细说说你最熟悉的前端技术栈吗？比如 Vue、React 或者其他框架？', followUp: '很好，看来你对这个技术栈有比较深入的了解。' },
	{ id: 3, question: '请解释一下什么是闭包？在 JavaScript 中闭包有哪些应用场景？能否举一个实际的例子？', followUp: '解释得很清楚，闭包确实是 JavaScript 中非常重要的概念。' },
	{ id: 4, question: '说说 Vue 的响应式原理是什么？Vue 2 和 Vue 3 的响应式实现有什么区别？', followUp: '对 Vue 的响应式原理理解得很到位。' },
	{ id: 5, question: '什么是虚拟 DOM？它有什么优势？Vue 和 React 的虚拟 DOM 有什么区别？', followUp: '很好的回答，虚拟 DOM 确实是现代前端框架的核心技术之一。' },
	{ id: 6, question: '请解释一下 CSS 盒模型。标准盒模型和怪异盒模型有什么区别？如何设置？', followUp: '对盒模型的理解很准确。' },
	{ id: 7, question: '你了解哪些前端性能优化方案？请从加载优化、渲染优化、代码优化等方面谈谈你的经验。', followUp: '性能优化是前端开发中非常重要的一环，你的回答很全面。' },
	{ id: 8, question: '请解释一下浏览器的事件循环机制。宏任务和微任务有什么区别？', followUp: '事件循环是 JavaScript 异步编程的核心，理解得很透彻。' },
	{ id: 9, question: '你如何处理跨域问题？有哪些常见的解决方案？CORS 的原理是什么？', followUp: '跨域是前端开发中常见的问题，你的解决方案很实用。' },
	{ id: 10, question: '请描述一下你做过的一个前端项目，包括技术选型、遇到的挑战以及你是如何解决的。', followUp: '感谢你的分享，项目经验很丰富。' },
	{ id: 11, question: '你了解前端安全吗？常见的 XSS 和 CSRF 攻击是什么？如何防范？', followUp: '前端安全意识很重要，你的回答很专业。' },
	{ id: 12, question: '最后，你有什么问题想问我的吗？关于团队、技术栈或者工作内容都可以。', followUp: '感谢你的提问，今天的面试就到这里，我们会尽快给你反馈。' }
]

const getFallbackResponse = () => {
	const nextIndex = currentQuestionIndex.value
	if (nextIndex < frontendInterviewQuestions.length) {
		const questionData = frontendInterviewQuestions[nextIndex]
		currentQuestionIndex.value++
		if (nextIndex > 0) {
			const prevQuestion = frontendInterviewQuestions[nextIndex - 1]
			return `${prevQuestion.followUp}\n\n${questionData.question}`
		}
		return questionData.question
	}
	return '感谢你今天的参与！我们的面试环节已经结束了。你表现得很好，我们会综合评估后尽快给你反馈。祝你求职顺利！'
}

const defaultWelcome = frontendInterviewQuestions[0].question

const initInterview = async () => {
	currentQuestionIndex.value = 0
	try {
		const sessionId = uni.getStorageSync('sessionId')
		if (!sessionId) {
			addMessage('interviewer', defaultWelcome)
			speakMessage(defaultWelcome)
			return
		}
		const response = await request({ url: `/v1/mock-interview/session/${sessionId}/start`, method: 'POST' })
		let welcomeMessage = defaultWelcome
		if (response && (response.code === 0 || response.code === 200)) {
			welcomeMessage = response.data?.message || response.data?.welcome || defaultWelcome
		}
		addMessage('interviewer', welcomeMessage)
		speakMessage(welcomeMessage)
	} catch (error) {
		addMessage('interviewer', defaultWelcome)
		speakMessage(defaultWelcome)
	}
}

const resetAllState = () => {
	stopAllSpeech()
	if (mediaRecorder) { try { mediaRecorder.stop(); mediaRecorder.stream?.getTracks().forEach(t => t.stop()) } catch (e) {} mediaRecorder = null }
	isInterviewActive.value = true
	isRecording.value = false
	isAIThinking.value = false
	recognizedText.value = ''
	isSpeaking.value = false
	currentQuestionIndex.value = 0
	messages.value = []
}

const preloadVoices = () => {
	if (window.speechSynthesis) {
		window.speechSynthesis.getVoices()
		window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
	}
}

onShow(() => {
	if (isInitialized.value) {
		resetAllState()
		preloadVoices()
		nextTick(() => initInterview())
	} else { isInitialized.value = true }
})

onHide(() => {
	stopAllSpeech()
	if (mediaRecorder && isRecording.value) { try { mediaRecorder.stop(); mediaRecorder.stream?.getTracks().forEach(t => t.stop()) } catch (e) {} }
})

onMounted(() => {
	preloadVoices()
	resetAllState()
	initInterview()
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) { stopAllSpeech(); if (mediaRecorder && isRecording.value) { try { mediaRecorder.stop(); mediaRecorder.stream?.getTracks().forEach(t => t.stop()) } catch (e) {} } }
	})
	window.addEventListener('beforeunload', () => stopAllSpeech())
})

onUnmounted(() => {
	stopAllSpeech()
	if (mediaRecorder) { try { mediaRecorder.stop(); mediaRecorder.stream?.getTracks().forEach(t => t.stop()) } catch (e) {} mediaRecorder = null }
	document.removeEventListener('visibilitychange', () => {})
	window.removeEventListener('beforeunload', () => {})
})
</script>

<style scoped lang="scss">
.interview-main {
	margin-left: var(--sidebar-width, 240px);
	padding: 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.interview-header {
	background: var(--bg-card);
	padding: 20px 32px;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	border-bottom: 1px solid var(--border-color);
	flex-shrink: 0;
}

.header-left {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.page-title {
	font-size: 24px;
	font-weight: 700;
	color: var(--text-primary);
}

.page-subtitle {
	font-size: 14px;
	color: var(--text-secondary);
}

.header-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.status-badge {
	display: flex;
	align-items: center;
	gap: 6px;
	background: rgba(16, 185, 129, 0.1);
	padding: 6px 14px;
	border-radius: 20px;

	&.status-ended {
		background: rgba(239, 68, 68, 0.1);
		.status-dot { background: #ef4444; }
		.status-text { color: #ef4444; }
	}
}

.status-dot {
	width: 8px;
	height: 8px;
	background: #10b981;
	border-radius: 50%;
	animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}

.status-text {
	font-size: 13px;
	color: #059669;
	font-weight: 500;
}

.end-btn {
	background: #ef4444;
	color: #ffffff;
	border: none;
	padding: 8px 16px;
	border-radius: var(--radius-sm);
	font-size: 13px;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 6px;
	cursor: pointer;
	transition: all var(--transition-fast);

	&:hover {
		background: #dc2626;
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}
}

.end-icon {
	font-size: 14px;
}

.chat-container {
	flex: 1;
	padding: 24px 32px;
	display: flex;
	flex-direction: column;
	gap: 16px;
	overflow-y: auto;
	background: var(--bg-page);
}

.message-row {
	display: flex;
	gap: 12px;
	animation: messageSlide 0.3s ease;

	&.interviewer { align-items: flex-start; }
	&.candidate { align-items: flex-end; flex-direction: row-reverse; }
}

@keyframes messageSlide {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}

.avatar-circle {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;

	&.interviewer { background: linear-gradient(135deg, var(--primary-light), #06b6d4); }
	&.candidate { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
}

.avatar-icon {
	font-size: 20px;
}

.message-bubble {
	padding: 14px 18px;
	border-radius: var(--radius-md);
	max-width: 65%;
	display: flex;
	flex-direction: column;
	gap: 6px;
	box-shadow: var(--shadow-sm);

	&.interviewer {
		background: var(--bg-card);
		border: 1px solid var(--border-color);
		border-top-left-radius: 4px;
	}

	&.candidate {
		background: linear-gradient(135deg, var(--primary-light), #06b6d4);
		border-top-right-radius: 4px;

		.message-text, .message-time { color: #ffffff; }
	}

	&.thinking { padding: 16px 20px; }
}

.message-text {
	font-size: 14px;
	color: var(--text-primary);
	line-height: 1.6;
}

.message-time {
	font-size: 11px;
	color: var(--text-muted);
	align-self: flex-end;
}

.typing-indicator {
	display: flex;
	gap: 4px;
	align-items: center;

	.dot {
		width: 6px;
		height: 6px;
		background: var(--text-muted);
		border-radius: 50%;
		animation: typing 1.4s infinite ease-in-out both;

		&:nth-child(1) { animation-delay: -0.32s; }
		&:nth-child(2) { animation-delay: -0.16s; }
	}
}

@keyframes typing {
	0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
	40% { transform: scale(1); opacity: 1; }
}

.voice-input-section {
	background: var(--bg-card);
	padding: 20px 32px;
	border-top: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	flex-shrink: 0;
}

.voice-hint {
	display: flex;
	align-items: center;
	gap: 8px;
}

.mic-icon {
	font-size: 16px;
	color: var(--text-muted);
}

.hint-text {
	font-size: 14px;
	color: var(--text-secondary);
}

.voice-controls {
	display: flex;
	align-items: center;
	gap: 20px;
}

.control-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all var(--transition-fast);

	&:hover:not(.disabled) { transform: scale(1.05); }
	&.disabled { opacity: 0.5; cursor: not-allowed; }
}

.play-btn {
	width: 48px;
	height: 48px;
	background: var(--bg-page);
	border: 1px solid var(--border-color);
	border-radius: 50%;
	box-shadow: var(--shadow-sm);

	&:hover:not(.disabled) {
		border-color: var(--primary-light);
		box-shadow: var(--shadow-md);
	}
}

.mic-btn {
	width: 72px;
	height: 72px;
	background: linear-gradient(135deg, var(--primary-light), #06b6d4);
	border-radius: 50%;
	box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);

	&:hover:not(.disabled) {
		transform: scale(1.08);
		box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
	}

	&.active {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
		animation: pulse-record 1.5s infinite;
	}
}

@keyframes pulse-record {
	0% { box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3); }
	50% { box-shadow: 0 4px 24px rgba(239, 68, 68, 0.5); }
	100% { box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3); }
}

.btn-icon {
	font-size: 24px;
}

.voice-tip {
	font-size: 12px;
	color: var(--text-muted);
	text-align: center;
	line-height: 1.5;
}
</style>