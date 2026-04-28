<template>
	<div class="rich-editor" :class="{ focused }">
		<!-- Toolbar -->
		<div class="toolbar">
			<!-- Text style -->
			<button class="tb-btn" :class="{ active: editor?.isActive('bold') }" @mousedown.prevent="editor?.chain().focus().toggleBold().run()" title="加粗">
				<svg viewBox="0 0 16 16" fill="none"><path d="M4 3h5a3 3 0 010 6H4V3zM4 9h5.5a3.5 3.5 0 010 7H4V9z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
			</button>
			<button class="tb-btn" :class="{ active: editor?.isActive('italic') }" @mousedown.prevent="editor?.chain().focus().toggleItalic().run()" title="斜体">
				<svg viewBox="0 0 16 16" fill="none"><path d="M6 3h5M5 13h5M9 3L7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
			</button>
			<button class="tb-btn" :class="{ active: editor?.isActive('underline') }" @mousedown.prevent="editor?.chain().focus().toggleUnderline().run()" title="下划线">
				<svg viewBox="0 0 16 16" fill="none"><path d="M4 3v5a4 4 0 008 0V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
			</button>
			<button class="tb-btn" :class="{ active: editor?.isActive('strike') }" @mousedown.prevent="editor?.chain().focus().toggleStrike().run()" title="删除线">
				<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M5.5 11c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
			</button>

			<div class="tb-sep" />

			<!-- Align -->
			<button class="tb-btn" :class="{ active: editor?.isActive({ textAlign: 'left' }) }" @mousedown.prevent="editor?.chain().focus().setTextAlign('left').run()" title="左对齐">
				<svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 7h8M2 10h12M2 13h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
			</button>
			<button class="tb-btn" :class="{ active: editor?.isActive({ textAlign: 'center' }) }" @mousedown.prevent="editor?.chain().focus().setTextAlign('center').run()" title="居中">
				<svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 7h8M2 10h12M4 13h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
			</button>
			<button class="tb-btn" :class="{ active: editor?.isActive({ textAlign: 'right' }) }" @mousedown.prevent="editor?.chain().focus().setTextAlign('right').run()" title="右对齐">
				<svg viewBox="0 0 16 16" fill="none"><path d="M2 4h12M6 7h8M2 10h12M6 13h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
			</button>

			<div class="tb-sep" />

			<!-- Lists -->
			<button class="tb-btn" :class="{ active: editor?.isActive('bulletList') }" @mousedown.prevent="editor?.chain().focus().toggleBulletList().run()" title="无序列表">
				<svg viewBox="0 0 16 16" fill="none"><circle cx="3" cy="4.5" r="1" fill="currentColor"/><circle cx="3" cy="8" r="1" fill="currentColor"/><circle cx="3" cy="11.5" r="1" fill="currentColor"/><path d="M6 4.5h8M6 8h8M6 11.5h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
			</button>
			<button class="tb-btn" :class="{ active: editor?.isActive('orderedList') }" @mousedown.prevent="editor?.chain().focus().toggleOrderedList().run()" title="有序列表">
				<svg viewBox="0 0 16 16" fill="none"><path d="M2 3.5h2M3 3.5V7M2 7h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 9.5c0-.83.67-1.5 1.5-1.5S5 8.67 5 9.5c0 .55-.4 1-.9 1.5L2 13h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 4.5h7M7 8h7M7 11.5h7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
			</button>

			<div class="tb-sep" />

			<!-- Undo / Redo -->
			<button class="tb-btn" @mousedown.prevent="editor?.chain().focus().undo().run()" title="撤销">
				<svg viewBox="0 0 16 16" fill="none"><path d="M3 7H10a3 3 0 010 6H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 4L3 7l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
			<button class="tb-btn" @mousedown.prevent="editor?.chain().focus().redo().run()" title="重做">
				<svg viewBox="0 0 16 16" fill="none"><path d="M13 7H6a3 3 0 000 6h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 4l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
		</div>

		<!-- Editor content -->
		<editor-content class="editor-content" :editor="editor" />
	</div>
</template>

<script setup>
import { watch, onBeforeUnmount, ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'

const props = defineProps({
	modelValue: { type: String, default: '' },
	placeholder: { type: String, default: '请输入内容...' },
})

const emit = defineEmits(['update:modelValue'])

const focused = ref(false)

const editor = useEditor({
	content: props.modelValue || '',
	extensions: [
		StarterKit,
		TextStyle,
		TextAlign.configure({ types: ['heading', 'paragraph'] }),
	],
	editorProps: {
		attributes: {
			class: 'prose-area',
		},
	},
	onUpdate({ editor }) {
		emit('update:modelValue', editor.getHTML())
	},
	onFocus() { focused.value = true },
	onBlur() { focused.value = false },
})

// Sync when modelValue changes externally (e.g. loading from store)
watch(() => props.modelValue, (val) => {
	if (!editor.value) return
	const current = editor.value.getHTML()
	if (val !== current) {
		editor.value.commands.setContent(val || '', false)
	}
})

onBeforeUnmount(() => {
	editor.value?.destroy()
})
</script>

<style scoped lang="scss">
.rich-editor {
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	overflow: hidden;
	background: #fff;
	transition: border-color 0.15s, box-shadow 0.15s;

	&.focused {
		border-color: #93c5fd;
		box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.2);
	}
}

/* ── Toolbar ── */
.toolbar {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 1px;
	padding: 5px 6px;
	border-bottom: 1px solid #f3f4f6;
	background: #fafafa;
}

.tb-btn {
	width: 26px;
	height: 26px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	border-radius: 5px;
	color: #6b7280;
	cursor: pointer;
	transition: background 0.1s, color 0.1s;
	flex-shrink: 0;

	svg {
		width: 14px;
		height: 14px;
		pointer-events: none;
	}

	&:hover {
		background: #f3f4f6;
		color: #111827;
	}

	&.active {
		background: #eff6ff;
		color: #2563eb;
	}
}

.tb-sep {
	width: 1px;
	height: 16px;
	background: #e5e7eb;
	margin: 0 3px;
	flex-shrink: 0;
}

/* ── Editor content ── */
.editor-content {
	:deep(.prose-area) {
		min-height: 100px;
		padding: 10px 12px;
		font-size: 13px;
		line-height: 1.7;
		color: #111827;
		outline: none;

		/* Lists */
		ul {
			padding-left: 1.4em;
			margin: 4px 0;

			li {
				margin-bottom: 3px;

				p { margin: 0; }
			}
		}

		ol {
			padding-left: 1.4em;
			margin: 4px 0;

			li {
				margin-bottom: 3px;

				p { margin: 0; }
			}
		}

		/* Paragraphs */
		p {
			margin: 0 0 4px 0;

			&:last-child { margin-bottom: 0; }
		}

		/* Placeholder */
		p.is-editor-empty:first-child::before {
			content: attr(data-placeholder);
			color: #9ca3af;
			pointer-events: none;
			float: left;
			height: 0;
		}
	}
}
</style>
