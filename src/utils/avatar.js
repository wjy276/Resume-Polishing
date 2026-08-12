/**
 * 默认头像：使用本地静态图片，登录后若用户头像为空则展示此图
 */
export const DEFAULT_AVATAR = '/static/avatar.png'

/** 有有效 URL 则用用户头像，否则用默认占位 */
export function resolveAvatar(url) {
	if (typeof url === 'string' && url.trim()) return url.trim()
	return DEFAULT_AVATAR
}
