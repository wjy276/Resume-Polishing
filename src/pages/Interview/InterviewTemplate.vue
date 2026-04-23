<template>
	<view class="interview-template-container">
		<!-- 侧边栏 -->
		<Sidebar />

		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 页面头部 -->
			<view class="page-header">
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
				<!-- 消息列表 -->
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
				<!-- 文本输入区域 -->
				<!-- <view class="text-input-area">
					<textarea
						class="answer-input"
						v-model="recognizedText"
						placeholder="请输入您的回答..."
						:maxlength="500"
						auto-height
					></textarea>
					<view class="input-actions">
						<text class="char-count">{{ recognizedText.length }}/500</text>
						<view class="input-btns">
							<view class="action-btn cancel-btn" @click="clearRecognizedText" v-if="recognizedText">
								<text class="action-text">清除</text>
							</view>
							<view class="action-btn send-btn" @click="sendRecognizedText">
								<text class="action-text">发送</text>
							</view>
						</view>
					</view>
				</view> -->

				<view class="voice-hint">
					<text class="mic-icon">🎤</text>
					<text class="hint-text">{{ voiceHintText }}</text>
				</view>

				<view class="voice-controls">
					<!-- 播放按钮 - 播放最后一条面试官消息 -->
					<view class="control-btn play-btn" :class="{ disabled: !canReplay }" @click="replayLastMessage">
						<text class="btn-icon">🔊</text>
					</view>
					<!-- 麦克风按钮 -->
					<view class="control-btn mic-btn" :class="{ active: isRecording, disabled: isAIThinking }" @click="toggleRecording">
						<text class="btn-icon">🎤</text>
					</view>
				</view>

				<text class="voice-tip">
					提示：点击麦克风录音并保存音频文件，或在上方输入框直接输入回答
				</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { onShow, onHide, onLoad } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { request } from '@/stores/user.js'

// 面试状态
const isInterviewActive = ref(true)
const isRecording = ref(false)
const isAIThinking = ref(false)
const recognizedText = ref('')
const isSpeaking = ref(false) // 语音播放状态
const isInitialized = ref(false) // 是否已初始化

// API 基础地址
const BASE_URL = 'http://81.71.75.85:6008/api'

// 消息列表
const messages = ref([])
const chatContainer = ref(null)

// 录音相关
let mediaRecorder = null
let audioChunks = []
let currentUtterance = null // 当前播放的语音实例
let recordingStartTime = 0 // 录音开始时间

// 计算属性
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

// 格式化时间
const formatTime = () => {
	const now = new Date()
	return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// 添加消息
const addMessage = (role, content) => {
	messages.value.push({
		role,
		content,
		time: formatTime()
	})
	// 滚动到底部
	nextTick(() => {
		scrollToBottom()
	})
}

// 滚动到底部
const scrollToBottom = () => {
	const container = document.querySelector('.chat-container')
	if (container) {
		container.scrollTop = container.scrollHeight
	}
}

// 停止所有语音
const stopAllSpeech = () => {
	if (window.speechSynthesis) {
		// 先移除事件监听，避免触发 interrupted 错误
		if (currentUtterance) {
			currentUtterance.onend = null
			currentUtterance.onerror = null
		}
		window.speechSynthesis.cancel()
	}
	isSpeaking.value = false
	currentUtterance = null
}

// 开始录音
const startRecording = async () => {
	try {
		// 请求麦克风权限
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				sampleRate: 16000, // 降低采样率，提高兼容性
				channelCount: 1,
				echoCancellation: true,
				noiseSuppression: true
			}
		})

		// 确定支持的音频格式 - 根据服务端支持的格式优先选择
		// 服务端支持：mp3、wav、m4a、aac、ogg、flac、webm、amr
		let mimeType = 'audio/webm'
		let extension = 'webm'

		// 优先尝试 m4a/mp4 格式（iOS/Safari 兼容性好，服务端也支持）
		if (MediaRecorder.isTypeSupported('audio/mp4')) {
			mimeType = 'audio/mp4'
			extension = 'm4a'
		} else if (MediaRecorder.isTypeSupported('audio/mp4;codecs="aac"')) {
			mimeType = 'audio/mp4;codecs="aac"'
			extension = 'm4a'
		} else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
			mimeType = 'audio/webm;codecs=opus'
			extension = 'webm'
		} else if (MediaRecorder.isTypeSupported('audio/webm')) {
			mimeType = 'audio/webm'
			extension = 'webm'
		} else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
			mimeType = 'audio/ogg;codecs=opus'
			extension = 'ogg'
		} else if (MediaRecorder.isTypeSupported('audio/ogg')) {
			mimeType = 'audio/ogg'
			extension = 'ogg'
		}

		console.log('录音格式检测:')
		console.log('  - 选定 MIME 类型:', mimeType)
		console.log('  - 文件扩展名:', extension)
		console.log('  - webm 支持:', MediaRecorder.isTypeSupported('audio/webm'))
		console.log('  - mp4 支持:', MediaRecorder.isTypeSupported('audio/mp4'))
		console.log('  - ogg 支持:', MediaRecorder.isTypeSupported('audio/ogg'))

		console.log('使用音频格式:', mimeType, '扩展名:', extension)

		// 创建 MediaRecorder
		mediaRecorder = new MediaRecorder(stream, { mimeType })

		audioChunks = []
		recordingStartTime = Date.now()

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) {
				audioChunks.push(event.data)
			}
		}

		mediaRecorder.onstop = () => {
			saveRecording(extension, mimeType)
		}

		mediaRecorder.onerror = (event) => {
			console.error('录音错误：', event)
			isRecording.value = false
			uni.showToast({
				title: '录音出错，请重试',
				icon: 'none'
			})
		}

		// 开始录音
		mediaRecorder.start(1000) // 每秒收集一次数据
		isRecording.value = true

		console.log('录音开始')

	} catch (error) {
		console.error('启动录音失败：', error)

		let errorMsg = '启动录音失败'
		if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
			errorMsg = '请允许访问麦克风'
		} else if (error.name === 'NotFoundError') {
			errorMsg = '未找到麦克风设备'
		}

		uni.showToast({
			title: errorMsg,
			icon: 'none'
		})
	}
}

// 停止录音
const stopRecording = () => {
	if (mediaRecorder && isRecording.value) {
		mediaRecorder.stop()
		mediaRecorder.stream.getTracks().forEach(track => track.stop())
		isRecording.value = false
		console.log('录音结束')
	}
}

// 保存录音并上传到后端
const saveRecording = async (extension = 'webm', mimeType = 'audio/webm') => {
	if (audioChunks.length === 0) {
		uni.showToast({
			title: '录音数据为空',
			icon: 'none'
		})
		return
	}

	// 计算录音时长
	const duration = Math.round((Date.now() - recordingStartTime) / 1000)

	// 显示用户消息（语音消息）
	addMessage('candidate', `语音消息 (${duration}秒)`)

	uni.hideLoading()
	audioChunks = []

	uni.showToast({
		title: `录音成功 (${duration}秒)`,
		icon: 'success'
	})

	// 直接获取下一个问题
	isAIThinking.value = true

	setTimeout(() => {
		// 获取下一个面试问题
		const nextQuestion = getFallbackResponse('')
		addMessage('interviewer', nextQuestion)
		speakMessage(nextQuestion)
		isAIThinking.value = false
	}, 800)
}

// 播放远程音频
const playAudioFromUrl = (url) => {
	if (!url) return

	try {
		const audio = new Audio(url)
		audio.onplay = () => {
			isSpeaking.value = true
			// 更新AI消息状态为正在播放
			const lastMsg = messages.value[messages.value.length - 1]
			if (lastMsg && lastMsg.role === 'interviewer') {
				lastMsg.content = '正在播放回复...'
			}
			console.log('AI音频播放开始')
		}
		audio.onended = () => {
			isSpeaking.value = false
			// 更新AI消息状态为已完成
			const lastMsg = messages.value[messages.value.length - 1]
			if (lastMsg && lastMsg.role === 'interviewer') {
				lastMsg.content = '语音回复已完成'
			}
			console.log('AI音频播放结束')
		}
		audio.onerror = (e) => {
			console.error('音频播放错误：', e)
			isSpeaking.value = false
			// 更新AI消息状态为错误
			const lastMsg = messages.value[messages.value.length - 1]
			if (lastMsg && lastMsg.role === 'interviewer') {
				lastMsg.content = '音频播放失败'
			}
		}
		audio.play()
	} catch (error) {
		console.error('播放音频失败：', error)
	}
}

// 切换录音状态
const toggleRecording = async () => {
	if (isAIThinking.value) return

	// 如果正在录音，停止录音
	if (isRecording.value) {
		stopRecording()
		return
	}

	// 开始录音前，先停止正在播放的语音
	stopAllSpeech()

	// 开始录音
	await startRecording()
}

// 发送识别的文本
const sendRecognizedText = () => {
	if (!recognizedText.value.trim()) {
		uni.showToast({
			title: '请先输入内容',
			icon: 'none'
		})
		return
	}

	const text = recognizedText.value.trim()
	recognizedText.value = ''

	// 添加用户消息
	addMessage('candidate', text)

	// 发送到后端
	sendToInterviewer(text)
}

// 清除识别的文本
const clearRecognizedText = () => {
	recognizedText.value = ''
}

// 处理用户回答
const handleUserResponse = async (text) => {
	if (!text.trim()) return

	// 添加用户消息
	addMessage('candidate', text)
	recognizedText.value = ''

	// 发送到后端
	await sendToInterviewer(text)
}

// 发送消息给面试官（后端AI）
const sendToInterviewer = async (userMessage) => {
	isAIThinking.value = true
	const sessionId = uni.getStorageSync('sessionId')
	const token = uni.getStorageSync('token')

	try {
		// 构建对话历史
		const conversationHistory = messages.value.map(msg => ({
			role: msg.role === 'interviewer' ? 'assistant' : 'user',
			content: msg.content
		}))

		// 调用后端 API
		const response = await request({
			url: `/v1/mock-interview/session/${sessionId}/message`,
			method: 'POST',
			data: {
				message: userMessage,
				history: conversationHistory,
				interviewType: 'hr' // 面试类型，可根据需要调整
			}
		})

		console.log('面试官响应：', response)

		// 处理响应
		if (response.code === 0 || response.code === 200) {
			const aiMessage = response.data?.message || response.data?.content || '抱歉，我没有理解您的问题。'
			addMessage('interviewer', aiMessage)

			// 语音播报
			speakMessage(aiMessage)
		} else {
			throw new Error(response.message || '请求失败')
		}
	} catch (error) {
		console.error('发送消息失败：', error)

		// 模拟面试官回复（当后端接口未就绪时）
		const fallbackResponse = getFallbackResponse(userMessage)
		addMessage('interviewer', fallbackResponse)
		speakMessage(fallbackResponse)
	} finally {
		isAIThinking.value = false
	}
}

// 当前面试问题索引
const currentQuestionIndex = ref(0)

// 前端开发工程师面试问题列表（写死）
const frontendInterviewQuestions = [
	{
		id: 1,
		question: '你好！我是今天的面试官，很高兴能和你交流。首先，请简单介绍一下你自己，包括你的技术背景和项目经验。',
		followUp: '好的，感谢你的介绍。'
	},
	{
		id: 2,
		question: '你提到你有前端开发经验，能详细说说你最熟悉的前端技术栈吗？比如 Vue、React 或者其他框架？',
		followUp: '很好，看来你对这个技术栈有比较深入的了解。'
	},
	{
		id: 3,
		question: '请解释一下什么是闭包？在 JavaScript 中闭包有哪些应用场景？能否举一个实际的例子？',
		followUp: '解释得很清楚，闭包确实是 JavaScript 中非常重要的概念。'
	},
	{
		id: 4,
		question: '说说 Vue 的响应式原理是什么？Vue 2 和 Vue 3 的响应式实现有什么区别？',
		followUp: '对 Vue 的响应式原理理解得很到位。'
	},
	{
		id: 5,
		question: '什么是虚拟 DOM？它有什么优势？Vue 和 React 的虚拟 DOM 有什么区别？',
		followUp: '很好的回答，虚拟 DOM 确实是现代前端框架的核心技术之一。'
	},
	{
		id: 6,
		question: '请解释一下 CSS 盒模型。标准盒模型和怪异盒模型有什么区别？如何设置？',
		followUp: '对盒模型的理解很准确。'
	},
	{
		id: 7,
		question: '你了解哪些前端性能优化方案？请从加载优化、渲染优化、代码优化等方面谈谈你的经验。',
		followUp: '性能优化是前端开发中非常重要的一环，你的回答很全面。'
	},
	{
		id: 8,
		question: '请解释一下浏览器的事件循环机制。宏任务和微任务有什么区别？',
		followUp: '事件循环是 JavaScript 异步编程的核心，理解得很透彻。'
	},
	{
		id: 9,
		question: '你如何处理跨域问题？有哪些常见的解决方案？CORS 的原理是什么？',
		followUp: '跨域是前端开发中常见的问题，你的解决方案很实用。'
	},
	{
		id: 10,
		question: '请描述一下你做过的一个前端项目，包括技术选型、遇到的挑战以及你是如何解决的。',
		followUp: '感谢你的分享，项目经验很丰富。'
	},
	{
		id: 11,
		question: '你了解前端安全吗？常见的 XSS 和 CSRF 攻击是什么？如何防范？',
		followUp: '前端安全意识很重要，你的回答很专业。'
	},
	{
		id: 12,
		question: '最后，你有什么问题想问我的吗？关于团队、技术栈或者工作内容都可以。',
		followUp: '感谢你的提问，今天的面试就到这里，我们会尽快给你反馈。'
	}
]

// 模拟回复（后端接口未就绪时使用）- 前端开发工程师面试
const getFallbackResponse = (userMessage) => {
	// 获取下一个问题
	const nextIndex = currentQuestionIndex.value

	if (nextIndex < frontendInterviewQuestions.length) {
		const questionData = frontendInterviewQuestions[nextIndex]
		currentQuestionIndex.value++

		// 如果不是第一个问题，先给出反馈再提问
		if (nextIndex > 0) {
			const prevQuestion = frontendInterviewQuestions[nextIndex - 1]
			return `${prevQuestion.followUp}\n\n${questionData.question}`
		}

		return questionData.question
	}

	// 所有问题都问完了
	return '感谢你今天的参与！我们的面试环节已经结束了。你表现得很好，我们会综合评估后尽快给你反馈。祝你求职顺利！'
}

// 默认开场白
const defaultWelcome = frontendInterviewQuestions[0].question

// 语音播报
const speakMessage = (text) => {
	if (!window.speechSynthesis) {
		console.warn('当前浏览器不支持语音合成')
		return
	}

	// 先停止之前的播报
	stopAllSpeech()

	console.log('准备语音播报:', text.substring(0, 50) + '...')

	const utterance = new SpeechSynthesisUtterance(text)
	currentUtterance = utterance

	// 设置语音参数
	utterance.lang = 'zh-CN'
	utterance.rate = 1
	utterance.pitch = 1
	utterance.volume = 1

	// 尝试获取中文语音
	const voices = window.speechSynthesis.getVoices()
	console.log('可用语音数量:', voices.length)

	// 优先选择高质量的中文语音
	const chineseVoice = voices.find(voice =>
		voice.lang.includes('zh-CN') || voice.lang.includes('zh')
	) || voices.find(voice => voice.lang.includes('zh'))

	if (chineseVoice) {
		utterance.voice = chineseVoice
		console.log('使用语音:', chineseVoice.name, chineseVoice.lang)
	} else {
		console.warn('未找到中文语音，使用默认语音')
	}

	utterance.onstart = () => {
		console.log('语音播放开始')
		isSpeaking.value = true
	}

	utterance.onend = () => {
		console.log('语音播放结束')
		isSpeaking.value = false
		currentUtterance = null
	}

	utterance.onerror = (event) => {
		// interrupted 是正常的中断，不算错误
		if (event.error === 'interrupted' || event.error === 'canceled') {
			console.log('语音播放被中断')
		} else {
			console.error('语音播放错误：', event.error)
		}
		isSpeaking.value = false
		currentUtterance = null
	}

	// 某些浏览器需要延迟调用
	setTimeout(() => {
		window.speechSynthesis.speak(utterance)
	}, 100)
}

// 重播最后一条面试官消息
const replayLastMessage = () => {
	if (!canReplay.value) return

	const lastInterviewerMsg = [...messages.value].reverse().find(m => m.role === 'interviewer')
	if (lastInterviewerMsg) {
		speakMessage(lastInterviewerMsg.content)
	}
}

// 结束面试
const endInterview = () => {
	uni.showModal({
		title: '结束面试',
		content: '确定要结束当前面试吗？',
		success: async (res) => {
			if (res.confirm) {
				// 停止所有语音和录音
				stopAllSpeech()
				if (mediaRecorder && isRecording.value) {
					try {
						mediaRecorder.stop()
						mediaRecorder.stream?.getTracks().forEach(track => track.stop())
					} catch (e) {}
				}

				// 保存面试记录
				const sessionId = uni.getStorageSync('sessionId')
				if (sessionId) {
					try {
						await request({
							url: `/v1/mock-interview/session/${sessionId}/end`,
							method: 'POST',
							data: {
								messages: messages.value,
								endTime: new Date().toISOString()
							}
						})
						// 清除 sessionId
						uni.removeStorageSync('sessionId')
					} catch (e) {
						console.error('保存面试记录失败：', e)
					}
				}

				isInterviewActive.value = false

				uni.showToast({
					title: '面试已结束',
					icon: 'success'
				})

				setTimeout(() => {
					uni.navigateBack()
				}, 1500)
			}
		}
	})
}

// 初始化面试
const initInterview = async () => {
	console.log('=== 开始初始化面试 ===')

	// 重置问题索引
	currentQuestionIndex.value = 0

	try {
		const sessionId = uni.getStorageSync('sessionId')

		if (!sessionId) {
			console.warn('sessionId 不存在，使用默认开场白')
			addMessage('interviewer', defaultWelcome)
			speakMessage(defaultWelcome)
			return
		}

		// 调用后端获取开场白
		console.log('请求面试开场白...')
		const response = await request({
			url: `/v1/mock-interview/session/${sessionId}/start`,
			method: 'POST'
		})

		console.log('面试开场白响应：', response)

		// 获取消息内容
		let welcomeMessage = defaultWelcome

		// 兼容多种响应格式
		if (response) {
			if (response.code === 0 || response.code === 200 || response.code === '0' || response.code === '200') {
				welcomeMessage = response.data?.message || response.data?.welcome || response.message || defaultWelcome
			} else if (response.data) {
				welcomeMessage = response.data?.message || response.data?.welcome || defaultWelcome
			}
		}

		console.log('开场白内容：', welcomeMessage)
		addMessage('interviewer', welcomeMessage)
		speakMessage(welcomeMessage)

	} catch (error) {
		console.error('初始化面试失败：', error)

		// 无论如何都显示默认开场白
		addMessage('interviewer', defaultWelcome)
		speakMessage(defaultWelcome)
	}
}

// 重置所有状态
const resetAllState = () => {
	console.log('重置面试状态')

	// 停止所有语音和录音
	stopAllSpeech()
	if (mediaRecorder) {
		try {
			mediaRecorder.stop()
			mediaRecorder.stream?.getTracks().forEach(track => track.stop())
		} catch (e) {}
		mediaRecorder = null
	}

	// 重置状态变量
	isInterviewActive.value = true
	isRecording.value = false
	isAIThinking.value = false
	recognizedText.value = ''
	isSpeaking.value = false

	// 重置问题索引
	currentQuestionIndex.value = 0

	// 清空消息列表
	messages.value = []
}

// 预加载语音
const preloadVoices = () => {
	if (window.speechSynthesis) {
		// 某些浏览器需要先调用 getVoices() 才能正常使用语音合成
		const voices = window.speechSynthesis.getVoices()
		console.log('预加载语音，当前可用:', voices.length, '个')

		// 监听语音列表变化
		window.speechSynthesis.onvoiceschanged = () => {
			const newVoices = window.speechSynthesis.getVoices()
			console.log('语音列表更新，当前可用:', newVoices.length, '个')
			// 打印可用的中文语音
			const chineseVoices = newVoices.filter(v => v.lang.includes('zh'))
			if (chineseVoices.length > 0) {
				console.log('可用中文语音:', chineseVoices.map(v => v.name).join(', '))
			}
		}
	}
}

// uni-app 页面显示生命周期（每次进入页面都会触发）
onShow(() => {
	console.log('=== onShow: 页面显示, isInitialized:', isInitialized.value)

	// 只有在已初始化过的情况下才重新初始化（从其他页面返回时）
	// 首次加载由 onMounted 处理
	if (isInitialized.value) {
		console.log('页面返回，重新初始化面试')
		resetAllState()
		preloadVoices()
		nextTick(() => {
			initInterview()
		})
	} else {
		// 标记为已初始化
		isInitialized.value = true
	}
})

// uni-app 页面隐藏生命周期
onHide(() => {
	console.log('=== onHide: 页面隐藏 ===')
	stopAllSpeech()
	if (mediaRecorder && isRecording.value) {
		try {
			mediaRecorder.stop()
			mediaRecorder.stream?.getTracks().forEach(track => track.stop())
		} catch (e) {}
	}
})

// 创建面试会话
const createInterview = async () => {
	const token = uni.getStorageSync('token')

	try {
		const response = await request({
			url: '/v1/mock-interview/session',
			method: 'POST',
			data: {
				interviewType: 'hr'
			}
		})

		console.log('创建面试成功：', response)

		// 保存 sessionId
		if (response.code === 0 || response.code === 200) {
			const sessionId = response.data?.sessionId || response.sessionId
			if (sessionId) {
				uni.setStorageSync('sessionId', sessionId)
				console.log('sessionId 已保存：', sessionId)
			}
		}
	} catch (err) {
		console.error('创建面试失败：', err)
	}
}


// 获取面试消息历史
const setMessages = async () => {
	const sessionId = uni.getStorageSync('sessionId')

	if (!sessionId) {
		console.warn('sessionId 不存在，无法获取消息')
		return
	}

	try {
		const response = await request({
			url: `/v1/mock-interview/session/${sessionId}/message`,
			method: 'GET'
		})

		console.log('获取面试消息成功：', response)

		if (response.code === 0 || response.code === 200) {
			const messageList = response.data || response
			if (Array.isArray(messageList)) {
				messages.value = messageList
			}
		}
	} catch (err) {
		console.error('获取面试消息失败：', err)
	}
}

onMounted(() => {
	console.log('=== onMounted: 面试页面挂载 ===')

	// 预加载语音
	preloadVoices()

	// 首次加载时初始化面试
	resetAllState()
	initInterview()
	createInterview()

	// 监听页面可见性变化
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopAllSpeech()
			if (mediaRecorder && isRecording.value) {
				try {
					mediaRecorder.stop()
					mediaRecorder.stream?.getTracks().forEach(track => track.stop())
				} catch (e) {}
			}
		}
	})

	// 监听页面卸载（浏览器关闭、刷新等）
	window.addEventListener('beforeunload', () => {
		stopAllSpeech()
	})
})

onUnmounted(() => {
	console.log('=== onUnmounted: 面试页面卸载 ===')

	// 停止所有语音
	stopAllSpeech()

	// 停止录音
	if (mediaRecorder) {
		try {
			mediaRecorder.stop()
			mediaRecorder.stream?.getTracks().forEach(track => track.stop())
		} catch (e) {}
		mediaRecorder = null
	}

	// 移除事件监听
	document.removeEventListener('visibilitychange', () => {})
	window.removeEventListener('beforeunload', () => {})
})

onLoad(() => {
	console.log('=== onLoad: 面试页面加载 ===')
	createInterview()
})
</script>

<style scoped lang="scss">
.interview-template-container {
	display: flex;
	height: 100vh;
	background-color: #f9fafb;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 0;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
}

// 页面头部
.page-header {
	background: #ffffff;
	padding: 48rpx 64rpx;
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	border-bottom: 1px solid #e5e7eb;
}

.header-left {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.page-title {
	font-size: 56rpx;
	font-weight: 700;
	color: #111827;
}

.page-subtitle {
	font-size: 32rpx;
	color: #6b7280;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.status-badge {
	display: flex;
	align-items: center;
	gap: 12rpx;
	background: #d1fae5;
	padding: 12rpx 24rpx;
	border-radius: 24rpx;

	&.status-ended {
		background: #fee2e2;

		.status-dot {
			background: #ef4444;
		}

		.status-text {
			color: #dc2626;
		}
	}
}

.status-dot {
	width: 16rpx;
	height: 16rpx;
	background: #10b981;
	border-radius: 50%;
}

.status-text {
	font-size: 28rpx;
	color: #059669;
	font-weight: 500;
}

.end-btn {
	background: #ef4444;
	color: #ffffff;
	border: none;
	padding: 16rpx 32rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	gap: 12rpx;
	cursor: pointer;
	transition: all 0.3s;

	&:hover {
		background: #dc2626;
	}
}

.end-icon {
	font-size: 28rpx;
}

.end-text {
	display: block;
}

// 对话区域
.chat-container {
	flex: 1;
	padding: 64rpx;
	display: flex;
	flex-direction: column;
	gap: 32rpx;
	overflow-y: auto;
}

.message-row {
	display: flex;
	gap: 24rpx;

	&.interviewer {
		align-items: flex-start;
	}

	&.candidate {
		align-items: flex-end;
		flex-direction: row-reverse;
	}
}

.avatar-circle {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;

	&.interviewer {
		background: linear-gradient(135deg, #3b82f6, #06b6d4);
	}

	&.candidate {
		background: linear-gradient(135deg, #8b5cf6, #a855f7);
	}
}

.avatar-icon {
	font-size: 40rpx;
}

.message-bubble {
	padding: 32rpx 40rpx;
	border-radius: 24rpx;
	max-width: 70%;
	display: flex;
	flex-direction: column;
	gap: 12rpx;

	&.interviewer {
		background: #f3f4f6;
		border-top-left-radius: 4rpx;
	}

	&.candidate {
		background: linear-gradient(135deg, #3b82f6, #06b6d4);
		border-top-right-radius: 4rpx;

		.message-text,
		.message-time {
			color: #ffffff;
		}
	}

	&.thinking {
		padding: 24rpx 40rpx;
	}
}

.message-text {
	font-size: 32rpx;
	color: #374151;
	line-height: 1.6;
}

.message-time {
	font-size: 24rpx;
	color: #9ca3af;
	align-self: flex-end;
}

// 打字动画
.typing-indicator {
	display: flex;
	gap: 8rpx;
	align-items: center;

	.dot {
		width: 12rpx;
		height: 12rpx;
		background: #9ca3af;
		border-radius: 50%;
		animation: typing 1.4s infinite ease-in-out both;

		&:nth-child(1) {
			animation-delay: -0.32s;
		}

		&:nth-child(2) {
			animation-delay: -0.16s;
		}

		&:nth-child(3) {
			animation-delay: 0s;
		}
	}
}

@keyframes typing {
	0%, 80%, 100% {
		transform: scale(0.6);
		opacity: 0.5;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}

// 语音输入区域
.voice-input-section {
	background: #ffffff;
	padding: 48rpx;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 32rpx;
	margin: 0 64rpx 64rpx;
}

// 文本输入区域
.text-input-area {
	width: 100%;
	max-width: 800rpx;
	background: #f9fafb;
	border: 2rpx solid #e5e7eb;
	border-radius: 16rpx;
	padding: 24rpx;
}

.answer-input {
	width: 100%;
	min-height: 120rpx;
	font-size: 30rpx;
	color: #374151;
	line-height: 1.6;
	background: transparent;
	border: none;
	resize: none;

	&::placeholder {
		color: #9ca3af;
	}
}

.input-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 16rpx;
	padding-top: 16rpx;
	border-top: 1px solid #e5e7eb;
}

.char-count {
	font-size: 24rpx;
	color: #9ca3af;
}

.input-btns {
	display: flex;
	gap: 16rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 24rpx;
	border-radius: 12rpx;
	cursor: pointer;
	transition: all 0.2s;

	&.send-btn {
		background: #3b82f6;
		color: #ffffff;

		&:hover {
			background: #2563eb;
		}
	}

	&.cancel-btn {
		background: #f3f4f6;
		color: #6b7280;

		&:hover {
			background: #e5e7eb;
		}
	}
}

.action-text {
	font-size: 26rpx;
	font-weight: 500;
}

.voice-hint {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.mic-icon {
	font-size: 28rpx;
	color: #9ca3af;
}

.hint-text {
	font-size: 28rpx;
	color: #6b7280;
}

.voice-controls {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.control-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s;

	&:hover:not(.disabled) {
		transform: scale(1.05);
	}

	&.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}

.play-btn {
	width: 80rpx;
	height: 80rpx;
	background: #ffffff;
	border: 2rpx solid #e5e7eb;
	border-radius: 50%;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.mic-btn {
	width: 160rpx;
	height: 160rpx;
	background: linear-gradient(135deg, #3b82f6, #06b6d4);
	border-radius: 50%;
	box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.3);

	&.active {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
		animation: pulse 1.5s infinite;
	}

	&.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

@keyframes pulse {
	0% {
		box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
	}
	50% {
		box-shadow: 0 8rpx 40rpx rgba(239, 68, 68, 0.5);
	}
	100% {
		box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
	}
}

.btn-icon {
	font-size: 48rpx;
}

.voice-tip {
	font-size: 26rpx;
	color: #9ca3af;
	text-align: center;
	line-height: 1.6;
	max-width: 900rpx;
}
</style>
