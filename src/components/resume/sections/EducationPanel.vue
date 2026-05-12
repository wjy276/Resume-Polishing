<template>
	<div class="section-panel">
		<div v-for="(edu, idx) in list" :key="edu.id" class="item-card">
			<div class="item-card-header" @click="toggle(edu.id)">
				<div class="card-header-left">
					<span class="company-dot" />
					<span class="item-card-title">{{ edu.school || '新教育经历' }}</span>
					<span v-if="edu.major" class="item-card-sub">· {{ edu.major }}</span>
				</div>
				<div class="item-card-actions">
					<span class="chevron" :class="{ open: expanded === edu.id }">›</span>
					<button class="icon-act-btn" v-if="idx > 0" @click.stop="store.reorderEducation(idx, idx - 1)" title="上移">↑</button>
					<button class="icon-act-btn" v-if="idx < list.length - 1" @click.stop="store.reorderEducation(idx, idx + 1)" title="下移">↓</button>
					<button class="icon-act-btn del" @click.stop="store.deleteEducation(edu.id)" title="删除">
						<svg viewBox="0 0 14 16" fill="none"><path d="M1 3.5h12M4.5 3.5V2h5v1.5M5.5 6.5v5M8.5 6.5v5M2 3.5l.9 10h8.2l.9-10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
				</div>
			</div>
			<div v-if="expanded === edu.id" class="item-card-body">
				<div class="form-group">
					<label class="form-label">学校名称</label>
					<input class="form-input" v-model.trim="edu.school" placeholder="请输入学校名称" />
				</div>
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">专业</label>
						<input class="form-input" v-model.trim="edu.major" placeholder="专业名称" />
					</div>
					<div class="form-group">
						<label class="form-label">学历</label>
						<input class="form-input" v-model.trim="edu.degree" placeholder="本科/硕士" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">在校时间</label>
					<div class="date-range-row">
						<input class="form-input date-input" type="month" v-model="edu.startDate" placeholder="入学时间" />
						<span class="date-sep">—</span>
						<input
							v-if="!edu.isCurrent"
							class="form-input date-input"
							type="month"
							v-model="edu.endDate"
							placeholder="毕业时间"
						/>
						<span v-else class="current-badge">至今</span>
						<label class="current-toggle">
							<input
								type="checkbox"
								:checked="!!edu.isCurrent"
								@change="e => onToggleCurrent(edu, e.target.checked)"
							/>
							<span>至今</span>
						</label>
					</div>
				</div>
				<div class="form-group editor-group">
					<label class="form-label">在校经历</label>
					<RichTextEditor
						v-model="edu.description"
						placeholder="可填写在校获奖、社团经历、主修课程等..."
					/>
				</div>
			</div>
		</div>
		<button class="add-block-btn" @click="addItem">
			<svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
			添加教育经历
		</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const list = computed(() => store.activeResume?.education || [])
const expanded = ref(null)

function toggle(id) { expanded.value = expanded.value === id ? null : id }

function addItem() {
	const id = store.addEducation({
		school: '', major: '', degree: '',
		startDate: '', endDate: '', isCurrent: false, description: '',
	})
	if (id) expanded.value = id
}

function onToggleCurrent(edu, checked) {
	edu.isCurrent = checked
	if (checked) edu.endDate = ''
}
</script>

<style scoped lang="scss">
@use './_panel-common' as *;

.card-header-left {
	display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;
}
.company-dot {
	width: 7px; height: 7px; border-radius: 50%;
	background: #374151; flex-shrink: 0;
}
.item-card-sub { font-size: 12px; color: #9ca3af; }
.chevron {
	display: inline-block; font-size: 16px; color: #9ca3af;
	transform: rotate(90deg); transition: transform 0.2s; line-height: 1;
	&.open { transform: rotate(270deg); }
}
.icon-act-btn {
	width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;
	border: none; background: none; border-radius: 4px; cursor: pointer; padding: 0;
	font-size: 12px; color: #6b7280;
	svg { width: 12px; height: 12px; }
	&:hover { background: #f3f4f6; color: #111827; }
	&.del { color: #ef4444; &:hover { background: #fef2f2; } }
}
.date-range-row {
	display: flex; align-items: center; gap: 6px;
	.date-input { flex: 1; min-width: 0; }
}
.date-sep { font-size: 14px; color: #9ca3af; flex-shrink: 0; }
.current-badge {
	font-size: 12px; color: #2563eb; background: #eff6ff;
	border-radius: 4px; padding: 4px 8px; white-space: nowrap; flex-shrink: 0;
}
.current-toggle {
	display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280;
	cursor: pointer; white-space: nowrap; flex-shrink: 0;
	input[type="checkbox"] { cursor: pointer; accent-color: #2563eb; }
}
.editor-group { padding-bottom: 0; }
.add-block-btn {
	display: flex; align-items: center; justify-content: center; gap: 6px;
	margin: 12px 16px; width: calc(100% - 32px); padding: 10px;
	background: #1f2937; color: #fff; border: none; border-radius: 8px;
	font-size: 13px; cursor: pointer; transition: background 0.15s;
	svg { width: 13px; height: 13px; }
	&:hover { background: #374151; }
}
</style>
