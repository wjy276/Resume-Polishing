<template>
	<div class="classic-template" :class="`classic-template--${variant}`" :style="rootStyle">

		<!-- ══ 基本信息（永远渲染） ══ -->
		<header class="rt-basic" :class="`rt-basic--${basic.layout || 'left'}`" :style="{ marginBottom: `${gs.sectionSpacing || 16}px` }">
			<img
				v-if="basic.photoConfig?.visible !== false && basic.photo"
				:src="basic.photo"
				class="rt-photo"
				:style="photoStyle"
			/>
			<div class="rt-namebox">
				<h1 class="rt-name" :class="{ 'is-empty': !basic.name }">
					{{ basic.name || '请输入姓名' }}
				</h1>
				<div class="rt-job" :class="{ 'is-empty': !basic.title }">
					{{ basic.title || '请输入求职岗位' }}
				</div>
			</div>
			<div class="rt-fields" v-if="visibleFields.length || customFields.length">
				<div
					v-for="f in visibleFields"
					:key="f.key"
					class="rt-field"
					:class="{ 'is-empty': !basic[f.key] }"
				>
					<span v-if="gs.useIconMode" class="rt-field-icon">{{ basic.icons?.[f.key] || '•' }}</span>
					<span v-else class="rt-field-label">{{ f.label }}：</span>
					<span class="rt-field-value">{{ basic[f.key] || f.label }}</span>
				</div>
				<div
					v-for="cf in customFields"
					:key="cf.id"
					class="rt-field"
					:class="{ 'is-empty': !cf.value }"
				>
					<span v-if="gs.useIconMode" class="rt-field-icon">{{ cf.icon || '🔗' }}</span>
					<span v-else class="rt-field-label">{{ cf.label }}：</span>
					<span class="rt-field-value">{{ cf.value || cf.label || '自定义字段' }}</span>
				</div>
			</div>
		</header>

		<!-- ══ 其它模块按 menuSections 排序逐个渲染 ══ -->
		<section
			v-for="section in nonBasicSections"
			:key="section.id"
			class="rt-section"
			:style="{ marginTop: `${gs.sectionSpacing || 16}px` }"
		>
			<h2 class="rt-section-title" :style="titleStyle">{{ section.title }}</h2>

			<!-- 工作经历 -->
			<template v-if="section.id === 'experience'">
				<div v-if="experience.length">
					<div v-for="exp in experience" :key="exp.id" class="rt-item">
						<div class="rt-item-head">
							<span class="rt-item-title" :class="{ 'is-empty': !exp.company }">{{ exp.company || '公司名称' }}</span>
							<span class="rt-item-date">{{ exp.date }}</span>
						</div>
						<div class="rt-item-sub" :class="{ 'is-empty': !exp.position }">{{ exp.position || '岗位名称' }}</div>
						<div class="rt-rich" v-html="exp.details || '<p class=&quot;rt-empty-rich&quot;>填写工作职责与业绩</p>'" />
					</div>
				</div>
				<div v-else class="rt-empty">点击左侧"+ 添加工作经历"开始编辑</div>
			</template>

			<!-- 项目经历 -->
			<template v-else-if="section.id === 'projects'">
				<div v-if="projects.length">
					<div v-for="p in projects" :key="p.id" class="rt-item">
						<div class="rt-item-head">
							<span class="rt-item-title" :class="{ 'is-empty': !p.name }">{{ p.name || '项目名称' }}</span>
							<span class="rt-item-date">{{ p.date }}</span>
						</div>
						<div v-if="p.role || true" class="rt-item-sub" :class="{ 'is-empty': !p.role }">{{ p.role || '担任角色' }}</div>
						<div class="rt-rich" v-html="p.description || '<p class=&quot;rt-empty-rich&quot;>填写项目背景与成果</p>'" />
					</div>
				</div>
				<div v-else class="rt-empty">点击左侧"+ 添加项目经历"开始编辑</div>
			</template>

			<!-- 教育背景 -->
			<template v-else-if="section.id === 'education'">
				<div v-if="education.length">
					<div v-for="edu in education" :key="edu.id" class="rt-item">
						<div class="rt-item-head">
							<span class="rt-item-title" :class="{ 'is-empty': !edu.school }">{{ edu.school || '学校名称' }}</span>
							<span class="rt-item-date">{{ formatEduDate(edu) }}</span>
						</div>
						<div class="rt-item-sub" :class="{ 'is-empty': !edu.major && !edu.degree }">
							{{ edu.major || '专业' }}<span v-if="edu.degree"> · {{ edu.degree }}</span>
						</div>
						<div v-if="edu.description" class="rt-rich" v-html="edu.description" />
					</div>
				</div>
				<div v-else class="rt-empty">点击左侧"+ 添加教育经历"开始编辑</div>
			</template>

			<!-- 专业技能 -->
			<template v-else-if="section.id === 'skills'">
				<div
					v-if="hasContent(skillContent)"
					class="rt-rich"
					v-html="skillContent"
				/>
				<div v-else class="rt-empty">在左侧填写你的专业技能</div>
			</template>

			<!-- 自我评价 -->
			<template v-else-if="section.id === 'selfEvaluation'">
				<div
					v-if="hasContent(selfEvaluationContent)"
					class="rt-rich"
					v-html="selfEvaluationContent"
				/>
				<div v-else class="rt-empty">在左侧填写自我评价</div>
			</template>

			<!-- 证书荣誉 -->
			<template v-else-if="section.id === 'certificates'">
				<div v-if="certs.length">
					<div v-for="c in certs" :key="c.id" class="rt-item">
						<div class="rt-item-head">
							<span class="rt-item-title" :class="{ 'is-empty': !c.title }">{{ c.title || '证书名称' }}</span>
							<span class="rt-item-date">{{ c.date }}</span>
						</div>
						<div v-if="c.issuer" class="rt-item-sub">{{ c.issuer }}</div>
						<div v-if="c.description" class="rt-rich" v-html="c.description" />
					</div>
				</div>
				<div v-else class="rt-empty">点击左侧"+ 添加荣誉证书"开始编辑</div>
			</template>

			<!-- 自定义模块 -->
			<template v-else-if="section.id.startsWith('custom')">
				<div v-if="(customData[section.id] || []).length">
					<div v-for="it in customData[section.id]" :key="it.id" class="rt-item">
						<div class="rt-item-head">
							<span class="rt-item-title" :class="{ 'is-empty': !it.title }">{{ it.title || '标题' }}</span>
							<span class="rt-item-date">{{ it.dateRange }}</span>
						</div>
						<div v-if="it.subtitle" class="rt-item-sub">{{ it.subtitle }}</div>
						<div v-if="it.description" class="rt-rich" v-html="it.description" />
					</div>
				</div>
				<div v-else class="rt-empty">点击左侧"+ 添加条目"开始编辑</div>
			</template>
		</section>
	</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	// 简历对象。直接传 store.activeResume 即可（reactive 对象）。
	data: { type: Object, default: null },
	variant: { type: String, default: 'classic' },
})

// ─── 安全取值：所有引用都走 props.data?. 链式，避免一处 undefined 整页爆 ───
const gs           = computed(() => props.data?.globalSettings || {})
const basic        = computed(() => props.data?.basic || {})
const experience   = computed(() => props.data?.experience || [])
const projects     = computed(() => props.data?.projects || [])
const education    = computed(() => props.data?.education || [])
const skillContent = computed(() => props.data?.skillContent || '')
const selfEvaluationContent = computed(() => props.data?.selfEvaluationContent || '')
const customData   = computed(() => props.data?.customData || {})
const certs        = computed(() => customData.value.certificates || [])

const nonBasicSections = computed(() =>
	(props.data?.menuSections || [])
		.filter((s) => s.enabled && s.id !== 'basic')
		.sort((a, b) => a.order - b.order)
)

// ─── 基本信息可见字段（永远按 fieldOrder 渲染，空值用占位） ───
const visibleFields = computed(() =>
	(basic.value.fieldOrder || []).filter(
		(f) => f.visible !== false && f.key !== 'name' && f.key !== 'title'
	)
)

const customFields = computed(() =>
	(basic.value.customFields || []).filter((f) => f.visible !== false)
)

// ─── 工具 ───
function formatEduDate(edu) {
	if (!edu) return ''
	const s = edu.startDate || ''
	const e = edu.isCurrent ? '至今' : (edu.endDate || '')
	if (!s && !e) return ''
	return `${s}${s ? ' - ' : ''}${e}`
}

function hasContent(html) {
	if (!html) return false
	const stripped = String(html)
		.replace(/<p>\s*<\/p>/g, '')
		.replace(/<p>(\s|<br\s*\/?>)*<\/p>/g, '')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.trim()
	return stripped.length > 0
}

// ─── 样式 ───
const rootStyle = computed(() => ({
	fontSize: `${gs.value.baseFontSize || 14}px`,
	lineHeight: gs.value.lineHeight || 1.5,
	fontFamily: gs.value.fontFamily && gs.value.fontFamily !== 'default' ? gs.value.fontFamily : 'inherit',
	color: '#1f2937',
	width: '100%',
}))

const titleStyle = computed(() => ({
	fontSize: `${gs.value.headerSize || 18}px`,
	fontWeight: '700',
	color: gs.value.themeColor || '#000',
	paddingBottom: '4px',
	borderBottom: `2px solid ${gs.value.themeColor || '#000'}`,
	marginBottom: `${gs.value.paragraphSpacing || 12}px`,
}))

const photoStyle = computed(() => {
	const pc = basic.value.photoConfig || {}
	const radius = pc.borderRadius === 'full' ? '9999px' : pc.borderRadius === 'medium' ? '8px' : '0'
	return {
		width: `${pc.width || 80}px`,
		height: `${pc.height || 100}px`,
		objectFit: 'cover',
		borderRadius: radius,
		flexShrink: '0',
	}
})
</script>

<style scoped>
.classic-template { box-sizing: border-box; }

/* ─── 基本信息 ─── */
.rt-basic {
	display: flex;
	align-items: center;
	gap: 16px;
	flex-wrap: wrap;
	padding-bottom: 8px;
	border-bottom: 1px solid #e5e7eb;
}
.rt-basic--center { flex-direction: column; text-align: center; }
.rt-basic--right  { flex-direction: row-reverse; }

.rt-photo { display: block; }

.rt-namebox { min-width: 0; flex: 1; }
.rt-basic--center .rt-namebox { flex: 0 1 auto; }

.rt-name {
	font-size: 28px;
	font-weight: 700;
	margin: 0;
	color: #111827;
	line-height: 1.2;
}
.rt-job {
	font-size: 14px;
	color: #4b5563;
	margin-top: 4px;
}

.rt-fields {
	display: flex;
	flex-wrap: wrap;
	gap: 6px 18px;
	flex: 1 1 280px;
	min-width: 0;
	justify-content: flex-end;
}
.rt-basic--center .rt-fields { justify-content: center; flex-basis: 100%; }
.rt-basic--left   .rt-fields { justify-content: flex-end; }
.rt-basic--right  .rt-fields { justify-content: flex-start; }

.rt-field {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	white-space: nowrap;
	font-size: 13px;
	color: #374151;
}
.rt-field-icon  { font-size: 12px; }
.rt-field-label { color: #6b7280; }

/* ─── Section ─── */
.rt-section { page-break-inside: avoid; }
.rt-section-title { margin: 0; }

.rt-item { margin-bottom: 12px; page-break-inside: avoid; }

.rt-item-head {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 8px;
}
.rt-item-title {
	font-size: 15px;
	font-weight: 600;
	color: #111827;
}
.rt-item-date {
	font-size: 13px;
	color: #6b7280;
}
.rt-item-sub {
	font-size: 13px;
	color: #4b5563;
	margin: 2px 0 4px;
}

/* ─── Rich text ─── */
.rt-rich :deep(ul) { margin: 0; padding-left: 1.2em; }
.rt-rich :deep(li) { margin-bottom: 2px; }
.rt-rich :deep(p)  { margin: 0 0 4px 0; }
.rt-rich :deep(.rt-empty-rich) {
	color: #c4c8d1;
	font-style: italic;
}

/* ─── 空值/空模块占位（屏幕显示，打印隐藏）─── */
.is-empty {
	color: #c4c8d1 !important;
	font-style: italic;
	font-weight: normal !important;
}

.rt-empty {
	color: #c4c8d1;
	font-size: 12px;
	font-style: italic;
	padding: 6px 0;
}

@media print {
	.is-empty,
	.rt-empty,
	.rt-rich :deep(.rt-empty-rich) {
		display: none !important;
	}
	.rt-field.is-empty { display: none !important; }
}

/* ─── 模板变体 ─── */
.classic-template--professional .rt-section-title {
	text-transform: uppercase;
	letter-spacing: 0.06em;
}
.classic-template--creative .rt-section-title {
	border-bottom-style: dashed !important;
}
.classic-template--simple .rt-section-title {
	border-bottom-width: 1px !important;
}
</style>
