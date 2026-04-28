<template>
	<div class="section-panel">
		<div v-for="(cert, i) in items" :key="cert.id" class="item-card">
			<div class="item-card-header" @click="toggle(cert.id)">
				<span class="item-card-title">{{ cert.title || '新荣誉证书' }}</span>
				<div class="item-card-actions">
					<button class="item-del-btn" @click.stop="deleteItem(i)">删除</button>
					<span class="chevron" :class="{ open: expanded === cert.id }">›</span>
				</div>
			</div>
			<div v-if="expanded === cert.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">证书/奖项名称</label>
						<input class="form-input" :value="cert.title" @input="e => updateItem(i, { title: e.target.value })" placeholder="证书名称" />
					</div>
					<div class="form-group">
						<label class="form-label">颁发机构</label>
						<input class="form-input" :value="cert.issuer" @input="e => updateItem(i, { issuer: e.target.value })" placeholder="颁发机构" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">获得时间</label>
					<input class="form-input" :value="cert.date" @input="e => updateItem(i, { date: e.target.value })" placeholder="如 2023-06" />
				</div>
				<div class="form-group">
					<label class="form-label">补充说明</label>
					<RichTextEditor
						:modelValue="cert.description"
						placeholder="可填写证书相关说明..."
						@update:modelValue="val => updateItem(i, { description: val })"
					/>
				</div>
			</div>
		</div>
		<button class="add-item-btn" @click="addItem">+ 添加荣誉证书</button>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { generateId } from '@/utils/resume/initialData'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const props = defineProps({ sectionId: { type: String, default: 'certificates' } })
const store = useResumeStore()
const expanded = ref(null)

const items = computed(() => store.activeResume?.customData?.[props.sectionId] || [])

function toggle(id) {
	expanded.value = expanded.value === id ? null : id
}

function save(newItems) {
	store.updateCustomSection(props.sectionId, newItems)
}

function updateItem(index, partial) {
	save(items.value.map((item, i) => i === index ? { ...item, ...partial } : item))
}

function deleteItem(index) {
	save(items.value.filter((_, i) => i !== index))
}

function addItem() {
	const newItem = { id: generateId(), title: '', issuer: '', date: '', description: '', visible: true }
	save([...items.value, newItem])
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
