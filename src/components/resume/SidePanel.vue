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
					:class="{
						active: activeSection === section.id,
						disabled: !section.enabled,
						dragging: draggingIndex === index,
						'drop-target': dropIndex === index && draggingIndex !== null,
					}"
					draggable="true"
					@dragstart="onDragStart(index, $event)"
					@dragend="onDragEnd"
					@dragover.prevent="onDragOver(index)"
					@dragleave="onDragLeave(index)"
					@drop="onDrop(index, $event)"
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

		<!-- ── 求职意向 ── -->
		<div class="panel-card">
			<div class="card-header">
				<svg class="card-svg-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
				<span class="card-title">求职意向</span>
			</div>
			<div class="career-intent-body">
				<div class="intent-row">
					<span class="intent-label">目标岗位</span>
					<input
						class="intent-input"
						:value="careerIntent.targetRole"
						@input="e => updateCareerIntent({ targetRole: e.detail?.value ?? e.target?.value })"
						placeholder="目标岗位"
					/>
				</div>
				<div class="intent-row">
					<span class="intent-label">工作年限</span>
					<input
						class="intent-input"
						:value="careerIntent.experienceYear"
						@input="e => updateCareerIntent({ experienceYear: e.detail?.value ?? e.target?.value })"
						placeholder="应届生 / 1-3年"
					/>
				</div>
				<div class="intent-row">
					<span class="intent-label">目标城市</span>
					<input
						class="intent-input"
						:value="careerIntent.targetCities"
						@input="e => updateCareerIntent({ targetCities: e.detail?.value ?? e.target?.value })"
						placeholder="北京, 上海"
					/>
				</div>
				<div class="intent-row">
					<span class="intent-label">核心技能</span>
					<input
						class="intent-input"
						:value="careerIntent.coreSkills"
						@input="e => updateCareerIntent({ coreSkills: e.detail?.value ?? e.target?.value })"
						placeholder="Java, Spring Boot"
					/>
				</div>
				<div class="intent-row vertical">
					<span class="intent-label">补充信息</span>
					<textarea
						class="intent-textarea"
						:value="careerIntent.extraInfo"
						@input="e => updateCareerIntent({ extraInfo: e.detail?.value ?? e.target?.value })"
						placeholder="项目亮点、期望行业等"
						rows="2"
					></textarea>
				</div>
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
import { normalizeMenuSection, mergeMenuSections } from '@/utils/resume/serializer'

const store = useResumeStore()
const showAddPopup = ref(false)
const draggingIndex = ref(null)
const dropIndex = ref(null)

const gs = computed(() => store.activeResume?.globalSettings || {})
const careerIntent = computed(() => store.activeResume?.customData?.careerIntent || {
	targetRole: '',
	experienceYear: '',
	targetCities: '',
	coreSkills: '',
	extraInfo: ''
})
const themeColor = computed(() => gs.value.themeColor || '#000000')

function updateCareerIntent(partial) {
	store.updateCareerIntent(partial)
}
// 仅展示简历已有的模块（不补全默认列表），让「添加模块」弹窗负责提供未添加的模块
const menuSections = computed(() => {
	const sections = store.activeResume?.menuSections || []
	return sections
		.map(normalizeMenuSection)
		.filter(Boolean)
		.sort((a, b) => a.order - b.order)
})
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
	if (!target) return
	// enabled 仅控制预览区是否展示，编辑区始终允许切换以便填写内容
	store.setActiveSection(id)
}
function toggleVisibility(id) { store.toggleSectionVisibility(id) }
function moveUp(i) { store.reorderSections(i, i - 1) }
function moveDown(i) { store.reorderSections(i, i + 1) }

function onDragStart(index, e) {
	draggingIndex.value = index
	if (e.dataTransfer) {
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.setData('text/plain', String(index))
	}
}

function onDragEnd() {
	draggingIndex.value = null
	dropIndex.value = null
}

function onDragOver(index) {
	if (dropIndex.value !== index) dropIndex.value = index
}

function onDragLeave(index) {
	if (dropIndex.value === index) dropIndex.value = null
}

function onDrop(index, e) {
	e.preventDefault()
	const from = draggingIndex.value
	draggingIndex.value = null
	dropIndex.value = null
	if (from === null || from === index) return
	store.reorderSections(from, index)
}

function addSection(mod) {
	store.updateMenuSections([...menuSections.value, {
		id: mod.id, title: mod.title, icon: mod.icon, enabled: true, order: menuSections.value.length,
	}])
	// 给空模块自动添加一条占位项，让右侧立刻看到结构
	const resume = store.activeResume
	if (mod.id === 'experience' && !(resume?.experience?.length)) {
		store.addExperience({ company: '', position: '', date: '', details: '' })
	} else if (mod.id === 'projects' && !(resume?.projects?.length)) {
		store.addProject({ name: '', role: '', date: '', description: '' })
	} else if (mod.id === 'education' && !(resume?.education?.length)) {
		store.addEducation({ school: '', major: '', degree: '', startDate: '', endDate: '', isCurrent: false, description: '' })
	}
	// 跳转到该模块，方便用户立即编辑
	store.setActiveSection(mod.id)
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
	background: var(--bg-card);
	scrollbar-width: thin;
	scrollbar-color: var(--border-color) transparent;
	
	&::-webkit-scrollbar {
		width: 4px;
	}
	&::-webkit-scrollbar-track {
		background: transparent;
	}
	&::-webkit-scrollbar-thumb {
		background: var(--border-color);
		border-radius: 10px;
	}
	&::-webkit-scrollbar-thumb:hover {
		background: var(--text-muted);
	}
}

.panel-card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	overflow: visible;
	transition: all var(--transition-fast);
	
	&:hover {
		box-shadow: var(--shadow-sm);
	}
}

/* ── Card header ── */
.card-header {
	display: flex;
	align-items: center;
	gap: 7px;
	padding: 11px 12px 9px;
	border-bottom: 1px solid var(--bg-page);
}

.card-svg-icon {
	width: 14px;
	height: 14px;
	color: var(--text-secondary);
	flex-shrink: 0;
	transition: color var(--transition-fast);
}

.card-title {
	font-size: 12.5px;
	font-weight: 600;
	color: var(--text-primary);
	flex: 1;
	letter-spacing: 0.01em;
}

.current-color-preview {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	border: 1.5px solid rgba(0,0,0,0.1);
	flex-shrink: 0;
	transition: transform 0.2s ease;
	
	&:hover {
		transform: scale(1.1);
	}
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
	border-radius: var(--radius-sm);
	cursor: pointer;
	transition: all var(--transition-fast);
	min-width: 0;
	position: relative;

	&:hover { 
		background: var(--bg-page); 
		transform: translateX(2px);
	}
	&:hover .module-actions { opacity: 1; }

	&.active {
		background: rgba(37, 99, 235, 0.08);
		.module-title { color: var(--primary-light); font-weight: 600; }
		.drag-handle { color: #93c5fd; }
	}

	&.disabled .module-title { color: var(--text-muted); }

	&.dragging {
		opacity: 0.9;
		transform: scale(1.02) rotate(1deg);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		z-index: 100;
		transition: transform 150ms ease, box-shadow 150ms ease;
		background: var(--bg-card);
	}

	&.drop-target {
		outline: 2px dashed var(--color-accent-primary);
		outline-offset: -2px;
		background: var(--color-accent-subtle);
	}
}

.drag-handle {
	font-size: 13px;
	color: var(--border-color);
	cursor: grab;
	flex-shrink: 0;
	line-height: 1;
	user-select: none;
	transition: color var(--transition-fast);
	&:active { cursor: grabbing; }
	&:hover { color: var(--text-muted); }
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
	transition: color var(--transition-fast);
}

.module-actions {
	display: flex;
	gap: 1px;
	opacity: 0;
	transition: opacity var(--transition-fast);
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
	color: var(--text-muted);
	transition: all var(--transition-fast);
	padding: 0;

	svg { width: 13px; height: 13px; }

	&:hover { 
		background: var(--border-color); 
		color: var(--text-primary);
		transform: scale(1.1);
	}

	&.vis-btn.hidden { color: var(--border-color); }
	&.vis-btn:hover { 
		color: var(--warning-color); 
		background: #fef3c7;
	}
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
	border-radius: var(--radius-sm);
	border: 1.5px dashed var(--border-color);
	background: transparent;
	font-size: 12px;
	color: var(--text-muted);
	cursor: pointer;
	transition: all var(--transition-fast);

	svg { color: currentColor; }

	&:hover {
		border-color: var(--primary-light);
		color: var(--primary-light);
		background: rgba(37, 99, 235, 0.05);
		transform: translateY(-1px);
	}
	&:active {
		transform: translateY(0);
	}
}

.add-popup {
	position: absolute;
	top: calc(100% - 4px);
	left: 8px;
	right: 8px;
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	box-shadow: var(--shadow-lg);
	z-index: 100;
	overflow: hidden;
	animation: slideDown 0.2s ease;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
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
	transition: all var(--transition-fast);

	.popup-icon { font-size: 14px; }

	&:hover { 
		background: var(--bg-page);
		padding-left: 16px;
	}
}

.add-popup-empty {
	padding: 12px;
	text-align: center;
	font-size: 12px;
	color: var(--text-muted);
}

.popup-fade-enter-active, .popup-fade-leave-active { 
	transition: opacity 0.15s, transform 0.15s; 
}
.popup-fade-enter-from, .popup-fade-leave-to { 
	opacity: 0; 
	transform: translateY(-4px); 
}

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
	transition: all 0.15s;
	display: flex;
	align-items: center;
	justify-content: center;
	outline: none;
	flex-shrink: 0;

	&:hover { transform: scale(1.2); }

	&.selected {
		box-shadow: 0 0 0 2px var(--bg-card), 0 0 0 4px currentColor;
		border-color: rgba(255,255,255,0.4);
	}
}

.check-icon {
	width: 13px;
	height: 13px;
	filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));
}

.custom-swatch {
	background: var(--bg-page);
	border: 1.5px dashed var(--border-color) !important;
	color: var(--text-muted);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;

	svg { width: 12px; height: 12px; }

	&:hover { 
		border-color: var(--primary-light); 
		color: var(--primary-light); 
		background: rgba(37, 99, 235, 0.05);
	}
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
	background: var(--bg-page);
	border-radius: var(--radius-sm);
	border: 1px solid var(--border-color);
	transition: all var(--transition-fast);
	
	&:hover {
		border-color: var(--primary-light);
	}
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
	color: var(--text-muted);
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
	border-bottom: 1px solid var(--bg-page);

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
	color: var(--text-muted);
	grid-column: 2;
}

.item-select {
	grid-column: 2 / -1;
	border: 1px solid var(--border-color);
	border-radius: 5px;
	padding: 4px 8px;
	font-size: 12px;
	background: var(--bg-card);
	color: #374151;
	cursor: pointer;
	outline: none;
	transition: all var(--transition-fast);
	width: 100%;

	&:focus { 
		border-color: var(--primary-light);
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}
}

/* Number stepper */
.number-row {
	grid-column: 2 / -1;
	display: flex;
	align-items: center;
	gap: 0;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	overflow: hidden;
	width: fit-content;
	margin-left: auto;
	transition: all var(--transition-fast);
	
	&:hover {
		border-color: var(--primary-light);
	}
}

.num-btn {
	width: 26px;
	height: 26px;
	border: none;
	background: var(--bg-page);
	font-size: 14px;
	color: var(--text-secondary);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	line-height: 1;
	transition: all var(--transition-fast);

	&:hover { 
		background: var(--border-color); 
		color: var(--text-primary);
	}
	&:active { 
		background: var(--text-muted);
		color: var(--bg-card);
	}
}

.num-val {
	width: 32px;
	text-align: center;
	font-size: 12px;
	font-weight: 600;
	color: var(--text-primary);
	border-left: 1px solid var(--border-color);
	border-right: 1px solid var(--border-color);
	line-height: 26px;
}

/* Slider row */
.slider-row {
	grid-column: 2 / -1;
	display: flex;
	align-items: center;
	gap: 8px;
}

input[type="range"] {
	flex: 1;
	min-width: 0;
	height: 4px;
	border-radius: 2px;
	background: var(--border-color);
	outline: none;
	cursor: pointer;
	-webkit-appearance: none;
	appearance: none;
	
	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--primary-light);
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: 0 1px 3px rgba(0,0,0,0.2);
		
		&:hover {
			transform: scale(1.2);
			box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
		}
	}
	
	&::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--primary-light);
		cursor: pointer;
		border: none;
		transition: all var(--transition-fast);
		box-shadow: 0 1px 3px rgba(0,0,0,0.2);
		
		&:hover {
			transform: scale(1.2);
		}
	}
}

.slider-badge {
	min-width: 32px;
	text-align: right;
	font-size: 11px;
	font-weight: 600;
	color: var(--primary-light);
	background: rgba(37, 99, 235, 0.08);
	padding: 2px 6px;
	border-radius: 4px;
}

/* Toggle switch */
.toggle-switch {
	position: relative;
	display: inline-block;
	width: 40px;
	height: 22px;
	cursor: pointer;

	input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.track {
		position: absolute;
		inset: 0;
		background: var(--border-color);
		border-radius: 9999px;
		transition: background 0.2s;

		&::after {
			content: '';
			position: absolute;
			top: 2px;
			left: 2px;
			width: 18px;
			height: 18px;
			background: var(--bg-card);
			border-radius: 50%;
			transition: transform 0.2s;
			box-shadow: 0 1px 3px rgba(0,0,0,0.2);
		}
	}

	input:checked + .track {
		background: var(--primary-light);
	}

	input:checked + .track::after {
		transform: translateX(18px);
	}
	
	&:hover .track {
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}
}

/* Career Intent */
.career-intent-body {
	padding: 12px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.intent-row {
	display: flex;
	align-items: center;
	gap: 8px;

	&.vertical {
		flex-direction: column;
		align-items: stretch;
		gap: 4px;
	}
}

.intent-label {
	font-size: 12px;
	color: var(--text-muted);
	flex-shrink: 0;
	width: 56px;
}

.intent-input,
.intent-textarea {
	flex: 1;
	min-width: 0;
	padding: 6px 8px;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	font-size: 12px;
	background: var(--bg-card);
	color: var(--text-primary);
	outline: none;
	transition: border-color 0.15s;

	&:focus {
		border-color: var(--primary-light);
	}

	&::placeholder {
		color: var(--text-muted);
	}
}

.intent-textarea {
	resize: vertical;
	min-height: 48px;
}
</style>
