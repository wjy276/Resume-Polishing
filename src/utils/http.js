/**
 * 统一 HTTP 请求（uni.request）
 * 与登录等模块共用同一后端：http://81.71.75.85:6008/api
 */

export const API_BASE_URL = 'http://81.71.75.85:6008/api'

let _tokenExpiredTimer = null

function getToken() {
	return uni.getStorageSync('token') || ''
}

function handleTokenExpired() {
	uni.removeStorageSync('token')
	uni.removeStorageSync('userInfo')

	if (_tokenExpiredTimer) return
	_tokenExpiredTimer = setTimeout(() => {
		_tokenExpiredTimer = null
	}, 2000)

	uni.$emit('token-expired')
}

/**
 * @param {object} options
 * @param {string} options.url 相对路径，如 /v1/resume-data
 * @param {'GET'|'POST'|'PUT'|'DELETE'} [options.method]
 * @param {object} [options.data] body
 * @param {object} [options.query] query 参数
 * @param {boolean} [options.auth=true] 是否携带 Bearer Token
 */
export function request(options) {
	const {
		url,
		method = 'GET',
		data,
		query,
		auth = true,
	} = options

	let fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
	if (query && Object.keys(query).length) {
		const qs = Object.entries(query)
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join('&')
		if (qs) fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs
	}

	const header = {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	}
	if (auth) {
		const token = getToken()
		if (token) header.Authorization = `Bearer ${token}`
	}

	return new Promise((resolve) => {
		uni.request({
			url: fullUrl,
			method,
			data,
			header,
			timeout: 30000,
			success: (res) => {
				if (res.statusCode === 401) {
					handleTokenExpired()
					resolve({
						ok: false,
						code: 401,
						message: '登录已过期，请重新登录',
						data: null,
						raw: res.data,
					})
					return
				}

				const body = res.data
				const code = body?.code
				const ok = res.statusCode === 200 && (code === 0 || code === 200)

				resolve({
					ok,
					code,
					message: body?.message || (ok ? '' : `HTTP ${res.statusCode}`),
					data: body?.data,
					raw: body,
				})
			},
			fail: () => {
				resolve({
					ok: false,
					code: -1,
					message: '网络连接失败',
					data: null,
					raw: null,
				})
			},
		})
	})
}

export function isApiSuccess(res) {
	return res?.ok === true
}
