/**
 * 简历序列化测试（Node 18+，无依赖）
 * 直接跑：node tests/test_resume_serializer.mjs
 *
 * 验证内容：
 *   1. 上传 payload 不包含任何模板字段（templateId / globalSettings / menuSections / layout / photoConfig 等）
 *   2. 日期合并字符串能正确拆成 startDate / endDate / current
 *   3. 自定义模块（含证书）能按 sectionId 归类
 *   4. fromBackendPayload(toBackendPayload(x)) 能 round-trip
 *   5. 打印一份完整的 payload 给后端做接口对齐
 */

import { toBackendPayload, fromBackendPayload } from '../src/utils/resume/serializer.js'

// ─────────────────────────────────────────────────────────────
// 一份"很接近真实编辑状态"的 mock 简历
// ─────────────────────────────────────────────────────────────
const sampleResume = {
	id: 'r_demo',
	title: '前端开发工程师-张三',
	createdAt: '2026-01-01T08:00:00.000Z',
	updatedAt: '2026-05-12T10:00:00.000Z',
	templateId: 'classic',                            // ← 应被剥掉
	globalSettings: {                                  // ← 应被剥掉
		themeColor: '#2563eb',
		fontFamily: 'Microsoft YaHei',
		baseFontSize: 14,
		sectionSpacing: 20,
	},
	menuSections: [                                    // ← 应被剥掉（仅用于 customModules title 查找）
		{ id: 'basic',          title: '基本信息', enabled: true, order: 0, icon: '👤' },
		{ id: 'experience',     title: '工作经历', enabled: true, order: 1, icon: '💼' },
		{ id: 'projects',       title: '项目经历', enabled: true, order: 2, icon: '🚀' },
		{ id: 'education',      title: '教育背景', enabled: true, order: 3, icon: '🎓' },
		{ id: 'skills',         title: '专业技能', enabled: true, order: 4, icon: '⚡' },
		{ id: 'certificates',   title: '荣誉证书', enabled: true, order: 5, icon: '🏆' },
		{ id: 'custom_lang',    title: '语言能力', enabled: true, order: 6, icon: '🌐' },
	],
	activeSection: 'experience',                       // ← 应被剥掉
	basic: {
		name: '张三',
		title: '前端工程师',
		email: 'zhang@example.com',
		phone: '13800138000',
		location: '广州市天河区',
		birthDate: '1998-06',
		employementStatus: '离职',
		photo: 'data:image/png;base64,iVBORw0K...',     // ← 应保留（内容）
		layout: 'left',                                  // ← 应被剥掉
		photoConfig: { width: 90, height: 110, visible: true, borderRadius: 'medium' },  // ← 应被剥掉
		fieldOrder: [{ key: 'name', visible: true }],   // ← 应被剥掉
		icons: { email: '📧', phone: '📱' },             // ← 应被剥掉
		customFields: [
			{ id: 'cf1', label: 'GitHub', value: 'github.com/zhangsan', icon: '🐙', visible: true },
			{ id: 'cf2', label: '', value: '', icon: '🔗', visible: true },   // ← 完全空白，应被丢弃
		],
	},
	experience: [
		{
			id: 'exp1',
			company: '某互联网公司',
			position: '高级前端工程师',
			date: '2021-07 - 2026-12',                   // ← 合并字符串，应拆成 startDate/endDate/current=false
			details: '<ul><li>负责前端架构</li><li>提升研发效率 30%</li></ul>',
			visible: true,
		},
		{
			id: 'exp2',
			company: '当前公司',
			position: '前端 Lead',
			date: '2027-01 - 至今',                      // ← current=true
			details: '<p>负责 XX 团队管理</p>',
			visible: true,
		},
	],
	projects: [
		{
			id: 'p1',
			name: 'CryptoPro 跨交易所操作平台',
			role: '技术负责人',
			date: '2025-09 - 2025-12',
			link: 'https://crypto.pro',
			description: '<ul><li>Vue3 + SpringBoot</li></ul>',
			visible: true,
		},
	],
	education: [
		{
			id: 'edu1',
			school: '广东理工大学',
			major: '计算机科学与技术',
			degree: '本科',
			startDate: '2022-09',
			endDate: '2026-06',
			isCurrent: false,
			description: '主修：数据结构、算法、操作系统',
			visible: true,
		},
	],
	skillContent: '<ul><li>JavaScript / TypeScript</li><li>Vue3 / React</li></ul>',
	selfEvaluationContent: '<p>5 年前端开发经验，注重工程质量。</p>',
	customData: {
		certificates: [
			{ id: 'c1', title: 'CET-6', issuer: '教育部', date: '2023-12', description: '566 分', visible: true },
		],
		custom_lang: [
			{ id: 'l1', title: '英语', subtitle: 'CET-6', dateRange: '', description: '可读写技术文档', visible: true },
		],
	},
}

// ─────────────────────────────────────────────────────────────
// Tiny assert helpers (no deps)
// ─────────────────────────────────────────────────────────────
let pass = 0, fail = 0
function ok(label, cond, extra = '') {
	if (cond) { pass++; console.log(`  ✓ ${label}`) }
	else      { fail++; console.log(`  ✗ ${label}${extra ? '\n      ' + extra : ''}`) }
}
function eq(label, a, b) { ok(label, a === b, `expected: ${JSON.stringify(b)}\n      actual:   ${JSON.stringify(a)}`) }

// ─────────────────────────────────────────────────────────────
// Test 1: 剥模板字段
// ─────────────────────────────────────────────────────────────
console.log('\n[1] 上传 payload 不包含任何模板字段')
const payload = toBackendPayload(sampleResume)

const forbiddenTopKeys = ['templateId', 'globalSettings', 'menuSections', 'activeSection']
for (const k of forbiddenTopKeys) {
	ok(`payload.${k} 已剥除`, !(k in payload))
}

const forbiddenBasicKeys = ['layout', 'photoConfig', 'fieldOrder', 'icons']
for (const k of forbiddenBasicKeys) {
	ok(`payload.basic.${k} 已剥除`, !(k in payload.basic))
}

eq('photo 保留',            payload.basic.photo.startsWith('data:image'), true)
eq('customFields 长度=1（空白项被丢弃）', payload.basic.customFields.length, 1)
eq('customFields[0].label', payload.basic.customFields[0].label, 'GitHub')

// ─────────────────────────────────────────────────────────────
// Test 2: 日期拆分
// ─────────────────────────────────────────────────────────────
console.log('\n[2] 工作经历日期能正确拆成三段式')
const exp1 = payload.experience[0]
eq('exp1.startDate', exp1.startDate, '2021-07')
eq('exp1.endDate',   exp1.endDate,   '2026-12')
eq('exp1.current',   exp1.current,   false)

const exp2 = payload.experience[1]
eq('exp2.startDate', exp2.startDate, '2027-01')
eq('exp2.endDate',   exp2.endDate,   '')
eq('exp2.current',   exp2.current,   true)

// ─────────────────────────────────────────────────────────────
// Test 3: 教育已是分开字段，原样保留
// ─────────────────────────────────────────────────────────────
console.log('\n[3] 教育经历字段映射')
const edu = payload.education[0]
eq('edu.startDate', edu.startDate, '2022-09')
eq('edu.endDate',   edu.endDate,   '2026-06')
eq('edu.current',   edu.current,   false)

// ─────────────────────────────────────────────────────────────
// Test 4: 自定义模块按 id 归类，并带上 title
// ─────────────────────────────────────────────────────────────
console.log('\n[4] 自定义模块结构')
ok('certificates 在 customModules 里', 'certificates' in payload.customModules)
ok('custom_lang 在 customModules 里',  'custom_lang' in payload.customModules)
eq('certificates.title', payload.customModules.certificates.title, '荣誉证书')
eq('custom_lang.title',  payload.customModules.custom_lang.title,  '语言能力')
eq('certificates.items[0].title', payload.customModules.certificates.items[0].title, 'CET-6')

// ─────────────────────────────────────────────────────────────
// Test 5: 反序列化 round-trip
// ─────────────────────────────────────────────────────────────
console.log('\n[5] 反序列化能还原内容（模板字段使用默认）')
const restored = fromBackendPayload(payload)
eq('恢复后名字', restored.basic.name, '张三')
eq('恢复后第二段经历日期是 "至今"', restored.experience[1].date, '2027-01 - 至今')
eq('恢复后教育 isCurrent', restored.education[0].isCurrent, false)
ok('补回 templateId 默认值', restored.templateId === 'classic')
ok('补回 globalSettings 空对象', typeof restored.globalSettings === 'object')

// ─────────────────────────────────────────────────────────────
// 打印最终 payload（给后端写 DTO 用）
// ─────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(70))
console.log('  实际发送给后端的 JSON Payload  (POST /api/resume/save)')
console.log('═'.repeat(70))
console.log(JSON.stringify(payload, null, 2))
console.log('═'.repeat(70))

console.log(`\n结果: ${pass} 通过 / ${fail} 失败`)
process.exit(fail > 0 ? 1 : 0)
