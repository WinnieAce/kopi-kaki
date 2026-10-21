import { Link } from 'react-router-dom'
import { APP_NAME, FEEDBACK_URL } from '../config'

export function Terms() {
  return (
    <article className="stack prose">
      <h1>Terms and privacy</h1>

      <h2>Your privacy</h2>
      <p>
        {APP_NAME} has no accounts and uses no cookies. No personal data is collected. Everything you save stays on this
        device, in this browser, and is never sent anywhere.
      </p>
      <p>Clearing this browser's data erases what you have saved. You can keep a copy with the backup option in Settings.</p>
      {FEEDBACK_URL && (
        <p>
          The feedback form does not ask for names or email addresses. Please leave out anything that identifies you or
          anyone else.
        </p>
      )}

      <h2>Using the app</h2>
      <p>Recipes are guidance only. Taste as you go and adjust to suit you.</p>
      <p>
        Caffeine figures are estimates: they vary with the brand and with how a drink is brewed. Caffeine affects children
        more strongly than adults.
      </p>
      <p>
        Allergen notes cover the usual ingredients. Check the label of what you actually use, because brands differ.
      </p>
      <p>Hot water, steam and knives can hurt. Younger cooks should ask an adult to help with them.</p>

      <p>
        <Link to="/settings">Back to Settings</Link>
      </p>
    </article>
  )
}
