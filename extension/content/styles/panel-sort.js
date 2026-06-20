function panelSortStyles() {
  return `
    .wp-sort-controls {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      width: 0;
      min-width: 0;
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transition:
        opacity 140ms ease,
        filter 140ms ease;
    }

    .wp-filters:hover .wp-sort-controls,
    .wp-filters:focus-within .wp-sort-controls {
      width: 114px;
      opacity: 1;
      overflow: visible;
      pointer-events: auto;
      filter: none;
    }

    .wp-sort-button {
      width: 55px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 8px;
      border: 1px solid rgba(74, 124, 170, 0.22);
      border-radius: 999px;
      background:
        linear-gradient(135deg, rgba(238, 247, 255, 0.92), rgba(217, 232, 246, 0.72)),
        rgba(226, 239, 250, 0.82);
      color: rgba(31, 67, 96, 0.76);
      transition:
        background 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        opacity 140ms ease,
        box-shadow 140ms ease;
    }

    .wp-sort-button:hover,
    .wp-sort-button:focus-visible {
      color: rgba(18, 46, 70, 0.96);
      border-color: rgba(74, 124, 170, 0.34);
      background:
        linear-gradient(135deg, rgba(246, 251, 255, 0.98), rgba(204, 224, 244, 0.86)),
        rgba(216, 234, 248, 0.92);
      outline: 0;
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.86) inset;
    }

    .wp-sort-button.is-active {
      color: rgba(16, 42, 64, 0.98);
      border-color: rgba(61, 108, 154, 0.38);
      background:
        linear-gradient(135deg, rgba(218, 236, 252, 0.98), rgba(184, 214, 241, 0.9)),
        rgba(199, 224, 245, 0.95);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.36),
        0 1px 0 rgba(255, 255, 255, 0.56) inset;
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
      width: 12px;
      height: 12px;
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.78;
    }

    .wp-theme-graphite .wp-sort-button {
      border-color: rgba(139, 174, 205, 0.22);
      background:
        linear-gradient(135deg, rgba(45, 65, 82, 0.64), rgba(31, 43, 55, 0.74)),
        rgba(36, 52, 66, 0.72);
      color: rgba(216, 234, 248, 0.76);
    }

    .wp-theme-graphite .wp-sort-button:hover,
    .wp-theme-graphite .wp-sort-button:focus-visible {
      border-color: rgba(165, 202, 234, 0.34);
      background:
        linear-gradient(135deg, rgba(55, 78, 98, 0.78), rgba(36, 52, 66, 0.86)),
        rgba(43, 63, 80, 0.86);
      color: rgba(236, 247, 255, 0.94);
    }

    .wp-theme-graphite .wp-sort-button.is-active {
      color: rgba(246, 252, 255, 0.98);
      border-color: rgba(177, 215, 248, 0.42);
      background:
        linear-gradient(135deg, rgba(73, 103, 130, 0.88), rgba(47, 71, 92, 0.92)),
        rgba(56, 83, 108, 0.92);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.08),
        0 1px 0 rgba(255, 255, 255, 0.08) inset;
    }

    @media (hover: none) {
      .wp-sort-controls {
        width: 114px;
        opacity: 1;
        overflow: visible;
        pointer-events: auto;
      }
    }
  `;
}
