<!--
	统一图标组件（Lucide 风格，24x24 viewBox）
	用法：<Icon name="bold" size="16" />
-->
<template>
	<svg
		class="rs-icon"
		:viewBox="vb"
		:width="size"
		:height="size"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<template v-for="(d, i) in paths" :key="i">
			<path v-if="d.d" :d="d.d" />
			<circle v-else-if="d.cx !== undefined" :cx="d.cx" :cy="d.cy" :r="d.r" />
			<line v-else-if="d.x1 !== undefined" :x1="d.x1" :y1="d.y1" :x2="d.x2" :y2="d.y2" />
			<polyline v-else-if="d.points" :points="d.points" />
			<rect v-else-if="d.x !== undefined" :x="d.x" :y="d.y" :width="d.w" :height="d.h" :rx="d.rx || 0" />
		</template>
	</svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	name: { type: String, required: true },
	size: { type: [Number, String], default: 16 },
})

// Lucide-style icons, 24x24 viewBox unless noted
const ICONS = {
	// ── 富文本工具栏 ──
	bold:        [{ d: 'M6 4h8a4 4 0 0 1 0 8H6z' }, { d: 'M6 12h9a4 4 0 0 1 0 8H6z' }],
	italic:      [{ x1: 19, y1: 4, x2: 10, y2: 4 }, { x1: 14, y1: 20, x2: 5, y2: 20 }, { x1: 15, y1: 4, x2: 9, y2: 20 }],
	underline:   [{ d: 'M6 4v6a6 6 0 0 0 12 0V4' }, { x1: 4, y1: 20, x2: 20, y2: 20 }],
	strikethrough: [{ d: 'M16 4H9a3 3 0 0 0-2.83 4' }, { d: 'M14 12a4 4 0 0 1 0 8H6' }, { x1: 4, y1: 12, x2: 20, y2: 12 }],
	'align-left':   [{ x1: 17, y1: 10, x2: 3, y2: 10 }, { x1: 21, y1: 6, x2: 3, y2: 6 }, { x1: 21, y1: 14, x2: 3, y2: 14 }, { x1: 17, y1: 18, x2: 3, y2: 18 }],
	'align-center': [{ x1: 18, y1: 10, x2: 6, y2: 10 }, { x1: 21, y1: 6, x2: 3, y2: 6 }, { x1: 21, y1: 14, x2: 3, y2: 14 }, { x1: 18, y1: 18, x2: 6, y2: 18 }],
	'align-right':  [{ x1: 21, y1: 10, x2: 7, y2: 10 }, { x1: 21, y1: 6, x2: 3, y2: 6 }, { x1: 21, y1: 14, x2: 3, y2: 14 }, { x1: 21, y1: 18, x2: 7, y2: 18 }],
	'list-bullet':  [{ x1: 8, y1: 6, x2: 21, y2: 6 }, { x1: 8, y1: 12, x2: 21, y2: 12 }, { x1: 8, y1: 18, x2: 21, y2: 18 }, { x1: 3, y1: 6, x2: 3.01, y2: 6 }, { x1: 3, y1: 12, x2: 3.01, y2: 12 }, { x1: 3, y1: 18, x2: 3.01, y2: 18 }],
	'list-ordered': [{ x1: 10, y1: 6, x2: 21, y2: 6 }, { x1: 10, y1: 12, x2: 21, y2: 12 }, { x1: 10, y1: 18, x2: 21, y2: 18 }, { d: 'M4 6h1v4' }, { d: 'M4 10h2' }, { d: 'M6 18H4c0-1 2-2 2-3s-1-1.5-2-1' }],
	undo: [{ d: 'M3 7v6h6' }, { d: 'M21 17a9 9 0 0 0-15-6.7L3 13' }],
	redo: [{ d: 'M21 7v6h-6' }, { d: 'M3 17a9 9 0 0 1 15-6.7L21 13' }],

	// ── 操作按钮 ──
	upload:   [{ d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }, { polyline: '17 8 12 3 7 8' }, { x1: 12, y1: 3, x2: 12, y2: 15 }],
	image:    [{ x: 3, y: 3, w: 18, h: 18, rx: 2 }, { cx: 8.5, cy: 8.5, r: 1.5 }, { polyline: '21 15 16 10 5 21' }],
	camera:   [{ d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' }, { cx: 12, cy: 13, r: 4 }],
	eye:      [{ d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }, { cx: 12, cy: 12, r: 3 }],
	'eye-off': [{ d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }, { x1: 1, y1: 1, x2: 23, y2: 23 }],
	trash:    [{ polyline: '3 6 5 6 21 6' }, { d: 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }, { x1: 10, y1: 11, x2: 10, y2: 17 }, { x1: 14, y1: 11, x2: 14, y2: 17 }],
	refresh:  [{ polyline: '23 4 23 10 17 10' }, { polyline: '1 20 1 14 7 14' }, { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' }],
	plus:     [{ x1: 12, y1: 5, x2: 12, y2: 19 }, { x1: 5, y1: 12, x2: 19, y2: 12 }],
	'arrow-up':   [{ x1: 12, y1: 19, x2: 12, y2: 5 }, { polyline: '5 12 12 5 19 12' }],
	'arrow-down': [{ x1: 12, y1: 5, x2: 12, y2: 19 }, { polyline: '19 12 12 19 5 12' }],
	check:    [{ polyline: '20 6 9 17 4 12' }],
	x:        [{ x1: 18, y1: 6, x2: 6, y2: 18 }, { x1: 6, y1: 6, x2: 18, y2: 18 }],
	settings: [{ cx: 12, cy: 12, r: 3 }, { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' }],
	user:     [{ d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }, { cx: 12, cy: 7, r: 4 }],
}

const paths = computed(() => {
	const list = ICONS[props.name] || []
	return list.map((item) => {
		if (typeof item.polyline === 'string') return { points: item.polyline }
		return item
	})
})

const vb = '0 0 24 24'
</script>

<style scoped>
.rs-icon {
	display: inline-block;
	vertical-align: middle;
	flex-shrink: 0;
}
</style>
