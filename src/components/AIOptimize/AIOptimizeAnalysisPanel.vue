<template>
	<div class="ai-analysis-panel" :class="{ visible }">
		<div class="analysis-header">
			<div class="header-title">
				<svg class="ai-icon" viewBox="0 0 16 16" fill="none">
					<path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
				</svg>
				<span>{{ activeTab === 'chat' ? 'AI 校对对话' : 'AI 匹配分析' }}</span>
			</div>
			<div class="header-tabs">
				<button
					class="tab-btn"
					:class="{ active: activeTab === 'analysis' }"
					@click="activeTab = 'analysis'"
					:disabled="!hasReport"
				>
					匹配分析
				</button>
				<button
					class="tab-btn"
					:class="{ active: activeTab === 'chat' }"
					@click="activeTab = 'chat'"
					:disabled="!chatMessages.length"
				>
					校对对话
					<span v-if="chatMessages.length" class="tab-badge">{{ chatMessages.length }}</span>
				</button>
			</div>
			<button class="close-btn" @click="$emit('close')" title="关闭">
				<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
			</button>
		</div>

		<div class="analysis-body" :class="{ 'chat-body': activeTab === 'chat' }">
			<div v-if="factCheckError" class="fact-check-warning" role="alert">
				<span class="warning-icon">⚠️</span>
				<div class="warning-text">
					<p class="warning-title">事实校验未完成（不影响主流程）</p>
					<p class="warning-desc">{{ factCheckError }}</p>
				</div>
			</div>

			<!-- Loading -->
			<div v-if="loading" class="analysis-loading">
				<div class="ai-skeleton" aria-hidden="true">
					<div class="skeleton-line" style="width: 80%"></div>
					<div class="skeleton-line" style="width: 60%"></div>
					<div class="skeleton-line" style="width: 90%"></div>
					<div class="skeleton-line" style="width: 70%"></div>
				</div>
				<p class="loading-text">{{ progressText || '正在分析简历匹配度…' }}</p>
			</div>

			<!-- Empty / Error -->
			<div v-else-if="!hasReport && activeTab === 'analysis'" class="analysis-empty">
				<div class="empty-icon">🤖</div>
				<p class="empty-title">暂无分析结果</p>
				<p class="empty-desc">点击「AI 优化」将自动解析简历并生成匹配分析。</p>
			</div>

			<!-- Chat Dialog -->
			<div
				v-if="activeTab === 'chat'"
				class="chat-messages"
				ref="chatScrollRef"
				@scroll="onChatScroll"
				role="log"
				aria-live="polite"
				aria-label="校对对话"
			>
				<div v-if="chatMessages.length === 0 && factCheckResult" class="analysis-empty">
					<div class="empty-icon">🤖</div>
					<p class="empty-title">fact_checker 已返回，但无法生成对话</p>
					<details class="raw-debug">
						<summary>查看原始返回（调试用）</summary>
						<pre>{{ JSON.stringify(factCheckResult, null, 2) }}</pre>
					</details>
				</div>
				<template v-else-if="chatMessages.length">
					<div class="chat-spacer" :style="{ height: (totalChatHeight + 32) + 'px' }" aria-hidden="true"></div>
					<div
						v-for="item in visibleMessages"
						:key="item.realIndex"
						class="msg-row virtual-row"
						:class="[item.msg.role, { streaming: streamingIndex === item.realIndex }]"
						:style="{ top: (16 + chatOffsetAt(item.realIndex)) + 'px' }"
						:ref="(el) => measureChatRow(item.realIndex, el)"
					>
						<div class="msg-avatar">{{ item.msg.role === 'bot' ? '🤖' : '👤' }}</div>
						<div class="msg-bubble">
							<div class="msg-text">{{ textOf(item.msg, item.realIndex) }}</div>
							<div v-if="item.msg.meta?.type === 'issue' && expandedIssue !== item.realIndex" class="msg-options">
								<button
									v-for="(opt, idx) in item.msg.meta.options"
									:key="idx"
									class="option-btn"
									@click="handleOption(opt, item.realIndex)"
								>
									{{ opt.label }}
								</button>
							</div>
							<div v-if="item.msg.meta?.type === 'issue' && expandedIssue === item.realIndex" class="issue-detail">
								<p><strong>风险类型：</strong>{{ issueTypeLabel(item.msg.meta.issue.issue_type) }}</p>
								<p><strong>问题模块：</strong>{{ moduleLabel(item.msg.meta.issue.module) }}</p>
								<div v-if="item.msg.meta.issue.original_text || item.msg.meta.issue.rewritten_text" class="diff-view">
									<span class="diff-label">原文 vs 改写：</span>
									<span v-html="diffHtml(item.msg.meta.issue.original_text, item.msg.meta.issue.rewritten_text)" />
								</div>
								<p><strong>修正建议：</strong>{{ item.msg.meta.issue.suggestion || '—' }}</p>
								<button class="option-btn secondary" @click="expandedIssue = null">收起</button>
							</div>
							<div v-if="item.msg.meta?.type === 'module_change' && expandedChange === item.realIndex" class="change-detail">
								<p><strong>写作原则：</strong>{{ item.msg.meta.change.writing_principle || '—' }}</p>
								<div v-if="item.msg.meta.change.before_excerpt || item.msg.meta.change.after_excerpt" class="diff-view">
									<span class="diff-label">摘录对照：</span>
									<span v-html="diffHtml(item.msg.meta.change.before_excerpt, item.msg.meta.change.after_excerpt)" />
								</div>
								<p v-if="item.msg.meta.change.keywords_added?.length"><strong>新增关键词：</strong>{{ item.msg.meta.change.keywords_added.join('、') }}</p>
								<button class="option-btn secondary" @click="expandedChange = null">收起</button>
							</div>
						</div>
					</div>
				</template>
			</div>

			<!-- Report -->
			<template v-if="activeTab === 'analysis' && hasReport">
				<!-- 匹配评分 -->
				<div class="score-card">
					<div class="score-ring" :style="scoreRingStyle">
						<span class="score-value">{{ matchScore }}</span>
						<span class="score-label">匹配度</span>
					</div>
					<div class="score-summary">
						<p class="summary-title">分析结论</p>
						<p class="summary-text">{{ executiveSummary || '已根据目标岗位对简历进行诊断，并给出模块级优化建议。' }}</p>
					</div>
				</div>

				<!-- 优势与短板 -->
				<div class="gap-section">
					<div class="gap-block" v-if="matchedStrengths.length">
						<h4 class="gap-title strength">
							<span class="dot success" />
							岗位匹配优势
						</h4>
						<ul class="gap-list">
							<li v-for="(item, idx) in matchedStrengths" :key="'s-' + idx">{{ item.name || item }}</li>
						</ul>
					</div>
					<div class="gap-block" v-if="highGaps.length">
						<h4 class="gap-title warning">
							<span class="dot danger" />
							重点优化项
						</h4>
						<ul class="gap-list">
							<li v-for="(item, idx) in highGaps" :key="'g-' + idx">
								<div class="gap-item-name">{{ item.name || item.module || '待优化模块' }}</div>
								<div class="gap-item-desc" v-if="item.description">{{ item.description }}</div>
							</li>
						</ul>
					</div>
				</div>

				<!-- 简历诊断详情 -->
				<div class="module-section" v-if="weakPoints.length">
					<h4 class="section-title">原简历诊断</h4>
					<div class="module-list">
						<div
							v-for="wp in weakPoints"
							:key="wp.module"
							class="module-card"
							:class="{ expanded: expandedModules[wp.module] }"
						>
							<button class="module-header" @click="toggleModule(wp.module)">
								<span class="module-name">{{ wp.name }}</span>
								<span class="module-badges">
									<span class="severity-badge" :class="wp.priority">{{ severityLabel(wp.priority) }}</span>
								</span>
								<svg class="arrow" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
							</button>
							<div class="module-body" v-show="expandedModules[wp.module]">
								<ul class="problem-list">
									<li v-for="(p, i) in wp.problems" :key="i">{{ p }}</li>
								</ul>
								<div class="diag-evidence" v-if="wp.evidence">
									<span class="diag-label">原文片段：</span>{{ wp.evidence }}
								</div>
								<div class="diag-suggestion" v-if="wp.suggestion">
									<span class="diag-label">改进方向：</span>{{ wp.suggestion }}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- 模块优化建议 -->
				<div class="module-section" v-if="moduleEntries.length">
					<h4 class="section-title">模块优化建议</h4>
					<div class="module-list">
						<div
							v-for="[module, item] in moduleEntries"
							:key="module"
							class="module-card"
							:class="{ expanded: expandedModules[module] }"
						>
							<button class="module-header" @click="toggleModule(module)">
								<span class="module-name">{{ moduleLabel(module) }}</span>
								<span class="module-badges">
									<span v-if="item.keywords_added?.length" class="badge">+{{ item.keywords_added.length }} 关键词</span>
								</span>
								<svg class="arrow" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
							</button>
							<div class="module-body" v-show="expandedModules[module]">
								<div class="change-summary" v-if="item.change_summary?.length">
									<p v-for="(s, i) in item.change_summary" :key="i">• {{ s }}</p>
								</div>
								<div class="keywords" v-if="item.keywords_added?.length">
									<span class="keyword-label">补充关键词：</span>
									<span v-for="(kw, i) in item.keywords_added" :key="i" class="keyword-tag">{{ kw }}</span>
								</div>
								<div class="optimized-preview" v-if="item.optimized_html" v-html="item.optimized_html" />
								<div class="module-actions">
									<button class="apply-module-btn" @click="$emit('apply-module', module)">应用该模块优化</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>

		<div class="analysis-footer" v-if="hasReport && !loading">
			<button class="footer-btn primary" @click="$emit('apply-all')" :disabled="!moduleEntries.length">一键应用全部</button>
			<button class="footer-btn" @click="$emit('regenerate')">重新分析</button>
		</div>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch, nextTick, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAIOptimizeStore } from '@/stores/aiOptimize'

const props = defineProps({
	visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'apply-all', 'apply-module', 'regenerate', 'option-action'])

const aiStore = useAIOptimizeStore()
const { diagnosisReport, moduleResults, factCheckMessages, factCheckError, loading, chainProgress, loadingAgent } = storeToRefs(aiStore)

const activeTab = ref('analysis')
const expandedIssue = ref(null)
const expandedChange = ref(null)

const progressText = computed(() => chainProgress.value || (loadingAgent.value ? `正在运行 ${loadingAgent.value}…` : ''))

const chatMessages = computed(() => factCheckMessages.value || [])

/* ── Typewriter streaming (rAF-style incremental render, ~60fps) ── */
const streamedLen = reactive({})
const streamedSig = reactive({})
const streamingIndex = ref(-1)
let typeTimerId = null

function textOf(msg, i) {
	const full = msg.text || ''
	if (msg.role !== 'bot' || !full) return full
	if (streamedSig[i] === full) return full
	return full.slice(0, streamedLen[i] || 0)
}

watch(chatMessages, (msgs) => {
	if (typeTimerId) {
		clearInterval(typeTimerId)
		typeTimerId = null
	}
	streamingIndex.value = -1

	const queue = []
	msgs.forEach((msg, i) => {
		if (msg.role !== 'bot' || !msg.text) {
			streamedSig[i] = msg.text || ''
			return
		}
		if (streamedSig[i] === msg.text) return
		queue.push({ i, len: msg.text.length })
		streamedLen[i] = 0
		streamedSig[i] = null
	})
	if (!queue.length) return

	let qi = 0
	let pos = 0
	typeTimerId = setInterval(() => {
		if (qi >= queue.length) {
			clearInterval(typeTimerId)
			typeTimerId = null
			streamingIndex.value = -1
			return
		}
		const cur = queue[qi]
		streamingIndex.value = cur.i
		pos += 2
		if (pos >= cur.len) {
			streamedLen[cur.i] = cur.len
			streamedSig[cur.i] = msgs[cur.i]?.text || ''
			qi++
			pos = 0
		} else {
			streamedLen[cur.i] = pos
		}
	}, 16)
}, { immediate: true })

onUnmounted(() => {
	if (typeTimerId) clearInterval(typeTimerId)
})

/* ── Virtualized chat list (windowed rendering) ── */
const CHAT_ROW_EST = 76
const CHAT_GAP = 14
const chatScrollRef = ref(null)
const chatScrollTop = ref(0)
const rowHeights = reactive({})

function chatRowHeight(i) {
	return rowHeights[i] || CHAT_ROW_EST
}

function chatOffsetAt(i) {
	let sum = 0
	for (let k = 0; k < i; k++) sum += chatRowHeight(k)
	return sum
}

const totalChatHeight = computed(() => {
	const n = chatMessages.value.length
	let sum = 0
	for (let k = 0; k < n; k++) sum += chatRowHeight(k)
	return sum
})

const visibleMessages = computed(() => {
	const msgs = chatMessages.value
	const n = msgs.length
	if (!n) return []
	const viewportH = chatScrollRef.value?.clientHeight || 600
	const buffer = 3
	let start = 0
	let acc = 0
	for (let k = 0; k < n; k++) {
		if (acc + chatRowHeight(k) > chatScrollTop.value - buffer * CHAT_ROW_EST) {
			start = k
			break
		}
		acc += chatRowHeight(k)
	}
	acc = 0
	let end = start
	for (let k = start; k < n; k++) {
		if (acc > viewportH + buffer * CHAT_ROW_EST) break
		acc += chatRowHeight(k)
		end = k + 1
	}
	const list = []
	for (let k = start; k < end; k++) list.push({ msg: msgs[k], realIndex: k })
	return list
})

function onChatScroll() {
	chatScrollTop.value = chatScrollRef.value?.scrollTop || 0
}

function measureChatRow(i, el) {
	if (!el) return
	const h = el.offsetHeight + CHAT_GAP
	if (Math.abs((rowHeights[i] || 0) - h) > 1) {
		rowHeights[i] = h
	}
}

watch(chatMessages, (msgs) => {
	Object.keys(rowHeights).forEach((k) => delete rowHeights[k])
	chatScrollTop.value = 0
	if (msgs.length) {
		nextTick(() => {
			const el = chatScrollRef.value
			if (el) {
				el.scrollTop = el.scrollHeight
				chatScrollTop.value = el.scrollTop
			}
		})
	}
}, { immediate: true })

/* ── Lightweight token diff (LCS) for original vs rewritten excerpts ── */
function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, (c) => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
	}[c]))
}

const diffCache = new Map()
const DIFF_CACHE_MAX = 300

function diffHtml(a, b) {
	const key = `${a ?? ''}\u0001${b ?? ''}`
	const cached = diffCache.get(key)
	if (cached !== undefined) return cached

	const A = String(a ?? '')
	const B = String(b ?? '')
	let out
	if (!A && !B) out = ''
	else if (!A) out = `<span class="diff-ins">${escapeHtml(B)}</span>`
	else if (!B) out = `<span class="diff-del">${escapeHtml(A)}</span>`
	else {

	const ta = A.split(/(\s+)/).filter(t => t !== '')
	const tb = B.split(/(\s+)/).filter(t => t !== '')
	const n = ta.length
	const m = tb.length
	const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			dp[i][j] = ta[i] === tb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
		}
	}

	let i = 0
	let j = 0
	out = ''
	let delBuf = []
	let insBuf = []
	const flushDel = () => {
		if (delBuf.length) { out += `<span class="diff-del">${escapeHtml(delBuf.join(''))}</span>`; delBuf = [] }
	}
	const flushIns = () => {
		if (insBuf.length) { out += `<span class="diff-ins">${escapeHtml(insBuf.join(''))}</span>`; insBuf = [] }
	}
	while (i < n && j < m) {
		if (ta[i] === tb[j]) {
			flushDel()
			flushIns()
			out += escapeHtml(ta[i])
			i++
			j++
		} else if (dp[i + 1][j] >= dp[i][j + 1]) {
			delBuf.push(ta[i])
			i++
		} else {
			insBuf.push(tb[j])
			j++
		}
	}
	while (i < n) { delBuf.push(ta[i]); i++ }
	while (j < m) { insBuf.push(tb[j]); j++ }
	flushDel()
	flushIns()
	}
	if (diffCache.size > DIFF_CACHE_MAX) diffCache.clear()
	diffCache.set(key, out)
	return out
}

const hasReport = computed(() => !!diagnosisReport.value)

const matchScore = computed(() => {
	const score = diagnosisReport.value?.match_score
	return typeof score === 'number' ? score : 75
})

const executiveSummary = computed(() => diagnosisReport.value?.executive_summary || '')

const matchedStrengths = computed(() => diagnosisReport.value?.matched || [])

const highGaps = computed(() => diagnosisReport.value?.gaps || [])

const weakPoints = computed(() => diagnosisReport.value?.weak_points || [])

const moduleEntries = computed(() => Object.entries(moduleResults.value || {}))

const scoreRingStyle = computed(() => {
	const p = Math.min(100, Math.max(0, matchScore.value))
	const color = p >= 80 ? '#22c55e' : p >= 60 ? '#f59e0b' : '#ef4444'
	return {
		background: `conic-gradient(${color} ${p * 3.6}deg, #e5e7eb 0deg)`,
		'--ring-color': color,
	}
})

const expandedModules = reactive({})

watch(() => moduleEntries.value.length, (len) => {
	for (const [key] of moduleEntries.value) {
		if (!(key in expandedModules)) {
			expandedModules[key] = false
		}
	}
}, { immediate: true })

watch(weakPoints, (list) => {
	for (const wp of list) {
		if (!(wp.module in expandedModules)) {
			expandedModules[wp.module] = false
		}
	}
}, { immediate: true })

function toggleModule(module) {
	expandedModules[module] = !expandedModules[module]
}

const severityLabelMap = {
	high: '高风险',
	medium: '中风险',
	low: '低风险',
}

function severityLabel(p) {
	return severityLabelMap[p] || p || ''
}

const moduleLabelMap = {
	basic: '基本信息',
	education: '教育背景',
	experience: '工作经历',
	projects: '项目经历',
	skills: '专业技能',
	summary: '自我评价',
	certifications: '证书资质',
}

function moduleLabel(key) {
	return moduleLabelMap[key] || key
}

const issueTypeLabelMap = {
	hallucination: '幻觉/无中生有',
	exaggeration: '夸大表述',
	inconsistency: '前后不一致',
	date_error: '时间错误',
	missing_context: '缺少上下文',
}

function issueTypeLabel(type) {
	return issueTypeLabelMap[type] || type || '其他'
}

function handleOption(option, msgIndex) {
	if (option.value === 'diff') {
		expandedIssue.value = msgIndex
		return
	}
	if (option.value === 'diff_module') {
		expandedChange.value = msgIndex
		return
	}
	if (option.value === 'apply_module') {
		emit('apply-module', option.module)
		return
	}
	if (option.value === 'accept') {
		uni.showToast({ title: '已记录，应用时会参考', icon: 'none' })
		emit('option-action', option)
		return
	}
	if (option.value === 'ignore') {
		uni.showToast({ title: '已忽略该提示', icon: 'none' })
		emit('option-action', option)
		return
	}
	emit('option-action', option)
}

watch(() => props.visible, (val) => {
	console.log('[AIOptimizeAnalysisPanel] visible changed:', val, 'chatMessages:', chatMessages.value.length)
	if (val && chatMessages.value.length > 0) {
		activeTab.value = 'chat'
	} else if (val) {
		activeTab.value = 'analysis'
	}
}, { immediate: true })

watch(chatMessages, (msgs) => {
	console.log('[AIOptimizeAnalysisPanel] chatMessages changed:', msgs.length)
	if (msgs.length > 0 && activeTab.value === 'analysis') {
		activeTab.value = 'chat'
	}
}, { immediate: true })
</script>

<style scoped>
.ai-analysis-panel {
	position: fixed;
	top: 56px;
	right: 0;
	bottom: 0;
	width: 320px;
	max-width: 92vw;
	background: #ffffff;
	border-left: 1px solid #e5e7eb;
	box-shadow: -8px 0 24px rgba(0, 0, 0, 0.06);
	transform: translateX(100%);
	transition: transform 0.3s ease;
	z-index: 110;
	display: flex;
	flex-direction: column;
}

.ai-analysis-panel.visible {
	transform: translateX(0);
}

.analysis-header {
	height: 52px;
	padding: 0 16px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid #f3f4f6;
	flex-shrink: 0;
}

.header-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 15px;
	font-weight: 600;
	color: #111827;
}

.ai-icon {
	width: 18px;
	height: 18px;
	color: #4f46e5;
}

.close-btn {
	width: 28px;
	height: 28px;
	border: none;
	background: transparent;
	cursor: pointer;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #6b7280;
	transition: background 0.15s, color 0.15s;
}

.close-btn:hover {
	background: #f3f4f6;
	color: #111827;
}

.close-btn svg {
	width: 16px;
	height: 16px;
}

.analysis-body {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
}

.fact-check-warning {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 10px 12px;
	margin-bottom: 12px;
	border: 1px solid #fbbf24;
	border-radius: 8px;
	background: #fffbeb;
}

.fact-check-warning .warning-icon {
	font-size: 16px;
	line-height: 1.4;
}

.fact-check-warning .warning-text {
	flex: 1;
}

.fact-check-warning .warning-title {
	font-size: 13px;
	font-weight: 600;
	color: #92400e;
}

.fact-check-warning .warning-desc {
	margin-top: 2px;
	font-size: 12px;
	color: #b45309;
	word-break: break-all;
}

.analysis-loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 0;
	color: #6b7280;
}

.spinner {
	width: 32px;
	height: 32px;
	border: 3px solid #e5e7eb;
	border-top-color: #4f46e5;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	margin-top: 14px;
	font-size: 14px;
}

/* ── AI skeleton screen ── */
.ai-skeleton {
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
	max-width: 280px;
}

.skeleton-line {
	height: 16px;
	border-radius: 4px;
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
	background-size: 200% 100%;
	animation: skeletonShimmer 1.5s infinite;
	will-change: background-position;
}

@keyframes skeletonShimmer {
	0% { background-position: 200% 0; }
	100% { background-position: -200% 0; }
}

.analysis-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 0;
	color: #6b7280;
	text-align: center;
}

.empty-icon {
	font-size: 40px;
	margin-bottom: 12px;
}

.empty-title {
	font-size: 15px;
	font-weight: 600;
	color: #374151;
	margin-bottom: 6px;
}

.empty-desc {
	font-size: 13px;
	line-height: 1.6;
	max-width: 260px;
}

.score-card {
	display: flex;
	gap: 16px;
	align-items: center;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 12px;
	padding: 16px;
	margin-bottom: 16px;
}

.score-ring {
	width: 78px;
	height: 78px;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	flex-shrink: 0;
}

.score-ring::before {
	content: '';
	position: absolute;
	inset: 6px;
	border-radius: 50%;
	background: #ffffff;
}

.score-value {
	position: relative;
	font-size: 22px;
	font-weight: 700;
	color: var(--ring-color, #4f46e5);
	line-height: 1;
}

.score-label {
	position: relative;
	font-size: 11px;
	color: #6b7280;
	margin-top: 2px;
}

.score-summary {
	flex: 1;
	min-width: 0;
}

.summary-title {
	font-size: 13px;
	font-weight: 600;
	color: #111827;
	margin-bottom: 6px;
}

.summary-text {
	font-size: 13px;
	line-height: 1.6;
	color: #4b5563;
}

.gap-section {
	margin-bottom: 16px;
}

.gap-block + .gap-block {
	margin-top: 14px;
}

.gap-title {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 13px;
	font-weight: 600;
	margin-bottom: 8px;
	color: #111827;
}

.gap-title .dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
}

.gap-title.strength .dot.success { background: #22c55e; }
.gap-title.warning .dot.danger { background: #ef4444; }

.gap-list {
	list-style: none;
	padding: 0;
	margin: 0;
	font-size: 13px;
	line-height: 1.7;
	color: #374151;
}

.gap-list li {
	padding: 5px 10px;
	background: #f9fafb;
	border-radius: 6px;
	margin-bottom: 6px;
}

.gap-item-name {
	font-weight: 500;
}

.gap-item-desc {
	color: #6b7280;
	font-size: 12px;
	margin-top: 2px;
}

.section-title {
	font-size: 14px;
	font-weight: 600;
	color: #111827;
	margin-bottom: 10px;
}

.module-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.module-card {
	border: 1px solid #e5e7eb;
	border-radius: 10px;
	overflow: hidden;
	background: #ffffff;
}

.module-card.expanded {
	border-color: #c7d2fe;
}

.module-header {
	width: 100%;
	padding: 12px;
	display: flex;
	align-items: center;
	gap: 8px;
	border: none;
	background: #fafafa;
	cursor: pointer;
	font-size: 13px;
	font-weight: 500;
	color: #111827;
	text-align: left;
}

.module-name {
	flex: 1;
	min-width: 0;
}

.module-badges {
	flex-shrink: 0;
}

.badge {
	font-size: 11px;
	padding: 2px 6px;
	border-radius: 4px;
	background: #e0e7ff;
	color: #4338ca;
}

.severity-badge {
	font-size: 11px;
	padding: 2px 6px;
	border-radius: 4px;
	font-weight: 500;
}

.severity-badge.high {
	background: #fee2e2;
	color: #dc2626;
}

.severity-badge.medium {
	background: #fef3c7;
	color: #d97706;
}

.severity-badge.low {
	background: #e0e7ff;
	color: #4338ca;
}

.problem-list {
	list-style: none;
	padding: 0;
	margin: 0 0 10px;
}

.problem-list li {
	font-size: 13px;
	line-height: 1.6;
	color: #374151;
	padding-left: 14px;
	position: relative;
	margin: 4px 0;
}

.problem-list li::before {
	content: '';
	position: absolute;
	left: 0;
	top: 9px;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #ef4444;
}

.diag-evidence,
.diag-suggestion {
	font-size: 12px;
	line-height: 1.6;
	color: #4b5563;
	background: #f9fafb;
	border-radius: 6px;
	padding: 8px 10px;
	margin-bottom: 8px;
}

.diag-label {
	font-weight: 600;
	color: #111827;
}

.arrow {
	width: 14px;
	height: 14px;
	color: #9ca3af;
	transition: transform 0.2s;
	flex-shrink: 0;
}

.module-card.expanded .arrow {
	transform: rotate(180deg);
}

.module-card.expanded .module-body {
	animation: moduleExpand 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes moduleExpand {
	from { opacity: 0; transform: translateY(-4px); }
	to { opacity: 1; transform: translateY(0); }
}

.module-body {
	padding: 12px;
	border-top: 1px solid #f3f4f6;
}

.change-summary {
	font-size: 13px;
	line-height: 1.6;
	color: #374151;
	margin-bottom: 10px;
}

.change-summary p {
	margin: 4px 0;
}

.keywords {
	margin-bottom: 10px;
}

.keyword-label {
	font-size: 12px;
	color: #6b7280;
}

.keyword-tag {
	display: inline-block;
	font-size: 11px;
	padding: 2px 6px;
	margin: 3px 3px 0 0;
	border-radius: 4px;
	background: #ecfdf5;
	color: #059669;
}

.optimized-preview {
	font-size: 12px;
	line-height: 1.6;
	color: #4b5563;
	background: #f9fafb;
	border-radius: 6px;
	padding: 10px;
	margin-bottom: 10px;
}

.optimized-preview :deep(p) {
	margin: 0 0 6px;
}

.module-actions {
	display: flex;
	justify-content: flex-end;
}

.apply-module-btn {
	font-size: 12px;
	padding: 5px 10px;
	border-radius: 6px;
	border: 1px solid #4f46e5;
	background: #ffffff;
	color: #4f46e5;
	cursor: pointer;
	transition: background 0.15s, color 0.15s;
}

.apply-module-btn:hover {
	background: #4f46e5;
	color: #ffffff;
}

.analysis-footer {
	padding: 12px 16px;
	border-top: 1px solid #f3f4f6;
	display: flex;
	gap: 10px;
	flex-shrink: 0;
}

.footer-btn {
	flex: 1;
	height: 36px;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	background: #ffffff;
	color: #374151;
	font-size: 13px;
	cursor: pointer;
	transition: all 0.15s;
}

.footer-btn:hover {
	background: #f9fafb;
}

.footer-btn.primary {
	background: #4f46e5;
	border-color: #4f46e5;
	color: #ffffff;
}

.footer-btn.primary:hover:not(:disabled) {
	background: #4338ca;
}

.footer-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.header-tabs {
	display: flex;
	gap: 6px;
	align-items: center;
}

.tab-btn {
	font-size: 12px;
	padding: 5px 10px;
	border-radius: 6px;
	border: 1px solid #e5e7eb;
	background: #ffffff;
	color: #6b7280;
	cursor: pointer;
	transition: all 0.15s;
}

.tab-btn:hover:not(:disabled) {
	border-color: #c7d2fe;
	color: #4f46e5;
}

.tab-btn.active {
	background: #4f46e5;
	border-color: #4f46e5;
	color: #ffffff;
}

.tab-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.tab-badge {
	font-size: 10px;
	margin-left: 4px;
	padding: 1px 5px;
	border-radius: 8px;
	background: #ef4444;
	color: #fff;
}

.chat-body {
	padding: 0;
	background: #f8fafc;
}

.chat-messages {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	position: relative;
	display: block;
	overscroll-behavior: contain;
	scroll-behavior: smooth;
}

.chat-spacer {
	width: 1px;
}

.virtual-row {
	position: absolute;
	left: 16px;
	right: 16px;
}

.msg-row {
	display: flex;
	gap: 8px;
	max-width: 92%;
}

.msg-row.bot {
	align-self: flex-start;
}

.msg-row.user {
	align-self: flex-end;
	flex-direction: row-reverse;
}

.msg-avatar {
	flex-shrink: 0;
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.msg-bubble {
	padding: 10px 14px;
	border-radius: 12px;
	font-size: 13px;
	line-height: 1.6;
	color: #374151;
	white-space: pre-wrap;
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-top-left-radius: 4px;
	box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.msg-row.user .msg-bubble {
	background: #4f46e5;
	color: #ffffff;
	border-top-left-radius: 12px;
	border-top-right-radius: 4px;
}

.msg-bubble.streaming::after {
	content: '▍';
	margin-left: 1px;
	color: var(--color-accent-primary, #6366f1);
	animation: blink 1s steps(1) infinite;
}

@keyframes blink {
	50% { opacity: 0; }
}

.msg-options {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 10px;
}

.option-btn {
	font-size: 12px;
	padding: 5px 10px;
	border-radius: 6px;
	border: 1px solid #4f46e5;
	background: #ffffff;
	color: #4f46e5;
	cursor: pointer;
	transition: all 0.15s;
}

.option-btn:hover {
	background: #4f46e5;
	color: #ffffff;
}

.option-btn.secondary {
	border-color: #d1d5db;
	color: #6b7280;
}

.option-btn.secondary:hover {
	background: #f3f4f6;
	color: #374151;
}

.issue-detail,
.change-detail {
	margin-top: 10px;
	padding: 10px;
	background: #f9fafb;
	border-radius: 8px;
	font-size: 12px;
	line-height: 1.7;
	color: #4b5563;
}

.diff-view {
	margin: 6px 0;
	padding: 8px 10px;
	background: #ffffff;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	line-height: 1.7;
	word-break: break-word;
}

.diff-label {
	font-weight: 600;
	color: #111827;
}

.diff-del {
	background: #fecaca;
	color: #991b1b;
	text-decoration: line-through;
	border-radius: 2px;
	padding: 0 1px;
	animation: diffFade 200ms ease;
}

.diff-ins {
	background: #d1fae5;
	color: #065f46;
	border-radius: 2px;
	padding: 0 1px;
	animation: diffSlideIn 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes diffFade {
	from { opacity: 0; }
	to { opacity: 1; }
}

@keyframes diffSlideIn {
	from { opacity: 0; transform: translateX(-2px); }
	to { opacity: 1; transform: translateX(0); }
}

.issue-detail p,
.change-detail p {
	margin: 4px 0;
}

@media (max-width: 960px) {
	.ai-analysis-panel {
		width: 100%;
		max-width: 100%;
		top: 0;
		z-index: 10002;
	}
}
</style>
