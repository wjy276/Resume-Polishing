<template>
	<div class="parse-review">
		<div class="section-header">
			<h3>解析结果校对</h3>
			<p>AI 已解析你的简历，请确认信息是否正确</p>
		</div>

		<div v-if="!aiStore.parsedResumeForEditor" class="empty-state">
			<span class="empty-icon">📄</span>
			<p>请先上传简历文件</p>
			<button class="upload-btn" @click="emit('upload')">上传简历</button>
		</div>

		<template v-else>
			<div class="review-content">
				<!-- 基本信息 -->
				<div class="review-section">
					<h4>基本信息</h4>
					<div class="field-grid">
						<div class="field-item">
							<label>姓名</label>
							<input v-model="editableResume.basic.name" placeholder="姓名" />
						</div>
						<div class="field-item">
							<label>职位</label>
							<input v-model="editableResume.basic.title" placeholder="职位" />
						</div>
						<div class="field-item">
							<label>邮箱</label>
							<input v-model="editableResume.basic.email" placeholder="邮箱" />
						</div>
						<div class="field-item">
							<label>电话</label>
							<input v-model="editableResume.basic.phone" placeholder="电话" />
						</div>
						<div class="field-item">
							<label>所在地</label>
							<input v-model="editableResume.basic.location" placeholder="所在地" />
						</div>
					</div>
				</div>

				<!-- 工作经历 -->
				<div class="review-section" v-if="editableResume.experience?.length">
					<h4>工作经历 ({{ editableResume.experience.length }})</h4>
					<div v-for="(exp, idx) in editableResume.experience" :key="idx" class="item-card">
						<div class="item-header">
							<input v-model="exp.company" placeholder="公司名称" class="item-title-input" />
							<input v-model="exp.position" placeholder="职位" class="item-sub-input" />
						</div>
						<div class="item-date">{{ exp.date }}</div>
						<div class="item-content" v-html="exp.details"></div>
					</div>
				</div>

				<!-- 项目经历 -->
				<div class="review-section" v-if="editableResume.projects?.length">
					<h4>项目经历 ({{ editableResume.projects.length }})</h4>
					<div v-for="(proj, idx) in editableResume.projects" :key="idx" class="item-card">
						<div class="item-header">
							<input v-model="proj.name" placeholder="项目名称" class="item-title-input" />
						</div>
						<div class="item-role">{{ proj.role }}</div>
						<div class="item-date">{{ proj.date }}</div>
						<div class="item-content" v-html="proj.description"></div>
					</div>
				</div>

				<!-- 教育背景 -->
				<div class="review-section" v-if="editableResume.education?.length">
					<h4>教育背景 ({{ editableResume.education.length }})</h4>
					<div v-for="(edu, idx) in editableResume.education" :key="idx" class="item-card">
						<div class="item-header">
							<input v-model="edu.school" placeholder="学校" class="item-title-input" />
							<input v-model="edu.major" placeholder="专业" class="item-sub-input" />
						</div>
						<div class="item-degree">{{ edu.degree }}</div>
						<div class="item-date">{{ edu.startDate }} - {{ edu.endDate || '至今' }}</div>
					</div>
				</div>

				<!-- 技能 -->
				<div class="review-section" v-if="editableResume.skillContent">
					<h4>专业技能</h4>
					<div class="skill-content" v-html="editableResume.skillContent"></div>
				</div>
			</div>

			<div class="review-actions">
				<button class="confirm-btn" @click="handleConfirm">
					确认，继续优化
				</button>
				<button class="reupload-btn" @click="emit('upload')">
					重新上传
				</button>
			</div>
		</template>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAIOptimizeStore } from '@/stores/aiOptimize'

const aiStore = useAIOptimizeStore()
const emit = defineEmits(['upload', 'confirm'])

const editableResume = ref(null)

watch(() => aiStore.parsedResumeForEditor, (val) => {
	if (val) {
		editableResume.value = JSON.parse(JSON.stringify(val))
	}
}, { immediate: true })

function handleConfirm() {
	if (editableResume.value) {
		aiStore.parsedResumeForEditor = editableResume.value
	}
	aiStore.confirmParsedResume()
	emit('confirm')
}
</script>

<style scoped lang="scss">
$primary: #2563eb;
$success: #10b981;

.parse-review {
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

.upload-btn {
	padding: 12px 24px;
	background: linear-gradient(135deg, $primary, #3b82f6);
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover { opacity: 0.9; }
}

.review-content {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
}

.review-section {
	margin-bottom: 20px;

	h4 {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		margin: 0 0 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid #f3f4f6;
	}
}

.field-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

.field-item {
	display: flex;
	flex-direction: column;
	gap: 4px;

	label {
		font-size: 12px;
		color: #6b7280;
	}

	input {
		padding: 8px 12px;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 13px;
		outline: none;
		transition: border-color 0.15s;

		&:focus {
			border-color: $primary;
		}
	}
}

.item-card {
	padding: 12px;
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	margin-bottom: 10px;
}

.item-header {
	display: flex;
	gap: 8px;
	margin-bottom: 6px;
}

.item-title-input {
	flex: 1;
	padding: 6px 10px;
	border: 1px solid #e5e7eb;
	border-radius: 4px;
	font-size: 13px;
	font-weight: 500;
	outline: none;

	&:focus { border-color: $primary; }
}

.item-sub-input {
	flex: 1;
	padding: 6px 10px;
	border: 1px solid #e5e7eb;
	border-radius: 4px;
	font-size: 12px;
	color: #6b7280;
	outline: none;

	&:focus { border-color: $primary; }
}

.item-date, .item-role, .item-degree {
	font-size: 12px;
	color: #6b7280;
	margin-bottom: 4px;
}

.item-content {
	font-size: 12px;
	color: #374151;
	line-height: 1.5;
	margin-top: 8px;
	padding: 8px;
	background: #fff;
	border-radius: 4px;
	max-height: 100px;
	overflow-y: auto;
}

.skill-content {
	padding: 12px;
	background: #f9fafb;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	font-size: 13px;
	line-height: 1.6;
}

.review-actions {
	padding: 16px;
	border-top: 1px solid #f3f4f6;
	display: flex;
	flex-direction: column;
	gap: 10px;
	flex-shrink: 0;
}

.confirm-btn {
	width: 100%;
	padding: 14px;
	background: linear-gradient(135deg, $success, #059669);
	color: #fff;
	border: none;
	border-radius: 10px;
	font-size: 15px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	&:hover { opacity: 0.9; }
}

.reupload-btn {
	width: 100%;
	padding: 12px;
	background: #f3f4f6;
	color: #374151;
	border: none;
	border-radius: 8px;
	font-size: 14px;
	cursor: pointer;
	transition: background 0.15s;

	&:hover { background: #e5e7eb; }
}
</style>
