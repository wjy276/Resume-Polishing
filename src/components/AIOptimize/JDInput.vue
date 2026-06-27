<template>
	<div class="jd-input">
		<div class="section-header">
			<h3>目标岗位 JD</h3>
			<p>粘贴你想投递的岗位描述，AI 将解析关键要求</p>
		</div>

		<div class="input-section">
			<textarea
				v-model="jdText"
				class="jd-textarea"
				placeholder="粘贴岗位描述（JD）...&#10;&#10;例如：&#10;岗位职责：&#10;1. 负责公司核心产品的前端开发&#10;2. 参与技术方案设计和性能优化&#10;&#10;任职要求：&#10;1. 本科及以上学历，计算机相关专业&#10;2. 3年以上前端开发经验&#10;3. 精通 Vue/React 框架..."
				rows="12"
			></textarea>

			<div class="input-actions">
				<button
					class="parse-btn"
					@click="handleParse"
					:disabled="!jdText.trim() || aiStore.loading"
				>
					{{ aiStore.loading ? '解析中...' : '解析 JD' }}
				</button>
				<button
					v-if="aiStore.jdStructured"
					class="clear-btn"
					@click="handleClear"
				>
					重新输入
				</button>
			</div>
		</div>

		<div v-if="aiStore.jdStructured" class="jd-result">
			<h4>岗位解析结果</h4>

			<div class="result-section" v-if="aiStore.jdStructured.job_title">
				<span class="label">岗位名称</span>
				<span class="value">{{ aiStore.jdStructured.job_title }}</span>
			</div>

			<div class="result-section" v-if="aiStore.jdStructured.hard_skills?.length">
				<span class="label">硬技能要求</span>
				<div class="skill-list">
					<div
						v-for="(skill, idx) in aiStore.jdStructured.hard_skills"
						:key="idx"
						class="skill-item"
					>
						<span class="skill-name">{{ skill.name || skill }}</span>
						<span v-if="skill.level" class="skill-level">{{ skill.level }}</span>
					</div>
				</div>
			</div>

			<div class="result-section" v-if="aiStore.jdStructured.soft_skills?.length">
				<span class="label">软技能要求</span>
				<div class="tags">
					<span
						v-for="(skill, idx) in aiStore.jdStructured.soft_skills"
						:key="idx"
						class="tag"
					>
						{{ skill.name || skill }}
					</span>
				</div>
			</div>

			<div class="result-section" v-if="aiStore.jdStructured.experience">
				<span class="label">经验要求</span>
				<span class="value">{{ aiStore.jdStructured.experience }}</span>
			</div>

			<div class="result-section" v-if="aiStore.jdStructured.education">
				<span class="label">学历要求</span>
				<span class="value">{{ aiStore.jdStructured.education }}</span>
			</div>

			<div class="result-section" v-if="aiStore.jdStructured.keywords?.length">
				<span class="label">关键词</span>
				<div class="tags">
					<span
						v-for="(kw, idx) in aiStore.jdStructured.keywords.slice(0, 12)"
						:key="idx"
						class="tag keyword"
					>
						{{ kw }}
					</span>
				</div>
			</div>

			<div class="confirm-section">
				<button
					class="confirm-btn"
					@click="handleConfirm"
				>
					确认，进入诊断
				</button>
			</div>
		</div>

		<div v-if="!aiStore.jdStructured" class="quick-tips">
			<h4>小贴士</h4>
			<ul>
				<li>从招聘网站复制完整 JD 效果最佳</li>
				<li>包含岗位职责和任职要求两部分</li>
				<li>AI 会提取关键技能、经验要求等</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'

const aiStore = useAIOptimizeStore()
const jdText = ref(aiStore.jdText || '')

async function handleParse() {
	if (!jdText.value.trim()) return
	const res = await aiStore.runJDAgent(jdText.value)
	if (res.success) {
		aiStore.jdText = jdText.value
	}
}

function handleClear() {
	jdText.value = ''
	aiStore.jdStructured = null
	aiStore.jdText = ''
}

function handleConfirm() {
	aiStore.nextStep()
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$success: #10b981;

.jd-input {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.section-header {
	padding: 20px;
	border-bottom: 1px solid #f3f4f6;

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

.input-section {
	padding: 16px;
}

.jd-textarea {
	width: 100%;
	padding: 14px;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	font-size: 14px;
	line-height: 1.6;
	resize: none;
	outline: none;
	font-family: inherit;
	transition: border-color 0.15s;
	box-sizing: border-box;

	&:focus {
		border-color: $primary;
	}

	&::placeholder {
		color: #9ca3af;
	}
}

.input-actions {
	display: flex;
	gap: 12px;
	margin-top: 12px;
}

.parse-btn {
	flex: 1;
	padding: 12px;
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

.clear-btn {
	padding: 12px 20px;
	background: #f3f4f6;
	color: #374151;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	cursor: pointer;
	transition: background 0.15s;

	&:hover { background: #e5e7eb; }
}

.jd-result {
	margin: 0 16px 16px;
	padding: 16px;
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 12px;

	h4 {
		font-size: 14px;
		font-weight: 600;
		color: #111827;
		margin: 0 0 16px;
	}
}

.result-section {
	margin-bottom: 14px;

	&:last-child { margin-bottom: 0; }

	.label {
		display: block;
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 4px;
	}

	.value {
		font-size: 14px;
		color: #111827;
	}
}

.skill-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.skill-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 6px;

	.skill-name {
		font-size: 13px;
		color: #111827;
	}

	.skill-level {
		font-size: 11px;
		color: #6b7280;
		padding: 2px 6px;
		background: #f3f4f6;
		border-radius: 4px;
	}
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.tag {
	padding: 4px 10px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	font-size: 12px;
	color: #374151;

	&.keyword {
		background: #eff6ff;
		border-color: #bfdbfe;
		color: $primary;
	}
}

.confirm-section {
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid #e5e7eb;
}

.confirm-btn {
	width: 100%;
	padding: 12px;
	background: $success;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover { opacity: 0.9; }
}

.quick-tips {
	margin: 0 16px 16px;
	padding: 16px;
	background: #fffbeb;
	border: 1px solid #fde68a;
	border-radius: 12px;

	h4 {
		font-size: 13px;
		font-weight: 600;
		color: #92400e;
		margin: 0 0 8px;
	}

	ul {
		margin: 0;
		padding-left: 18px;
	}

	li {
		font-size: 12px;
		color: #78350f;
		line-height: 1.6;
	}
}
</style>
