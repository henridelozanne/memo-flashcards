import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DailyReviewEnd from '~/components/DailyReviewEnd.vue'

// Mock de vue-i18n
type TParams = Record<string, string | number>
const mockT = (key: string, params?: TParams) => {
  const translations: Record<string, string> = {
    'dailyReview.sessionFinished': 'Session quotidienne terminée !',
    'dailyReview.cardsReviewed': 'Cartes révisées : {count}',
    'dailyReview.successRate': 'Taux de réussite : {percent}%',
    'dailyReview.streakValidated': 'Streak validé !',
    'dailyReview.streakNotValidated': 'Streak non validé',
    'dailyReview.currentStreak': 'Série actuelle : {days} jour | Série actuelle : {days} jours',
    'dailyReview.needMoreCards': 'Révisez au moins 10 cartes pour valider votre streak',
    'dailyReview.backToCollections': 'Retour aux collections'
  }
  
  if (params && typeof translations[key] === 'string') {
    let result = translations[key]
    
    // Gestion spéciale pour la pluralisation (pipe syntax)
    if (key === 'dailyReview.currentStreak' && params.days !== undefined) {
      const forms = result.split(' | ')
      return params.days === 1 ? 
        forms[0].replace('{days}', String(params.days)) : 
        forms[1].replace('{days}', String(params.days))
    }
    
    // Remplacement normal des paramètres
    return result.replace(/\{(\w+)\}/g, (match, param) => {
      const val = params[param]
      return val !== undefined ? String(val) : match
    })
  }
  return translations[key] || key
}

const globalMountOptions = {
  global: {
    mocks: {
      $t: mockT
    }
  }
}

describe('DailyReviewEnd', () => {
  it('affiche les statistiques de base', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 5,
        successRate: 80,
        streakValidated: true,
        currentStreak: 3
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Session quotidienne terminée !')
    expect(wrapper.text()).toContain('Cartes révisées : 5')
    expect(wrapper.text()).toContain('Taux de réussite : 80%')
  })

  it('affiche le streak validé avec le bon style', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 10,
        successRate: 90,
        streakValidated: true,
        currentStreak: 5
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Streak validé !')
    expect(wrapper.text()).toContain('Série actuelle : 5 jours')
    
    // Vérifier que la classe CSS pour le succès est présente
    const streakDiv = wrapper.find('.bg-green-100')
    expect(streakDiv.exists()).toBe(true)
    expect(streakDiv.classes()).toContain('text-green-800')
  })

  it('affiche le streak non validé avec le bon style', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 3,
        successRate: 70,
        streakValidated: false,
        currentStreak: 2
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Streak non validé')
    expect(wrapper.text()).toContain('Révisez au moins 10 cartes')
    
    // Vérifier que la classe CSS pour l'avertissement est présente
    const streakDiv = wrapper.find('.bg-yellow-100')
    expect(streakDiv.exists()).toBe(true)
    expect(streakDiv.classes()).toContain('text-yellow-800')
  })

  it('gère la pluralisation du streak correctement', () => {
    // Test avec 1 jour (singulier)
    const wrapperSingular = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 10,
        successRate: 90,
        streakValidated: true,
        currentStreak: 1
      },
      ...globalMountOptions
    })

    expect(wrapperSingular.text()).toContain('Série actuelle : 1 jour')
    expect(wrapperSingular.text()).not.toContain('1 jours')

    // Test avec plusieurs jours (pluriel)
    const wrapperPlural = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 10,
        successRate: 90,
        streakValidated: true,
        currentStreak: 5
      },
      ...globalMountOptions
    })

    expect(wrapperPlural.text()).toContain('Série actuelle : 5 jours')
  })

  it('émet back quand on clique sur le bouton retour', async () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 5,
        successRate: 80,
        streakValidated: true,
        currentStreak: 3
      },
      ...globalMountOptions
    })

    const backButton = wrapper.find('button')
    expect(backButton.text()).toBe('Retour aux collections')
    
    await backButton.trigger('click')
    expect(wrapper.emitted('back')).toBeTruthy()
  })

  it('affiche le message d\'encouragement', () => {
    const wrapper = mount(DailyReviewEnd, {
      props: {
        cardsReviewed: 8,
        successRate: 100,
        streakValidated: true,
        currentStreak: 7
      },
      ...globalMountOptions
    })

    expect(wrapper.text()).toContain('Félicitations pour cette session !')
  })
})