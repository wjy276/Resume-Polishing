<template>
	<!-- 登录/注册弹窗遮罩 -->
	<view class="login-popup-mask" v-if="visible" @click.stop="handleMaskClick">
		<view class="login-popup" @click.stop>
			<!-- 关闭按钮 -->
			<view class="close-btn" @click="handleClose">
				<text>✕</text>
			</view>

			<!-- Logo -->
			<view class="popup-header">
				<view class="logo-icon">
					<text class="logo-star">✦</text>
				</view>
				<text class="popup-title">{{ isLoginMode ? '登录' : '注册' }} AI 求职助手</text>
				<text class="popup-subtitle">{{ isLoginMode ? '解锁更多智能求职功能' : '开启智能求职之旅' }}</text>
			</view>

			<!-- 切换标签 -->
			<view class="mode-tabs">
				<view class="tab-item" :class="{ active: isLoginMode }" @click="switchMode('login')">
					<text>登录</text>
				</view>
				<view class="tab-item" :class="{ active: !isLoginMode }" @click="switchMode('register')">
					<text>注册</text>
				</view>
				<view class="tab-indicator" :style="{ left: isLoginMode ? '0' : '50%' }"></view>
			</view>

			<!-- 表单 -->
			<view class="popup-form">
				<!-- 用户名 -->
				<view class="input-row" :class="{ error: errors.username }">
					<text class="input-label">👤</text>
					<input
						class="input-field"
						v-model="form.username"
						placeholder="请输入用户名"
						@blur="validateField('username')"
					/>
				</view>
				<text class="error-msg" v-if="errors.username">{{ errors.username }}</text>

				<!-- 邮箱（仅注册） -->
				<view v-if="!isLoginMode" class="input-row" :class="{ error: errors.email }">
					<text class="input-label">📧</text>
					<input
						class="input-field"
						v-model="form.email"
						placeholder="请输入邮箱"
						@blur="validateField('email')"
					/>
				</view>
				<text class="error-msg" v-if="!isLoginMode && errors.email">{{ errors.email }}</text>

				<!-- 昵称（仅注册） -->
				<view v-if="!isLoginMode" class="input-row" :class="{ error: errors.nickname }">
					<text class="input-label">😊</text>
					<input
						class="input-field"
						v-model="form.nickname"
						placeholder="请输入昵称"
						@blur="validateField('nickname')"
					/>
				</view>
				<text class="error-msg" v-if="!isLoginMode && errors.nickname">{{ errors.nickname }}</text>

				<!-- 密码 -->
				<view class="input-row" :class="{ error: errors.password }">
					<text class="input-label">🔒</text>
					<input
						class="input-field"
						v-model="form.password"
						:type="showPassword ? 'text' : 'password'"
						placeholder="请输入密码"
						@blur="validateField('password')"
					/>
					<text class="toggle-eye" @click="showPassword = !showPassword">
						{{ showPassword ? '👁' : '👁‍🗨' }}
					</text>
				</view>
				<text class="error-msg" v-if="errors.password">{{ errors.password }}</text>

				<!-- 确认密码（仅注册） -->
				<view v-if="!isLoginMode" class="input-row" :class="{ error: errors.confirmPassword }">
					<text class="input-label">🔐</text>
					<input
						class="input-field"
						v-model="form.confirmPassword"
						:type="showPassword ? 'text' : 'password'"
						placeholder="请确认密码"
						@blur="validateField('confirmPassword')"
					/>
				</view>
				<text class="error-msg" v-if="!isLoginMode && errors.confirmPassword">{{ errors.confirmPassword }}</text>

				<!-- 记住密码（仅登录） -->
				<view v-if="isLoginMode" class="form-row">
					<view class="remember" @click="rememberMe = !rememberMe">
						<view class="checkbox" :class="{ checked: rememberMe }">✓</view>
						<text>记住密码</text>
					</view>
					<text class="forgot" @click="handleForgot">忘记密码？</text>
				</view>

				<!-- 提交按钮 -->
				<view class="submit-btn" :class="{ loading: isLoading }" @click="handleSubmit">
					<template v-if="isLoading">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</template>
					<text v-else>{{ isLoginMode ? '登 录' : '注 册' }}</text>
				</view>

				<!-- 切换提示 -->
				<view class="switch-tip">
					<text>{{ isLoginMode ? '还没有账号？' : '已有账号？' }}</text>
					<text class="switch-link" @click="switchMode(isLoginMode ? 'register' : 'login')">
						{{ isLoginMode ? '立即注册' : '立即登录' }}
					</text>
				</view>
			</view>

			<!-- 第三方登录（仅登录） -->
			<view v-if="isLoginMode" class="third-party">
				<view class="divider-line"></view>
				<text class="divider-text">其他方式登录</text>
				<view class="divider-line"></view>
			</view>

			<view v-if="isLoginMode" class="party-icons">
				<view class="party-item wechat" @click="handleThirdLogin('wechat')">
					<text>💬</text>
				</view>
				<view class="party-item qq" @click="handleThirdLogin('qq')">
					<text>🐧</text>
				</view>
				<view class="party-item phone" @click="handleThirdLogin('phone')">
					<text>📱</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue'

// API 基础地址 - 通过 Vite 代理转发
const BASE_URL = 'http://81.71.75.85:6008/api'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:visible', 'success', 'close'])

// 模式：登录/注册
const isLoginMode = ref(true)

// 表单数据
const form = ref({
	username: '',
	email: '',
	nickname: '',
	password: '',
	confirmPassword: ''
})

// 错误信息
const errors = ref({
	username: '',
	email: '',
	nickname: '',
	password: '',
	confirmPassword: ''
})

// 状态
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)

// 切换模式
const switchMode = (mode) => {
	isLoginMode.value = mode === 'login'
	// 清空错误
	errors.value = { username: '', email: '', nickname: '', password: '', confirmPassword: '' }
}

// 验证字段
const validateField = (field) => {
	switch (field) {
		case 'username':
			if (!form.value.username.trim()) {
				errors.value.username = '请输入用户名'
			} else if (form.value.username.length < 3) {
				errors.value.username = '用户名至少3个字符'
			} else if (form.value.username.length > 20) {
				errors.value.username = '用户名最多20个字符'
			} else {
				errors.value.username = ''
			}
			break
		case 'email':
			if (!form.value.email.trim()) {
				errors.value.email = '请输入邮箱'
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
				errors.value.email = '请输入正确的邮箱格式'
			} else {
				errors.value.email = ''
			}
			break
		case 'nickname':
			if (!form.value.nickname.trim()) {
				errors.value.nickname = '请输入昵称'
			} else if (form.value.nickname.length < 2) {
				errors.value.nickname = '昵称至少2个字符'
			} else {
				errors.value.nickname = ''
			}
			break
		case 'password':
			if (!form.value.password.trim()) {
				errors.value.password = '请输入密码'
			} else if (form.value.password.length < 6) {
				errors.value.password = '密码至少6个字符'
			} else {
				errors.value.password = ''
			}
			// 注册时同步验证确认密码
			if (!isLoginMode.value && form.value.confirmPassword) {
				validateField('confirmPassword')
			}
			break
		case 'confirmPassword':
			if (!form.value.confirmPassword.trim()) {
				errors.value.confirmPassword = '请确认密码'
			} else if (form.value.confirmPassword !== form.value.password) {
				errors.value.confirmPassword = '两次密码输入不一致'
			} else {
				errors.value.confirmPassword = ''
			}
			break
	}
}

// 表单验证
const validateForm = () => {
	validateField('username')
	validateField('password')

	if (!isLoginMode.value) {
		validateField('email')
		validateField('nickname')
		validateField('confirmPassword')
	}

	return !Object.values(errors.value).some(e => e)
}

/**
 * 登录接口
 * POST /api/v1/user/login
 */
const loginApi = (data) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: `${BASE_URL}/v1/user/login`,
			method: 'POST',
			data: {
				username: data.username,
				password: data.password
			},
			header: {
				'Content-Type': 'application/json'
			},
			timeout: 10000, // 30秒超时

			success: (res) => {
				console.log('登录响应:', res)

				// HTTP 状态码判断
				if (res.statusCode === 200) {
					const responseData = res.data

					// 业务状态码判断
					if (responseData.code === 0 || responseData.code === 200) {
						resolve({
							success: true,
							data: responseData.data,
							message: '登录成功'
						})
					} else {
						// 业务错误
						resolve({
							success: false,
							message: responseData.message || '登录失败，请检查用户名和密码'
						})
					}
				} else if (res.statusCode === 400) {
					resolve({
						success: false,
						message: '请求参数错误'
					})
				} else if (res.statusCode === 401) {
					resolve({
						success: false,
						message: '用户名或密码错误'
					})
				} else if (res.statusCode === 500) {
					resolve({
						success: false,
						message: '服务器错误，请稍后重试'
					})
				} else {
					resolve({
						success: false,
						message: `请求失败(${res.statusCode})`
					})
				}
			},
			fail: (err) => {
				console.error('登录请求失败:', err)

				// 网络错误处理
				let errorMessage = '网络错误，请检查网络连接'
				if (err.errMsg) {
					if (err.errMsg.includes('timeout')) {
						errorMessage = '请求超时，请稍后重试'
					} else if (err.errMsg.includes('network')) {
						errorMessage = '网络连接失败，请检查网络'
					} else if (err.errMsg.includes('abort')) {
						errorMessage = '请求已取消'
					}
				}

				resolve({
					success: false,
					message: errorMessage
				})
			}
		})
	})
}

/**
 * 注册接口
 * POST /api/v1/user/register
 */
const registerApi = (data) => {
	return new Promise((resolve, reject) => {
		uni.request({
			url: `${BASE_URL}/v1/user/register`,
			method: 'POST',
			data: {
				username: data.username,
				password: data.password,
				email: data.email,
				nickname: data.nickname
			},
			header: {
				'Content-Type': 'application/json'
			},
			timeout: 15000,
			success: (res) => {
				console.log('注册响应:', res)

				// HTTP 状态码判断
				if (res.statusCode === 200) {
					const responseData = res.data

					// 业务状态码判断
					if (responseData.code === 0 || responseData.code === 200) {
						resolve({
							success: true,
							data: responseData.data,
							message: '注册成功'
						})
					} else {
						// 业务错误
						resolve({
							success: false,
							message: responseData.message || '注册失败，请稍后重试'
						})
					}
				} else if (res.statusCode === 400) {
					const responseData = res.data
					resolve({
						success: false,
						message: responseData.message || '请求参数错误，请检查输入信息'
					})
				} else if (res.statusCode === 409) {
					resolve({
						success: false,
						message: '用户名或邮箱已被注册'
					})
				} else if (res.statusCode === 500) {
					resolve({
						success: false,
						message: '服务器错误，请稍后重试'
					})
				} else {
					resolve({
						success: false,
						message: `请求失败(${res.statusCode})`
					})
				}
			},
			fail: (err) => {
				console.error('注册请求失败:', err)

				// 网络错误处理
				let errorMessage = '网络错误，请检查网络连接'
				if (err.errMsg) {
					if (err.errMsg.includes('timeout')) {
						errorMessage = '请求超时，请稍后重试'
					} else if (err.errMsg.includes('network')) {
						errorMessage = '网络连接失败，请检查网络'
					} else if (err.errMsg.includes('abort')) {
						errorMessage = '请求已取消'
					}
				}

				resolve({
					success: false,
					message: errorMessage
				})
			}
		})
	})
}

/**
 * 保存用户登录信息
 */
const saveUserInfo = (data) => {
	// 保存 token
	if (data.token) {
		uni.setStorageSync('token', data.token)
	}

	// 保存用户信息
	const userInfo = {
		userId: data.userId,
		username: data.username,
		nickname: data.nickname,
		avatar: data.avatar,
		remainingQuota: data.remainingQuota
	}
	uni.setStorageSync('userInfo', userInfo)
}

// 提交处理
const handleSubmit = async () => {
	if (!validateForm() || isLoading.value) return

	isLoading.value = true

	try {
		let result

		if (isLoginMode.value) {
			// 登录
			result = await loginApi({
				username: form.value.username,
				password: form.value.password
			})
		} else {
			// 注册
			result = await registerApi({
				username: form.value.username,
				password: form.value.password,
				email: form.value.email,
				nickname: form.value.nickname
			})
		}

		if (result.success) {
			uni.showToast({
				title: isLoginMode.value ? '登录成功' : '注册成功',
				icon: 'success',
				duration: 1500
			})

			// 登录成功保存用户信息
			if (isLoginMode.value && result.data) {
				saveUserInfo(result.data)
			}

			// 记住用户名
			if (isLoginMode.value && rememberMe.value) {
				uni.setStorageSync('rememberedUsername', form.value.username)
			}

			emit('success', result.data)

			if (isLoginMode.value) {
				// 延迟关闭弹窗
				setTimeout(() => {
					handleClose()
				}, 500)
			} else {
				// 注册成功切换到登录
				setTimeout(() => {
					isLoginMode.value = true
					form.value.password = ''
					form.value.confirmPassword = ''
					uni.showToast({
						title: '请使用新账号登录',
						icon: 'none'
					})
				}, 1000)
			}
		} else {
			uni.showToast({
				title: result.message || (isLoginMode.value ? '登录失败' : '注册失败'),
				icon: 'none',
				duration: 2000
			})
		}
	} catch (error) {
		console.error('提交异常:', error)
		uni.showToast({
			title: '操作失败，请稍后重试',
			icon: 'none'
		})
	} finally {
		isLoading.value = false
	}
}

// 关闭弹窗
const handleClose = () => {
	emit('update:visible', false)
	emit('close')
}

// 点击遮罩关闭
const handleMaskClick = () => {
	handleClose()
}

// 忘记密码
const handleForgot = () => {
	uni.showToast({ title: '请联系管理员重置', icon: 'none' })
}

// 第三方登录
const handleThirdLogin = (type) => {
	uni.showToast({ title: `${type}登录开发中`, icon: 'none' })
}

// 监听弹窗显示，读取记住的用户名
watch(() => props.visible, (val) => {
	if (val) {
		const rememberedUsername = uni.getStorageSync('rememberedUsername')
		if (rememberedUsername) {
			form.value.username = rememberedUsername
			rememberMe.value = true
		}
	}
})
</script>

<style scoped lang="scss">
$primary: #1e3a8a;
$primary-light: #3b82f6;

.login-popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(8rpx);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10000;
	animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
	from { opacity: 0; }
	to { opacity: 1; }
}

.login-popup {
	width: 620rpx;
	max-height: 90vh;
	overflow-y: auto;
	background: #ffffff;
	border-radius: 32rpx;
	padding: 48rpx 40rpx;
	position: relative;
	animation: slideUp 0.3s ease;
}

@keyframes slideUp {
	from { opacity: 0; transform: translateY(60rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.close-btn {
	position: absolute;
	top: 24rpx;
	right: 24rpx;
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #9ca3af;
	font-size: 32rpx;
	cursor: pointer;

	&:hover { color: #6b7280; }
}

.popup-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 32rpx;
}

.logo-icon {
	width: 88rpx;
	height: 88rpx;
	background: linear-gradient(135deg, $primary, $primary-light);
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 20rpx;
}

.logo-star {
	color: #fff;
	font-size: 44rpx;
}

.popup-title {
	font-size: 36rpx;
	font-weight: 600;
	color: $primary;
	margin-bottom: 8rpx;
}

.popup-subtitle {
	font-size: 24rpx;
	color: #9ca3af;
}

// 模式切换标签
.mode-tabs {
	display: flex;
	background: #f1f5f9;
	border-radius: 16rpx;
	padding: 6rpx;
	margin-bottom: 28rpx;
	position: relative;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 18rpx 0;
	font-size: 26rpx;
	color: #64748b;
	position: relative;
	z-index: 1;
	transition: color 0.3s;

	&.active {
		color: $primary;
		font-weight: 600;
	}
}

.tab-indicator {
	position: absolute;
	top: 6rpx;
	bottom: 6rpx;
	width: 50%;
	background: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-form {
	margin-bottom: 24rpx;
}

.input-row {
	display: flex;
	align-items: center;
	background: #f8fafc;
	border: 2rpx solid #e5e7eb;
	border-radius: 12rpx;
	padding: 0 20rpx;
	margin-bottom: 6rpx;
	transition: all 0.3s;

	&:focus-within {
		border-color: $primary-light;
		background: #fff;
	}

	&.error {
		border-color: #ef4444;
		background: #fef2f2;
	}
}

.input-label {
	font-size: 28rpx;
	margin-right: 12rpx;
}

.input-field {
	flex: 1;
	height: 84rpx;
	font-size: 28rpx;
	color: #365a98;
}

.toggle-eye {
	padding: 16rpx;
	font-size: 28rpx;
}

.error-msg {
	font-size: 22rpx;
	color: #ef4444;
	margin-bottom: 10rpx;
	padding-left: 8rpx;
}

.form-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 18rpx 0 24rpx;
}

.remember {
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 24rpx;
	color: #6b7280;
}

.checkbox {
	width: 32rpx;
	height: 32rpx;
	border: 2rpx solid #d1d5db;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20rpx;
	color: #fff;

	&.checked {
		background: $primary-light;
		border-color: $primary-light;
	}
}

.forgot {
	font-size: 24rpx;
	color: $primary-light;
}

.submit-btn {
	height: 88rpx;
	background: linear-gradient(135deg, $primary, $primary-light);
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 30rpx;
	font-weight: 500;
	letter-spacing: 6rpx;
	cursor: pointer;
	transition: all 0.3s;

	&:active { transform: scale(0.98); }

	&.loading {
		gap: 12rpx;
		pointer-events: none;
	}
}

.dot {
	width: 12rpx;
	height: 12rpx;
	background: #fff;
	border-radius: 50%;
	animation: bounce 1.4s infinite;

	&:nth-child(1) { animation-delay: 0s; }
	&:nth-child(2) { animation-delay: 0.2s; }
	&:nth-child(3) { animation-delay: 0.4s; }
}

@keyframes bounce {
	0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
	40% { transform: scale(1.2); opacity: 1; }
}

.switch-tip {
	text-align: center;
	font-size: 24rpx;
	color: #9ca3af;
	margin-top: 20rpx;
}

.switch-link {
	color: $primary-light;
	margin-left: 8rpx;
}

.third-party {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}

.divider-line {
	flex: 1;
	height: 1rpx;
	background: #e5e7eb;
}

.divider-text {
	font-size: 22rpx;
	color: #9ca3af;
	padding: 0 20rpx;
}

.party-icons {
	display: flex;
	justify-content: center;
	gap: 40rpx;
}

.party-item {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	cursor: pointer;
	transition: all 0.3s;

	&:active { transform: scale(0.95); }
	&.wechat { background: #07c160; }
	&.qq { background: #12b7f5; }
	&.phone { background: #ff6b35; }
}
</style>
