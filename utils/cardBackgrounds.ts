export type CardBackgroundId = 'white' | 'graph-paper' | 'ruled-notebook' | 'dot-grid' | 'graph-millimetre'

export interface CardBackground {
  id: CardBackgroundId
  labelKey: string
  style: Record<string, string>
}

export const CARD_BACKGROUNDS: CardBackground[] = [
  {
    id: 'white',
    labelKey: 'collections.cardBackgrounds.white',
    style: {
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'graph-paper',
    labelKey: 'collections.cardBackgrounds.graphPaper',
    style: {
      backgroundColor: '#fdfcfa',
      backgroundImage: [
        'repeating-linear-gradient(rgba(90, 120, 200, 0.1) 0px, rgba(90, 120, 200, 0.1) 1px, transparent 1px, transparent 100%)',
        'repeating-linear-gradient(90deg, rgba(90, 120, 200, 0.1) 0px, rgba(90, 120, 200, 0.1) 1px, transparent 1px, transparent 100%)',
      ].join(', '),
      backgroundSize: '22px 22px',
    },
  },
  {
    id: 'ruled-notebook',
    labelKey: 'collections.cardBackgrounds.ruledNotebook',
    style: {
      backgroundColor: '#fdfcfb',
      backgroundImage: [
        'linear-gradient(90deg, transparent 52px, rgba(220, 80, 80, 0.35) 52px, rgba(220, 80, 80, 0.35) 54px, transparent 54px)',
        'repeating-linear-gradient(transparent, transparent 31px, rgba(90, 120, 200, 0.2) 31px, rgba(90, 120, 200, 0.2) 32px)',
      ].join(', '),
      backgroundSize: '100% 32px',
      backgroundPositionY: '12px',
    },
  },
  {
    id: 'dot-grid',
    labelKey: 'collections.cardBackgrounds.dotGrid',
    style: {
      backgroundColor: '#ffffff',
      backgroundImage: 'radial-gradient(circle, rgba(90, 120, 200, 0.22) 1px, transparent 1px)',
      backgroundSize: '22px 22px',
    },
  },
  {
    id: 'graph-millimetre',
    labelKey: 'collections.cardBackgrounds.graphMillimetre',
    style: {
      backgroundColor: '#fdfcfa',
      backgroundImage: [
        'repeating-linear-gradient(rgba(90, 120, 200, 0.12) 0px, rgba(90, 120, 200, 0.12) 1px, transparent 1px, transparent 100%)',
        'repeating-linear-gradient(90deg, rgba(90, 120, 200, 0.12) 0px, rgba(90, 120, 200, 0.12) 1px, transparent 1px, transparent 100%)',
        'repeating-linear-gradient(rgba(90, 120, 200, 0.08) 0px, rgba(90, 120, 200, 0.08) 1px, transparent 1px, transparent 100%)',
        'repeating-linear-gradient(90deg, rgba(90, 120, 200, 0.08) 0px, rgba(90, 120, 200, 0.08) 1px, transparent 1px, transparent 100%)',
      ].join(', '),
      backgroundSize: '110px 110px, 110px 110px, 22px 22px, 22px 22px',
      backgroundPosition: '8px 14px, 8px 14px, 8px 14px, 8px 14px',
    },
  },
]

export function getCardBackgroundStyle(id: string | null | undefined): Record<string, string> {
  const bg = CARD_BACKGROUNDS.find((b) => b.id === id)
  return bg ? bg.style : CARD_BACKGROUNDS[0].style
}
