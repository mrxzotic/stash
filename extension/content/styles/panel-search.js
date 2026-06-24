function panelSearchStyles() {
  return `
    .wp-inline-search {
      position: relative;
      width: 100%;
      height: 40px;
      min-height: 40px;
      display: grid;
      grid-template-columns: 24px minmax(0, 1fr) 32px;
      align-items: center;
      gap: 8px;
      padding: 0 4px 0 12px;
      border: 1px solid var(--wp-chrome-border);
      border-radius: var(--radius);
      background:
        var(--wp-chrome-iridescent),
        var(--wp-chrome-bg);
      color: var(--foreground);
      -webkit-backdrop-filter: var(--wp-chrome-blur);
      backdrop-filter: var(--wp-chrome-blur);
      box-shadow: var(--wp-chrome-shadow);
      transition:
        border-color 160ms ease,
        background 160ms ease,
        box-shadow 160ms ease;
      transform-origin: right center;
      animation: wpSearchIn 220ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-inline-search:focus-within {
      border-color: rgba(8, 11, 16, 0.18);
      background:
        var(--wp-chrome-iridescent),
        var(--wp-chrome-bg-hover);
      box-shadow: var(--wp-chrome-shadow);
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
      font-size: inherit;
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
      height: 38px;
      padding: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--foreground);
      font-size: var(--text-ui);
      font-weight: 620;
      line-height: 1;
    }

    .wp-inline-search input::placeholder {
      color: var(--muted-foreground);
      font-weight: 620;
      transition: color 160ms ease;
    }

    .wp-inline-search:focus-within input::placeholder {
      color: rgba(8, 11, 16, 0.42);
    }

    .wp-clear-search {
      width: 32px;
      height: 32px;
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
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;
}
