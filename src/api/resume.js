/**
 * 简历相关API接口
 */

export const getResumeList = (params = {}) => {
	return uni.request({
		url: '/api/resume/list',
		method: 'GET',
		data: params
	})
}

export const getResumeDetail = (id) => {
	return uni.request({
		url: `/api/resume/${id}`,
		method: 'GET'
	})
}

export const saveResume = (data) => {
	return uni.request({
		url: '/api/resume/save',
		method: 'POST',
		data
	})
}

export const deleteResume = (id) => {
	return uni.request({
		url: `/api/resume/${id}`,
		method: 'DELETE'
	})
}

export const exportPdf = (resumeId) => {
	return uni.request({
		url: `/api/resume/export/pdf/${resumeId}`,
		method: 'POST'
	})
}

export const exportPng = (resumeId) => {
	return uni.request({
		url: `/api/resume/export/png/${resumeId}`,
		method: 'POST'
	})
}
