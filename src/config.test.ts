import { FEEDBACK_URL } from './config'

it('sends feedback to a Google Form over https', () => {
  expect(new URL(FEEDBACK_URL).protocol).toBe('https:')
  expect(new URL(FEEDBACK_URL).hostname).toMatch(/^(forms\.gle|docs\.google\.com)$/)
})
