import { readFileSync } from 'node:fs'
import { validateContent } from '../src/content/validate'

const read = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../src/content/${name}.json`, import.meta.url), 'utf8'))

const result = validateContent({ ingredients: read('ingredients'), drinks: read('drinks'), terms: read('terms') })

if (result.ok) {
  const { drinks, ingredients, terms } = result.content
  console.log(`Content OK: ${drinks.length} drinks, ${ingredients.length} ingredients, ${terms.length} terms.`)
} else {
  console.error(`Content has ${result.errors.length} problem(s):`)
  for (const error of result.errors) console.error(`  - ${error}`)
  process.exit(1)
}
