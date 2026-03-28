<template>
	<!-- 登录弹窗遮罩 -->
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
				<text class="popup-title">登录 AI 求职助手</text>
				<text class="popup-subtitle">解锁更多智能求职功能</text>
			</view>

			<!-- 表单 -->
			<view class="popup-form">
				<view class="input-row" :class="{ error: errors.username }">
					<text class="input-label">👤</text>
					<input
						class="input-field"
						v-model="loginForm.username"
						placeholder="请输入用户名"
						@blur="validateField('username')"
					/>
				</view>
				<text class="error-msg" v-if="errors.username">{{ errors.username }}</text>

				<view class="input-row" :class="{ error: errors.password }">
					<text class="input-label">🔒</text>
					<input
						class="input-field"
						v-model="loginForm.password"
						:type="showPassword ? 'text' : 'password'"
						placeholder="请输入密码"
						@blur="validateField('password')"
					/>
					<text class="toggle-eye" @click="showPassword = !showPassword">
						{{ showPassword ? '👁' : '👁‍🗨' }}
					</text>
				</view>
				<text class="error-msg" v-if="errors.password">{{ errors.password }}</text>

				<view class="form-row">
					<view class="remember" @click="rememberMe = !rememberMe">
						<view class="checkbox" :class="{ checked: rememberMe }">✓</view>
						<text>记住密码</text>
					</view>
					<text class="forgot" @click="handleForgot">忘记密码？</text>
				</view>

				<view class="submit-btn" :class="{ loading: isLoading }" @click="handleLogin">
					<template v-if="isLoading">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</template>
					<text v-else>登 录</text>
				</view>
			</view>

			<!-- 第三方登录 -->
			<view class="third-party">
				<view class="divider-line"></view>
				<text class="divider-text">其他方式登录</text>
				<view class="divider-line"></view>
			</view>

			<view class="party-icons">
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

			<!-- 注册提示 -->
			<view class="register-tip">
				<text>还没有账号？</text>
				<text class="register-link" @click="handleRegister">立即注册</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user.js'

const props = defineProps({
	visible: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['update:visible', 'success', 'close'])

const userStore = useUserStore()

// 表单
const loginForm = ref({ username: '', password: '' })
const errors = ref({ username: '', password: '' })
const showPassword = ref(false)
const rememberMe = ref(false)
const isLoading = ref(false)

// 验证
const validateField = (field) => {
	if (field === 'username') {
		errors.value.username = !loginForm.value.username.trim() ? '请输入用户名' :
			loginForm.value.username.length < 3 ? '用户名至少3个字符' : ''
	}
	if (field === 'password') {
		errors.value.password = !loginForm.value.password.trim() ? '请输入密码' :
			loginForm.value.password.length < 6 ? '密码至少6个字符' : ''
	}
}

// 登录
const handleLogin = async () => {
	validateField('username')
	validateField('password')

	if (errors.value.username || errors.value.password || isLoading.value) return

	isLoading.value = true

	try {
		const result = await userStore.login(loginForm.value)

		if (result.success) {
			uni.showToast({ title: '登录成功', icon: 'success' })
			emit('success', result.data)
			handleClose()
		} else {
			uni.showToast({ title: result.message || '登录失败', icon: 'none' })
		}
	} finally {
		isLoading.value = false
	}
}

// 关闭
const handleClose = () => {
	emit('update:visible', false)
	emit('close')
}

// 点击遮罩
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

// 注册
const handleRegister = () => {
	uni.showToast({ title: '注册功能开发中', icon: 'none' })
}
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
	width: 600rpx;
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
	margin-bottom: 40rpx;
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

.popup-form {
	margin-bottom: 32rpx;
}

.input-row {
	display: flex;
	align-items: center;
	background: #f8fafc;
	border: 2rpx solid #e5e7eb;
	border-radius: 12rpx;
	padding: 0 20rpx;
	margin-bottom: 8rpx;
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
	height: 88rpx;
	font-size: 28rpx;
}

.toggle-eye {
	padding: 16rpx;
	font-size: 28rpx;
}

.error-msg {
	font-size: 22rpx;
	color: #ef4444;
	margin-bottom: 12rpx;
	padding-left: 8rpx;
}

.form-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 20rpx 0 28rpx;
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

.third-party {
	display: flex;
	align-items: center;
	margin-bottom: 28rpx;
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
	margin-bottom: 28rpx;
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

.register-tip {
	text-align: center;
	font-size: 24rpx;
	color: #9ca3af;
}

.register-link {
	color: $primary-light;
	margin-left: 8rpx;
}
</style>
