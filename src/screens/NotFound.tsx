import { Link } from 'react-router-dom'

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="stack">
      <h1>We couldn't find that {what}</h1>
      <p>It may have been renamed or removed.</p>
      <ul className="plain-list stack-sm">
        <li>
          <Link to="/">Go to the Kopitiam room</Link>
        </li>
        <li>
          <Link to="/cafe">Go to the Café room</Link>
        </li>
      </ul>
    </div>
  )
}
