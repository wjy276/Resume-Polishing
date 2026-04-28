<template>
	<div class="section-panel">
		<div v-for="exp in experience" :key="exp.id" class="item-card">
			<div class="item-card-header" @click="toggle(exp.id)">
				<div class="card-header-left">
					<span class="company-dot" />
					<span class="item-card-title">{{ exp.company || '新工作经历' }}</span>
					<span v-if="exp.position" class="item-card-sub">· {{ exp.position }}</span>
				</div>
				<div class="item-card-actions">
					<span class="chevron" :class="{ open: expanded === exp.id }">›</span>
					<button class="icon-act-btn del" @click.stop="store.deleteExperience(exp.id)" title="删除">
						<svg viewBox="0 0 14 16" fill="none"><path d="M1 3.5h12M4.5 3.5V2h5v1.5M5.5 6.5v5M8.5 6.5v5M2 3.5l.9 10h8.2l.9-10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
				</div>
			</div>
			<div v-if="expanded === exp.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">公司名称</label>
						<input class="form-input" :value="exp.company" @input="e => store.updateExperience(exp.id, { company: e.target.value })" placeholder="公司名称" />
					</div>
					<div class="form-group">
						<label class="form-label">岗位名称</label>
						<input class="form-input" :value="exp.position" @input="e => store.updateExperience(exp.id, { position: e.target.value })" placeholder="岗位名称" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">在职时间</label>
					<div class="date-range-row">
						<input
							class="form-input date-input"
							type="month"
							:value="getStartDate(exp.date)"
							@input="e => updateDate(exp.id, exp.date, e.target.value, null)"
							placeholder="开始时间"
						/>
						<span class="date-sep">—</span>
						<input
							v-if="!isCurrent(exp.date)"
							class="form-input date-input"
							type="month"
							:value="getEndDate(exp.date)"
							@input="e => updateDate(exp.id, exp.date, null, e.target.value)"
							placeholder="结束时间"
						/>
						<span v-else class="current-badge">至今</span>
						<label class="current-toggle">
							<input type="checkbox" :checked="isCurrent(exp.date)" @change="e => toggleCurrent(exp.id, exp.date, e.target.checked)" />
							<span>至今</span>
						</label>
					</div>
				</div>
				<div class="form-group editor-group">
					<label class="form-label">工作职责</label>
					<RichTextEditor
						:modelValue="exp.details"
						placeholder="描述工作职责与业绩，如：负责 XX 产品功能迭代，提升转化率 20%..."
						@update:modelValue="val => store.updateExperience(exp.id, { details: val })"
					/>
				</div>
			</div>
		</div>
		<button class="add-block-btn" @click="addItem">
			<svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
			添加工作经历
		</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const experience = computed(() => store.activeResume?.experience || [])
const expanded = ref(null)

function toggle(id) {
	expanded.value = expanded.value === id ? null : id
}

function addItem() {
	store.addExperience({ company: '', position: '', date: '', details: '' })
	const list = store.activeResume?.experience || []
	if (list.length) expanded.value = list[list.length - 1].id
}

function getStartDate(date) {
	if (!date) return ''
	return date.split('-至今')[0].split(' - ')[0].trim()
}

function getEndDate(date) {
	if (!date || isCurrent(date)) return ''
	const parts = date.split(' - ')
	return parts[1]?.trim() || ''
}

function isCurrent(date) {
	return date?.includes('至今') || false
}

function buildDate(start, end, current) {
	if (!start) return current ? '至今' : ''
	return current ? `${start} - 至今` : `${start} - ${end || ''}`
}

function updateDate(id, oldDate, newStart, newEnd) {
	const start = newStart !== null ? newStart : getStartDate(oldDate)
	const end = newEnd !== null ? newEnd : getEndDate(oldDate)
	const current = isCurrent(oldDate)
	store.updateExperience(id, { date: buildDate(start, end, current) })
}

function toggleCurrent(id, oldDate, checked) {
	const start = getStartDate(oldDate)
	store.updateExperience(id, { date: buildDate(start, '', checked) })
}
</script>

<style scoped lang="scss">
@use './_panel-common' as *;

.card-header-left {
	display: flex;
	align-items: center;
	gap: 6px;
	flex: 1;
	min-width: 0;
}

.company-dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: #374151;
	flex-shrink: 0;
}

.item-card-sub {
	font-size: 12px;
	color: #9ca3af;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.chevron {
	display: inline-block;
	font-size: 16px;
	color: #9ca3af;
	transform: rotate(90deg);
	transition: transform 0.2s;
	line-height: 1;
	&.open { transform: rotate(270deg); }
}

.icon-act-btn {
	width: 22px;
	height: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: none;
	border-radius: 4px;
	cursor: pointer;
	padding: 0;
	svg { width: 12px; height: 12px; }
	&.del { color: #ef4444; &:hover { background: #fef2f2; } }
}

.date-range-row {
	display: flex;
	align-items: center;
	gap: 6px;

	.date-input { flex: 1; min-width: 0; }
}

.date-sep {
	font-size: 14px;
	color: #9ca3af;
	flex-shrink: 0;
}

.current-badge {
	font-size: 12px;
	color: #2563eb;
	background: #eff6ff;
	border-radius: 4px;
	padding: 4px 8px;
	white-space: nowrap;
	flex-shrink: 0;
}

.current-toggle {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 12px;
	color: #6b7280;
	cursor: pointer;
	white-space: nowrap;
	flex-shrink: 0;
	input[type="checkbox"] { cursor: pointer; accent-color: #2563eb; }
}

.editor-group { padding-bottom: 0; }

.add-block-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	margin: 12px 16px;
	width: calc(100% - 32px);
	padding: 10px;
	background: #1f2937;
	color: #fff;
	border: none;
	border-radius: 8px;
	font-size: 13px;
	cursor: pointer;
	transition: background 0.15s;
	svg { width: 13px; height: 13px; }
	&:hover { background: #374151; }
}
</style>