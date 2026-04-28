<template>
	<div class="section-panel">
		<div v-for="(item, i) in items" :key="item.id" class="item-card">
			<div class="item-card-header" @click="toggle(item.id)">
				<span class="item-card-title">{{ item.title || '???' }}</span>
				<div class="item-card-actions">
					<button class="item-del-btn" @click.stop="deleteItem(i)">??</button>
					<span class="chevron" :class="{ open: expanded === item.id }">?</span>
				</div>
			</div>
			<div v-if="expanded === item.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">??</label>
						<input class="form-input" :value="item.title" @input="e => updateItem(i, { title: e.target.value })" placeholder="??" />
					</div>
					<div class="form-group">
						<label class="form-label">???</label>
						<input class="form-input" :value="item.subtitle" @input="e => updateItem(i, { subtitle: e.target.value })" placeholder="???" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">???</label>
					<input class="form-input" :value="item.dateRange" @input="e => updateItem(i, { dateRange: e.target.value })" placeholder="? 2022-01 - ??" />
				</div>
				<div class="form-group">
					<label class="form-label">??</label>
					<RichTextEditor
						:modelValue="item.description"
						placeholder="??????..."
						@update:modelValue="val => updateItem(i, { description: val })"
					/>
				</div>
			</div>
		</div>
		<button class="add-item-btn" @click="addItem">+ ????</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { generateId } from '@/utils/resume/initialData'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const props = defineProps({ sectionId: { type: String, required: true } })
const store = useResumeStore()
const expanded = ref(null)

const items = computed(() => store.activeResume?.customData?.[props.sectionId] || [])

function toggle(id) {
	expanded.value = expanded.value === id ? null : id
}

function updateCustomData(newItems) {
	store.updateCustomSection(props.sectionId, newItems)
}

function updateItem(index, partial) {
	updateCustomData(items.value.map((item, i) => i === index ? { ...item, ...partial } : item))
}

function deleteItem(index) {
	updateCustomData(items.value.filter((_, i) => i !== index))
}

function addItem() {
	const newItem = { id: generateId(), title: '', subtitle: '', dateRange: '', description: '', visible: true }
	updateCustomData([...items.value, newItem])
	expanded.value = newItem.id
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
