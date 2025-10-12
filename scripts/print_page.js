const { chromium } = require('playwright')

;(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3001'
  const browser = await chromium.launch()
  const page = await browser.newPage()
  page.on('console', (msg) => console.log('PAGE LOG:', msg.type(), msg.text()))
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.toString()))
  await page.goto(base, { waitUntil: 'networkidle' })
  const content = await page.content()
  console.log('--- PAGE CONTENT START ---')
  console.log(content.substring(0, 4000))
  console.log('--- PAGE CONTENT END ---')
  const h1 = await page.locator('h1').allTextContents()
  console.log('H1 texts:', h1)
  const nuxt = await page.evaluate(() => (window.__NUXT__ ? window.__NUXT__ : null))
  console.log('window.__NUXT__ =', JSON.stringify(nuxt))
  await browser.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
