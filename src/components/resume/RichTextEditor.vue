<template>
	<div class="rich-editor" :class="{ focused }">
		<!-- 工具栏：两行布局，与参考 UI 一致 -->
		<div class="toolbar">
			<div class="toolbar-row">
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive('bold') }"
					@mousedown.prevent="editor?.chain().focus().toggleBold().run()"
					title="加粗"
				>
					<img class="tb-icon" src="/static/editor/bold.svg" alt="加粗" />
				</button>
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive('italic') }"
					@mousedown.prevent="editor?.chain().focus().toggleItalic().run()"
					title="斜体"
				>
					<img class="tb-icon" src="/static/editor/italic.svg" alt="斜体" />
				</button>
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive('underline') }"
					@mousedown.prevent="editor?.chain().focus().toggleUnderline().run()"
					title="下划线"
				>
					<img class="tb-icon" src="/static/editor/underline.svg" alt="下划线" />
				</button>
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive('strike') }"
					@mousedown.prevent="editor?.chain().focus().toggleStrike().run()"
					title="删除线"
				>
					<img class="tb-icon" src="/static/editor/strike.svg" alt="删除线" />
				</button>

				<div class="tb-sep" />

				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive({ textAlign: 'left' }) }"
					@mousedown.prevent="editor?.chain().focus().setTextAlign('left').run()"
					title="左对齐"
				>
					<img class="tb-icon" src="/static/editor/align-left.svg" alt="左对齐" />
				</button>
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive({ textAlign: 'center' }) }"
					@mousedown.prevent="editor?.chain().focus().setTextAlign('center').run()"
					title="居中"
				>
					<img class="tb-icon" src="/static/editor/align-center.svg" alt="居中" />
				</button>
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive({ textAlign: 'right' }) }"
					@mousedown.prevent="editor?.chain().focus().setTextAlign('right').run()"
					title="右对齐"
				>
					<img class="tb-icon" src="/static/editor/align-right.svg" alt="右对齐" />
				</button>
			</div>

			<div class="toolbar-row">
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive('bulletList') }"
					@mousedown.prevent="editor?.chain().focus().toggleBulletList().run()"
					title="无序列表"
				>
					<img class="tb-icon" src="/static/editor/bullet-list.svg" alt="无序列表" />
				</button>
				<button
					type="button"
					class="tb-btn"
					:class="{ active: editor?.isActive('orderedList') }"
					@mousedown.prevent="editor?.chain().focus().toggleOrderedList().run()"
					title="有序列表"
				>
					<img class="tb-icon" src="/static/editor/ordered-list.svg" alt="有序列表" />
				</button>

				<div class="tb-sep" />

				<button
					type="button"
					class="tb-btn"
					@mousedown.prevent="editor?.chain().focus().undo().run()"
					title="撤销"
				>
					<img class="tb-icon" src="/static/editor/undo.svg" alt="撤销" />
				</button>
				<button
					type="button"
					class="tb-btn"
					@mousedown.prevent="editor?.chain().focus().redo().run()"
					title="重做"
				>
					<img class="tb-icon" src="/static/editor/redo.svg" alt="重做" />
				</button>
			</div>
		</div>

		<editor-content class="editor-content" :editor="editor" />
	</div>
</template>

<script setup>
import { watch, onBeforeUnmount, ref, computed } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'

const props = defineProps({
	modelValue: { type: String, default: '' },
	placeholder: { type: String, default: '请输入内容...' },
	/** 编辑区最小高度（px），大段职责/项目描述建议 168+ */
	minHeight: { type: Number, default: 168 },
})

const emit = defineEmits(['update:modelValue'])

const focused = ref(false)
let selfEmitted = ''
let typingLock = false

const editorMinHeight = computed(() => `${props.minHeight}px`)

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
			'data-placeholder': props.placeholder,
		},
	},
	onUpdate({ editor }) {
		const html = editor.getHTML()
		selfEmitted = html
		typingLock = true
		emit('update:modelValue', html)
		Promise.resolve().then(() => { typingLock = false })
	},
	onFocus() { focused.value = true },
	onBlur() { focused.value = false },
})

watch(() => props.placeholder, (val) => {
	if (!editor.value) return
	editor.value.setOptions({
		editorProps: {
			attributes: {
				class: 'prose-area',
				'data-placeholder': val,
			},
		},
	})
})

watch(() => props.modelValue, (val) => {
	if (!editor.value) return
	if (typingLock) return
	if (val === selfEmitted) return
	const current = editor.value.getHTML()
	if (val === current) return
	editor.value.commands.setContent(val || '', false)
})

onBeforeUnmount(() => {
	editor.value?.destroy()
})
</script>

<style scoped lang="scss">
.rich-editor {
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	background: #fff;
	transition: border-color 0.15s, box-shadow 0.15s;

	&.focused {
		border-color: #93c5fd;
		box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.2);
	}
}

.toolbar {
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 6px 8px;
	border-bottom: 1px solid #f3f4f6;
	background: #fafafa;
	border-radius: 8px 8px 0 0;
}

.toolbar-row {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 2px;
}

.tb-btn {
	width: 28px;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: none;
	background: transparent;
	border-radius: 6px;
	cursor: pointer;
	transition: background 0.1s, color 0.1s;
	flex-shrink: 0;
	padding: 0;

	&:hover {
		background: #f3f4f6;
	}

	&.active {
		background: #eff6ff;
	}
}

.tb-icon {
	width: 16px;
	height: 16px;
	display: block;
	pointer-events: none;
	opacity: 0.72;
}

.tb-btn:hover .tb-icon,
.tb-btn.active .tb-icon {
	opacity: 1;
}

.tb-btn.active .tb-icon {
	filter: brightness(0) saturate(100%) invert(32%) sepia(93%) saturate(1352%) hue-rotate(206deg) brightness(97%) contrast(96%);
}

.tb-sep {
	width: 1px;
	height: 18px;
	background: #e5e7eb;
	margin: 0 4px;
	flex-shrink: 0;
}

.editor-content {
	:deep(.tiptap),
	:deep(.ProseMirror),
	:deep(.prose-area) {
		min-height: v-bind(editorMinHeight);
		padding: 12px 14px;
		font-size: 13px;
		line-height: 1.75;
		color: #111827;
		outline: none;
		box-sizing: border-box;

		ul {
			padding-left: 1.5em;
			margin: 6px 0;

			li {
				margin-bottom: 6px;

				p { margin: 0; }
			}
		}

		ol {
			padding-left: 1.5em;
			margin: 6px 0;

			li {
				margin-bottom: 6px;

				p { margin: 0; }
			}
		}

		p {
			margin: 0 0 6px 0;

			&:last-child { margin-bottom: 0; }
		}

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
