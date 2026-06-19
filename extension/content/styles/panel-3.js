function panelStylesChunk3() {
  return `      margin-top: 0;
      border-top: 0;
    }

    .wp-settings-row > span {
      color: var(--foreground);
      font-size: var(--text-body);
      font-weight: 720;
    }

    .wp-select {
      position: relative;
      width: 128px;
      min-width: 128px;
      display: flex;
      justify-content: flex-end;
    }

    .wp-select-trigger {
      height: 32px;
      width: 100%;
      min-width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 8px 0 12px;
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: var(--radius);
      background: #fff;
      color: var(--foreground);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      font-size: var(--text-body);
      font-weight: 700;
      letter-spacing: 0;
    }

    .wp-select-value {
      width: 100%;
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: baseline;
      gap: 8px;
    }

    .wp-select-value > span:first-child {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-select-symbol {
      display: inline-block;
      min-width: 0;
      color: rgba(8, 11, 16, 0.5);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-weight: 680;
      white-space: nowrap;
    }

    .wp-select-trigger:focus-visible {
      outline: 2px solid rgba(0, 0, 0, 0.18);
      outline-offset: 2px;
    }

    .wp-select-chevron {
      width: 14px;
      height: 14px;
      stroke: var(--muted);
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 140ms ease;
    }

    .wp-select-trigger[aria-expanded="true"] .wp-select-chevron {
      transform: rotate(180deg);
    }

    .wp-select-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 12;
      width: 160px;
      max-height: 224px;
      display: grid;
      gap: 4px;
      padding: 4px;
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: var(--radius);
      background: #fff;
      overflow-y: auto;
      scrollbar-width: none;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.9) inset,
        0 14px 34px rgba(15, 23, 42, 0.16);
    }

    .wp-select-menu::-webkit-scrollbar {
      display: none;
    }

    .wp-select-menu[hidden] {
      display: none;
    }

    .wp-select-option {
      width: 100%;
      height: 32px;
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--foreground);
      font-size: var(--text-body);
      font-weight: 650;
      text-align: left;
      white-space: nowrap;
    }

    .wp-select-option > span:nth-child(2) {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-select-option:hover,
    .wp-select-option:focus-visible,
    .wp-select-option.is-selected {
      outline: 0;
      background: #f3f4f6;
    }

    .wp-select-check-slot {
      width: 16px;
      height: 16px;
      display: inline-grid;
      place-items: center;
    }

    .wp-select-check {
      width: 14px;
      height: 14px;
      stroke: var(--foreground);
      stroke-width: 2.4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-category-list {
      max-height: 160px;
      display: grid;
      gap: 4px;
      overflow-y: auto;
      scrollbar-width: none;
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    .wp-category-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 32px;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 0;
      border-radius: var(--radius);
    }

    .wp-category-row + .wp-category-row {
      border-top: 0;
    }

    .wp-category-row input,
    .wp-category-form input,
    .wp-search input {
      width: 100%;
      border: 1px solid var(--input);
      border-radius: var(--radius);
      outline: 0;
      background: var(--card);
      color: var(--foreground);
      font-weight: 620;
    }

    .wp-category-row input,
    .wp-category-form input {
      height: 32px;
      padding: 0;
      font-size: var(--text-body);
    }

    .wp-category-row input {
      height: 40px;
      border: 0;
      background: transparent;
    }

    .wp-category-row:focus-within {
      border-radius: var(--radius);
      background: rgba(0, 0, 0, 0.03);
    }

    .wp-category-row input:focus,
    .wp-category-form input:focus,
    .wp-search input:focus {
      border-color: #171717;
    }

    .wp-remove-category {`;
}
