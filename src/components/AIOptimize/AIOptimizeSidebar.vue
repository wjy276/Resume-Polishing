<template>
	<transition name="slide-right">
		<div v-if="visible" class="ai-optimize-sidebar">
			<div class="sidebar-header">
				<h3>AI 智能优化</h3>
				<button class="close-btn" @click="$emit('close')">×</button>
			</div>

			<div class="sidebar-content">
				<!-- 全量优化按钮 -->
				<div class="full-optimize-section">
					<button
						class="full-optimize-btn"
						@click="handleFullOptimize"
						:disabled="isOptimizing"
					>
						{{ isOptimizing ? '全量优化中...' : '全量优化（所有模块）' }}
					</button>
				</div>

				<!-- 优化风格选择 -->
				<div class="style-selector">
					<label>优化风格：</label>
					<div class="style-options">
						<button
							v-for="style in styles"
							:key="style.value"
							class="style-btn"
							:class="{ active: selectedStyle === style.value }"
							@click="selectedStyle = style.value"
						>
							{{ style.label }}
						</button>
					</div>
				</div>

				<!-- 模块列表 -->
				<div class="module-list">
					<div
						v-for="module in modules"
						:key="module.key"
						class="module-card"
						:class="{ 
							optimizing: optimizingModules.includes(module.key),
							hasResult: moduleResults[module.key]
						}"
					>
						<div class="module-header">
							<span class="module-icon">{{ module.icon }}</span>
							<span class="module-name">{{ module.name }}</span>
							<button
								class="optimize-btn"
								@click="handleOptimizeModule(module.key)"
								:disabled="optimizingModules.includes(module.key)"
							>
								{{ optimizingModules.includes(module.key) ? '优化中...' : 'AI 优化' }}
							</button>
						</div>

						<!-- 优化结果对比 -->
						<div v-if="moduleResults[module.key]" class="module-result">
							<div class="result-section original">
								<div class="result-label">优化前</div>
								<div class="result-content" v-html="moduleResults[module.key].original"></div>
							</div>
							<div class="result-section optimized">
								<div class="result-label">优化后</div>
								<div class="result-content" v-html="moduleResults[module.key].optimized"></div>
								<div class="result-actions">
									<button class="apply-btn" @click="handleApply(module.key)">
										应用
									</button>
									<button class="discard-btn" @click="handleDiscard(module.key)">
										放弃
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { useResumeStore } from '@/stores/resume'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['close'])

const aiStore = useAIOptimizeStore()
const resumeStore = useResumeStore()

const selectedStyle = ref('standard')
const optimizingModules = ref([])
const moduleResults = ref({})
const isOptimizing = ref(false)

const styles = [
	{ value: 'conservative', label: '保守' },
	{ value: 'standard', label: '标准' },
	{ value: 'aggressive', label: '激进' },
]

const modules = [
	{ key: 'summary', name: '个人简介', icon: '📝' },
	{ key: 'experience', name: '工作经历', icon: '💼' },
	{ key: 'projects', name: '项目经历', icon: '🚀' },
	{ key: 'skills', name: '技能列表', icon: '⚡' },
	{ key: 'education', name: '教育背景', icon: '🎓' },
	{ key: 'certifications', name: '证书资质', icon: '🏆' },
]

async function handleOptimizeModule(moduleKey) {
	if (optimizingModules.value.includes(moduleKey)) return

	optimizingModules.value.push(moduleKey)

	try {
		// 获取当前模块的原始内容
		const originalContent = getModuleContent(moduleKey)

		// 调用AI优化Agent（按场景2：只优化指定模块）
		const result = await aiStore.optimizeModule(moduleKey, {
			modules: [moduleKey],  // 只优化当前模块
		})

		if (result.success) {
			moduleResults.value[moduleKey] = {
				original: originalContent,
				optimized: result.data,
			}
		} else {
			uni.showToast({ title: result.message || '优化失败', icon: 'none' })
		}
	} catch (e) {
		console.error(`优化${moduleKey}失败:`, e)
		uni.showToast({ title: '优化失败', icon: 'none' })
	} finally {
		optimizingModules.value = optimizingModules.value.filter(m => m !== moduleKey)
	}
}

function getModuleContent(moduleKey) {
	const resume = resumeStore.activeResume
	if (!resume) return ''

	switch (moduleKey) {
		case 'summary':
			return resume.selfEvaluationContent || ''
		case 'experience':
			return resume.experience?.map(exp => 
				`${exp.company} - ${exp.position}\n${exp.date}\n${exp.details}`
			).join('\n\n') || ''
		case 'projects':
			return resume.projects?.map(proj => 
				`${proj.name} - ${proj.role}\n${proj.date}\n${proj.description}`
			).join('\n\n') || ''
		case 'skills':
			return resume.skillContent || ''
		case 'education':
			return resume.education?.map(edu => 
				`${edu.school} - ${edu.major}\n${edu.degree}\n${edu.startDate} - ${edu.endDate}`
			).join('\n\n') || ''
		case 'certifications':
			return resume.customData?.certifications?.map(cert => 
				`${cert.name}\n${cert.issuer}\n${cert.date}`
			).join('\n\n') || ''
		default:
			return ''
	}
}

function handleApply(moduleKey) {
	const result = moduleResults.value[moduleKey]
	if (!result) return

	// 应用优化结果到简历
	resumeStore.applyOptimizedModule(moduleKey, result.optimized)
	
	// 移除结果
	delete moduleResults.value[moduleKey]
	
	uni.showToast({ title: '已应用优化', icon: 'success' })
}

function handleDiscard(moduleKey) {
	delete moduleResults.value[moduleKey]
}

// 全量优化（场景1：首次优化）
async function handleFullOptimize() {
	if (isOptimizing.value) return

	isOptimizing.value = true

	try {
		// 调用AI优化Agent（按场景1：全量优化）
		const result = await aiStore.optimizeModule('all', {
			// 不指定 modules，让后端按 Agent 4 的计划优化
		})

		if (result.success) {
			// 解析返回的多个模块结果
			const modules = result.data
			if (typeof modules === 'object' && !Array.isArray(modules)) {
				// 后端返回的是 { summary: "...", experience: "...", ... } 格式
				for (const [key, content] of Object.entries(modules)) {
					const originalContent = getModuleContent(key)
					moduleResults.value[key] = {
						original: originalContent,
						optimized: content,
					}
				}
			}
			uni.showToast({ title: '全量优化完成', icon: 'success' })
		} else {
			uni.showToast({ title: result.message || '优化失败', icon: 'none' })
		}
	} catch (e) {
		console.error('全量优化失败:', e)
		uni.showToast({ title: '优化失败', icon: 'none' })
	} finally {
		isOptimizing.value = false
	}
}
</script>

<style scoped lang="scss">
.ai-optimize-sidebar {
	position: fixed;
	top: 0;
	right: 0;
	width: 400px;
	height: 100vh;
	background: #fff;
	box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
	z-index: 1000;
	display: flex;
	flex-direction: column;
}

.slide-right-enter-active,
.slide-right-leave-active {
	transition: transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
	transform: translateX(100%);
}

.sidebar-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 20px;
	border-bottom: 1px solid #e5e7eb;

	h3 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #6b7280;

		&:hover {
			color: #111827;
		}
	}
}

.sidebar-content {
	flex: 1;
	overflow-y: auto;
	padding: 20px;
}

.style-selector {
	margin-bottom: 24px;

	label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 8px;
	}

	.style-options {
		display: flex;
		gap: 8px;
	}

	.style-btn {
		flex: 1;
		padding: 8px 12px;
		border: 1px solid #d1d5db;
		background: #fff;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			border-color: #3b82f6;
			color: #3b82f6;
		}

		&.active {
			background: #3b82f6;
			border-color: #3b82f6;
			color: #fff;
		}
	}
}

.module-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.module-card {
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	overflow: hidden;
	transition: all 0.2s;

	&.optimizing {
		border-color: #3b82f6;
	}

	&.hasResult {
		border-color: #10b981;
	}
}

.module-header {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	background: #f9fafb;

	.module-icon {
		font-size: 20px;
	}

	.module-name {
		flex: 1;
		font-size: 14px;
		font-weight: 500;
	}

	.optimize-btn {
		padding: 6px 12px;
		background: #3b82f6;
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #2563eb;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}

.module-result {
	padding: 16px;
	border-top: 1px solid #e5e7eb;
}

.result-section {
	margin-bottom: 16px;

	&:last-child {
		margin-bottom: 0;
	}

	.result-label {
		font-size: 12px;
		font-weight: 600;
		color: #6b7280;
		margin-bottom: 8px;
	}

	.result-content {
		padding: 12px;
		background: #f9fafb;
		border-radius: 6px;
		font-size: 13px;
		line-height: 1.6;
		white-space: pre-wrap;
	}

	&.optimized {
		.result-content {
			background: #ecfdf5;
			border: 1px solid #10b981;
		}
	}
}

.result-actions {
	display: flex;
	gap: 8px;
	margin-top: 12px;

	.apply-btn {
		flex: 1;
		padding: 8px;
		background: #10b981;
		color: #fff;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #059669;
		}
	}

	.discard-btn {
		flex: 1;
		padding: 8px;
		background: #fff;
		color: #6b7280;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 13px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #f9fafb;
			border-color: #9ca3af;
		}
	}
}
</style>
