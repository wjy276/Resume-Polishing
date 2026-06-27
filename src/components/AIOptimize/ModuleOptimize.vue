<template>
	<div class="module-optimize">
		<div class="section-header">
			<h3>分模块优化</h3>
			<p>选择要优化的模块，AI 将根据诊断结果进行针对性优化</p>
		</div>

		<div class="style-selector">
			<span class="label">优化风格</span>
			<div class="style-options">
				<button
					v-for="s in styles"
					:key="s.key"
					class="style-btn"
					:class="{ active: selectedStyle === s.key }"
					@click="selectedStyle = s.key"
				>
					{{ s.label }}
				</button>
			</div>
		</div>

		<div class="module-list">
			<div
				v-for="mod in modules"
				:key="mod.id"
				class="module-card"
				:class="{ optimizing: optimizingModule === mod.id, done: aiStore.moduleResults[mod.id] }"
			>
				<div class="module-header" @click="toggleModule(mod.id)">
					<div class="module-info">
						<span class="module-icon">{{ mod.icon }}</span>
						<span class="module-name">{{ mod.title }}</span>
						<span v-if="getModulePriority(mod.id)" class="module-priority" :class="getModulePriority(mod.id)">
							{{ getPriorityLabel(getModulePriority(mod.id)) }}
						</span>
					</div>
					<div class="module-actions">
						<span v-if="aiStore.moduleResults[mod.id]" class="status done">✓</span>
						<span v-else-if="optimizingModule === mod.id" class="status loading">...</span>
						<span class="chevron" :class="{ open: expandedModule === mod.id }">›</span>
					</div>
				</div>

				<div v-if="expandedModule === mod.id" class="module-body">
					<div v-if="aiStore.moduleResults[mod.id]" class="result-preview">
						<div class="result-header">
							<span>优化结果</span>
							<div class="result-actions">
								<button class="action-link" @click.stop="handleApply(mod.id)">
									应用到简历
								</button>
								<button class="action-link redo" @click.stop="handleOptimize(mod.id)">
									重新优化
								</button>
							</div>
						</div>
						<div class="result-content" v-html="aiStore.moduleResults[mod.id]?.optimized_html || '暂无结果'"></div>
						<div v-if="aiStore.moduleResults[mod.id]?.change_summary?.length" class="change-summary">
							<span class="summary-label">改动说明：</span>
							<ul>
								<li v-for="(c, i) in aiStore.moduleResults[mod.id].change_summary" :key="i">
									{{ c }}
								</li>
							</ul>
						</div>
					</div>

					<button
						v-else
						class="optimize-module-btn"
						@click.stop="handleOptimize(mod.id)"
						:disabled="aiStore.loading"
					>
						{{ aiStore.loading && optimizingModule === mod.id ? '优化中...' : '优化此模块' }}
					</button>
				</div>
			</div>
		</div>

		<div class="batch-actions">
			<button
				class="batch-btn"
				@click="handleOptimizeAll"
				:disabled="aiStore.loading"
			>
				{{ aiStore.loading ? '优化中...' : '一键优化全部' }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { useResumeStore } from '@/stores/resume'

const aiStore = useAIOptimizeStore()
const resumeStore = useResumeStore()

const selectedStyle = ref('standard')
const optimizingModule = ref('')
const expandedModule = ref('')

const styles = [
	{ key: 'conservative', label: '保守' },
	{ key: 'standard', label: '标准' },
	{ key: 'aggressive', label: '激进' },
]

const modules = computed(() => {
	const menuSections = resumeStore.activeResume?.menuSections || []
	return menuSections
		.filter(s => s.enabled && s.id !== 'basic')
		.map(s => ({
			id: s.id,
			icon: s.icon || '📝',
			title: s.title || s.id,
		}))
})

function getModulePriority(moduleId) {
	const queue = aiStore.diagnosisReport?.priority_queue || []
	const idx = queue.findIndex(q => (q.module || q.name || q) === moduleId)
	if (idx < 0) return null
	if (idx === 0) return 'high'
	if (idx < 3) return 'medium'
	return 'low'
}

function getPriorityLabel(priority) {
	const labels = { high: '高优先', medium: '中', low: '低' }
	return labels[priority] || priority
}

function toggleModule(moduleId) {
	expandedModule.value = expandedModule.value === moduleId ? '' : moduleId
}

async function handleOptimize(moduleId) {
	optimizingModule.value = moduleId
	expandedModule.value = moduleId
	const res = await aiStore.runModuleOptimizer(moduleId, selectedStyle.value)
	optimizingModule.value = ''
	return res
}

async function handleOptimizeAll() {
	for (const mod of modules.value) {
		if (!aiStore.moduleResults[mod.id]) {
			await handleOptimize(mod.id)
		}
	}
}

function handleApply(moduleId) {
	const result = aiStore.moduleResults[moduleId]
	if (!result?.optimized_html) return

	resumeStore.applyOptimizedModule(moduleId, result.optimized_html)
	uni.showToast({ title: '已应用到简历', icon: 'success' })
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$success: #10b981;
$warning: #f59e0b;
$error: #ef4444;

.module-optimize {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.section-header {
	padding: 20px;
	border-bottom: 1px solid #f3f4f6;
	flex-shrink: 0;

	h3 {
		font-size: 16px;
		font-weight: 600;
		color: #111827;
		margin: 0 0 4px;
	}

	p {
		font-size: 13px;
		color: #6b7280;
		margin: 0;
	}
}

.style-selector {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 20px;
	border-bottom: 1px solid #f3f4f6;

	.label {
		font-size: 13px;
		color: #6b7280;
		flex-shrink: 0;
	}
}

.style-options {
	display: flex;
	gap: 6px;
}

.style-btn {
	padding: 6px 14px;
	border: 1px solid #e5e7eb;
	border-radius: 16px;
	background: #fff;
	font-size: 12px;
	color: #374151;
	cursor: pointer;
	transition: all 0.15s;

	&:hover { border-color: $primary; color: $primary; }
	&.active {
		background: $primary;
		border-color: $primary;
		color: #fff;
	}
}

.module-list {
	flex: 1;
	overflow-y: auto;
	padding: 12px 16px;
}

.module-card {
	margin-bottom: 10px;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	background: #fff;
	overflow: hidden;
	transition: border-color 0.15s;

	&.done { border-color: #a7f3d0; }
	&.optimizing { border-color: $primary; }
}

.module-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 16px;
	cursor: pointer;
	transition: background 0.15s;

	&:hover { background: #f9fafb; }
}

.module-info {
	display: flex;
	align-items: center;
	gap: 8px;
}

.module-icon {
	font-size: 18px;
}

.module-name {
	font-size: 14px;
	font-weight: 500;
	color: #111827;
}

.module-priority {
	font-size: 10px;
	padding: 2px 6px;
	border-radius: 4px;

	&.high { background: #fee2e2; color: $error; }
	&.medium { background: #fef3c7; color: #92400e; }
	&.low { background: #f3f4f6; color: #6b7280; }
}

.module-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status {
	font-size: 14px;

	&.done { color: $success; }
	&.loading { color: $primary; }
}

.chevron {
	font-size: 18px;
	color: #9ca3af;
	transition: transform 0.2s;

	&.open { transform: rotate(90deg); }
}

.module-body {
	padding: 0 16px 16px;
	border-top: 1px solid #f3f4f6;
}

.result-preview {
	margin-top: 12px;
}

.result-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;

	span {
		font-size: 13px;
		font-weight: 500;
		color: #374151;
	}
}

.result-actions {
	display: flex;
	gap: 12px;
}

.action-link {
	font-size: 12px;
	color: $primary;
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;

	&:hover { text-decoration: underline; }
	&.redo { color: #6b7280; }
}

.result-content {
	padding: 12px;
	background: #f9fafb;
	border-radius: 8px;
	font-size: 13px;
	line-height: 1.6;
	color: #374151;
	max-height: 150px;
	overflow-y: auto;
}

.change-summary {
	margin-top: 8px;
	padding: 10px 12px;
	background: #eff6ff;
	border-radius: 8px;

	.summary-label {
		font-size: 12px;
		color: #1e40af;
		font-weight: 500;
	}

	ul {
		margin: 4px 0 0;
		padding-left: 16px;
	}

	li {
		font-size: 12px;
		color: #1e40af;
		line-height: 1.5;
	}
}

.optimize-module-btn {
	width: 100%;
	margin-top: 12px;
	padding: 10px;
	background: #f3f4f6;
	color: #374151;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.15s;

	&:hover { background: #e5e7eb; }
	&:disabled { opacity: 0.5; cursor: not-allowed; }
}

.batch-actions {
	padding: 16px;
	border-top: 1px solid #f3f4f6;
	flex-shrink: 0;
}

.batch-btn {
	width: 100%;
	padding: 14px;
	background: linear-gradient(135deg, $primary, #3b82f6);
	color: #fff;
	border: none;
	border-radius: 10px;
	font-size: 15px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover { opacity: 0.9; }
	&:disabled { opacity: 0.5; cursor: not-allowed; }
}
</style>
