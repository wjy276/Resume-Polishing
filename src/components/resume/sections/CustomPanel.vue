<template>
	<div class="section-panel">
		<div v-for="(item, idx) in items" :key="item.id" class="item-card">
			<div class="item-card-header" @click="toggle(item.id)">
				<span class="item-card-title">{{ item.title || '新条目' }}</span>
				<div class="item-card-actions">
					<button class="icon-act-btn" v-if="idx > 0" @click.stop="store.reorderCustomItems(sectionId, idx, idx - 1)" title="上移">↑</button>
					<button class="icon-act-btn" v-if="idx < items.length - 1" @click.stop="store.reorderCustomItems(sectionId, idx, idx + 1)" title="下移">↓</button>
					<button class="item-del-btn" @click.stop="store.deleteCustomItem(sectionId, item.id)">删除</button>
					<span class="chevron" :class="{ open: expanded === item.id }">›</span>
				</div>
			</div>
			<div v-if="expanded === item.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">标题</label>
						<input class="form-input" v-model.trim="item.title" placeholder="标题" />
					</div>
					<div class="form-group">
						<label class="form-label">副标题</label>
						<input class="form-input" v-model.trim="item.subtitle" placeholder="副标题" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">起止时间</label>
					<input class="form-input" v-model.trim="item.dateRange" placeholder="如 2022-01 - 至今" />
				</div>
				<div class="form-group editor-group">
					<label class="form-label">描述</label>
					<RichTextEditor
						v-model="item.description"
						:min-height="192"
						placeholder="详细描述..."
					/>
				</div>
			</div>
		</div>
		<button class="add-item-btn" @click="addItem">+ 添加条目</button>
	</div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const props = defineProps({ sectionId: { type: String, required: true } })
const sectionId = toRef(props, 'sectionId')
const store = useResumeStore()
const expanded = ref(null)

const items = computed(() => store.activeResume?.customData?.[sectionId.value] || [])

function toggle(id) { expanded.value = expanded.value === id ? null : id }

function addItem() {
	const id = store.addCustomItem(sectionId.value, {
		title: '', subtitle: '', dateRange: '', description: '',
	})
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
