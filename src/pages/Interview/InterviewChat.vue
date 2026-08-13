<!-- 模拟面试对话页：由 interview-deploy/interview-chat.html 迁移 -->

<template>
	<view class="page-layout">
		<Sidebar />
		<view class="page-main interview-chat-main">
			<view class="chat-page">
				<!-- 对话页头部 -->
				<view class="chat-header">
					<view class="chat-header-left">
						<text class="chat-title">{{ interviewStore.phaseName }}</text>
						<text class="subtitle">AI语音对话模拟真实面试场景</text>
					</view>
					<view class="chat-header-center">
						<text class="session-id" :title="interviewStore.sessionId">
							{{ shortSessionId }}
						</text>
					</view>
					<view class="chat-header-right">
						<view class="status-badge ongoing">
							<view class="dot"></view>
							<text>面试进行中</text>
						</view>
						<button class="btn-end" :disabled="isEnding" @click="endInterview">
							<text>✕</text>
							<text>{{ isEnding ? '生成总结中...' : '结束面试' }}</text>
						</button>
					</view>
				</view>

				<!-- 阶段进度 -->
				<PhaseProgress :phase="interviewStore.phase" />

				<!-- 消息列表 -->
				<scroll-view
					class="chat-messages"
					scroll-y
					:scroll-into-view="scrollIntoView"
					scroll-with-animation
				>
					<view
						v-if="interviewStore.messages.length === 0 && !interviewStore.isThinking"
						class="empty-state"
					>
						<text class="empty-icon">🎤</text>
						<text class="empty-text">面试即将开始，请做好准备</text>
					</view>

					<ChatMessage
						v-for="msg in interviewStore.messages"
						:key="msg.id"
						:message="msg"
						:tts-enabled="interviewStore.ttsEnabled"
						@play-voice="handlePlayVoice"
					/>

					<!-- 面试官输入中 -->
					<view v-if="interviewStore.isThinking" id="typing-indicator" class="typing-row">
						<view class="typing-message">
							<view class="typing-avatar">
								<text>👨‍💼</text>
							</view>
							<view class="typing-indicator">
								<view class="typing-dot"></view>
								<view class="typing-dot"></view>
								<view class="typing-dot"></view>
							</view>
						</view>
					</view>

					<!-- 录音状态 -->
					<view v-if="voiceStatus" id="voice-status" class="voice-status-row">
						<view class="voice-status-bar">
							<view class="voice-wave">
								<view class="wave-bar"></view>
								<view class="wave-bar"></view>
								<view class="wave-bar"></view>
								<view class="wave-bar"></view>
								<view class="wave-bar"></view>
							</view>
							<text>{{ voiceStatus }}</text>
						</view>
					</view>
				</scroll-view>

				<!-- 输入区域 -->
				<view class="chat-input-area">
					<!-- 语音实时转写 -->
					<view v-if="asrPanelVisible" class="asr-live-panel">
						<view class="asr-live-header">
							<view class="asr-live-dot" :class="{ active: interviewStore.isRecording }"></view>
							<text>{{ interviewStore.isRecording ? '实时识别中' : '识别结果' }}</text>
						</view>
						<view class="asr-live-meter">
							<view
								v-for="i in 5"
								:key="i"
								class="meter-bar"
								:class="{ active: asrLevel >= i * 0.2 }"
							></view>
							<text class="meter-label">
								{{ asrLevel > 0.02 ? '音频输入正常' : '等待音频输入...' }}
							</text>
						</view>
						<view class="asr-live-content">
							<text v-if="asrLiveText" class="asr-live-text">{{ asrLiveText }}</text>
							<text v-else class="asr-live-placeholder">正在聆听，请清晰说话...</text>
						</view>
						<view v-if="!interviewStore.isRecording && asrLiveText" class="asr-live-actions">
							<button class="asr-action-btn" @click="sendAsrAnswer">发送回答</button>
							<button class="asr-action-btn secondary" @click="resetAsrPanel">重录</button>
						</view>
					</view>

					<text v-if="!showTextInput" class="input-hint">
						提示：点击麦克风录音并保存音频文件，或在上方输入框直接输入回答
					</text>

					<view v-if="showTextInput" class="text-input-wrapper">
						<button
							class="btn-mode-switch"
							title="切换语音输入"
							@click="toggleTextInput"
						>
							<text>🎤 语音</text>
						</button>
						<input
							v-model="answerText"
							class="text-input"
							placeholder="请输入你的回答..."
							placeholder-class="input-placeholder"
							@confirm="sendTextMessage"
						/>
						<button class="btn-send" @click="sendTextMessage">
							<text>▶</text>
						</button>
					</view>

					<view v-if="!showTextInput" class="input-controls">
						<button
							class="btn-mode-switch"
							title="切换文字输入"
							@click="toggleTextInput"
						>
							<text>⌨️ 文字</text>
						</button>
						<button
							class="btn-mic"
							:class="{ recording: interviewStore.isRecording }"
							title="点击录音"
							@click="toggleRecording"
						>
							<text>🎤</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 结束面试确认 -->
			<view v-if="showEndConfirm" class="interview-overlay" @click.self="cancelEndInterview">
				<view class="interview-modal">
					<text class="interview-modal-title">结束面试</text>
					<text class="interview-modal-desc">确定要结束本次面试吗？结束后将生成面试总结。</text>
					<view class="interview-modal-actions">
						<button class="interview-modal-btn cancel" @click="cancelEndInterview">
							取消
						</button>
						<button class="interview-modal-btn confirm" @click="confirmEndInterview">
							结束面试
						</button>
					</view>
				</view>
			</view>

			<!-- 结束面试加载中 -->
			<view v-if="isEnding" class="interview-overlay loading">
				<view class="loading-box">
					<view class="loading-spinner"></view>
					<text class="loading-text">正在结束面试并生成总结...</text>
				</view>
			</view>

			<!-- 面试总结弹窗 -->
			<SummaryModal
				v-if="interviewStore.summaryVisible && interviewStore.summary"
				:summary="interviewStore.summary"
				@close="closeSummary"
				@back-home="backHome"
				@view-detail="viewDetail"
			/>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'
import PhaseProgress from '@/components/Interview/PhaseProgress.vue'
import ChatMessage from '@/components/Interview/ChatMessage.vue'
import SummaryModal from '@/components/Interview/SummaryModal.vue'
import { useInterviewStore } from '@/stores/interview'
import { fetchTtsAudio, createASRConnection } from '@/api/interview'

const interviewStore = useInterviewStore()

const answerText = ref('')
const showTextInput = ref(false)
const scrollIntoView = ref('')
const voiceStatus = ref('')
const showEndConfirm = ref(false)
const isEnding = ref(false)
const asrPanelVisible = ref(false)
const asrLiveText = ref('')
const asrPartial = ref('')
const asrConfirmed = ref('')
const asrLevel = ref(0)

let currentAudio = null
let currentAudioUrl = null
let asrWs = null
let asrStream = null
let asrAudioContext = null
let asrProcessor = null
let asrReady = false
let asrFailed = false
let asrReadyTimer = null
let pcmRemainder = new Int16Array(0)
let sentFrames = 0
let lastAudioLog = 0
let voiceStatusTimer = null
let initialized = false
let lastAutoPlayedId = null

const shortSessionId = computed(() => {
	if (!interviewStore.sessionId) return ''
	return `${interviewStore.sessionId.slice(0, 8)}...`
})

/**
 * 将音频按均值聚合降采样到目标采样率（如 48000 → 16000）
 */
function downsampleBuffer(buffer, inputRate, outputRate) {
	if (inputRate === outputRate) return buffer
	const ratio = inputRate / outputRate
	const newLength = Math.round(buffer.length / ratio)
	const result = new Float32Array(newLength)
	let offsetResult = 0
	let offsetBuffer = 0
	while (offsetResult < newLength) {
		const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio)
		let accum = 0
		let count = 0
		for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
			accum += buffer[i]
			count++
		}
		result[offsetResult] = count > 0 ? accum / count : 0
		offsetResult++
		offsetBuffer = nextOffsetBuffer
	}
	return result
}

/**
 * 将一段 Float32 音频转成 16kHz Int16 PCM，并按 3200 字节/帧发送
 */
function handlePcmChunk(input, ws, audioContext) {
	const downsampled = downsampleBuffer(input, audioContext.sampleRate, 16000)
	let sumSquares = 0
	for (let i = 0; i < downsampled.length; i++) {
		sumSquares += downsampled[i] * downsampled[i]
	}
	const rms = downsampled.length ? Math.sqrt(sumSquares / downsampled.length) : 0
	asrLevel.value = Math.min(1, rms * 4)

	const pcm16 = new Int16Array(downsampled.length)
	for (let i = 0; i < downsampled.length; i++) {
		const s = Math.max(-1, Math.min(1, downsampled[i]))
		pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
	}

	const merged = new Int16Array(pcmRemainder.length + pcm16.length)
	merged.set(pcmRemainder)
	merged.set(pcm16, pcmRemainder.length)
	pcmRemainder = merged

	while (pcmRemainder.length >= 1600) {
		const frame = pcmRemainder.slice(0, 1600)
		pcmRemainder = pcmRemainder.slice(1600)
		if (asrReady && ws.readyState === WebSocket.OPEN) {
			ws.send(frame.buffer)
			sentFrames++
		}
	}

	const now = Date.now()
	if (now - lastAudioLog > 500) {
		lastAudioLog = now
		console.log(
			`[ASR] chunk=${downsampled.length} rms=${rms.toFixed(4)} ready=${asrReady} wsState=${ws.readyState} sentFrames=${sentFrames}`
		)
	}
}

function scrollToBottom() {
	nextTick(() => {
		if (interviewStore.isThinking) {
			scrollIntoView.value = 'typing-indicator'
			return
		}
		const last = interviewStore.messages[interviewStore.messages.length - 1]
		if (last) scrollIntoView.value = `msg-${last.id}`
	})
}

function stopCurrentAudio() {
	if (currentAudioUrl) {
		URL.revokeObjectURL(currentAudioUrl)
		currentAudioUrl = null
	}
	if (currentAudio) {
		try {
			currentAudio.pause()
			currentAudio.src = ''
		} catch (err) {
			console.error('[interview] stop audio failed:', err)
		}
		currentAudio = null
	}
}

async function handlePlayVoice(message) {
	if (!message || !message.content) return
	try {
		const url = await fetchTtsAudio(message.content)
		stopCurrentAudio()
		currentAudioUrl = url
		currentAudio = new Audio(url)
		currentAudio.onended = () => {
			URL.revokeObjectURL(url)
			currentAudioUrl = null
			currentAudio = null
		}
		currentAudio.onerror = () => {
			URL.revokeObjectURL(url)
			currentAudioUrl = null
			currentAudio = null
		}
		await currentAudio.play()
	} catch (err) {
		console.error('TTS 播放失败:', err)
		uni.showToast({ title: '语音播放失败', icon: 'none' })
	}
}

// 面试官新消息到达时自动播放语音
watch(
	() => interviewStore.messages.map((m) => m.id).join(','),
	() => {
		const last = interviewStore.messages[interviewStore.messages.length - 1]
		if (!last) return

		if (!initialized) {
			if (last.role === 'interviewer') lastAutoPlayedId = last.id
			return
		}

		if (
			last.role === 'interviewer' &&
			interviewStore.ttsEnabled &&
			!last.isOpening &&
			last.id !== lastAutoPlayedId
		) {
			lastAutoPlayedId = last.id
			handlePlayVoice(last)
		}
	}
)

watch(
	() => interviewStore.messages.length,
	() => scrollToBottom()
)

watch(
	() => interviewStore.isThinking,
	(val) => {
		if (val) scrollIntoView.value = 'typing-indicator'
	}
)

function sendTextMessage() {
	const text = answerText.value.trim()
	if (!text) return
	answerText.value = ''
	interviewStore.submitAnswer(text)
}

function toggleTextInput() {
	showTextInput.value = !showTextInput.value
	if (showTextInput.value) {
		nextTick(() => document.querySelector('.text-input')?.focus())
	}
}

function toggleRecording() {
	if (interviewStore.isRecording) {
		stopRecording()
		return
	}
	startRecording()
}

async function startRecording() {
	if (interviewStore.isRecording) return
	interviewStore.isRecording = true
	asrPanelVisible.value = true
	asrLiveText.value = ''
	asrPartial.value = ''
	asrConfirmed.value = ''
	asrLevel.value = 0
	asrReady = false
	asrFailed = false
	pcmRemainder = new Int16Array(0)
	sentFrames = 0
	lastAudioLog = 0
	clearTimeout(asrReadyTimer)
	showVoiceStatus('正在连接语音识别...')

	// 后端准备 DashScope ASR 引擎需要时间，超过 8 秒视为连接失败
	asrReadyTimer = setTimeout(() => {
		showAsrError(new Error('语音识别引擎连接超时，请重试'))
		stopRecording()
	}, 8000)

	try {
		// 1. 采集麦克风音频：16kHz / 16bit / 单声道 PCM
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: {
				channelCount: 1,
				sampleRate: 16000,
				echoCancellation: true,
				noiseSuppression: true,
			},
		})
		asrStream = stream

		// 2. 建立 ASR WebSocket
		const ws = createASRConnection(
			(result) => {
				if (!result) return
				if (result.event === 'task-started') {
					asrReady = true
					clearTimeout(asrReadyTimer)
					showVoiceStatus('正在录音，请说话...')
					console.log('[ASR] task-started received, audio sending enabled')
					return
				}
				if (!result.text) return
				if (result.event === 'task-finished') {
					// 后端 task-finished 不带完整文本，保留当前已确认/中间结果
				} else if (result.event === 'sentence-end') {
					asrConfirmed.value = (asrConfirmed.value ? asrConfirmed.value + ' ' : '') + result.text
					asrPartial.value = ''
				} else if (result.event === 'result-generated') {
					if (result.sentenceEnd) {
						asrConfirmed.value = (asrConfirmed.value ? asrConfirmed.value + ' ' : '') + result.text
						asrPartial.value = ''
					} else {
						asrPartial.value = result.text
					}
				} else {
					asrPartial.value = result.text
				}
				asrLiveText.value = asrConfirmed.value
				if (asrPartial.value) {
					asrLiveText.value += (asrLiveText.value ? ' ' : '') + asrPartial.value
				}
				showVoiceStatus(`识别中：${asrLiveText.value}`)
			},
			(err) => {
				showAsrError(err)
				stopRecording()
			}
		)
		asrWs = ws

		// 3. 使用 AudioContext 采集音频，并按需降采样到 16kHz PCM 发送
		let audioContext
		try {
			audioContext = new AudioContext({ sampleRate: 16000 })
		} catch (err) {
			audioContext = new AudioContext()
		}
		asrAudioContext = audioContext
		if (audioContext.state === 'suspended') {
			await audioContext.resume()
		}
		const source = audioContext.createMediaStreamSource(stream)

		// 优先使用 AudioWorklet（无弃用警告），不支持时回退 ScriptProcessor
		let processor = null
		const canUseWorklet =
			typeof audioContext.audioWorklet !== 'undefined' &&
			typeof AudioWorkletNode !== 'undefined'

		if (canUseWorklet) {
			try {
				const workletCode = `
					class InterviewPCMProcessor extends AudioWorkletProcessor {
						process(inputs) {
							const input = inputs[0]
							if (input && input[0]) {
								this.port.postMessage(input[0].slice(0))
							}
							return true
						}
					}
					registerProcessor('interview-pcm-processor', InterviewPCMProcessor)
				`
				const blobUrl = URL.createObjectURL(
					new Blob([workletCode], { type: 'application/javascript' })
				)
				await audioContext.audioWorklet.addModule(blobUrl)
				URL.revokeObjectURL(blobUrl)

				processor = new AudioWorkletNode(audioContext, 'interview-pcm-processor')
				processor.port.onmessage = (event) => {
					if (!interviewStore.isRecording) return
					handlePcmChunk(event.data, ws, audioContext)
				}
			} catch (err) {
				console.warn('[ASR] AudioWorklet 不可用，回退 ScriptProcessor:', err)
				processor = audioContext.createScriptProcessor(4096, 1, 1)
				processor.onaudioprocess = (event) => {
					if (!interviewStore.isRecording) return
					handlePcmChunk(event.inputBuffer.getChannelData(0), ws, audioContext)
				}
			}
		} else {
			processor = audioContext.createScriptProcessor(4096, 1, 1)
			processor.onaudioprocess = (event) => {
				if (!interviewStore.isRecording) return
				handlePcmChunk(event.inputBuffer.getChannelData(0), ws, audioContext)
			}
		}

		asrProcessor = processor
		source.connect(processor)
		processor.connect(audioContext.destination)
	} catch (err) {
		console.error('录音启动失败:', err)
		uni.showToast({ title: '无法访问麦克风，请检查浏览器权限设置', icon: 'none' })
		stopRecording()
	}
}

function stopRecording() {
	interviewStore.isRecording = false
	voiceStatus.value = ''
	clearTimeout(asrReadyTimer)
	asrReadyTimer = null
	asrReady = false

	// 断开音频处理
	if (asrProcessor) {
		try {
			asrProcessor.disconnect()
		} catch (err) {
			console.error('[interview] disconnect ASR processor failed:', err)
		}
		asrProcessor = null
	}
	if (asrAudioContext) {
		try {
			asrAudioContext.close()
		} catch (err) {
			console.error('[interview] close ASR context failed:', err)
		}
		asrAudioContext = null
	}
	if (asrStream) {
		asrStream.getTracks().forEach((track) => track.stop())
		asrStream = null
	}

	// 关闭 WebSocket
	if (asrWs) {
		try {
			if (asrWs.readyState === WebSocket.OPEN) {
				// 补发最后不足一帧的音频
				if (pcmRemainder.length > 0) {
					const padded = new Int16Array(1600)
					padded.set(pcmRemainder)
					asrWs.send(padded.buffer)
				}
				pcmRemainder = new Int16Array(0)
				asrWs.send('finish')
			}
			asrWs.close()
		} catch (err) {
			console.error('[interview] close ASR failed:', err)
		}
		asrWs = null
	}

	// 有识别结果时保留转写面板，供用户确认后发送；没有结果则隐藏
	if (!asrLiveText.value.trim()) {
		asrPanelVisible.value = false
	}
}

function showVoiceStatus(text) {
	voiceStatus.value = text
	clearTimeout(voiceStatusTimer)
	voiceStatusTimer = setTimeout(() => {
		voiceStatus.value = ''
	}, 3000)
}

function showAsrError(err) {
	if (asrFailed) return
	asrFailed = true
	console.error('[interview] ASR error:', err)
	voiceStatus.value = ''
	clearTimeout(asrReadyTimer)
	asrReadyTimer = null
	asrReady = false
	pcmRemainder = new Int16Array(0)
	asrPanelVisible.value = false
	asrLiveText.value = ''
	asrPartial.value = ''
	asrConfirmed.value = ''

	let message = err?.message || ''
	if (!message || err?.type === 'error' || (typeof Event !== 'undefined' && err instanceof Event)) {
		message = '无法连接语音识别服务，请检查后端服务状态'
	}
	uni.showToast({ title: `语音识别不可用：${message}`, icon: 'none', duration: 3000 })
	// 降级到文字输入，避免用户无法继续作答
	if (!showTextInput.value) {
		showTextInput.value = true
		nextTick(() => document.querySelector('.text-input')?.focus())
	}
}

function resetAsrPanel() {
	asrPanelVisible.value = false
	asrLiveText.value = ''
	asrPartial.value = ''
	asrConfirmed.value = ''
	voiceStatus.value = ''
}

function sendAsrAnswer() {
	const text = asrLiveText.value.trim()
	if (!text) return
	interviewStore.submitAnswer(text)
	resetAsrPanel()
}

function endInterview() {
	showEndConfirm.value = true
}

async function confirmEndInterview() {
	if (isEnding.value) return
	showEndConfirm.value = false
	isEnding.value = true
	stopCurrentAudio()
	try {
		await interviewStore.stop()
	} finally {
		isEnding.value = false
	}
}

function cancelEndInterview() {
	showEndConfirm.value = false
}

function closeSummary() {
	interviewStore.summaryVisible = false
}

function backHome() {
	interviewStore.finishInterview()
	window.location.href = '/#/pages/Interview/Interview'
}

function viewDetail() {
	uni.showToast({ title: '详细评分功能开发中...', icon: 'none' })
}

onMounted(async () => {
	const saved = interviewStore.loadCurrent()
	if (!saved || !saved.sessionId) {
		uni.showToast({ title: '请先开始面试', icon: 'none' })
		setTimeout(() => {
			window.location.href = '/#/pages/Interview/Interview'
		}, 800)
		return
	}

	// 校验会话是否仍有效（防止带着旧服务器/已失效的 session_id 进入）
	const valid = await interviewStore.validateCurrentSession()
	if (!valid) {
		uni.showToast({ title: '会话已失效，请重新开始面试', icon: 'none' })
		setTimeout(() => {
			window.location.href = '/#/pages/Interview/Interview'
		}, 800)
		return
	}

	if (interviewStore.messages.length === 0 && interviewStore.openingReply) {
		interviewStore.addMessage('interviewer', interviewStore.openingReply, { isOpening: true })
	}
	const onlyOpening =
		interviewStore.messages.length === 1 && interviewStore.messages[0].isOpening
	if (interviewStore.messages.length === 0 || onlyOpening) {
		interviewStore.fetchNext()
	}

	nextTick(() => {
		initialized = true
		scrollToBottom()
	})
})

onUnmounted(() => {
	stopCurrentAudio()
	stopRecording()
	clearTimeout(voiceStatusTimer)
})
</script>

<style scoped lang="scss">
$chat-bg: #f8fafc;
$card-bg: #ffffff;
$border-color: #e5e7eb;
$primary-blue: #3b82f6;
$primary-dark: #1a3a6b;
$subtitle-color: #6b7280;
$muted-color: #9ca3af;

.interview-chat-main {
	margin-left: var(--sidebar-width, 240px);
	padding: 0;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

.chat-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: $chat-bg;
}

/* ── 头部 ── */
.chat-header {
	height: 64px;
	background: $card-bg;
	border-bottom: 1px solid $border-color;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 28px;
	flex-shrink: 0;
}

.chat-header-left {
	display: flex;
	align-items: center;
	gap: 16px;

	.chat-title {
		font-size: 18px;
		font-weight: 600;
		color: #111827;
	}

	.subtitle {
		font-size: 12px;
		color: $muted-color;
	}
}

.session-id {
	font-size: 11px;
	color: $muted-color;
	background: #f3f4f6;
	padding: 4px 10px;
	border-radius: 6px;
	font-family: monospace;
}

.chat-header-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.status-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px;
	border-radius: 20px;
	font-size: 13px;
	font-weight: 500;

	&.ongoing {
		background: #ecfdf5;
		color: #059669;

		.dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #10b981;
			animation: pulse 2s infinite;
		}
	}
}

@keyframes pulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.4;
	}
}

.btn-end {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 10px 20px;
	background: #ef4444;
	color: #ffffff;
	border: none;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background: #dc2626;
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

/* ── 消息列表 ── */
.chat-messages {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
	padding: 20px 28px;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: $muted-color;
	gap: 12px;
	min-height: 200px;
}

.empty-icon {
	font-size: 48px;
	opacity: 0.5;
}

.empty-text {
	font-size: 14px;
}

.typing-row {
	animation: fadeInUp 0.3s ease;
}

.typing-message {
	display: flex;
	gap: 12px;
}

.typing-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: linear-gradient(135deg, $primary-blue, #1d4ed8);
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	flex-shrink: 0;
}

.typing-indicator {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 14px 18px;
	background: $card-bg;
	border: 1px solid $border-color;
	border-radius: 14px;
	border-top-left-radius: 4px;
	width: fit-content;
}

.typing-dot {
	width: 8px;
	height: 8px;
	background: #d1d5db;
	border-radius: 50%;
	animation: typingBounce 1.4s infinite ease-in-out both;

	&:nth-child(1) {
		animation-delay: -0.32s;
	}

	&:nth-child(2) {
		animation-delay: -0.16s;
	}
}

@keyframes typingBounce {
	0%,
	80%,
	100% {
		transform: scale(0.6);
		opacity: 0.5;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}

.voice-status-row {
	padding: 10px 0;
}

.voice-status-bar {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 10px;
	color: $subtitle-color;
	font-size: 13px;
	background: #eff6ff;
	border-radius: 8px;
	width: fit-content;
	margin: 0 auto;
}

.voice-wave {
	display: flex;
	align-items: center;
	gap: 2px;
	height: 20px;
}

.wave-bar {
	width: 3px;
	background: $primary-blue;
	border-radius: 2px;
	animation: soundWave 1s infinite ease-in-out;

	&:nth-child(1) {
		height: 8px;
		animation-delay: 0s;
	}

	&:nth-child(2) {
		height: 14px;
		animation-delay: 0.1s;
	}

	&:nth-child(3) {
		height: 10px;
		animation-delay: 0.2s;
	}

	&:nth-child(4) {
		height: 16px;
		animation-delay: 0.3s;
	}

	&:nth-child(5) {
		height: 8px;
		animation-delay: 0.4s;
	}
}

@keyframes soundWave {
	0%,
	100% {
		transform: scaleY(0.5);
	}
	50% {
		transform: scaleY(1);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* ── 语音实时转写 ── */
.asr-live-panel {
	background: #f0f7ff;
	border: 1px solid #bfdbfe;
	border-radius: 12px;
	padding: 12px 16px;
	margin-bottom: 12px;
	animation: fadeInUp 0.25s ease;
}

.asr-live-header {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: #2563eb;
	font-weight: 500;
	margin-bottom: 8px;
}

.asr-live-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #9ca3af;

	&.active {
		background: #10b981;
		animation: asrPulse 1.2s infinite;
	}
}

@keyframes asrPulse {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.4;
	}
}

.asr-live-meter {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-bottom: 8px;
}

.meter-bar {
	width: 4px;
	height: 14px;
	border-radius: 2px;
	background: #dbeafe;
	transition: background 0.1s ease;

	&.active {
		background: #3b82f6;
	}
}

.meter-label {
	font-size: 11px;
	color: #6b7280;
	margin-left: 6px;
}

.asr-live-content {
	background: #ffffff;
	border-radius: 8px;
	padding: 10px 12px;
	min-height: 36px;
}

.asr-live-text {
	font-size: 14px;
	color: #1f2937;
	line-height: 1.6;
	word-break: break-word;
	white-space: pre-wrap;
}

.asr-live-placeholder {
	font-size: 13px;
	color: #9ca3af;
}

.asr-live-actions {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 10px;
}

.asr-action-btn {
	padding: 7px 18px;
	border-radius: 8px;
	border: none;
	background: #2563eb;
	color: #ffffff;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		opacity: 0.9;
	}

	&.secondary {
		background: #f3f4f6;
		color: #374151;

		&:hover {
			background: #e5e7eb;
		}
	}
}

/* ── 输入区域 ── */
.chat-input-area {
	background: $card-bg;
	border-top: 1px solid $border-color;
	padding: 16px 28px 20px;
	flex-shrink: 0;
}

.input-hint {
	text-align: center;
	font-size: 12px;
	color: $muted-color;
	margin-bottom: 12px;
	display: block;
}

.text-input-wrapper {
	display: flex;
	align-items: center;
	gap: 12px;
	max-width: 600px;
	margin: 0 auto 12px;
	width: 100%;
	animation: modeFade 0.2s ease;
}

.text-input {
	flex: 1;
	height: 44px;
	border: 1px solid $border-color;
	border-radius: 22px;
	padding: 0 20px;
	font-size: 14px;
	outline: none;
	transition: border-color 0.2s;

	&:focus {
		border-color: $primary-blue;
	}
}

.input-placeholder {
	color: $muted-color;
}

.btn-send {
	width: 44px;
	height: 44px;
	border-radius: 50%;
	border: none;
	background: $primary-blue;
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	font-size: 16px;
	transition: all 0.2s;

	&:hover {
		background: #2563eb;
	}
}

.input-controls {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16px;
	animation: modeFade 0.2s ease;
}

@keyframes modeFade {
	from {
		opacity: 0;
		transform: translateY(4px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.btn-mode-switch {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 40px;
	padding: 0 14px;
	border: 1px solid $border-color;
	border-radius: 20px;
	background: $card-bg;
	color: $subtitle-color;
	font-size: 13px;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;
	transition: all 0.2s;

	&:hover {
		border-color: $primary-blue;
		color: $primary-blue;
		background: #eff6ff;
	}
}

.btn-mic {
	width: 56px;
	height: 56px;
	border-radius: 50%;
	border: none;
	background: linear-gradient(135deg, $primary-blue, #1d4ed8);
	color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	font-size: 22px;
	box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
	transition: all 0.2s;

	&:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
	}

	&.recording {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
		animation: micPulse 1.5s infinite;
	}
}

@keyframes micPulse {
	0%,
	100% {
		box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
	}
	50% {
		box-shadow: 0 4px 24px rgba(239, 68, 68, 0.5);
	}
}

/* ── 结束面试确认 / 加载弹层 ── */
.interview-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 1200;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: overlayFadeIn 0.2s ease;

	&.loading {
		background: rgba(0, 0, 0, 0.35);
	}
}

@keyframes overlayFadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.interview-modal {
	width: 90%;
	max-width: 400px;
	background: #ffffff;
	border-radius: 14px;
	padding: 28px 24px 20px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
	text-align: center;
	animation: overlaySlideUp 0.25s ease;
}

@keyframes overlaySlideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.interview-modal-title {
	font-size: 18px;
	font-weight: 600;
	color: #111827;
	display: block;
	margin-bottom: 12px;
}

.interview-modal-desc {
	font-size: 14px;
	color: #6b7280;
	line-height: 1.6;
	display: block;
	margin-bottom: 24px;
}

.interview-modal-actions {
	display: flex;
	gap: 12px;
}

.interview-modal-btn {
	flex: 1;
	height: 42px;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	border: none;
	transition: all 0.2s;

	&.cancel {
		background: #f3f4f6;
		color: #374151;

		&:hover {
			background: #e5e7eb;
		}
	}

	&.confirm {
		background: #ef4444;
		color: #ffffff;

		&:hover {
			background: #dc2626;
		}
	}
}

.loading-box {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	background: rgba(255, 255, 255, 0.96);
	padding: 32px 40px;
	border-radius: 14px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.loading-spinner {
	width: 36px;
	height: 36px;
	border: 3px solid #e5e7eb;
	border-top-color: #3b82f6;
	border-radius: 50%;
	animation: overlaySpin 0.8s linear infinite;
}

@keyframes overlaySpin {
	to {
		transform: rotate(360deg);
	}
}

.loading-text {
	font-size: 14px;
	color: #374151;
}

@media (max-width: 768px) {
	.chat-header {
		padding: 0 16px;
	}

	.chat-messages {
		padding: 16px;
	}

	.chat-header-left .subtitle,
	.session-id {
		display: none;
	}
}
</style>
