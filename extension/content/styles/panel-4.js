function panelStylesChunk4() {
  return `
    .wp-filters {
      position: relative;
      z-index: 3;
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
    }

    .wp-filter-rail {
      min-width: 0;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 2px 2px 8px;
      margin: -2px -2px -8px;
      scroll-padding-inline: 2px 24px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
    }

    .wp-filter-rail::-webkit-scrollbar {
      display: none;
    }

    .wp-filter {
      flex: 0 0 auto;
      height: var(--wp-pill-height);
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--foreground);
      background: rgba(255, 255, 255, 0.5);
      font-size: var(--text-control);
      font-weight: 650;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition:
        background 140ms ease,
        color 140ms ease,
        border-color 140ms ease,
        opacity 140ms ease,
        padding 160ms cubic-bezier(.16, 1, .3, 1),
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-filter-shell {
      position: relative;
      flex: 0 0 auto;
      display: inline-flex;
      max-width: 168px;
      min-width: 0;
      transition: transform 220ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-filter.is-active {
      color: var(--primary-foreground);
      background: rgba(8, 11, 16, 0.86);
      border-color: rgba(8, 11, 16, 0.86);
      font-weight: 720;
    }

    .wp-filter-shell.is-remove-visible .wp-filter,
    .wp-filter-shell:focus-within .wp-filter {
      padding-right: 28px;
    }

    .wp-filter-remove {
      position: absolute;
      top: 50%;
      right: 8px;
      width: 20px;
      height: var(--wp-pill-height);
      display: grid;
      place-items: center;
      z-index: 2;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: currentColor;
      opacity: 0;
      pointer-events: none;
      transform: translate(4px, -50%) scale(0.86);
      transition:
        opacity 160ms ease,
        color 120ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-filter-shell.is-remove-visible .wp-filter-remove,
    .wp-filter-shell:focus-within .wp-filter-remove {
      opacity: 0.74;
      pointer-events: auto;
      transform: translate(0, -50%) scale(1);
    }

    .wp-filter-shell.is-active .wp-filter-remove {
      color: var(--primary-foreground);
    }

    .wp-filter-remove:hover,
    .wp-filter-remove:focus-visible {
      outline: 0;
      opacity: 1;
      background: transparent;
    }

    .wp-filter-shell.is-active .wp-filter-remove:hover,
    .wp-filter-shell.is-active .wp-filter-remove:focus-visible {
      background: transparent;
    }

    .wp-filter-remove-icon {
      width: var(--wp-pill-icon-size);
      height: var(--wp-pill-icon-size);
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-filter-add {
      width: 0;
      max-width: 0;
      height: var(--wp-pill-height);
      align-self: center;
      padding: 0;
      border-color: transparent;
      background: transparent;
      opacity: 0;
      visibility: hidden;
      display: grid;
      place-items: center;
      overflow: hidden;
      pointer-events: none;
      transform: scale(0.84);
      transition:
        opacity 140ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1),
        visibility 0s linear 140ms;
    }

    .wp-filters.is-controls-visible .wp-filter-add,
    .wp-filters:focus-within .wp-filter-add,
    .wp-filter-add:hover,
    .wp-filter-add:focus-visible,
    .wp-filter-add.is-active {
      width: var(--wp-pill-height);
      max-width: var(--wp-pill-height);
      background: transparent;
      border-color: transparent;
      opacity: 0.62;
      visibility: visible;
      pointer-events: auto;
      transform: scale(1);
      transition-delay: 0s;
    }

    .wp-filter-add:hover,
    .wp-filter-add:focus-visible,
    .wp-filter-add.is-active {
      opacity: 0.82;
    }

    .wp-filter-add-icon {
      width: var(--wp-pill-icon-size);
      height: var(--wp-pill-icon-size);
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-category-composer.wp-popover {
      top: 128px;
      right: 24px;
      z-index: 8;
      width: min(332px, calc(100% - 48px));
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto 32px;
      align-items: center;
      gap: 8px;
      padding: 8px;
    }

    .wp-category-composer input {
      min-width: 0;
      height: 40px;
      padding: 0 16px;
      border: 1px solid var(--wp-chrome-border);
      border-radius: var(--radius);
      outline: 0;
      background: var(--wp-chrome-bg);
      color: var(--foreground);
      font-size: var(--text-body);
      font-weight: 680;
      -webkit-backdrop-filter: var(--wp-chrome-blur);
      backdrop-filter: var(--wp-chrome-blur);
    }

    .wp-category-composer input:focus {
      border-color: rgba(8, 11, 16, 0.36);
    }

    .wp-category-submit {
      height: 40px;
      padding: 0 16px;
      border: 0;
      border-radius: var(--radius);
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: var(--text-body);
      font-weight: 760;
    }

    .wp-category-cancel {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
    }

    .wp-category-cancel:hover,
    .wp-category-cancel:focus-visible {
      outline: 0;
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-category-cancel-icon {
      width: 16px;
      height: 16px;
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

`;
}
