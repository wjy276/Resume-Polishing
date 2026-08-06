<template>
	<transition name="fade-scale">
		<div v-if="visible" class="dialog-overlay" @click.self="handleClose">
			<div class="dialog-panel">
				<!-- Header -->
				<div class="dialog-header">
					<div class="header-left">
						<span class="bot-avatar">✨</span>
						<div class="header-info">
							<h3>{{ headerTitle }}</h3>
							<span class="subtitle">{{ headerSubtitle }}</span>
						</div>
					</div>
					<button class="close-btn" @click="handleClose" :disabled="loading">×</button>
				</div>

				<div class="dialog-body">
					<!-- 提示词预览（已填写时优先展示） -->
					<div v-if="store.isFilled && !editing" class="prompt-preview">
						<div class="section-title">
							<span>已保存的求职意向提示词</span>
						</div>
						<div class="prompt-box">
							<pre>{{ store.promptText || '暂无提示词内容' }}</pre>
						</div>
						<div class="prompt-actions">
							<button class="btn-secondary" @click="editing = true">修改意向</button>
							<button class="btn-primary" @click="handleConfirm">关闭</button>
						</div>
					</div>

					<!-- 编辑表单 -->
					<div v-else class="form-section">
						<div class="section-title">
							<span class="step-badge">②</span>
							<span>求职意向</span>
							<span v-if="store.isFilled" class="filled-tag">已填写</span>
							<span v-else class="empty-tag">未填写</span>
						</div>

						<div class="questions-list">
							<div class="question-item">
								<div class="question-label">
									<span class="q-icon">📝</span>
									<span>目标岗位</span>
								</div>
								<input
									v-model="form.targetRole"
									type="text"
									class="question-input"
									placeholder="例：Java 后端 / 数据开发实习"
								/>
							</div>
							<div class="question-item">
								<div class="question-label">
									<span class="q-icon">📝</span>
									<span>身份 / 年限</span>
								</div>
								<input
									v-model="form.experienceYear"
									type="text"
									class="question-input"
									placeholder="例：应届生 / 1-3年 / 3-5年"
								/>
							</div>
							<div class="question-item">
								<div class="question-label">
									<span class="q-icon">📝</span>
									<span>目标城市</span>
								</div>
								<input
									v-model="form.targetCities"
									type="text"
									class="question-input"
									placeholder="多个用逗号分隔，例：北京, 上海"
								/>
							</div>
							<div class="question-item">
								<div class="question-label">
									<span class="q-icon">📝</span>
									<span>核心技能</span>
								</div>
								<input
									v-model="form.coreSkills"
									type="text"
									class="question-input"
									placeholder="逗号分隔，例：Java, Spring Boot, MySQL"
								/>
							</div>
							<div class="question-item">
								<div class="question-label">
									<span class="q-icon">📝</span>
									<span>其他补充</span>
								</div>
								<textarea
									v-model="form.extraInfo"
									class="jd-textarea"
									placeholder="项目亮点、期望行业等"
									rows="2"
								></textarea>
							</div>
						</div>

						<!-- JD Input -->
						<div class="section-title jd-section">
							<span class="step-badge">④</span>
							<span>目标岗位 JD（可选）</span>
						</div>
						<div class="jd-input-area">
							<textarea
								v-model="form.jdText"
								class="jd-textarea"
								placeholder="粘贴你想入职的岗位 JD，AI 将针对性优化简历..."
								rows="4"
							></textarea>
							<div class="jd-hint">粘贴后 AI 会解析岗位要求，精准匹配你的简历</div>
						</div>

						<!-- Actions -->
						<div class="qa-actions">
							<button
								v-if="store.isFilled"
								class="btn-secondary"
								@click="editing = false"
							>
								取消修改
							</button>
							<button
								class="btn-primary"
								@click="handleSave"
								:disabled="!canSubmit || loading"
							>
								<span v-if="loading" class="btn-spinner"></span>
								{{ loading ? '保存中...' : '保存' }}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useCareerIntentStore } from '@/stores/careerIntent'

const props = defineProps({
	visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'saved'])

const store = useCareerIntentStore()

const loading = ref(false)
const editing = ref(false)
const firstInput = ref(null)

const form = ref({
	targetRole: '',
	experienceYear: '',
	targetCities: '',
	coreSkills: '',
	extraInfo: '',
	jdText: ''
})

const headerTitle = computed(() => {
	if (store.isFilled && !editing.value) return '求职意向提示词'
	return store.isFilled ? '修改求职意向' : '填写求职意向'
})

const headerSubtitle = computed(() => {
	if (store.isFilled && !editing.value) return '以下是已保存的提示词，将用于后续简历优化'
	return '填写求职方向，AI 将据此优化你的简历'
})

const canSubmit = computed(() => {
	return form.value.targetRole.trim() && form.value.experienceYear.trim()
})

function resetForm() {
	form.value = {
		targetRole: store.targetRole || '',
		experienceYear: store.experienceYear || '',
		targetCities: store.targetCities || '',
		coreSkills: store.coreSkills || '',
		extraInfo: store.extraInfo || '',
		jdText: store.jdText || ''
	}
}

function handleClose() {
	if (!loading.value) {
		emit('update:visible', false)
	}
}

watch(() => props.visible, (val) => {
	if (val) {
		resetForm()
		editing.value = !store.isFilled
		nextTick(() => {
			nextTick(() => {
				firstInput.value?.focus()
			})
		})
	}
})

async function handleSave() {
	if (!canSubmit.value) return

	loading.value = true
	try {
		const result = await store.saveCareerIntent({
			targetRole: form.value.targetRole.trim(),
			experienceYear: form.value.experienceYear.trim(),
			targetCities: form.value.targetCities.trim(),
			coreSkills: form.value.coreSkills.trim(),
			extraInfo: form.value.extraInfo.trim(),
			jdText: form.value.jdText.trim()
		})

		if (!result.success) {
			uni.showToast({ title: result.message || '保存失败', icon: 'none' })
			return
		}

		uni.showToast({ title: '保存成功', icon: 'success' })
		emit('update:visible', false)
		emit('saved')
	} catch (e) {
		console.error('Save career intent failed:', e)
		uni.showToast({ title: '保存失败', icon: 'none' })
	} finally {
		loading.value = false
	}
}

function handleConfirm() {
	// 已填写状态下，仅关闭弹窗，不创建简历
	emit('update:visible', false)
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
	background: var(--bg-card, #fff);
	border-radius: 16px;
	width: 560px;
	max-width: 92vw;
	max-height: 85vh;
	display: flex;
	flex-direction: column;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
	animation: slideUp 0.3s ease;
	overflow: hidden;
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(20px); }
	to { opacity: 1; transform: translateY(0); }
}

.dialog-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 20px;
	border-bottom: 1px solid var(--border-color, #e5e7eb);
	background: linear-gradient(to right, var(--bg-card, #fff), var(--bg-page, #f9fafb));

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.bot-avatar {
		font-size: 28px;
	}

	.header-info {
		h3 {
			font-size: 16px;
			font-weight: 600;
			color: var(--text-primary, #111827);
			margin: 0 0 2px 0;
		}
		.subtitle {
			font-size: 12px;
			color: var(--text-muted, #6b7280);
		}
	}
}

.close-btn {
	border: none;
	background: transparent;
	font-size: 24px;
	color: var(--text-muted, #6b7280);
	cursor: pointer;
	padding: 0;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	transition: all 0.2s;

	&:hover:not(:disabled) {
		background: var(--bg-page, #f3f4f6);
		color: var(--text-primary, #111827);
	}
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}

.dialog-body {
	flex: 1;
	overflow-y: auto;
	padding: 20px;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary, #111827);
	margin-bottom: 12px;

	.step-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: var(--primary-light, #3b82f6);
		color: #fff;
		font-size: 12px;
		font-weight: 600;
	}

	.filled-tag {
		margin-left: auto;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: 11px;
		background: #d1fae5;
		color: #065f46;
	}

	.empty-tag {
		margin-left: auto;
		padding: 2px 8px;
		border-radius: 999px;
		font-size: 11px;
		background: #fee2e2;
		color: #991b1b;
	}
}

.jd-section {
	margin-top: 20px;
}

/* Prompt preview */
.prompt-preview {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.prompt-box {
	background: var(--bg-page, #f9fafb);
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 10px;
	padding: 14px;

	pre {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-size: 13px;
		line-height: 1.6;
		color: var(--text-primary, #111827);
		font-family: inherit;
	}
}

.prompt-actions {
	display: flex;
	gap: 10px;
	justify-content: flex-end;
	margin-top: 8px;
}

/* Form */
.form-section {
	display: flex;
	flex-direction: column;
}

.questions-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-bottom: 8px;
}

.question-item {
	display: flex;
	flex-direction: column;
	gap: 6px;
	padding: 10px 12px;
	border-radius: 10px;
	background: var(--bg-page, #f9fafb);
	border: 1px solid var(--border-color, #e5e7eb);
	transition: all 0.2s;

	.question-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--text-secondary, #374151);
	}

	.q-icon {
		font-size: 12px;
	}
}

.question-input {
	width: 100%;
	min-height: 38px;
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 8px;
	font-size: 13px;
	outline: none;
	background: var(--bg-card, #fff);
	transition: all 0.2s;
	pointer-events: auto;
	overflow: visible;

	&:focus {
		border-color: var(--primary-light, #3b82f6);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	&::placeholder {
		color: var(--text-muted, #9ca3af);
	}
}

/* uni-app H5 穿透：直接作用于原生 input/textarea */
:deep(.question-input),
:deep(.question-input input),
:deep(.jd-textarea),
:deep(.jd-textarea textarea) {
	pointer-events: auto !important;
	user-select: text !important;
	-webkit-user-select: text !important;
	cursor: text !important;
}

:deep(.question-input input) {
	display: block !important;
	width: 100% !important;
	height: 100% !important;
	min-height: 38px !important;
	padding: 8px 10px !important;
	background: transparent !important;
	border: none !important;
	box-sizing: border-box !important;
}

:deep(.jd-textarea) {
	min-height: 80px !important;
}

:deep(.jd-textarea textarea) {
	display: block !important;
	width: 100% !important;
	height: 100% !important;
	padding: 10px 12px !important;
	background: transparent !important;
	border: none !important;
	box-sizing: border-box !important;
	resize: vertical !important;
}

/* JD Input */
.jd-input-area {
	margin-bottom: 16px;
}

.jd-textarea {
	width: 100%;
	min-height: 80px;
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 10px;
	font-size: 13px;
	line-height: 1.5;
	outline: none;
	background: var(--bg-page, #f9fafb);
	transition: all 0.2s;

	&:focus {
		border-color: var(--primary-light, #3b82f6);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
	&::placeholder {
		color: var(--text-muted, #9ca3af);
	}
}

.jd-hint {
	font-size: 11px;
	color: var(--text-muted, #9ca3af);
	margin-top: 6px;
}

/* QA Actions */
.qa-actions {
	display: flex;
	gap: 10px;
	justify-content: flex-end;
	margin-top: 16px;
}

/* Buttons */
.btn-primary {
	padding: 10px 20px;
	background: linear-gradient(135deg, var(--primary-light, #3b82f6), #2563eb);
	color: #fff;
	border: none;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;
	box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}
	&:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
	}
}

.btn-secondary {
	padding: 10px 20px;
	background: var(--bg-page, #f3f4f6);
	color: var(--text-secondary, #374151);
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 10px;
	font-size: 14px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		background: var(--border-color, #e5e7eb);
	}
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
	vertical-align: middle;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>
