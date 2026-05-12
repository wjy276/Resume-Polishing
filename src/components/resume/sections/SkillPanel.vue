<template>
	<div class="section-panel">
		<div class="form-group">
			<label class="form-label">专业技能</label>
			<!-- 直接绑定 store 上的 reactive 属性 → 编辑器与右侧预览天然同步 -->
			<RichTextEditor
				v-model="content"
				placeholder="列出你掌握的技术栈、工具、语言等，建议分类列举..."
			/>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()

// 用 getter/setter 的 computed 实现 v-model 双向绑定 store 字段
const content = computed({
	get: () => store.activeResume?.skillContent || '',
	set: (val) => {
		if (store.activeResume) store.activeResume.skillContent = val
	},
})
</script>

<style scoped lang="scss">
@use './_panel-common' as *;
</style>
