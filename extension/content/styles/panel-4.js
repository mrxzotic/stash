function panelStylesChunk4() {
  return `      width: 32px;
      height: 32px;
      box-shadow: none;
      color: var(--muted);
    }

    .wp-category-form {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid rgba(60, 60, 67, 0.1);
    }

    .wp-category-form input {
      padding: 0 12px;
      background: #fff;
    }

    .wp-inline-search {
      position: relative;
      width: 100%;
      min-height: 42px;
      display: grid;
      grid-template-columns: 22px minmax(0, 1fr) 28px;
      align-items: center;
      gap: 8px;
      padding: 0 6px 0 12px;
      border: 1px solid rgba(10, 10, 10, 0.1);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.72);
      color: var(--foreground);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.78),
        0 8px 24px rgba(15, 23, 42, 0.06);
      transition:
        border-color 160ms ease,
        background 160ms ease,
        box-shadow 160ms ease;
    }

    .wp-inline-search:focus-within {
      border-color: rgba(8, 11, 16, 0.28);
      background: rgba(255, 255, 255, 0.92);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.84),
        0 10px 28px rgba(15, 23, 42, 0.08);
    }

    .wp-inline-search-label {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      border: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }

    .wp-inline-search-icon {
      width: 20px;
      height: 20px;
      color: rgba(8, 11, 16, 0.78);
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: color 160ms ease, transform 160ms ease;
    }

    .wp-inline-search:focus-within .wp-inline-search-icon {
      color: var(--foreground);
      transform: scale(1.03);
    }

    .wp-inline-search input {
      width: 100%;
      min-width: 0;
      height: 40px;
      padding: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--foreground);
      font-size: var(--text-ui);
      font-weight: 680;
      line-height: 1;
    }

    .wp-inline-search input::placeholder {
      color: var(--muted-foreground);
      transition: color 160ms ease;
    }

    .wp-inline-search:focus-within input::placeholder {
      color: rgba(8, 11, 16, 0.42);
    }

    .wp-clear-search {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
      opacity: 0;
      pointer-events: none;
      transform: scale(0.82);
      transition:
        opacity 160ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1),
        background 160ms ease,
        color 160ms ease;
    }

    .wp-clear-search.is-visible {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }

    .wp-clear-search:hover {
      background: rgba(0, 0, 0, 0.06);
      color: var(--foreground);
    }

    .wp-clear-search:disabled {
      cursor: default;
    }

    .wp-clear-search-icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-filters {
      position: relative;
      z-index: 3;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .wp-filter {
      flex: 0 0 auto;
      height: 32px;
      padding: 0 16px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--foreground);
      background: var(--card);
      font-size: var(--text-body);
      font-weight: 720;
      transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
    }

    .wp-filter.is-active {
      color: var(--primary-foreground);
      background: var(--primary);
      border-color: var(--primary);
    }

    .wp-items {
      position: absolute;
      inset: 0;
      z-index: 1;
      min-height: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-content: start;
      gap: 24px 16px;
      padding: 168px 24px 56px;
      margin-top: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
      overscroll-behavior: contain;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      contain: layout style;
    }

    .wp-item {
      min-width: 0;
      animation: wpItemIn 240ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-item.is-new .wp-media {
      box-shadow: none;
    }

    .wp-item.is-new .wp-item-title {
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }

    .wp-media {
      position: relative;
      display: grid;
      place-items: center;
      aspect-ratio: var(--wp-media-ratio, 4 / 5);
      margin-bottom: 8px;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      overflow: hidden;
    }

    .wp-media img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      object-fit: contain;
      object-position: center;
    }

    .wp-image-placeholder {
      width: 42px;
      height: 42px;
      color: rgba(16, 16, 16, 0.2);
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-item:hover .wp-media img {
      transform: none;
    }

    .wp-remove {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 0;
      color: rgba(16, 16, 16, 0.72);
      background: transparent;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transform: none;
      transition: opacity 140ms ease, color 140ms ease;
    }

    .wp-remove::before,
    .wp-remove::after {
      width: 18px;
      height: 2px;
    }

    .wp-item:hover .wp-remove,
    .wp-remove:focus-visible {
      opacity: 1;
      pointer-events: auto;
      transform: none;
      color: rgba(16, 16, 16, 0.92);
    }

    .wp-item-copy {
      display: grid;
      gap: 4px;
    }

    .wp-brand-row,
    .wp-title-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    .wp-price-row {
      min-width: 0;
      display: inline-flex;
      align-items: baseline;
      justify-content: flex-start;
      gap: 6px;
      max-width: 100%;`;
}
