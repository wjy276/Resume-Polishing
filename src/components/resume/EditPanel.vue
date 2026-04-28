<template>
	<div class="edit-panel">
		<div v-if="!activeResume" class="empty-state">请先选择简历</div>

		<template v-else>
			<!-- 当前模块标题 -->
			<div class="panel-section-header">
				<span class="section-icon">{{ currentSection?.icon }}</span>
				<span v-if="activeSection === 'basic'" class="section-name primary">{{ currentSection?.title }}</span>
				<input
					v-else
					class="section-name-input"
					:value="currentSection?.title"
					@blur="e => renameSection(e.target.value)"
				/>
			</div>

		<!-- 分区内容 -->
		<component :is="currentPanel" v-if="currentPanel" v-bind="currentPanelProps" />
		</template>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useResumeStore } from '@/stores/resume'

const store = useResumeStore()
const { activeResume } = storeToRefs(store)
const activeSection = computed(() => activeResume.value?.activeSection || 'basic')
const currentSection = computed(() =>
	(activeResume.value?.menuSections || []).find(s => s.id === activeSection.value)
)

const panelMap = {
	basic:          defineAsyncComponent(() => import('./sections/BasicPanel.vue')),
	education:      defineAsyncComponent(() => import('./sections/EducationPanel.vue')),
	experience:     defineAsyncComponent(() => import('./sections/ExperiencePanel.vue')),
	projects:       defineAsyncComponent(() => import('./sections/ProjectPanel.vue')),
	skills:         defineAsyncComponent(() => import('./sections/SkillPanel.vue')),
	selfEvaluation: defineAsyncComponent(() => import('./sections/SelfEvaluationPanel.vue')),
	certificates:   defineAsyncComponent(() => import('./sections/CertificatesPanel.vue')),
}

const CustomPanelComp = defineAsyncComponent(() => import('./sections/CustomPanel.vue'))

const currentPanel = computed(() => {
	const id = activeSection.value
	if (panelMap[id]) return panelMap[id]
	if (id?.startsWith('custom')) return CustomPanelComp
	return panelMap['basic']
})

// Props to pass to dynamic section panels (e.g. sectionId for custom/cert panels)
const currentPanelProps = computed(() => {
	const id = activeSection.value
	if (id?.startsWith('custom') || id === 'certificates') return { sectionId: id }
	return {}
})

function renameSection(title) {
	if (!title.trim()) return
	const sections = (activeResume.value?.menuSections || []).map(s =>
		s.id === activeSection.value ? { ...s, title } : s
	)
	store.updateMenuSections(sections)
}
</script>

<style scoped lang="scss">
.edit-panel {
	height: 100%;
	overflow-y: auto;
	background: #fff;
}

.empty-state {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: #9ca3af;
	font-size: 14px;
}

.panel-section-header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 16px 16px 12px;
	border-bottom: 1px solid #f3f4f6;
	background: #fff;
	position: sticky;
	top: 0;
	z-index: 5;
}

.section-icon { font-size: 16px; }

.section-name {
	font-size: 16px;
	font-weight: 600;
	color: #111827;

	&.primary { color: #2563eb; }
}

.section-name-input {
	flex: 1;
	font-size: 16px;
	font-weight: 600;
	color: #2563eb;
	border: none;
	outline: none;
	background: transparent;
	border-bottom: 1px solid transparent;

	&:focus { border-bottom-color: #2563eb; }
}
</style>
