import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import StatsPage from '~/pages/stats.vue'
import messages from '~/locales'

const i18n = createI18n({
  legacy: false,
  locale: 'fr',
  messages,
})

describe('Stats Page', () => {
  it('renders correctly', () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays stats title', () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    expect(wrapper.html()).toContain('Statistiques')
  })

  it('has 4 tabs', () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    expect(tabs.length).toBe(4)
  })

  it('displays activity tab by default', () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    expect(wrapper.html()).toContain('324')
  })

  it('switches tabs when clicking', async () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    await tabs[1].trigger('click')
    expect(wrapper.html()).toContain('Bar chart à venir')
  })

  it('displays progress tab content', async () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    await tabs[1].trigger('click')
    expect(wrapper.html()).toContain('Répartition par compartiment')
  })

  it('displays rhythm tab content', async () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    await tabs[2].trigger('click')
    expect(wrapper.html()).toContain('Calendrier du mois')
  })

  it('displays habits tab content', async () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    await tabs[3].trigger('click')
    expect(wrapper.html()).toContain('Répartition des reviews par heure')
  })
})
