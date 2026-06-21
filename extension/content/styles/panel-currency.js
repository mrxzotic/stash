function panelCurrencyStyles() {
  return `
    .wp-actions {
      flex: 0 0 auto;
      min-width: 0;
      justify-content: flex-end;
    }

    .wp-currency-select {
      position: relative;
      z-index: 0;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      flex: 0 0 auto;
    }

    .wp-currency-select.is-open {
      z-index: 16;
    }

    .wp-summary-capsule .wp-currency-select {
      width: auto;
      min-width: 0;
      height: 100%;
      flex: 0 1 auto;
    }

    .wp-total {
      gap: 8px;
      min-width: 104px;
      padding: 0 12px 0 16px;
      justify-content: flex-end;
      cursor: pointer;
      transition:
        transform 180ms cubic-bezier(.16, 1, .3, 1),
        border-color 180ms ease,
        box-shadow 180ms ease,
        filter 180ms ease;
    }

    .wp-summary-capsule .wp-total {
      width: auto;
      min-width: 120px;
      max-width: 144px;
      height: 32px;
      justify-content: center;
      gap: 8px;
      padding: 0 12px 0 16px;
      border: 0;
      border-radius: 999px;
      background:
        var(--wp-chrome-iridescent),
        rgba(255, 255, 255, 0.7);
      box-shadow: none;
    }

    .wp-total:hover,
    .wp-currency-select.is-open .wp-total {
      transform: translateY(-1px);
      border-color: rgba(255, 255, 255, 0.66);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.8) inset,
        0 10px 24px rgba(15, 23, 42, 0.08);
      filter: saturate(1.08);
    }

    .wp-summary-capsule .wp-total:hover,
    .wp-summary-capsule .wp-currency-select.is-open .wp-total {
      transform: none;
      border-color: transparent;
      box-shadow: none;
      filter: saturate(1.08);
    }

    .wp-total:focus-visible {
      outline: 2px solid rgba(8, 11, 16, 0.18);
      outline-offset: 3px;
    }

    .wp-total-value {
      display: inline-block;
      min-width: 0;
      text-align: right;
      transform-origin: right center;
      will-change: transform, filter;
    }

    .wp-summary-capsule .wp-total-value {
      max-width: 96px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wp-total-value.is-counting {
      animation: wpCurrencyCount 1100ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-total.is-recounting {
      animation: wpCurrencyPillCount 1400ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-price-row.is-price-recounting .wp-site-price,
    .wp-price-row.is-price-recounting .wp-compare-price,
    .wp-price-row.is-price-recounting .wp-native-price {
      animation: wpCardPriceCount 720ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-price-row.is-price-recounting .wp-compare-price {
      animation-delay: 35ms;
    }

    .wp-price-row.is-price-recounting .wp-native-price {
      animation-delay: 60ms;
    }

    .wp-total-chevron {
      width: 16px;
      height: 16px;
      font-size: 16px;
      opacity: 0.5;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition:
        opacity 180ms ease,
        transform 220ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-currency-select.is-open .wp-total-chevron {
      opacity: 0.72;
      transform: rotate(180deg);
    }

    .wp-summary-capsule .wp-total-chevron {
      width: 14px;
      height: 14px;
      font-size: 14px;
      opacity: 0.56;
    }

    .wp-currency-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 14;
      width: 136px;
      display: grid;
      gap: 4px;
      padding: 6px;
      border: 1px solid var(--wp-popover-border);
      border-radius: var(--radius);
      background: var(--wp-popover-bg);
      -webkit-backdrop-filter: var(--wp-popover-blur);
      backdrop-filter: var(--wp-popover-blur);
      box-shadow: var(--wp-popover-shadow);
      transform-origin: 100% 0;
      animation: wpCurrencyMenuIn 180ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-currency-menu[hidden] {
      display: none;
    }

    .wp-currency-option {
      width: 100%;
      height: 34px;
      display: grid;
      grid-template-columns: 18px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--foreground);
      font-size: var(--text-body);
      font-weight: 700;
      text-align: left;
      white-space: nowrap;
      animation: wpCurrencyOptionIn 220ms cubic-bezier(.16, 1, .3, 1) both;
      transition:
        background 140ms ease,
        transform 140ms ease,
        color 140ms ease;
    }

    .wp-currency-option:nth-child(2) {
      animation-delay: 18ms;
    }

    .wp-currency-option:nth-child(3) {
      animation-delay: 36ms;
    }

    .wp-currency-option:nth-child(4) {
      animation-delay: 54ms;
    }

    .wp-currency-option:nth-child(5) {
      animation-delay: 72ms;
    }

    .wp-currency-option:hover,
    .wp-currency-option:focus-visible,
    .wp-currency-option.is-selected {
      outline: 0;
      background: #f3f4f6;
      transform: translateX(-1px);
    }

    .wp-currency-check {
      width: 16px;
      height: 16px;
      display: grid;
      place-items: center;
    }

    .wp-currency-check-icon {
      width: 14px;
      height: 14px;
      color: var(--foreground);
      font-size: 14px;
      stroke: var(--foreground);
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-currency-symbol {
      color: rgba(8, 11, 16, 0.48);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-weight: 700;
    }

    .wp-theme-graphite .wp-currency-menu {
      border-color: var(--wp-popover-border);
      background:
        var(--wp-chrome-iridescent),
        var(--wp-popover-bg);
      box-shadow: var(--wp-popover-shadow);
    }

    .wp-theme-graphite .wp-summary-capsule .wp-total {
      background:
        var(--wp-chrome-iridescent),
        rgba(16, 17, 20, 0.72);
    }

    .wp-theme-graphite .wp-currency-option {
      color: rgba(244, 244, 240, 0.82);
    }

    .wp-theme-graphite .wp-currency-option:hover,
    .wp-theme-graphite .wp-currency-option:focus-visible {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 250, 0.96);
    }

    .wp-theme-graphite .wp-currency-option.is-selected {
      background: rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 250, 0.98);
    }

    .wp-theme-graphite .wp-currency-symbol {
      color: rgba(244, 244, 240, 0.58);
    }

    .wp-theme-graphite .wp-currency-check-icon {
      color: rgba(255, 255, 250, 0.92);
      stroke: currentColor;
    }

    @keyframes wpCurrencyMenuIn {
      from {
        transform: translateY(-6px) scale(.96);
        filter: blur(4px);
      }

      to {
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpCurrencyOptionIn {
      from {
        transform: translateY(-3px);
      }

      to {
        transform: translateY(0);
      }
    }

    @keyframes wpCurrencyCount {
      0% {
        opacity: 0.2;
        transform: translateY(7px) scale(.94);
        filter: blur(4px);
      }

      52% {
        opacity: 1;
        transform: translateY(-2px) scale(1.04);
        filter: blur(0);
      }

      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpCardPriceCount {
      0% {
        opacity: 0.22;
        transform: translateY(5px);
        filter: blur(3px);
      }

      58% {
        opacity: 1;
        transform: translateY(-1px);
        filter: blur(0);
      }

      100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }
    }

    @keyframes wpCurrencyPillCount {
      0% {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 0 0 rgba(15, 23, 42, 0);
      }

      48% {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 12px 30px rgba(15, 23, 42, 0.12);
      }

      100% {
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.8) inset,
          0 0 0 rgba(15, 23, 42, 0);
      }
    }
  `;
}
