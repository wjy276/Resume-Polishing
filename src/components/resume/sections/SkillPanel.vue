<template>
	<div class="section-panel">
		<div class="form-group">
			<label class="form-label">????</label>
			<RichTextEditor
				:modelValue="skillContent"
				placeholder="????????????????..."
				@update:modelValue="store.updateSkillContent($event)"
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const skillContent = computed(() => store.activeResume?.skillContent || '')
</script>

<style scoped lang="scss">
@use './_panel-common' as *;
</style>
