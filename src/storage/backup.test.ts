import { backupFileName, parseBackup, serialiseBackup } from './backup'
import { defaultUserData, type UserData } from './userData'

const valid: UserData = { ...defaultUserData(), saved: [{ drinkId: 'kopi', choices: { milk: 'c' } }] }

it('round-trips', () => {
  expect(parseBackup(serialiseBackup(valid))).toEqual({ ok: true, data: valid })
})

it('rejects non-JSON text as invalid', () => {
  expect(parseBackup('not json')).toEqual({ ok: false, reason: 'invalid' })
})

it('rejects a newer-version file', () => {
  expect(parseBackup(JSON.stringify({ ...valid, version: 2 }))).toEqual({ ok: false, reason: 'newer-version' })
})

it('names the backup by date', () => {
  expect(backupFileName(new Date('2026-10-21T09:00:00Z'))).toBe('kopi-kaki-backup-2026-10-21.json')
})
