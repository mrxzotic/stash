function panelFilterMenuPopoverStyles() {
  return `
    .wp-filter-menu {
      position: absolute;
      top: calc(100% + 2px);
      left: var(--wp-filter-menu-left, 86px);
      z-index: 9;
      width: 190px;
      display: grid;
      gap: 2px;
      padding: 6px;
      border-radius: var(--radius);
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
      border-radius: var(--radius);
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
      border-radius: var(--radius);
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
      width: 18px; height: 18px; display: grid; place-items: center;
    }

    .wp-filter-menu-check-icon,
    .wp-filter-menu-add-icon {
      width: 14px; height: 14px; font-size: inherit;
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
      .wp-brand-chip, .wp-filter-trigger, .wp-filter-trigger-label, .wp-filter-chevron, .wp-filter-menu {
        animation: none;
        transition: none;
        transform: none;
      }
    }
  `;
}
