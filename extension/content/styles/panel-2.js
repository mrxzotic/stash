function panelStylesChunk2() {
  return `
    .wp-summary {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 64px;
      flex: 1 1 auto;
      color: var(--foreground);
      font-size: var(--text-ui);
      line-height: 1;
      white-space: nowrap;
    }

    .wp-brand-mark {
      display: inline-grid;
      place-items: center;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--foreground);
      font-size: var(--text-ui);
      line-height: 1;
      font-weight: 700;
      letter-spacing: 0;
      opacity: 0.4;
      user-select: none;
      cursor: pointer;
    }

    .wp-brand-mark:disabled {
      cursor: default;
    }

    .wp-brand-mark:not(:disabled):hover,
    .wp-brand-mark:not(:disabled):focus-visible {
      opacity: 0.72;
      outline: 0;
    }

    .wp-count {
      position: relative;
      height: 28px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.36);
      color: rgba(8, 11, 16, 0.72);
      font-size: var(--text-control);
      font-weight: 660;
      line-height: 1;
      text-align: left;
      appearance: none;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      overflow: hidden;
      isolation: isolate;
      transition:
        color 160ms ease,
        border-color 160ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-count::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: inherit;
      background:
        radial-gradient(circle at 15% 20%, rgba(115, 196, 255, 0.8), transparent 38%),
        radial-gradient(circle at 82% 10%, rgba(255, 144, 221, 0.72), transparent 42%),
        radial-gradient(circle at 58% 94%, rgba(174, 255, 196, 0.62), transparent 42%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.44));
      opacity: 0;
      transform: scaleX(0.72);
      transform-origin: left center;
      transition:
        opacity 180ms ease,
        transform 240ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-count:hover,
    .wp-count:focus-visible {
      color: var(--foreground);
      border-color: rgba(8, 11, 16, 0.12);
      outline: 0;
      transform: translateY(-1px);
    }

    .wp-count:hover::before,
    .wp-count:focus-visible::before {
      opacity: 0.72;
      transform: scaleX(1);
    }

    .wp-count.is-active {
      color: var(--primary-foreground);
      border-color: rgba(8, 11, 16, 0.84);
      background: rgba(8, 11, 16, 0.84);
      font-weight: 720;
    }

    .wp-count.is-active::before {
      opacity: 0.2;
      transform: scaleX(1);
      mix-blend-mode: screen;
    }

    .wp-count-label {
      position: relative;
      z-index: 1;
      white-space: nowrap;
    }

    .wp-count-clear-icon {
      position: relative;
      z-index: 1;
      width: 13px;
      height: 13px;
      stroke: currentColor;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.88;
    }

    .wp-total {
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      border: 1px solid rgba(255, 255, 255, 0.48);
      border-radius: 999px;
      color: var(--foreground);
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(230, 238, 255, 0.52) 38%, rgba(255, 229, 245, 0.44) 72%, rgba(255, 255, 255, 0.66)),
        rgba(255, 255, 255, 0.75);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-ui);
      font-weight: 780;
      line-height: 1;
      box-shadow: none;
      white-space: nowrap;
    }

    .wp-icon-button {
      position: relative;
      width: 36px;
      height: 40px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--foreground);
      box-shadow: none;
      transition:
        background 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease,
        transform 160ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-icon-button.is-active {
      color: var(--foreground);
      background: transparent;
    }

    .wp-icon-button.is-toggle-active {
      color: var(--foreground);
      background: rgba(8, 11, 16, 0.07);
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.08);
    }

    .wp-theme-graphite .wp-total {
      border-color: rgba(255, 255, 255, 0.08);
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(87, 99, 118, 0.18) 42%, rgba(181, 141, 169, 0.14) 76%, rgba(255, 255, 255, 0.08)),
        rgba(16, 17, 20, 0.82);
    }

    .wp-theme-graphite .wp-icon-button.is-toggle-active {
      background: rgba(255, 255, 255, 0.12);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .wp-theme-graphite .wp-filter.is-active,
    .wp-theme-graphite .wp-count.is-active,
    .wp-theme-graphite .wp-summary-brand-pill {
      color: #080b10;
      border-color: rgba(255, 255, 255, 0.9);
      background: rgba(244, 244, 240, 0.9);
    }

    .wp-theme-graphite .wp-inline-search,
    .wp-theme-graphite .wp-confirm-dialog,
    .wp-theme-graphite .wp-popover {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(22, 23, 26, 0.94);
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.34);
    }

    .wp-theme-graphite .wp-brand,
    .wp-theme-graphite .wp-brand:link,
    .wp-theme-graphite .wp-brand:visited,
    .wp-theme-graphite .wp-site-price,
    .wp-theme-graphite .wp-compare-price,
    .wp-theme-graphite .wp-brand-cloud-count {
      color: rgba(244, 244, 240, 0.52);
    }

    .wp-theme-graphite .wp-brand-cloud-item {
      color: rgba(244, 244, 240, 0.76);
    }

    .wp-filter:hover,
    .wp-text-button:hover {
      background: var(--hover);
    }

    .wp-icon-button:hover,
    .wp-icon-button.is-active:hover {
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
      transform: translateY(-1px);
    }

    .wp-icon-button.is-toggle-active:hover {
      background: rgba(8, 11, 16, 0.1);
    }

    .wp-theme-graphite .wp-icon-button:hover,
    .wp-theme-graphite .wp-icon-button.is-active:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .wp-theme-graphite .wp-icon-button.is-toggle-active:hover {
      background: rgba(255, 255, 255, 0.16);
    }

    .wp-lucide {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-remove-category::before,
    .wp-remove-category::after {
      content: "";
      position: absolute;
      width: 13px;
      height: 1.5px;
      border-radius: var(--radius);
      background: currentColor;
    }

    .wp-remove-category::before {
      transform: rotate(45deg);
    }

    .wp-remove-category::after {
      transform: rotate(-45deg);
    }

    .wp-popover {
      position: absolute;
      top: 72px;
      right: 24px;
      z-index: 7;
      width: min(352px, calc(100% - 48px));
      padding: 16px;
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: var(--radius);
      background: #fff;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.9) inset,
        0 18px 44px rgba(15, 23, 42, 0.14);
      animation: wpPanelIn 160ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-settings.wp-popover {
      width: min(336px, calc(100% - 48px));
      max-height: min(560px, calc(100vh - 116px));
      padding: 16px;
      overflow-y: auto;
      scrollbar-width: none;
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(60, 60, 67, 0.16);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.88) inset,
        0 24px 54px rgba(0, 0, 0, 0.18);
    }

    .wp-settings.wp-popover::-webkit-scrollbar {
      display: none;
    }

    .wp-settings[hidden] {
      display: none;
    }

    .wp-settings-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0;
      margin: 0 0 8px;
    }

    .wp-settings h2 {
      margin: 0;
      font-size: var(--text-heading);
      line-height: 1.2;
      font-weight: 780;
      letter-spacing: 0;
    }

    .wp-text-button,
    .wp-category-form button {
      height: 32px;
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: var(--text-control);
      font-weight: 700;
    }

    .wp-text-button {
      height: auto;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: var(--text-control);
      font-weight: 680;
    }

    .wp-settings-section {
      display: grid;
      gap: 8px;
      padding: 0;
      margin-top: 16px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .wp-settings-section + .wp-settings-section {
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid rgba(60, 60, 67, 0.12);
    }

    .wp-settings-section-title,
    .wp-settings-section-head {
      color: var(--muted);
      font-size: var(--text-caption);
      line-height: 1;
      font-weight: 700;
      margin: 0;
    }

    .wp-settings-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .wp-settings-row {
      width: 100%;
      min-height: 40px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 16px;
      padding: 0;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
    }

    .wp-settings-row + .wp-settings-row {`;
}
