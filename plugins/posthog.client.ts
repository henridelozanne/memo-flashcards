import posthog from 'posthog-js'
import type { PostHogConfig } from 'posthog-js'
import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const posthogKey = config.public.posthogKey as string
  const posthogHost = config.public.posthogHost as string

  if (!posthogKey) {
    return
  }

  // Initialiser PostHog uniquement en production
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  try {
    const posthogConfig: Partial<PostHogConfig> = {
      api_host: posthogHost || 'https://eu.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      respect_dnt: true,
      disable_session_recording: true,
      autocapture: false,
    }

    posthog.init(posthogKey, posthogConfig)

    nuxtApp.provide('posthog', posthog)
  } catch (error) {
    console.error('Failed to initialize PostHog:', error)
  }
})
