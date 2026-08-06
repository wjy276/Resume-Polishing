/**
 * 简历 API — 对接 http://81.71.75.85:6008/api/doc.html
 */
import { request } from '@/utils/http'

/** 分页查询简历列表 */
export function fetchResumeList(params = {}) {
	const { pageNum = 1, pageSize = 50, keyword = '' } = params
	return request({
		url: '/v1/resume-data',
		method: 'GET',
		query: { pageNum, pageSize, keyword },
	})
}

/** 根据 ID 获取简历详情 */
export function fetchResumeDetail(resumeId) {
	return request({
		url: `/v1/resume-data/${encodeURIComponent(resumeId)}`,
		method: 'GET',
	})
}

/** 创建简历（大 payload 时给 60s，避免头像/富文本导致上传超时） */
export function createResumeApi(payload) {
	return request({
		url: '/v1/resume-data',
		method: 'POST',
		data: payload,
		timeout: 60000,
	})
}

/** 更新简历（大 payload 时给 60s） */
export function updateResumeApi(resumeId, payload) {
	return request({
		url: `/v1/resume-data/${encodeURIComponent(resumeId)}`,
		method: 'PUT',
		data: payload,
		timeout: 60000,
	})
}

/** 删除简历 */
export function deleteResumeApi(resumeId) {
	return request({
		url: `/v1/resume-data/${encodeURIComponent(resumeId)}`,
		method: 'DELETE',
	})
}
