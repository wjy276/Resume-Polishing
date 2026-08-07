/**
 * AI 优化内容格式保留系统（Vue/uni-app 适配版）
 *
 * 目标：AI 建议应用回简历时，列表、加粗、斜体等格式不丢失。
 * - normalizeRichText: AI 返回的 Markdown/纯文本 → 结构化 HTML
 * - htmlToBlocks / blocksToHtml: HTML ↔ 简化块树（SRFT 简化版）
 * - mergeHtml: 原文与 AI 建议合并（smart / preserve / replace 三种策略）
 * - buildPreview: 生成带 added / removed / preserved 标注的预览数据
 */

const BLOCK_TAG_RE = /^\s*<(p|ul|ol|li|h[1-6]|div|section|blockquote)[\s>]/i

export function looksLikeHtml(text) {
	return typeof text === 'string' && BLOCK_TAG_RE.test(text)
}

export function escapeHtml(s) {
	return String(s ?? '').replace(/[&<>"']/g, (c) => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
	}[c]))
}

/* ═══ Layer 1+2：AI 输出 → 标准块树 → HTML ═══ */

export function parseInline(text) {
	const nodes = []
	const re = /(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*)/g
	let last = 0
	let m
	while ((m = re.exec(text)) !== null) {
		if (m.index > last) nodes.push({ text: text.slice(last, m.index), marks: [] })
		let value = ''
		let marks = []
		if (m[2] !== undefined) { value = m[2]; marks = ['bold'] }
		else if (m[3] !== undefined) { value = m[3]; marks = ['underline'] }
		else if (m[4] !== undefined) { value = m[4]; marks = ['code'] }
		else if (m[5] !== undefined) { value = m[5]; marks = ['italic'] }
		nodes.push({ text: value, marks })
		last = m.index + m[0].length
	}
	if (last < text.length) nodes.push({ text: text.slice(last), marks: [] })
	return nodes.length ? nodes : [{ text: '', marks: [] }]
}

export function markdownToBlocks(text) {
	const lines = String(text || '').split(/\r?\n/)
	const blocks = []
	let list = null

	const flushList = () => {
		if (list) { blocks.push(list); list = null }
	}

	for (const raw of lines) {
		const line = raw.replace(/\s+$/, '')
		const trimmed = line.trim()
		if (!trimmed) continue

		const h3 = trimmed.match(/^#{3,}\s+(.*)/)
		if (h3) { flushList(); blocks.push({ type: 'h3', children: parseInline(h3[1].trim()) }); continue }

		const h2 = trimmed.match(/^#{1,2}\s+(.*)/)
		if (h2) { flushList(); blocks.push({ type: 'h2', children: parseInline(h2[1].trim()) }); continue }

		const bullet = trimmed.match(/^[-*•·]\s+(.*)/)
		if (bullet) {
			if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] } }
			list.items.push(parseInline(bullet[1].trim()))
			continue
		}

		const ordered = trimmed.match(/^(\d+)[.)]\s+(.*)/)
		if (ordered) {
			if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] } }
			list.items.push(parseInline(ordered[2].trim()))
			continue
		}

		flushList()
		blocks.push({ type: 'p', children: parseInline(trimmed) })
	}
	flushList()
	return blocks
}

export function normalizeRichText(text) {
	if (!text) return ''
	if (looksLikeHtml(text)) return text
	return blocksToHtml(markdownToBlocks(text))
}

/* ═══ 块树渲染 ═══ */

function renderTextNode(node) {
	let t = escapeHtml(node.text)
	if (node.marks?.includes('bold')) t = `<strong>${t}</strong>`
	if (node.marks?.includes('italic')) t = `<em>${t}</em>`
	if (node.marks?.includes('underline')) t = `<u>${t}</u>`
	if (node.marks?.includes('code')) t = `<code>${t}</code>`
	return t
}

function renderInline(nodes) {
	return (nodes || []).map(renderTextNode).join('')
}

export function renderBlockHtml(block) {
	switch (block.type) {
		case 'ul':
			return `<ul>${block.items.map((i) => `<li><p>${renderInline(i)}</p></li>`).join('')}</ul>`
		case 'ol':
			return `<ol>${block.items.map((i) => `<li><p>${renderInline(i)}</p></li>`).join('')}</ol>`
		case 'h2':
			return `<h2>${renderInline(block.children)}</h2>`
		case 'h3':
			return `<h3>${renderInline(block.children)}</h3>`
		default:
			return `<p>${renderInline(block.children)}</p>`
	}
}

export function blocksToHtml(blocks) {
	return (blocks || []).map(renderBlockHtml).join('')
}

/* ═══ HTML → 块树（DOMParser 解析） ═══ */

function stripTags(html) {
	return String(html).replace(/<[^>]+>/g, ' ')
}

function inlineNodes(el) {
	const nodes = []
	const walk = (node, marks) => {
		if (node.nodeType === 3) {
			const t = node.textContent
			if (t) nodes.push({ text: t, marks: [...marks] })
			return
		}
		if (node.nodeType !== 1) return
		const tag = node.tagName.toLowerCase()
		const next = [...marks]
		if (tag === 'strong' || tag === 'b') next.push('bold')
		else if (tag === 'em' || tag === 'i') next.push('italic')
		else if (tag === 'u') next.push('underline')
		else if (tag === 'code') next.push('code')
		else if (tag === 'br') { nodes.push({ text: '\n', marks: [...marks] }); return }
		for (const child of Array.from(node.childNodes)) walk(child, next)
	}
	walk(el, [])
	return nodes
}

function elementToBlock(el) {
	const tag = el.tagName.toLowerCase()
	if (tag === 'ul' || tag === 'ol') {
		const items = []
		for (const li of Array.from(el.children).filter((c) => c.tagName.toLowerCase() === 'li')) {
			items.push(inlineNodes(li))
		}
		return { type: tag === 'ul' ? 'ul' : 'ol', items }
	}
	if (tag === 'h1' || tag === 'h2') return { type: 'h2', children: inlineNodes(el) }
	if (tag === 'h3' || tag === 'h4') return { type: 'h3', children: inlineNodes(el) }
	if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'li') {
		return { type: 'p', children: inlineNodes(el) }
	}
	return null
}

export function htmlToBlocks(html) {
	if (!html) return []
	if (typeof DOMParser === 'undefined') {
		return [{ type: 'p', children: parseInline(stripTags(html).replace(/\s+/g, ' ').trim()) }]
	}
	const doc = new DOMParser().parseFromString(html, 'text/html')
	const blocks = []
	for (const el of Array.from(doc.body.children)) {
		const b = elementToBlock(el)
		if (b) blocks.push(b)
	}
	if (!blocks.length) {
		const text = (doc.body.textContent || '').trim()
		if (text) blocks.push({ type: 'p', children: parseInline(text) })
	}
	return blocks
}

/* ═══ Layer 4：合并引擎 ═══ */

function blockText(block) {
	if (block.items) return block.items.flat().map((n) => n.text).join('')
	return (block.children || []).map((n) => n.text).join('')
}

function extractInline(block) {
	return block.items ? block.items.flat() : (block.children || [])
}

function similarity(a, b) {
	if (!a && !b) return 1
	if (!a || !b) return 0
	const setA = new Set(a)
	const setB = new Set(b)
	let inter = 0
	for (const ch of setA) if (setB.has(ch)) inter++
	return inter / Math.max(setA.size, setB.size)
}

function mergeBlockMarks(userBlock, aiBlock) {
	const userNodes = extractInline(userBlock)
	const userByText = new Map()
	userNodes.forEach((n) => {
		if (!userByText.has(n.text)) userByText.set(n.text, n.marks || [])
	})
	const copy = { ...aiBlock, children: undefined, items: undefined }
	const mergeNode = (n) => ({
		text: n.text,
		marks: userByText.has(n.text) ? userByText.get(n.text) : (n.marks || []),
	})
	if (aiBlock.items) {
		copy.items = aiBlock.items.map((itemNodes) => itemNodes.map(mergeNode))
	} else if (aiBlock.children) {
		copy.children = aiBlock.children.map(mergeNode)
	}
	return copy
}

export function mergeBlocks(userBlocks, aiBlocks, strategy = 'smart') {
	if (strategy === 'replace') {
		return { merged: aiBlocks, removed: [], addedIndexes: [], preservedIndexes: [] }
	}

	if (strategy === 'preserve') {
		const merged = aiBlocks.map((ai, idx) => {
			const user = userBlocks[idx]
			return user ? mergeBlockMarks(user, ai) : ai
		})
		return {
			merged,
			removed: [],
			addedIndexes: merged.map((_, i) => i).filter((i) => !userBlocks[i]),
			preservedIndexes: merged.map((_, i) => i).filter((i) => !!userBlocks[i]),
		}
	}

	// smart_merge：默认策略
	const used = new Set()
	const removed = []
	const merged = []
	const addedIndexes = []
	const preservedIndexes = []

	for (const ai of aiBlocks) {
		const aiText = blockText(ai)
		let best = -1
		let bestScore = 0
		for (let i = 0; i < userBlocks.length; i++) {
			if (used.has(i)) continue
			const s = similarity(aiText, blockText(userBlocks[i]))
			if (s > bestScore) { bestScore = s; best = i }
		}
		if (best >= 0 && bestScore >= 0.5) {
			used.add(best)
			merged.push(mergeBlockMarks(userBlocks[best], ai))
			preservedIndexes.push(merged.length - 1)
		} else {
			merged.push(ai)
			addedIndexes.push(merged.length - 1)
		}
	}

	userBlocks.forEach((u, i) => {
		if (!used.has(i)) removed.push(u)
	})

	return { merged, removed, addedIndexes, preservedIndexes }
}

export function mergeHtml(originalHtml, aiHtml, strategy = 'smart') {
	const userBlocks = htmlToBlocks(originalHtml)
	const aiBlocks = htmlToBlocks(aiHtml)
	const { merged } = mergeBlocks(userBlocks, aiBlocks, strategy)
	return blocksToHtml(merged)
}

export function buildPreview(originalHtml, aiHtml, strategy = 'smart') {
	const userBlocks = htmlToBlocks(originalHtml)
	const aiBlocks = htmlToBlocks(aiHtml)
	const { merged, removed, addedIndexes, preservedIndexes } = mergeBlocks(userBlocks, aiBlocks, strategy)
	const items = merged.map((block, i) => ({
		block,
		status: addedIndexes.includes(i) ? 'added' : preservedIndexes.includes(i) ? 'preserved' : 'normal',
	}))
	return { items, removed }
}
