<template>
	<div class="profile-form">
		<div class="section-header">
			<h3>求职画像</h3>
			<p>先了解你的方向和目标，再针对性优化简历</p>
		</div>

		<div class="form-section" v-if="!aiStore.careerProfile">
			<div class="form-group">
				<label>目标岗位 <span class="required">*</span></label>
				<input v-model="targetRole" placeholder="例：Java 后端 / 数据开发实习" />
			</div>
			<div class="form-group">
				<label>身份 / 年限</label>
				<select v-model="experienceYear">
					<option value="">请选择</option>
					<option value="应届生">应届生</option>
					<option value="1年以下">1年以下</option>
					<option value="1-3年">1-3年</option>
					<option value="3-5年">3-5年</option>
					<option value="5-10年">5-10年</option>
					<option value="10年以上">10年以上</option>
				</select>
			</div>
			<div class="form-group">
				<label>目标城市 <span class="optional">(多个用逗号分隔)</span></label>
				<input v-model="targetCities" placeholder="例：北京, 上海, 杭州" />
			</div>
			<div class="form-group">
				<label>核心技能 <span class="optional">(逗号分隔)</span></label>
				<input v-model="coreSkills" placeholder="例：Java, Spring Boot, MySQL, Redis" />
			</div>
			<div class="form-group">
				<label>其他补充</label>
				<textarea v-model="extraInfo" placeholder="项目亮点、期望行业、其他你想强调的信息…" rows="3"></textarea>
			</div>
			<button class="submit-btn" :disabled="!targetRole.trim() || aiStore.loading" @click="handleSubmitProfile">
				{{ aiStore.loading ? '提交中…' : '确认方向' }}
			</button>
		</div>

		<div class="divider" v-if="aiStore.careerProfile && !aiStore.jdStructured">
			<span class="divider-text">已确认方向，请输入目标岗位 JD</span>
		</div>

		<div class="jd-section" v-if="aiStore.careerProfile">
			<div class="form-group">
				<label>目标岗位描述（JD）</label>
				<textarea v-model="jdInput" placeholder="从招聘网站复制完整岗位描述…" rows="8"></textarea>
			</div>
			<button class="submit-btn" :disabled="!jdInput.trim() || aiStore.loading" @click="handleParseJD">
				{{ aiStore.loading ? '解析中…' : '解析 JD' }}
			</button>
		</div>

		<div v-if="aiStore.jdStructured" class="jd-result">
			<h4>JD 解析结果</h4>
			<div class="result-grid">
				<div v-if="aiStore.jdStructured.job_title" class="result-item">
					<span class="label">岗位</span>
					<span class="value">{{ aiStore.jdStructured.job_title }}</span>
				</div>
				<div v-if="aiStore.jdStructured.hard_skills?.length" class="result-item">
					<span class="label">硬技能</span>
					<div class="tags">
						<span v-for="s in aiStore.jdStructured.hard_skills" :key="s.name || s" class="tag">{{ s.name || s }}</span>
					</div>
				</div>
				<div v-if="aiStore.jdStructured.soft_skills?.length" class="result-item">
					<span class="label">软技能</span>
					<div class="tags">
						<span v-for="s in aiStore.jdStructured.soft_skills" :key="s.name || s" class="tag">{{ s.name || s }}</span>
					</div>
				</div>
				<div v-if="aiStore.jdStructured.experience" class="result-item">
					<span class="label">经验要求</span>
					<span class="value">{{ aiStore.jdStructured.experience }}</span>
				</div>
				<div v-if="aiStore.jdStructured.education" class="result-item">
					<span class="label">学历要求</span>
					<span class="value">{{ aiStore.jdStructured.education }}</span>
				</div>
			</div>
			<button class="submit-btn primary" :disabled="aiStore.chainRunning" @click="handleStartAnalysis">
				{{ aiStore.chainRunning ? aiStore.chainProgress : '开始分析' }}
			</button>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import { useResumeStore } from '@/stores/resume'

const aiStore = useAIOptimizeStore()
const resumeStore = useResumeStore()

const targetRole = ref(aiStore.profileData?.targetRole || '')
const experienceYear = ref(aiStore.profileData?.experienceYear || '')
const targetCities = ref(aiStore.profileData?.targetCities || '')
const coreSkills = ref(aiStore.profileData?.coreSkills || '')
const extraInfo = ref(aiStore.profileData?.extraInfo || '')
const jdInput = ref(aiStore.jdText || '')

async function handleSubmitProfile() {
	const formData = {
		targetRole: targetRole.value.trim(),
		experienceYear: experienceYear.value,
		targetCities: targetCities.value.split(',').map(s => s.trim()).filter(Boolean),
		coreSkills: coreSkills.value.split(',').map(s => s.trim()).filter(Boolean),
		extraInfo: extraInfo.value.trim(),
	}
	await aiStore.submitProfile(formData)
}

async function handleParseJD() {
	await aiStore.runJDAgent(jdInput.value)
}

async function handleStartAnalysis() {
	const sections = resumeStore.activeResume?.menuSections || []
	const moduleIds = sections.filter(s => s.enabled && s.id !== 'basic').map(s => s.id)
	await aiStore.runPostJDChain(moduleIds.length ? moduleIds : ['summary', 'experience', 'projects', 'skills', 'education'])
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$success: #10b981;
$error: #ef4444;
$border: #e5e7eb;

.profile-form {
	padding: 20px 24px;
	overflow-y: auto;
	flex: 1;
}

.section-header {
	margin-bottom: 24px;
	h3 {
		font-size: 18px;
		font-weight: 600;
		color: #111827;
		margin-bottom: 4px;
	}
	p {
		font-size: 13px;
		color: #6b7280;
	}
}

.divider {
	display: flex;
	align-items: center;
	margin: 28px 0;
	gap: 12px;
	&::before, &::after {
		content: '';
		flex: 1;
		height: 1px;
		background: $border;
	}
}

.divider-text {
	font-size: 13px;
	color: #6b7280;
	white-space: nowrap;
}

.form-section, .jd-section {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.form-group {
	display: flex;
	flex-direction: column;
	gap: 6px;

	label {
		font-size: 13px;
		font-weight: 500;
		color: #374151;
	}
	.required { color: $error; }
	.optional { font-weight: 400; color: #9ca3af; font-size: 12px; }

	input, select, textarea {
		padding: 10px 12px;
		border: 1px solid $border;
		border-radius: 6px;
		font-size: 14px;
		color: #111827;
		background: #fff;
		outline: none;
		transition: border-color 0.2s;
		&:focus {
			border-color: $primary;
		}
		&::placeholder {
			color: #9ca3af;
		}
	}
	textarea {
		resize: vertical;
		font-family: inherit;
		line-height: 1.5;
	}
}

.submit-btn {
	align-self: flex-start;
	padding: 10px 28px;
	background: $primary;
	color: #fff;
	border: none;
	border-radius: 6px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;
	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	&:hover:not(:disabled) {
		opacity: 0.9;
	}
}

.jd-result {
	margin-top: 20px;
	padding: 16px;
	background: #f9fafb;
	border-radius: 8px;
	border: 1px solid $border;

	h4 {
		font-size: 14px;
		font-weight: 600;
		color: #111827;
		margin-bottom: 12px;
	}
}

.result-grid {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.result-item {
	display: flex;
	flex-direction: column;
	gap: 4px;

	.label {
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.value {
		font-size: 14px;
		color: #111827;
	}
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.tag {
	display: inline-block;
	padding: 3px 10px;
	background: #eef2ff;
	color: $primary;
	border-radius: 12px;
	font-size: 12px;
	font-weight: 500;
}
</style>
