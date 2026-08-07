<template>
	<section class="module-card" :class="{ expanded }">
		<button class="module-header" @click="$emit('toggle')">
			<span class="module-icon">{{ icon }}</span>
			<span class="module-name">{{ moduleLabel }}</span>
			<span class="change-badge">+{{ items.length }} 处建议</span>
			<svg class="chevron" :class="{ open: expanded }" viewBox="0 0 16 16" fill="none">
				<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</button>

		<div class="module-expand">
			<div class="module-expand-inner">
				<div v-if="items.length" class="suggestion-list">
					<SuggestionItemCard
						v-for="item in items"
						:key="item.id"
						:item="item"
						@toggle-select="$emit('toggle-select', item.id)"
						@apply="$emit('apply-item', item.id)"
						@ignore="$emit('ignore-item', item.id)"
						@restore="$emit('restore-item', item.id)"
					/>
				</div>

				<p v-if="!items.length" class="empty-tip">该模块暂无详细建议。</p>
			</div>
		</div>
	</section>
</template>

<script setup>
import SuggestionItemCard from './SuggestionItemCard.vue'

defineProps({
	moduleLabel: { type: String, required: true },
	icon: { type: String, default: '📄' },
	items: { type: Array, default: () => [] },
	expanded: { type: Boolean, default: false },
})

defineEmits(['toggle', 'toggle-select', 'apply-item', 'ignore-item', 'restore-item'])
</script>

<style scoped>
.module-card {
	background: var(--bg-card, #ffffff);
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 12px;
	overflow: hidden;
	transition: box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.module-card:hover {
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.module-card.expanded {
	border-color: #c7d2fe;
}

.module-header {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 13px 14px;
	border: none;
	background: transparent;
	cursor: pointer;
	font-size: 13px;
	font-weight: 600;
	color: var(--text-primary, #111827);
	text-align: left;
	transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.module-header:hover {
	background: #f9fafb;
}

.module-icon {
	font-size: 16px;
	line-height: 1;
	flex-shrink: 0;
}

.module-name {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.change-badge {
	flex-shrink: 0;
	padding: 2px 8px;
	border-radius: 9999px;
	background: var(--color-accent-subtle, #eef2ff);
	color: var(--color-accent-primary, #6366f1);
	font-size: 11px;
	font-weight: 500;
}

.chevron {
	width: 14px;
	height: 14px;
	color: var(--text-muted, #9ca3af);
	flex-shrink: 0;
	transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron.open {
	transform: rotate(180deg);
}

.module-expand {
	display: grid;
	grid-template-rows: 0fr;
	transition: grid-template-rows 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.module-card.expanded .module-expand {
	grid-template-rows: 1fr;
}

.module-expand-inner {
	overflow: hidden;
}

.suggestion-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding: 0 14px 14px;
}

.empty-tip {
	margin: 0;
	padding: 12px 14px;
	font-size: 12px;
	color: var(--text-muted, #9ca3af);
}
</style>
