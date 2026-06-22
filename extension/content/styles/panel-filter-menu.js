function panelFilterMenuStyles() {
  return `
    .wp-filters {
      gap: 8px;
    }

    .wp-filter-rail {
      justify-self: start;
      width: 100%;
      gap: 8px;
      overflow: hidden;
      padding: 2px 0;
      margin: -2px 0;
      scroll-padding-inline: 0;
    }

    .wp-brand-chip,
    .wp-filter-rail > .wp-filter {
      height: var(--wp-pill-height);
      min-width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.54);
      color: rgba(8, 11, 16, 0.74);
      box-shadow: none;
      font-size: var(--text-control);
      font-weight: 720;
      line-height: 1;
      white-space: nowrap;
    }

    .wp-brand-chip {
      flex: 0 0 auto;
      min-width: 50px;
      gap: 6px;
      padding: 0 10px;
      font-family: var(--figure-font);
      font-size: 12px;
      transition:
        background 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-chip:hover,
    .wp-brand-chip:focus-visible {
      outline: 0;
      border-color: rgba(8, 11, 16, 0.14);
      background: rgba(255, 255, 255, 0.74);
      color: var(--foreground);
      transform: translateY(-1px);
    }

    .wp-brand-chip.is-active {
      color: var(--foreground);
      border-color: rgba(8, 11, 16, 0.14);
      background: rgba(255, 255, 255, 0.76);
      font-weight: 780;
    }

    .wp-filter-rail > .wp-filter.is-active {
      color: var(--primary-foreground);
      border-color: rgba(8, 11, 16, 0.86);
      background: rgba(8, 11, 16, 0.86);
      font-weight: 780;
    }

    .wp-theme-graphite .wp-brand-chip.is-active {
      color: rgba(244, 244, 240, 0.88);
      border-color: rgba(255, 255, 255, 0.22);
      background: rgba(255, 255, 255, 0.08);
    }

    .wp-theme-graphite .wp-filter-rail > .wp-filter.is-active {
      color: #080b10;
      border-color: rgba(255, 255, 255, 0.9);
      background: rgba(244, 244, 240, 0.9);
    }

    .wp-filter-rail > .wp-filter {
      padding: 0 10px;
    }

    .wp-filter-rail > .wp-filter-all {
      flex: 0 0 54px;
    }

    .wp-filter-rail > .wp-filter-trigger {
      flex: 0 1 92px;
      max-width: 92px;
    }

    .wp-filter-rail > .wp-filter-archive {
      flex: 0 0 auto;
      min-width: 50px;
      gap: 6px;
      padding: 0 10px;
    }

    .wp-brand-chip-icon,
    .wp-archive-chip-icon {
      width: 14px;
      height: 14px;
      flex: 0 0 14px;
      font-size: 14px;
      stroke: currentColor;
      stroke-width: 2.25;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-brand-chip-icon {
      width: 20px;
      height: 20px;
      flex-basis: 20px;
      font-size: 20px;
      stroke-width: 1.9;
    }

    .wp-brand-chip-count {
      min-width: 1ch;
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
    }

    .wp-filter-trigger {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 128px;
    }

    .wp-filter-trigger-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-filter-chevron {
      width: 12px;
      height: 12px;
      font-size: 12px;
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.62;
      transition: transform 220ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-filter-trigger[aria-expanded="true"] .wp-filter-chevron {
      transform: rotate(180deg);
    }

    .wp-filter-menu {
      position: absolute;
      top: calc(100% + 2px);
      left: var(--wp-filter-menu-left, 86px);
      z-index: 9;
      width: 190px;
      display: grid;
      gap: 2px;
      padding: 6px;
      border-radius: 14px;
      transform-origin: top left;
      animation: wpFilterMenuIn 180ms cubic-bezier(.18, .9, .22, 1) both;
    }

    .wp-filter-menu[hidden] {
      display: none !important;
    }

    .wp-filter-menu-row {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 28px;
      align-items: center;
      border-radius: 9px;
      color: rgba(8, 11, 16, 0.66);
    }

    .wp-filter-menu-row:hover,
    .wp-filter-menu-row:focus-within,
    .wp-filter-menu-row.is-active {
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-filter-menu-option,
    .wp-filter-menu-add {
      min-width: 0;
      height: 32px;
      display: grid;
      align-items: center;
      gap: 6px;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: left;
      font-size: var(--text-body);
      font-weight: 700;
    }

    .wp-filter-menu-option {
      grid-template-columns: 18px minmax(0, 1fr);
      padding: 0 4px 0 7px;
    }

    .wp-filter-menu-add {
      grid-template-columns: 18px minmax(0, 1fr);
      padding: 0 10px 0 7px;
      border-radius: 9px;
      color: rgba(8, 11, 16, 0.58);
    }

    .wp-filter-menu-add:hover,
    .wp-filter-menu-add:focus-visible {
      outline: 0;
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-filter-menu-check,
    .wp-filter-menu-remove,
    .wp-filter-menu-add-icon {
      width: 18px;
      height: 18px;
      display: grid;
      place-items: center;
    }

    .wp-filter-menu-check-icon,
    .wp-filter-menu-add-icon {
      width: 14px;
      height: 14px;
      font-size: 14px;
      stroke: currentColor;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-filter-menu-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-filter-menu-remove {
      justify-self: center;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: currentColor;
      opacity: 0.44;
    }

    .wp-filter-menu-remove:hover,
    .wp-filter-menu-remove:focus-visible {
      outline: 0;
      opacity: 0.88;
    }

    .wp-theme-graphite .wp-filter-menu-row {
      color: rgba(244, 244, 240, 0.66);
    }

    .wp-theme-graphite .wp-filter-menu-row:hover,
    .wp-theme-graphite .wp-filter-menu-row:focus-within,
    .wp-theme-graphite .wp-filter-menu-row.is-active,
    .wp-theme-graphite .wp-filter-menu-add:hover,
    .wp-theme-graphite .wp-filter-menu-add:focus-visible {
      background: rgba(244, 244, 240, 0.1);
      color: rgba(255, 255, 250, 0.96);
    }

    .wp-theme-graphite .wp-filter-menu-add {
      color: rgba(244, 244, 240, 0.58);
    }

    @keyframes wpFilterMenuIn {
      0% {
        opacity: 0;
        transform: translate3d(0, -4px, 0) scale(.985);
        filter: blur(4px);
      }
      100% {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        filter: blur(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-filter-chevron,
      .wp-filter-menu {
        animation: none;
        transition: none;
        transform: none;
      }
    }
  `;
}
