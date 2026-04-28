<template>
	<div class="classic-template" :class="`classic-template--${variant}`" :style="templateStyle">
		<template v-for="section in enabledSections" :key="section.id">
			<!-- ══ 基本信息 ══ -->
		<template v-if="section.id === 'basic'">

			<!-- ── center: 头像居中，文字居中，字段居中一行 ── -->
			<div v-if="basic.layout === 'center'" class="basic-center-wrap" :style="{ marginBottom: `${sectionSpacing}px` }">
				<img v-if="showPhoto && basic.photo" :src="basic.photo" class="basic-photo" :style="photoStyle" />
				<div class="basic-name-block basic-name-block--center">
					<div v-if="showName && basic.name" class="basic-name" :style="nameStyle">{{ basic.name }}</div>
					<div v-if="showTitle && basic.title" class="basic-job-title" :style="jobTitleStyle">{{ basic.title }}</div>
				</div>
				<div class="basic-fields basic-fields--wrap" :style="fieldsStyle">
					<div v-for="field in visibleBasicFields" :key="field.key" class="basic-field-item">
						<span v-if="gs.useIconMode" class="field-icon">{{ basic.icons?.[field.key] || '' }}</span>
						<span v-else class="field-label">{{ field.label }}：</span>
						<span class="field-value">{{ getFieldValue(field.key) }}</span>
					</div>
					<div v-for="cf in visibleCustomFields" :key="cf.id" class="basic-field-item">
						<span v-if="gs.useIconMode" class="field-icon">{{ cf.icon || '🔗' }}</span>
						<span v-else class="field-label">{{ cf.label }}：</span>
						<span class="field-value">{{ cf.value }}</span>
					</div>
				</div>
			</div>

			<!-- ── left: 头像在左，名字/职位在头像右侧，联系字段在最右 ── -->
			<div
				v-else-if="basic.layout === 'left'"
				class="basic-lr-wrap"
				:class="{ 'basic-lr-wrap--flexible': gs.flexibleHeaderLayout }"
				:style="{ marginBottom: `${sectionSpacing}px` }"
			>
				<div class="basic-photo-name">
					<img v-if="showPhoto && basic.photo" :src="basic.photo" class="basic-photo" :style="photoStyle" />
					<div class="basic-name-block">
						<div v-if="showName && basic.name" class="basic-name" :style="nameStyle">{{ basic.name }}</div>
						<div v-if="showTitle && basic.title" class="basic-job-title" :style="jobTitleStyle">{{ basic.title }}</div>
					</div>
				</div>
				<div class="basic-fields basic-fields--grid" :style="fieldsStyle">
					<div v-for="field in visibleBasicFields" :key="field.key" class="basic-field-item">
						<span v-if="gs.useIconMode" class="field-icon">{{ basic.icons?.[field.key] || '' }}</span>
						<span v-else class="field-label">{{ field.label }}：</span>
						<span class="field-value">{{ getFieldValue(field.key) }}</span>
					</div>
					<div v-for="cf in visibleCustomFields" :key="cf.id" class="basic-field-item">
						<span v-if="gs.useIconMode" class="field-icon">{{ cf.icon || '🔗' }}</span>
						<span v-else class="field-label">{{ cf.label }}：</span>
						<span class="field-value">{{ cf.value }}</span>
					</div>
				</div>
			</div>

			<!-- ── right: 联系字段在左，名字/职位在右，头像在最右 ── -->
			<div
				v-else
				class="basic-lr-wrap basic-lr-wrap--reverse"
				:class="{ 'basic-lr-wrap--flexible': gs.flexibleHeaderLayout }"
				:style="{ marginBottom: `${sectionSpacing}px` }"
			>
				<div class="basic-fields basic-fields--grid" :style="fieldsStyle">
					<div v-for="field in visibleBasicFields" :key="field.key" class="basic-field-item">
						<span v-if="gs.useIconMode" class="field-icon">{{ basic.icons?.[field.key] || '' }}</span>
						<span v-else class="field-label">{{ field.label }}：</span>
						<span class="field-value">{{ getFieldValue(field.key) }}</span>
					</div>
					<div v-for="cf in visibleCustomFields" :key="cf.id" class="basic-field-item">
						<span v-if="gs.useIconMode" class="field-icon">{{ cf.icon || '🔗' }}</span>
						<span v-else class="field-label">{{ cf.label }}：</span>
						<span class="field-value">{{ cf.value }}</span>
					</div>
				</div>
				<div class="basic-photo-name basic-photo-name--rev">
					<div class="basic-name-block basic-name-block--right">
						<div v-if="showName && basic.name" class="basic-name" :style="nameStyle">{{ basic.name }}</div>
						<div v-if="showTitle && basic.title" class="basic-job-title" :style="jobTitleStyle">{{ basic.title }}</div>
					</div>
					<img v-if="showPhoto && basic.photo" :src="basic.photo" class="basic-photo" :style="photoStyle" />
				</div>
			</div>

		</template>

			<!-- 分割线 -->
			<div v-if="section.id !== 'basic'" class="section-divider" :style="dividerStyle" />

			<!-- 工作经历 -->
			<div v-if="section.id === 'experience' && experience.length" class="section-block" :style="sectionSpacingStyle">
				<div class="section-title" :style="sectionTitleStyle">{{ section.title }}</div>
				<div v-for="exp in visibleExperience" :key="exp.id" class="exp-item" :style="itemSpacingStyle">
					<div class="exp-header">
						<span class="exp-company" :style="subheaderStyle">{{ exp.company }}</span>
						<span class="exp-date" :style="dateStyle">{{ exp.date }}</span>
					</div>
					<div class="exp-position" :style="positionStyle">{{ exp.position }}</div>
					<div class="exp-details rich-text" :style="richTextStyle" v-html="exp.details" />
				</div>
			</div>

			<!-- 项目经历 -->
			<div v-if="section.id === 'projects' && projects.length" class="section-block" :style="sectionSpacingStyle">
				<div class="section-title" :style="sectionTitleStyle">{{ section.title }}</div>
				<div v-for="proj in visibleProjects" :key="proj.id" class="exp-item" :style="itemSpacingStyle">
					<div class="exp-header">
						<span class="exp-company" :style="subheaderStyle">{{ proj.name }}</span>
						<span class="exp-date" :style="dateStyle">{{ proj.date }}</span>
					</div>
					<div v-if="proj.role" class="exp-position" :style="positionStyle">{{ proj.role }}</div>
					<div class="exp-details rich-text" :style="richTextStyle" v-html="proj.description" />
				</div>
			</div>

			<!-- 教育背景 -->
			<div v-if="section.id === 'education' && education.length" class="section-block" :style="sectionSpacingStyle">
				<div class="section-title" :style="sectionTitleStyle">{{ section.title }}</div>
				<div v-for="edu in visibleEducation" :key="edu.id" class="exp-item" :style="itemSpacingStyle">
					<div class="exp-header">
						<span class="exp-company" :style="subheaderStyle">{{ edu.school }}</span>
						<span class="exp-date" :style="dateStyle">{{ edu.startDate }}{{ edu.startDate ? ' - ' : '' }}{{ edu.isCurrent ? '至今' : edu.endDate }}</span>
					</div>
					<div class="exp-position" :style="positionStyle">{{ edu.major }}<span v-if="edu.degree"> · {{ edu.degree }}</span></div>
					<div v-if="edu.description" class="exp-details rich-text" :style="richTextStyle" v-html="edu.description" />
				</div>
			</div>

			<!-- 专业技能 -->
			<div v-if="section.id === 'skills' && skillContent" class="section-block" :style="sectionSpacingStyle">
				<div class="section-title" :style="sectionTitleStyle">{{ section.title }}</div>
				<div class="rich-text" :style="richTextStyle" v-html="skillContent" />
			</div>

			<!-- 自我评价 -->
			<div v-if="section.id === 'selfEvaluation' && selfEvaluationContent" class="section-block" :style="sectionSpacingStyle">
				<div class="section-title" :style="sectionTitleStyle">{{ section.title }}</div>
				<div class="rich-text" :style="richTextStyle" v-html="selfEvaluationContent" />
			</div>

		<!-- 荣誉证书 -->
		<div v-if="section.id === 'certificates' && customData['certificates']?.length" class="section-block" :style="sectionSpacingStyle">
			<div class="section-title" :style="sectionTitleStyle">{{ section.title }}</div>
			<div v-for="cert in customData['certificates']" :key="cert.id" class="exp-item" :style="itemSpacingStyle">
				<div class="exp-header">
					<span class="exp-company" :style="subheaderStyle">{{ cert.title }}</span>
					<span class="exp-date" :style="dateStyle">{{ cert.date }}</span>
				</div>
				<div v-if="cert.issuer" class="exp-position" :style="positionStyle">{{ cert.issuer }}</div>
				<div v-if="cert.description" class="exp-details rich-text" :style="richTextStyle" v-html="cert.description" />
			</div>
		</div>

		<!-- 自定义模块（id 以 custom 开头）-->
		<div v-if="section.id.startsWith('custom') && customData[section.id]?.length" class="section-block" :style="sectionSpacingStyle">
			<div class="section-title" :style="sectionTitleStyle">{{ section.title }}</div>
			<div v-for="item in customData[section.id]" :key="item.id" class="exp-item" :style="itemSpacingStyle">
				<div class="exp-header">
					<span class="exp-company" :style="subheaderStyle">{{ item.title }}</span>
					<span class="exp-date" :style="dateStyle">{{ item.dateRange }}</span>
				</div>
				<div v-if="item.subtitle" class="exp-position" :style="positionStyle">{{ item.subtitle }}</div>
				<div v-if="item.description" class="exp-details rich-text" :style="richTextStyle" v-html="item.description" />
			</div>
		</div>
		</template>
	</div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	data: { type: Object, required: true },
	variant: { type: String, default: 'classic' },
})

const gs = computed(() => props.data?.globalSettings || {})
const basic = computed(() => props.data?.basic || {})
const education = computed(() => props.data?.education || [])
const experience = computed(() => props.data?.experience || [])
const projects = computed(() => props.data?.projects || [])
const skillContent = computed(() => props.data?.skillContent || '')
const selfEvaluationContent = computed(() => props.data?.selfEvaluationContent || '')
const customData = computed(() => props.data?.customData || {})

const enabledSections = computed(() =>
	(props.data?.menuSections || [])
		.filter((s) => s.enabled)
		.sort((a, b) => a.order - b.order)
)

const visibleExperience = computed(() => experience.value.filter((e) => e.visible !== false))
const visibleProjects = computed(() => projects.value.filter((p) => p.visible !== false))
const visibleEducation = computed(() => education.value.filter((e) => e.visible !== false))

const visibleBasicFields = computed(() =>
	(basic.value.fieldOrder || []).filter(
		(f) => f.visible !== false && f.key !== 'name' && f.key !== 'title' && getFieldValue(f.key)
	)
)
const showName = computed(() => getFieldVisible('name'))
const showTitle = computed(() => getFieldVisible('title'))
const showPhoto = computed(() => basic.value.photoConfig?.visible !== false)
const visibleCustomFields = computed(() =>
	(basic.value.customFields || []).filter((f) => f.visible !== false && f.value)
)

function getFieldValue(key) {
	return basic.value[key] || ''
}

function getFieldVisible(key) {
	const field = (basic.value.fieldOrder || []).find((item) => item.key === key)
	return field ? field.visible !== false : true
}

// ── styles ──
const themeColor = computed(() => gs.value.themeColor || '#000000')
const baseFontSize = computed(() => gs.value.baseFontSize || 14)
const headerSize = computed(() => gs.value.headerSize || 18)
const subheaderSize = computed(() => gs.value.subheaderSize || 15)
const lineHeight = computed(() => gs.value.lineHeight || 1.5)
const sectionSpacing = computed(() => gs.value.sectionSpacing || 16)
const paragraphSpacing = computed(() => gs.value.paragraphSpacing || 12)

const templateStyle = computed(() => ({
	fontFamily: 'inherit',
	fontSize: `${baseFontSize.value}px`,
	lineHeight: lineHeight.value,
	color: '#1f2937',
	width: '100%',
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

const nameStyle = computed(() => ({
	fontSize: '28px',
	fontWeight: '700',
	color: '#111827',
	lineHeight: '1.2',
}))

const jobTitleStyle = computed(() => ({
	fontSize: `${subheaderSize.value}px`,
	color: '#374151',
	marginTop: '4px',
	textAlign: gs.value.centerSubtitle ? 'center' : 'inherit',
}))

const fieldsStyle = computed(() => ({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '4px 20px',
	fontSize: `${baseFontSize.value}px`,
	color: '#4b5563',
	alignItems: 'center',
	flex: gs.value.flexibleHeaderLayout ? '1 1 320px' : '0 1 auto',
}))

const sectionTitleStyle = computed(() => ({
	fontSize: `${headerSize.value}px`,
	fontWeight: '700',
	color: themeColor.value,
	paddingBottom: '4px',
	borderBottom: `2px solid ${themeColor.value}`,
	marginBottom: `${paragraphSpacing.value}px`,
}))

const dividerStyle = computed(() => ({
	height: '0',
	marginTop: `${sectionSpacing.value}px`,
}))

const sectionSpacingStyle = computed(() => ({
	marginTop: `${sectionSpacing.value}px`,
}))

const subheaderStyle = computed(() => ({
	fontSize: `${subheaderSize.value}px`,
	fontWeight: '600',
	color: '#111827',
}))

const dateStyle = computed(() => ({
	fontSize: `${baseFontSize.value}px`,
	color: '#6b7280',
}))

const positionStyle = computed(() => ({
	fontSize: `${baseFontSize.value}px`,
	color: '#374151',
	marginTop: '2px',
	marginBottom: '4px',
}))

const richTextStyle = computed(() => ({
	fontSize: `${baseFontSize.value}px`,
	color: '#374151',
	lineHeight: lineHeight.value,
}))

const itemSpacingStyle = computed(() => ({
	marginBottom: `${paragraphSpacing.value}px`,
}))

const variant = computed(() => props.variant || 'classic')
</script>

<style scoped>
.classic-template {
	width: 100%;
	box-sizing: border-box;
}

.classic-template--professional .section-title {
	text-transform: uppercase;
	letter-spacing: 0.06em;
}

.classic-template--professional .exp-header {
	padding-bottom: 2px;
	border-bottom: 1px dashed #d1d5db;
}

.classic-template--creative .section-title {
	border-bottom-style: dashed !important;
}

.classic-template--creative .basic-name {
	letter-spacing: 0.04em;
}

.classic-template--simple .section-title {
	border-bottom-width: 1px !important;
}

/* ── CENTER layout ── */
.basic-center-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	padding-bottom: 4px;
}

/* ── LEFT / RIGHT layout shared wrapper ── */
.basic-lr-wrap {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 20px;
	padding-bottom: 4px;
	flex-wrap: wrap;
}

.basic-lr-wrap--flexible {
	align-items: flex-start;
}

/* Photo + name block side */
.basic-photo-name {
	display: flex;
	align-items: center;
	gap: 14px;
	flex-shrink: 0;
}

/* right layout: name/title text-align right, photo after text */
.basic-photo-name--rev {
	flex-direction: row;
}

/* Fields side */
.basic-fields--grid {
	display: flex;
	flex-wrap: wrap;
	flex: 1;
	min-width: 0;
}

/* Center layout fields wrap centered */
.basic-fields--wrap {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}

/* Name block */
.basic-name-block {
	min-width: 0;
}

.basic-name-block--center {
	text-align: center;
}

.basic-name-block--right {
	text-align: right;
}

.basic-name {
	word-break: break-word;
	font-weight: 700;
}

/* Field item */
.basic-field-item {
	display: flex;
	align-items: center;
	gap: 3px;
	white-space: nowrap;
}

.field-icon {
	font-size: 12px;
}

.field-label {
	color: #6b7280;
}

/* ── Sections ── */
.exp-item {
	page-break-inside: avoid;
}

.exp-header {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
	gap: 8px;
}

.section-block {
	page-break-inside: avoid;
}

/* Rich text from v-html */
.rich-text :deep(ul) {
	margin: 0;
	padding-left: 1.2em;
}

.rich-text :deep(li) {
	margin-bottom: 2px;
}

.rich-text :deep(p) {
	margin: 0 0 4px 0;
}
</style>
