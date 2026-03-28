/**
 * 登录检查工具
 * 用于检查用户登录状态，未登录时弹出提示
 */

import { useUserStore } from '@/stores/user.js'

/**
 * 检查是否已登录
 * @param {Object} options 配置选项
 * @param {boolean} options.showModal 未登录时是否显示弹窗
 * @param {string} options.message 提示消息
 * @returns {boolean} 是否已登录
 */
export function checkLogin(options = {}) {
	const { showModal = true, message = '请先登录后再使用此功能' } = options
	const userStore = useUserStore()

	// 检查 token
	const token = uni.getStorageSync('token')
	if (!token) {
		if (showModal) {
			uni.showModal({
				title: '提示',
				content: message,
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/pages/Login/Login'
						})
					}
				}
			})
		}
		return false
	}

	// 同步 store 状态
	if (!userStore.isLogin) {
		userStore.checkLogin()
	}

	return true
}

/**
 * 需要登录的操作装饰器
 * @param {Function} fn 需要登录才能执行的函数
 * @param {Object} options 配置选项
 */
export function requireLogin(fn, options = {}) {
	return function(...args) {
		if (checkLogin(options)) {
			return fn.apply(this, args)
		}
	}
}

/**
 * 跳转到需要登录的页面
 * @param {string} url 页面路径
 * @param {Object} options 跳转配置
 */
export function navigateToLogin(url, options = {}) {
	if (checkLogin({ showModal: true, ...options })) {
		uni.navigateTo({ url })
	}
}

/**
 * 获取用户信息，未登录返回 null
 * @returns {Object|null} 用户信息
 */
export function getUserInfo() {
	const token = uni.getStorageSync('token')
	if (!token) return null

	return uni.getStorageSync('userInfo')
}

/**
 * 获取 token
 * @returns {string|null} token
 */
export function getToken() {
	return uni.getStorageSync('token') || null
}

export default {
	checkLogin,
	requireLogin,
	navigateToLogin,
	getUserInfo,
	getToken
}
