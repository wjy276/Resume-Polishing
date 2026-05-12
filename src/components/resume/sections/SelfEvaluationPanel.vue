<template>
	<div class="section-panel">
		<div class="form-group">
			<label class="form-label">自我评价</label>
			<RichTextEditor
				v-model="content"
				placeholder="简明扼要地写出你的优势、性格、求职意向等..."
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()

const content = computed({
	get: () => store.activeResume?.selfEvaluationContent || '',
	set: (val) => {
		if (store.activeResume) store.activeResume.selfEvaluationContent = val
	},
})
</script>

<style scoped lang="scss">
@use './_panel-common' as *;
</style>
