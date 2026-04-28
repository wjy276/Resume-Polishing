<template>
	<div class="section-panel">
		<div class="form-group">
			<label class="form-label">????</label>
			<RichTextEditor
				:modelValue="content"
				placeholder="????????????..."
				@update:modelValue="store.updateSelfEvaluation($event)"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const content = computed(() => store.activeResume?.selfEvaluationContent || '')
</script>

<style scoped lang="scss">
@use './_panel-common' as *;
</style>
