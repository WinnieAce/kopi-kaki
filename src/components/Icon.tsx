// A small set of drawn icons in one stroke weight, matching the cup drawings. Decorative: the control
// or link they sit in always names its action in text.
const PATHS = {
  back: 'M15 18l-6-6 6-6',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20',
  // A kettle with steam, for steps with hot water.
  hot: 'M5 19h12l-1.2-8.5H6.2zM6.2 10.5a4.8 4.8 0 0 1 9.6 0M17.3 13.2l2.6-2.2M9 7.5q-1-1.2 0-2.4t0-2.4M13 7.5q-1-1.2 0-2.4t0-2.4',
  // A kitchen knife, for steps that cut.
  sharp: 'M4 20l9-9M13 11l6.5-6.5c1 2.8.2 5.6-2.6 7.6L13 11zM4 20l2.5-.5',
  tick: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6L6 18',
}

export type IconName = keyof typeof PATHS

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
