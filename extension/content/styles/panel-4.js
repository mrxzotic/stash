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
      height: 40px;
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      color: var(--foreground);
    }

    .wp-inline-search span {
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
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-inline-search input {
      width: 100%;
      height: 40px;
      padding: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--foreground);
      font-size: var(--text-ui);
      font-weight: 680;
    }

    .wp-inline-search input::placeholder {
      color: var(--muted-foreground);
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
      transform: translateZ(0);
      backface-visibility: hidden;
      contain: layout paint style;
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
