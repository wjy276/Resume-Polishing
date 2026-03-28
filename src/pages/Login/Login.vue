<template>
	<view class="login-container">
		<!-- 背景装饰 -->
		<view class="bg-decoration">
			<view class="circle circle-1"></view>
			<view class="circle circle-2"></view>
			<view class="circle circle-3"></view>
		</view>

		<!-- 登录/注册弹窗 -->
		<view class="login-modal">
			<!-- Logo 区域 -->
			<view class="modal-header">
				<view class="logo-wrapper">
					<view class="logo-icon">
						<text class="logo-star">✦</text>
					</view>
				</view>
				<text class="modal-title">AI 求职助手</text>
				<text class="modal-subtitle">{{ isLoginMode ? '登录后解锁更多智能功能' : '注册账号，开启求职之旅' }}</text>
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

			<!-- 表单区域 -->
			<view class="form-section">
				<!-- 用户名输入 -->
				<view class="input-group" :class="{ error: errors.username }">
					<view class="input-icon">
						<text class="icon-text">👤</text>
					</view>
					<input
						class="input-field"
						v-model="form.username"
						placeholder="请输入用户名"
						placeholder-class="placeholder-text"
						@blur="validateField('username')"
						@input="clearError('username')"
					/>
					<view class="error-icon" v-if="errors.username">
						<text>⚠</text>
					</view>
				</view>
				<text class="error-text" v-if="errors.username">{{ errors.username }}</text>

				<!-- 邮箱输入（仅注册） -->
				<view v-if="!isLoginMode" class="input-group" :class="{ error: errors.email }">
					<view class="input-icon">
						<text class="icon-text">📧</text>
					</view>
					<input
						class="input-field"
						v-model="form.email"
						placeholder="请输入邮箱"
						placeholder-class="placeholder-text"
						@blur="validateField('email')"
						@input="clearError('email')"
					/>
					<view class="error-icon" v-if="errors.email">
						<text>⚠</text>
					</view>
				</view>
				<text class="error-text" v-if="!isLoginMode && errors.email">{{ errors.email }}</text>

				<!-- 密码输入 -->
				<view class="input-group" :class="{ error: errors.password }">
					<view class="input-icon">
						<text class="icon-text">🔒</text>
					</view>
					<input
						class="input-field"
						v-model="form.password"
						:type="showPassword ? 'text' : 'password'"
						placeholder="请输入密码"
						placeholder-class="placeholder-text"
						@blur="validateField('password')"
						@input="clearError('password')"
					/>
					<view class="toggle-password" @click="showPassword = !showPassword">
						<text class="icon-text">{{ showPassword ? '👁' : '👁‍🗨' }}</text>
					</view>
				</view>
				<text class="error-text" v-if="errors.password">{{ errors.password }}</text>

				<!-- 确认密码（仅注册） -->
				<view v-if="!isLoginMode" class="input-group" :class="{ error: errors.confirmPassword }">
					<view class="input-icon">
						<text class="icon-text">🔐</text>
					</view>
					<input
						class="input-field"
						v-model="form.confirmPassword"
						:type="showPassword ? 'text' : 'password'"
						placeholder="请确认密码"
						placeholder-class="placeholder-text"
						@blur="validateField('confirmPassword')"
						@input="clearError('confirmPassword')"
					/>
				</view>
				<text class="error-text" v-if="!isLoginMode && errors.confirmPassword">{{ errors.confirmPassword }}</text>

				<!-- 记住密码 & 忘记密码（仅登录） -->
				<view v-if="isLoginMode" class="form-options">
					<view class="remember-me" @click="rememberMe = !rememberMe">
						<view class="checkbox" :class="{ checked: rememberMe }">
							<text v-if="rememberMe">✓</text>
						</view>
						<text class="option-text">记住密码</text>
					</view>
					<text class="forgot-password" @click="handleForgotPassword">忘记密码？</text>
				</view>

				<!-- 提交按钮 -->
				<view
					class="submit-btn"
					:class="{ loading: isLoading, disabled: !isFormValid }"
					@click="handleSubmit"
				>
					<view class="btn-loading" v-if="isLoading">
						<view class="loading-dot"></view>
						<view class="loading-dot"></view>
						<view class="loading-dot"></view>
					</view>
					<text v-else class="btn-text">{{ isLoginMode ? '登 录' : '注 册' }}</text>
				</view>

				<!-- 切换提示 -->
				<view class="switch-hint">
					<text class="hint-text">{{ isLoginMode ? '还没有账号？' : '已有账号？' }}</text>
					<text class="switch-link" @click="switchMode(isLoginMode ? 'register' : 'login')">
						{{ isLoginMode ? '立即注册' : '立即登录' }}
					</text>
				</view>
			</view>

			<!-- 第三方登录（仅登录模式） -->
			<view v-if="isLoginMode" class="third-party-login">
				<view class="divider">
					<view class="divider-line"></view>
					<text class="divider-text">其他登录方式</text>
					<view class="divider-line"></view>
				</view>
				<view class="third-party-icons">
					<view class="party-icon wechat" @click="handleThirdLogin('wechat')">
						<text class="icon">💬</text>
					</view>
					<view class="party-icon qq" @click="handleThirdLogin('qq')">
						<text class="icon">🐧</text>
					</view>
					<view class="party-icon phone" @click="handleThirdLogin('phone')">
						<text class="icon">📱</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部协议 -->
		<view class="agreement">
			<view class="agreement-check" @click="agreed = !agreed">
				<view class="checkbox" :class="{ checked: agreed }">
					<text v-if="agreed">✓</text>
				</view>
			</view>
			<text class="agreement-text">{{ isLoginMode ? '登录' : '注册' }}即代表同意</text>
			<text class="agreement-link" @click="viewAgreement('user')">《用户协议》</text>
			<text class="agreement-text">和</text>
			<text class="agreement-link" @click="viewAgreement('privacy')">《隐私政策》</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()

// 模式：登录/注册
const isLoginMode = ref(true)

// 表单数据
const form = ref({
	username: '',
	email: '',
	password: '',
	confirmPassword: ''
})

// 表单错误
const errors = ref({
	username: '',
	email: '',
	password: '',
	confirmPassword: ''
})

// 状态
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)
const agreed = ref(false)

// 表单是否有效
const isFormValid = computed(() => {
	const baseValid = form.value.username.trim() !== '' &&
					  form.value.password.trim() !== '' &&
					  !errors.value.username &&
					  !errors.value.password

	if (isLoginMode.value) {
		return baseValid
	}

	return baseValid &&
		   form.value.email.trim() !== '' &&
		   form.value.confirmPassword.trim() !== '' &&
		   !errors.value.email &&
		   !errors.value.confirmPassword
})

// 切换模式
const switchMode = (mode) => {
	isLoginMode.value = mode === 'login'
	// 清空错误
	errors.value = { username: '', email: '', password: '', confirmPassword: '' }
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
		case 'password':
			if (!form.value.password.trim()) {
				errors.value.password = '请输入密码'
			} else if (form.value.password.length < 6) {
				errors.value.password = '密码至少6个字符'
			} else if (form.value.password.length > 20) {
				errors.value.password = '密码最多20个字符'
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

// 清除错误
const clearError = (field) => {
	errors.value[field] = ''
}

// 表单验证
const validateForm = () => {
	validateField('username')
	validateField('password')

	if (!isLoginMode.value) {
		validateField('email')
		validateField('confirmPassword')
	}

	if (!agreed.value) {
		uni.showToast({
			title: '请先同意用户协议',
			icon: 'none'
		})
		return false
	}

	return !Object.values(errors.value).some(e => e)
}

// 提交处理
const handleSubmit = async () => {
	if (!validateForm() || isLoading.value) return

	isLoading.value = true

	try {
		let result
		if (isLoginMode.value) {
			// 登录
			result = await userStore.login({
				username: form.value.username,
				password: form.value.password
			})
		} else {
			// 注册
			result = await userStore.register({
				username: form.value.username,
				password: form.value.password,
				email: form.value.email,
				nickname: form.value.username
			})
		}

		if (result.success) {
			uni.showToast({
				title: isLoginMode.value ? '登录成功' : '注册成功',
				icon: 'success',
				duration: 1500
			})

			// 记住密码
			if (isLoginMode.value && rememberMe.value) {
				uni.setStorageSync('rememberedUsername', form.value.username)
			}

			// 延迟跳转
			setTimeout(() => {
				if (isLoginMode.value) {
					// 登录成功跳转首页
					uni.redirectTo({
						url: '/pages/Home/Home'
					})
				} else {
					// 注册成功切换到登录
					isLoginMode.value = true
					uni.showToast({
						title: '请使用新账号登录',
						icon: 'none'
					})
				}
			}, 1500)
		} else {
			uni.showToast({
				title: result.message || (isLoginMode.value ? '登录失败' : '注册失败'),
				icon: 'none'
			})
		}
	} catch (error) {
		uni.showToast({
			title: '网络错误，请重试',
			icon: 'none'
		})
	} finally {
		isLoading.value = false
	}
}

// 忘记密码
const handleForgotPassword = () => {
	uni.showToast({
		title: '请联系管理员重置密码',
		icon: 'none'
	})
}

// 第三方登录
const handleThirdLogin = (type) => {
	const typeNames = {
		wechat: '微信',
		qq: 'QQ',
		phone: '手机号'
	}
	uni.showToast({
		title: `${typeNames[type]}登录开发中`,
		icon: 'none'
	})
}

// 查看协议
const viewAgreement = (type) => {
	uni.showToast({
		title: type === 'user' ? '用户协议' : '隐私政策',
		icon: 'none'
	})
}

// 初始化
onMounted(() => {
	// 检查是否已登录
	if (userStore.checkLogin()) {
		uni.redirectTo({
			url: '/pages/Home/Home'
		})
		return
	}

	// 读取记住的用户名
	const rememberedUsername = uni.getStorageSync('rememberedUsername')
	if (rememberedUsername) {
		form.value.username = rememberedUsername
		rememberMe.value = true
	}
})
</script>

<style scoped lang="scss">
$primary-color: #1e3a8a;
$primary-light: #3b82f6;
$primary-gradient: linear-gradient(135deg, #1e3a8a, #3b82f6);

.login-container {
	min-height: 100vh;
	background: $primary-gradient;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48rpx;
	position: relative;
	overflow: hidden;
}

// 背景装饰
.bg-decoration {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	pointer-events: none;
	overflow: hidden;

	.circle {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
	}

	.circle-1 {
		width: 400rpx;
		height: 400rpx;
		top: -100rpx;
		right: -100rpx;
		animation: float 8s ease-in-out infinite;
	}

	.circle-2 {
		width: 300rpx;
		height: 300rpx;
		bottom: 100rpx;
		left: -80rpx;
		animation: float 6s ease-in-out infinite reverse;
	}

	.circle-3 {
		width: 200rpx;
		height: 200rpx;
		bottom: -50rpx;
		right: 100rpx;
		animation: float 7s ease-in-out infinite;
	}
}

@keyframes float {
	0%, 100% { transform: translateY(0) scale(1); }
	50% { transform: translateY(-30rpx) scale(1.05); }
}

// 登录弹窗
.login-modal {
	width: 100%;
	max-width: 640rpx;
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20rpx);
	border-radius: 32rpx;
	padding: 48rpx 40rpx;
	box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
	animation: modalIn 0.5s ease-out;
}

@keyframes modalIn {
	from {
		opacity: 0;
		transform: translateY(40rpx) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

// 头部区域
.modal-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 32rpx;
}

.logo-wrapper {
	margin-bottom: 20rpx;
}

.logo-icon {
	width: 100rpx;
	height: 100rpx;
	background: $primary-gradient;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(30, 58, 138, 0.3);
}

.logo-star {
	font-size: 48rpx;
	color: #ffffff;
}

.modal-title {
	font-size: 40rpx;
	font-weight: 700;
	color: $primary-color;
	margin-bottom: 8rpx;
}

.modal-subtitle {
	font-size: 24rpx;
	color: #6b7280;
}

// 模式切换标签
.mode-tabs {
	display: flex;
	background: #f1f5f9;
	border-radius: 16rpx;
	padding: 6rpx;
	margin-bottom: 32rpx;
	position: relative;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx 0;
	font-size: 28rpx;
	color: #64748b;
	position: relative;
	z-index: 1;
	transition: color 0.3s;

	&.active {
		color: $primary-color;
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

// 表单区域
.form-section {
	margin-bottom: 32rpx;
}

.input-group {
	display: flex;
	align-items: center;
	background: #f8fafc;
	border: 2rpx solid #e2e8f0;
	border-radius: 16rpx;
	padding: 0 24rpx;
	margin-bottom: 8rpx;
	transition: all 0.3s;

	&:focus-within {
		border-color: $primary-light;
		background: #ffffff;
		box-shadow: 0 0 0 4rpx rgba(59, 130, 246, 0.1);
	}

	&.error {
		border-color: #ef4444;
		background: #fef2f2;
	}
}

.input-icon {
	width: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-text {
	font-size: 32rpx;
}

.input-field {
	flex: 1;
	height: 96rpx;
	font-size: 30rpx;
	color: #1f2937;
}

.placeholder-text {
	color: #9ca3af;
}

.toggle-password {
	padding: 16rpx;
	cursor: pointer;
}

.error-icon {
	color: #ef4444;
	font-size: 28rpx;
}

.error-text {
	font-size: 24rpx;
	color: #ef4444;
	margin-bottom: 16rpx;
	padding-left: 8rpx;
}

// 表单选项
.form-options {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 24rpx 0 32rpx;
}

.remember-me {
	display: flex;
	align-items: center;
	gap: 12rpx;
	cursor: pointer;
}

.checkbox {
	width: 36rpx;
	height: 36rpx;
	border: 2rpx solid #d1d5db;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #ffffff;
	transition: all 0.3s;

	&.checked {
		background: $primary-light;
		border-color: $primary-light;
	}
}

.option-text {
	font-size: 26rpx;
	color: #6b7280;
}

.forgot-password {
	font-size: 26rpx;
	color: $primary-light;
	cursor: pointer;
}

// 提交按钮
.submit-btn {
	height: 96rpx;
	background: $primary-gradient;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s;
	box-shadow: 0 4rpx 16rpx rgba(30, 58, 138, 0.3);

	&:active {
		transform: scale(0.98);
	}

	&.loading {
		pointer-events: none;
	}

	&.disabled {
		opacity: 0.6;
		pointer-events: none;
	}
}

.btn-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
	letter-spacing: 8rpx;
}

.btn-loading {
	display: flex;
	gap: 12rpx;
}

.loading-dot {
	width: 16rpx;
	height: 16rpx;
	background: #ffffff;
	border-radius: 50%;
	animation: bounce 1.4s ease-in-out infinite;

	&:nth-child(1) { animation-delay: 0s; }
	&:nth-child(2) { animation-delay: 0.2s; }
	&:nth-child(3) { animation-delay: 0.4s; }
}

@keyframes bounce {
	0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
	40% { transform: scale(1.2); opacity: 1; }
}

// 切换提示
.switch-hint {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 8rpx;
	margin-top: 24rpx;
}

.hint-text {
	font-size: 26rpx;
	color: #6b7280;
}

.switch-link {
	font-size: 26rpx;
	color: $primary-light;
	font-weight: 500;
	cursor: pointer;
}

// 第三方登录
.third-party-login {
	margin-top: 24rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #e5e7eb;
}

.divider {
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
	font-size: 24rpx;
	color: #9ca3af;
	padding: 0 24rpx;
}

.third-party-icons {
	display: flex;
	justify-content: center;
	gap: 48rpx;
}

.party-icon {
	width: 88rpx;
	height: 88rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s;

	&:active {
		transform: scale(0.95);
	}

	&.wechat {
		background: #07c160;

		&:hover {
			box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.4);
		}
	}

	&.qq {
		background: #12b7f5;

		&:hover {
			box-shadow: 0 4rpx 16rpx rgba(18, 183, 245, 0.4);
		}
	}

	&.phone {
		background: #ff6b35;

		&:hover {
			box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.4);
		}
	}

	.icon {
		font-size: 40rpx;
	}
}

// 底部协议
.agreement {
	margin-top: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	gap: 4rpx;
}

.agreement-check {
	cursor: pointer;
	margin-right: 8rpx;
}

.agreement-text {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.7);
}

.agreement-link {
	font-size: 24rpx;
	color: #ffffff;
	cursor: pointer;
	text-decoration: underline;
}
</style>
