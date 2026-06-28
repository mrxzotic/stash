function panelStylesChunk5() {
  return `

    .wp-brand,
    .wp-brand:link,
    .wp-brand:visited,
    .wp-brand:hover,
    .wp-brand:focus-visible {
      min-width: 0;
      color: rgba(8, 11, 16, 0.5);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-caption);
      line-height: 1.1;
      font-weight: 650;
      text-decoration: none;
      text-transform: uppercase;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-item-title,
    .wp-item-title:link,
    .wp-item-title:visited,
    .wp-item-title:hover,
    .wp-item-title:focus-visible {
      display: -webkit-box;
      min-width: 0;
      color: var(--foreground);
      font-size: var(--text-ui);
      line-height: 1.16;
      font-weight: 760;
      letter-spacing: 0;
      text-decoration: none;
      overflow: hidden;
      overflow-wrap: anywhere;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .wp-summary-brand-filter {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      max-width: 100%;
    }

    .wp-summary-brand-pill {
      height: var(--wp-pill-height);
      min-width: 0;
      max-width: min(190px, 42vw);
      display: inline-grid;
      grid-template-columns: minmax(0, 1fr) 16px;
      align-items: center;
      gap: 8px;
      padding: 0 6px 0 12px;
      border: 1px solid rgba(8, 11, 16, 0.84);
      border-radius: 999px;
      background: rgba(8, 11, 16, 0.84);
      color: var(--primary-foreground);
      font-size: var(--text-control);
      font-weight: 720;
      line-height: 1;
    }

    .wp-summary-brand-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-summary-brand-clear {
      width: 16px;
      height: 16px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: currentColor;
      opacity: 0.74;
      cursor: pointer;
    }

    .wp-summary-brand-clear:hover,
    .wp-summary-brand-clear:focus-visible {
      outline: 0;
      opacity: 1;
    }

    .wp-items.is-brand-cloud {
      align-items: center;
      justify-content: safe center;
    }

    .wp-brand-cloud {
      width: min(100%, 376px);
      display: flex;
      flex-wrap: wrap;
      align-content: center;
      align-items: baseline;
      justify-content: center;
      gap: 24px 16px;
      margin: 0 auto;
      padding: 8px 0;
    }

    .wp-brand-cloud-item {
      position: relative;
      z-index: 1;
      min-height: 32px;
      max-width: min(240px, 100%);
      padding: 2px 5px 5px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      text-align: inherit;
      appearance: none;
      cursor: pointer;
      overflow: visible;
      isolation: isolate;
      pointer-events: auto;
      translate: var(--wp-brand-cloud-x, 0) var(--wp-brand-cloud-y, 0);
      transition:
        color 160ms ease,
        opacity 160ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1),
        translate 220ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-cloud-item:nth-child(5n + 1) {
      --wp-brand-cloud-x: -8px;
      --wp-brand-cloud-y: 0;
    }

    .wp-brand-cloud-item:nth-child(5n + 2) {
      --wp-brand-cloud-x: 4px;
      --wp-brand-cloud-y: -4px;
    }

    .wp-brand-cloud-item:nth-child(5n + 3) {
      --wp-brand-cloud-x: 8px;
      --wp-brand-cloud-y: 4px;
    }

    .wp-brand-cloud-item:nth-child(5n + 4) {
      --wp-brand-cloud-x: -4px;
      --wp-brand-cloud-y: 4px;
    }

    .wp-brand-cloud-item:nth-child(5n + 5) {
      --wp-brand-cloud-x: 6px;
      --wp-brand-cloud-y: -2px;
    }

    .wp-brand-cloud.is-sort-list {
      width: min(100%, 376px);
      max-height: min(360px, calc(100svh - var(--wp-items-padding-top, 104px) - 96px));
      min-height: 0;
      flex-direction: row;
      flex-wrap: wrap;
      align-content: start;
      align-items: baseline;
      justify-content: center;
      gap: 16px;
      margin: 0 auto;
      padding: 16px 0 56px;
      overflow-x: hidden;
      overflow-y: auto;
      overscroll-behavior-y: contain;
      scroll-behavior: smooth;
      scroll-padding-block: clamp(84px, 18vh, 128px);
      scroll-snap-type: y proximity;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%);
      mask-image: linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%);
    }

    .wp-brand-cloud.is-sort-list::-webkit-scrollbar {
      display: none;
    }

    .wp-brand-cloud.is-sort-list .wp-brand-cloud-item {
      flex: 0 0 auto;
      min-height: 32px;
      max-width: min(240px, 100%);
      scroll-snap-align: center;
    }

    .wp-brand-cloud::before {
      content: "";
      position: absolute;
      inset: 20% -4% 14%;
      z-index: -1;
      border-radius: 8px;
      background:
        linear-gradient(105deg, transparent 4%, rgba(116, 196, 255, 0.18) 28%, rgba(255, 151, 218, 0.16) 52%, rgba(179, 255, 207, 0.14) 76%, transparent 96%),
        linear-gradient(22deg, transparent 16%, rgba(255, 255, 255, 0.5) 48%, transparent 82%);
      filter: blur(32px);
      opacity: 0.64;
      pointer-events: none;
    }

    .wp-brand-cloud-item::before {
      content: "";
      position: absolute;
      inset: -5px -10px -3px;
      z-index: -1;
      border-radius: inherit;
      background:
        radial-gradient(circle at 20% 18%, rgba(116, 196, 255, 0.5), transparent 38%),
        radial-gradient(circle at 78% 20%, rgba(255, 151, 218, 0.44), transparent 40%),
        radial-gradient(circle at 54% 88%, rgba(179, 255, 207, 0.36), transparent 42%),
        linear-gradient(105deg, rgba(116, 196, 255, 0.28), rgba(255, 151, 218, 0.24) 54%, rgba(179, 255, 207, 0.2)),
        linear-gradient(22deg, transparent 12%, rgba(255, 255, 255, 0.48) 48%, transparent 84%);
      opacity: 0;
      filter: blur(8px) saturate(1.18);
      transform: scale3d(0.82, 0.88, 1);
      transform-origin: center;
      pointer-events: none;
      transition:
        opacity 180ms ease,
        transform 240ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-cloud-item::after {
      content: "";
      position: absolute;
      left: 8px;
      right: 8px;
      bottom: 4px;
      height: 1px;
      background: currentColor;
      opacity: 0.5;
      transform: scaleX(0);
      transform-origin: left;
      pointer-events: none;
      transition: transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-cloud-item:hover,
    .wp-brand-cloud-item:focus-visible {
      outline: 0;
      color: var(--foreground);
      transform: translateY(-2px);
    }

    .wp-brand-cloud-item:hover::before,
    .wp-brand-cloud-item:focus-visible::before {
      opacity: 0.86;
      transform: scale3d(1, 1, 1);
    }

    .wp-brand-cloud-item:hover::after,
    .wp-brand-cloud-item:focus-visible::after {
      transform: scaleX(1);
    }

    .wp-brand-cloud-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: font-weight 160ms ease;
    }

    .wp-brand-cloud-item:hover .wp-brand-cloud-name,
    .wp-brand-cloud-item:focus-visible .wp-brand-cloud-name {
      font-weight: 820;
    }

    .wp-compact-copy .wp-item-title {
      font-size: var(--text-control);
      line-height: 1.18;
      font-weight: 670;
      -webkit-line-clamp: 2;
    }

    .wp-site-price,
    .wp-compare-price {
      color: rgba(8, 11, 16, 0.5);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-control);
      line-height: 1.2;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wp-price-stack {
      min-width: 0;
      display: inline-grid;
      align-items: start;
      gap: 2px;
      max-width: 100%;
    }

    .wp-price-line {
      min-width: 0;
      display: inline-flex;
      align-items: baseline;
      flex-wrap: nowrap;
      gap: 8px;
      max-width: 100%;
      overflow: hidden;
    }

    .wp-price-line .wp-site-price {
      color: rgba(8, 11, 16, 0.84);
      font-weight: 780;
    }

    .wp-site-price.is-sale {
      color: #d92d20;
    }

    .wp-compare-price {
      font-weight: 650;
      min-width: 0;
    }

    .wp-native-price {
      flex: 0 1 auto;
      min-width: 0;
      color: rgba(8, 11, 16, 0.42);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-control);
      line-height: 1.2;
      font-weight: 650;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

  `;
}
