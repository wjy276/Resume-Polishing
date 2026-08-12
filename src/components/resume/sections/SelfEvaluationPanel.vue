<template>
	<div class="section-panel">
		<div class="form-group editor-group">
			<label class="form-label">自我评价</label>
			<RichTextEditor
				v-model="content"
				:min-height="168"
				placeholder="简明扼要地写出你的优势、性格、求职意向等..."
			/>
			<button class="ai-optimize-btn" @click="handleAIOptimize">
				<svg viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
				AI 优化
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const emit = defineEmits(['ai-optimize'])

const content = computed({
	get: () => store.activeResume?.selfEvaluationContent || '',
	set: (val) => {
		if (store.activeResume) store.activeResume.selfEvaluationContent = val
	},
})

function handleAIOptimize() {
	emit('ai-optimize')
}
</script>

<style scoped lang="scss">
@use './_panel-common' as *;

.ai-optimize-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	margin-top: 10px;
	padding: 8px 14px;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	svg { width: 14px; height: 14px; }
	&:hover { opacity: 0.9; }
}
</style>
