/**
 * 模板 API — 对接 Spring Boot 后端
 * 基础地址: http://81.71.75.85:6008/api
 */
import { request } from '@/utils/http'

/** 获取模板列表（分页） */
export function fetchTemplateList(params = {}) {
	const { pageNum = 1, pageSize = 50, category = '', keyword = '' } = params
	return request({
		url: '/v1/template',
		method: 'GET',
		query: { pageNum, pageSize, category, keyword },
	})
}

/** 获取模板详情 */
export function fetchTemplateDetail(templateId) {
	return request({
		url: `/v1/template/${encodeURIComponent(templateId)}`,
		method: 'GET',
	})
}

/** 创建模板（保存为模板） */
export function createTemplateApi(payload) {
	return request({
		url: '/v1/template',
		method: 'POST',
		data: payload,
	})
}

/** 更新模板 */
export function updateTemplateApi(templateId, payload) {
	return request({
		url: `/v1/template/${encodeURIComponent(templateId)}`,
		method: 'PUT',
		data: payload,
	})
}

/** 删除模板 */
export function deleteTemplateApi(templateId) {
	return request({
		url: `/v1/template/${encodeURIComponent(templateId)}`,
		method: 'DELETE',
	})
}

/** 使用模板创建简历 */
export function useTemplateApi(templateId) {
	return request({
		url: `/v1/template/${encodeURIComponent(templateId)}/use`,
		method: 'POST',
	})
}

/** 获取热门模板 */
export function fetchHotTemplates(limit = 10) {
	return request({
		url: '/v1/template/hot',
		method: 'GET',
		query: { limit },
	})
}
