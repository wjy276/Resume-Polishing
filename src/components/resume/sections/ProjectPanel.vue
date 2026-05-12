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
				<div class="form-group">
					<label class="form-label">项目描述</label>
					<RichTextEditor
						v-model="proj.description"
						placeholder="描述项目背景、你的产出与量化成果..."
					/>
				</div>
			</div>
		</div>
		<button class="add-item-btn" @click="addItem">+ 添加项目经历</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const list = computed(() => store.activeResume?.projects || [])
const expanded = ref(null)

function toggle(id) { expanded.value = expanded.value === id ? null : id }

function addItem() {
	const id = store.addProject({ name: '', role: '', date: '', description: '', link: '' })
	if (id) expanded.value = id
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
</style>
