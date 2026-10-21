import { readFileSync } from 'node:fs'
import { cjkCharacters, coveredCharacters } from '../../scripts/subset-chinese-font'
import { UI_CHINESE } from '../content/chineseUi'
import drinks from '../content/drinks.json'

it('finds CJK characters, once each', () => {
  expect(cjkCharacters('Kopi 咖啡 咖')).toEqual(['咖', '啡'])
})

it('reads the characters a unicode-range covers', () => {
  const css = '@font-face { unicode-range: U+5496,U+5561-5562; }'
  expect([...coveredCharacters(css)].sort()).toEqual(['咖', '啡', '啢'].sort())
})

it('the subset covers every Chinese character in the content and UI', () => {
  const needed = cjkCharacters(drinks.map((d) => d.chinese ?? '').join('') + UI_CHINESE.join(''))
  const covered = coveredCharacters(readFileSync('src/fonts/zh/zh.css', 'utf8'))
  expect(needed.filter((c) => !covered.has(c))).toEqual([])
})
