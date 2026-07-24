<template>
	<div class="edit-panel">
		<div v-if="!activeResume" class="empty-state">
			<div class="empty-icon">📝</div>
			<div class="empty-text">请先选择简历</div>
		</div>

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

		<!-- 分区内容（key 强制在切换模块时重新挂载对应面板） -->
		<component
			:is="currentPanel"
			v-if="currentPanel"
			:key="activeSection"
			v-bind="currentPanelProps"
		/>
		</template>
	</div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useResumeStore } from '@/stores/resume'
import { normalizeMenuSection } from '@/utils/resume/serializer'

const store = useResumeStore()
const { activeResume } = storeToRefs(store)
const activeSection = computed(() => activeResume.value?.activeSection || 'basic')
const currentSection = computed(() => {
	const sections = activeResume.value?.menuSections || []
	const normalized = sections.map(normalizeMenuSection).filter(Boolean)
	return normalized.find(s => s.id === activeSection.value)
})

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
	background: var(--bg-card);
	
	&::-webkit-scrollbar {
		width: 5px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background: var(--border-color);
		border-radius: 10px;
	}
	&::-webkit-scrollbar-thumb:hover {
		background: var(--text-muted);
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: var(--text-muted);
	gap: 12px;
	
	.empty-icon {
		font-size: 48px;
		opacity: 0.5;
		animation: pulse 2s ease-in-out infinite;
	}
	
	.empty-text {
		font-size: 14px;
	}
}

@keyframes pulse {
	0%, 100% { opacity: 0.5; transform: scale(1); }
	50% { opacity: 0.8; transform: scale(1.05); }
}

.panel-section-header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 16px 16px 12px;
	border-bottom: 1px solid var(--bg-page);
	background: var(--bg-card);
	position: sticky;
	top: 0;
	z-index: 5;
	transition: all var(--transition-fast);
	
	&:hover {
		background: linear-gradient(to bottom, var(--bg-card), var(--bg-page));
	}
}

.section-icon { 
	font-size: 16px;
	transition: transform 0.2s ease;
	
	&:hover {
		transform: scale(1.2);
	}
}

.section-name {
	font-size: 16px;
	font-weight: 600;
	color: var(--text-primary);
	transition: color var(--transition-fast);

	&.primary { color: var(--primary-light); }
}

.section-name-input {
	flex: 1;
	min-height: 40px;
	padding: 8px 10px;
	font-size: 16px;
	font-weight: 600;
	line-height: 1.45;
	color: var(--primary-light);
	border: 1px solid transparent;
	border-radius: var(--radius-sm);
	outline: none;
	background: transparent;
	box-sizing: border-box;
	transition: all var(--transition-fast);

	&:focus {
		border-color: rgba(59, 130, 246, 0.3);
		background: var(--bg-page);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	
	&:hover:not(:focus) {
		background: var(--bg-page);
	}
}
</style>