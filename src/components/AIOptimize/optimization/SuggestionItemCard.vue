<template>
	<div
		class="suggestion-item"
		:class="[item.status, { expanded }]"
	>
		<div
			class="suggestion-main"
			role="button"
			tabindex="0"
			@click="expanded = !expanded"
			@keydown.enter.prevent="expanded = !expanded"
			@keydown.space.prevent="expanded = !expanded"
		>
			<label v-if="item.status === 'pending'" class="suggestion-check" @click.stop>
				<input
					type="checkbox"
					:checked="!!item.selected"
					@change="$emit('toggle-select')"
					aria-label="选择该条建议"
				/>
			</label>

			<svg v-if="item.type === 'add'" class="suggestion-icon add" viewBox="0 0 16 16" fill="none">
				<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
				<path d="M8 5v6M5 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
			<svg v-else-if="item.type === 'delete'" class="suggestion-icon delete" viewBox="0 0 16 16" fill="none">
				<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
				<path d="M5.5 8h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
			</svg>
			<svg v-else class="suggestion-icon modify" viewBox="0 0 16 16" fill="none">
				<path d="M2 12.5L4.5 10 11 3.5l2 2-6.5 6.5L4 14l-2-1.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M9 5.5l2 2" stroke="currentColor" stroke-width="1.4"/>
			</svg>

			<span class="suggestion-summary">{{ item.summary }}</span>

			<span v-if="item.status === 'applied'" class="status-badge applied">已应用</span>
			<span v-else-if="item.status === 'ignored'" class="status-badge ignored">已忽略</span>

			<svg class="expand-icon" :class="{ open: expanded }" viewBox="0 0 16 16" fill="none">
				<path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>

		<div class="suggestion-expand">
			<div class="suggestion-expand-inner">
				<DiffViewer
					v-if="item.originalText || item.suggestedText"
					:original-text="item.originalText"
					:suggested-text="item.suggestedText"
				/>
				<p v-else class="detail-text">{{ item.detail }}</p>

				<div class="suggestion-actions">
					<button
						v-if="item.status === 'pending'"
						class="btn-text"
						@click.stop="$emit('ignore')"
					>忽略此条</button>
					<button
						v-else-if="item.status === 'ignored'"
						class="btn-text"
						@click.stop="$emit('restore')"
					>恢复</button>
					<span v-else class="action-spacer" />

					<button
						v-if="item.status === 'pending'"
						class="btn-small primary"
						@click.stop="$emit('apply')"
					>应用此条</button>
					<button
						v-else-if="item.status === 'applied'"
						class="btn-small ghost"
						@click.stop="$emit('restore')"
					>撤销</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import DiffViewer from './DiffViewer.vue'

defineProps({
	item: { type: Object, required: true },
})

defineEmits(['toggle-select', 'apply', 'ignore', 'restore'])

const expanded = ref(false)
</script>

<style scoped>
.suggestion-item {
	background: #f9fafb;
	border: 1px solid transparent;
	border-radius: 8px;
	cursor: pointer;
	transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-item:hover {
	background: #f3f4f6;
}

.suggestion-item.expanded {
	background: #ffffff;
	border-color: var(--border-color, #e5e7eb);
	cursor: default;
}

.suggestion-item.applied {
	border-color: #10b981;
	background: #f0fdf4;
}

.suggestion-item.ignored {
	opacity: 0.6;
}

.suggestion-main {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 12px;
	min-width: 0;
}

.suggestion-check {
	display: flex;
	align-items: center;
	flex-shrink: 0;
	cursor: pointer;
}

.suggestion-check input {
	width: 15px;
	height: 15px;
	accent-color: var(--color-accent-primary, #6366f1);
	cursor: pointer;
	margin: 0;
}

.suggestion-icon {
	width: 16px;
	height: 16px;
	flex-shrink: 0;
}

.suggestion-icon.add { color: #10b981; }
.suggestion-icon.modify { color: #6366f1; }
.suggestion-icon.delete { color: #ef4444; }

.suggestion-summary {
	flex: 1;
	min-width: 0;
	font-size: 13px;
	font-weight: 500;
	color: var(--text-primary, #111827);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.status-badge {
	flex-shrink: 0;
	padding: 2px 8px;
	border-radius: 9999px;
	font-size: 11px;
	font-weight: 600;
}

.status-badge.applied {
	background: #10b981;
	color: #ffffff;
}

.status-badge.ignored {
	background: #e5e7eb;
	color: #6b7280;
}

.expand-icon {
	width: 14px;
	height: 14px;
	color: var(--text-muted, #9ca3af);
	flex-shrink: 0;
	transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-item:hover .expand-icon {
	color: var(--text-secondary, #6b7280);
}

.suggestion-item.expanded .expand-icon {
	transform: rotate(90deg);
}

.suggestion-expand {
	display: grid;
	grid-template-rows: 0fr;
	transition: grid-template-rows 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestion-item.expanded .suggestion-expand {
	grid-template-rows: 1fr;
}

.suggestion-expand-inner {
	overflow: hidden;
	padding: 0 12px;
}

.suggestion-item.expanded .suggestion-expand-inner {
	padding-bottom: 12px;
}

.detail-text {
	margin: 0;
	font-size: 12.5px;
	line-height: 1.6;
	color: var(--text-secondary, #6b7280);
	white-space: pre-wrap;
}

.suggestion-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px solid var(--border-color, #e5e7eb);
}

.btn-text {
	height: 28px;
	padding: 0 8px;
	background: transparent;
	border: none;
	color: var(--text-muted, #9ca3af);
	font-size: 12.5px;
	cursor: pointer;
	transition: color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-text:hover {
	color: var(--text-primary, #111827);
}

.action-spacer {
	flex: 1;
}

.btn-small {
	height: 28px;
	padding: 0 12px;
	border-radius: 6px;
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
	border: none;
}

.btn-small.primary {
	background: var(--color-accent-primary, #6366f1);
	color: #ffffff;
}

.btn-small.primary:hover {
	background: var(--color-accent-hover, #4f46e5);
}

.btn-small.ghost {
	background: #f3f4f6;
	color: var(--text-secondary, #6b7280);
}

.btn-small.ghost:hover {
	background: #e5e7eb;
	color: var(--text-primary, #111827);
}
</style>
