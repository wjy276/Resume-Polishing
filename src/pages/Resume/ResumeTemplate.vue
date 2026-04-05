<!-- 简历优化 -->
<!-- 时间： 2026.4.1-->

<template>
	<view class="resume-template">
		<!-- 侧边栏 -->
		<Sidebar />

		<!-- 主内容区 -->
		<view class="main-content">
			<!-- 标题与进度 -->
			<view class="title-section">
				<view class="title-left">
					<text class="main-title">简历优化器</text>
					<text class="sub-title">AI 智能分析简历，按模块优化提升匹配度</text>
				</view>
				<view class="progress-section">
					<text class="progress-label">优化进度</text>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
					</view>
					<text class="progress-value">{{ progressPercent }}%</text>
					<view class="re-upload-btn" @click="handleReUpload">
						<text class="btn-text">重新上传</text>
					</view>
				</view>
			</view>

			<!-- 文件信息 -->
			<view v-if="resumeData.fileName" class="file-info">
				<text class="file-icon">📄</text>
				<text class="file-name">{{ resumeData.fileName }}</text>
				<text class="file-size">{{ formatFileSize(resumeData.fileSize) }}</text>
			</view>

			<!-- 加载状态 -->
			<view v-if="isLoading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">正在解析简历...</text>
			</view>

			<!-- 无数据提示 -->
			<view v-if="!isLoading && !hasData" class="no-data-container">
				<text class="no-data-icon">📋</text>
				<text class="no-data-text">暂无简历数据</text>
				<text class="no-data-hint">请先上传简历文件</text>
			</view>

			<!-- 简历模块网格 -->
			<view v-if="!isLoading && hasData" class="modules-grid">
				<!-- 个人介绍 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">👤</text>
							</view>
							<text class="module-title">个人介绍</text>
						</view>
						<view class="ai-optimize" :class="{ disabled: optimizingModules.personal }" @click="handleOptimize('personal')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">{{ optimizingModules.personal ? '优化中...' : 'AI 优化' }}</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<view v-if="resumeData.Person_original" class="content-item">
								<text class="content-label">原始内容：</text>
								<text class="content-text">{{ resumeData.Person_original }}</text>
							</view>
							<view v-if="optimizedData.personal" class="content-item optimized">
								<text class="content-label optimized-label">优化内容：</text>
								<text class="content-text">{{ optimizedData.personal }}</text>
							</view>
							<text v-if="!resumeData.Person_original && !optimizedData.personal" class="no-content">无</text>
						</view>
					</view>
				</view>

				<!-- 教育背景 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">🎓</text>
							</view>
							<text class="module-title">教育背景</text>
						</view>
						<view class="ai-optimize" :class="{ disabled: optimizingModules.education }" @click="handleOptimize('education')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">{{ optimizingModules.education ? '优化中...' : 'AI 优化' }}</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<view v-if="resumeData.Educational_original" class="content-item">
								<text class="content-label">原始内容：</text>
								<text class="content-text">{{ resumeData.Educational_original }}</text>
							</view>
							<view v-if="optimizedData.education" class="content-item optimized">
								<text class="content-label optimized-label">优化内容：</text>
								<text class="content-text">{{ optimizedData.education }}</text>
							</view>
							<text v-if="!resumeData.Educational_original && !optimizedData.education" class="no-content">无</text>
						</view>
					</view>
				</view>

				<!-- 工作经历 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">💼</text>
							</view>
							<text class="module-title">工作经历</text>
						</view>
						<view class="ai-optimize" :class="{ disabled: optimizingModules.work }" @click="handleOptimize('work')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">{{ optimizingModules.work ? '优化中...' : 'AI 优化' }}</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<view v-if="resumeData.Work_original && resumeData.Work_original !== '无原始信息'" class="content-item">
								<text class="content-label">原始内容：</text>
								<text class="content-text">{{ resumeData.Work_original }}</text>
							</view>
							<view v-if="optimizedData.work" class="content-item optimized">
								<text class="content-label optimized-label">优化内容：</text>
								<text class="content-text">{{ optimizedData.work }}</text>
							</view>
							<text v-if="(!resumeData.Work_original || resumeData.Work_original === '无原始信息') && !optimizedData.work" class="no-content">无</text>
						</view>
					</view>
				</view>

				<!-- 项目经验 -->
				<view class="module-card">
					<view class="card-header">
						<view class="header-left">
							<view class="icon-box">
								<text class="module-icon">📦</text>
							</view>
							<text class="module-title">项目经验</text>
						</view>
						<view class="ai-optimize" :class="{ disabled: optimizingModules.project }" @click="handleOptimize('project')">
							<text class="sparkle-icon">✨</text>
							<text class="optimize-text">{{ optimizingModules.project ? '优化中...' : 'AI 优化' }}</text>
						</view>
					</view>
					<view class="card-content">
						<view class="content-box">
							<view v-if="resumeData.Project_original" class="content-item">
								<text class="content-label">原始内容：</text>
								<text class="content-text">{{ resumeData.Project_original }}</text>
							</view>
							<view v-if="optimizedData.project" class="content-item optimized">
								<text class="content-label optimized-label">优化内容：</text>
								<text class="content-text">{{ optimizedData.project }}</text>
							</view>
							<text v-if="!resumeData.Project_original && !optimizedData.project" class="no-content">无</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 底部操作区 -->
			<view v-if="hasData" class="footer-actions">
				<view class="footer-left">
					<view class="action-btn" @click="handleExportPDF">
						<text class="btn-icon">⬇️</text>
						<text class="btn-text">导出 PDF</text>
					</view>
					<view class="action-btn save-btn" @click="handleSaveVersion">
						<text class="btn-text">保存版本</text>
					</view>
				</view>
				<view class="footer-right">
					<view class="status-info">
						<text class="status-text">已优化 {{ optimizedCount }}/4 个模块</text>
					</view>
					<view class="optimize-all-btn" @click="handleOptimizeAll">
						<text class="btn-text">一键优化全部</text>
						<text class="sparkle-icon">✨</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar/Sidebar.vue'

// 简历原始数据
const resumeData = ref({
	fileName: '',
	fileSize: 0,
	fileType: '',
	Person_original: null,
	Educational_original: null,
	Work_original: null,
	Project_original: null,
	Personal_Introduction: '',
	Educational_Background: '',
	Work_Experience: '',
	Project_Experience: ''
})

// 优化后的数据
const optimizedData = ref({
	personal: '',
	education: '',
	work: '',
	project: ''
})

// 优化中状态
const optimizingModules = ref({
	personal: false,
	education: false,
	work: false,
	project: false
})

// 加载状态
const isLoading = ref(false)

// 是否有数据
const hasData = computed(() => {
	return resumeData.value.fileName ||
		resumeData.value.Person_original ||
		resumeData.value.Educational_original ||
		resumeData.value.Work_original ||
		resumeData.value.Project_original
})

// 优化进度
const progressPercent = computed(() => {
	let count = 0
	if (optimizedData.value.personal) count++
	if (optimizedData.value.education) count++
	if (optimizedData.value.work) count++
	if (optimizedData.value.project) count++
	return Math.round((count / 4) * 100)
})

// 已优化数量
const optimizedCount = computed(() => {
	let count = 0
	if (optimizedData.value.personal) count++
	if (optimizedData.value.education) count++
	if (optimizedData.value.work) count++
	if (optimizedData.value.project) count++
	return count
})

// 格式化文件大小
const formatFileSize = (bytes) => {
	if (!bytes) return ''
	if (bytes < 1024) return bytes + ' B'
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
	return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 模块映射
const moduleMapping = {
	personal: {
		original: 'Person_original',
		optimized: 'Personal_Introduction',
		apiField: 'personal'
	},
	education: {
		original: 'Educational_original',
		optimized: 'Educational_Background',
		apiField: 'education'
	},
	work: {
		original: 'Work_original',
		optimized: 'Work_Experience',
		apiField: 'work'
	},
	project: {
		original: 'Project_original',
		optimized: 'Project_Experience',
		apiField: 'project'
	}
}

// 本地优化处理
const handleOptimize = (type) => {
	if (optimizingModules.value[type]) return

	const mapping = moduleMapping[type]
	const originalContent = resumeData.value[mapping.original]

	if (!originalContent) {
		uni.showToast({
			title: '该模块暂无原始内容',
			icon: 'none'
		})
		return
	}

	optimizingModules.value[type] = true

	// 模拟优化延迟
	setTimeout(() => {
		// 优先使用已有的优化内容
		const existingOptimized = resumeData.value[mapping.optimized]
		if (existingOptimized) {
			optimizedData.value[type] = existingOptimized
		} else {
			// 如果没有优化内容，显示提示
			optimizedData.value[type] = '暂无优化建议，请完善原始内容后重试'
		}

		optimizingModules.value[type] = false

		uni.showToast({
			title: '优化完成',
			icon: 'success'
		})
	}, 500)
}

// 一键优化全部
const handleOptimizeAll = async () => {
	const modules = ['personal', 'education', 'work', 'project']

	uni.showLoading({
		title: 'AI 优化中...',
		mask: true
	})

	for (const module of modules) {
		const mapping = moduleMapping[module]
		const originalContent = resumeData.value[mapping.original]

		if (originalContent && !optimizedData.value[module]) {
			await handleOptimize(module)
		}
	}

	uni.hideLoading()
}

// 导出 PDF
const handleExportPDF = () => {
	uni.showToast({
		title: '导出功能开发中',
		icon: 'none'
	})
}

// 保存版本
const handleSaveVersion = () => {
	// 保存到本地存储
	const saveData = {
		fileName: resumeData.value.fileName,
		original: {
			personal: resumeData.value.Person_original,
			education: resumeData.value.Educational_original,
			work: resumeData.value.Work_original,
			project: resumeData.value.Project_original
		},
		optimized: optimizedData.value,
		saveTime: new Date().toISOString()
	}

	try {
		// 获取已保存的版本列表
		const savedList = uni.getStorageSync('savedResumeList') || '[]'
		const list = typeof savedList === 'string' ? JSON.parse(savedList) : savedList

		// 添加新版本
		list.unshift(saveData)

		// 最多保存10个版本
		if (list.length > 10) {
			list.pop()
		}

		uni.setStorageSync('savedResumeList', JSON.stringify(list))

		uni.showToast({
			title: '保存成功',
			icon: 'success'
		})
	} catch (error) {
		console.error('保存失败：', error)
		uni.showToast({
			title: '保存失败',
			icon: 'none'
		})
	}
}

// 重新上传
const handleReUpload = () => {
	uni.showModal({
		title: '提示',
		content: '确定要重新上传简历吗？当前未保存的内容将会丢失。',
		success: (res) => {
			if (res.confirm) {
				// 重置所有数据
				resumeData.value = {
					fileName: '',
					fileSize: 0,
					fileType: '',
					Person_original: null,
					Educational_original: null,
					Work_original: null,
					Project_original: null,
					Personal_Introduction: '',
					Educational_Background: '',
					Work_Experience: '',
					Project_Experience: ''
				}
				optimizedData.value = {
					personal: '',
					education: '',
					work: '',
					project: ''
				}
				uni.navigateBack()
			}
		}
	})
}

// 加载简历数据
const loadResumeData = () => {
	try {
		// 从本地存储获取简历数据
		const storedData = uni.getStorageSync('currentResumeData')
		console.log('从存储获取的数据：', storedData)

		if (storedData) {
			const data = typeof storedData === 'string' ? JSON.parse(storedData) : storedData
			console.log('解析后的数据：', data)

			resumeData.value = {
				fileName: data.fileName || '',
				fileSize: data.fileSize || 0,
				fileType: data.fileType || '',
				// 原始内容字段
				Person_original: data.Person_original || null,
				Educational_original: data.Educational_original || null,
				Work_original: data.Work_original || null,
				Project_original: data.Project_original || null,
				// 已优化内容字段
				Personal_Introduction: data.Personal_Introduction || '',
				Educational_Background: data.Educational_Background || '',
				Work_Experience: data.Work_Experience || '',
				Project_Experience: data.Project_Experience || ''
			}

			console.log('简历数据加载完成：', resumeData.value)
		}
	} catch (e) {
		console.error('加载简历数据失败：', e)
	}
}

onMounted(() => {
	loadResumeData()
})
</script>

<style scoped lang="scss">
.resume-template {
	display: flex;
	height: 100vh;
	background-color: #f5f7fa;
}

.main-content {
	flex: 1;
	margin-left: 20%;
	padding: 0;
	overflow-y: auto;
	background-color: #f5f7fa;
}

// 标题与进度
.title-section {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 48rpx 48rpx 32rpx;
	background-color: #ffffff;
}

.title-left {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.main-title {
	font-size: 56rpx;
	font-weight: 700;
	color: #1a1a1a;
}

.sub-title {
	font-size: 28rpx;
	color: #666666;
}

.progress-section {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.progress-label {
	font-size: 28rpx;
	color: #666666;
}

.progress-bar {
	width: 300rpx;
	height: 16rpx;
	background-color: #e8eaed;
	border-radius: 8rpx;
	overflow: hidden;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #06b6d4);
	border-radius: 8rpx;
	transition: width 0.3s ease;
}

.progress-value {
	font-size: 28rpx;
	color: #3b82f6;
	font-weight: 600;
	width: 60rpx;
	text-align: center;
}

.re-upload-btn {
	padding: 16rpx 32rpx;
	background-color: #ffffff;
	border: 2rpx solid #e8eaed;
	border-radius: 12rpx;
	cursor: pointer;

	.btn-text {
		font-size: 26rpx;
		color: #666666;
		font-weight: 500;
	}
}

// 文件信息
.file-info {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 24rpx 48rpx;
	background-color: #f0f9ff;
	border-bottom: 1px solid #bae6fd;
}

.file-icon {
	font-size: 36rpx;
}

.file-name {
	font-size: 28rpx;
	color: #0369a1;
	font-weight: 500;
}

.file-size {
	font-size: 24rpx;
	color: #6b7280;
}

// 加载状态
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 48rpx;
	gap: 32rpx;
}

.loading-spinner {
	width: 64rpx;
	height: 64rpx;
	border: 4rpx solid #e5e7eb;
	border-top-color: #3b82f6;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.loading-text {
	font-size: 28rpx;
	color: #6b7280;
}

// 无数据提示
.no-data-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 48rpx;
	gap: 24rpx;
}

.no-data-icon {
	font-size: 80rpx;
}

.no-data-text {
	font-size: 32rpx;
	color: #374151;
	font-weight: 500;
}

.no-data-hint {
	font-size: 28rpx;
	color: #9ca3af;
}

// 简历模块网格
.modules-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 32rpx;
	padding: 32rpx 48rpx 48rpx;
}

.module-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;

	&:hover {
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
		transform: translateY(-4rpx);
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.icon-box {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
	border-radius: 16rpx;
}

.module-icon {
	font-size: 36rpx;
}

.module-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.ai-optimize {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 12rpx 20rpx;
	background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
	border-radius: 24rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:hover {
		background: linear-gradient(135deg, #bae6fd, #e0f2fe);
	}

	&.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

.sparkle-icon {
	font-size: 28rpx;
}

.optimize-text {
	font-size: 26rpx;
	color: #0284c7;
	font-weight: 500;
}

.card-content {
	background: linear-gradient(135deg, #f9fafb, #f3f4f6);
	border-radius: 16rpx;
	padding: 24rpx;
}

.content-box {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.content-item {
	display: flex;
	flex-direction: column;
	gap: 8rpx;

	&.optimized {
		padding-top: 16rpx;
		border-top: 1px dashed #d1d5db;
	}
}

.content-label {
	font-size: 24rpx;
	color: #6b7280;
	font-weight: 500;

	&.optimized-label {
		color: #059669;
	}
}

.content-text {
	font-size: 28rpx;
	color: #374151;
	line-height: 1.8;
	white-space: pre-wrap;
	word-break: break-all;
}

.no-content {
	font-size: 28rpx;
	color: #9ca3af;
	font-style: italic;
}

// 底部操作区
.footer-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 48rpx;
	background-color: #ffffff;
	border-top: 2rpx solid #f0f2f5;
	position: sticky;
	bottom: 0;
}

.footer-left {
	display: flex;
	gap: 24rpx;
}

.action-btn {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx 32rpx;
	background-color: #ffffff;
	border: 2rpx solid #e8eaed;
	border-radius: 16rpx;
	cursor: pointer;
	transition: all 0.3s ease;

	&:hover {
		border-color: #3b82f6;
		background-color: #f0f9ff;
	}

	&:active {
		transform: scale(0.98);
	}
}

.btn-icon {
	font-size: 32rpx;
}

.btn-text {
	font-size: 28rpx;
	color: #666666;
	font-weight: 500;
}

.save-btn {
	.btn-text {
		color: #666666;
	}
}

.footer-right {
	display: flex;
	align-items: center;
	gap: 32rpx;
}

.status-info {
	padding: 16rpx 24rpx;
	background: linear-gradient(135deg, #dcfce7, #bbf7d0);
	border-radius: 24rpx;
}

.status-text {
	font-size: 26rpx;
	color: #16a34a;
	font-weight: 500;
}

.optimize-all-btn {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 20rpx 40rpx;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	border-radius: 16rpx;
	cursor: pointer;
	box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
	transition: all 0.3s ease;

	&:hover {
		box-shadow: 0 6rpx 16rpx rgba(59, 130, 246, 0.4);
		transform: translateY(-2rpx);
	}

	&:active {
		transform: translateY(0);
	}

	.btn-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 600;
	}

	.sparkle-icon {
		font-size: 32rpx;
	}
}
</style>
