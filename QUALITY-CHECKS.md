# Redesign verification

The reference-led redesign was tested in headless Chromium over local HTTP on 17 October 2026.

## Executed and passed

- 0, 1 and 20 published items of each type at 375px, 768px and 1280px: all nine combinations passed.
- All pages, category/subcategory/tag chips, live accent-insensitive search, empty states, draft isolation, related products and conditional disclosures.
- No normal-scenario console errors, dead # links or horizontal overflow.
- Mobile menu and Escape behavior, one visible H1 and image alt attributes.
- Actual shipped empty JSON, hidden unconfigured social links and friendly fetch-failure state.
- Product-only listing and product filter persistence across category/subcategory links, tested after the final filter patch.
- Category panels render when content exists; play overlays are absent without a real video URL.
- Real bundled hero image loads; desktop header is 95px high at 1280px. Empty-state screenshot visually inspected.
- JavaScript syntax check passed. Metadata attribute order was checked against publisher patterns.

Synthetic browser-only fixtures were used for populated tests. They are not saved in live data. Product photos and category photos were not fabricated or copied from the reference.

## Not verified

- PowerShell 7/Windows PowerShell 5.1 runtime execution, authenticated Git push, live Pages deployment, DNS and HTTPS.
- Physical devices, Safari/Firefox, screen readers or a full WCAG audit.
- Actual Google Fonts loading: browser tests use the system fallback.
- Per-guide social previews without JavaScript and nested GitHub Pages 404 behavior remain documented static-host limitations.

## Visual differences from the reference

- No login, testing claims, verdict badges, ratings or Shopee logo.
- Footer year is 2026. Newsletter is a labeled non-collecting placeholder.
- Hero is an explicitly labeled AI lifestyle illustration, not a product photo.
- Category photo slots use icons until the owner supplies original photos.
- Live content arrays remain empty; sections appear only with published content.

## Browser matrix output

```text
PASS: 0 published items/type + draft sentinels; 375px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 0 published items/type + draft sentinels; 768px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 0 published items/type + draft sentinels; 1280px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 1 published items/type + draft sentinels; 375px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 1 published items/type + draft sentinels; 768px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 1 published items/type + draft sentinels; 1280px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 20 published items/type + draft sentinels; 375px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 20 published items/type + draft sentinels; 768px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: 20 published items/type + draft sentinels; 1280px; pages, chips, search, empty states, related products, disclosures, no overflow/errors.
PASS: shipped empty JSON files, missing social URLs hidden, no example JSON loaded.
PASS: fetch failure displays a friendly message without uncaught JavaScript exceptions.
```
