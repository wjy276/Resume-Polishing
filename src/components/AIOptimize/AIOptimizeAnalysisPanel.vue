<template>
	<div class="ai-analysis-panel" :class="{ visible }">
		<!-- ═══ Header: segmented tabs ═══ -->
		<div class="analysis-header">
			<TabNav
				:active-tab="activeTab"
				:chat-unread="chatUnread"
				:analysis-disabled="!hasReport"
				:chat-disabled="!chatMessages.length"
				@change="activeTab = $event"
			/>
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
			<AnalyzingState v-if="loading || chainRunning" :text="progressText" />

			<!-- Empty -->
			<EmptyState
				v-else-if="!hasReport && activeTab === 'analysis'"
				@reanalyze="$emit('regenerate')"
			/>

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
					<div class="empty-icon">🔍</div>
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
						<div class="msg-avatar">{{ item.msg.role === 'bot' ? '🤖' : '🙋' }}</div>
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
								<p><strong>修改建议：</strong>{{ item.msg.meta.issue.suggestion || '—' }}</p>
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
			<template v-else-if="activeTab === 'analysis' && hasReport">
				<ScoreOverview :score="matchScore" :summary="executiveSummary" :dimensions="dimensions" />

				<!-- 问题分布 -->
				<div v-if="highGaps.length" class="gap-section">
					<h4 class="section-title">重点优化项</h4>
					<div class="gap-list">
						<div v-for="(item, idx) in highGaps" :key="'g-' + idx" class="gap-item">
							<div class="gap-item-head">
								<span class="gap-item-name">{{ item.name || item.module || '待优化模块' }}</span>
								<span class="severity-badge" :class="item.priority || 'medium'">{{ severityLabel(item.priority) }}</span>
							</div>
							<div v-if="item.description" class="gap-item-desc">{{ item.description }}</div>
						</div>
					</div>
				</div>

				<!-- 模块优化建议 -->
				<div v-if="moduleEntries.length" class="module-section">
					<h4 class="section-title">模块优化建议</h4>
					<div class="module-list">
						<ModuleSuggestionCard
							v-for="[module, item] in moduleEntries"
							:key="module"
							:module-label="moduleLabel(module)"
							:icon="moduleIcon(module)"
							:items="itemsFor(module)"
							:expanded="!!expandedModules[module]"
							@toggle="toggleModule(module)"
							@toggle-select="toggleSuggestion($event)"
							@apply-item="applySuggestion(module, $event)"
							@ignore-item="ignoreSuggestion(module, $event)"
							@restore-item="restoreSuggestion($event)"
						/>
					</div>
				</div>
			</template>
		</div>

		<!-- ═══ 底部悬浮操作栏 ═══ -->
		<BottomActionBar
			v-if="hasReport && activeTab === 'analysis' && !loading && !chainRunning"
			:total="pendingTotal"
			:selected-count="selectedCount"
			:all-selected="allSelected"
			:is-applying="applyingBatch"
			@select-all="toggleSelectAll"
			@apply-selected="applySelected"
			@reanalyze="$emit('regenerate')"
		/>
	</div>
</template>

<script setup>
import { computed, reactive, ref, watch, nextTick, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAIOptimizeStore } from '@/stores/aiOptimize'
import TabNav from './optimization/TabNav.vue'
import ScoreOverview from './optimization/ScoreOverview.vue'
import ModuleSuggestionCard from './optimization/ModuleSuggestionCard.vue'
import BottomActionBar from './optimization/BottomActionBar.vue'
import AnalyzingState from './optimization/AnalyzingState.vue'
import EmptyState from './optimization/EmptyState.vue'

const props = defineProps({
	visible: { type: Boolean, default: false },
	applyModule: { type: Function, default: null },
	applyModules: { type: Function, default: null },
})

const emit = defineEmits(['close', 'apply-all', 'apply-module', 'regenerate', 'option-action'])

const aiStore = useAIOptimizeStore()
const { diagnosisReport, moduleResults, factCheckMessages, factCheckResult, factCheckError, loading, chainProgress, chainRunning } = storeToRefs(aiStore)

const activeTab = ref('analysis')
const expandedIssue = ref(null)
const expandedChange = ref(null)

const progressText = computed(() => chainProgress.value || 'AI 正在分析您的简历，请稍候...')

const chatMessages = computed(() => factCheckMessages.value || [])
const chatUnread = computed(() => chatMessages.value.length)

/* ═══ Typewriter streaming ═══ */
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

/* ═══ Virtualized chat list ═══ */
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

/* ═══ Lightweight token diff (LCS) ═══ */
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

/* ═══ Report data ═══ */
const hasReport = computed(() => !!diagnosisReport.value)

const matchScore = computed(() => {
	const score = diagnosisReport.value?.match_score
	return typeof score === 'number' ? score : 75
})

const executiveSummary = computed(() => diagnosisReport.value?.executive_summary || '')

const highGaps = computed(() => diagnosisReport.value?.gaps || [])

const weakPoints = computed(() => diagnosisReport.value?.weak_points || [])

const dimensions = computed(() => {
	const report = diagnosisReport.value
	if (report?.dimensions && Array.isArray(report.dimensions) && report.dimensions.length >= 3) {
		return report.dimensions.map((d) => ({ label: d.label || d.name, score: Number(d.score) || 0 }))
	}
	// 后端暂未提供维度分时，基于诊断模块做估算
	const wp = weakPoints.value
	const countFor = (mods) => {
		const hit = wp.filter((w) => mods.includes(w.module))
		return { count: hit.length, high: hit.filter((w) => w.priority === 'high').length }
	}
	const toScore = ({ count, high }) => Math.max(40, Math.min(100, 100 - count * 10 - high * 8))
	const kw = countFor(['skills', 'summary', 'basic', 'certifications'])
	const exp = countFor(['experience', 'projects'])
	const fmt = countFor(['education', 'basic'])
	return [
		{ label: '关键词匹配', score: toScore(kw) },
		{ label: '经历相关度', score: toScore(exp) },
		{ label: '格式完整度', score: toScore(fmt) },
	]
})

const moduleEntries = computed(() => Object.entries(moduleResults.value || {}))

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

const moduleIconMap = {
	basic: '👤',
	education: '🎓',
	experience: '💼',
	projects: '🚀',
	skills: '🛠️',
	summary: '📝',
	certifications: '📜',
	custom: '🧩',
}

function moduleIcon(key) {
	return moduleIconMap[key] || moduleIconMap.custom
}

const severityLabelMap = {
	high: '高风险',
	medium: '中风险',
	low: '低风险',
}

function severityLabel(p) {
	return severityLabelMap[p] || p || ''
}

/* ═══ Suggestion state machine ═══ */
const suggestionsCache = reactive({})
const itemStatus = reactive({})
const selectedIds = reactive({})
const expandedModules = reactive({})
const applyingBatch = ref(false)

function plainText(html) {
	return String(html || '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function buildSuggestions(moduleKey, item) {
	if (!item) return []
	const out = []
	const summaries = Array.isArray(item.change_summary) ? item.change_summary : []
	summaries.forEach((s, i) => {
		out.push({
			id: `${moduleKey}-mod-${i}`,
			module: moduleKey,
			type: 'modify',
			summary: s,
			detail: s,
			originalText: plainText(item.original),
			suggestedText: plainText(item.optimized_html),
		})
	})
	if (!out.length && (item.original || item.optimized_html)) {
		out.push({
			id: `${moduleKey}-mod-0`,
			module: moduleKey,
			type: 'modify',
			summary: '优化模块内容表达',
			detail: '根据目标岗位要求改写内容，突出量化成果与关键词。',
			originalText: plainText(item.original),
			suggestedText: plainText(item.optimized_html),
		})
	}
	return out
}

function itemsFor(moduleKey) {
	if (!suggestionsCache[moduleKey]) {
		suggestionsCache[moduleKey] = buildSuggestions(moduleKey, moduleResults.value[moduleKey])
	}
	return suggestionsCache[moduleKey].map((s) => ({
		...s,
		selected: !!selectedIds[s.id],
		status: itemStatus[s.id] || 'pending',
	}))
}

const allItems = computed(() =>
	moduleEntries.value.flatMap(([moduleKey]) => itemsFor(moduleKey))
)

const pendingTotal = computed(() =>
	allItems.value.filter((i) => (itemStatus[i.id] || 'pending') === 'pending').length
)

const selectedCount = computed(() => Object.keys(selectedIds).length)

const allSelected = computed(() => pendingTotal.value > 0 && selectedCount.value === pendingTotal.value)

function selectAllPending() {
	for (const [moduleKey] of moduleEntries.value) {
		for (const item of itemsFor(moduleKey)) {
			if ((itemStatus[item.id] || 'pending') === 'pending') {
				selectedIds[item.id] = true
			}
		}
	}
}

function toggleSuggestion(id) {
	if ((itemStatus[id] || 'pending') !== 'pending') return
	if (selectedIds[id]) delete selectedIds[id]
	else selectedIds[id] = true
}

async function applySuggestion(module, id) {
	const ok = props.applyModule ? await props.applyModule(module) : true
	if (ok === false) return
	itemStatus[id] = 'applied'
	delete selectedIds[id]
}

function ignoreSuggestion(module, id) {
	itemStatus[id] = 'ignored'
	delete selectedIds[id]
}

function restoreSuggestion(id) {
	itemStatus[id] = 'pending'
}

function toggleSelectAll() {
	if (allSelected.value) {
		Object.keys(selectedIds).forEach((id) => delete selectedIds[id])
		return
	}
	selectAllPending()
}

async function applySelected() {
	const ids = Object.keys(selectedIds)
	if (!ids.length) return
	const idToModule = {}
	allItems.value.forEach((i) => { idToModule[i.id] = i.module })
	const modules = [...new Set(ids.map((id) => idToModule[id]).filter(Boolean))]
	if (!modules.length) return
	applyingBatch.value = true
	try {
		const ok = props.applyModules ? await props.applyModules(modules) : true
		if (ok === false) return
		ids.forEach((id) => {
			itemStatus[id] = 'applied'
			delete selectedIds[id]
		})
	} finally {
		applyingBatch.value = false
	}
}

function toggleModule(module) {
	expandedModules[module] = !expandedModules[module]
}

watch(() => moduleResults.value, () => {
	Object.keys(suggestionsCache).forEach((k) => delete suggestionsCache[k])
	Object.keys(itemStatus).forEach((k) => delete itemStatus[k])
	Object.keys(selectedIds).forEach((k) => delete selectedIds[k])
	Object.keys(expandedModules).forEach((k) => delete expandedModules[k])
	for (const [key] of moduleEntries.value) {
		expandedModules[key] = false
	}
	selectAllPending()
}, { deep: true, immediate: true })

/* ═══ Chat meta helpers ═══ */
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

/* ═══ Tab auto-switch ═══ */
watch(() => props.visible, (val) => {
	if (val && chatMessages.value.length > 0) {
		activeTab.value = 'chat'
	} else if (val) {
		activeTab.value = 'analysis'
	}
}, { immediate: true })

watch(chatMessages, (msgs) => {
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
	width: 360px;
	max-width: 92vw;
	background: #ffffff;
	border-left: 1px solid var(--border-color, #e5e7eb);
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
	height: 56px;
	padding: 0 14px;
	display: flex;
	align-items: center;
	gap: 10px;
	border-bottom: 1px solid #f3f4f6;
	flex-shrink: 0;
}

.close-btn {
	width: 28px;
	height: 28px;
	flex-shrink: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--text-secondary, #6b7280);
	transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
	background: #f3f4f6;
	color: var(--text-primary, #111827);
}

.close-btn svg {
	width: 15px;
	height: 15px;
}

.analysis-body {
	flex: 1;
	overflow-y: auto;
	padding: 16px;
	padding-bottom: 24px;
	overscroll-behavior: contain;
	scrollbar-width: thin;
	scrollbar-color: #d1d5db transparent;
}

.analysis-body::-webkit-scrollbar {
	width: 6px;
}

.analysis-body::-webkit-scrollbar-track {
	background: transparent;
}

.analysis-body::-webkit-scrollbar-thumb {
	background: #d1d5db;
	border-radius: 3px;
}

.analysis-body::-webkit-scrollbar-thumb:hover {
	background: #9ca3af;
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
	min-width: 0;
}

.fact-check-warning .warning-title {
	margin: 0;
	font-size: 13px;
	font-weight: 600;
	color: #92400e;
}

.fact-check-warning .warning-desc {
	margin: 2px 0 0;
	font-size: 12px;
	color: #b45309;
	word-break: break-all;
}

/* ═══ 问题分布 ═══ */
.gap-section {
	margin-bottom: 16px;
}

.section-title {
	margin: 0 0 10px;
	font-size: 14px;
	font-weight: 600;
	color: var(--text-primary, #111827);
}

.gap-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.gap-item {
	padding: 10px 12px;
	background: #f9fafb;
	border: 1px solid var(--border-color, #e5e7eb);
	border-radius: 8px;
}

.gap-item-head {
	display: flex;
	align-items: center;
	gap: 8px;
}

.gap-item-name {
	flex: 1;
	min-width: 0;
	font-size: 13px;
	font-weight: 500;
	color: var(--text-primary, #111827);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.gap-item-desc {
	margin-top: 4px;
	font-size: 12px;
	line-height: 1.5;
	color: var(--text-secondary, #6b7280);
}

.severity-badge {
	flex-shrink: 0;
	font-size: 11px;
	padding: 2px 8px;
	border-radius: 9999px;
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
	background: var(--color-accent-subtle, #eef2ff);
	color: var(--color-accent-primary, #6366f1);
}

/* ═══ 模块建议 ═══ */
.module-section {
	margin-bottom: 8px;
}

.module-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

/* ═══ Chat ═══ */
.chat-body {
	padding: 0;
	background: #f8fafc;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.chat-messages {
	flex: 1;
	min-height: 0;
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
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.msg-row.user .msg-bubble {
	background: var(--color-accent-primary, #6366f1);
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
	border: 1px solid var(--color-accent-primary, #6366f1);
	background: #ffffff;
	color: var(--color-accent-primary, #6366f1);
	cursor: pointer;
	transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.option-btn:hover {
	background: var(--color-accent-primary, #6366f1);
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

.analysis-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 0;
	color: var(--text-secondary, #6b7280);
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

.raw-debug {
	margin-top: 12px;
	font-size: 12px;
	color: var(--text-secondary, #6b7280);
	max-width: 280px;
	text-align: left;
}

.raw-debug pre {
	max-height: 180px;
	overflow: auto;
	background: #f9fafb;
	border-radius: 6px;
	padding: 8px;
	font-size: 11px;
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
