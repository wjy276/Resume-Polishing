<template>
	<view class="template-gallery">
		<view class="gallery-header">
			<text class="gallery-title">模板广场</text>
			<text class="gallery-desc">选择社区分享的简历模板，快速创建专业简历</text>
		</view>

		<view class="gallery-filters">
			<view
				class="filter-tag"
				:class="{ active: selectedCategory === '' }"
				@click="selectedCategory = ''"
			>
				<text>全部</text>
			</view>
			<view
				class="filter-tag"
				:class="{ active: selectedCategory === 'tech' }"
				@click="selectedCategory = 'tech'"
			>
				<text>技术</text>
			</view>
			<view
				class="filter-tag"
				:class="{ active: selectedCategory === 'design' }"
				@click="selectedCategory = 'design'"
			>
				<text>设计</text>
			</view>
			<view
				class="filter-tag"
				:class="{ active: selectedCategory === 'business' }"
				@click="selectedCategory = 'business'"
			>
				<text>商务</text>
			</view>
			<view
				class="filter-tag"
				:class="{ active: selectedCategory === 'custom' }"
				@click="selectedCategory = 'custom'"
			>
				<text>自定义</text>
			</view>
		</view>

		<view v-if="loading" class="gallery-loading">
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
				</view>
				<view class="card-info">
					<text class="card-title">{{ template.name }}</text>
					<text class="card-author">by {{ template.author }}</text>
					<view class="card-meta">
						<text class="meta-usage">{{ template.usageCount }} 次使用</text>
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
$primary: #2563eb;

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
	color: #111827;
	margin-bottom: 4px;
}

.gallery-desc {
	display: block;
	font-size: 14px;
	color: #6b7280;
}

.gallery-filters {
	display: flex;
	gap: 8px;
	margin-bottom: 24px;
	flex-wrap: wrap;
}

.filter-tag {
	padding: 6px 16px;
	border: 1px solid #e5e7eb;
	border-radius: 20px;
	font-size: 13px;
	color: #6b7280;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: $primary;
		color: $primary;
	}

	&.active {
		background: $primary;
		border-color: $primary;
		color: #fff;
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
}

.empty-icon {
	font-size: 48px;
}

.empty-text {
	font-size: 14px;
	color: #6b7280;
}

.template-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: 20px;
}

.template-card {
	border: 1px solid #e5e7eb;
	border-radius: 12px;
	overflow: hidden;
	background: #fff;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		border-color: $primary;
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
		transform: translateY(-2px);
	}
}

.card-preview {
	height: 180px;
	background: #f9fafb;
	display: flex;
	align-items: center;
	justify-content: center;
}

.preview-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
}

.preview-icon {
	font-size: 64px;
}

.card-info {
	padding: 16px;
}

.card-title {
	display: block;
	font-size: 15px;
	font-weight: 600;
	color: #111827;
	margin-bottom: 4px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-author {
	display: block;
	font-size: 12px;
	color: #6b7280;
	margin-bottom: 8px;
}

.card-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.meta-usage {
	font-size: 12px;
	color: #6b7280;
}

.meta-category {
	font-size: 11px;
	padding: 2px 8px;
	background: #eff6ff;
	color: $primary;
	border-radius: 4px;
}
</style>
