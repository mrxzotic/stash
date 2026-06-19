function panelCurrencyStyles() {
  return `
    .wp-currency-select {
      position: relative;
      flex: 0 0 auto;
    }

    .wp-total {
      gap: 6px;
      padding: 0 10px 0 16px;
      cursor: pointer;
      transition:
        transform 180ms cubic-bezier(.16, 1, .3, 1),
        border-color 180ms ease,
        box-shadow 180ms ease,
        filter 180ms ease;
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

    .wp-total:focus-visible {
      outline: 2px solid rgba(8, 11, 16, 0.18);
      outline-offset: 3px;
    }

    .wp-total-value {
      display: inline-block;
      min-width: 0;
      will-change: transform, filter;
    }

    .wp-total-value.is-counting {
      animation: wpCurrencyCount 560ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-total-chevron {
      width: 14px;
      height: 14px;
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

    .wp-currency-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 14;
      width: 136px;
      display: grid;
      gap: 4px;
      padding: 6px;
      border: 1px solid rgba(60, 60, 67, 0.12);
      border-radius: var(--radius);
      background: #fff;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.9) inset,
        0 18px 40px rgba(15, 23, 42, 0.16);
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
  `;
}
