import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OPTIONS } from '../content/choices'
import { ChoiceRow } from './ChoiceRow'

const reason = 'Condensed milk is already sweet, so it can’t be Kosong. For no sugar, choose O or C.'
const blockKosong = (id: string) => (id === 'kosong' ? reason : null)
const free = () => null

function row(props: Partial<Parameters<typeof ChoiceRow>[0]> = {}) {
  const onChange = vi.fn()
  render(<ChoiceRow group="sugar" options={OPTIONS.sugar} value="normal" blockedReason={free} onChange={onChange} {...props} />)
  return onChange
}

afterEach(() => {
  vi.useRealTimers()
})

it('is a labelled radio group with the value checked', () => {
  row()
  const group = screen.getByRole('group', { name: 'Sugar' })
  expect(group).toBeInTheDocument()
  expect(screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label') ?? r.closest('label')?.textContent)).toEqual([
    'Kosong',
    'Siew Dai',
    'Normal',
    'Ga Dai',
  ])
  expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked()
})

it('calls onChange with the option id', async () => {
  const onChange = row()
  await userEvent.click(screen.getByRole('radio', { name: 'Siew Dai' }))
  expect(onChange).toHaveBeenCalledWith('siew-dai')
})

it('a blocked option explains itself instead of changing', async () => {
  const onChange = row({ blockedReason: blockKosong })
  expect(screen.getByRole('radio', { name: 'Kosong' })).toHaveAttribute('aria-disabled', 'true')
  await userEvent.click(screen.getByRole('radio', { name: 'Kosong' }))
  expect(onChange).not.toHaveBeenCalled()
  expect(screen.getByRole('status')).toHaveTextContent(reason)
  expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked()
})

it('arrow keys move the choice, and explain instead of moving onto a blocked option', async () => {
  const user = userEvent.setup()
  const onChange = row({ value: 'siew-dai', blockedReason: blockKosong })
  screen.getByRole('radio', { name: 'Siew Dai' }).focus()
  await user.keyboard('{ArrowRight}')
  expect(onChange).toHaveBeenLastCalledWith('normal')
  onChange.mockClear()
  screen.getByRole('radio', { name: 'Siew Dai' }).focus()
  await user.keyboard('{ArrowLeft}')
  expect(onChange).not.toHaveBeenCalled()
  expect(screen.getByRole('status')).toHaveTextContent(reason)
})

it('the callout closes after 5 seconds', () => {
  vi.useFakeTimers()
  row({ blockedReason: blockKosong })
  fireEvent.click(screen.getByRole('radio', { name: 'Kosong' }))
  expect(screen.getByRole('status')).toHaveTextContent(reason)
  act(() => {
    vi.advanceTimersByTime(5000)
  })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

it('shows a note passed in', () => {
  row({ note: 'Sugar is back to Normal.' })
  expect(screen.getByRole('status')).toHaveTextContent('Sugar is back to Normal.')
})
