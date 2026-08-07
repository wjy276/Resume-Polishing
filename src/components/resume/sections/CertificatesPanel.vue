<template>
	<div class="section-panel">
		<div v-for="(cert, idx) in items" :key="cert.id" class="item-card">
			<div class="item-card-header" @click="toggle(cert.id)">
				<span class="item-card-title">{{ cert.title || '新荣誉证书' }}</span>
				<div class="item-card-actions">
					<button class="icon-act-btn" v-if="idx > 0" @click.stop="store.reorderCustomItems(sectionId, idx, idx - 1)" title="上移">↑</button>
					<button class="icon-act-btn" v-if="idx < items.length - 1" @click.stop="store.reorderCustomItems(sectionId, idx, idx + 1)" title="下移">↓</button>
					<button class="item-del-btn" @click.stop="store.deleteCustomItem(sectionId, cert.id)">删除</button>
					<span class="chevron" :class="{ open: expanded === cert.id }">›</span>
				</div>
			</div>
			<div v-if="expanded === cert.id" class="item-card-body">
				<div class="field-row">
					<div class="form-group">
						<label class="form-label">证书/奖项名称</label>
						<input class="form-input" v-model.trim="cert.title" placeholder="证书名称" />
					</div>
					<div class="form-group">
						<label class="form-label">颁发机构</label>
						<input class="form-input" v-model.trim="cert.issuer" placeholder="颁发机构" />
					</div>
				</div>
				<div class="form-group">
					<label class="form-label">获得时间</label>
					<input class="form-input" v-model.trim="cert.date" placeholder="如 2023-06" />
				</div>
				<div class="form-group editor-group">
					<label class="form-label">补充说明</label>
					<RichTextEditor
						v-model="cert.description"
						:min-height="168"
						placeholder="可填写证书相关说明..."
					/>
				</div>
			</div>
		</div>
		<button class="add-item-btn" @click="addItem">+ 添加荣誉证书</button>
	</div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import { useResumeStore } from '@/stores/resume'
import RichTextEditor from '@/components/resume/RichTextEditor.vue'

const props = defineProps({ sectionId: { type: String, default: 'certificates' } })
const sectionId = toRef(props, 'sectionId')
const store = useResumeStore()
const expanded = ref(null)

const items = computed(() => store.activeResume?.customData?.[sectionId.value] || [])

function toggle(id) { expanded.value = expanded.value === id ? null : id }

function addItem() {
	const id = store.addCustomItem(sectionId.value, {
		title: '', issuer: '', date: '', description: '',
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
	width: 22px; height: 36px; display: inline-flex; align-items: center; justify-content: center;
	border: none; background: none; border-radius: 4px; cursor: pointer;
	font-size: 12px; color: #6b7280;
	&:hover { background: #f3f4f6; color: #111827; }
}
</style>
