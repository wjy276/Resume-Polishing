<template>
	<transition name="slide-right">
		<div v-if="aiStore.panelVisible" class="ai-optimize-panel">
			<div class="panel-header">
				<div class="header-title">
					<span class="title-icon">✨</span>
					<span>AI 智能优化</span>
				</div>
				<button class="close-btn" @click="aiStore.closePanel()">
					<svg viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
				</button>
			</div>

			<div class="step-progress">
				<div
					v-for="(step, idx) in OPTIMIZE_STEPS"
					:key="step.key"
					class="step-item"
					:class="{
						active: aiStore.currentStep === step.key,
						completed: aiStore.isStepCompleted(step.key),
						clickable: aiStore.canGoToStep(step.key)
					}"
					@click="aiStore.canGoToStep(step.key) && aiStore.goToStep(step.key)"
				>
					<div class="step-dot">
						<span v-if="aiStore.isStepCompleted(step.key)">✓</span>
						<span v-else>{{ step.icon }}</span>
					</div>
					<span class="step-label">{{ step.label }}</span>
					<div v-if="idx < OPTIMIZE_STEPS.length - 1" class="step-line" />
				</div>
			</div>

			<div class="panel-content">
				<div v-if="aiStore.error" class="error-banner">
					<span>{{ aiStore.error }}</span>
					<button @click="aiStore.error = ''">×</button>
				</div>

				<div v-if="aiStore.loading" class="loading-overlay">
					<div class="loading-spinner">
						<div class="spinner-ring"></div>
					</div>
					<span class="loading-text">{{ loadingText }}</span>
				</div>

				<template v-if="!aiStore.sessionId">
					<div class="init-section">
						<h3>开始 AI 优化</h3>
						<p>上传简历或新建简历，AI 将帮你分析并优化</p>
						<div class="init-actions">
							<button class="start-btn primary" @click="handleStartWithUpload">
								📄 上传简历
							</button>
							<button class="start-btn secondary" @click="handleStart">
								✨ 新建优化
							</button>
						</div>
					</div>
				</template>

				<template v-else>
					<ResumeParseReview v-if="aiStore.currentStep === 'parse'" @upload="handleUpload" @confirm="handleParseConfirm" />
					<CareerChat v-else-if="aiStore.currentStep === 'career'" />
					<JDInput v-else-if="aiStore.currentStep === 'jd'" />
					<DiagnosisReport v-else-if="aiStore.currentStep === 'diagnosis'" />
					<ModuleOptimize v-else-if="aiStore.currentStep === 'optimize'" />
					<OptimizeDone v-else-if="aiStore.currentStep === 'done'" />
				</template>
			</div>

			<div class="panel-footer" v-if="aiStore.sessionId && aiStore.currentStep !== 'init'">
				<button
					v-if="aiStore.currentStepIndex > 0"
					class="nav-btn prev"
					@click="aiStore.prevStep()"
				>
					上一步
				</button>
				<div class="footer-spacer"></div>
				<button
					v-if="aiStore.currentStepIndex < OPTIMIZE_STEPS.length - 1"
					class="nav-btn next"
					:disabled="aiStore.loading"
					@click="handleNext"
				>
					下一步
				</button>
				<button
					v-else
					class="nav-btn done"
					@click="handleFinish"
				>
					完成
				</button>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAIOptimizeStore, OPTIMIZE_STEPS } from '@/stores/aiOptimize'
import ResumeParseReview from './ResumeParseReview.vue'
import CareerChat from './CareerChat.vue'
import JDInput from './JDInput.vue'
import DiagnosisReport from './DiagnosisReport.vue'
import ModuleOptimize from './ModuleOptimize.vue'
import OptimizeDone from './OptimizeDone.vue'

const aiStore = useAIOptimizeStore()
const fileInputRef = ref(null)

const loadingText = computed(() => {
	const agentMap = {
		resume_parser: '解析简历中...',
		career_profiler: '分析职业方向...',
		jd_matcher: '解析岗位需求...',
		resume_diagnostician: '诊断简历问题...',
		strategy_planner: '制定优化策略...',
		module_optimizer: '优化模块内容...',
		fact_checker: '校验事实信息...',
	}
	return agentMap[aiStore.loadingAgent] || 'AI 处理中...'
})

async function handleStart() {
	const res = await aiStore.initSession(true, '')
	if (res.success) {
		aiStore.goToStep('parse')
	}
}

async function handleStartWithUpload() {
	const res = await aiStore.initSession(true, '')
	if (res.success) {
		aiStore.goToStep('parse')
		setTimeout(() => handleUpload(), 100)
	}
}

function handleUpload() {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = '.pdf,.doc,.docx,.txt'
	input.onchange = async (e) => {
		const file = e.target.files[0]
		if (file) {
			await aiStore.uploadAndParse(file)
		}
	}
	input.click()
}

function handleParseConfirm() {
	aiStore.goToStep('career')
}

async function handleNext() {
	const step = aiStore.currentStep
	if (step === 'parse' && !aiStore.parseConfirmed) {
		aiStore.error = '请先确认解析结果'
		return
	}
	if (step === 'career' && !aiStore.careerProfile) {
		aiStore.error = '请先完成职业方向分析'
		return
	}
	if (step === 'jd' && !aiStore.jdStructured) {
		aiStore.error = '请先输入目标岗位 JD'
		return
	}
	if (step === 'diagnosis' && !aiStore.diagnosisReport) {
		aiStore.error = '请先完成诊断分析'
		return
	}
	aiStore.nextStep()
}

function handleFinish() {
	aiStore.closePanel()
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$primary-light: #3b82f6;
$success: #10b981;
$warning: #f59e0b;
$error: #ef4444;

.ai-optimize-panel {
	position: fixed;
	top: 0;
	right: 0;
	width: 420px;
	height: 100vh;
	background: #fff;
	box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
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

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid #e5e7eb;
	flex-shrink: 0;
}

.header-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 16px;
	font-weight: 600;
	color: #111827;
}

.title-icon {
	font-size: 20px;
}

.close-btn {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	color: #6b7280;
	border-radius: 6px;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;

	svg { width: 14px; height: 14px; }
	&:hover { background: #f3f4f6; color: #111827; }
}

.step-progress {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid #f3f4f6;
	flex-shrink: 0;
}

.step-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: relative;
	flex: 1;

	&.clickable { cursor: pointer; }
}

.step-dot {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	background: #f3f4f6;
	color: #6b7280;
	border: 2px solid #e5e7eb;
	transition: all 0.2s;

	.step-item.active & {
		background: $primary;
		color: #fff;
		border-color: $primary;
	}

	.step-item.completed & {
		background: $success;
		color: #fff;
		border-color: $success;
	}
}

.step-label {
	font-size: 11px;
	color: #6b7280;
	margin-top: 4px;
	white-space: nowrap;

	.step-item.active & {
		color: $primary;
		font-weight: 600;
	}

	.step-item.completed & {
		color: $success;
	}
}

.step-line {
	position: absolute;
	top: 16px;
	left: calc(50% + 20px);
	right: calc(-50% + 20px);
	height: 2px;
	background: #e5e7eb;

	.step-item.completed & {
		background: $success;
	}
}

.panel-content {
	flex: 1;
	overflow-y: auto;
	position: relative;
}

.loading-overlay {
	position: absolute;
	inset: 0;
	background: rgba(255, 255, 255, 0.9);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.loading-spinner {
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.spinner-ring {
	width: 40px;
	height: 40px;
	border: 3px solid #e5e7eb;
	border-top-color: $primary;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	margin-top: 12px;
	font-size: 14px;
	color: #6b7280;
}

.error-banner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: #fef2f2;
	border-bottom: 1px solid #fecaca;
	color: $error;
	font-size: 13px;

	button {
		border: none;
		background: transparent;
		color: $error;
		font-size: 18px;
		cursor: pointer;
		padding: 0 4px;
	}
}

.init-section {
	padding: 40px 24px;
	text-align: center;

	h3 {
		font-size: 18px;
		font-weight: 600;
		color: #111827;
		margin-bottom: 8px;
	}

	p {
		font-size: 14px;
		color: #6b7280;
		margin-bottom: 24px;
	}
}

.init-actions {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.start-btn {
	padding: 12px 32px;
	border: none;
	border-radius: 8px;
	font-size: 15px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s, transform 0.15s;

	&.primary {
		background: linear-gradient(135deg, $primary, $primary-light);
		color: #fff;
	}

	&.secondary {
		background: #f3f4f6;
		color: #374151;
	}

	&:hover { opacity: 0.9; }
	&:active { transform: scale(0.98); }
}

.panel-footer {
	display: flex;
	align-items: center;
	padding: 16px 20px;
	border-top: 1px solid #e5e7eb;
	flex-shrink: 0;
}

.footer-spacer {
	flex: 1;
}

.nav-btn {
	padding: 10px 20px;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;

	&.prev {
		background: #f3f4f6;
		color: #374151;

		&:hover { background: #e5e7eb; }
	}

	&.next, &.done {
		background: linear-gradient(135deg, $primary, $primary-light);
		color: #fff;

		&:hover { opacity: 0.9; }
		&:disabled { opacity: 0.5; cursor: not-allowed; }
	}
}
</style>
