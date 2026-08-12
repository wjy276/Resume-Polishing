<template>
	<view class="template-gallery">
		<view class="gallery-header">
			<button class="back-btn" @click="$emit('close')" title="返回">
				<svg viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
				<text>返回</text>
			</button>
			<text class="gallery-title">模板广场</text>
			<text class="gallery-desc">选择模板快速创建简历，内置预填示例内容的示例模板</text>
		</view>

		<view class="gallery-filters">
			<view
				v-for="cat in categories"
				:key="cat.value"
				class="filter-tag"
				:class="{ active: selectedCategory === cat.value }"
				@click="selectedCategory = cat.value"
			>
				<text>{{ cat.label }}</text>
			</view>
		</view>

		<view v-if="loading" class="gallery-loading">
			<view class="loading-spinner"></view>
			<text>加载中...</text>
		</view>

		<view v-else-if="filteredTemplates.length === 0" class="gallery-empty">
			<text class="empty-icon">📋</text>
			<text class="empty-text">暂无模板</text>
		</view>

		<view v-else class="template-grid">
			<view
				v-for="template in filteredTemplates"
				:key="template.id"
				class="template-card"
				@click="handleUseTemplate(template)"
			>
				<view class="card-preview">
					<text v-if="template.builtin" class="builtin-badge">示例</text>
					<!-- 内置示例：实时渲染简历缩略图 -->
					<view v-if="template.builtin" :ref="setSamplePreview" class="sample-preview" :style="samplePreviewStyle">
						<div class="preview-scaler" :style="sampleScalerStyle">
							<div class="preview-inner" :style="sampleInnerStyle">
								<ClassicTemplate :data="sampleResume" />
							</div>
						</div>
					</view>
					<!-- 服务端模板：有缩略图则展示图片 -->
					<image v-else-if="template.thumbnail" class="card-thumb" :src="template.thumbnail" mode="aspectFill" />
					<view v-else class="preview-placeholder">
						<text class="preview-icon">📄</text>
					</view>
					<view class="card-overlay">
						<text class="use-btn">使用模板</text>
					</view>
				</view>
				<view class="card-info">
					<text class="card-title">{{ template.name }}</text>
					<text class="card-author">by {{ template.author }}</text>
					<view class="card-meta">
						<text class="meta-usage">
							<text class="usage-icon">👁</text>
							{{ template.usageCount }} 次使用
						</text>
						<text class="meta-category">{{ getCategoryLabel(template.category) }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTemplateStore } from '@/stores/template'
import { useResumeStore } from '@/stores/resume'
import ClassicTemplate from '@/components/resume/ClassicTemplate.vue'
import { createSampleResume } from '@/utils/resume/initialData'

defineEmits(['close'])

const templateStore = useTemplateStore()
const resumeStore = useResumeStore()

const loading = ref(false)
const selectedCategory = ref('')
const samplePreviewRef = ref(null)
const sampleScale = ref(0.25)
let sampleResizeObserver = null

const A4_WIDTH_PX = 793.7
const A4_HEIGHT_PX = Math.round((A4_WIDTH_PX * 297) / 210)
const sampleResume = createSampleResume({ title: '示例简历（可直接修改）' })

const sampleScalerStyle = computed(() => ({
	width: `${A4_WIDTH_PX}px`,
	height: `${A4_HEIGHT_PX}px`,
	transform: `scale(${sampleScale.value})`,
	transformOrigin: 'top left',
	position: 'absolute',
	top: '0',
	left: '0',
}))

// 外层盒子与缩放后的图片同尺寸，保证图片完整显示且不裁剪
const samplePreviewStyle = computed(() => ({
	width: `${Math.round(A4_WIDTH_PX * sampleScale.value)}px`,
	height: `${Math.round(A4_HEIGHT_PX * sampleScale.value)}px`,
}))

const sampleInnerStyle = computed(() => {
	const gs = sampleResume?.globalSettings || {}
	return {
		padding: `${gs.pagePadding ?? 32}px`,
		background: '#ffffff',
		width: '100%',
		height: '100%',
		boxSizing: 'border-box',
	}
})

// v-for 中的字符串 ref 会被收集成数组，这里用函数 ref 拿真实元素
function setSamplePreview(el) {
	// uni-app 的 <view> 是组件，函数 ref 收到的是组件实例，需要取 $el
	const dom = el && el.$el ? el.$el : el
	samplePreviewRef.value = dom || null
	if (!dom) return
	if (dom?.parentElement) {
		updateSampleScale()
		if (typeof ResizeObserver !== 'undefined') {
			sampleResizeObserver?.disconnect()
			sampleResizeObserver = new ResizeObserver(updateSampleScale)
			sampleResizeObserver.observe(dom.parentElement)
		}
	}
}

function updateSampleScale() {
	const el = samplePreviewRef.value
	const container = el?.parentElement
	if (!container?.clientWidth || !container.clientHeight) return
	// 预留卡片内边距，让图片完整放进预览区
	const availW = container.clientWidth - 24
	const availH = container.clientHeight - 24
	const scale = Math.min(availW / A4_WIDTH_PX, availH / A4_HEIGHT_PX)
	if (scale > 0) sampleScale.value = scale
}

const categories = [
	{ value: '', label: '全部' },
	{ value: 'tech', label: '技术' },
	{ value: 'design', label: '设计' },
	{ value: 'business', label: '商务' },
	{ value: 'custom', label: '自定义' },
]

// 内置示例模板：直接使用 createSampleResume 生成预填示例内容的简历
const builtInTemplates = [
	{
		id: 'builtin-sample',
		name: '示例简历模板',
		description: '预填完整示例内容，可直接在此基础上修改',
		category: 'tech',
		author: '智简优面',
		usageCount: 0,
		builtin: true,
	},
]

const filteredTemplates = computed(() => {
	const source = [...builtInTemplates, ...templateStore.templates]
	if (!selectedCategory.value) return source
	return source.filter(t => t.category === selectedCategory.value)
})

onMounted(async () => {
	loading.value = true
	await templateStore.loadTemplates()
	loading.value = false
	await nextTick()
	updateSampleScale()
})

function getCategoryLabel(category) {
	const labels = {
		tech: '技术',
		design: '设计',
		business: '商务',
		custom: '自定义',
	}
	return labels[category] || category
}

async function handleUseTemplate(template) {
	uni.showLoading({ title: '创建中...' })

	let result
	if (template.builtin) {
		// 内置示例：直接创建预填示例内容的简历
		const created = await resumeStore.createResumeOnServer({
			title: '示例简历（可直接修改）',
		})
		result = created.success ? { success: true, data: { resumeId: created.id } } : created
	} else {
		result = await templateStore.useTemplate(template.id)
	}

	if (result.success && result.data) {
		uni.hideLoading()
		uni.showToast({ title: '创建成功', icon: 'success' })
		uni.navigateTo({
			url: `/pages/Resume/ResumeEditor?id=${result.data.resumeId}`,
		})
	} else {
		uni.hideLoading()
		uni.showToast({ title: result.message || '创建失败', icon: 'none' })
	}
}
</script>

<style scoped lang="scss">
.template-gallery {
	padding: 24px;
}

.gallery-header {
	margin-bottom: 20px;
}

.back-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 14px 6px 10px;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-card);
	color: var(--text-secondary);
	font-size: 13px;
	cursor: pointer;
	margin-bottom: 12px;
	transition: all var(--transition-fast);

	svg {
		width: 14px;
		height: 14px;
	}

	&:hover {
		border-color: var(--primary-light);
		color: var(--primary-light);
		background: rgba(37, 99, 235, 0.04);
	}
}

.gallery-title {
	display: block;
	font-size: 20px;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 4px;
}

.gallery-desc {
	display: block;
	font-size: 14px;
	color: var(--text-secondary);
}

.gallery-filters {
	display: flex;
	gap: 8px;
	margin-bottom: 24px;
	flex-wrap: wrap;
}

.filter-tag {
	padding: 6px 16px;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	font-size: 13px;
	color: var(--text-secondary);
	cursor: pointer;
	transition: all var(--transition-fast);
	background: var(--bg-card);

	&:hover {
		border-color: var(--primary-light);
		color: var(--primary-light);
		transform: translateY(-1px);
	}

	&.active {
		background: var(--primary-light);
		border-color: var(--primary-light);
		color: #fff;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}
}

.gallery-loading,
.gallery-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	gap: 12px;
	color: var(--text-secondary);
}

.loading-spinner {
	width: 32px;
	height: 32px;
	border: 2px solid var(--border-color);
	border-top-color: var(--primary-light);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.empty-icon {
	font-size: 48px;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-5px); }
}

.empty-text {
	font-size: 14px;
	color: var(--text-secondary);
}

.template-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: 20px;
}

.template-card {
	border: 1px solid var(--border-color);
	border-radius: var(--radius-md);
	overflow: hidden;
	background: var(--bg-card);
	cursor: pointer;
	transition: all var(--transition-normal);

	&:hover {
		border-color: rgba(37, 99, 235, 0.3);
		box-shadow: var(--shadow-lg);
		transform: translateY(-4px);
		
		.card-overlay {
			opacity: 1;
		}
		
		.preview-icon {
			transform: scale(1.1);
		}
	}
}

.card-preview {
	height: 220px;
	padding: 12px;
	background: linear-gradient(160deg, #f8fafc 0%, #eef2f7 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
	box-sizing: border-box;
}

.preview-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
}

.sample-preview {
	position: relative;
	flex-shrink: 0;
	overflow: hidden;
	background: #fff;
	pointer-events: none;
	border-radius: 6px;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.14);
	transition: transform var(--transition-normal), box-shadow var(--transition-normal);

	.template-card:hover & {
		transform: scale(1.03);
		box-shadow: 0 8px 22px rgba(15, 23, 42, 0.2);
	}
}

.card-thumb {
	width: 100%;
	height: 100%;
	display: block;
}

.builtin-badge {
	position: absolute;
	top: 8px;
	left: 8px;
	z-index: 2;
	padding: 2px 8px;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	font-size: 11px;
	font-weight: 600;
	border-radius: 4px;
}

.preview-icon {
	font-size: 64px;
	transition: transform var(--transition-normal);
}

.card-overlay {
	position: absolute;
	inset: 0;
	background: rgba(30, 58, 138, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity var(--transition-fast);
}

.use-btn {
	padding: 8px 20px;
	background: #fff;
	color: var(--primary-color);
	border-radius: 20px;
	font-size: 13px;
	font-weight: 500;
	transform: translateY(10px);
	transition: all var(--transition-fast);
	
	.template-card:hover & {
		transform: translateY(0);
	}
}

.card-info {
	padding: 16px;
}

.card-title {
	display: block;
	font-size: 15px;
	font-weight: 600;
	color: var(--text-primary);
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-author {
	display: block;
	font-size: 12px;
	color: var(--text-secondary);
	margin-bottom: 8px;
}

.card-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.meta-usage {
	font-size: 12px;
	color: var(--text-secondary);
	display: flex;
	align-items: center;
	gap: 4px;
	
	.usage-icon {
		font-size: 10px;
	}
}

.meta-category {
	font-size: 11px;
	padding: 2px 8px;
	background: rgba(37, 99, 235, 0.1);
	color: var(--primary-light);
	border-radius: 4px;
	font-weight: 500;
}
</style>
