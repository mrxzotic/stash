function panelStylesChunk2() {
  return `
    .wp-summary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1 1 auto;
      color: var(--foreground);
      font-size: var(--text-ui);
      line-height: 1;
      white-space: nowrap;
    }

    .wp-summary-capsule {
      position: relative;
      width: max-content; height: 40px;
      min-width: 0;
      max-width: min(100%, 320px);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex: 0 1 auto;
      padding: 4px;
      border: 1px solid var(--wp-chrome-border);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.18);
      -webkit-backdrop-filter: var(--wp-chrome-blur);
      backdrop-filter: var(--wp-chrome-blur);
      box-shadow: none;
      overflow: visible;
      isolation: isolate;
    }

    .wp-count {
      position: relative;
      width: max-content; min-width: 112px; max-width: none; height: 32px;
      display: inline-flex; align-items: center; justify-content: center; gap: 0;
      flex: 0 0 auto;
      padding: 0 8px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: rgba(8, 11, 16, 0.46);
      font-size: var(--text-control);
      font-weight: 680;
      line-height: 1;
      text-align: center;
      cursor: default;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition:
        background 160ms ease,
        color 160ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-count.is-active {
      color: rgba(8, 11, 16, 0.62);
      background: transparent;
      font-weight: 720;
    }

    .wp-count-label {
      position: relative;
      z-index: 1;
      min-width: 0;
      font-family: var(--ui-font);
      overflow: visible;
      text-overflow: clip;
      white-space: nowrap;
    }

    .wp-count-figure {
      position: relative;
      z-index: 1;
      min-width: 1ch;
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      letter-spacing: 0;
    }

    .wp-total {
      height: 40px;
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
      width: 40px; height: 40px; display: grid; place-items: center; flex: 0 0 40px;
      padding: 0;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--foreground);
      box-shadow: none;
      appearance: none;
      line-height: 1;
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

    .wp-icon-button.wp-search-button:hover,
    .wp-icon-button.wp-search-button:focus-visible,
    .wp-icon-button.wp-search-button[aria-expanded="true"],
    .wp-icon-button.wp-overflow-button:hover,
    .wp-icon-button.wp-overflow-button:focus-visible,
    .wp-icon-button.wp-overflow-button[aria-expanded="true"] {
      background:
        linear-gradient(135deg, rgba(110, 194, 255, 0.15), rgba(255, 139, 222, 0.15) 52%, rgba(160, 255, 208, 0.15)),
        rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.06);
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

    .wp-theme-graphite .wp-summary-capsule {
      background: rgba(255, 255, 255, 0.04);
      border-color: var(--wp-chrome-border);
    }

    .wp-theme-graphite .wp-count {
      color: rgba(244, 244, 240, 0.44);
      box-shadow: none;
    }

    .wp-theme-graphite .wp-count:hover,
    .wp-theme-graphite .wp-count:focus-visible,
    .wp-theme-graphite .wp-count.is-active {
      color: rgba(244, 244, 240, 0.68);
      background: transparent;
    }

    .wp-theme-graphite .wp-icon-button.wp-search-button:hover,
    .wp-theme-graphite .wp-icon-button.wp-search-button:focus-visible,
    .wp-theme-graphite .wp-icon-button.wp-search-button[aria-expanded="true"],
    .wp-theme-graphite .wp-icon-button.wp-overflow-button:hover,
    .wp-theme-graphite .wp-icon-button.wp-overflow-button:focus-visible,
    .wp-theme-graphite .wp-icon-button.wp-overflow-button[aria-expanded="true"] {
      background:
        linear-gradient(135deg, rgba(126, 209, 255, 0.15), rgba(255, 154, 227, 0.15) 52%, rgba(168, 255, 214, 0.15)),
        rgba(255, 255, 255, 0.06);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

    .wp-theme-graphite .wp-filter.is-active,
    .wp-theme-graphite .wp-summary-brand-pill {
      color: #080b10;
      border-color: rgba(255, 255, 255, 0.9);
      background: rgba(244, 244, 240, 0.9);
    }

    .wp-theme-graphite .wp-inline-search,
    .wp-theme-graphite .wp-confirm-dialog,
    .wp-theme-graphite .wp-popover {
      border-color: var(--wp-popover-border);
      background: var(--wp-popover-bg);
      box-shadow: var(--wp-popover-shadow);
    }

    .wp-theme-graphite .wp-inline-search {
      background:
        var(--wp-chrome-iridescent),
        var(--wp-chrome-bg);
    }

    .wp-theme-graphite .wp-brand,
    .wp-theme-graphite .wp-brand:link,
    .wp-theme-graphite .wp-brand:visited,
    .wp-theme-graphite .wp-compare-price,
    .wp-theme-graphite .wp-native-price,
    .wp-theme-graphite .wp-brand-cloud-count {
      color: rgba(244, 244, 240, 0.52);
    }
    .wp-theme-graphite .wp-price-line .wp-site-price {
      color: rgba(244, 244, 240, 0.9);
    }
    .wp-theme-graphite .wp-brand-cloud-item {
      color: rgba(244, 244, 240, 0.76);
    }

    .wp-filter:hover {
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

    .wp-phosphor {
      display: inline-block;
      flex: 0 0 auto;
      width: 20px;
      height: 20px;
      font-size: inherit;
      color: currentColor;
      background-color: currentColor;
      -webkit-mask: var(--wp-icon-url) center / contain no-repeat;
      mask: var(--wp-icon-url) center / contain no-repeat;
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
      background: var(--wp-popover-bg);
      -webkit-backdrop-filter: var(--wp-popover-blur);
      backdrop-filter: var(--wp-popover-blur);
      box-shadow: var(--wp-popover-shadow);
      animation: wpPanelIn 160ms cubic-bezier(.16, 1, .3, 1) both;
    }

`;
}
