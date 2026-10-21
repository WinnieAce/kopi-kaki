import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

// The app is for a general audience including children. Nothing from First Pour's alcohol features may
// creep back in. The guard files below hold the word list, so they are the only exceptions.
const EXCEPTIONS = ['content/guards.ts', 'content/guards.test.ts', 'noAlcohol.test.ts']
const FORBIDDEN = /\babv\b|alcohol|AgeGate|ResponsibleNotice/i

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

it('no source file mentions alcohol, strength or the age gate', () => {
  const src = join(process.cwd(), 'src')
  const offenders = files(src)
    .filter((path) => !EXCEPTIONS.includes(relative(src, path).replaceAll('\\', '/')))
    .filter((path) => !/\.(woff2|png|svg)$/.test(path))
    .filter((path) => FORBIDDEN.test(readFileSync(path, 'utf8')))
    .map((path) => relative(src, path))
  expect(offenders).toEqual([])
})
