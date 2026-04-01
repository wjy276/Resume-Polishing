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
import { showTokenExpiredPopup } from '@/stores/user.js'

// API 基础地址
const BASE_URL = 'http://81.71.75.85:6008/api'

// 上传状态
const uploading = ref(false)

// 当前上传的文件信息（本地状态）
const currentUploadFile = ref(null)

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

/**
 * 保存文件信息到本地存储
 * @param {Object} fileInfo 文件信息
 */
const saveFileInfo = (fileInfo) => {
	try {
		uni.setStorageSync('currentResumeFile', JSON.stringify(fileInfo))
	} catch (e) {
		console.error('保存文件信息失败:', e)
	}
}

/**
 * 获取保存的文件信息
 * @returns {Object|null}
 */
const getSavedFileInfo = () => {
	try {
		const data = uni.getStorageSync('currentResumeFile')
		return data ? JSON.parse(data) : null
	} catch (e) {
		console.error('获取文件信息失败:', e)
		return null
	}
}

/**
 * 清除保存的文件信息
 */
const clearFileInfo = () => {
	try {
		uni.removeStorageSync('currentResumeFile')
	} catch (e) {
		console.error('清除文件信息失败:', e)
	}
}

// 上传简历到后端
const uploadResume = () => {
	// 检查登录状态
	const token = uni.getStorageSync('token')
	if (!token) {
		uni.showModal({
			title: '提示',
			content: '请先登录后再上传简历',
			confirmText: '去登录',
			confirmColor: '#1e3a8a',
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({
						url: '/pages/Login/Login'
					})
				}
			}
		})
		return
	}

	uni.chooseFile({
		accept: 'file',
		extension: ['.pdf', '.doc', '.docx'],
		success: (res) => {
			console.log('选择的文件:', res)

			if (res.tempFilePaths && res.tempFilePaths.length > 0) {
				const filePath = res.tempFilePaths[0]
				const tempFile = res.tempFiles[0]
				const fileName = tempFile?.name || '简历文件'
				const fileSize = tempFile?.size || 0

				// 保存当前上传的文件信息
				currentUploadFile.value = {
					name: fileName,
					path: filePath,
					size: fileSize,
					type: getFileType(fileName),
					uploadTime: Date.now()
				}

				// 同时保存到本地存储（用于页面跳转后获取）
				saveFileInfo(currentUploadFile.value)

				uploading.value = true

				uni.showLoading({
					title: '正在上传...'
				})

				uni.uploadFile({
					url: `${BASE_URL}/v1/resume/parse`,
					filePath: filePath,
					name: 'file',
					header: {
						'Authorization': "Bearer "+token
					},
					formData: {
						'fileName': fileName
					},
					success: (uploadRes) => {
						uni.hideLoading()
						uploading.value = false

						console.log('上传结果:', uploadRes)
						console.log('状态码:', uploadRes.statusCode)

						// 检查 Token 过期（HTTP 401）
						if (uploadRes.statusCode === 401) {
							console.log('Token 已过期')
							clearFileInfo()
							showTokenExpiredPopup()
							return
						}

						if (uploadRes.statusCode === 200) {
							try {
								const result = JSON.parse(uploadRes.data)
								console.log('解析结果:', result)
								console.log('业务码:', result.code)
								console.log('返回数据:', result.data)

								// 检查业务码是否表示 Token 过期
								// 1007: Token已过期
								// 401: 未授权
								// 'UNAUTHORIZED': 未授权
								if (result.code === 1007 || result.code === 401 || result.code === 'UNAUTHORIZED') {
									console.log('业务码提示 Token 过期:', result.message)
									clearFileInfo()
									showTokenExpiredPopup()
									return
								}

								// 兼容多种业务码格式
								if ((result.code === 0 || result.code === 200) && result.data) {
									// 合并文件信息和接口返回数据
									const resumeData = {
										fileName: fileName,
										filePath: filePath,
										fileSize: fileSize,
										fileType: getFileType(fileName),
										uploadTime: currentUploadFile.value.uploadTime,
										...result.data
									}

									console.log('准备跳转，数据:', resumeData)

									// 保存完整数据到本地存储
									saveResumeDataToStorage(resumeData)

									// 跳转到模板页面
									uni.navigateTo({
										url: '/pages/Resume/ResumeTemplate',
										success: () => {
											console.log('跳转成功')
										},
										fail: (err) => {
											console.error('跳转失败:', err)
										}
									})
								} else {
									// 接口返回错误时清除文件信息
									clearFileInfo()
									console.log('业务错误:', result.message)
									uni.showToast({
										title: result.message || '上传失败',
										icon: 'none'
									})
								}
							} catch (e) {
								console.error('解析响应失败:', e)
								clearFileInfo()
								uni.showToast({
									title: '数据解析失败',
									icon: 'none'
								})
							}
						} else {
							clearFileInfo()
							uni.showToast({
								title: '上传失败，请重试',
								icon: 'none'
							})
						}
					},
					fail: (err) => {
						uni.hideLoading()
						uploading.value = false
						clearFileInfo()
						console.error('上传失败:', err)
						uni.showToast({
							title: '网络错误，请稍后重试',
							icon: 'none'
						})
					}
				})
			}
		},
		fail: (err) => {
			console.log('选择文件取消或失败:', err)
		}
	})
}

/**
 * 保存简历数据到本地存储
 * @param {Object} data
 */
const saveResumeDataToStorage = (data) => {
	try {
		uni.setStorageSync('currentResumeData', JSON.stringify(data))
	} catch (e) {
		console.error('保存简历数据失败:', e)
	}
}

/**
 * 根据文件名获取文件类型
 * @param {string} fileName
 * @returns {string}
 */
const getFileType = (fileName) => {
	if (!fileName) return 'unknown'
	const ext = fileName.split('.').pop()?.toLowerCase()
	const typeMap = {
		'pdf': 'PDF',
		'doc': 'Word',
		'docx': 'Word'
	}
	return typeMap[ext] || '未知'
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
