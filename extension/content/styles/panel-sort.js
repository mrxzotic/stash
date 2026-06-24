function panelSortStyles() {
  return `
    .wp-sort-controls {
      position: relative;
      flex: 0 0 auto;
      min-width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      align-self: center;
      isolation: isolate;
    }

    .wp-sort-trigger {
      position: relative;
      height: var(--wp-pill-height);
      min-width: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      padding: 0 9px;
      border: 1px solid var(--wp-chrome-border);
      border-radius: 999px;
      background: var(--wp-chrome-bg);
      color: var(--foreground);
      -webkit-backdrop-filter: var(--wp-chrome-blur);
      backdrop-filter: var(--wp-chrome-blur);
      box-shadow: none;
      overflow: hidden;
      transition:
        background 220ms cubic-bezier(.22, 1, .36, 1),
        border-color 220ms cubic-bezier(.22, 1, .36, 1),
        transform 260ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-sort-trigger:hover,
    .wp-sort-trigger:focus-visible,
    .wp-sort-controls.is-open .wp-sort-trigger {
      outline: 0;
      border-color: rgba(8, 11, 16, 0.18);
      background: var(--wp-chrome-bg-hover);
      transform: translate3d(0, -1px, 0);
    }

    .wp-sort-trigger-icon {
      width: 15px;
      height: 15px;
      flex: 0 0 15px;
      font-size: 15px;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.72;
    }

    .wp-sort-current {
      min-width: 0;
      max-width: 0;
      margin-left: 0;
      margin-right: 0;
      color: rgba(8, 11, 16, 0.64);
      font-family: var(--ui-font);
      font-size: var(--text-control);
      font-weight: 760;
      line-height: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transform: translate3d(-3px, 0, 0);
      transition:
        max-width 280ms cubic-bezier(.18, .84, .24, 1),
        margin-left 280ms cubic-bezier(.18, .84, .24, 1),
        margin-right 280ms cubic-bezier(.18, .84, .24, 1),
        opacity 210ms ease,
        transform 280ms cubic-bezier(.18, .84, .24, 1);
      will-change: max-width, opacity, transform;
    }

    .wp-sort-trigger:hover .wp-sort-current,
    .wp-sort-trigger:focus-visible .wp-sort-current,
    .wp-sort-controls.is-open .wp-sort-current {
      max-width: 42px;
      margin-left: 6px;
      margin-right: 5px;
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .wp-sort-chevron {
      width: 13px;
      height: 13px;
      font-size: 13px;
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.62;
      transition: transform 260ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-sort-controls.is-open .wp-sort-chevron {
      transform: rotate(180deg);
    }

    .wp-sort-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 9;
      width: 170px;
      display: grid;
      gap: 2px;
      padding: 6px;
      border-radius: 14px;
      transform-origin: top right;
      animation: wpSortMenuIn 180ms cubic-bezier(.18, .9, .22, 1) both;
    }

    .wp-sort-menu[hidden] {
      display: none !important;
    }

    .wp-sort-option {
      min-width: 0;
      height: 32px;
      display: grid;
      grid-template-columns: 18px minmax(0, 1fr);
      align-items: center;
      gap: 6px;
      padding: 0 10px 0 7px;
      border: 0;
      border-radius: 9px;
      background: transparent;
      color: rgba(8, 11, 16, 0.66);
      text-align: left;
      font-size: var(--text-body);
      font-weight: 700;
      transition:
        background 180ms cubic-bezier(.22, 1, .36, 1),
        color 180ms cubic-bezier(.22, 1, .36, 1),
        transform 220ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-sort-option:hover,
    .wp-sort-option:focus-visible,
    .wp-sort-option.is-selected {
      outline: 0;
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-sort-option:active {
      transform: scale(0.98);
    }

    .wp-sort-check {
      width: 18px;
      height: 18px;
      display: grid;
      place-items: center;
      color: currentColor;
    }

    .wp-sort-check-icon {
      width: 14px;
      height: 14px;
      font-size: 14px;
      stroke: currentColor;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-sort-option-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-theme-graphite .wp-sort-trigger {
      border-color: var(--wp-chrome-border);
      background: var(--wp-chrome-bg);
      color: rgba(244, 244, 240, 0.92);
    }

    .wp-theme-graphite .wp-sort-trigger:hover,
    .wp-theme-graphite .wp-sort-trigger:focus-visible,
    .wp-theme-graphite .wp-sort-controls.is-open .wp-sort-trigger {
      border-color: rgba(244, 244, 240, 0.18);
      background: var(--wp-chrome-bg-hover);
    }

    .wp-theme-graphite .wp-sort-current {
      color: rgba(244, 244, 240, 0.76);
    }

    .wp-theme-graphite .wp-sort-option {
      color: rgba(244, 244, 240, 0.66);
    }

    .wp-theme-graphite .wp-sort-option:hover,
    .wp-theme-graphite .wp-sort-option:focus-visible,
    .wp-theme-graphite .wp-sort-option.is-selected {
      background: rgba(244, 244, 240, 0.1);
      color: rgba(255, 255, 250, 0.96);
    }

    @keyframes wpSortMenuIn {
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
      .wp-sort-trigger,
      .wp-sort-current,
      .wp-sort-chevron,
      .wp-sort-menu,
      .wp-sort-option {
        animation: none;
        transition: none;
        transform: none;
      }
    }
  `;
}
