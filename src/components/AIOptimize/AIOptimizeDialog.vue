<template>
	<transition name="fade-scale">
		<div v-if="visible" class="dialog-overlay" @click.self="handleClose">
			<div class="dialog-panel">
				<div class="dialog-header">
					<div class="header-left">
						<span class="ai-icon">✨</span>
						<h3>AI 简历优化</h3>
					</div>
					<button class="close-btn" @click="handleClose" :disabled="running">×</button>
				</div>

				<div class="dialog-body">
					<div class="field-group">
						<label>优化提示词 <span class="optional">(可修改，描述你的求职方向)</span></label>
						<textarea 
							v-model="prompt" 
							rows="4" 
							placeholder="例：我是一名 Java 后端开发，希望突出项目经验中的高并发和微服务能力…"
							:class="{ 'input-focus': promptFocus }"
							@focus="promptFocus = true"
							@blur="promptFocus = false"
						></textarea>
					</div>

					<div class="field-group">
						<label>目标岗位 JD <span class="optional">(可选，粘贴岗位描述可获得更精准匹配)</span></label>
						<textarea 
							v-model="jdText" 
							rows="5" 
							placeholder="从招聘网站复制完整的岗位描述…"
							:class="{ 'input-focus': jdFocus }"
							@focus="jdFocus = true"
							@blur="jdFocus = false"
						></textarea>
					</div>

					<div class="field-group row">
						<div class="style-field">
							<label>优化风格</label>
							<div class="style-options">
								<button 
									v-for="opt in styleOptions" 
									:key="opt.value"
									class="style-btn"
									:class="{ active: style === opt.value }"
									@click="style = opt.value"
								>
									{{ opt.label }}
								</button>
							</div>
						</div>
					</div>
				</div>

				<div v-if="progressMsg" class="progress-bar">
					<div class="progress-spinner"></div>
					<span>{{ progressMsg }}</span>
				</div>

				<div v-if="resultError" class="result-error" role="alert">
					<span class="error-icon">⚠️</span>
					{{ resultError }}
				</div>

				<div v-if="resultSuccess" class="result-success">
					<span class="success-icon">✓</span>
					优化完成，请到「模块优化」面板查看和确认
				</div>

				<div class="dialog-footer">
					<button class="cancel-btn" @click="handleClose" :disabled="running">取消</button>
					<button class="start-btn" :disabled="running || !canStart" @click="handleStart">
						<span v-if="running" class="btn-spinner"></span>
						{{ running ? '优化中…' : '开始优化' }}
					</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { useResumeStore } from '@/stores/resume'
import { editorResumeToAgentInput } from '@/utils/resume/agentAdapter'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

const aiStore = useAIOptimizeStore()
const resumeStore = useResumeStore()

const prompt = ref('请根据我的简历和目标岗位，进行全面优化。重点突出项目亮点，使用 STAR 法则改写经历，使描述更量化、更有说服力。')
const jdText = ref('')
const style = ref('standard')
const running = ref(false)
const progressMsg = ref('')
const resultError = ref('')
const resultSuccess = ref(false)
const promptFocus = ref(false)
const jdFocus = ref(false)

const styleOptions = [
	{ value: 'conservative', label: '保守' },
	{ value: 'standard', label: '标准' },
	{ value: 'aggressive', label: '激进' },
]

const canStart = computed(() => prompt.value.trim().length > 0)

// Reset state when dialog opens
watch(() => props.visible, (val) => {
	if (val) {
		resultError.value = ''
		resultSuccess.value = false
		progressMsg.value = ''
		running.value = false
	}
})

function handleClose() {
	if (running.value) return
	emit('close')
}

async function handleStart() {
	running.value = true
	progressMsg.value = '准备中…'
	resultError.value = ''
	resultSuccess.value = false

	const resume = resumeStore.activeResume
	if (!resume) {
		resultError.value = '请先创建或打开一份简历'
		running.value = false
		progressMsg.value = ''
		return
	}

	const agentInput = editorResumeToAgentInput(resume)
	const textParts = []
	if (agentInput.name) textParts.push(`姓名：${agentInput.name}`)
	if (agentInput.title) textParts.push(`求职意向：${agentInput.title}`)
	if (agentInput.phone) textParts.push(`电话：${agentInput.phone}`)
	if (agentInput.email) textParts.push(`邮箱：${agentInput.email}`)
	if (agentInput.education?.length) {
		textParts.push('\n【教育背景】')
		agentInput.education.forEach(e => textParts.push(`${e.school} ${e.major} ${e.degree} ${e.startDate}-${e.endDate}`))
	}
	if (agentInput.experience?.length) {
		textParts.push('\n【工作经历】')
		agentInput.experience.forEach(e => textParts.push(`${e.company} ${e.position} ${e.date}\n${e.details}`))
	}
	if (agentInput.projects?.length) {
		textParts.push('\n【项目经历】')
		agentInput.projects.forEach(p => textParts.push(`${p.name} ${p.role} ${p.date}\n${p.description}`))
	}
	if (agentInput.skills) textParts.push(`\n【专业技能】\n${agentInput.skills}`)
	if (agentInput.selfEvaluation) textParts.push(`\n【自我评价】\n${agentInput.selfEvaluation}`)
	const resumeText = textParts.join('\n')

	const sections = resume.menuSections || []
	const moduleIds = sections.filter(s => s.enabled && s.id !== 'basic').map(s => s.id)

	progressMsg.value = '正在全流程优化…'
	const res = await aiStore.runFullOptimization({
		resumeText,
		prompt: prompt.value.trim(),
		jdText: jdText.value.trim(),
		moduleIds: moduleIds.length ? moduleIds : ['summary', 'experience', 'projects', 'skills', 'education'],
	})

	running.value = false
	progressMsg.value = ''

	if (res.success) {
		resultSuccess.value = true
		setTimeout(() => emit('close'), 2000)
	} else {
		resultError.value = res.message || '优化失败'
	}
}
</script>

<style scoped lang="scss">
.fade-scale-enter-active, 
.fade-scale-leave-active { 
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
}
.fade-scale-enter-from, 
.fade-scale-leave-to { 
	opacity: 0; 
	transform: scale(0.95);
}

.dialog-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.45);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10002;
	padding: 20px;
}

.dialog-panel {
	background: var(--bg-card);
	border-radius: var(--radius-lg);
	width: 520px;
	max-width: 90vw;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
	box-shadow: var(--shadow-lg);
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid var(--border-color);
	
	.header-left {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.ai-icon {
		font-size: 20px;
		animation: sparkle 2s ease-in-out infinite;
	}
	
	h3 { 
		font-size: 16px; 
		font-weight: 600; 
		color: var(--text-primary); 
		margin: 0; 
	}
}

@keyframes sparkle {
	0%, 100% { transform: scale(1) rotate(0deg); }
	50% { transform: scale(1.1) rotate(5deg); }
}

.close-btn {
	border: none;
	background: transparent;
	font-size: 24px;
	color: var(--text-muted);
	cursor: pointer;
	padding: 0 4px;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: var(--radius-sm);
	transition: all var(--transition-fast);
	
	&:hover:not(:disabled) { 
		background: var(--bg-page);
		color: var(--text-primary); 
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}

.dialog-body {
	padding: 20px;
	overflow-y: auto;
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.field-group {
	display: flex;
	flex-direction: column;
	gap: 6px;

	label {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-primary);
	}
	.optional {
		font-weight: 400;
		color: var(--text-muted);
		font-size: 12px;
	}

	textarea {
		padding: 12px;
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		font-size: 14px;
		color: var(--text-primary);
		font-family: inherit;
		outline: none;
		resize: vertical;
		transition: all var(--transition-fast);
		background: var(--bg-page);
		
		&:focus { 
			border-color: var(--primary-light); 
			background: var(--bg-card);
			box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		}
		&::placeholder { color: var(--text-muted); }
		
		&.input-focus {
			transform: translateY(-1px);
		}
	}
}

.style-field {
	width: 100%;
	
	label {
		display: block;
		margin-bottom: 8px;
	}
}

.style-options {
	display: flex;
	gap: 8px;
}

.style-btn {
	flex: 1;
	padding: 8px 16px;
	border: 1px solid var(--border-color);
	background: var(--bg-page);
	border-radius: var(--radius-sm);
	font-size: 13px;
	color: var(--text-secondary);
	cursor: pointer;
	transition: all var(--transition-fast);
	
	&:hover {
		border-color: var(--primary-light);
		color: var(--primary-light);
	}
	
	&.active {
		background: var(--primary-light);
		border-color: var(--primary-light);
		color: #fff;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}
}

.progress-bar {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 20px;
	background: rgba(37, 99, 235, 0.08);
	color: var(--primary-light);
	font-size: 13px;
	margin: 0 20px;
	border-radius: var(--radius-sm);
}

.progress-spinner {
	width: 16px;
	height: 16px;
	border: 2px solid var(--primary-light);
	border-top-color: transparent;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}

.btn-spinner {
	display: inline-block;
	width: 14px;
	height: 14px;
	border: 2px solid rgba(255,255,255,0.3);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
	margin-right: 6px;
}

@keyframes spin { 
	to { transform: rotate(360deg); } 
}

.result-error {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 20px;
	background: rgba(239, 68, 68, 0.08);
	color: var(--danger-color);
	font-size: 13px;
	margin: 0 20px;
	border-radius: var(--radius-sm);
	border-left: 3px solid var(--danger-color);
	
	.error-icon {
		font-size: 16px;
	}
}

.result-success {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 12px 20px;
	background: rgba(16, 185, 129, 0.08);
	color: var(--success-color);
	font-size: 13px;
	margin: 0 20px;
	border-radius: var(--radius-sm);
	border-left: 3px solid var(--success-color);
	animation: successPulse 0.5s ease;
	
	.success-icon {
		width: 18px;
		height: 18px;
		background: var(--success-color);
		color: #fff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11px;
		font-weight: bold;
	}
}

@keyframes successPulse {
	0% { transform: scale(0.95); opacity: 0; }
	50% { transform: scale(1.02); }
	100% { transform: scale(1); opacity: 1; }
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 14px 20px;
	border-top: 1px solid var(--border-color);
}

.cancel-btn, .start-btn {
	padding: 8px 20px;
	border-radius: var(--radius-sm);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	border: none;
	transition: all var(--transition-fast);
	
	&:disabled { 
		opacity: 0.5; 
		cursor: not-allowed;
		transform: none !important;
	}
}

.cancel-btn {
	background: var(--bg-page);
	color: var(--text-secondary);
	
	&:hover:not(:disabled) { 
		background: var(--border-color); 
		color: var(--text-primary);
	}
}

.start-btn {
	background: linear-gradient(135deg, var(--primary-light), #3b82f6);
	color: #fff;
	box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	
	&:hover:not(:disabled) { 
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
	}
	&:active:not(:disabled) {
		transform: translateY(0);
	}
}
</style>
