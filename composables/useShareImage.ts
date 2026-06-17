import { useI18n } from 'vue-i18n'

export function useShareImage() {
  const { t } = useI18n()

  function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  async function generateSessionShareImage(params: {
    goodCount: number
    cardsReviewedCount: number
    successRate: number
    xpScore: number
  }): Promise<File | null> {
    try {
      await document.fonts.ready
    } catch {
      /* ignoré */
    }

    const canvas = document.createElement('canvas')
    const W = 1080
    const H = 1080
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // Chargement du logo
    const logo = new Image()
    logo.crossOrigin = 'anonymous'
    await new Promise<void>((resolve) => {
      logo.onload = () => resolve()
      logo.onerror = () => resolve()
      logo.src = '/cortx_logo_transparent_background.png'
    })

    // Fond blanc
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, W, H)

    // Header dégradé violet
    const headerH = 230
    const headerGrad = ctx.createLinearGradient(0, 0, W, 0)
    headerGrad.addColorStop(0, '#5f33e1')
    headerGrad.addColorStop(1, '#ab93ff')
    ctx.fillStyle = headerGrad
    ctx.fillRect(0, 0, W, headerH)

    // Logo dans le header
    if (logo.complete && logo.naturalWidth > 0) {
      ctx.drawImage(logo, 52, 52, 126, 126)
    }

    // Nom de l'app
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold 84px 'Lexend Deca', Helvetica, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText('Cortx', 204, 115)

    // Titre session
    ctx.fillStyle = 'rgba(36, 37, 44, 1)'
    ctx.font = `600 48px 'Lexend Deca', Helvetica, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(`${t('review.sessionFinished')} 🎉`, W / 2, 330)

    // Score principal
    ctx.fillStyle = '#5f33e1'
    ctx.font = `bold 200px 'Lexend Deca', Helvetica, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(`${params.goodCount}/${params.cardsReviewedCount}`, W / 2, 545)

    // Label "cartes révisées"
    ctx.fillStyle = 'rgba(110, 106, 124, 1)'
    ctx.font = `44px 'Lexend Deca', Helvetica, sans-serif`
    ctx.fillText(t('review.shareCardCardsReviewed'), W / 2, 618)

    // Barre de progression — fond
    const barX = 100
    const barY = 670
    const barW = W - 200
    const barH = 28
    const barR = 14
    ctx.fillStyle = '#eee9ff'
    drawRoundRect(ctx, barX, barY, barW, barH, barR)
    ctx.fill()

    // Barre de progression — remplissage
    const fillW = Math.max(barH * 2, barW * Math.min(params.successRate / 100, 1))
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0)
    fillGrad.addColorStop(0, '#5f33e1')
    fillGrad.addColorStop(1, '#ab93ff')
    ctx.fillStyle = fillGrad
    drawRoundRect(ctx, barX, barY, fillW, barH, barR)
    ctx.fill()

    // Taux de réussite
    ctx.fillStyle = 'rgba(36, 37, 44, 1)'
    ctx.font = `bold 64px 'Lexend Deca', Helvetica, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(`${params.successRate}% ${t('review.shareCardSuccessRate')}`, W / 2, 800)

    // XP
    if (params.xpScore > 0) {
      ctx.fillStyle = '#f97316'
      ctx.font = `bold 56px 'Lexend Deca', Helvetica, sans-serif`
      ctx.fillText(`+${params.xpScore} XP 🔥`, W / 2, 888)
    }

    // Séparateur footer
    ctx.strokeStyle = '#eee9ff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(100, 942)
    ctx.lineTo(W - 100, 942)
    ctx.stroke()

    // Footer
    ctx.fillStyle = 'rgba(110, 106, 124, 1)'
    ctx.font = `38px 'Lexend Deca', Helvetica, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText('cortx.app', W / 2, 1002)

    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null)
          return
        }
        resolve(new File([blob], 'cortx-session.png', { type: 'image/png' }))
      }, 'image/png')
    })
  }

  return { generateSessionShareImage }
}
