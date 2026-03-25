import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()
export const isDark = computed(() => colorMode.value === 'dark')
