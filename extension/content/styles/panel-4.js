function panelStylesChunk4() {
  return `      width: 32px;
      height: 32px;
      box-shadow: none;
      color: var(--muted);
    }

    .wp-category-form {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      padding-top: 8px;
      margin-top: 8px;
      border-top: 1px solid rgba(60, 60, 67, 0.1);
    }

    .wp-category-form input {
      padding: 0 12px;
      background: #fff;
    }

    .wp-inline-search {
      position: relative;
      width: 100%;
      height: 40px;
      min-height: 40px;
      display: grid;
      grid-template-columns: 22px minmax(0, 1fr) 26px;
      align-items: center;
      gap: 8px;
      padding: 0 6px 0 12px;
      border: 1px solid rgba(10, 10, 10, 0.08);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.62);
      color: var(--foreground);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.66),
        0 6px 18px rgba(15, 23, 42, 0.04);
      transition:
        border-color 160ms ease,
        background 160ms ease,
        box-shadow 160ms ease;
      transform-origin: right center;
      animation: wpSearchIn 220ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-inline-search:focus-within {
      border-color: rgba(8, 11, 16, 0.18);
      background: rgba(255, 255, 255, 0.78);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.78),
        0 8px 22px rgba(15, 23, 42, 0.06);
    }

    .wp-inline-search-label {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      border: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }

    .wp-inline-search-icon {
      width: 20px;
      height: 20px;
      color: rgba(8, 11, 16, 0.78);
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: color 160ms ease, transform 160ms ease;
    }

    .wp-inline-search:focus-within .wp-inline-search-icon {
      color: var(--foreground);
      transform: scale(1.03);
    }

    .wp-inline-search input {
      width: 100%;
      min-width: 0;
      height: 38px;
      padding: 0;
      border: 0;
      outline: 0;
      background: transparent;
      color: var(--foreground);
      font-size: var(--text-ui);
      font-weight: 620;
      line-height: 1;
    }

    .wp-inline-search input::placeholder {
      color: var(--muted-foreground);
      font-weight: 620;
      transition: color 160ms ease;
    }

    .wp-inline-search:focus-within input::placeholder {
      color: rgba(8, 11, 16, 0.42);
    }

    .wp-clear-search {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--muted);
      opacity: 0;
      pointer-events: none;
      transform: scale(0.82);
      transition:
        opacity 160ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1),
        background 160ms ease,
        color 160ms ease;
    }

    .wp-clear-search.is-visible {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
    }

    .wp-clear-search:hover {
      background: rgba(0, 0, 0, 0.06);
      color: var(--foreground);
    }

    .wp-clear-search:disabled {
      cursor: default;
    }

    .wp-clear-search-icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-filters {
      position: relative;
      z-index: 3;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      margin-bottom: 10px;
    }

    .wp-filter {
      flex: 0 0 auto;
      height: 28px;
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: 999px;
      color: var(--foreground);
      background: rgba(255, 255, 255, 0.5);
      font-size: var(--text-control);
      font-weight: 660;
      transition:
        background 140ms ease,
        color 140ms ease,
        border-color 140ms ease,
        opacity 140ms ease,
        padding 180ms cubic-bezier(.16, 1, .3, 1),
        transform 180ms cubic-bezier(.16, 1, .3, 1),
        width 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-filter-shell {
      position: relative;
      flex: 0 0 auto;
      display: inline-flex;
      max-width: 168px;
      min-width: 0;
      transition: transform 220ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-filter-shell:not(.is-all) .wp-filter {
      padding-right: 12px;
    }

    .wp-filter-shell:not(.is-all):hover .wp-filter,
    .wp-filter-shell:not(.is-all):focus-within .wp-filter {
      padding-right: 28px;
    }

    .wp-filter.is-active {
      color: var(--primary-foreground);
      background: rgba(8, 11, 16, 0.86);
      border-color: rgba(8, 11, 16, 0.86);
      font-weight: 720;
    }

    .wp-filter-remove {
      position: absolute;
      top: 50%;
      right: 7px;
      width: 16px;
      height: 16px;
      display: grid;
      place-items: center;
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

    .wp-filter-shell:hover .wp-filter-remove,
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
      width: 12px;
      height: 12px;
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-filter-add {
      width: 0;
      height: 28px;
      align-self: center;
      padding: 0;
      border-color: transparent;
      background: transparent;
      opacity: 0;
      display: grid;
      place-items: center;
      overflow: hidden;
      pointer-events: none;
      transform: scale(0.84);
    }

    .wp-filters:hover .wp-filter-add,
    .wp-filters:focus-within .wp-filter-add,
    .wp-filter-add:hover,
    .wp-filter-add:focus-visible,
    .wp-filter-add.is-active {
      width: 28px;
      max-width: 28px;
      background: transparent;
      border-color: transparent;
      opacity: 0.62;
      pointer-events: auto;
      transform: scale(1);
    }

    .wp-filter-add:hover,
    .wp-filter-add:focus-visible,
    .wp-filter-add.is-active {
      opacity: 0.82;
    }

    .wp-filter-add-icon {
      width: 15px;
      height: 15px;
      stroke: currentColor;
      stroke-width: 2.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-category-composer.wp-popover {
      top: 126px;
      right: 24px;
      z-index: 8;
      width: min(332px, calc(100% - 48px));
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto 28px;
      align-items: center;
      gap: 8px;
      padding: 8px;
    }

    .wp-category-composer input {
      min-width: 0;
      height: 36px;
      padding: 0 12px;
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: var(--radius);
      outline: 0;
      background: #fff;
      color: var(--foreground);
      font-size: var(--text-body);
      font-weight: 680;
    }

    .wp-category-composer input:focus {
      border-color: rgba(8, 11, 16, 0.36);
    }

    .wp-category-submit {
      height: 36px;
      padding: 0 14px;
      border: 0;
      border-radius: var(--radius);
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: var(--text-body);
      font-weight: 760;
    }

    .wp-category-cancel {
      width: 28px;
      height: 28px;
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
      width: 15px;
      height: 15px;
      stroke: currentColor;
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

`;
}
