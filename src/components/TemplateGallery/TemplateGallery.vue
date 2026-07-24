<template>
	<view class="template-gallery">
		<view class="gallery-header">
			<text class="gallery-title">模板广场</text>
			<text class="gallery-desc">选择社区分享的简历模板，快速创建专业简历</text>
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
					<view class="preview-placeholder">
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
import { ref, computed, onMounted } from 'vue'
import { useTemplateStore } from '@/stores/template'
import { useResumeStore } from '@/stores/resume'

const templateStore = useTemplateStore()
const resumeStore = useResumeStore()

const loading = ref(false)
const selectedCategory = ref('')

const categories = [
	{ value: '', label: '全部' },
	{ value: 'tech', label: '技术' },
	{ value: 'design', label: '设计' },
	{ value: 'business', label: '商务' },
	{ value: 'custom', label: '自定义' },
]

const filteredTemplates = computed(() => {
	if (!selectedCategory.value) return templateStore.templates
	return templateStore.templates.filter(t => t.category === selectedCategory.value)
})

onMounted(async () => {
	loading.value = true
	await templateStore.loadTemplates()
	loading.value = false
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

	const result = await templateStore.useTemplate(template.id)
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
	height: 180px;
	background: var(--bg-page);
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	overflow: hidden;
}

.preview-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
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