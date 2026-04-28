<template>
	<div class="section-panel">

		<!-- 布局 -->
		<div class="panel-block">
			<div class="block-label">布局</div>
			<div class="layout-btns">
				<button
					v-for="opt in layoutOptions"
					:key="opt.value"
					class="layout-btn"
					:class="{ active: basic.layout === opt.value }"
					@click="patch({ layout: opt.value })"
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

		<!-- 个人信息-->
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
					<button class="icon-btn" @click="choosePhoto" title="基础字段">
						<svg viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 1 1 .39 2.14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M2 12V8h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
					<button class="icon-btn" @click="togglePhotoVisible" :class="{ muted: !photoVisible }" title="??/????">
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

		<!-- ?? ???? ?? -->
		<div class="panel-block">
			<div class="block-label">基础字段</div>

			<!-- ?? -->
			<div class="field-row-item">
				<span class="field-row-label">名字</span>
				<input class="form-input" :value="basic.name" @input="e => patch({ name: e.target.value })" placeholder="?????" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: !isFieldVisible('name') }" @click="toggleFieldVisibility('name')" title="??/??">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
			</div>

			<!-- ?? -->
			<div class="field-row-item">
				<span class="field-row-label">职位</span>
				<input class="form-input" :value="basic.title" @input="e => patch({ title: e.target.value })" placeholder="?????" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: !isFieldVisible('title') }" @click="toggleFieldVisibility('title')" title="??/??">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
			</div>

			<!-- Dynamic draggable fields -->
			<div v-for="field in dynamicFields" :key="field.key" class="field-row-item draggable">
				<span class="drag-dot">
					<svg viewBox="0 0 8 14" fill="none"><circle cx="2" cy="2" r="1" fill="#c4c4c4"/><circle cx="6" cy="2" r="1" fill="#c4c4c4"/><circle cx="2" cy="7" r="1" fill="#c4c4c4"/><circle cx="6" cy="7" r="1" fill="#c4c4c4"/><circle cx="2" cy="12" r="1" fill="#c4c4c4"/><circle cx="6" cy="12" r="1" fill="#c4c4c4"/></svg>
				</span>
				<span class="field-emoji">{{ field.icon }}</span>
				<span class="field-row-label muted">{{ field.label }}</span>
				<input class="form-input" :value="basic[field.key]" @input="e => patch({ [field.key]: e.target.value })" :placeholder="field.placeholder" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: !isFieldVisible(field.key) }" @click="toggleFieldVisibility(field.key)" title="??/??">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
				<button class="icon-btn-sm del-btn" title="??">
					<svg viewBox="0 0 14 16" fill="none"><path d="M1 3.5h12M4.5 3.5V2h5v1.5M5.5 6.5v5M8.5 6.5v5M2 3.5l.9 10h8.2l.9-10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
			</div>
		</div>

		<!-- 自定义字段 -->
		<div class="panel-block">
			<div class="block-label-row">
				<span class="block-label">自定义字段</span>
				<button class="btn-sm-add" @click="addCustomField">+ ??</button>
			</div>

			<div v-for="(cf, i) in basic.customFields" :key="cf.id" class="custom-field-row">
				<span class="drag-dot">
					<svg viewBox="0 0 8 14" fill="none"><circle cx="2" cy="2" r="1" fill="#c4c4c4"/><circle cx="6" cy="2" r="1" fill="#c4c4c4"/><circle cx="2" cy="7" r="1" fill="#c4c4c4"/><circle cx="6" cy="7" r="1" fill="#c4c4c4"/><circle cx="2" cy="12" r="1" fill="#c4c4c4"/><circle cx="6" cy="12" r="1" fill="#c4c4c4"/></svg>
				</span>
				<span class="field-emoji">{{ cf.icon || '??' }}</span>
				<input class="form-input cf-label" :value="cf.label" @input="e => updateCustomField(i, { label: e.target.value })" placeholder="??" />
				<input class="form-input cf-value" :value="cf.value" @input="e => updateCustomField(i, { value: e.target.value })" placeholder="??" />
				<button class="icon-btn-sm vis-btn" :class="{ muted: cf.visible === false }" @click="toggleCustomFieldVisibility(i)" title="??/??">
					<svg viewBox="0 0 16 16" fill="none"><path d="M8 3C4.5 3 1.5 8 1.5 8S4.5 13 8 13s6.5-5 6.5-5S11.5 3 8 3z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/></svg>
				</button>
				<button class="icon-btn-sm del-btn" @click="removeCustomField(i)" title="??">
					<svg viewBox="0 0 14 16" fill="none"><path d="M1 3.5h12M4.5 3.5V2h5v1.5M5.5 6.5v5M8.5 6.5v5M2 3.5l.9 10h8.2l.9-10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</button>
			</div>

			<button class="add-full-btn" @click="addCustomField">
				<svg viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
				添加
			</button>
		</div>

		<!-- ?? Github ?? ?? -->
		<div class="panel-block github-block">
			<div class="github-header">
				<span class="block-label no-mb">Github??</span>
				<button
					class="toggle-btn"
					:class="{ on: githubEnabled }"
					@click="toggleGithubEnabled"
				>
					<span class="toggle-knob" />
				</button>
			</div>
			<template v-if="githubEnabled">
				<div class="form-group-simple">
					<label class="simple-label">Access Token</label>
					<input class="form-input" :value="basic.githubToken || ''" @input="e => patch({ githubToken: e.target.value })" placeholder="??? github access token" />
				</div>
				<div class="form-group-simple">
					<label class="simple-label">UserName</label>
					<input class="form-input" :value="basic.githubUsername || ''" @input="e => patch({ githubUsername: e.target.value })" placeholder="??? github username" />
				</div>
			</template>
		</div>

	</div>
</template>

<script setup>
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { generateId } from '@/utils/resume/initialData'

const store = useResumeStore()
const basic = computed(() => store.activeResume?.basic || {})

const githubEnabled = computed(() => basic.value.githubEnabled === true)

const layoutOptions = [
	{ value: 'right',   label: '右侧对齐' },
	{ value: 'center', label: '居中' },
	{ value: 'left',  label: '左侧对齐' },
]

const dynamicFields = [
	{ key: 'employementStatus', label: '状态',     icon: '??', placeholder: '?? / ??' },
	{ key: 'birthDate',         label: '生日',     icon: '??', placeholder: '1995-06' },
	{ key: 'email',             label: '邮箱',     icon: '??', placeholder: 'name@example.com' },
	{ key: 'phone',             label: '手机',     icon: '??', placeholder: '13800138000' },
	{ key: 'location',          label: '地址',     icon: '??', placeholder: '?? / ??' },
]

const photoVisible = computed(() => basic.value.photoConfig?.visible !== false)

function patch(partial) {
	store.updateBasicInfo(partial)
}

function getFieldOrder() {
	return basic.value.fieldOrder || []
}

function isFieldVisible(key) {
	const row = getFieldOrder().find((field) => field.key === key)
	return row ? row.visible !== false : true
}

function toggleFieldVisibility(key) {
	const source = getFieldOrder()
	const idx = source.findIndex((field) => field.key === key)
	if (idx < 0) return
	const next = [...source]
	next[idx] = { ...next[idx], visible: !(next[idx].visible !== false) }
	patch({ fieldOrder: next })
}

function toggleCustomFieldVisibility(index) {
	const source = basic.value.customFields || []
	const next = source.map((field, i) =>
		i === index ? { ...field, visible: !(field.visible !== false) } : field
	)
	patch({ customFields: next })
}

function toggleGithubEnabled() {
	patch({ githubEnabled: !githubEnabled.value })
}

function togglePhotoVisible() {
	const photoConfig = { ...(basic.value.photoConfig || {}), visible: !photoVisible.value }
	patch({ photoConfig })
}

function choosePhoto() {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = 'image/*'
	input.onchange = (e) => {
		const file = e.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (ev) => patch({ photo: ev.target.result })
		reader.readAsDataURL(file)
	}
	input.click()
}

function addCustomField() {
	const fields = [...(basic.value.customFields || []), {
		id: generateId(), label: '???', value: '', icon: '??', visible: true,
	}]
	patch({ customFields: fields })
}

function updateCustomField(index, partial) {
	const fields = (basic.value.customFields || []).map((f, i) =>
		i === index ? { ...f, ...partial } : f
	)
	patch({ customFields: fields })
}

function removeCustomField(index) {
	patch({ customFields: (basic.value.customFields || []).filter((_, i) => i !== index) })
}
</script>

<style scoped lang="scss">
@use './_panel-common' as *;

/* ?? Panel blocks ?? */
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

.block-label.no-mb { margin-bottom: 0; }

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

/* ?? Layout buttons ?? */
.layout-btns {
	display: flex;
	gap: 8px;
}

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

	svg {
		width: 100%;
		max-width: 58px;
		height: 34px;
	}

	span { font-size: 11px; white-space: nowrap; }

	&:hover { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }

	&.active {
		border-color: #2563eb;
		background: #eff6ff;
		color: #2563eb;
		font-weight: 600;
	}
}

/* ?? Photo card ?? */
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

.photo-card-icon {
	width: 16px;
	height: 16px;
	color: #6b7280;
}

.photo-card-text {
	font-size: 11px;
	color: #6b7280;
}

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

.photo-card-actions {
	margin-left: auto;
	display: flex;
	gap: 4px;
}

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

/* ?? Field rows ?? */
.field-row-item {
	display: flex;
	align-items: center;
	gap: 5px;
	padding: 5px 0;
	border-bottom: 1px solid #f9fafb;

	&:last-child { border-bottom: none; }

	.form-input { flex: 1; height: inherit; }
}

.field-row-label {
	font-size: 12px;
	color: #374151;
	white-space: nowrap;
	min-width: 28px;
	flex-shrink: 0;

	&.muted { color: #9ca3af; font-size: 11px; }
}

.draggable { cursor: default; }

.drag-dot {
	width: 12px;
	flex-shrink: 0;
	cursor: grab;
	opacity: 0.5;

	svg { width: 8px; height: 14px; display: block; }

	&:active { cursor: grabbing; }
}

.field-emoji {
	font-size: 13px;
	flex-shrink: 0;
	width: 18px;
	text-align: center;
}

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
.del-btn { color: #ef4444; &:hover { background: #fef2f2; } }

/* ?? Custom fields ?? */
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

/* ?? Github block ?? */
.github-block {
	border-bottom: none;
}

.github-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}

.form-group-simple {
	margin-bottom: 8px;
}

.simple-label {
	display: block;
	font-size: 12px;
	color: #6b7280;
	margin-bottom: 4px;
}

/* Toggle switch */
.toggle-btn {
	width: 36px;
	height: 20px;
	border-radius: 10px;
	background: #d1d5db;
	border: none;
	cursor: pointer;
	position: relative;
	transition: background 0.2s;
	flex-shrink: 0;

	&.on { background: #2563eb; }
}

.toggle-knob {
	position: absolute;
	top: 2px;
	left: 2px;
	width: 16px;
	height: 16px;
	border-radius: 50%;
	background: #fff;
	box-shadow: 0 1px 3px rgba(0,0,0,.15);
	transition: left 0.2s;

	.toggle-btn.on & { left: 18px; }
}
</style>
