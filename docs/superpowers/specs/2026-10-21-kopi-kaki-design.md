# Kopi Kaki — design spec

Date: 2026-10-21
Status: awaiting review
Working name: Kopi Kaki ("coffee buddy"). Check it against existing cafés before any public launch.

## 1. Purpose

A free, installable web app about non-alcoholic drinks, for a general audience that includes children. It
has two rooms: a **Kopitiam** room for Singapore kopitiam drinks and a **Café** room for café coffee, tea
and matcha. Both jobs matter equally:

- **Ordering out.** Learn the kopitiam ordering language (O, C, Kosong, Siew Dai, Gau, Po, Peng and so on)
  by building an order and seeing what every word means.
- **Making at home.** Make exactly that order, or any café drink, by following a step-by-step recipe.

**Target user.** Singapore locals, including children and teenagers, who grew up around kopitiams. They know
the setting but not every term, and want to recreate their favourites at home. The app takes the kopitiam
for granted and spends its words on the finer distinctions.

**Starting point.** The engine and motion work of First Pour, the owner's cocktail app, ported module by
module into this new repository. Nothing alcohol-related is carried over. The look is new.

**Release.** Friends and family first, shared privately for feedback. A public launch later goes through
its own checklist.

## 2. Success criteria

1. A local can build their usual kopitiam order and see what each word means in under a minute.
2. They can make that order, or a café drink, at home using making mode alone, without looking anything up.
3. Before sharing widely, at least one young person (with a parent present) and a few adults have used a
   working build, and what tripped them up has been fixed or consciously deferred.

## 3. Scope

### In the first release

1. Kopitiam room with the order builder
2. Kopitiam words (glossary)
3. Café room
4. Drink pages and making mode
5. Saved drinks and a "usual" order
6. Settings, backup, terms and privacy
7. Offline use and installation

### Not in the first release

- A pantry or "what can I make" matching (dropped).
- Ordering through the app, and so no takeaway choice (Dabao is taught as a word only).
- Café ordering modifiers (oat milk, extra shot, less sweet). Café drinks are fixed recipes.
- Accounts, sync, usage counts, user-submitted recipes, ratings, sharing.
- Haptics and sound.
- Photographs. Every drink is drawn.

## 4. Features

### 4.1 Navigation

A bottom bar with four tabs: **Kopitiam · Café · Saved · Settings**. Every inner page has its own Back
button (an installed app has no browser back). Addresses:

| Address | Screen |
|---|---|
| `/` | Kopitiam room |
| `/kopitiam/:id?milk=…&strength=…&sugar=…&temp=…` | Kopitiam drink page with its order builder |
| `/kopitiam/:id/make?…` | Making mode for that exact order |
| `/words` (with `#term` anchors) | Kopitiam words |
| `/cafe` | Café room |
| `/cafe/:id`, `/cafe/:id/make` | Café drink page, making mode |
| `/saved`, `/settings`, `/terms` | Saved, Settings, Terms and privacy |
| anything else | Not found, with links to both rooms |

Builder choices live in the address so Back returns to exactly the same order, and making mode makes it.

### 4.2 Kopitiam room

- Signboard header ("KOPITIAM 咖啡店", vermilion seal), mosaic strip.
- **Your usual**, once set: its cup, its name and a "Make it" link.
- Search box ("Search drinks or words"), searching drink names, Chinese names and term words.
- Filter chips: **All · Kopi · Teh · Malt · Cooling · No caffeine**. The row scrolls sideways with faded
  edges on narrow phones.
- The menu, grouped: **Kopi**, **Teh**, **Malt and chocolate**, **Cooling drinks**.
  Each row: the drink's usual cup, its name, its Chinese name where it has one, and its caffeine level in
  words. Named specials (Milo Dinosaur) are menu items of their own.
- A link to Kopitiam words.

### 4.3 Kopitiam drink page: the order builder

Top of the page, in order:

1. **The cup**, which follows the choices: the Peng glass with ice for Peng, otherwise the drink's own cup.
   The drink's colour follows the milk choice.
2. **The name** as it would be ordered ("Kopi C Gau Siew Dai Peng") with the Chinese name beneath where the
   drink has one, and a plain line of what it means ("Coffee · evaporated milk · stronger · less sweet ·
   iced").
3. **Choice rows**, only those the drink accepts. Labels in their own column; each row is a raised-pill
   segmented control (see 7.4). An option that cannot go with the current choices is faded and cannot be
   picked; tapping it shows why (see 6.1).
4. **Caffeine** for this order, and the High note where it applies (6.3).
5. **Make this at home**, and **Make this my usual** / **Save**.

Below: what each chosen word means (linking to Kopitiam words), ingredients with measures for this exact
order, tools with alternatives, allergens, and the "about" text.

### 4.4 Kopitiam words

One page listing every ordering term (O, C, Kosong, Siew Dai, Ga Dai, Gau, Po, Di Lo, Peng, Dabao / Ta
Pau, Tak Kiu and others) and key ingredients (kopi powder, condensed milk, evaporated milk). Each entry:
the word, other spellings, meaning, where the word comes from, and an example
order with a link that opens the builder set to that order. Terms in the builder link to their entry.
Names always use **Peng**; Beng appears only as another spelling in the Peng entry. Dabao is taught here
as a word for ordering in person; it is not a builder choice.

### 4.5 Café room

- A greeting in the display font, chosen by the hour.
- **Today's cups**: a swipeable shelf, favourites first, then three easy drinks from each group that
  change at local midnight (First Pour's daily shelf). The cups tip with the swipe while the drink stays level.
- Filter chips **All · Coffee · Tea and matcha · No caffeine**, search, and the menu.

### 4.6 Café drink page

First Pour's drink page, adapted: the cup glides in from the list, then the name, caffeine, the "about"
text, ingredients with measures, tools with alternatives, allergens, **Make this at home** and **Save**.

### 4.7 Making mode

Ported from First Pour. A gather screen (ingredients, cup, tools with alternatives), then one step per
screen with large text, swipe or Next/Back, the screen kept awake, and servings 1 to 8 scaling every
measure. Steps with a caution show it on the step (6.5). For a kopitiam drink it makes the exact order in
the address.

### 4.8 Saved

Saved café drinks and saved kopitiam orders, each showing its cup and name. A saved order keeps its
choices. Removing one is immediate, with **Undo** for 5 seconds. The usual order is marked.

### 4.9 Settings

- Theme: device, light or dark.
- Café colour scheme: seven schemes (7.2). The Kopitiam room always uses marble and jade.
- Backup: **Export** downloads `kopi-kaki-backup-YYYY-MM-DD.json`; **Import** restores one after an
  in-page confirmation. A reminder that clearing browser data erases saved drinks.
- Terms and privacy link. A feedback link, shown only once `FEEDBACK_URL` is set.

### 4.10 Terms and privacy

States: no accounts, no cookies, no personal data; everything stays on the device; caffeine figures are
estimates; allergen flags are a guide and labels must be checked; younger cooks should ask an adult to help
with hot water and knives; the feedback form (when present) does not ask for names or email addresses.

## 5. Content

### 5.1 Principles

- All text is original. Plain language; any term is explained where it first appears.
- Drawn cups only, no photographs.
- No alcohol anywhere, including hidden sources (5.6).
- Content is drafted, then reviewed by the owner drink by drink and term by term before sharing.
- Chinese characters appear on drink names only, never on ordering terms, and ship only once the owner
  has confirmed them. A drink without a common Chinese name shows none.

### 5.2 Files

`src/content/ingredients.json`, `drinks.json`, `terms.json`, validated at build time against
`src/content/schema.ts`. Ordering choices are defined once in `src/content/choices.ts`.

### 5.3 Ingredient record

| Field | Notes |
|---|---|
| `id`, `name`, `description` | As First Pour |
| `category` | `coffee`, `tea`, `malt-and-chocolate`, `milk`, `sweetener`, `flavour`, `fresh`, `staple` |
| `unit` | `ml`, `g`, `tsp`, `tbsp` or `piece`. Every use of the ingredient is in this unit. |
| `caffeineMg` | Milligrams of caffeine per one `unit` as it ends up in the cup. 0 if none. |
| `caffeineSource` | Required when `caffeineMg` > 0: where the figure comes from |
| `allergens` | Any of `dairy`, `soy`, `gluten`, `nuts` (nuts includes peanuts) |
| `substitutes` | Ingredient ids acceptable in its place, one level only |
| `colour` | The ingredient's own colour |
| `termId` | Optional: its entry in Kopitiam words |

### 5.4 Drink record

| Field | Notes |
|---|---|
| `id`, `name` | As First Pour. `words` is reserved and cannot be a drink id. |
| `chinese` | Optional Chinese name, kopitiam drinks only. The only place Chinese appears besides the header. |
| `room` | `kopitiam` or `cafe` |
| `group` | Kopitiam: `kopi`, `teh`, `malt-and-chocolate`, `cooling`. Café: `coffee`, `tea-and-matcha`. |
| `cup` | `kopitiam-cup`, `peng-glass`, `cafe-cup`, `tall-glass`, `mug` |
| `colour` | The finished drink's colour, with optional overrides per milk option |
| `difficulty` | `easy`, `medium`, `harder` (used by the daily shelf) |
| `choices` | Kopitiam only. For each choice group the drink accepts: the allowed options and the default. |
| `blocked` | Option pairs that cannot go together, each with the reason shown to the user |
| `ingredients` | `{ ingredientId, amount, optional, note?, role?, when? }` |
| `steps` | `{ text, technique?, ingredientIds, caution?, when? }` |
| `tools` | `{ name, alternative }` |
| `meaning` | A few words for the builder's meaning line ("Coffee", "Pearl barley water") |
| `about` | 2–4 sentences: what it is and why it tastes the way it does |

`role` is one of `sweet`, `strong`, `dilute`. `when` limits a line or step to certain choices, for example
`{ "milk": ["c"] }` or `{ "temp": ["peng"] }`. `caution` is `hot` or `sharp`.

### 5.5 Choices and terms

Choice groups and their options, defined once in `choices.ts`. A drink allows a subset of each group.

| Group | Options (word in the name; empty means no word) |
|---|---|
| `milk` | `condensed` (—), `o` (O), `c` (C), `milk` (—, for Milo and Horlicks) |
| `strength` | `po` (Po), `normal` (—), `gau` (Gau), `di-lo` (Di Lo) |
| `sugar` | `kosong` (Kosong), `siew-dai` (Siew Dai), `normal` (—), `ga-dai` (Ga Dai) |
| `temp` | `hot` (—), `peng` (Peng) |

Each option also has a plain meaning ("evaporated milk", "less sweet") and a `termId`. Terms
(`terms.json`) have `id`, `word`, `also` (other spellings, such as Beng), `meaning`, `origin`,
`example` (a drink id with choices).

Draft choices per drink (for owner review):

| Drink | Milk | Strength | Sugar | Temp | Blocked |
|---|---|---|---|---|---|
| Kopi, Teh | condensed*, o, c | po, normal*, gau, di-lo | all four, normal* | hot*, peng | condensed + kosong |
| Yuan Yang, Teh Halia | condensed*, o, c | normal*, di-lo | all four, normal* | hot*, peng | condensed + kosong |
| Teh Tarik | — | normal*, di-lo | siew-dai, normal*, ga-dai | hot*, peng | — |
| Milo, Horlicks | milk*, o | normal*, gau, di-lo | all four, normal* | hot*, peng | milk + kosong |
| Barley, Water Chestnut, Chrysanthemum, Soya Bean Milk | — | normal*, di-lo | all four, normal* | hot, peng* | — |
| Bandung | — | normal*, di-lo | siew-dai, normal*, ga-dai | hot, peng* | — |
| Lime Juice | — | normal*, di-lo | all four, normal* | — (always iced) | — |
| Milo Dinosaur | — | — | — | — | — |

`*` marks the default. Kosong is never offered with condensed milk (or with Milo and Horlicks made with
milk), so a plain "Kopi Kosong" can never be built; Kopitiam words explains that, said aloud, it is taken
to mean Kopi O Kosong.

**Di Lo** means undiluted: no water added after brewing or mixing. Every kopitiam drink whose recipe adds
water (a `dilute` line) offers it, and only those drinks: a content test checks both directions. The table
assumes every drink above except Milo Dinosaur adds water; a drink whose final recipe adds none loses the
option. Di Lo shares the strength row with Po and Gau because they are alternatives: an order is one of
Po, Normal, Gau or Di Lo.

### 5.6 No alcohol

- The schema has no field that can express alcohol.
- A content test scans every text field (names, descriptions, notes, steps, about, terms) for alcohol words,
  matching whole words only: alcohol, rum, wine, beer, stout, shandy, liqueur, liquor, brandy, whisky,
  whiskey, vodka, gin, tequila, sake, soju, mirin, bitters, extract, cocktail, spirit, spirits. "Extract" on
  the list means flavourings come as syrups or powders (vanilla syrup, not vanilla extract).
- A source test fails if `abv`, `alcohol`, `AgeGate` or `ResponsibleNotice` appears in `src/` outside the
  guard tests themselves.

### 5.7 Launch content (draft for owner edit)

**Kopitiam (14):** Kopi, Teh, Yuan Yang, Teh Tarik, Teh Halia, Milo, Milo Dinosaur, Horlicks, Barley,
Water Chestnut, Chrysanthemum, Lime Juice, Bandung, Soya Bean Milk.

**Café (14):** Long Black, Latte, Cappuccino, Flat White, Mocha, Iced Latte, Babyccino (frothed milk, no
caffeine); Matcha Latte, Iced Matcha Latte, Hojicha Latte, Chai Latte, London Fog, Iced Lemon Tea, Rooibos
Latte (no caffeine).

Recipes follow the authentic method for each drink (a kopi sock for kopi, espresso for café coffee) and
every tool lists a household alternative (a fine sieve or kopi bag; a moka pot or strong instant coffee).
Bandung's alcohol-free recipe is recovered from First Pour's history (`git show 13ee70b:src/content/drinks.json`).

## 6. Core logic rules

All in `src/core`, pure functions with no knowledge of screens or storage.

### 6.1 Resolving an order

`resolveOrder(drink, requested)` returns `{ choices, name, meaning, lines, steps, cup, colour, notes }`.

1. **Choices.** Start from the drink's defaults; apply each requested choice the drink allows; ignore
   anything else. If the result contains a blocked pair, the later-group option in the pair falls back to
   its default and the block's reason is added to `notes` (Kosong with condensed milk becomes Normal).
2. **Lines.** Keep ingredient lines whose `when` matches. Scale by role: `sweet` × sugar factor (kosong 0,
   siew-dai 0.5, normal 1, ga-dai 1.5); `strong` × strength factor (po 0.75, normal 1, gau 1.4, di-lo 1);
   `dilute` × water factor (po 1.3, normal 1, gau 1, di-lo 0). Lines scaled to 0 are removed. For plain
   Kopi the `sweet` line is the condensed milk itself.
3. **Steps.** Keep steps whose `when` matches. Drop a step that lists ingredients if all of them were
   removed.
4. **Name.** The drink name, then the word of each chosen option, in group order milk, strength, sugar,
   temp. An option adds its word whenever it has one, including defaults ("Barley Peng").
5. **Meaning.** The drink's short meaning, then each chosen option's meaning, skipping empty ones.
6. **Cup.** `peng-glass` when temp is peng; otherwise the drink's `cup`.
7. **Colour.** The drink colour, or its override for the chosen milk option.

Café drinks have no choices and resolve to their fixed recipe through the same function.

### 6.2 Measures

- Units: `ml`, `g`, `tsp`, `tbsp`, `piece`. Scaling multiplies by servings (1–8).
- ml: nearest 2.5 below 30, nearest 5 from 30 up, minimum 2.5 (First Pour's rule).
- g: whole grams from 10 up, nearest 0.5 below 10, minimum 0.5.
- tsp, tbsp, piece: nearest quarter, written with ¼ ½ ¾, minimum ¼. "1 tbsp", "2 tbsp", "½ tsp", "1 tea bag".
- A non-zero amount never shows as zero.

### 6.3 Caffeine

- Caffeine of an order = Σ (amount × ingredient `caffeineMg`) over the resolved lines, per serving,
  including optional lines.
- Display: 0 → "No caffeine". Otherwise "about N mg", N rounded to the nearest 5 below 20 mg and the nearest
  10 from 20 mg up, never below 5.
- Level: **None** 0 · **Low** under 40 · **Medium** 40–99 · **High** 100 and over (on the unrounded value).
- Every figure is labelled as an estimate that varies by brand and brewing.
- On High drinks only, one neutral note: caffeine affects children more strongly, and a Po order, a smaller
  cup or a caffeine-free drink may suit them better. The app never asks anyone's age.
- The No caffeine filter includes only drinks whose default order is exactly 0 mg. Milo shows Low, with a
  note that the caffeine comes from cocoa.

### 6.4 Allergens

An order's allergens are the union of its resolved lines' allergens, including optional lines, in the order
dairy, soy, gluten, nuts. So Kopi O shows no dairy and Kopi C shows dairy. Always followed by: check the
label, as brands differ (some "evaporated milk" is a creamer that can contain soy).

### 6.5 Cautions

A step with `caution: "hot"` shows "Hot: take care. Younger cooks, ask an adult to help." A step with
`caution: "sharp"` shows "Ask an adult to help with the knife." Teh Tarik's pulling step also suggests
practising with cool water first.

### 6.6 Search and filters

First Pour's `normalise` (case, accents, punctuation, spacing). A drink matches a query if it appears in its
name, Chinese name, ingredient names, or the words of its options. Filters: room, group, No caffeine,
combined with AND. Results sorted by menu order within each group.

### 6.7 Daily shelf

First Pour's `dailyStarters`, per room: three easy drinks from each group (one would give the Café room's
two groups only two cups), moving on each local midnight, the same all day and on every phone. The café shelf shows saved café drinks first, then the day's picks, up to 8.

## 7. Look and motion

### 7.1 Two rooms

The app marks the current room on the page root (`data-room="kopitiam" | "cafe"`) and each room supplies
its own colour variables. Switching rooms is a 200 ms cross-fade with an 8 px drift in the direction of the
tab, and a plain cross-fade under reduced motion. Light and dark changes cross-fade too.

### 7.2 Palettes

Every palette below passed WCAG AA when derived (text 4.5:1, field and button edges 3:1) and is enforced by
`src/theme/palettes.test.ts`.

**Kopitiam: marble and jade.** No veining: plain marble colour.

| Token | Light | Dark |
|---|---|---|
| bg (marble) | `#f1efe9` | `#191612` |
| surface | `#faf9f6` | `#241f1a` |
| text | `#2b1d14` | `#f1ebe1` |
| muted | `#5f4c3f` | `#b9ab9a` |
| line | `#dcd6cb` | `#3a332b` |
| controlLine | `#8f8578` | `#8a8072` |
| accent (jade) | `#2b6655` | `#79b9a3` |
| onAccent | `#ffffff` | `#10201a` |
| header (teak) | `#4b2f20` | `#2a1a11` |
| onHeader | `#f4ecdf` | `#f1e2c8` |
| seal (vermilion) | `#a63d27` | `#a63d27` |
| track / pill / onPill | `#ebe6de` / `#fffdf8` / `#1f4f42` | `#2c2620` / `#3a332b` / `#cfe7dc` |

The mosaic strip repeats jade, cream and vermilion tiles. Cups stay porcelain white in both modes.

**Café: seven schemes**, from the owner's boards. Each board's own colours make the background, lines and
glow; text, accent and control edges are darkened only as far as AA needs. Warm neutrals was merged into
Kopi (Kopi's values kept). Kopi is the default.

| Scheme | Light bg / surface / text / muted / line / controlLine / accent / glow | Dark bg / surface / text / muted / line / controlLine / accent / glow |
|---|---|---|
| Kopi | `#f5f1ea` `#fbf9f6` `#4a342a` `#644737` `#d7c9b8` `#99877a` `#7d5a44` `#d7c9b8` | `#1c1410` `#31221c` `#f5f1ea` `#d7c9b8` `#413832` `#786d63` `#d7c9b8` `#3e2d22` |
| Barley | `#f6f0e6` `#fbf8f4` `#3b3128` `#6b5b4d` `#e0d1b8` `#968977` `#7d6a5b` `#efe3ce` | `#16130f` `#27211a` `#f6f0e6` `#e0d1b8` `#3e3931` `#736b5d` `#efe3ce` `#443b32` |
| Shophouse | `#f1eee8` `#f9f7f5` `#3a2a1a` `#755837` `#dbc4a5` `#9b866d` `#876640` `#e0ab7f` | `#16100a` `#261c11` `#f1eee8` `#dbc4a5` `#3d3429` `#746654` `#e0ab7f` `#4c3924` |
| Matcha | `#f3ede5` `#faf7f3` `#33332a` `#626253` `#dac4b0` `#948778` `#6d6d5c` `#bcbaa8` | `#131310` `#21211c` `#f3ede5` `#dac4b0` `#3b3630` `#74695d` `#bcbaa8` `#3f3f35` |
| Bandung | `#f7efea` `#fbf8f6` `#3d2824` `#826459` `#dfc6ba` `#9d857c` `#84665b` `#dfc6ba` | `#170f0e` `#281a18` `#f7efea` `#dfc6ba` `#3f3430` `#75655f` `#dfc6ba` `#54423a` |
| Peng | `#f5efe7` `#fbf8f4` `#262c30` `#535a5e` `#d7d0c4` `#8b8984` `#676e72` `#b6b9b8` | `#0e1112` `#191d20` `#f5efe7` `#d7d0c4` `#363736` `#696863` `#b6b9b8` `#363b3d` |
| Gula Melaka | `#f5ede4` `#fbf7f3` `#503523` `#7b5036` `#cfb59d` `#9f846f` `#946041` `#bf9377` | `#1e140d` `#352317` `#f5ede4` `#cfb59d` `#41342a` `#806d5d` `#bf9377` `#4e3222` |

onAccent is `#ffffff` in light and the dark bg in dark. Every palette also carries First Pour's `good`,
`warnBg` and `warnText` tokens (used for "No caffeine", the caffeine note and step cautions), shared by
all eight palettes: light `#2b6655`, `#f6ecd8`, `#5a3d12`; dark `#79b9a3`, `#3d2c12`, `#f3d9a6`.
`palettes.test.ts` checks every pairing the app uses.

### 7.3 Type

- **Body, everywhere:** Figtree.
- **Kopitiam display:** Noto Serif Bold (KOPITIAM in tracked capitals, drink names); Noto Serif SC Black for
  Chinese.
- **Café display:** Young Serif.
- Display sizes tightened by about −0.012em; small uppercase labels tracked positively; sizes in rem so the
  layout follows the phone's text size.
- All fonts self-hosted. Noto Serif SC is cut at build time to only the characters in the content (8.4).
- Chinese text is marked `lang="zh-Hans"`. No faux-Chinese lettering for Latin text.

### 7.4 Components

- **Cups** (`Cup.tsx`): ink-line drawings (outline with flat colour), in a 64 × 64 view box: kopitiam cup on
  saucer (jade band, vermilion rim line), Peng glass with handle and ice, café cup on saucer with latte art,
  tall glass, mug. Each cup's base rests on the centre line of its saucer, with no foot. Ice, steam, foam
  and straw come from the resolved order (`cupExtras.ts`), as First Pour's glass extras did.
- **Choice row** (`ChoiceRow.tsx`): a native radio group with the label as its legend. Drawn as a 34 px
  sand track with no dividers and a white raised pill for the chosen option; each option keeps a 44 px tap
  area. Labels sit in their own column sized in em; when the builder is narrow or text is enlarged, labels
  move above their rows. A blocked option is faded and `aria-disabled`; tapping it opens a callout anchored
  to it with the reason, closing on the next tap or after 5 seconds, announced as a status.
- **Bottom bar:** translucent with background blur, content scrolling beneath, a soft fade at its edge
  instead of a line; solid under reduced transparency or increased contrast. The sliding tab highlight is
  First Pour's.
- Press feedback on everything pressable (scale 0.97 on press, 100 ms). Hover effects only for a fine
  pointer. Drawn icons only, no emoji or symbol characters. Themed selection, caret and scrollbars.

### 7.5 Motion

| Moment | Behaviour | Reduced motion |
|---|---|---|
| Choice pill | CSS transform, 200 ms, `cubic-bezier(.23,1,.32,1)`, interruptible | Instant |
| Cup swap in the builder | Enter 220 ms (opacity, scale .96→1, blur 2px→0); exit 150 ms; drink colour 200 ms | 150 ms opacity cross-fade |
| Drink name | Changes instantly | Same |
| Blocked-option callout | Grows from the option: opacity and scale .97→1, 150 ms; closes faster | Opacity only |
| Room switch | 200 ms cross-fade with 8 px drift toward the tab | Cross-fade |
| List → drink page | The cup glides into the drink page and back (view transitions) | Instant |
| Café shelf | Cups tip with swipe speed on a timed spring, drink stays level; tiles stagger in once (40 ms) | No tilt, no stagger |
| Making-mode steps | Swipe with momentum projection, as First Pour | As First Pour |
| Steam, ice, bubbles | Loop for 5 seconds then rest; wake on touch; pause off-screen | Static |
| Tab highlight | Motion spring, no bounce, 0.35 s | Instant |
| Usual / save feedback | Button becomes "Your usual" with a drawn tick | Same, no scale |

Easing tokens: `--ease-out: cubic-bezier(.23,1,.32,1)`, `--ease-in-out: cubic-bezier(.77,0,.175,1)`. Only
transform and opacity animate, apart from the cup fill colour. Motion (the library) is used only for the
tab highlight and making-mode swipes.

## 8. Technical design

### 8.1 Approach

A static single-page app with content bundled in; all logic in the browser; no server. A new git repository,
ported from First Pour module by module, each through tests.

Rejected: forking First Pour (alcohol threads through its schema, fixtures and history) and a shared engine
package (restructures a live app for sharing the two engines would soon outgrow).

### 8.2 Reuse map

| | Modules |
|---|---|
| Ported unchanged | `core/swipe.ts`, `hooks/loopRest.ts`, `hooks/shelfMotion.ts`, `hooks/viewTransition.ts`, `hooks/useWakeLock.ts`, `test/setup.ts` |
| Ported and adapted | `core/measures.ts` (new units, no oz), `core/allergens.ts`, `core/search.ts`, `core/dailyShelf.ts`, `core/extras.ts` → `core/cupExtras.ts`, `core/labels.ts`, `content/schema.ts` and `validate.ts`, `storage/*`, `theme/*`, `components/Layout.tsx`, `GlassLink.tsx` → `CupLink.tsx`, `Icon.tsx`, `Measure.tsx`, `screens/MakingMode.tsx`, `Settings.tsx`, `Terms.tsx`, `NotFound.tsx` |
| New | `content/choices.ts`, `terms.json`, `core/order.ts`, `core/caffeine.ts`, `components/Cup.tsx`, `ChoiceRow.tsx`, `screens/KopitiamRoom.tsx`, `OrderPage.tsx`, `Words.tsx`, `CafeRoom.tsx`, `CafeDrinkPage.tsx`, `Saved.tsx`, `scripts/subset-chinese-font.ts` |
| Left behind | `core/matching.ts`, `core/strength.ts`, `screens/MyBar.tsx`, `IngredientPage.tsx`, `AgeGate.tsx`, `components/ResponsibleNotice.tsx`, `GlassIcon.tsx`, First Pour's palettes, fonts and content |

A code graph of First Pour's `src` is in `graphify-out/` (git-ignored) for looking up dependencies while
porting.

### 8.3 Saved user data

```
{
  version: 1,
  saved: { drinkId: string, choices: Record<string, string> }[],   // café drinks: {}
  usual: { drinkId: string, choices: Record<string, string> } | null,
  settings: { theme: "system" | "light" | "dark", scheme: CafeScheme }
}
```

Stored in IndexedDB behind First Pour's `UserDataStore` interface, with a migrations map ready for version 2.
On load: saved drinks that no longer exist are removed; a choice a drink no longer offers falls back to its
default; duplicates are merged; a usual whose drink is gone is cleared. The export file is this object as
JSON. The last theme choice is also cached in `localStorage` to avoid a flash of default colours.

### 8.4 Chinese font subset

`scripts/subset-chinese-font.ts` runs before every build: it collects every CJK character in the content
and fixed UI text, and writes a woff2 containing only those glyphs from Noto Serif SC Black. A test fails if
any CJK character in the content or UI is missing from the subset. The full font never ships.

### 8.5 Tools

TypeScript, React, Vite, React Router, Zod, idb-keyval, Motion, vite-plugin-pwa, Vitest, Testing Library,
fake-indexeddb, axe-core, oxlint, a font subsetting library, Fontsource packages for Figtree, Young Serif and
Noto Serif. Hosting on Cloudflare, building from GitHub.

## 9. Error handling

- **Storage unavailable:** works for the session; a notice says changes won't be saved.
- **Saved data:** unknown drinks pruned; invalid choices fall back to defaults; usual cleared if its drink
  is gone; older versions migrated.
- **Import:** invalid or newer-version files rejected with a clear message and existing data untouched; a
  valid file replaces data only after an in-page confirmation.
- **Addresses:** an unknown or blocked choice in an address is resolved by 6.1, never an error; an unknown
  page or drink shows Not found with links to both rooms.
- **Build:** malformed content, a broken reference, an alcohol word, a missing caution, a caffeine figure
  without a source, or a Chinese character missing from the font subset fails the build.
- **Offline on the very first visit:** the browser's own offline page; after one visit everything works
  offline except the feedback link.

## 10. Non-functional requirements

- **Performance:** first screen usable within 2 seconds on a mid-range phone on 4G; resolving an order,
  search and filters respond within 100 ms.
- **Offline:** after the first visit, every feature except the feedback link works with no connection.
  Updates download in the background and apply on next open, never mid-recipe.
- **Usability:** phone first; checked at 360 and 375 px wide and on desktop; tap targets at least 44 × 44
  px; making mode readable at arm's length.
- **Accessibility:** WCAG 2.1 AA in every palette, light and dark; screen reader labels; full keyboard use
  (choice rows as radio groups); respects text size, reduced motion, reduced transparency and increased
  contrast; looping motion rests within 5 seconds.
- **Privacy:** no accounts, cookies, personal data, analytics or runtime requests to other hosts. Nothing
  entered leaves the device.
- **Safety:** cautions on hot and sharp steps; allergen and caffeine guidance; no alcohol.
- **Maintainability:** content separate from code and validated at build time; core, storage and content
  covered by tests; saved data versioned.
- **Cost and compatibility:** no running cost; current and previous major versions of Chrome, Safari,
  Firefox and Edge on phones and desktops.
- **Search engines:** `robots.txt` disallows all crawling during friends and family.

## 11. Testing

Tests first, then the code. `npm test`, `npm run lint` and `npm run build` pass before every commit.

- **Core:** `resolveOrder` (defaults, allowed and ignored choices, blocked pairs and their notes, roles and
  factors, lines dropped at zero, `when` on lines and steps, step dropping, names including default words,
  cup and colour), caffeine (sums, rounding, levels, the High note, optional lines), allergens per order,
  measures for every unit, search, filters, daily shelf.
- **Content:** every combination of every kopitiam drink resolves to a name, at least one line, every line
  used in a step, a caffeine value and an allergen list; references (ingredients, substitutes, terms,
  choices, examples) exist; a drink offers Di Lo exactly when its recipe has a `dilute` line; alcohol word
  scan; caution coverage (steps mentioning boil, boiling, kettle,
  hot water or hot milk carry `hot`; knife, cut or slice carry `sharp`); caffeine sources; reserved ids;
  Chinese font coverage; the source scan in 5.6.
- **Storage:** save and load, migration, pruning, choice fallback, usual, export and import, rejection of
  bad files, storage unavailable.
- **Theme:** contrast for all eight palettes in light and dark.
- **Screens:** builder (choices update name, meaning, cup and address; a blocked option shows its reason;
  the address restores the order), room switching, making a built order, saving, Undo, usual, settings,
  backup, an axe accessibility check on each screen.
- **By hand:** 360 and 375 px and desktop; light and dark; reduced motion; large text; keyboard only; a
  screen reader pass on the builder; offline and installed.
- **People:** the friends-and-family sessions in success criterion 3.

## 12. Risks

| Risk | Response |
|---|---|
| Terms, naming rules or Chinese characters are wrong | Owner reviews every term, rule and character before sharing; characters ship only once confirmed |
| Caffeine figures read as precise | "About", rounded, labelled as estimates, each with a recorded source |
| A child scalds themselves following a recipe | Hot and sharp cautions enforced by a content test; terms page advice |
| Allergen flags trusted over labels | "Check the label" on every allergen line |
| Chinese font bloats the offline download | Build-time subset, tested |
| The two rooms feel like two apps | Shared body font, layout, components and motion; only display type and colour differ |
| Saved drinks lost when browser data is cleared | Export and import; a reminder in settings |

## 13. Content decisions

Settled with the owner:

1. The fourth Kopitiam group is **Cooling drinks**.
2. Kosong is never offered with condensed milk, so "Kopi Kosong" cannot be built. Said aloud, it is taken
   to mean Kopi O Kosong (explained in Kopitiam words).
3. Word order is milk, strength, sugar, temp: "Kopi O Gau Kosong Peng".
4. Names use **Peng**.
5. Di Lo means undiluted and is offered by every drink whose recipe adds water (5.5).
6. The choices per drink in 5.5 and the launch list in 5.7 are agreed.
7. Chinese characters on drink names only (5.1). Drafted: Kopi 咖啡, Teh 茶, Yuan Yang 鸳鸯, Teh Tarik 拉茶,
   Milo 美禄, Horlicks 好立克, Barley 薏米水, Water Chestnut 马蹄水, Chrysanthemum 菊花茶, Lime Juice 酸柑水.
   Teh Halia, Soya Bean Milk, Bandung and Milo Dinosaur are drafted during content work; any without a
   common Chinese name show none. The owner confirms every one in the content review.

## 14. Later

- Public launch: rename check, cookie-free usage counts, opening `robots.txt`, feedback form.
- More drinks, including café drinks with their own ordering choices.
- A teh tarik pulling animation in making mode.
