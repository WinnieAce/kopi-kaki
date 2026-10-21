import { readFileSync } from 'node:fs'

// Cloudflare builds every push: `wrangler deploy` for main, `wrangler preview` for other branches.
const config = () => JSON.parse(readFileSync('wrangler.json', 'utf8'))

it('serves the built app from dist, sending addresses such as /kopitiam/kopi to index.html', () => {
  expect(config().name).toBe('kopi-kaki')
  expect(config().assets).toEqual({ directory: './dist', not_found_handling: 'single-page-application' })
})

it('lets Cloudflare build a preview of every branch', () => {
  expect(config().previews).toEqual({})
})
