<template>
	<div class="section-panel">
		<div v-for="proj in projects" :key="proj.id" class="item-card">
			<div class="item-card-header" @click="toggle(proj.id)">
				<span class="item-card-title">{{ proj.name || '?????' }}</span>
				<div class="item-card-actions">
					<button class="item-del-btn" @click.stop="store.deleteProject(proj.id)">??</button>
					<span class="chevron" :class="{ open: expanded === proj.id }">?</span>
				</div>
			</div>
			<div v-if="expanded === proj.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">????</label>
						<input class="form-input" :value="proj.name" @input="e => store.updateProject(proj.id, { name: e.target.value })" placeholder="????" />
					</div>
					<div class="form-group">
						<label class="form-label">??</label>
						<input class="form-input" :value="proj.role" @input="e => store.updateProject(proj.id, { role: e.target.value })" placeholder="????" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">??</label>
					<input class="form-input" :value="proj.date" @input="e => store.updateProject(proj.id, { date: e.target.value })" placeholder="? 2022-06 - 2023-12" />
				</div>
				<div class="form-group">
					<label class="form-label">????</label>
					<input class="form-input" :value="proj.link" @input="e => store.updateProject(proj.id, { link: e.target.value })" placeholder="https://..." />
				</div>
				<div class="form-group">
					<label class="form-label">????</label>
					<RichTextEditor
						:modelValue="proj.description"
						placeholder="???????????????????..."
						@update:modelValue="val => store.updateProject(proj.id, { description: val })"
					/>
				</div>
			</div>
		</div>
		<button class="add-item-btn" @click="addItem">+ ??????</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const store = useResumeStore()
const projects = computed(() => store.activeResume?.projects || [])
const expanded = ref(null)

function toggle(id) {
	expanded.value = expanded.value === id ? null : id
}

function addItem() {
	store.addProject({ name: '', role: '', date: '', description: '', link: '' })
	const list = store.activeResume?.projects || []
	if (list.length) expanded.value = list[list.length - 1].id
}
</script>

<style scoped lang="scss">
@use './_panel-common' as *;

.chevron {
	display: inline-block;
	font-size: 16px;
	color: #9ca3af;
	transform: rotate(90deg);
	transition: transform 0.2s;
	line-height: 1;

	&.open { transform: rotate(270deg); }
}
</style>
