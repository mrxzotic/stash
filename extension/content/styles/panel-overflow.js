function panelOverflowStyles() {
  return `
    .wp-overflow {
      position: relative;
      display: inline-flex;
      flex: 0 0 auto;
    }

    .wp-overflow-dotmark {
      display: block;
      font-size: 22px;
      line-height: 1;
      transform: translateY(-1px);
    }

    .wp-overflow-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 14;
      width: 176px;
      max-width: calc(100vw - 32px);
      display: grid;
      gap: 3px;
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

    .wp-overflow-menu[hidden] {
      display: none;
    }

    .wp-overflow-option {
      width: 100%;
      height: 34px;
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr) 34px;
      align-items: center;
      gap: 8px;
      padding: 0 9px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: rgba(8, 11, 16, 0.72);
      font-size: var(--text-body);
      font-weight: 720;
      text-align: left;
      white-space: nowrap;
      transition:
        background 140ms ease,
        color 140ms ease,
        transform 160ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-overflow-option > span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wp-overflow-option:hover,
    .wp-overflow-option:focus-visible {
      outline: 0;
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-overflow-option:active {
      transform: scale(0.98);
    }

    .wp-overflow-option-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
      stroke: currentColor;
      stroke-width: 2.15;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-overflow-switch {
      position: relative;
      width: 30px;
      height: 18px;
      justify-self: end;
      border-radius: 999px;
      background: rgba(8, 11, 16, 0.14);
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.08);
      overflow: visible;
      transition:
        background 160ms ease,
        box-shadow 160ms ease;
    }

    .wp-overflow-switch::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 1px 3px rgba(8, 11, 16, 0.24);
      transition: transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-overflow-switch.is-on {
      background: rgba(8, 11, 16, 0.84);
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.16);
    }

    .wp-overflow-switch.is-on::after {
      transform: translateX(12px);
    }

    .wp-overflow-divider {
      height: 1px;
      margin: 3px 4px;
      background: rgba(8, 11, 16, 0.1);
    }

    .wp-overflow-chevron {
      width: 16px;
      height: 16px;
      justify-self: end;
      color: rgba(8, 11, 16, 0.42);
      overflow: visible;
    }

    .wp-theme-graphite .wp-overflow-option {
      color: rgba(244, 244, 240, 0.72);
    }

    .wp-theme-graphite .wp-overflow-option:hover,
    .wp-theme-graphite .wp-overflow-option:focus-visible {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 250, 0.96);
    }

    .wp-theme-graphite .wp-overflow-switch {
      background: rgba(255, 255, 255, 0.14);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .wp-theme-graphite .wp-overflow-switch.is-on {
      background: rgba(244, 244, 240, 0.9);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.42);
    }

    .wp-theme-graphite .wp-overflow-switch.is-on::after {
      background: rgba(8, 11, 16, 0.92);
    }

    .wp-theme-graphite .wp-overflow-divider {
      background: rgba(255, 255, 255, 0.1);
    }

    .wp-theme-graphite .wp-overflow-chevron {
      color: rgba(244, 244, 240, 0.44);
    }
  `;
}
