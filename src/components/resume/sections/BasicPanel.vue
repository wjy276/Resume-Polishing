<template>
	<div v-if="basic" class="section-panel">

		<!-- 布局 -->
		<div class="panel-block">
			<div class="block-label">布局</div>
			<div class="layout-btns">
				<button
					v-for="opt in layoutOptions"
					:key="opt.value"
					class="layout-btn"
					:class="{ active: basic.layout === opt.value }"
					@click="basic.layout = opt.value"
					:title="opt.label"
				>
					<svg viewBox="0 0 60 38" fill="none" xmlns="http://www.w3.org/2000/svg">
						<template v-if="opt.value === 'left'">
							<rect x="6" y="7" width="14" height="18" rx="2" fill="currentColor" opacity=".35"/>
							<line x1="26" y1="10" x2="54" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
							<line x1="26" y1="16" x2="46" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>
							<line x1="26" y1="22" x2="54" y2="22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".4"/>
							<line x1="26" y1="28" x2="40" y2="28" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".35"/>
						</template>
						<template v-else-if="opt.value === 'center'">
							<rect x="23" y="4" width="14" height="16" rx="2" fill="currentColor" opacity=".35"/>
							<line x1="14" y1="24" x2="46" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
							<line x1="19" y1="30" x2="41" y2="30" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>
						</template>
						<template v-else>
							<line x1="6" y1="10" x2="34" y2="10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
							<line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>
							<line x1="6" y1="22" x2="34" y2="22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".4"/>
							<line x1="6" y1="28" x2="22" y2="28" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".35"/>
							<rect x="40" y="7" width="14" height="18" rx="2" fill="currentColor" opacity=".35"/>
						</template>
					</svg>
					<span>{{ opt.label }}</span>
				</button>
			</div>
		</div>

		<!-- 头像 -->
		<div class="panel-block">
			<div class="block-label">资料</div>
			<div class="photo-card">
				<div class="photo-card-left">
					<svg viewBox="0 0 16 16" fill="none" class="photo-card-icon"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="7.5" r="2.5" stroke="currentColor" stroke-width="1.3"/></svg>
					<span class="photo-card-text">头像</span>
				</div>
				<div class="photo-thumb" @click="choosePhoto">
					<img v-if="basic.photo" :src="basic.photo" class="photo-thumb-img" />
					<div v-else class="photo-thumb-empty">
						<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="7" r="4" stroke="#d1d5db" stroke-width="1.5"/></svg>
					</div>
				</div>
				<div class="photo-card-actions">
					<button class="icon-btn" @click="choosePhoto" title="上传头像">
						<svg viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1 1 .39 2.14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 12V8h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
					<button class="icon-btn" :class="{ muted: !photoVisible }" @click="togglePhotoVisible" title="显示/隐藏">
						<svg viewBox="0 0 16 16" fill="none">
							<template v-if="photoVisible">
								<path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/>
								<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/>
							</template>
							<template v-else>
								<path d="M2 2l12 12M6.5 6.7a2 2 0 0 0 2.8 2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
								<path d="M4.5 4.7C3.2 5.6 2 7.3 2 8c0 0 2.7 5 6 5a5.7 5.7 0 0 0 2.8-.8M7 3.1A6 6 0 0 1 8 3c3.3 0 6 5 6 5a11 11 0 0 1-1.2 1.9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
							</template>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- 基础字段 -->
		<div class="panel-block">
			<div class="block-label">基础字段</div>

			<div class="field-row-item">
				<span class="field-row-label">姓名</span>
				<input class="form-input" v-model.trim="basic.name" placeholder="请输入姓名" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: !isVisible('name') }" @click="toggleVisible('name')" title="显示/隐藏">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
			</div>

			<div class="field-row-item">
				<span class="field-row-label">职位</span>
				<input class="form-input" v-model.trim="basic.title" placeholder="求职岗位" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: !isVisible('title') }" @click="toggleVisible('title')" title="显示/隐藏">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
			</div>

			<div v-for="field in dynamicFields" :key="field.key" class="field-row-item">
				<span class="field-emoji">{{ field.icon }}</span>
				<span class="field-row-label muted">{{ field.label }}</span>
				<input class="form-input" v-model.trim="basic[field.key]" :placeholder="field.placeholder" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: !isVisible(field.key) }" @click="toggleVisible(field.key)" title="显示/隐藏">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
			</div>
		</div>

		<!-- 自定义字段 -->
		<div class="panel-block">
			<div class="block-label-row">
				<span class="block-label">自定义字段</span>
				<button class="btn-sm-add" @click="addCustomField">+ 添加</button>
			</div>

			<div v-for="(cf, i) in customFields" :key="cf.id" class="custom-field-row">
				<span class="field-emoji">{{ cf.icon || '🔗' }}</span>
				<input class="form-input cf-label" v-model.trim="cf.label" placeholder="标签" />
				<input class="form-input cf-value" v-model.trim="cf.value" placeholder="内容" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: cf.visible === false }" @click="cf.visible = !(cf.visible !== false)" title="显示/隐藏">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
				<button class="icon-btn-sm del-btn" @click="removeCustomField(i)" title="删除">
					<svg viewBox="0 0 14 16" fill="none"><path d="M1 3.5h12M4.5 3.5V2h5v1.5M5.5 6.5v5M8.5 6.5v5M2 3.5l.9 10h8.2l.9-10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
			</div>

			<button class="add-full-btn" @click="addCustomField">
				<svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
				添加
			</button>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { generateId } from '@/utils/resume/initialData'

const store = useResumeStore()

// 直接拿到 reactive 的 basic 对象。v-model 写它的属性 → store 内部自动更新 → 预览实时刷新。
const basic = computed(() => store.activeResume?.basic || null)
const customFields = computed(() => basic.value?.customFields || [])

const FIELD_META = {
	email:             { label: '邮箱',     icon: '📧', placeholder: 'name@example.com' },
	phone:             { label: '手机',     icon: '📱', placeholder: '13800138000' },
	location:          { label: '所在地',   icon: '📍', placeholder: '北京 / 朝阳' },
	birthDate:         { label: '出生年月', icon: '📅', placeholder: '1995-06' },
	employementStatus: { label: '求职状态', icon: '💼', placeholder: '离职 / 在职' },
}

const dynamicFields = computed(() => {
	const order = basic.value?.fieldOrder || []
	return order
		.filter((f) => f.key !== 'name' && f.key !== 'title')
		.map((f) => ({
			key: f.key,
			label: FIELD_META[f.key]?.label || f.label || f.key,
			icon: FIELD_META[f.key]?.icon || '✦',
			placeholder: FIELD_META[f.key]?.placeholder || '',
		}))
})

const layoutOptions = [
	{ value: 'right',  label: '右侧对齐' },
	{ value: 'center', label: '居中' },
	{ value: 'left',   label: '左侧对齐' },
]

const photoVisible = computed(() => basic.value?.photoConfig?.visible !== false)

function isVisible(key) {
	const row = (basic.value?.fieldOrder || []).find((f) => f.key === key)
	return row ? row.visible !== false : true
}

function toggleVisible(key) {
	const order = basic.value?.fieldOrder || []
	const idx = order.findIndex((f) => f.key === key)
	if (idx < 0) return
	order[idx].visible = !(order[idx].visible !== false)
}

function togglePhotoVisible() {
	if (!basic.value.photoConfig) basic.value.photoConfig = {}
	basic.value.photoConfig.visible = !photoVisible.value
}

function choosePhoto() {
	if (typeof document === 'undefined') return
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = 'image/*'
	input.onchange = (e) => {
		const file = e.target.files?.[0]
		if (!file) return
		_compressPhoto(file, 320, 0.8, 100 * 1024).then((base64) => {
			basic.value.photo = base64
		}).catch(() => {
			// 压缩失败时回退到原图
			const reader = new FileReader()
			reader.onload = (ev) => { basic.value.photo = ev.target.result }
			reader.readAsDataURL(file)
		})
	}
	input.click()
}

/**
 * 压缩头像图片，避免 base64 过大导致保存超时
 * @param {File} file
 * @param {number} maxWidth 最大宽度
 * @param {number} quality 压缩质量 0-1
 * @param {number} maxBytes 超过该字节数继续降低质量
 */
function _compressPhoto(file, maxWidth = 320, quality = 0.8, maxBytes = 100 * 1024) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = (ev) => {
			const img = new Image()
			img.onload = () => {
				const canvas = document.createElement('canvas')
				const ratio = Math.min(maxWidth / img.width, 1)
				canvas.width = Math.round(img.width * ratio)
				canvas.height = Math.round(img.height * ratio)
				const ctx = canvas.getContext('2d')
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

				let q = quality
				let base64 = canvas.toDataURL('image/jpeg', q)
				// 若仍超过阈值，逐步降低质量
				while (base64.length > maxBytes * 1.37 && q > 0.3) {
					q -= 0.1
					base64 = canvas.toDataURL('image/jpeg', q)
				}
				resolve(base64)
			}
			img.onerror = reject
			img.src = ev.target.result
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

function addCustomField() {
	if (!basic.value) return
	if (!Array.isArray(basic.value.customFields)) basic.value.customFields = []
	basic.value.customFields.push({
		id: generateId(),
		label: '自定义',
		value: '',
		icon: '🔗',
		visible: true,
	})
}

function removeCustomField(index) {
	if (!basic.value?.customFields) return
	basic.value.customFields.splice(index, 1)
}
</script>

<style scoped lang="scss">
@use './_panel-common' as *;

.panel-block {
	padding: 12px 16px;
	border-bottom: 1px solid #f3f4f6;
	&:last-child { border-bottom: none; }
}

.block-label {
	font-size: 12px;
	font-weight: 600;
	color: #374151;
	margin-bottom: 10px;
}

.block-label-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
	.block-label { margin-bottom: 0; }
}

.btn-sm-add {
	font-size: 12px;
	color: #6b7280;
	background: none;
	border: none;
	cursor: pointer;
	padding: 2px 6px;
	border-radius: 4px;
	&:hover { background: #f3f4f6; color: #2563eb; }
}

.layout-btns { display: flex; gap: 8px; }

.layout-btn {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 10px 4px 8px;
	border: 1.5px solid #e5e7eb;
	border-radius: 8px;
	background: #f9fafb;
	color: #6b7280;
	cursor: pointer;
	transition: all 0.15s;
	min-width: 0;
	svg { width: 100%; max-width: 58px; height: 34px; }
	span { font-size: 11px; white-space: nowrap; }
	&:hover { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
	&.active {
		border-color: #2563eb;
		background: #eff6ff;
		color: #2563eb;
		font-weight: 600;
	}
}

.photo-card {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	background: #fff;
}
.photo-card-left {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 3px;
	min-width: 40px;
}
.photo-card-icon { width: 16px; height: 16px; color: #6b7280; }
.photo-card-text { font-size: 11px; color: #6b7280; }
.photo-thumb {
	width: 42px;
	height: 52px;
	border: 1px solid #e5e7eb;
	border-radius: 4px;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #f9fafb;
	cursor: pointer;
	flex-shrink: 0;
	&:hover { border-color: #93c5fd; }
}
.photo-thumb-img { width: 100%; height: 100%; object-fit: cover; }
.photo-thumb-empty { display: flex; align-items: center; justify-content: center; }
.photo-card-actions { margin-left: auto; display: flex; gap: 4px; }

.icon-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	background: #fff;
	color: #6b7280;
	cursor: pointer;
	svg { width: 14px; height: 14px; }
	&:hover { background: #f3f4f6; color: #111; }
	&.muted { color: #d1d5db; }
}

.field-row-item {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 5px 0;
	border-bottom: 1px solid #f9fafb;
	&:last-child { border-bottom: none; }
	.form-input { flex: 1; min-height: 40px; }
}

.field-row-label {
	font-size: 12px;
	color: #374151;
	white-space: nowrap;
	min-width: 28px;
	flex-shrink: 0;
	&.muted { color: #9ca3af; font-size: 11px; }
}

.field-emoji { font-size: 13px; flex-shrink: 0; width: 18px; text-align: center; }

.icon-btn-sm {
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: none;
	border-radius: 4px;
	cursor: pointer;
	flex-shrink: 0;
	padding: 0;
	svg { width: 12px; height: 12px; }
	&:hover { background: #f3f4f6; }
}
.vis-btn { color: #9ca3af; }
.vis-btn.muted { color: #d1d5db; }
.del-btn { color: #ef4444; &:hover { background: #fef2f2; } }

.custom-field-row {
	display: flex;
	align-items: center;
	gap: 4px;
	padding: 4px 0;
}
.cf-label { width: 64px; flex: none !important; }
.cf-value { flex: 1; }

.add-full-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	width: 100%;
	padding: 9px;
	margin-top: 8px;
	background: #1f2937;
	color: #fff;
	border: none;
	border-radius: 7px;
	font-size: 13px;
	cursor: pointer;
	transition: background 0.15s;
	svg { width: 13px; height: 13px; }
	&:hover { background: #374151; }
}
</style>
