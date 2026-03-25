<template>
	<view class="resume-container">
		<!-- 侧边栏 -->
		<Sidebar />
		
		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 顶部 -->
			<view class="page-header">
				<text class="page-title">简历优化</text>
				<text class="page-subtitle">AI 智能分析简历，根据目标岗位自动优化，提供专业修改建议</text>
			</view>

			<!-- 上传区域 -->
			<view class="upload-section">
				<view class="upload-card">
					<text class="upload-icon">📄</text>
					<text class="upload-title">上传您的简历</text>
					<text class="upload-desc">支持 PDF、Word 格式，AI 将自动分析并提供优化建议</text>
					<button class="upload-btn" @click="uploadResume">
						<text class="btn-text">选择文件</text>
					</button>
				</view>
			</view>

			<!-- 简历列表 -->
			<view class="resume-items">
				<view class="resume-item" v-for="resume in resumeList" :key="resume.id">
					<view class="item-header">
						<text class="item-icon">📋</text>
						<text class="item-title">{{ resume.name }}</text>
						<text class="item-score">{{ resume.score }}分</text>
					</view>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: resume.score + '%' }"></view>
					</view>
					<view class="item-suggestions">
						<text class="suggestion-text" v-for="(suggestion, index) in resume.suggestions" :key="index">
							• {{ suggestion }}
						</text>
					</view>
				</view>
			</view>

			<!-- AI 建议 -->
			<view class="ai-suggestions">
				<view class="ai-header">
					<text class="ai-icon">✨</text>
					<text class="ai-title">AI 智能建议</text>
				</view>
				<view class="ai-content">
					<text class="ai-text">
						根据您的简历和求职意向，建议重点突出项目经验中的技术亮点，
						量化工作成果，并使用更专业的术语描述职责。同时，建议增加
						与目标岗位相关的技能关键词，提高简历匹配度。
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

const resumeList = ref([
	{
		id: 1,
		name: '前端开发工程师简历.pdf',
		score: 85,
		suggestions: [
			'项目经验描述可以更具体，突出技术难点和解决方案',
			'建议增加量化数据，如"性能提升 30%"',
			'技能清单可以更详细，列出熟悉程度'
		]
	},
	{
		id: 2,
		name: '产品经理简历.pdf',
		score: 78,
		suggestions: [
			'产品描述可以更加结构化，突出核心指标',
			'建议增加用户调研和数据分析相关内容',
			'项目成果可以用数据说话，如"日活提升 50%"'
		]
	}
])

const uploadResume = () => {
	uni.chooseFile({
		accept: 'file',
		success: (res) => {
			console.log('选择的文件:', res)
			// 这里可以添加上传逻辑
		}
	})
}
</script>

<style scoped lang="scss">
.resume-container {
	display: flex;
	height: 100vh;
	background-color: #f9fafb;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 64rpx;
	overflow-y: auto;
}

.page-header {
	margin-bottom: 64rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.page-title {
	font-size: 56rpx;
	font-weight: 600;
	color: #111827;
}

.page-subtitle {
	font-size: 32rpx;
	color: #6b7280;
}

.upload-section {
	margin-bottom: 64rpx;
}

.upload-card {
	background: linear-gradient(135deg, #3b82f6, #06b6d4);
	padding: 80rpx;
	border-radius: 32rpx;
	text-align: center;
	box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.3);
}

.upload-icon {
	font-size: 128rpx;
	display: block;
	margin-bottom: 32rpx;
}

.upload-title {
	font-size: 48rpx;
	font-weight: 600;
	color: #ffffff;
	display: block;
	margin-bottom: 16rpx;
}

.upload-desc {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
	display: block;
	margin-bottom: 48rpx;
}

.upload-btn {
	background: #ffffff;
	color: #3b82f6;
	border: none;
	padding: 24rpx 80rpx;
	border-radius: 16rpx;
	font-size: 32rpx;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s;
	display: inline-block;

	&:hover {
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.2);
	}
}

.btn-text {
	display: block;
}

.resume-items {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
	margin-bottom: 64rpx;
}

.resume-item {
	background: #ffffff;
	padding: 48rpx;
	border-radius: 24rpx;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.item-header {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin-bottom: 32rpx;
}

.item-icon {
	font-size: 48rpx;
}

.item-title {
	flex: 1;
	font-size: 36rpx;
	font-weight: 600;
	color: #111827;
}

.item-score {
	font-size: 36rpx;
	font-weight: 700;
	color: #3b82f6;
}

.progress-bar {
	height: 16rpx;
	background: #f3f4f6;
	border-radius: 8rpx;
	overflow: hidden;
	margin-bottom: 32rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #10b981);
	border-radius: 8rpx;
	transition: width 0.3s;
}

.item-suggestions {
	.suggestion-text {
		display: block;
		font-size: 28rpx;
		color: #6b7280;
		line-height: 1.6;
		margin-bottom: 8rpx;
	}
}

.ai-suggestions {
	background: linear-gradient(135deg, #fef3c7, #fde68a);
	padding: 48rpx;
	border-radius: 24rpx;
	border: 4rpx solid #f59e0b;
}

.ai-header {
	display: flex;
	align-items: center;
	gap: 24rpx;
	margin-bottom: 32rpx;
}

.ai-icon {
	font-size: 48rpx;
}

.ai-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #92400e;
}

.ai-content {
	.ai-text {
		font-size: 30rpx;
		line-height: 1.8;
		color: #78350f;
		display: block;
	}
}
</style>
