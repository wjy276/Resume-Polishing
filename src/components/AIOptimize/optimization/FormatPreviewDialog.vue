<template>
	<transition name="preview-fade">
		<div v-if="visible" class="preview-overlay" @click.self="$emit('close')">
			<div class="preview-modal">
				<div class="preview-head">
					<div class="preview-head-text">
						<h3 class="preview-title">预览应用效果</h3>
						<p class="preview-subtitle">AI 将按以下方式修改您的内容，确认后再写入简历</p>
					</div>
					<button class="preview-close" @click="$emit('close')" aria-label="关闭">
						<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
					</button>
				</div>

				<div class="strategy-row" role="radiogroup" aria-label="合并策略">
					<button
						v-for="s in strategies"
						:key="s.value"
						class="strategy-btn"
						:class="{ active: strategy === s.value }"
						@click="strategy = s.value"
					>{{ s.label }}</button>
				</div>

				<div class="preview-content">
					<div v-for="section in previewSections" :key="section.module" class="preview-section">
						<div class="preview-section-title">{{ section.label }}</div>

						<div
							v-for="(item, idx) in section.preview.items"
							:key="'m-' + idx"
							class="preview-block"
							:class="item.status"
							v-html="renderBlockHtml(item.block)"
						/>

						<template v-if="section.preview.removed.length">
							<div class="removed-title">将删除以下内容</div>
							<div
								v-for="(block, idx) in section.preview.removed"
								:key="'r-' + idx"
								class="preview-block removed"
								v-html="renderBlockHtml(block)"
							/>
						</template>
					</div>
				</div>

				<div class="preview-foot">
					<button class="btn-cancel" @click="$emit('close')">取消</button>
					<button class="btn-confirm" @click="confirm">确认应用</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { buildPreview, mergeHtml, renderBlockHtml } from '@/utils/resume/formatPreserve'

const props = defineProps({
	visible: { type: Boolean, default: false },
	sections: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'apply'])

const strategy = ref('smart')

watch(() => props.visible, (val) => {
	if (val) strategy.value = 'smart'
})

const strategies = [
	{ value: 'smart', label: '智能合并（推荐）' },
	{ value: 'replace', label: '完全替换' },
	{ value: 'preserve', label: '仅保留格式' },
]

const previewSections = computed(() =>
	props.sections.map((s) => ({
		...s,
		preview: buildPreview(s.originalHtml, s.aiHtml, strategy.value),
	}))
)

function confirm() {
	const merged = props.sections.map((s) => ({
		module: s.module,
		html: mergeHtml(s.originalHtml, s.aiHtml, strategy.value),
	}))
	emit('apply', strategy.value, merged)
}
</script>

<style scoped>
.preview-overlay {
	position: fixed;
	inset: 0;
	z-index: 10050;
	background: rgba(0, 0, 0, 0.45);
	backdrop-filter: blur(2px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.preview-modal {
	width: 520px;
	max-width: 94vw;
	max-height: 78vh;
	background: #ffffff;
	border-radius: 16px;
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	display: flex;
	flex-direction: column;
	overflow: hidden;
	animation: previewIn 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes previewIn {
	from { opacity: 0; transform: translateY(20px); }
	to { opacity: 1; transform: translateY(0); }
}

.preview-fade-enter-active,
.preview-fade-leave-active {
	transition: opacity 200ms ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
	opacity: 0;
}

.preview-head {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	padding: 18px 20px 12px;
	border-bottom: 1px solid #f3f4f6;
	flex-shrink: 0;
}

.preview-title {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: #111827;
}

.preview-subtitle {
	margin: 4px 0 0;
	font-size: 12.5px;
	color: #6b7280;
}

.preview-close {
	width: 28px;
	height: 28px;
	flex-shrink: 0;
	border: none;
	background: transparent;
	border-radius: 6px;
	color: #6b7280;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background 150ms, color 150ms;
}

.preview-close:hover {
	background: #f3f4f6;
	color: #111827;
}

.preview-close svg {
	width: 14px;
	height: 14px;
}

.strategy-row {
	display: flex;
	gap: 4px;
	padding: 12px 20px;
	background: #f9fafb;
	border-bottom: 1px solid #f3f4f6;
	flex-shrink: 0;
	flex-wrap: wrap;
}

.strategy-btn {
	height: 30px;
	padding: 0 12px;
	border: 1px solid transparent;
	border-radius: 8px;
	background: transparent;
	font-size: 12.5px;
	font-weight: 500;
	color: #6b7280;
	cursor: pointer;
	transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.strategy-btn:hover {
	color: #111827;
	background: #f3f4f6;
}

.strategy-btn.active {
	background: #ffffff;
	border-color: #e5e7eb;
	color: #6366f1;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.preview-content {
	flex: 1;
	overflow-y: auto;
	padding: 16px 20px 20px;
	overscroll-behavior: contain;
}

.preview-section + .preview-section {
	margin-top: 18px;
	padding-top: 14px;
	border-top: 1px solid #f3f4f6;
}

.preview-section-title {
	font-size: 13px;
	font-weight: 600;
	color: #374151;
	margin-bottom: 8px;
}

.preview-block {
	position: relative;
	padding: 8px 12px;
	margin: 4px 0;
	border-radius: 6px;
	font-size: 13px;
	line-height: 1.7;
	color: #374151;
}

.preview-block :deep(p) { margin: 0; }
.preview-block :deep(ul),
.preview-block :deep(ol) {
	margin: 0;
	padding-left: 1.4em;
}
.preview-block :deep(li) { margin: 2px 0; }
.preview-block :deep(li p) { margin: 0; }

.preview-block.added {
	background: #f0fdf4;
	border-left: 4px solid #10b981;
}

.preview-block.preserved {
	background: #f9fafb;
}

.preview-block.preserved::after {
	content: '保留格式';
	position: absolute;
	top: 4px;
	right: 8px;
	font-size: 10px;
	color: #6b7280;
	background: #f3f4f6;
	padding: 2px 6px;
	border-radius: 4px;
}

.preview-block.removed {
	background: #fef2f2;
	border-left: 4px solid #ef4444;
	text-decoration: line-through;
	opacity: 0.7;
}

.removed-title {
	font-size: 11px;
	font-weight: 600;
	color: #ef4444;
	margin: 10px 0 4px;
}

.preview-foot {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 12px 20px;
	border-top: 1px solid #f3f4f6;
	background: rgba(255, 255, 255, 0.95);
	flex-shrink: 0;
}

.btn-cancel,
.btn-confirm {
	height: 36px;
	padding: 0 18px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cancel {
	background: #ffffff;
	border: 1px solid #e5e7eb;
	color: #6b7280;
}

.btn-cancel:hover {
	background: #f9fafb;
	border-color: #d1d5db;
	color: #111827;
}

.btn-confirm {
	background: #6366f1;
	border: none;
	color: #ffffff;
}

.btn-confirm:hover {
	background: #4f46e5;
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
</style>
