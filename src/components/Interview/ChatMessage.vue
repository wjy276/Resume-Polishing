<template>
	<view v-if="message.type === 'score'" :id="`msg-${message.id}`" class="message-score-row">
		<ScoreCard :score="message.score" :feedback="message.feedback" />
	</view>

	<view v-else :id="`msg-${message.id}`" class="message" :class="message.role">
		<view class="message-avatar" :class="message.role">
			<text>{{ message.role === 'interviewer' ? '👨‍💼' : '🙂' }}</text>
		</view>
		<view class="message-content">
			<view class="message-header">
				<text class="message-role">{{ message.role === 'interviewer' ? '面试官' : '我' }}</text>
				<text
					v-if="message.decision"
					class="message-tag"
					:class="message.decision === 'follow_up' ? 'follow-up' : 'next'"
				>
					{{ message.decision === 'follow_up' ? '追问' : '下一题' }}
				</text>
			</view>
			<view class="message-bubble">
				<text class="message-text">{{ message.content }}</text>
			</view>
			<view
				v-if="ttsEnabled && message.role === 'interviewer'"
				class="message-actions"
			>
				<button class="btn-play-voice" @click="$emit('play-voice', message)">
					<text>🔊 播放语音</text>
				</button>
			</view>
			<text class="message-time">{{ message.time }}</text>
		</view>
	</view>
</template>

<script setup>
import ScoreCard from './ScoreCard.vue'

defineProps({
	message: {
		type: Object,
		required: true,
	},
	ttsEnabled: {
		type: Boolean,
		default: true,
	},
})

defineEmits(['play-voice'])
</script>

<style scoped lang="scss">
.message {
	display: flex;
	gap: 12px;
	max-width: 85%;
	animation: fadeInUp 0.3s ease;
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

.message-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;

	&.interviewer {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		color: #ffffff;
	}

	&.user {
		background: #e5e7eb;
		color: #6b7280;
	}
}

.message-content {
	display: flex;
	flex-direction: column;
	gap: 4px;
	max-width: calc(100% - 52px);
}

.message-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 2px;
}

.message-role {
	font-size: 12px;
	font-weight: 600;
	color: #6b7280;
}

.message-tag {
	font-size: 10px;
	padding: 2px 8px;
	border-radius: 4px;
	font-weight: 500;

	&.follow-up {
		background: #fef3c7;
		color: #d97706;
	}

	&.next {
		background: #dbeafe;
		color: #2563eb;
	}
}

.message-bubble {
	padding: 14px 18px;
	border-radius: 14px;
	font-size: 14px;
	line-height: 1.7;
	color: #1f2937;
	word-break: break-word;
}

.message.interviewer .message-bubble {
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-top-left-radius: 4px;
}

.message.user {
	align-self: flex-end;
	flex-direction: row-reverse;
	margin-left: auto;
}

.message.user .message-bubble {
	background: #1a3a6b;
	color: #ffffff;
	border-top-right-radius: 4px;
}

.message-actions {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 0 4px;
}

.btn-play-voice {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	background: #ffffff;
	color: #6b7280;
	font-size: 11px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: #3b82f6;
		color: #3b82f6;
	}
}

.message-time {
	font-size: 11px;
	color: #9ca3af;
	padding: 0 4px;
}

.message-score-row {
	max-width: 85%;
	align-self: flex-start;
}

@media (max-width: 768px) {
	.message {
		max-width: 92%;
	}
}
</style>
