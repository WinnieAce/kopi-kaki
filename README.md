# Kopi Kaki

A free, installable web app about non-alcoholic drinks, for a general audience including children.

- **Kopitiam room:** build a kopitiam order (O, C, Kosong, Siew Dai, Gau, Po, Di Lo, Peng) and see what every
  word means, then make exactly that order at home.
- **Café room:** café coffee, tea and matcha, each with a step-by-step recipe.
- Caffeine for every order, allergens (dairy, soy, gluten, nuts) and cautions for hot water and knives.
- Works offline after the first visit. No accounts, no cookies, no personal data.

The design is in [`docs/superpowers/specs`](docs/superpowers/specs) and the build plan in
[`docs/superpowers/plans`](docs/superpowers/plans). It started from First Pour, the owner's cocktail app, whose
engine and motion work were ported module by module with everything alcohol-related left behind.

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with live reload |
| `npm test` | Runs all tests once |
| `npm run validate-content` | Checks the drink, ingredient and term files |
| `npm run fonts` | Cuts the Chinese font down to the characters the content uses |
| `npm run build` | Validates content, cuts the font, type-checks and builds into `dist` |
| `npm run preview` | Serves the built app, including offline support |
| `npm run lint` | Lints the code |
| `npm run icons` | Makes the app icons from `public/favicon.svg` |

## How it is organised

| Folder | Responsibility |
| --- | --- |
| `src/content` | Drinks, ingredients and terms as JSON, the ordering choices, the schema, validation and content guards |
| `src/core` | Pure logic: resolving an order from its choices, measures, caffeine, allergens, search, the daily shelf |
| `src/storage` | Saving data on the device, tidying it against the content, backup export and import |
| `src/theme` | The seven café colour schemes and the Kopitiam room's marble and jade, light and dark |
| `src/screens` | One file per screen |
| `src/components` | Pieces shared between screens: cups, the choice row, the layout |

`src/core` knows nothing about screens or storage. Storage sits behind the `UserDataStore` interface in
`src/storage/store.ts`; account sync would be a second implementation of it.

## Add or change content

Content lives in three files in `src/content`: `ingredients.json`, `drinks.json` and `terms.json`. The fields are
defined in `src/content/schema.ts`; the ordering choices (milk, strength, sugar, temp) are in `src/content/choices.ts`.

**An ingredient** has one `unit` (ml, g, tsp, tbsp or piece) used everywhere it appears, its allergens, and its
caffeine per unit (`caffeineMg`). Any caffeine figure above zero needs a `caffeineSource` saying where it comes from.

**A café drink** has fixed ingredients and steps. **A kopitiam drink** also lists the choices it offers and their
defaults, and can mark lines and steps with:

- `role`: `sweet` lines scale with the sugar choice, `strong` lines with Po and Gau, and `dilute` lines (added water)
  with Po and Di Lo. A drink offers Di Lo exactly when it has a `dilute` line.
- `when`: a line or step that only applies to some choices, such as `{ "temp": ["peng"] }`.
- `blocked`: pairs that cannot go together, with the reason shown to the person, such as Kosong with condensed milk.

**Every step** that mentions boiling, simmering, steam, a kettle, hot water or hot milk needs `"caution": "hot"`;
every step that mentions a knife or cutting needs `"caution": "sharp"`.

**Chinese** appears only on kopitiam drink names (`chinese`) and the room's signboard. After adding or changing a
Chinese name, run `npm run fonts` so the cut-down font includes it.

Then run `npm run validate-content` and `npm test`. The tests resolve every combination of every drink's choices and
fail on anything broken: a missing caution, an ingredient not used in a step, a caffeine figure without a source, or
any word that would bring alcohol in (rum, liqueur, extract and so on).

## Colours and accessibility

Palettes live in `src/theme/palettes.ts`. A test checks every palette, light and dark, against WCAG 2.1 AA (4.5:1 for
text, 3:1 for field and button edges), so `npm test` fails if a colour change makes text hard to read. Every screen
also has an automated accessibility check.

## Deploy

The app is a folder of static files and can be hosted anywhere. On Cloudflare, connect the repository with build
command `npm run build` and output directory `dist`. Addresses such as `/kopitiam/kopi?milk=o` must fall back to
`index.html`.

While the app is shared with friends and family, `public/robots.txt` asks search engines not to index it. To show the
"Send feedback" link, set `FEEDBACK_URL` in `src/config.ts` to a form that asks for no names or email addresses.

## Updates and offline use

After the first visit the whole app is cached on the device. A new version downloads in the background and takes
over only once every tab of the app has been closed, so the app never changes under someone in the middle of a recipe.
