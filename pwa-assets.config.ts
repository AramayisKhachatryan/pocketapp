import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// `npm run icons` regenerates every PNG in public/ from public/icon.svg.
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // iOS fills transparent pixels with black, so give the touch icon a solid background.
    apple: { sizes: [180], padding: 0, resizeOptions: { background: '#1d2a4d' } },
    maskable: { sizes: [512], padding: 0, resizeOptions: { background: '#1d2a4d' } },
  },
  images: ['public/icon.svg'],
})
