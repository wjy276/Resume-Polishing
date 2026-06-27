/**
 * 默认头像：内联 SVG，不依赖外网，避免 OSS 超时导致控制台报错。
 */
export const DEFAULT_AVATAR =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
			'<rect width="100" height="100" fill="#e5e7eb"/>' +
			'<circle cx="50" cy="36" r="17" fill="#9ca3af"/>' +
			'<ellipse cx="50" cy="80" rx="26" ry="20" fill="#9ca3af"/>' +
		'</svg>'
	)

/** 有有效 URL 则用用户头像，否则用默认占位 */
export function resolveAvatar(url) {
	if (typeof url === 'string' && url.trim()) return url.trim()
	return DEFAULT_AVATAR
}
