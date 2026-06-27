/**
 * 职位模拟数据生成器
 * 用于开发测试，生成逼真的职位数据
 */

// 公司数据池
const companies = [
	{ name: '字节跳动', industry: '互联网', scale: '10000人以上', logo: 'https://img.bosszhipin.com/beijin/mcs/chatphoto/20171204/489c3aa955a74a89a889d24864b2a9a5cfcd20852b3ae401aa8f8c87a8e11c29.jpg' },
	{ name: '阿里巴巴', industry: '互联网', scale: '10000人以上', logo: 'https://img.bosszhipin.com/beijin/mcs/chatphoto/20180420/13cf53d67c1daa8e1daa5b7d0bd8b7be5e58d15e750c5d56c8c1e7d1f60eaa8e.jpg' },
	{ name: '腾讯', industry: '互联网', scale: '10000人以上', logo: 'https://img.bosszhipin.com/beijin/mcs/chatphoto/20180420/4f731e6c5e9c1e2e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1.jpg' },
	{ name: '美团', industry: '互联网', scale: '10000人以上', logo: 'https://img.bosszhipin.com/beijin/mcs/chatphoto/20190424/74e6e16f8e6d4e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8.jpg' },
	{ name: '京东', industry: '电商', scale: '10000人以上', logo: 'https://img.bosszhipin.com/beijin/mcs/chatphoto/20190424/74e6e16f8e6d4e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8e8.jpg' },
	{ name: '小米科技', industry: '互联网', scale: '5000-10000人', logo: '' },
	{ name: '网易', industry: '互联网', scale: '10000人以上', logo: '' },
	{ name: '百度', industry: '互联网', scale: '10000人以上', logo: '' },
	{ name: '快手', industry: '互联网', scale: '10000人以上', logo: '' },
	{ name: '滴滴出行', industry: '互联网', scale: '5000-10000人', logo: '' },
	{ name: '华为', industry: '通信', scale: '10000人以上', logo: '' },
	{ name: '蚂蚁集团', industry: '金融科技', scale: '10000人以上', logo: '' },
	{ name: '拼多多', industry: '电商', scale: '10000人以上', logo: '' },
	{ name: 'B站', industry: '互联网', scale: '5000-10000人', logo: '' },
	{ name: '小红书', industry: '互联网', scale: '1000-5000人', logo: '' },
	{ name: '得物', industry: '电商', scale: '1000-5000人', logo: '' },
	{ name: '商汤科技', industry: '人工智能', scale: '1000-5000人', logo: '' },
	{ name: '旷视科技', industry: '人工智能', scale: '500-1000人', logo: '' },
	{ name: '科大讯飞', industry: '人工智能', scale: '5000-10000人', logo: '' },
	{ name: '大疆', industry: '智能硬件', scale: '5000-10000人', logo: '' }
]

// 职位标题数据池
const jobTitles = {
	前端: ['前端开发工程师', '高级前端工程师', '前端技术专家', 'Web前端开发', 'H5开发工程师', '小程序开发工程师', '前端架构师'],
	后端: ['后端开发工程师', 'Java开发工程师', 'Python开发工程师', 'Go开发工程师', 'Node.js开发工程师', '后端架构师', '服务端开发'],
	全栈: ['全栈开发工程师', '全栈工程师', 'Web全栈开发'],
	移动端: ['iOS开发工程师', 'Android开发工程师', '移动端开发工程师', 'Flutter开发工程师', 'React Native开发'],
	测试: ['测试工程师', '自动化测试工程师', '测试开发工程师', '性能测试工程师', 'QA工程师'],
	运维: ['运维工程师', 'DevOps工程师', 'SRE工程师', '容器运维工程师', '云计算工程师'],
	数据: ['数据分析师', '数据工程师', '大数据开发工程师', '数据仓库工程师', 'BI工程师'],
	算法: ['算法工程师', '机器学习工程师', '深度学习工程师', 'NLP算法工程师', '推荐算法工程师', 'CV算法工程师'],
	产品: ['产品经理', '高级产品经理', '产品总监', '数据产品经理', 'B端产品经理'],
	设计: ['UI设计师', 'UX设计师', '交互设计师', '视觉设计师', '产品设计师'],
	运营: ['运营专员', '用户运营', '内容运营', '活动运营', '社区运营']
}

// 城市数据池
const cities = [
	{ name: '北京', district: ['朝阳区', '海淀区', '西城区', '东城区', '丰台区'] },
	{ name: '上海', district: ['浦东新区', '徐汇区', '静安区', '黄浦区', '长宁区'] },
	{ name: '深圳', district: ['南山区', '福田区', '宝安区', '罗湖区', '龙岗区'] },
	{ name: '杭州', district: ['西湖区', '滨江区', '余杭区', '拱墅区', '萧山区'] },
	{ name: '广州', district: ['天河区', '海珠区', '越秀区', '番禺区', '黄埔区'] },
	{ name: '成都', district: ['高新区', '武侯区', '锦江区', '青羊区', '成华区'] },
	{ name: '南京', district: ['鼓楼区', '玄武区', '建邺区', '江宁区', '栖霞区'] },
	{ name: '武汉', district: ['洪山区', '武昌区', '江汉区', '东湖高新区', '江岸区'] },
	{ name: '西安', district: ['高新区', '雁塔区', '碑林区', '未央区', '长安区'] },
	{ name: '苏州', district: ['工业园区', '姑苏区', '吴中区', '相城区', '高新区'] }
]

// 学历要求
const educations = ['本科', '本科', '本科', '本科', '硕士', '大专', '硕士', '不限']

// 工作经验
const experiences = ['1-3年', '3-5年', '3-5年', '5-10年', '1年以内', '应届生', '3-5年', '5-10年']

// 薪资范围生成
const generateSalary = (level) => {
	const salaryRanges = {
		junior: ['8-12K', '10-15K', '12-18K', '10-13K', '8-15K'],
		mid: ['15-25K', '18-30K', '20-35K', '15-28K', '18-25K'],
		senior: ['25-40K', '30-50K', '35-55K', '28-45K', '30-60K'],
		expert: ['40-70K', '50-80K', '60-100K', '45-75K', '50-90K']
	}
	const levelMap = { junior: 0, mid: 1, senior: 2, expert: 3 }
	const ranges = salaryRanges[level] || salaryRanges.mid
	return ranges[Math.floor(Math.random() * ranges.length)]
}

// 技能标签
const skillTags = {
	前端: ['Vue', 'React', 'TypeScript', 'JavaScript', 'CSS3', 'HTML5', 'Webpack', 'Node.js', '小程序', 'Electron'],
	后端: ['Java', 'Spring Boot', 'MySQL', 'Redis', '微服务', '分布式', 'Docker', 'Kubernetes', 'MongoDB', 'Kafka'],
	全栈: ['Vue', 'React', 'Node.js', 'Java', 'MySQL', 'Redis', 'TypeScript', 'Docker'],
	移动端: ['iOS', 'Android', 'Swift', 'Kotlin', 'Flutter', 'React Native', 'Objective-C', 'Java'],
	测试: ['自动化测试', 'Selenium', 'JMeter', 'Python', '接口测试', '性能测试', 'CI/CD'],
	运维: ['Linux', 'Docker', 'Kubernetes', 'Jenkins', 'AWS', '阿里云', 'Ansible', 'Prometheus'],
	数据: ['Python', 'SQL', 'Spark', 'Hadoop', 'Hive', 'Flink', 'Kafka', '数据仓库'],
	算法: ['Python', 'TensorFlow', 'PyTorch', '机器学习', '深度学习', 'NLP', 'CV', '推荐系统'],
	产品: ['Axure', '数据分析', '用户研究', 'PRD', '竞品分析', '原型设计', '敏捷开发'],
	设计: ['Figma', 'Sketch', 'PS', 'AI', '交互设计', 'UI设计', '动效设计'],
	运营: ['数据分析', '用户增长', '内容运营', '活动策划', '社群运营', 'SEO']
}

// 福利标签
const benefits = [
	'五险一金', '年终奖金', '股票期权', '带薪年假', '弹性工作',
	'免费三餐', '健身房', '定期体检', '节日福利', '加班补贴',
	'交通补贴', '通讯补贴', '住房补贴', '团建活动', '培训机会',
	'晋升空间', '扁平管理', '技术氛围好', '双休', '不加班'
]

// 职位描述模板
const jobDescriptionTemplates = [
	'负责公司核心产品的开发与维护，参与技术方案设计与评审，持续优化系统性能与用户体验。',
	'参与产品需求分析，完成功能模块的设计、开发与测试，编写高质量代码。',
	'负责系统架构设计与核心代码开发，解决技术难题，指导团队成员成长。',
	'参与项目全流程开发，与产品、设计紧密配合，按时高质量完成交付。',
	'负责业务系统开发，参与技术选型与架构设计，推动技术创新与落地。'
]

// 任职要求模板
const requirementTemplates = [
	'计算机相关专业本科及以上学历，具有良好的编程习惯和代码规范意识。',
	'熟悉主流开发框架，有实际项目经验，具备良好的问题分析与解决能力。',
	'有大型互联网公司工作经验优先，对技术有热情，善于学习新技术。',
	'具备良好的沟通能力和团队协作精神，有责任心，能承受一定工作压力。',
	'有开源项目贡献或技术博客撰写经验者优先。'
]

/**
 * 生成随机职位数据
 * @param {number} count 生成数量
 * @param {string} category 职位类别
 * @returns {Array} 职位列表
 */
export function generateJobs(count = 20, category = null) {
	const jobs = []
	const categories = Object.keys(jobTitles)

	for (let i = 0; i < count; i++) {
		// 随机选择职位类别
		const cat = category || categories[Math.floor(Math.random() * categories.length)]

		// 随机选择公司
		const company = companies[Math.floor(Math.random() * companies.length)]

		// 随机选择城市和区域
		const city = cities[Math.floor(Math.random() * cities.length)]
		const district = city.district[Math.floor(Math.random() * city.district.length)]

		// 随机选择职位标题
		const titles = jobTitles[cat] || jobTitles['前端']
		const title = titles[Math.floor(Math.random() * titles.length)]

		// 根据职位级别生成薪资
		const levelRandom = Math.random()
		const level = levelRandom < 0.3 ? 'junior' : levelRandom < 0.7 ? 'mid' : levelRandom < 0.9 ? 'senior' : 'expert'

		// 生成技能标签
		const skills = skillTags[cat] || skillTags['前端']
		const selectedSkills = shuffleArray([...skills]).slice(0, Math.floor(Math.random() * 3) + 2)

		// 生成福利标签
		const selectedBenefits = shuffleArray([...benefits]).slice(0, Math.floor(Math.random() * 5) + 3)

		// 生成匹配度（模拟算法匹配结果）
		const match = Math.floor(Math.random() * 30) + 70 // 70-99

		jobs.push({
			id: Date.now() + i,
			title: title,
			salary: generateSalary(level),
			company: company.name,
			companyInfo: {
				industry: company.industry,
				scale: company.scale,
				logo: company.logo
			},
			location: {
				city: city.name,
				district: district,
				address: `${city.name}市${district}某某科技园`
			},
			education: educations[Math.floor(Math.random() * educations.length)],
			experience: experiences[Math.floor(Math.random() * experiences.length)],
			tags: [city.name, experiences[Math.floor(Math.random() * experiences.length)], educations[Math.floor(Math.random() * educations.length)], cat],
			skills: selectedSkills,
			benefits: selectedBenefits,
			description: jobDescriptionTemplates[Math.floor(Math.random() * jobDescriptionTemplates.length)],
			requirements: requirementTemplates.slice(0, Math.floor(Math.random() * 3) + 2),
			match: match,
			publishTime: generateRandomTime(),
			hr: {
				name: ['王经理', '李HR', '张招聘', '刘HR', '陈经理'][Math.floor(Math.random() * 5)],
				position: 'HR',
				online: Math.random() > 0.3
			},
			hot: Math.random() > 0.7
		})
	}

	// 按匹配度排序
	return jobs.sort((a, b) => b.match - a.match)
}

/**
 * 数组随机排序
 */
function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]]
	}
	return array
}

/**
 * 生成随机时间（最近7天内）
 */
function generateRandomTime() {
	const now = Date.now()
	const randomDays = Math.floor(Math.random() * 7)
	const randomHours = Math.floor(Math.random() * 24)
	const randomTime = new Date(now - randomDays * 24 * 60 * 60 * 1000 - randomHours * 60 * 60 * 1000)

	if (randomDays === 0) {
		if (randomHours === 0) return '刚刚'
		if (randomHours < 24) return `${randomHours}小时前`
	}
	if (randomDays === 1) return '昨天'
	if (randomDays < 7) return `${randomDays}天前`
	return randomTime.toLocaleDateString()
}

/**
 * 搜索职位
 * @param {Object} filters 筛选条件
 * @returns {Array} 职位列表
 */
export function searchJobs(filters = {}) {
	let jobs = generateJobs(50)

	// 按关键词筛选
	if (filters.keyword) {
		const keyword = filters.keyword.toLowerCase()
		jobs = jobs.filter(job =>
			job.title.toLowerCase().includes(keyword) ||
			job.company.toLowerCase().includes(keyword) ||
			job.skills.some(skill => skill.toLowerCase().includes(keyword))
		)
	}

	// 按城市筛选
	if (filters.city) {
		jobs = jobs.filter(job => job.location.city === filters.city)
	}

	// 按薪资筛选
	if (filters.salary) {
		jobs = jobs.filter(job => {
			const salaryNum = parseInt(job.salary.match(/\d+/)?.[0] || 0)
			const [min, max] = filters.salary.split('-').map(Number)
			return salaryNum >= min && (!max || salaryNum <= max)
		})
	}

	// 按经验筛选
	if (filters.experience) {
		jobs = jobs.filter(job => job.experience.includes(filters.experience))
	}

	// 按学历筛选
	if (filters.education) {
		jobs = jobs.filter(job => job.education === filters.education)
	}

	return jobs
}

export default {
	generateJobs,
	searchJobs
}
