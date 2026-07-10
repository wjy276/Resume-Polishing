<template>
	<transition name="fade">
		<div v-if="visible" class="dialog-overlay" @click.self="handleClose">
			<div class="dialog-panel">
				<div class="dialog-header">
					<div class="header-left">
						<span class="bot-avatar">🤖</span>
						<div>
							<h3>AI 求职助手</h3>
							<span class="subtitle">先了解你的方向，再优化简历</span>
						</div>
					</div>
					<button class="close-btn" @click="handleClose">×</button>
				</div>

				<div class="chat-body" ref="chatRef">
					<div v-for="(msg, i) in messages" :key="i" class="msg-row" :class="msg.role">
						<div class="msg-avatar">{{ msg.role === 'bot' ? '🤖' : '👤' }}</div>
						<div class="msg-bubble">
							<div class="msg-text">{{ msg.text }}</div>
							<div v-if="msg.questions" class="questions-preview">
								<div v-for="(q, qi) in msg.questions" :key="qi" class="q-item" :class="{ answered: answers[q.key] }">
									<span class="q-icon">{{ answers[q.key] ? '✅' : '📝' }}</span>
									<span class="q-label">{{ q.label }}</span>
									<span v-if="answers[q.key]" class="q-answer">{{ answers[q.key] }}</span>
								</div>
							</div>
						</div>
					</div>

					<div v-if="submitting" class="msg-row bot">
						<div class="msg-avatar">🤖</div>
						<div class="msg-bubble">
							<div class="thinking-dots"><span>.</span><span>.</span><span>.</span></div>
						</div>
					</div>
				</div>

				<div class="chat-footer">
					<div v-if="!allAnswered" class="input-row">
						<input
							v-model="userInput"
							class="chat-input"
							:placeholder="currentQuestion?.placeholder || '输入你的回答…'"
							@keyup.enter="handleSend"
							:disabled="submitting"
						/>
						<button class="send-btn" @click="handleSend" :disabled="!userInput.trim() || submitting">发送</button>
					</div>
					<div v-else-if="!submitted" class="action-row">
						<button class="submit-btn" @click="handleSubmit" :disabled="submitting">确认并开始优化</button>
						<button class="edit-btn" @click="allAnswered = false; userInput = ''">修改信息</button>
					</div>
					<div v-else class="done-row">
						<span class="done-text">✓ 信息已提交，开始优化简历...</span>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'submit'])

const chatRef = ref(null)
const userInput = ref('')
const submitting = ref(false)
const submitted = ref(false)
const allAnswered = ref(false)
const timers = ref([])

const answers = ref({
	targetRole: '',
	experienceYear: '',
	targetCities: '',
	coreSkills: '',
	extraInfo: '',
})

const questions = [
	{ key: 'targetRole', label: '目标岗位', placeholder: '例：Java 后端 / 数据开发实习', question: '你的目标岗位是什么？' },
	{ key: 'experienceYear', label: '身份 / 年限', placeholder: '例：应届生 / 1-3年 / 3-5年', question: '你的身份或工作年限是？' },
	{ key: 'targetCities', label: '目标城市', placeholder: '多个用逗号分隔，例：北京, 上海', question: '目标城市是哪些？（多个用逗号分隔）' },
	{ key: 'coreSkills', label: '核心技能', placeholder: '逗号分隔，例：Java, Spring Boot, MySQL', question: '你的核心技能有哪些？（逗号分隔）' },
	{ key: 'extraInfo', label: '其他补充', placeholder: '项目亮点、期望行业等', question: '还有其他补充信息吗？（项目亮点、期望行业等）' },
]

const currentIndex = ref(-1)

const currentQuestion = computed(() => {
	if (currentIndex.value < 0 || currentIndex.value >= questions.length) return null
	return questions[currentIndex.value]
})

const messages = ref([])

watch(() => props.visible, (val) => {
	clearTimers()
	if (val) {
		reset()
		nextTick(() => {
			timers.value.push(setTimeout(() => sendBotMessage('你好！我是 AI 求职助手，先了解你的方向，再针对性优化简历。请回答以下几个问题：'), 300))
			timers.value.push(setTimeout(() => {
				currentIndex.value = 0
				sendBotMessage(questions[0].question, questions)
			}, 800))
		})
	}
})

onUnmounted(clearTimers)

function clearTimers() {
	timers.value.forEach(clearTimeout)
	timers.value = []
}

function reset() {
	userInput.value = ''
	submitting.value = false
	submitted.value = false
	allAnswered.value = false
	currentIndex.value = -1
	answers.value = { targetRole: '', experienceYear: '', targetCities: '', coreSkills: '', extraInfo: '' }
	messages.value = []
}

function sendBotMessage(text, qs = null) {
	messages.value.push({ role: 'bot', text, questions: qs })
	scrollToBottom()
}

function sendUserMessage(text) {
	messages.value.push({ role: 'user', text })
	scrollToBottom()
}

function scrollToBottom() {
	nextTick(() => {
		if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
	})
}

function handleSend() {
	const text = userInput.value.trim()
	if (!text || submitting.value) return
	sendUserMessage(text)
	userInput.value = ''

	const key = questions[currentIndex.value].key
	answers.value[key] = text

	const nextIdx = currentIndex.value + 1
	if (nextIdx < questions.length) {
		currentIndex.value = nextIdx
		timers.value.push(setTimeout(() => sendBotMessage(questions[nextIdx].question), 400))
	} else {
		allAnswered.value = true
		timers.value.push(setTimeout(() => {
			const summary = Object.entries(answers.value)
				.filter(([, v]) => v)
				.map(([k, v]) => {
					const label = questions.find(q => q.key === k)?.label || k
					return `${label}：${v}`
				}).join('\n')
			sendBotMessage(`已收到你的信息：\n${summary}\n\n确认无误后点击下方按钮开始优化 ✨`)
		}, 400))
	}
}

function handleClose() {
	if (submitting.value) return
	emit('close')
}

async function handleSubmit() {
	submitting.value = true
	emit('submit', { ...answers.value })
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$text: #111827;
$border: #e5e7eb;

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.dialog-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.35);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
}

.dialog-panel {
	background: #fff;
	border-radius: 12px;
	width: 480px;
	max-width: 92vw;
	height: 560px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 18px;
	border-bottom: 1px solid $border;

	.header-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.bot-avatar { font-size: 28px; }
	h3 { font-size: 15px; font-weight: 600; color: $text; margin: 0; }
	.subtitle { font-size: 12px; color: #6b7280; }
}

.close-btn {
	border: none;
	background: transparent;
	font-size: 22px;
	color: #9ca3af;
	cursor: pointer;
	padding: 0 4px;
	&:hover { color: $text; }
}

.chat-body {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.msg-row {
	display: flex;
	gap: 8px;
	max-width: 85%;

	&.bot { align-self: flex-start; }
	&.user { align-self: flex-end; flex-direction: row-reverse; }
}

.msg-avatar {
	flex-shrink: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	background: #f3f4f6;
	border-radius: 50%;
}

.msg-bubble {
	padding: 10px 14px;
	border-radius: 12px;
	font-size: 14px;
	line-height: 1.5;
	color: $text;
	white-space: pre-wrap;

	.bot & {
		background: #f3f4f6;
		border-top-left-radius: 2px;
	}
	.user & {
		background: $primary;
		color: #fff;
		border-top-right-radius: 2px;
	}
}

.questions-preview {
	margin-top: 10px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.q-item {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	padding: 4px 0;

	&.answered { opacity: 0.7; }
}

.q-icon { flex-shrink: 0; font-size: 12px; }
.q-label { color: #6b7280; flex-shrink: 0; }
.q-answer { color: $primary; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.thinking-dots {
	display: flex; gap: 2px; font-size: 20px; color: #6b7280;
	span { animation: dot 1.2s infinite; }
	span:nth-child(2) { animation-delay: 0.2s; }
	span:nth-child(3) { animation-delay: 0.4s; }
}
@keyframes dot { 0%,60%,100% { opacity: 0.3; } 30% { opacity: 1; } }

.chat-footer {
	padding: 12px 16px;
	border-top: 1px solid $border;
}

.input-row {
	display: flex;
	gap: 8px;
}

.chat-input {
	flex: 1;
	padding: 10px 12px;
	border: 1px solid $border;
	border-radius: 8px;
	font-size: 14px;
	outline: none;
	&:focus { border-color: $primary; }
	&::placeholder { color: #9ca3af; }
}

.send-btn {
	padding: 10px 18px;
	background: $primary;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	&:disabled { opacity: 0.5; cursor: not-allowed; }
	&:hover:not(:disabled) { opacity: 0.9; }
}

.action-row {
	display: flex;
	gap: 10px;
}

.submit-btn {
	flex: 1;
	padding: 10px;
	background: $primary;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	&:disabled { opacity: 0.5; cursor: not-allowed; }
	&:hover:not(:disabled) { opacity: 0.9; }
}

.edit-btn {
	padding: 10px 16px;
	background: #f3f4f6;
	color: #374151;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	cursor: pointer;
	&:hover { background: #e5e7eb; }
}

.done-row {
	text-align: center;
	.done-text { font-size: 14px; color: #10b981; font-weight: 500; }
}
</style>
