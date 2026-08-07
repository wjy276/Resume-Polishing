<template>
	<footer class="bottom-bar">
		<div class="bottom-bar-left">
			<button
				class="select-all"
				:class="{ checked: allSelected, partial: selectedCount > 0 && !allSelected }"
				:disabled="!total || isApplying"
				@click="$emit('select-all')"
				:aria-label="allSelected ? '取消全选' : '全选'"
			>
				<svg viewBox="0 0 16 16" fill="none">
					<path v-if="allSelected" d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path v-else-if="selectedCount > 0" d="M4 8h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
			<span class="select-text">{{ allSelected ? '已全选' : `已选择 ${selectedCount}/${total} 条建议` }}</span>
		</div>

		<div class="bottom-bar-right">
			<button class="btn-reanalyze" :disabled="isApplying" @click="$emit('reanalyze')">
				<svg viewBox="0 0 16 16" fill="none"><path d="M13.5 8a5.5 5.5 0 11-1.6-3.9M13.5 2v2.5H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
				重新分析
			</button>
			<button class="btn-apply" :disabled="!selectedCount || isApplying" @click="$emit('apply-selected')">
				<span v-if="isApplying" class="mini-spinner" aria-hidden="true" />
				<svg v-else viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				{{ isApplying ? '应用中...' : '应用选中' }}
			</button>
		</div>
	</footer>
</template>

<script setup>
defineProps({
	total: { type: Number, default: 0 },
	selectedCount: { type: Number, default: 0 },
	allSelected: { type: Boolean, default: false },
	isApplying: { type: Boolean, default: false },
})

defineEmits(['select-all', 'apply-selected', 'reanalyze'])
</script>

<style scoped>
.bottom-bar {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 10px;
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(8px);
	border-top: 1px solid var(--border-color, #e5e7eb);
	box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
	z-index: 10;
}

.bottom-bar-left {
	display: flex;
	align-items: center;
	gap: 8px;
	min-width: 0;
}

.select-all {
	width: 18px;
	height: 18px;
	flex-shrink: 0;
	border-radius: 5px;
	border: 1.5px solid var(--border-strong, #d1d5db);
	background: #ffffff;
	color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	padding: 0;
	transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.select-all svg {
	width: 11px;
	height: 11px;
}

.select-all.checked,
.select-all.partial {
	background: var(--color-accent-primary, #6366f1);
	border-color: var(--color-accent-primary, #6366f1);
	color: #ffffff;
}

.select-all:disabled {
	opacity: 0.45;
	cursor: not-allowed;
}

.select-text {
	font-size: 12.5px;
	color: var(--text-secondary, #6b7280);
	white-space: nowrap;
}

.bottom-bar-right {
	display: flex;
	align-items: center;
	gap: 6px;
}

.btn-reanalyze,
.btn-apply {
	height: 36px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	border-radius: 8px;
	font-size: 12.5px;
	font-weight: 500;
	cursor: pointer;
	transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
	white-space: nowrap;
}

.btn-reanalyze {
	padding: 0 10px;
	background: #ffffff;
	border: 1px solid var(--border-color, #e5e7eb);
	color: var(--text-secondary, #6b7280);
}

.btn-reanalyze:hover:not(:disabled) {
	background: #f9fafb;
	border-color: #d1d5db;
	color: var(--text-primary, #111827);
}

.btn-reanalyze:hover:not(:disabled) svg {
	transform: rotate(180deg);
	transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-reanalyze svg {
	width: 14px;
	height: 14px;
}

.btn-apply {
	padding: 0 14px;
	background: var(--color-accent-primary, #6366f1);
	border: none;
	color: #ffffff;
}

.btn-apply svg {
	width: 14px;
	height: 14px;
}

.btn-apply:hover:not(:disabled) {
	background: var(--color-accent-hover, #4f46e5);
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-apply:active:not(:disabled) {
	transform: translateY(0);
}

.btn-apply:disabled,
.btn-reanalyze:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.mini-spinner {
	width: 13px;
	height: 13px;
	border: 2px solid rgba(255, 255, 255, 0.35);
	border-top-color: #ffffff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>
