<template>
	<div class="section-panel">
		<div
			v-for="(exp, idx) in list"
			:key="exp.id"
			class="item-card"
			v-memo="[exp.id, exp.company, exp.position, exp.date, exp.details, expanded === exp.id, idx, list.length]"
		>
			<div class="item-card-header" @click="toggle(exp.id)">
				<div class="card-header-left">
					<span class="company-dot" />
					<span class="item-card-title">{{ exp.company || '新工作经历' }}</span>
					<span v-if="exp.position" class="item-card-sub">· {{ exp.position }}</span>
				</div>
				<div class="item-card-actions">
					<span class="chevron" :class="{ open: expanded === exp.id }">›</span>
					<button class="icon-act-btn" v-if="idx > 0" @click.stop="store.reorderExperience(idx, idx - 1)" title="上移">↑</button>
					<button class="icon-act-btn" v-if="idx < list.length - 1" @click.stop="store.reorderExperience(idx, idx + 1)" title="下移">↓</button>
					<button class="icon-act-btn del" @click.stop="store.deleteExperience(exp.id)" title="删除">
						<svg viewBox="0 0 14 16" fill="none"><path d="M1 3.5h12M4.5 3.5V2h5v1.5M5.5 6.5v5M8.5 6.5v5M2 3.5l.9 10h8.2l.9-10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
				</div>
			</div>
			<div v-if="expanded === exp.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">公司名称</label>
						<input class="form-input" v-model.trim="exp.company" placeholder="公司名称" />
					</div>
					<div class="form-group">
						<label class="form-label">岗位名称</label>
						<input class="form-input" v-model.trim="exp.position" placeholder="岗位名称" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">在职时间</label>
					<div class="date-range-row">
						<input
							class="form-input date-input"
							type="month"
							:value="getStart(exp.date)"
							@input="e => exp.date = build(e.target.value, getEnd(exp.date), isCur(exp.date))"
							placeholder="开始时间"
						/>
						<span class="date-sep">—</span>
						<input
							v-if="!isCur(exp.date)"
							class="form-input date-input"
							type="month"
							:value="getEnd(exp.date)"
							@input="e => exp.date = build(getStart(exp.date), e.target.value, false)"
							placeholder="结束时间"
						/>
						<span v-else class="current-badge">至今</span>
						<!-- <label class="current-toggle">
							<input
								type="checkbox"
								:checked="isCur(exp.date)"
								@change="e => exp.date = build(getStart(exp.date), '', e.target.checked)"
							/>
							<span>至今</span>
						</label> -->
					</div>
				</div>
				<div class="form-group editor-group">
					<label class="form-label">工作职责</label>
					<RichTextEditor
						v-model="exp.details"
						:min-height="192"
						placeholder="描述工作职责与业绩，如：负责 XX 产品功能迭代，提升转化率 20%..."
					/>
					<button class="ai-optimize-btn" @click.stop="handleAIOptimize(exp.id)">
						<svg viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
						AI 优化
					</button>
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
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const aiStore = useAIOptimizeStore()
// 注意：返回的是 reactive 数组，v-model="exp.company" 直接 mutate 即实时响应
const list = computed(() => store.activeResume?.experience || [])
const expanded = ref(null)
let toggleLock = false

function toggle(id) {
	if (toggleLock) return
	toggleLock = true
	expanded.value = expanded.value === id ? null : id
	setTimeout(() => { toggleLock = false }, 200)
}

function addItem() {
	const id = store.addExperience({ company: '', position: '', date: '', details: '' })
	if (id) expanded.value = id
}

function handleAIOptimize(itemId) {
	aiStore.openPanel()
	aiStore.goToStep('optimize')
}

function getStart(date) {
	if (!date) return ''
	return date.split('-至今')[0].split(' - ')[0].trim()
}
function getEnd(date) {
	if (!date || isCur(date)) return ''
	const parts = date.split(' - ')
	return parts[1]?.trim() || ''
}
function isCur(date) { return typeof date === 'string' && date.includes('至今') }
function build(start, end, current) {
	if (!start) return current ? '至今' : ''
	return current ? `${start} - 至今` : `${start} - ${end || ''}`
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
.item-card-sub {
	font-size: 12px; color: #9ca3af;
	white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
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
.add-block-btn {
	display: flex; align-items: center; justify-content: center; gap: 6px;
	margin: 12px 16px; width: calc(100% - 32px); padding: 10px;
	background: #1f2937; color: #fff; border: none; border-radius: 8px;
	font-size: 13px; cursor: pointer; transition: background 0.15s;
	svg { width: 13px; height: 13px; }
	&:hover { background: #374151; }
}

.ai-optimize-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	margin-top: 10px;
	padding: 8px 14px;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s;

	svg { width: 14px; height: 14px; }
	&:hover { opacity: 0.9; }
}
</style>
