/**
 * 模板相关API接口
 */

export const getTemplateList = (params = {}) => {
	return uni.request({
		url: '/api/template/list',
		method: 'GET',
		data: params
	})
}

export const getTemplateDetail = (id) => {
	return uni.request({
		url: `/api/template/${id}`,
		method: 'GET'
	})
}

export const getHotTemplates = (limit = 10) => {
	return uni.request({
		url: '/api/template/hot',
		method: 'GET',
		data: { limit }
	})
}

export const useTemplate = (templateId) => {
	return uni.request({
		url: `/api/template/use/${templateId}`,
		method: 'POST'
	})
}
