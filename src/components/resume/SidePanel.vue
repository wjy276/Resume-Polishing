<template>
	<div class="side-panel">

		<!-- ── 页面布局 ── -->
		<div class="panel-card">
			<div class="card-header">
				<svg class="card-svg-icon" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/><rect x="1" y="9" width="14" height="6" rx="1" stroke="currentColor" stroke-width="1.4"/></svg>
				<span class="card-title">页面布局</span>
			</div>

			<div class="module-list">
				<div
					v-for="(section, index) in menuSections"
					:key="section.id"
					class="module-item"
					:class="{ active: activeSection === section.id, disabled: !section.enabled }"
					@click="selectSection(section.id)"
				>
					<span class="drag-handle" title="拖拽排序">⠿</span>
					<span class="module-icon">{{ section.icon }}</span>
					<span class="module-title">{{ section.title }}</span>
					<div class="module-actions">
						<button
							class="icon-btn vis-btn"
							:class="{ hidden: !section.enabled }"
							@click.stop="toggleVisibility(section.id)"
							:title="section.enabled ? '点击隐藏' : '点击显示'"
						>
							<svg v-if="section.enabled" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg>
							<svg v-else viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 4.1C7 4 7.5 4 8 4c4.5 0 7 4 7 4s-.7 1.3-2 2.5M9.5 11.9C9 12 8.5 12 8 12c-4.5 0-7-4-7-4s.7-1.3 2-2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
						</button>
						<button v-if="index > 0" class="icon-btn" @click.stop="moveUp(index)" title="上移">
							<svg viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
						</button>
						<button v-if="index < menuSections.length - 1" class="icon-btn" @click.stop="moveDown(index)" title="下移">
							<svg viewBox="0 0 16 16" fill="none"><path d="M8 4v8M4 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
						</button>
					</div>
				</div>
			</div>

			<div class="add-section-wrap">
				<button class="add-section-btn" @click="showAddPopup = !showAddPopup">
					<svg viewBox="0 0 16 16" fill="none" style="width:12px;height:12px"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
					添加模块
				</button>
				<transition name="popup-fade">
					<div v-if="showAddPopup" class="add-popup" v-click-outside="() => showAddPopup = false">
						<button v-for="mod in availableModules" :key="mod.id" class="add-popup-item" @click="addSection(mod)">
							<span class="popup-icon">{{ mod.icon }}</span>
							<span>{{ mod.title }}</span>
						</button>
						<div v-if="!availableModules.length" class="add-popup-empty">暂无可添加模块</div>
					</div>
				</transition>
			</div>
		</div>

		<!-- ── 主题颜色 ── -->
		<div class="panel-card">
			<div class="card-header">
				<svg class="card-svg-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4"/><path d="M8 2a6 6 0 016 6" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="2" r="1" fill="currentColor"/><circle cx="14" cy="8" r="1" fill="currentColor"/><circle cx="5" cy="13" r="1" fill="currentColor"/></svg>
				<span class="card-title">主题颜色</span>
				<div class="current-color-preview" :style="{ background: themeColor }" :title="themeColor" />
			</div>

			<div class="theme-color-body">
				<div class="color-swatches">
					<button
						v-for="color in THEME_COLORS"
						:key="color"
						class="color-swatch"
						:class="{ selected: themeColor === color }"
						:style="{ background: color }"
						@click="setColor(color)"
						:title="color"
					>
						<svg v-if="themeColor === color" class="check-icon" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>

					<!-- Custom color picker -->
					<label class="color-swatch custom-swatch" title="自定义颜色">
						<svg viewBox="0 0 16 16" fill="none"><path d="M2 12l2-2 8-8 2 2-8 8-2 2-2-1z" stroke="currentColor" stroke-width="1.3"/><path d="M12 2l2 2" stroke="currentColor" stroke-width="1.3"/></svg>
						<input type="color" :value="themeColor" @input="e => setColor(e.target.value)" class="hidden-color-input" />
					</label>
				</div>

				<div v-if="!THEME_COLORS.includes(themeColor)" class="custom-color-row">
					<span class="custom-color-dot" :style="{ background: themeColor }" />
					<span class="custom-color-hex">{{ themeColor }}</span>
					<span class="custom-color-label">自定义颜色</span>
				</div>
			</div>
		</div>

		<!-- ── 字体排版 ── -->
		<div class="panel-card">
			<div class="card-header">
				<svg class="card-svg-icon" viewBox="0 0 16 16" fill="none"><path d="M2 13L6 3l4 10M3.5 9h5M11 3v10M11 3h3M11 13h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
				<span class="card-title">字体排版</span>
			</div>
			<div class="settings-list">
				<div class="settings-item">
					<span class="item-label">字体</span>
					<select class="item-select" :value="gs.fontFamily || 'default'" @change="e => update({ fontFamily: e.target.value })">
						<option v-for="f in fontOptions" :key="f.value" :value="f.value">{{ f.label }}</option>
					</select>
				</div>
				<div class="settings-item">
					<span class="item-label">正文字号</span>
					<div class="number-row">
						<button class="num-btn" @click="update({ baseFontSize: Math.max(10, (gs.baseFontSize||14)-1) })">−</button>
						<span class="num-val">{{ gs.baseFontSize || 14 }}</span>
						<button class="num-btn" @click="update({ baseFontSize: Math.min(22, (gs.baseFontSize||14)+1) })">＋</button>
					</div>
				</div>
				<div class="settings-item">
					<span class="item-label">标题字号</span>
					<div class="number-row">
						<button class="num-btn" @click="update({ headerSize: Math.max(12, (gs.headerSize||18)-1) })">−</button>
						<span class="num-val">{{ gs.headerSize || 18 }}</span>
						<button class="num-btn" @click="update({ headerSize: Math.min(28, (gs.headerSize||18)+1) })">＋</button>
					</div>
				</div>
				<div class="settings-item">
					<span class="item-label">副标题字号</span>
					<div class="number-row">
						<button class="num-btn" @click="update({ subheaderSize: Math.max(11, (gs.subheaderSize||15)-1) })">−</button>
						<span class="num-val">{{ gs.subheaderSize || 15 }}</span>
						<button class="num-btn" @click="update({ subheaderSize: Math.min(24, (gs.subheaderSize||15)+1) })">＋</button>
					</div>
				</div>
				<div class="settings-item">
					<span class="item-label">行高</span>
					<div class="slider-row">
						<input type="range" min="1" max="2.2" step="0.1"
							:value="gs.lineHeight || 1.5"
							@input="e => update({ lineHeight: parseFloat((+e.target.value).toFixed(1)) })"
						/>
						<span class="slider-badge">{{ (gs.lineHeight || 1.5).toFixed(1) }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- ── 间距 ── -->
		<div class="panel-card">
			<div class="card-header">
				<svg class="card-svg-icon" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M4 4h8M4 12h8M2 8h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
				<span class="card-title">间距</span>
			</div>
			<div class="settings-list">
				<div class="settings-item">
					<span class="item-label">页面边距</span>
					<div class="slider-row">
						<input type="range" min="0" max="80" step="2"
							:value="gs.pagePadding ?? 32"
							@input="e => update({ pagePadding: +e.target.value })"
						/>
						<span class="slider-badge">{{ gs.pagePadding ?? 32 }}</span>
					</div>
				</div>
				<div class="settings-item">
					<span class="item-label">模块间距</span>
					<div class="slider-row">
						<input type="range" min="4" max="60" step="2"
							:value="gs.sectionSpacing ?? 16"
							@input="e => update({ sectionSpacing: +e.target.value })"
						/>
						<span class="slider-badge">{{ gs.sectionSpacing ?? 16 }}</span>
					</div>
				</div>
				<div class="settings-item">
					<span class="item-label">段落间距</span>
					<div class="slider-row">
						<input type="range" min="2" max="40" step="1"
							:value="gs.paragraphSpacing ?? 12"
							@input="e => update({ paragraphSpacing: +e.target.value })"
						/>
						<span class="slider-badge">{{ gs.paragraphSpacing ?? 12 }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- ── 显示模式 ── -->
		<div class="panel-card">
			<div class="card-header">
				<svg class="card-svg-icon" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><circle cx="5" cy="8" r="1.5" fill="currentColor"/><path d="M8 8h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
				<span class="card-title">显示模式</span>
			</div>
			<div class="settings-list">
				<div class="settings-item">
					<span class="item-label">图标模式</span>
					<span class="item-desc">联系信息显示图标</span>
					<label class="toggle-switch">
						<input type="checkbox" :checked="gs.useIconMode" @change="e => update({ useIconMode: e.target.checked })" />
						<span class="track" />
					</label>
				</div>
				<div class="settings-item">
					<span class="item-label">居中副标题</span>
					<span class="item-desc">职位居中显示</span>
					<label class="toggle-switch">
						<input type="checkbox" :checked="gs.centerSubtitle" @change="e => update({ centerSubtitle: e.target.checked })" />
						<span class="track" />
					</label>
				</div>
				<div class="settings-item">
					<span class="item-label">弹性页头</span>
					<span class="item-desc">基本信息自适应宽度</span>
					<label class="toggle-switch">
						<input type="checkbox" :checked="gs.flexibleHeaderLayout" @change="e => update({ flexibleHeaderLayout: e.target.checked })" />
						<span class="track" />
					</label>
				</div>
			</div>
		</div>

	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { THEME_COLORS, STANDARD_MODULES } from '@/utils/resume/initialData'

const store = useResumeStore()
const showAddPopup = ref(false)

const gs = computed(() => store.activeResume?.globalSettings || {})
const themeColor = computed(() => gs.value.themeColor || '#000000')
const menuSections = computed(() => store.activeResume?.menuSections || [])
const activeSection = computed(() => store.activeResume?.activeSection || '')

const fontOptions = [
	{ value: 'default',        label: '系统默认' },
	{ value: 'Noto Sans SC',   label: 'Noto Sans SC' },
	{ value: 'Microsoft YaHei', label: '微软雅黑' },
	{ value: 'SimSun',         label: '宋体' },
	{ value: 'SimHei',         label: '黑体' },
	{ value: 'KaiTi',          label: '楷体' },
	{ value: 'Arial',          label: 'Arial' },
	{ value: 'Georgia',        label: 'Georgia' },
]

const availableModules = computed(() => {
	const existing = new Set(menuSections.value.map(s => s.id))
	return Object.values(STANDARD_MODULES).filter(m => !existing.has(m.id))
})

// Click-outside directive
const vClickOutside = {
	mounted(el, binding) {
		el._clickOutside = (e) => { if (!el.contains(e.target)) binding.value(e) }
		document.addEventListener('click', el._clickOutside, true)
	},
	unmounted(el) {
		document.removeEventListener('click', el._clickOutside, true)
	},
}

function selectSection(id) {
	const target = menuSections.value.find((section) => section.id === id)
	if (!target?.enabled) return
	store.setActiveSection(id)
}
function toggleVisibility(id) { store.toggleSectionVisibility(id) }
function moveUp(i) { store.reorderSections(i, i - 1) }
function moveDown(i) { store.reorderSections(i, i + 1) }

function addSection(mod) {
	store.updateMenuSections([...menuSections.value, {
		id: mod.id, title: mod.title, icon: mod.icon, enabled: true, order: menuSections.value.length,
	}])
	showAddPopup.value = false
}

function setColor(color) { store.setThemeColor(color) }
function update(partial) { store.updateGlobalSettings(partial) }
</script>

<style scoped lang="scss">
/* ── Panel shell ── */
.side-panel {
	height: 100%;
	overflow-y: auto;
	padding: 10px 10px 40px;
	display: flex;
	flex-direction: column;
	gap: 8px;
	background: #fafafa;
	scrollbar-width: thin;
	scrollbar-color: #e5e7eb transparent;
}

.panel-card {
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 10px;
	overflow: visible;
}

/* ── Card header ── */
.card-header {
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 11px 12px 9px;
	border-bottom: 1px solid #f3f4f6;
}

.card-svg-icon {
	width: 14px;
	height: 14px;
	color: #6b7280;
	flex-shrink: 0;
}

.card-title {
	font-size: 12.5px;
	font-weight: 600;
	color: #111827;
	flex: 1;
	letter-spacing: 0.01em;
}

.current-color-preview {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	border: 1.5px solid rgba(0,0,0,0.1);
	flex-shrink: 0;
}

/* ── Module list ── */
.module-list {
	padding: 6px 8px 2px;
}

.module-item {
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 6px 7px;
	border-radius: 7px;
	cursor: pointer;
	transition: background 0.12s;
	min-width: 0;

	&:hover { background: #f3f4f6; }
	&:hover .module-actions { opacity: 1; }

	&.active {
		background: #eff6ff;
		.module-title { color: #2563eb; font-weight: 600; }
		.drag-handle { color: #93c5fd; }
	}

	&.disabled .module-title { color: #9ca3af; }
}

.drag-handle {
	font-size: 13px;
	color: #d1d5db;
	cursor: grab;
	flex-shrink: 0;
	line-height: 1;
	user-select: none;
	&:active { cursor: grabbing; }
}

.module-icon { font-size: 13px; flex-shrink: 0; line-height: 1; }

.module-title {
	flex: 1;
	font-size: 12.5px;
	color: #374151;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.module-actions {
	display: flex;
	gap: 1px;
	opacity: 0;
	transition: opacity 0.12s;
	flex-shrink: 0;
}

.icon-btn {
	width: 22px;
	height: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	cursor: pointer;
	border-radius: 5px;
	color: #9ca3af;
	transition: background 0.1s, color 0.1s;
	padding: 0;

	svg { width: 13px; height: 13px; }

	&:hover { background: #e5e7eb; color: #374151; }

	&.vis-btn.hidden { color: #d1d5db; }
	&.vis-btn:hover { color: #f59e0b; background: #fef3c7; }
}

/* Add section */
.add-section-wrap {
	position: relative;
	padding: 6px 8px 8px;
}

.add-section-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 5px;
	width: 100%;
	padding: 6px;
	border-radius: 7px;
	border: 1.5px dashed #d1d5db;
	background: transparent;
	font-size: 12px;
	color: #9ca3af;
	cursor: pointer;
	transition: all 0.15s;

	svg { color: currentColor; }

	&:hover {
		border-color: #93c5fd;
		color: #2563eb;
		background: #eff6ff;
	}
}

.add-popup {
	position: absolute;
	top: calc(100% - 4px);
	left: 8px;
	right: 8px;
	background: #fff;
	border: 1px solid #e5e7eb;
	border-radius: 9px;
	box-shadow: 0 10px 30px rgba(0,0,0,0.13);
	z-index: 100;
	overflow: hidden;
}

.add-popup-item {
	display: flex;
	align-items: center;
	gap: 9px;
	width: 100%;
	padding: 8px 13px;
	background: none;
	border: none;
	text-align: left;
	font-size: 12.5px;
	color: #374151;
	cursor: pointer;
	transition: background 0.1s;

	.popup-icon { font-size: 14px; }

	&:hover { background: #f3f4f6; }
}

.add-popup-empty {
	padding: 12px;
	text-align: center;
	font-size: 12px;
	color: #9ca3af;
}

.popup-fade-enter-active, .popup-fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.popup-fade-enter-from, .popup-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Theme colors ── */
.theme-color-body {
	padding: 10px 12px 12px;
}

.color-swatches {
	display: flex;
	flex-wrap: wrap;
	gap: 7px;
	align-items: center;
}

.color-swatch {
	position: relative;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	border: 2px solid transparent;
	cursor: pointer;
	transition: transform 0.15s, box-shadow 0.15s;
	display: flex;
	align-items: center;
	justify-content: center;
	outline: none;
	flex-shrink: 0;

	&:hover { transform: scale(1.2); }

	&.selected {
		box-shadow: 0 0 0 2px #fff, 0 0 0 4px currentColor;
		border-color: rgba(255,255,255,0.4);
	}
}

.check-icon {
	width: 13px;
	height: 13px;
	filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));
}

.custom-swatch {
	background: #f3f4f6;
	border: 1.5px dashed #d1d5db !important;
	color: #9ca3af;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;

	svg { width: 12px; height: 12px; }

	&:hover { border-color: #93c5fd; color: #2563eb; background: #eff6ff; }
}

.hidden-color-input {
	position: absolute;
	width: 0;
	height: 0;
	opacity: 0;
	pointer-events: none;
}

.custom-color-row {
	display: flex;
	align-items: center;
	gap: 7px;
	margin-top: 8px;
	padding: 5px 8px;
	background: #f9fafb;
	border-radius: 6px;
	border: 1px solid #e5e7eb;
}

.custom-color-dot {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	border: 1px solid rgba(0,0,0,0.1);
	flex-shrink: 0;
}

.custom-color-hex {
	font-size: 11px;
	font-family: monospace;
	color: #374151;
}

.custom-color-label {
	font-size: 11px;
	color: #9ca3af;
}

/* ── Settings list (shared by Typography / Spacing / Mode) ── */
.settings-list {
	padding: 6px 12px 10px;
	display: flex;
	flex-direction: column;
	gap: 0;
}

.settings-item {
	display: grid;
	grid-template-columns: auto 1fr auto;
	align-items: center;
	gap: 8px;
	padding: 7px 0;
	border-bottom: 1px solid #f3f4f6;

	&:last-child { border-bottom: none; }
}

.item-label {
	font-size: 12px;
	color: #374151;
	font-weight: 500;
	white-space: nowrap;
	min-width: 58px;
}

.item-desc {
	font-size: 11px;
	color: #9ca3af;
	grid-column: 2;
}

.item-select {
	grid-column: 2 / -1;
	border: 1px solid #e5e7eb;
	border-radius: 5px;
	padding: 4px 8px;
	font-size: 12px;
	background: #fff;
	color: #374151;
	cursor: pointer;
	outline: none;
	transition: border-color 0.15s;
	width: 100%;

	&:focus { border-color: #93c5fd; }
}

/* Number stepper */
.number-row {
	grid-column: 2 / -1;
	display: flex;
	align-items: center;
	gap: 0;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	overflow: hidden;
	width: fit-content;
	margin-left: auto;
}

.num-btn {
	width: 26px;
	height: 26px;
	border: none;
	background: #f9fafb;
	font-size: 14px;
	color: #6b7280;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
	transition: background 0.1s;

	&:hover { background: #e5e7eb; color: #111827; }
	&:active { background: #d1d5db; }
}

.num-val {
	width: 32px;
	text-align: center;
	font-size: 12px;
	font-weight: 600;
	color: #111827;
	border-left: 1px solid #e5e7eb;
	border-right: 1px solid #e5e7eb;
	line-height: 26px;
}

/* Slider row */
.slider-row {
	grid-column: 2 / -1;
	display: flex;
	align-items: center;
	gap: 8px;

	input[type="range"] {
		flex: 1;
		height: 3px;
		accent-color: #2563eb;
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
		background: linear-gradient(to right, #2563eb calc(var(--pct, 50%) * 1%), #e5e7eb 0%);
		border-radius: 2px;
		outline: none;

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			width: 14px;
			height: 14px;
			border-radius: 50%;
			background: #2563eb;
			border: 2px solid #fff;
			box-shadow: 0 1px 4px rgba(37,99,235,0.4);
			cursor: pointer;
			transition: box-shadow 0.15s;
		}

		&:hover::-webkit-slider-thumb { box-shadow: 0 2px 8px rgba(37,99,235,0.5); }
	}
}

.slider-badge {
	font-size: 11px;
	font-weight: 600;
	color: #2563eb;
	min-width: 24px;
	text-align: right;
	background: #eff6ff;
	border-radius: 4px;
	padding: 1px 4px;
}

/* Toggle switch */
.toggle-switch {
	position: relative;
	cursor: pointer;
	grid-column: 3;

	input { display: none; }

	.track {
		display: block;
		width: 34px;
		height: 19px;
		background: #d1d5db;
		border-radius: 10px;
		transition: background 0.2s;
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: 2.5px;
			left: 2.5px;
			width: 14px;
			height: 14px;
			border-radius: 50%;
			background: #fff;
			box-shadow: 0 1px 3px rgba(0,0,0,0.25);
			transition: transform 0.2s;
		}
	}

	input:checked + .track {
		background: #2563eb;
		&::after { transform: translateX(15px); }
	}
}
</style>
