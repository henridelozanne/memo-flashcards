declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  type EmptyProps = Record<string, never>
  type EmptyData = Record<string, never>

  const component: DefineComponent<EmptyProps, EmptyData, unknown>
  export default component
}
