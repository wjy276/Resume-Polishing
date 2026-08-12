import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// API 基础地址：开发环境走 Vite 代理，避免跨域；生产使用完整 URL
const BASE_URL = import.meta.env.DEV ? '/api' : 'http://81.71.75.85:6008/api'

export const useUserStore = defineStore('user', () => {
	// 状态
	const token = ref(uni.getStorageSync('token') || '')
	const userInfo = ref(uni.getStorageSync('userInfo') || null)
	const isLogin = ref(!!uni.getStorageSync('token'))
	const tokenExpired = ref(false)
	const loginPopupVisible = ref(false)

	// 计算属性
	const userName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '未登录')
	const hasToken = computed(() => !!token.value)

	/**
	 * 登录
	 * POST /api/v1/user/login
	 */
	const login = async (loginForm) => {
		return new Promise((resolve, reject) => {
			const url = `${BASE_URL}/v1/user/login`
			const requestData = {
				username: loginForm.username,
				password: loginForm.password
			}

			console.log('=== 登录请求开始 ===')
			console.log('请求 URL:', url)
			console.log('请求数据:', JSON.stringify(requestData))

			uni.request({
				url: url,
				method: 'POST',
				data: requestData,
				header: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				timeout: 30000,
				withCredentials: false,
				success: (res) => {
					console.log('=== 登录响应 ===')
					console.log('HTTP状态码:', res.statusCode)
					console.log('响应数据:', res.data)

					// 判断业务状态码
					const code = res.data?.code
					const message = res.data?.message || '请求失败'

					if (res.statusCode === 200) {
						if (code === 0 || code === 200) {
							// 登录成功
							const data = res.data.data
							token.value = data.token
							userInfo.value = {
								userId: data.userId,
								username: data.username,
								nickname: data.nickname,
								avatar: data.avatar,
								remainingQuota: data.remainingQuota
							}
							isLogin.value = true
							tokenExpired.value = false
							loginPopupVisible.value = false
							uni.setStorageSync('token', data.token)
							uni.setStorageSync('userInfo', userInfo.value)
							resolve({ success: true, data })
						} else {
							// 业务错误（用户不存在、密码错误等）
							resolve({ success: false, message })
						}
					} else {
						resolve({ success: false, message: `HTTP错误: ${res.statusCode}` })
					}
				},
				fail: (err) => {
					console.error('=== 登录请求失败 ===')
					console.error('错误:', err)
					resolve({ success: false, message: '网络连接失败' })
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
			const url = `${BASE_URL}/v1/user/register`
			const requestData = {
				username: registerForm.username,
				password: registerForm.password,
				email: registerForm.email,
				nickname: registerForm.nickname || registerForm.username
			}

			console.log('=== 注册请求开始 ===')
			console.log('请求 URL:', url)
			console.log('请求数据:', JSON.stringify(requestData))

			uni.request({
				url: url,
				method: 'POST',
				data: requestData,
				header: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				timeout: 30000,
				withCredentials: false,
				success: (res) => {
					console.log('=== 注册响应 ===')
					console.log('HTTP状态码:', res.statusCode)
					console.log('响应数据:', res.data)

					const code = res.data?.code
					const message = res.data?.message || '请求失败'

					if (res.statusCode === 200) {
						if (code === 0 || code === 200) {
							resolve({ success: true, data: res.data.data })
						} else {
							resolve({ success: false, message })
						}
					} else {
						resolve({ success: false, message: `HTTP错误: ${res.statusCode}` })
					}
				},
				fail: (err) => {
					console.error('=== 注册请求失败 ===')
					console.error('错误:', err)
					resolve({ success: false, message: '网络连接失败' })
				}
			})
		})
	}

	/**
	 * 清除登录状态（token 过期或主动退出时调用）
	 */
	const clearAuth = () => {
		token.value = ''
		userInfo.value = null
		isLogin.value = false
		tokenExpired.value = false
		uni.removeStorageSync('token')
		uni.removeStorageSync('userInfo')
	}

	/**
	 * 标记登录过期：清空登录态并弹出登录弹窗
	 * 任何请求收到 401 时调用，由 App.vue 全局监听并复用 LoginPopup
	 */
	const markTokenExpired = () => {
		clearAuth()
		tokenExpired.value = true
		loginPopupVisible.value = true
	}

	const openLoginPopup = () => {
		loginPopupVisible.value = true
	}

	const closeLoginPopup = () => {
		loginPopupVisible.value = false
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
					clearAuth()
					resolve({ success: true })
				},
				fail: () => {
					clearAuth()
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
					if (res.statusCode === 401) {
						markTokenExpired()
						resolve({ success: false, message: '登录已过期' })
						return
					}
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
		tokenExpired,
		loginPopupVisible,
		userName,
		hasToken,
		login,
		register,
		logout,
		clearAuth,
		markTokenExpired,
		openLoginPopup,
		closeLoginPopup,
		fetchUserInfo,
		checkLogin,
		updateUserInfo
	}
})
