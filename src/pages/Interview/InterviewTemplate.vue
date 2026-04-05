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
				<!-- 识别中的文本预览 -->
				<view v-if="recognizedText" class="recognized-text-preview">
					<text class="preview-label">识别结果：</text>
					<text class="preview-text">{{ recognizedText }}</text>
					<view class="preview-actions">
						<view class="action-btn send-btn" @click="sendRecognizedText">
							<text class="action-icon">✓</text>
							<text class="action-text">发送</text>
						</view>
						<view class="action-btn cancel-btn" @click="clearRecognizedText">
							<text class="action-icon">✕</text>
							<text class="action-text">清除</text>
						</view>
					</view>
				</view>

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
					提示：点击麦克风说话，识别完成后点击发送按钮提交回答
				</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import { request } from '@/stores/user.js'

// 面试状态
const isInterviewActive = ref(true)
const isRecording = ref(false)
const isAIThinking = ref(false)
const recognizedText = ref('')
const isSpeaking = ref(false) // 语音播放状态
const isInitialized = ref(false) // 是否已初始化

// 消息列表
const messages = ref([])
const chatContainer = ref(null)

// 语音识别实例
let recognition = null
let currentUtterance = null // 当前播放的语音实例

// 计算属性
const voiceHintText = computed(() => {
	if (isRecording.value) return '正在聆听，请说话...'
	if (isAIThinking.value) return '面试官正在思考...'
	if (isSpeaking.value) return '面试官正在说话...'
	return '点击麦克风开始说话'
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
		window.speechSynthesis.cancel()
	}
	isSpeaking.value = false
	currentUtterance = null
}

// 初始化语音识别
const initSpeechRecognition = () => {
	// 检查浏览器支持
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

	if (!SpeechRecognition) {
		uni.showToast({
			title: '当前浏览器不支持语音识别',
			icon: 'none'
		})
		return false
	}

	recognition = new SpeechRecognition()

	// 配置参数
	recognition.lang = 'zh-CN'
	recognition.continuous = false
	recognition.interimResults = true
	recognition.maxAlternatives = 1

	// 开始识别
	recognition.onstart = () => {
		console.log('语音识别开始')
		isRecording.value = true
		recognizedText.value = ''
	}

	// 识别结果
	recognition.onresult = (event) => {
		let finalTranscript = ''
		let interimTranscript = ''

		for (let i = event.resultIndex; i < event.results.length; i++) {
			const transcript = event.results[i][0].transcript
			if (event.results[i].isFinal) {
				finalTranscript += transcript
			} else {
				interimTranscript += transcript
			}
		}

		// 显示识别结果在预览区域（不自动发送）
		if (finalTranscript) {
			console.log('最终识别结果：', finalTranscript)
			recognizedText.value = finalTranscript
		} else if (interimTranscript) {
			recognizedText.value = interimTranscript
		}
	}

	// 识别错误
	recognition.onerror = (event) => {
		console.error('识别错误：', event.error)
		isRecording.value = false

		// 不显示网络错误提示，因为可能是暂时的
		if (event.error === 'network') {
			console.warn('语音识别网络错误，可能是暂时的')
			// 尝试重新初始化
			setTimeout(() => {
				initSpeechRecognition()
			}, 500)
			return
		}

		let errorMsg = '语音识别出错'
		switch (event.error) {
			case 'no-speech':
				errorMsg = '未检测到语音，请重试'
				break
			case 'audio-capture':
				errorMsg = '无法访问麦克风'
				break
			case 'not-allowed':
				errorMsg = '麦克风权限被拒绝，请在浏览器设置中允许'
				break
			case 'aborted':
				// 用户主动取消，不显示错误
				return
		}

		uni.showToast({
			title: errorMsg,
			icon: 'none'
		})

		recognizedText.value = ''
	}

	// 识别结束
	recognition.onend = () => {
		console.log('语音识别结束')
		isRecording.value = false

		// 延迟清空识别文本
		setTimeout(() => {
			recognizedText.value = ''
		}, 500)
	}

	return true
}

// 切换录音状态
const toggleRecording = async () => {
	if (isAIThinking.value) return

	// 每次点击都重新初始化识别实例，避免网络错误累积
	if (recognition) {
		try {
			recognition.stop()
		} catch (e) {}
		recognition = null
	}

	const initialized = initSpeechRecognition()
	if (!initialized) return

	// 开始录音前，先停止正在播放的语音
	stopAllSpeech()

	// 短暂延迟后启动
	setTimeout(() => {
		try {
			recognition?.start()
		} catch (e) {
			console.error('启动录音失败：', e)
			uni.showToast({
				title: '启动语音识别失败，请重试',
				icon: 'none'
			})
		}
	}, 100)
}

// 发送识别的文本
const sendRecognizedText = () => {
	if (!recognizedText.value.trim()) {
		uni.showToast({
			title: '请先进行语音输入',
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

	try {
		// 构建对话历史
		const conversationHistory = messages.value.map(msg => ({
			role: msg.role === 'interviewer' ? 'assistant' : 'user',
			content: msg.content
		}))

		// 调用后端 API
		const response = await request({
			url: '/v1/interview/chat',
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

// 模拟回复（后端接口未就绪时使用）
const getFallbackResponse = (userMessage) => {
	const responses = [
		'感谢您的回答，能否详细说说您在这个项目中的具体贡献？',
		'听起来很有意思，您在这个过程中遇到过什么挑战吗？',
		'很好，接下来我想了解一下您的团队合作经验，您能分享一个例子吗？',
		'您提到的技能很全面，您觉得您最大的优势是什么？',
		'感谢您的分享，您对我们公司和这个职位有什么想了解的吗？'
	]
	return responses[Math.floor(Math.random() * responses.length)]
}

// 语音播报
const speakMessage = (text) => {
	if (!window.speechSynthesis) {
		console.warn('当前浏览器不支持语音合成')
		return
	}

	// 先停止之前的播报
	stopAllSpeech()

	const utterance = new SpeechSynthesisUtterance(text)
	currentUtterance = utterance

	// 设置语音参数
	utterance.lang = 'zh-CN'
	utterance.rate = 1
	utterance.pitch = 1
	utterance.volume = 1

	// 尝试获取中文语音
	const voices = window.speechSynthesis.getVoices()
	const chineseVoice = voices.find(voice => voice.lang.includes('zh'))
	if (chineseVoice) {
		utterance.voice = chineseVoice
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
		console.error('语音播放错误：', event.error)
		isSpeaking.value = false
		currentUtterance = null
	}

	window.speechSynthesis.speak(utterance)
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
				if (recognition) {
					try {
						recognition.stop()
					} catch (e) {}
				}

				// 保存面试记录
				try {
					await request({
						url: '/v1/interview/end',
						method: 'POST',
						data: {
							messages: messages.value,
							endTime: new Date().toISOString()
						}
					})
				} catch (e) {
					console.error('保存面试记录失败：', e)
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

	// 默认开场白
	const defaultWelcome = '你好呀！我是负责本次HR面试的面试官小周，很高兴能有机会和你沟通。先简单和你打个招呼，也请你放松下来，咱们今天的交流更像是一场轻松的专业探讨。接下来我想先问第一个问题：能不能和我聊聊你未来3-5年的职业规划？'

	try {
		// 调用后端获取开场白
		console.log('请求面试开场白...')
		const response = await request({
			url: '/v1/interview/start',
			method: 'POST',
			data: {
				interviewType: 'hr'
			}
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
	if (recognition) {
		try {
			recognition.stop()
		} catch (e) {}
		recognition = null
	}

	// 重置状态变量
	isInterviewActive.value = true
	isRecording.value = false
	isAIThinking.value = false
	recognizedText.value = ''
	isSpeaking.value = false

	// 清空消息列表
	messages.value = []
}

// 预加载语音
const preloadVoices = () => {
	if (window.speechSynthesis) {
		// 某些浏览器需要先调用 getVoices() 才能正常使用语音合成
		window.speechSynthesis.getVoices()

		// 监听语音列表变化
		window.speechSynthesis.onvoiceschanged = () => {
			window.speechSynthesis.getVoices()
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
	if (recognition) {
		try {
			recognition.stop()
		} catch (e) {}
	}
})

onMounted(() => {
	console.log('=== onMounted: 面试页面挂载 ===')

	// 预加载语音
	preloadVoices()

	// 首次加载时初始化面试
	resetAllState()
	initInterview()

	// 监听页面可见性变化
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			stopAllSpeech()
			if (recognition) {
				try {
					recognition.stop()
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

	// 停止语音识别
	if (recognition) {
		try {
			recognition.stop()
		} catch (e) {}
	}

	// 移除事件监听
	document.removeEventListener('visibilitychange', () => {})
	window.removeEventListener('beforeunload', () => {})
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

.recognized-text-preview {
	background: #f0f9ff;
	border: 1px solid #bae6fd;
	border-radius: 16rpx;
	padding: 24rpx 32rpx;
	width: 100%;
	max-width: 800rpx;
}

.preview-label {
	font-size: 26rpx;
	color: #0284c7;
	font-weight: 500;
}

.preview-text {
	font-size: 30rpx;
	color: #0369a1;
	line-height: 1.5;
	display: block;
	margin-bottom: 20rpx;
}

.preview-actions {
	display: flex;
	gap: 24rpx;
	justify-content: flex-end;
	margin-top: 16rpx;
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

.action-icon {
	font-size: 28rpx;
}

.action-text {
	font-size: 26rpx;
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
