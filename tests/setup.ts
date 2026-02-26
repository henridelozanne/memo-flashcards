import { vi } from 'vitest'

// Mock HTMLCanvasElement.getContext (not supported in jsdom)
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock tous les imports SVG
vi.mock('*.svg', () => ({
  default: 'mocked-svg-path',
}))

// Mock tous les assets SVG avec le chemin ~
vi.mock('~/assets/svg/forgetting-curve.svg', () => ({
  default: 'mocked-forgetting-curve.svg',
}))

vi.mock('~/assets/svg/Harvard_University_coat_of_arms.svg', () => ({
  default: 'mocked-harvard.svg',
}))
