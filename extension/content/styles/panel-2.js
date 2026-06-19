function panelStylesChunk2() {
  return `      gap: 8px;
      flex: 0 0 auto;
    }

    .wp-summary {
      display: inline-flex;
      align-items: baseline;
      gap: 6px;
      min-width: 0;
      flex: 1 1 auto;
      color: var(--foreground);
      font-size: var(--text-ui);
      line-height: 1;
      white-space: nowrap;
    }

    .wp-count {
      font-weight: 400;
    }

    .wp-total {
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      border: 1px solid rgba(255, 255, 255, 0.48);
      border-radius: 999px;
      color: var(--foreground);
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(230, 238, 255, 0.52) 38%, rgba(255, 229, 245, 0.44) 72%, rgba(255, 255, 255, 0.66)),
        rgba(255, 255, 255, 0.75);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-weight: 780;
      box-shadow: none;
      white-space: nowrap;
    }

    .wp-icon-button {
      position: relative;
      width: 40px;
      height: 40px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      color: var(--foreground);
      box-shadow: none;
    }

    .wp-icon-button.is-active {
      color: var(--foreground);
      background: transparent;
    }

    .wp-filter:hover,
    .wp-text-button:hover {
      background: var(--hover);
    }

    .wp-icon-button:hover,
    .wp-icon-button.is-active:hover {
      background: transparent;
      color: var(--muted);
    }

    .wp-lucide {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-remove::before,
    .wp-remove::after,
    .wp-remove-category::before,
    .wp-remove-category::after {
      content: "";
      position: absolute;
      width: 13px;
      height: 1.5px;
      border-radius: var(--radius);
      background: currentColor;
    }

    .wp-remove::before,
    .wp-remove-category::before {
      transform: rotate(45deg);
    }

    .wp-remove::after,
    .wp-remove-category::after {
      transform: rotate(-45deg);
    }

    .wp-popover {
      position: absolute;
      top: 72px;
      right: 24px;
      z-index: 7;
      width: min(352px, calc(100% - 48px));
      padding: 16px;
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: var(--radius);
      background: #fff;
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.9) inset,
        0 18px 44px rgba(15, 23, 42, 0.14);
      animation: wpPanelIn 160ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-settings.wp-popover {
      width: min(336px, calc(100% - 48px));
      max-height: min(560px, calc(100vh - 116px));
      padding: 16px;
      overflow-y: auto;
      scrollbar-width: none;
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(60, 60, 67, 0.16);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.88) inset,
        0 24px 54px rgba(0, 0, 0, 0.18);
    }

    .wp-settings.wp-popover::-webkit-scrollbar {
      display: none;
    }

    .wp-settings[hidden] {
      display: none;
    }

    .wp-settings-head {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: 0;
      margin: 0 0 8px;
    }

    .wp-settings h2 {
      margin: 0;
      font-size: var(--text-heading);
      line-height: 1.2;
      font-weight: 780;
      letter-spacing: 0;
    }

    .wp-text-button,
    .wp-category-form button {
      height: 32px;
      padding: 0 12px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: var(--text-control);
      font-weight: 700;
    }

    .wp-text-button {
      height: auto;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--muted);
      font-size: var(--text-control);
      font-weight: 680;
    }

    .wp-settings-section {
      display: grid;
      gap: 8px;
      padding: 0;
      margin-top: 16px;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    .wp-settings-section + .wp-settings-section {
      padding-top: 16px;
      margin-top: 16px;
      border-top: 1px solid rgba(60, 60, 67, 0.12);
    }

    .wp-settings-section-title,
    .wp-settings-section-head {
      color: var(--muted);
      font-size: var(--text-caption);
      line-height: 1;
      font-weight: 700;
      margin: 0;
    }

    .wp-settings-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .wp-settings-row {
      width: 100%;
      min-height: 40px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 16px;
      padding: 0;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
    }

    .wp-settings-row + .wp-settings-row {`;
}
