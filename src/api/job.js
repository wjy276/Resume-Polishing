/**
 * 职位推荐 API — 统一走 /api 代理，自动携带 token
 */
import { request } from '@/utils/http'

/** 职位列表查询 */
export function fetchPositionList(params = {}) {
	const { pageNum = 1, pageSize = 10, keyword, city, industry, salaryMin, salaryMax } = params
	const query = { pageNum, pageSize }
	if (keyword) query.keyword = keyword
	if (city) query.city = city
	if (industry) query.industry = industry
	if (salaryMin !== undefined && salaryMin !== null) query.salaryMin = salaryMin
	if (salaryMax !== undefined && salaryMax !== null) query.salaryMax = salaryMax

	return request({
		url: '/v1/position/list',
		method: 'GET',
		query,
	})
}

/** 职位详情 */
export function fetchPositionDetail(positionId) {
	return request({
		url: `/v1/position/${encodeURIComponent(positionId)}`,
		method: 'GET',
	})
}
