<template>
	<div class="diagnosis-report">
		<div class="section-header">
			<h3>诊断分析</h3>
			<p>AI 已分析你的简历与目标岗位的匹配度</p>
		</div>

		<div v-if="!aiStore.diagnosisReport" class="empty-state">
			<span class="empty-icon">📊</span>
			<p>点击下方按钮开始诊断</p>
			<button
				class="start-btn"
				@click="handleStartDiagnosis"
				:disabled="aiStore.loading"
			>
				{{ aiStore.loading ? '诊断中...' : '开始诊断' }}
			</button>
		</div>

		<template v-else>
			<div class="score-section">
				<div class="score-circle" :style="scoreStyle">
					<span class="score-value">{{ matchScore }}</span>
					<span class="score-unit">分</span>
				</div>
				<div class="score-label">
					<span class="label-text">匹配度</span>
					<span class="label-desc" :class="scoreLevel">{{ scoreText }}</span>
				</div>
			</div>

			<div class="report-section" v-if="aiStore.diagnosisReport.matched?.length">
				<h4>
					<span class="section-icon match">✓</span>
					匹配项 ({{ aiStore.diagnosisReport.matched.length }})
				</h4>
				<div class="item-list">
					<div
						v-for="(item, idx) in aiStore.diagnosisReport.matched.slice(0, 5)"
						:key="idx"
						class="item matched"
					>
						<span class="item-text">{{ item.name || item }}</span>
					</div>
				</div>
			</div>

			<div class="report-section" v-if="aiStore.diagnosisReport.gaps?.length">
				<h4>
					<span class="section-icon gap">!</span>
					差距项 ({{ aiStore.diagnosisReport.gaps.length }})
				</h4>
				<div class="item-list">
					<div
						v-for="(item, idx) in aiStore.diagnosisReport.gaps.slice(0, 5)"
						:key="idx"
						class="item gap"
					>
						<span class="item-text">{{ item.name || item }}</span>
						<span v-if="item.suggestion" class="item-suggestion">{{ item.suggestion }}</span>
					</div>
				</div>
			</div>

			<div class="report-section" v-if="aiStore.diagnosisReport.weak_points?.length">
				<h4>
					<span class="section-icon weak">↓</span>
					薄弱点 ({{ aiStore.diagnosisReport.weak_points.length }})
				</h4>
				<div class="item-list">
					<div
						v-for="(item, idx) in aiStore.diagnosisReport.weak_points"
						:key="idx"
						class="item weak"
					>
						<div class="item-header">
							<span class="item-module">{{ getModuleName(item.module) }}</span>
							<span class="item-priority" :class="item.priority">{{ getPriorityText(item.priority) }}</span>
						</div>
						<span class="item-text">{{ item.description || item.name || item }}</span>
						<span v-if="item.evidence" class="item-evidence">
							问题：{{ item.evidence }}
						</span>
						<span v-if="item.suggestion" class="item-suggestion">
							建议：{{ item.suggestion }}
						</span>
					</div>
				</div>
			</div>

			<div class="report-section" v-if="aiStore.diagnosisReport.priority_queue?.length">
				<h4>
					<span class="section-icon priority">★</span>
					优化优先级
				</h4>
				<div class="priority-list">
					<div
						v-for="(item, idx) in aiStore.diagnosisReport.priority_queue"
						:key="idx"
						class="priority-item"
					>
						<span class="priority-rank">{{ idx + 1 }}</span>
						<span class="priority-text">{{ item.module || item.name || item }}</span>
					</div>
				</div>
			</div>

			<div class="action-section">
				<button
					class="optimize-btn"
					@click="handleGoOptimize"
				>
					开始优化
				</button>
			</div>
		</template>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'

const aiStore = useAIOptimizeStore()

const matchScore = computed(() => {
	return aiStore.diagnosisReport?.match_score || 0
})

const scoreLevel = computed(() => {
	const score = matchScore.value
	if (score >= 80) return 'high'
	if (score >= 60) return 'medium'
	return 'low'
})

const scoreText = computed(() => {
	const score = matchScore.value
	if (score >= 80) return '匹配度高'
	if (score >= 60) return '有提升空间'
	return '需要优化'
})

const scoreStyle = computed(() => {
	const score = matchScore.value
	const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
	return {
		'--score-color': color,
		'--score-percent': `${score}%`,
	}
})

function getModuleName(module) {
	const names = {
		experience: '工作经历',
		projects: '项目经历',
		education: '教育背景',
		skills: '专业技能',
		selfEvaluation: '自我评价',
	}
	return names[module] || module
}

function getPriorityText(priority) {
	const texts = {
		high: '高优先',
		medium: '中优先',
		low: '低优先',
	}
	return texts[priority] || priority
}

async function handleStartDiagnosis() {
	await aiStore.runDiagnosisAgent()
}

function handleGoOptimize() {
	aiStore.nextStep()
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$success: #10b981;
$warning: #f59e0b;
$error: #ef4444;

.diagnosis-report {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow-y: auto;
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

.empty-state {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px;

	.empty-icon {
		font-size: 48px;
		margin-bottom: 12px;
	}

	p {
		font-size: 14px;
		color: #6b7280;
		margin-bottom: 20px;
	}
}

.start-btn {
	padding: 12px 32px;
	background: linear-gradient(135deg, $primary, #3b82f6);
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover { opacity: 0.9; }
	&:disabled { opacity: 0.5; cursor: not-allowed; }
}

.score-section {
	display: flex;
	align-items: center;
	gap: 20px;
	padding: 24px;
	background: linear-gradient(135deg, #f0f9ff, #eff6ff);
	margin: 16px;
	border-radius: 16px;
}

.score-circle {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	background: conic-gradient(
		var(--score-color) var(--score-percent),
		#e5e7eb var(--score-percent)
	);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;

	&::before {
		content: '';
		position: absolute;
		inset: 6px;
		background: #fff;
		border-radius: 50%;
	}
}

.score-value {
	position: relative;
	font-size: 24px;
	font-weight: 700;
	color: var(--score-color);
}

.score-unit {
	position: relative;
	font-size: 12px;
	color: #6b7280;
	margin-left: 2px;
}

.score-label {
	display: flex;
	flex-direction: column;
	gap: 4px;

	.label-text {
		font-size: 14px;
		color: #6b7280;
	}

	.label-desc {
		font-size: 16px;
		font-weight: 600;

		&.high { color: $success; }
		&.medium { color: $warning; }
		&.low { color: $error; }
	}
}

.report-section {
	padding: 0 16px 16px;

	h4 {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
		color: #111827;
		margin: 0 0 12px;
	}
}

.section-icon {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 700;

	&.match { background: #d1fae5; color: $success; }
	&.gap { background: #fef3c7; color: $warning; }
	&.weak { background: #fee2e2; color: $error; }
	&.priority { background: #dbeafe; color: $primary; }
}

.item-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.item {
	padding: 12px;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	background: #fff;

	&.matched { border-left: 3px solid $success; }
	&.gap { border-left: 3px solid $warning; }
	&.weak { border-left: 3px solid $error; }
}

.item-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 6px;
}

.item-module {
	font-size: 11px;
	padding: 2px 8px;
	background: #f3f4f6;
	border-radius: 4px;
	color: #6b7280;
}

.item-priority {
	font-size: 11px;
	padding: 2px 8px;
	border-radius: 4px;

	&.high { background: #fee2e2; color: $error; }
	&.medium { background: #fef3c7; color: #92400e; }
	&.low { background: #f3f4f6; color: #6b7280; }
}

.item-text {
	font-size: 13px;
	color: #111827;
	line-height: 1.5;
}

.item-evidence,
.item-suggestion {
	display: block;
	font-size: 12px;
	color: #6b7280;
	margin-top: 4px;
	padding-left: 12px;
	border-left: 2px solid #e5e7eb;
}

.priority-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.priority-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 12px;
	background: #f9fafb;
	border-radius: 8px;
}

.priority-rank {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: $primary;
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 600;
}

.priority-text {
	font-size: 13px;
	color: #374151;
}

.action-section {
	padding: 16px;
	border-top: 1px solid #f3f4f6;
	margin-top: auto;
}

.optimize-btn {
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
}
</style>
