<template>
	<view class="resume-template-page">
		<view class="page-header">
			<text class="title">选择简历模板</text>
			<text class="subtitle">点击模板后进入编辑器，继续完善简历内容</text>
		</view>

		<view class="template-list">
			<TemplateCard
				v-for="item in templateCards"
				:key="item.id"
				:template="item"
				@select="handleSelectTemplate"
			/>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TemplateCard from '@/components/resume/TemplateCard.vue'
import { DEFAULT_TEMPLATES } from '@/components/ResumeTemplates/registry'

const selectedTemplateId = ref('')

const templateCards = computed(() => DEFAULT_TEMPLATES.map((item, index) => ({
	id: item.id || item.layout || `${index}`,
	templateId: item.id || item.layout || `${index}`,
	NAME: item.name || '默认模板',
	VIEWS: 1000 + index * 230,
	LIKES: 200 + index * 37,
	previewUrl: `/static/templates/${item.thumbnail || item.layout || 'classic'}-preview.png`,
	isHot: index === 0,
	isNew: index === DEFAULT_TEMPLATES.length - 1,
	selected: selectedTemplateId.value === (item.id || item.layout || `${index}`),
})))

onLoad((query) => {
	if (query?.templateId) {
		selectedTemplateId.value = decodeURIComponent(query.templateId)
		return
	}
	if (query?.template) {
		selectedTemplateId.value = decodeURIComponent(query.template)
	}
})

const handleSelectTemplate = (template) => {
	const templateId = template.templateId || template.id
	uni.navigateTo({
		url: `/pages/Resume/ResumeEditor?templateId=${encodeURIComponent(templateId)}`
	})
}
</script>

<style scoped lang="scss">
.resume-template-page {
	min-height: 100vh;
	background: #f5f7fb;
	padding: 30rpx;
	box-sizing: border-box;
}

.page-header {
	margin-bottom: 28rpx;

	.title {
		display: block;
		font-size: 42rpx;
		font-weight: 700;
		color: #111827;
		margin-bottom: 10rpx;
	}

	.subtitle {
		display: block;
		font-size: 26rpx;
		color: #6b7280;
	}
}

.template-list {
	display: grid;
	grid-template-columns: 1fr;
	gap: 22rpx;
}
</style>
