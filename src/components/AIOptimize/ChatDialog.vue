<template>
	<transition name="fade-scale">
		<div v-if="visible" class="dialog-overlay" @click.self="handleClose">
			<div class="dialog-panel">
				<div class="dialog-header">
					<div class="header-left">
						<span class="bot-avatar">🤖</span>
						<div class="header-info">
							<h3>AI 求职助手</h3>
							<span class="subtitle">先了解你的方向，再优化简历</span>
						</div>
					</div>
					<button class="close-btn" @click="handleClose" :disabled="submitting">×</button>
				</div>

				<div class="chat-body" ref="chatRef">
					<div 
						v-for="(msg, i) in messages" 
						:key="i" 
						class="msg-row" 
						:class="msg.role"
						:style="{ animationDelay: `${i * 0.1}s` }"
					>
						<div class="msg-avatar">{{ msg.role === 'bot' ? '🤖' : '👤' }}</div>
						<div class="msg-bubble">
							<div class="msg-text">{{ msg.text }}</div>
							<div v-if="msg.questions" class="questions-preview">
								<div 
									v-for="(q, qi) in msg.questions" 
									:key="qi" 
									class="q-item" 
									:class="{ answered: answers[q.key] }"
								>
									<span class="q-icon">{{ answers[q.key] ? '✅' : '📝' }}</span>
									<span class="q-label">{{ q.label }}</span>
									<span v-if="answers[q.key]" class="q-answer">{{ answers[q.key] }}</span>
								</div>
							</div>
						</div>
					</div>

					<div v-if="submitting" class="msg-row bot typing">
						<div class="msg-avatar">🤖</div>
						<div class="msg-bubble">
							<div class="thinking-dots">
								<span></span><span></span><span></span>
							</div>
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
							ref="inputRef"
						/>
						<button 
							class="send-btn" 
							@click="handleSend" 
							:disabled="!userInput.trim() || submitting"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
							</svg>
						</button>
					</div>
					<div v-else-if="!submitted" class="action-row">
						<button class="submit-btn" @click="handleSubmit" :disabled="submitting">
							<span v-if="submitting" class="btn-spinner"></span>
							{{ submitting ? '提交中…' : '确认并开始优化' }}
						</button>
						<button class="edit-btn" @click="allAnswered = false; userInput = ''; focusInput()">
							修改信息
						</button>
					</div>
					<div v-else class="done-row">
						<span class="done-text">
							<span class="check-icon">✓</span>
							信息已提交，开始优化简历...
						</span>
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
const inputRef = ref(null)
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
				nextTick(focusInput)
			}, 800))
		})
	}
})

onUnmounted(clearTimers)

function clearTimers() {
	timers.value.forEach(clearTimeout)
	timers.value = []
}

function focusInput() {
	nextTick(() => {
		inputRef.value?.focus()
	})
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
		timers.value.push(setTimeout(() => {
			sendBotMessage(questions[nextIdx].question)
			nextTick(focusInput)
		}, 400))
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
.fade-scale-enter-active, 
.fade-scale-leave-active { 
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
}
.fade-scale-enter-from, 
.fade-scale-leave-to { 
	opacity: 0; 
	transform: scale(0.95);
}

.dialog-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.45);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10002;
	padding: 20px;
}

.dialog-panel {
	background: var(--bg-card);
	border-radius: var(--radius-lg);
	width: 480px;
	max-width: 92vw;
	height: 560px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	box-shadow: var(--shadow-lg);
	animation: slideUp 0.3s ease;
	overflow: hidden;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 18px;
	border-bottom: 1px solid var(--border-color);
	background: linear-gradient(to right, var(--bg-card), var(--bg-page));

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	
	.bot-avatar { 
		font-size: 32px;
		animation: botFloat 3s ease-in-out infinite;
	}
	
	.header-info {
		h3 { 
			font-size: 15px; 
			font-weight: 600; 
			color: var(--text-primary); 
			margin: 0 0 2px 0; 
		}
		.subtitle { 
			font-size: 12px; 
			color: var(--text-muted); 
		}
	}
}

@keyframes botFloat {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-3px); }
}

.close-btn {
	border: none;
	background: transparent;
	font-size: 24px;
	color: var(--text-muted);
	cursor: pointer;
	padding: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-sm);
	transition: all var(--transition-fast);
	
	&:hover:not(:disabled) { 
		background: var(--bg-page);
		color: var(--text-primary); 
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}

.chat-body {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	background: var(--bg-page);
	
	&::-webkit-scrollbar {
		width: 4px;
	}
	&::-webkit-scrollbar-thumb {
		background: var(--border-color);
		border-radius: 10px;
	}
}

.msg-row {
	display: flex;
	gap: 8px;
	max-width: 85%;
	animation: messageSlide 0.3s ease;

	&.bot { align-self: flex-start; }
	&.user { align-self: flex-end; flex-direction: row-reverse; }
	&.typing .msg-bubble {
		padding: 12px 16px;
	}
}

@keyframes messageSlide {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.msg-avatar {
	flex-shrink: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	background: var(--bg-card);
	border-radius: 50%;
	box-shadow: var(--shadow-sm);
	transition: transform 0.2s ease;
	
	&:hover {
		transform: scale(1.1);
	}
}

.msg-bubble {
	padding: 10px 14px;
	border-radius: var(--radius-md);
	font-size: 14px;
	line-height: 1.5;
	color: var(--text-primary);
	white-space: pre-wrap;
	transition: all var(--transition-fast);

	.bot & {
		background: var(--bg-card);
		border-top-left-radius: 4px;
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-color);
	}
	.user & {
		background: linear-gradient(135deg, var(--primary-light), #3b82f6);
		color: #fff;
		border-top-right-radius: 4px;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
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
	transition: all var(--transition-fast);

	&.answered { 
		opacity: 0.7;
	}
}

.q-icon { flex-shrink: 0; font-size: 12px; }
.q-label { color: var(--text-muted); flex-shrink: 0; }
.q-answer { 
	color: var(--primary-light); 
	font-weight: 500; 
	overflow: hidden; 
	text-overflow: ellipsis; 
	white-space: nowrap;
	background: rgba(37, 99, 235, 0.08);
	padding: 2px 8px;
	border-radius: 4px;
}

.thinking-dots {
	display: flex; 
	gap: 4px; 
	
	span {
		width: 6px;
		height: 6px;
		background: var(--text-muted);
		border-radius: 50%;
		animation: dotBounce 1.4s infinite ease-in-out both;
		
		&:nth-child(1) { animation-delay: -0.32s; }
		&:nth-child(2) { animation-delay: -0.16s; }
	}
}

@keyframes dotBounce {
	0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
	40% { transform: scale(1); opacity: 1; }
}

.chat-footer {
	padding: 12px 16px;
	border-top: 1px solid var(--border-color);
	background: var(--bg-card);
}

.input-row {
	display: flex;
	gap: 8px;
}

.chat-input {
	flex: 1;
	padding: 10px 14px;
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	font-size: 14px;
	outline: none;
	background: var(--bg-page);
	transition: all var(--transition-fast);
	
	&:focus { 
		border-color: var(--primary-light);
		background: var(--bg-card);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	&::placeholder { color: var(--text-muted); }
	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

.send-btn {
	width: 40px;
	height: 40px;
	padding: 0;
	background: linear-gradient(135deg, var(--primary-light), #3b82f6);
	color: #fff;
	border: none;
	border-radius: var(--radius-md);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all var(--transition-fast);
	box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	
	svg {
		width: 18px;
		height: 18px;
	}
	
	&:disabled { 
		opacity: 0.5; 
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
	&:hover:not(:disabled) { 
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
	}
	&:active:not(:disabled) {
		transform: translateY(0);
	}
}

.action-row {
	display: flex;
	gap: 10px;
}

.submit-btn {
	flex: 1;
	padding: 10px;
	background: linear-gradient(135deg, var(--primary-light), #3b82f6);
	color: #fff;
	border: none;
	border-radius: var(--radius-md);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all var(--transition-fast);
	box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	
	&:disabled { 
		opacity: 0.5; 
		cursor: not-allowed;
		transform: none;
	}
	&:hover:not(:disabled) { 
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
	}
}

.btn-spinner {
	display: inline-block;
	width: 14px;
	height: 14px;
	border: 2px solid rgba(255,255,255,0.3);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
	margin-right: 6px;
	vertical-align: middle;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.edit-btn {
	padding: 10px 16px;
	background: var(--bg-page);
	color: var(--text-secondary);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	font-size: 14px;
	cursor: pointer;
	transition: all var(--transition-fast);
	
	&:hover { 
		background: var(--border-color);
		color: var(--text-primary);
	}
}

.done-row {
	text-align: center;
	
	.done-text { 
		font-size: 14px; 
		color: var(--success-color); 
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	
	.check-icon {
		width: 20px;
		height: 20px;
		background: var(--success-color);
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
	}
}
</style>