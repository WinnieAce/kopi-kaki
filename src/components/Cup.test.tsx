import { render } from '@testing-library/react'
import { Cup } from './Cup'

const none = { ice: false, steam: false, straw: false, latteArt: false, foam: false }

it('draws a decorative cup that names where it sits and what kind it is', () => {
  const { container } = render(<Cup cup="kopitiam-cup" colour="#b9875f" id="shelf:kopi" />)
  const svg = container.querySelector('svg.cup')!
  expect(svg).toHaveAttribute('data-cup', 'shelf:kopi')
  expect(svg).toHaveAttribute('data-kind', 'kopitiam-cup')
  expect(svg).toHaveAttribute('aria-hidden', 'true')
  expect(container.querySelector('.drink')).toHaveAttribute('fill', '#b9875f')
})

it.each(['kopitiam-cup', 'peng-glass', 'cafe-cup', 'tall-glass', 'mug'] as const)('draws a %s', (cup) => {
  const { container } = render(<Cup cup={cup} colour="#123456" />)
  expect(container.querySelector('.drink')).toHaveAttribute('fill', '#123456')
})

it('shows ice only when the order has it', () => {
  const { container, rerender } = render(<Cup cup="peng-glass" colour="#b9875f" extras={none} />)
  expect(container.querySelectorAll('.ice')).toHaveLength(0)
  rerender(<Cup cup="peng-glass" colour="#b9875f" extras={{ ...none, ice: true }} />)
  expect(container.querySelectorAll('.ice').length).toBeGreaterThan(0)
})

it('shows steam only when the order has it', () => {
  const { container, rerender } = render(<Cup cup="kopitiam-cup" colour="#b9875f" extras={none} />)
  expect(container.querySelectorAll('.steam')).toHaveLength(0)
  rerender(<Cup cup="kopitiam-cup" colour="#b9875f" extras={{ ...none, steam: true }} />)
  expect(container.querySelectorAll('.steam').length).toBeGreaterThan(0)
})

it('shows latte art, foam and a straw when the order has them', () => {
  const { container: cafe } = render(<Cup cup="cafe-cup" colour="#b98a5c" extras={{ ...none, latteArt: true }} />)
  expect(cafe.querySelector('.latte-art')).toBeInTheDocument()
  const { container: mug } = render(<Cup cup="mug" colour="#9db06a" extras={{ ...none, foam: true }} />)
  expect(mug.querySelector('.foam')).toBeInTheDocument()
  const { container: tall } = render(<Cup cup="tall-glass" colour="#9a6644" extras={{ ...none, ice: true, straw: true }} />)
  expect(tall.querySelector('.straw')).toBeInTheDocument()
})
