import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// API 基础地址
const BASE_URL = 'http://81.71.75.85:8080/api'

export const useUserStore = defineStore('user', () => {
	// 状态
	const token = ref(uni.getStorageSync('token') || '')
	const userInfo = ref(uni.getStorageSync('userInfo') || null)
	const isLogin = ref(!!uni.getStorageSync('token'))

	// 计算属性
	const userName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '未登录')
	const hasToken = computed(() => !!token.value)

	/**
	 * 登录
	 * POST /api/v1/user/login
	 */
	const login = async (loginForm) => {
		return new Promise((resolve, reject) => {
			uni.request({
				url: `${BASE_URL}/v1/user/login`,
				method: 'POST',
				data: {
					username: loginForm.username,
					password: loginForm.password
				},
				header: {
					'Content-Type': 'application/json'
				},
				success: (res) => {
					if (res.statusCode === 200 && res.data.code === 0) {
						const data = res.data.data
						// 保存 token 和用户信息
						token.value = data.token
						userInfo.value = {
							userId: data.userId,
							username: data.username,
							nickname: data.nickname,
							avatar: data.avatar,
							remainingQuota: data.remainingQuota
						}
						isLogin.value = true

						// 持久化存储
						uni.setStorageSync('token', data.token)
						uni.setStorageSync('userInfo', userInfo.value)

						resolve({ success: true, data })
					} else {
						resolve({
							success: false,
							message: res.data?.message || '登录失败，请检查用户名和密码'
						})
					}
				},
				fail: (err) => {
					console.error('登录请求失败:', err)
					resolve({ success: false, message: '网络错误，请稍后重试' })
				}
			})
		})
	}

	/**
	 * 注册
	 * POST /api/v1/user/register
	 */
	const register = async (registerForm) => {
		return new Promise((resolve, reject) => {
			uni.request({
				url: `${BASE_URL}/v1/user/register`,
				method: 'POST',
				data: {
					username: registerForm.username,
					password: registerForm.password,
					email: registerForm.email,
					nickname: registerForm.nickname || registerForm.username
				},
				header: {
					'Content-Type': 'application/json'
				},
				success: (res) => {
					if (res.statusCode === 200 && res.data.code === 0) {
						const data = res.data.data
						resolve({ success: true, data })
					} else {
						resolve({
							success: false,
							message: res.data?.message || '注册失败，请稍后重试'
						})
					}
				},
				fail: (err) => {
					console.error('注册请求失败:', err)
					resolve({ success: false, message: '网络错误，请稍后重试' })
				}
			})
		})
	}

	/**
	 * 退出登录
	 * POST /api/v1/user/logout
	 */
	const logout = async () => {
		return new Promise((resolve) => {
			uni.request({
				url: `${BASE_URL}/v1/user/logout`,
				method: 'POST',
				header: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token.value}`
				},
				success: () => {
					// 清除本地状态
					token.value = ''
					userInfo.value = null
					isLogin.value = false
					uni.removeStorageSync('token')
					uni.removeStorageSync('userInfo')
					resolve({ success: true })
				},
				fail: () => {
					// 即使请求失败也清除本地状态
					token.value = ''
					userInfo.value = null
					isLogin.value = false
					uni.removeStorageSync('token')
					uni.removeStorageSync('userInfo')
					resolve({ success: true })
				}
			})
		})
	}

	/**
	 * 获取用户信息
	 * GET /api/v1/user/info
	 */
	const fetchUserInfo = async () => {
		return new Promise((resolve, reject) => {
			uni.request({
				url: `${BASE_URL}/v1/user/info`,
				method: 'GET',
				header: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token.value}`
				},
				success: (res) => {
					if (res.statusCode === 200 && res.data.code === 0) {
						const data = res.data.data
						userInfo.value = {
							userId: data.userId,
							username: data.username,
							nickname: data.nickname,
							avatar: data.avatar,
							email: data.email,
							phone: data.phone,
							quota: data.quota,
							usedQuota: data.usedQuota,
							remainingQuota: data.remainingQuota,
							wechatBind: data.wechatBind
						}
						uni.setStorageSync('userInfo', userInfo.value)
						resolve({ success: true, data })
					} else {
						resolve({ success: false, message: res.data?.message || '获取用户信息失败' })
					}
				},
				fail: (err) => {
					console.error('获取用户信息失败:', err)
					resolve({ success: false, message: '网络错误' })
				}
			})
		})
	}

	/**
	 * 检查登录状态
	 */
	const checkLogin = () => {
		const storedToken = uni.getStorageSync('token')
		if (storedToken) {
			token.value = storedToken
			userInfo.value = uni.getStorageSync('userInfo')
			isLogin.value = true
			return true
		}
		return false
	}

	/**
	 * 更新用户信息
	 */
	const updateUserInfo = (info) => {
		userInfo.value = { ...userInfo.value, ...info }
		uni.setStorageSync('userInfo', userInfo.value)
	}

	return {
		token,
		userInfo,
		isLogin,
		userName,
		hasToken,
		login,
		register,
		logout,
		fetchUserInfo,
		checkLogin,
		updateUserInfo
	}
})
