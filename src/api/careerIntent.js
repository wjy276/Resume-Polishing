/**
 * 用户求职意向 API — 对接 ResumeAgent FastAPI 服务
 * 基础地址: /ai-api (开发代理到 http://localhost:8000/api)
 */
import { aiRequest } from '@/api/ai'

/** 获取用户求职意向 */
export function fetchUserCareerIntent(userId) {
	return aiRequest({
		url: `/user-career-intent/${encodeURIComponent(userId)}`,
		method: 'GET',
	})
}

/** 保存用户求职意向 */
export function saveUserCareerIntent(payload) {
	return aiRequest({
		url: '/user-career-intent',
		method: 'POST',
		data: payload,
	})
}
