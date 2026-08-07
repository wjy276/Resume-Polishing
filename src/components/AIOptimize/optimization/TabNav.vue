<template>
	<nav class="tab-nav" aria-label="AI 面板切换">
		<svg class="tab-sparkle" viewBox="0 0 16 16" fill="none">
			<path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
		</svg>

		<button
			class="tab-item"
			:class="{ active: activeTab === 'analysis' }"
			:disabled="analysisDisabled"
			@click="$emit('change', 'analysis')"
		>
			匹配分析
		</button>

		<button
			class="tab-item"
			:class="{ active: activeTab === 'chat' }"
			:disabled="chatDisabled"
			@click="$emit('change', 'chat')"
		>
			校对对话
			<span v-if="chatUnread > 0" class="tab-badge" :key="chatUnread">{{ badgeText }}</span>
		</button>
	</nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	activeTab: { type: String, default: 'analysis' },
	chatUnread: { type: Number, default: 0 },
	analysisDisabled: { type: Boolean, default: false },
	chatDisabled: { type: Boolean, default: false },
})

defineEmits(['change'])

const badgeText = computed(() => (props.chatUnread > 99 ? '99+' : String(props.chatUnread)))
</script>

<style scoped>
.tab-nav {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 4px;
	flex: 1;
	min-width: 0;
	background: #f3f4f6;
	border-radius: 10px;
	padding: 4px;
}

.tab-sparkle {
	width: 15px;
	height: 15px;
	color: var(--color-accent-primary, #6366f1);
	flex-shrink: 0;
	margin: 0 2px;
}

.tab-item {
	position: relative;
	height: 30px;
	padding: 0 12px;
	display: flex;
	align-items: center;
	gap: 6px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	color: var(--text-secondary, #6b7280);
	cursor: pointer;
	transition: background 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
	border: none;
	background: transparent;
	white-space: nowrap;
}

.tab-item.active {
	background: #ffffff;
	color: var(--color-accent-primary, #6366f1);
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.tab-item:disabled {
	opacity: 0.45;
	cursor: not-allowed;
}

.tab-badge {
	min-width: 18px;
	height: 18px;
	padding: 0 5px;
	border-radius: 9999px;
	background: var(--color-accent-subtle, #eef2ff);
	color: var(--color-accent-primary, #6366f1);
	font-size: 11px;
	font-weight: 600;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	animation: badgePop 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes badgePop {
	0% { transform: scale(0); }
	70% { transform: scale(1.2); }
	100% { transform: scale(1); }
}
</style>
