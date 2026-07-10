<template>
	<transition name="fade">
		<div v-if="visible" class="dialog-overlay" @click.self="handleClose">
			<div class="dialog-panel">
				<div class="dialog-header">
					<h3>AI 简历优化</h3>
					<button class="close-btn" @click="handleClose">×</button>
				</div>

				<div class="dialog-body">
					<div class="field-group">
						<label>优化提示词 <span class="optional">(可修改，描述你的求职方向)</span></label>
						<textarea v-model="prompt" rows="4" placeholder="例：我是一名 Java 后端开发，希望突出项目经验中的高并发和微服务能力…"></textarea>
					</div>

					<div class="field-group">
						<label>目标岗位 JD <span class="optional">(可选，粘贴岗位描述可获得更精准匹配)</span></label>
						<textarea v-model="jdText" rows="5" placeholder="从招聘网站复制完整的岗位描述…"></textarea>
					</div>

					<div class="field-group row">
						<div class="style-field">
							<label>优化风格</label>
							<select v-model="style">
								<option value="conservative">保守</option>
								<option value="standard">标准</option>
								<option value="aggressive">激进</option>
							</select>
						</div>
					</div>
				</div>

				<div v-if="progressMsg" class="progress-bar">
					<div class="progress-spinner"></div>
					<span>{{ progressMsg }}</span>
				</div>

				<div v-if="resultError" class="result-error">{{ resultError }}</div>

				<div v-if="resultSuccess" class="result-success">
					✓ 优化完成，请到「模块优化」面板查看和确认
				</div>

				<div class="dialog-footer">
					<button class="cancel-btn" @click="handleClose" :disabled="running">取消</button>
					<button class="start-btn" :disabled="running" @click="handleStart">
						{{ running ? '优化中…' : '开始优化' }}
					</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { ref, watch } from 'vue'
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
$primary: #2563eb;
$text: #111827;
$text-secondary: #6b7280;
$border: #e5e7eb;
$error: #ef4444;
$success: #10b981;

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.dialog-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.35);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2000;
}

.dialog-panel {
	background: #fff;
	border-radius: 12px;
	width: 520px;
	max-width: 90vw;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}

.dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid $border;
	h3 { font-size: 16px; font-weight: 600; color: $text; margin: 0; }
}

.close-btn {
	border: none;
	background: transparent;
	font-size: 22px;
	color: #9ca3af;
	cursor: pointer;
	padding: 0 4px;
	&:hover { color: $text; }
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
		color: #374151;
	}
	.optional {
		font-weight: 400;
		color: #9ca3af;
		font-size: 12px;
	}

	textarea, select {
		padding: 10px 12px;
		border: 1px solid $border;
		border-radius: 6px;
		font-size: 14px;
		color: $text;
		font-family: inherit;
		outline: none;
		resize: vertical;
		&:focus { border-color: $primary; }
		&::placeholder { color: #9ca3af; }
	}
}

.progress-bar {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 20px;
	background: #f0f4ff;
	color: $primary;
	font-size: 13px;
}

.progress-spinner {
	width: 16px;
	height: 16px;
	border: 2px solid $primary;
	border-top-color: transparent;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.result-error {
	padding: 10px 20px;
	background: #fef2f2;
	color: $error;
	font-size: 13px;
}

.result-success {
	padding: 10px 20px;
	background: #f0fdf4;
	color: $success;
	font-size: 13px;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	padding: 14px 20px;
	border-top: 1px solid $border;
}

.cancel-btn, .start-btn {
	padding: 8px 20px;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	border: none;
	transition: opacity 0.15s;
	&:disabled { opacity: 0.5; cursor: not-allowed; }
}

.cancel-btn {
	background: #f3f4f6;
	color: #374151;
	&:hover:not(:disabled) { background: #e5e7eb; }
}

.start-btn {
	background: $primary;
	color: #fff;
	&:hover:not(:disabled) { opacity: 0.9; }
}
</style>
