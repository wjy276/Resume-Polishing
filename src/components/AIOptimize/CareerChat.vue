<template>
	<div class="career-chat">
		<div class="section-header">
			<h3>聊聊你的职业方向</h3>
			<p>AI 将通过几个问题帮你确定简历定位</p>
		</div>

		<div class="chat-messages" ref="messagesRef">
			<div v-if="!aiStore.chatMessages.length" class="empty-hint">
				<span class="hint-icon">💬</span>
				<p>点击下方按钮开始对话</p>
			</div>

			<div
				v-for="(msg, idx) in aiStore.chatMessages"
				:key="idx"
				class="message"
				:class="msg.role"
			>
				<div class="message-avatar">
					<span v-if="msg.role === 'assistant'">🤖</span>
					<span v-else>👤</span>
				</div>
				<div class="message-content">
					<div class="message-text" v-html="formatMessage(msg.content)"></div>
					<div v-if="msg.suggestions?.length" class="suggestions">
						<button
							v-for="(s, si) in msg.suggestions"
							:key="si"
							class="suggestion-btn"
							@click="handleSuggestion(s)"
						>
							{{ s }}
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="chat-input-area">
			<div class="input-row">
				<input
					v-model="inputText"
					class="chat-input"
					placeholder="输入你的回答..."
					@keyup.enter="handleSend"
					:disabled="aiStore.loading"
				/>
				<button
					class="send-btn"
					@click="handleSend"
					:disabled="!inputText.trim() || aiStore.loading"
				>
					发送
				</button>
			</div>

			<div class="action-row">
				<button
					v-if="!aiStore.careerProfile"
					class="action-btn primary"
					@click="handleStartChat"
					:disabled="aiStore.loading"
				>
					{{ aiStore.loading ? '分析中...' : '开始分析方向' }}
				</button>
				<button
					v-else
					class="action-btn success"
					disabled
				>
					✓ 方向已确定
				</button>
			</div>
		</div>

		<div v-if="aiStore.careerProfile" class="profile-card">
			<h4>职业画像</h4>
			<div class="profile-content">
				<div v-if="aiStore.careerProfile.target_roles?.length" class="profile-item">
					<span class="label">推荐岗位</span>
					<div class="tags">
						<span v-for="role in aiStore.careerProfile.target_roles" :key="role" class="tag">
							{{ role }}
						</span>
					</div>
				</div>
				<div v-if="aiStore.careerProfile.narrative_angle" class="profile-item">
					<span class="label">简历角度</span>
					<span class="value">{{ aiStore.careerProfile.narrative_angle }}</span>
				</div>
				<div v-if="aiStore.careerProfile.keyword_pool?.length" class="profile-item">
					<span class="label">关键词</span>
					<div class="tags">
						<span v-for="kw in aiStore.careerProfile.keyword_pool.slice(0, 8)" :key="kw" class="tag small">
							{{ kw }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'

const aiStore = useAIOptimizeStore()
const inputText = ref('')
const messagesRef = ref(null)

function formatMessage(text) {
	if (!text) return ''
	return text.replace(/\n/g, '<br>')
}

function scrollToBottom() {
	nextTick(() => {
		if (messagesRef.value) {
			messagesRef.value.scrollTop = messagesRef.value.scrollHeight
		}
	})
}

async function handleStartChat() {
	aiStore.chatMessages.push({ role: 'assistant', content: '正在分析你的简历，确定职业方向...' })
	scrollToBottom()
	
	const res = await aiStore.runCareerAgent([])
	if (res.success) {
		aiStore.chatMessages = aiStore.chatMessages.filter(m => m.content !== '正在分析你的简历，确定职业方向...')
		scrollToBottom()
	} else {
		aiStore.chatMessages = aiStore.chatMessages.filter(m => m.content !== '正在分析你的简历，确定职业方向...')
		aiStore.chatMessages.push({ role: 'assistant', content: '抱歉，分析失败：' + (res.message || '未知错误') })
	}
}

async function handleSend() {
	const text = inputText.value.trim()
	if (!text) return

	aiStore.chatMessages.push({ role: 'user', content: text })
	inputText.value = ''
	scrollToBottom()

	const messages = aiStore.chatMessages
		.filter(m => m.role === 'user' || m.role === 'assistant')
		.map(m => ({ role: m.role, content: m.content }))

	const res = await aiStore.runCareerAgent(messages)
	if (res.success) {
		scrollToBottom()
	}
}

function handleSuggestion(text) {
	inputText.value = text
	handleSend()
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$success: #10b981;

.career-chat {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.section-header {
	padding: 20px;
	border-bottom: 1px solid #f3f4f6;

	h3 {
		font-size: 16px;
		font-weight: 600;
		color: #111827;
		margin: 0 0 4px;
	}

	p {
		font-size: 13px;
		color: #6b7280;
		margin: 0;
	}
}

.chat-messages {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
}

.empty-hint {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #9ca3af;

	.hint-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}

	p {
		font-size: 14px;
		margin: 0;
	}
}

.message {
	display: flex;
	gap: 12px;
	margin-bottom: 16px;

	&.user {
		flex-direction: row-reverse;

		.message-content {
			align-items: flex-end;
		}

		.message-text {
			background: $primary;
			color: #fff;
			border-radius: 16px 4px 16px 16px;
		}
	}
}

.message-avatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: #f3f4f6;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	flex-shrink: 0;
}

.message-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
	max-width: 80%;
}

.message-text {
	padding: 12px 16px;
	background: #f3f4f6;
	color: #111827;
	border-radius: 4px 16px 16px 16px;
	font-size: 14px;
	line-height: 1.5;
}

.suggestions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.suggestion-btn {
	padding: 8px 14px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 16px;
	font-size: 13px;
	color: #374151;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		border-color: $primary;
		color: $primary;
		background: #eff6ff;
	}
}

.chat-input-area {
	padding: 16px;
	border-top: 1px solid #f3f4f6;
}

.input-row {
	display: flex;
	gap: 8px;
}

.chat-input {
	flex: 1;
	padding: 10px 14px;
	border: 1px solid #e5e7eb;
	border-radius: 20px;
	font-size: 14px;
	outline: none;
	transition: border-color 0.15s;

	&:focus {
		border-color: $primary;
	}

	&:disabled {
		background: #f9fafb;
	}
}

.send-btn {
	padding: 10px 18px;
	background: $primary;
	color: #fff;
	border: none;
	border-radius: 20px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover { opacity: 0.9; }
	&:disabled { opacity: 0.5; cursor: not-allowed; }
}

.action-row {
	margin-top: 12px;
	display: flex;
	justify-content: center;
}

.action-btn {
	padding: 10px 24px;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;

	&.primary {
		background: linear-gradient(135deg, $primary, #3b82f6);
		color: #fff;

		&:hover { opacity: 0.9; }
		&:disabled { opacity: 0.5; cursor: not-allowed; }
	}

	&.success {
		background: #ecfdf5;
		color: $success;
		border: 1px solid #a7f3d0;
	}
}

.profile-card {
	margin: 16px;
	padding: 16px;
	background: #f0f9ff;
	border: 1px solid #bae6fd;
	border-radius: 12px;

	h4 {
		font-size: 14px;
		font-weight: 600;
		color: #0369a1;
		margin: 0 0 12px;
	}
}

.profile-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.profile-item {
	display: flex;
	flex-direction: column;
	gap: 4px;

	.label {
		font-size: 12px;
		color: #6b7280;
	}

	.value {
		font-size: 14px;
		color: #111827;
	}
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.tag {
	padding: 4px 10px;
	background: #fff;
	border: 1px solid #7dd3fc;
	border-radius: 12px;
	font-size: 12px;
	color: #0369a1;

	&.small {
		padding: 2px 8px;
		font-size: 11px;
	}
}
</style>
