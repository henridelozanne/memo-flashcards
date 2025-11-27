<template>
  <div class="tiptap-editor">
    <div v-if="editor" class="toolbar">
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <span class="font-bold">B</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <span class="italic">I</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <span class="underline">U</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <span class="text-sm font-bold">H2</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <span class="text-sm font-bold">H3</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <span>•</span>
      </button>
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <span class="text-sm">1.</span>
      </button>
      <button type="button" class="toolbar-btn" @click="addImage">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </button>
      <input ref="imageInput" type="file" accept="image/*" style="display: none" @change="handleImageUpload" />
    </div>
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import imageCompression from 'browser-image-compression'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Écrivez ici...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

defineOptions({ name: 'TipTapEditor' })

const imageInput = ref<HTMLInputElement>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [2, 3],
      },
    }),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Underline,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none focus:outline-none',
    },
  },
  onUpdate: ({ editor: editorInstance }) => {
    emit('update:modelValue', editorInstance.getHTML())
  },
})

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value) {
      const isSame = editor.value.getHTML() === value
      if (!isSame) {
        editor.value.commands.setContent(value, { emitUpdate: false })
      }
    }
  }
)

function addImage() {
  imageInput.value?.click()
}

async function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    // Compression options
    const options = {
      maxSizeMB: 0.3, // 300KB max
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: 'image/jpeg',
      quality: 0.7, // Baisser la qualité drastiquement
    }

    const compressedFile = await imageCompression(file, options)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      if (editor.value) {
        editor.value.chain().focus().setImage({ src: base64 }).run()
      }
    }
    reader.readAsDataURL(compressedFile)
  } catch (error) {
    console.error('Error compressing image:', error)
  }

  // Reset input
  target.value = ''
}

onMounted(() => {
  if (editor.value && props.modelValue) {
    editor.value.commands.setContent(props.modelValue)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.tiptap-editor {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  padding: 4px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-wrap: nowrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  color: #374151;
}

.toolbar-btn:hover {
  background: #e5e7eb;
}

.toolbar-btn.is-active {
  background: var(--color-primary);
  color: white;
}

.editor-content {
  padding: 12px;
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.ProseMirror) {
  outline: none;
}

:deep(.ProseMirror p) {
  margin: 0.5em 0;
}

:deep(.ProseMirror p:first-child) {
  margin-top: 0;
}

:deep(.ProseMirror p:last-child) {
  margin-bottom: 0;
}

:deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 1em 0 0.5em;
}

:deep(.ProseMirror h3) {
  font-size: 1.25em;
  font-weight: bold;
  margin: 0.8em 0 0.4em;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

:deep(.ProseMirror ul) {
  list-style-type: disc;
}

:deep(.ProseMirror ol) {
  list-style-type: decimal;
}

:deep(.ProseMirror li) {
  margin: 0.25em 0;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 0.5em 0;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #9ca3af;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
