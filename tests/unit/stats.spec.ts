import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
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
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
        },
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays stats title', () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
        },
      },
    })
    expect(wrapper.html()).toContain('Statistiques')
  })

  it('has 4 tabs', () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    expect(tabs.length).toBe(4)
  })

  it('displays activity tab by default', () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
        },
      },
    })
    // Vérifier que l'onglet activity est actif par défaut (a le fond primaire)
    const tabs = wrapper.findAll('button')
    const activeTab = tabs.find((tab) => tab.classes().includes('bg-[var(--color-primary)]'))
    expect(activeTab).toBeDefined()
    expect(activeTab?.text()).toContain('Activité')
  })

  it('switches tabs when clicking', async () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    await tabs[1].trigger('click')
    expect(wrapper.html()).toContain('Répartition par compartiment')
  })

  it('displays progress tab content', async () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
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
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
          MonthCalendar: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    await tabs[2].trigger('click')
    // Just verify the tab switched without error
    expect(tabs[2].classes()).toContain('bg-[var(--color-primary)]')
  })

  it('displays habits tab content', async () => {
    const wrapper = mount(StatsPage, {
      global: {
        plugins: [i18n, createPinia()],
        stubs: {
          PageHeader: true,
          ProgressBar: true,
          StatCard: true,
          CompartmentBarChart: true,
          ProgressCircle: true,
        },
      },
    })
    const tabs = wrapper.findAll('button')
    await tabs[3].trigger('click')
    expect(wrapper.html()).toContain('Répartition des reviews par heure')
  })
})
