function panelSaveCurrentStyles() {
  return `
    .wp-brand-save,
    .wp-topbar-info {
      width: 40px;
      height: 40px;
      display: inline-grid;
      place-items: center;
      flex: 0 0 40px;
      padding: 0;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--foreground);
      opacity: 0.64;
      appearance: none;
      cursor: pointer;
      line-height: 1;
      transform: none;
      transition:
        color 140ms ease,
        opacity 140ms ease,
        background 140ms ease,
        box-shadow 140ms ease,
        transform 160ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-topbar-info {
      opacity: 0.22;
    }

    .wp-brand-save:hover,
    .wp-brand-save:focus-visible,
    .wp-topbar-info:hover,
    .wp-topbar-info:focus-visible,
    .wp-topbar-info[aria-expanded="true"] {
      background: rgba(8, 11, 16, 0.06);
      outline: 0;
      transform: none;
    }

    .wp-brand-save:hover,
    .wp-brand-save:focus-visible {
      opacity: 1;
    }

    .wp-topbar-info:hover,
    .wp-topbar-info:focus-visible,
    .wp-topbar-info[aria-expanded="true"] {
      opacity: 0.72;
    }

    .wp-brand-save:active,
    .wp-topbar-info:active {
      transform: scale(0.92);
    }

    .wp-brand-save:disabled,
    .wp-topbar-info:disabled {
      cursor: default;
      opacity: 0.38;
    }

    .wp-topbar-info-icon {
      width: 20px;
      height: 20px;
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.1;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-brand-save-icon {
      width: 22px;
      height: 22px;
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.15;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-theme-graphite .wp-brand-save:hover,
    .wp-theme-graphite .wp-brand-save:focus-visible,
    .wp-theme-graphite .wp-topbar-info:hover,
    .wp-theme-graphite .wp-topbar-info:focus-visible,
    .wp-theme-graphite .wp-topbar-info[aria-expanded="true"] {
      background: rgba(255, 255, 255, 0.08);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    }

  `;
}
