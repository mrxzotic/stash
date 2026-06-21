function panelSortStyles() {
  return `
    .wp-sort-controls {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      width: 0;
      min-width: 0;
      padding: 1px;
      border: 1px solid rgba(8, 11, 16, 0.06);
      border-radius: 999px;
      background: rgba(8, 11, 16, 0.032);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58);
      opacity: 0;
      visibility: hidden;
      overflow: hidden;
      pointer-events: none;
      transform: scale(0.96);
      transform-origin: right center;
      transition:
        opacity 140ms ease,
        transform 160ms cubic-bezier(.16, 1, .3, 1),
        visibility 0s linear 140ms;
    }

    .wp-filters.is-controls-visible .wp-sort-controls,
    .wp-filters:focus-within .wp-sort-controls {
      width: 104px;
      min-width: 104px;
      opacity: 1;
      visibility: visible;
      overflow: visible;
      pointer-events: auto;
      transform: scale(1);
      transition-delay: 0s;
    }

    .wp-sort-button {
      width: 48px;
      height: calc(var(--wp-pill-height) - 2px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 6px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: rgba(8, 11, 16, 0.54);
      transition:
        background 140ms ease,
        color 140ms ease,
        opacity 140ms ease,
        box-shadow 140ms ease;
    }

    .wp-sort-button:hover,
    .wp-sort-button:focus-visible {
      color: rgba(8, 11, 16, 0.84);
      background: rgba(255, 255, 255, 0.52);
      outline: 0;
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.05);
    }

    .wp-sort-button:disabled {
      opacity: 0.34;
      cursor: default;
      pointer-events: none;
    }

    .wp-sort-label {
      font-family: var(--figure-font);
      font-size: 10px;
      font-weight: 760;
      line-height: 1;
      letter-spacing: 0;
      white-space: nowrap;
    }

    .wp-sort-arrow {
      width: var(--wp-pill-icon-size);
      height: var(--wp-pill-icon-size);
      font-size: var(--wp-pill-icon-size);
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.78;
    }

    .wp-theme-graphite .wp-sort-controls {
      border-color: rgba(244, 244, 240, 0.1);
      background: rgba(244, 244, 240, 0.06);
      box-shadow: inset 0 1px 0 rgba(244, 244, 240, 0.06);
    }

    .wp-theme-graphite .wp-sort-button {
      background: transparent;
      color: rgba(244, 244, 240, 0.58);
    }

    .wp-theme-graphite .wp-sort-button:hover,
    .wp-theme-graphite .wp-sort-button:focus-visible {
      background: rgba(244, 244, 240, 0.1);
      color: rgba(244, 244, 240, 0.86);
      box-shadow: inset 0 0 0 1px rgba(244, 244, 240, 0.06);
    }

    @media (hover: none) {
      .wp-sort-controls {
        width: 104px;
        min-width: 104px;
        opacity: 1;
        visibility: visible;
        overflow: visible;
        pointer-events: auto;
        transform: scale(1);
      }
    }
  `;
}
