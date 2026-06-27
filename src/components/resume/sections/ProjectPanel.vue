<template>
	<div class="section-panel">
		<div v-for="(proj, idx) in list" :key="proj.id" class="item-card">
			<div class="item-card-header" @click="toggle(proj.id)">
				<span class="item-card-title">{{ proj.name || '新项目经历' }}</span>
				<div class="item-card-actions">
					<button class="icon-act-btn" v-if="idx > 0" @click.stop="store.reorderProjects(idx, idx - 1)" title="上移">↑</button>
					<button class="icon-act-btn" v-if="idx < list.length - 1" @click.stop="store.reorderProjects(idx, idx + 1)" title="下移">↓</button>
					<button class="item-del-btn" @click.stop="store.deleteProject(proj.id)">删除</button>
					<span class="chevron" :class="{ open: expanded === proj.id }">›</span>
				</div>
			</div>
			<div v-if="expanded === proj.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">项目名称</label>
						<input class="form-input" v-model.trim="proj.name" placeholder="项目名称" />
					</div>
					<div class="form-group">
						<label class="form-label">角色</label>
						<input class="form-input" v-model.trim="proj.role" placeholder="负责人 / 核心开发" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">起止时间</label>
					<input class="form-input" v-model.trim="proj.date" placeholder="如 2022-06 - 2023-12" />
				</div>
				<div class="form-group">
					<label class="form-label">项目链接</label>
					<input class="form-input" v-model.trim="proj.link" placeholder="https://..." />
				</div>
				<div class="form-group editor-group">
					<label class="form-label">项目描述</label>
					<RichTextEditor
						v-model="proj.description"
						:min-height="192"
						placeholder="描述项目背景、你的产出与量化成果..."
					/>
					<button class="ai-optimize-btn" @click.stop="handleAIOptimize(proj.id)">
						<svg viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
						AI 优化
					</button>
				</div>
			</div>
		</div>
		<button class="add-item-btn" @click="addItem">+ 添加项目经历</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const aiStore = useAIOptimizeStore()
const list = computed(() => store.activeResume?.projects || [])
const expanded = ref(null)

function toggle(id) { expanded.value = expanded.value === id ? null : id }

function addItem() {
	const id = store.addProject({ name: '', role: '', date: '', description: '', link: '' })
	if (id) expanded.value = id
}

function handleAIOptimize(itemId) {
	aiStore.openPanel()
	aiStore.goToStep('optimize')
}
</script>

<style scoped lang="scss">
@use './_panel-common' as *;

.chevron {
	display: inline-block; font-size: 16px; color: #9ca3af;
	transform: rotate(90deg); transition: transform 0.2s; line-height: 1;
	&.open { transform: rotate(270deg); }
}
.icon-act-btn {
	width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center;
	border: none; background: none; border-radius: 4px; cursor: pointer;
	font-size: 12px; color: #6b7280;
	&:hover { background: #f3f4f6; color: #111827; }
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
