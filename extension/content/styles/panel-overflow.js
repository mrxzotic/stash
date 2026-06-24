function panelOverflowStyles() {
  return `
    .wp-overflow {
      position: relative;
      display: inline-flex;
      flex: 0 0 auto;
    }

    .wp-overflow-button-icon {
      width: 20px;
      height: 20px;
      font-size: inherit;
    }

    .wp-overflow-menu {
      --wp-overflow-option-color: rgba(8, 11, 16, 0.72);
      --wp-overflow-option-hover-color: rgba(8, 11, 16, 0.92);
      --wp-overflow-divider-bg: rgba(8, 11, 16, 0.1);
      --wp-overflow-switch-bg: rgba(8, 11, 16, 0.14);
      --wp-overflow-switch-border: rgba(8, 11, 16, 0.08);
      --wp-overflow-switch-on-bg: rgba(8, 11, 16, 0.84);
      --wp-overflow-switch-on-border: rgba(8, 11, 16, 0.16);
      --wp-overflow-switch-knob-bg: rgba(255, 255, 255, 0.96);
      --wp-overflow-switch-knob-shadow: rgba(8, 11, 16, 0.24);
      --wp-overflow-switch-knob-on-bg: rgba(255, 255, 255, 0.96);
      position: absolute;
      top: calc(100% + var(--space-1));
      right: 0;
      z-index: 14;
      width: 344px;
      max-width: calc(100vw - var(--space-4));
      display: grid;
      gap: var(--space-1);
      padding: var(--space-1);
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
      height: var(--space-5);
      display: grid;
      grid-template-columns: var(--space-3) minmax(0, 1fr) var(--space-5);
      align-items: center;
      gap: var(--space-2);
      padding: 0 var(--space-1);
      border: 0;
      border-radius: var(--radius);
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
      --wp-overflow-option-color: var(--wp-overflow-option-hover-color);
      outline: 0;
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-overflow-option:active {
      transform: scale(0.98);
    }

    .wp-overflow-language {
      position: relative;
      width: 100%;
      height: var(--space-5);
      display: grid;
      grid-template-columns: var(--space-3) minmax(0, 1fr) 144px;
      align-items: center;
      gap: var(--space-2);
      padding: 0 var(--space-1);
      border-radius: var(--radius);
      color: var(--wp-overflow-option-color, rgba(8, 11, 16, 0.72));
      font-size: var(--text-body);
      font-weight: 720;
      white-space: nowrap;
    }

    .wp-overflow-language > span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wp-overflow-language-trigger {
      width: 144px;
      height: var(--space-4);
      display: grid;
      grid-template-columns: minmax(0, 1fr) 20px 16px;
      align-items: center;
      gap: var(--space-1);
      padding: 0 var(--space-1);
      border: 1px solid var(--wp-overflow-select-border, rgba(8, 11, 16, 0.12));
      border-radius: var(--radius);
      background: var(--wp-overflow-select-bg, rgba(255, 255, 255, 0.68));
      color: var(--wp-overflow-select-color, currentColor);
      font: inherit;
      font-size: var(--text-control);
      font-weight: 720;
      text-align: left;
      transition:
        background 140ms ease,
        border-color 140ms ease,
        box-shadow 140ms ease;
    }

    .wp-overflow-language-trigger:hover,
    .wp-overflow-language-trigger:focus-visible,
    .wp-overflow-language-root.is-open .wp-overflow-language-trigger {
      outline: 2px solid rgba(8, 11, 16, 0.24);
      outline-offset: 2px;
    }

    .wp-language-current,
    .wp-language-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-language-flag {
      width: 20px;
      display: inline-grid;
      place-items: center;
      font-size: var(--text-ui);
      line-height: 1;
    }

    .wp-language-chevron {
      width: 16px;
      height: 16px;
      color: rgba(8, 11, 16, 0.48);
      overflow: visible;
      transition: transform 160ms ease;
    }

    .wp-overflow-language-root.is-open .wp-language-chevron {
      transform: rotate(180deg);
    }

    .wp-language-menu {
      position: absolute;
      top: calc(100% + var(--space-1));
      right: var(--space-1);
      z-index: 16;
      width: 232px;
      display: grid;
      gap: var(--space-1);
      padding: var(--space-1);
      border: 1px solid var(--wp-popover-border);
      border-radius: var(--radius);
      background: var(--wp-popover-bg);
      -webkit-backdrop-filter: var(--wp-popover-blur);
      backdrop-filter: var(--wp-popover-blur);
      box-shadow: var(--wp-popover-shadow);
      transform-origin: 100% 0;
      animation: wpCurrencyMenuIn 180ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-language-menu[hidden] {
      display: none !important;
    }

    .wp-language-option {
      width: 100%;
      height: var(--space-5);
      display: grid;
      grid-template-columns: var(--space-3) minmax(0, 1fr) var(--space-3);
      align-items: center;
      gap: var(--space-1);
      padding: 0 var(--space-1);
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--foreground);
      font: inherit;
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

    .wp-language-option:hover,
    .wp-language-option:focus-visible,
    .wp-language-option.is-selected {
      outline: 0;
      background: #f3f4f6;
      transform: translateX(-1px);
    }

    .wp-language-check {
      width: 16px;
      height: 16px;
      display: grid;
      place-items: center;
    }

    .wp-language-check-icon {
      width: 14px;
      height: 14px;
      color: var(--foreground);
      font-size: inherit;
      stroke: var(--foreground);
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-overflow-option-icon {
      width: 16px;
      height: 16px;
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.15;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-overflow-switch {
      position: relative;
      width: var(--space-5);
      height: var(--space-3);
      justify-self: end;
      border-radius: 999px;
      background: rgba(8, 11, 16, 0.14);
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.08);
      overflow: visible;
      transition:
        background 160ms ease,
        box-shadow 160ms ease;
    }

    .wp-overflow-switch-knob {
      position: absolute;
      top: 4px;
      left: 4px;
      width: var(--space-2);
      height: var(--space-2);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 1px 3px rgba(8, 11, 16, 0.24);
      transition: transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-overflow-switch.is-on {
      background: rgba(8, 11, 16, 0.84);
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.16);
    }

    .wp-overflow-switch.is-on .wp-overflow-switch-knob {
      transform: translateX(var(--space-2));
    }

    .wp-overflow-divider {
      height: 1px;
      margin: var(--space-1) 0;
      background: rgba(8, 11, 16, 0.1);
    }

    .wp-overflow-chevron {
      width: 16px;
      height: 16px;
      justify-self: end;
      color: rgba(8, 11, 16, 0.42);
      overflow: visible;
    }

    .wp-theme-graphite .wp-overflow-menu {
      --wp-overflow-option-color: rgba(244, 244, 240, 0.72);
      --wp-overflow-option-hover-color: rgba(255, 255, 250, 0.96);
      --wp-overflow-divider-bg: rgba(255, 255, 255, 0.1);
      --wp-overflow-switch-bg: rgba(255, 255, 255, 0.14);
      --wp-overflow-switch-border: rgba(255, 255, 255, 0.1);
      --wp-overflow-switch-on-bg: rgba(244, 244, 240, 0.9);
      --wp-overflow-switch-on-border: rgba(255, 255, 255, 0.42);
      --wp-overflow-switch-knob-bg: rgba(255, 255, 255, 0.96);
      --wp-overflow-switch-knob-shadow: rgba(0, 0, 0, 0.34);
      --wp-overflow-switch-knob-on-bg: rgba(8, 11, 16, 0.92);
      --wp-overflow-select-bg: rgba(255, 255, 255, 0.1);
      --wp-overflow-select-border: rgba(255, 255, 255, 0.16);
      --wp-overflow-select-color: rgba(255, 255, 250, 0.92);
    }

    .wp-theme-graphite .wp-overflow-option {
      color: rgba(244, 244, 240, 0.72);
    }

    .wp-theme-graphite .wp-overflow-option:hover,
    .wp-theme-graphite .wp-overflow-option:focus-visible {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 250, 0.96);
    }

    .wp-theme-graphite .wp-overflow-language-trigger:hover,
    .wp-theme-graphite .wp-overflow-language-trigger:focus-visible,
    .wp-theme-graphite .wp-overflow-language-root.is-open .wp-overflow-language-trigger {
      outline-color: rgba(244, 244, 240, 0.34);
    }

    .wp-theme-graphite .wp-language-menu {
      border-color: var(--wp-popover-border);
      background:
        var(--wp-chrome-iridescent),
        var(--wp-popover-bg);
      box-shadow: var(--wp-popover-shadow);
    }

    .wp-theme-graphite .wp-language-option {
      color: rgba(244, 244, 240, 0.82);
    }

    .wp-theme-graphite .wp-language-option:hover,
    .wp-theme-graphite .wp-language-option:focus-visible {
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 250, 0.96);
    }

    .wp-theme-graphite .wp-language-option.is-selected {
      background: rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 250, 0.98);
    }

    .wp-theme-graphite .wp-language-chevron {
      color: rgba(244, 244, 240, 0.54);
    }

    .wp-theme-graphite .wp-language-check-icon {
      color: rgba(255, 255, 250, 0.92);
      stroke: currentColor;
    }

    .wp-theme-graphite .wp-overflow-switch {
      background: rgba(255, 255, 255, 0.14);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .wp-theme-graphite .wp-overflow-switch.is-on {
      background: rgba(244, 244, 240, 0.9);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.42);
    }

    .wp-theme-graphite .wp-overflow-switch.is-on .wp-overflow-switch-knob {
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
