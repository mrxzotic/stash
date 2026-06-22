# Tuckio Design Rules

Primary surface: a compact in-page Tuckio widget for saving products from any shop.

- Base radius is `8px` for panels, cards, buttons, inputs, images, popovers, toasts, and framed controls.
- Category filters are true rounded pills.
- Default categories are Tops, Bottoms, Outerwear, Shoes, Bags, and Accessories.
- Do not add layout/background underneath standalone values such as totals.
- Search and settings are bare icon buttons: clickable area is fine, but no visible border, fill, or shadow.
- Search is inline: clicking the search icon turns the top row into a single `search icon + input` row, not a dropdown. Clicking elsewhere in the widget exits search mode.
- Settings opens as a solid Apple-style grouped popover: General first, Categories second. Use custom shadcn-like controls for dropdowns and never native browser selects. Do not let product cards show through the settings menu.
- Settings menu spacing follows the 8px grid: section gaps, dropdown offsets, menu padding, and option radii must stay visibly separated, not stacked edge-to-edge.
- Delete controls are bare X icons with no visible background, border, or frame, shown only on item/image hover.
- Header figures sit on the left as `X items, Y currency`.
- Summary currency is selected in the settings dropdown and is the only currency shown.
- The summary total pill can use an iridescent translucent fill, but no shadow.
- Prices never display cents or kopecks. Round upward to the nearest whole currency unit before rendering.
- Use Inter for the widget UI and IBM Plex Mono for numeric figures/prices.
- Typography uses fixed project tokens, not ad hoc pixel sizes:
  - `--text-micro: 10px` only for tiny fallback glyphs inside source icons.
  - `--text-caption: 11px` for uppercase mono brand/source labels and section labels.
  - `--text-control: 12px` for compact buttons, toast/error secondary text, and muted price rows.
  - `--text-body: 13px` for category pills, settings rows, dropdown items, empty-state body, and standard metadata.
  - `--text-ui: 14px` for header summary, search input, card title, and confirmation title.
  - `--text-heading: 16px` for panel/popover headings and empty-state CTA title.
- Do not add raw component-level `font-size: Npx`; use the typography tokens above.
- Use restrained black/white neutrals with translucent panel backgrounds. Default background is Warm; settings can switch between White, Ice, and Warm. Keep the main surface clean; subtle mesh/noise texture is allowed only inside the top and bottom transparent fade layers.
- Product cards use a standardized full-width media slot that adopts each loaded image's natural aspect ratio, then exactly three rows: uppercase brand in IBM Plex Mono with favicon on the right, item name in Inter title case, then original site price/currency muted at 50%. Text starts immediately after the image slot. Do not show category or converted summary currency inside cards. Product images should not sit on an extra visible frame/background, but the media wrapper clips the bitmap at `8px`.
- Sale items stay minimal but visually show sale state: current site price in red, then the regular compare-at price in parentheses with strikethrough.
- Empty zero-item state is centered and uses a contour T-shirt SVG plus CTA copy.
- Product titles are stored and displayed in title case, not all caps.
- Product titles must be short commercial model names. Strip SKU/catalog/article IDs such as trailing alphanumeric codes, material/spec descriptions, availability copy, SEO tails, and share/action text from visible cards.
- Brand labels should be canonicalized when possible: strip locale/domain suffixes like `EU` and normalize known shop domains such as `tomfordfashion` to `Tom Ford`.
- Saving while the widget is open updates the widget directly, not a separate overlay.
- Saving while the widget is closed shows a clean centered confirmation with `Added:`, item image, name, price, and a small centered pill button with a link icon to open the widget.
- Search updates the item list instantly without rebuilding the full widget shell on every typed character.
- Scrollable item lists fill the full panel and pass under the header controls, with soft blurred translucent edge fades anchored to the panel edges, not a hard internal safe area.
- Re-renders from filters or icon clicks must not replay the panel entrance animation.

Shadcn status: not tied as a dependency. There is no `components.json`, Tailwind config, package setup, Radix, or shadcn install in this repo right now. The UI only follows shadcn-like constraints by hand.
