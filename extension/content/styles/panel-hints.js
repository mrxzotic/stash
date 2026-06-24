function panelHintStyles() {
  return `
    .wp-hint-layer {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 18;
      max-width: min(220px, calc(100% - 24px));
      padding: 7px 10px;
      border: 1px solid rgba(8, 11, 16, 0.1);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.88);
      color: rgba(8, 11, 16, 0.7);
      -webkit-backdrop-filter: blur(22px) saturate(1.18);
      backdrop-filter: blur(22px) saturate(1.18);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.8),
        0 12px 30px rgba(15, 23, 42, 0.12);
      font-family: var(--ui-font);
      font-size: 11px;
      font-weight: 720;
      line-height: 1.1;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0;
      filter: blur(5px);
      pointer-events: none;
      transform: translate3d(var(--wp-hint-x, 0), var(--wp-hint-y, 0), 0);
      transition:
        opacity 190ms cubic-bezier(.22, 1, .36, 1),
        filter 240ms cubic-bezier(.22, 1, .36, 1);
      will-change: opacity, filter;
    }

    .wp-hint-layer.is-visible {
      opacity: 1;
      filter: blur(0);
    }

    .wp-hint-layer[hidden] {
      display: none !important;
    }

    .wp-theme-graphite .wp-hint-layer {
      border-color: rgba(255, 255, 255, 0.14);
      background: rgba(28, 29, 34, 0.9);
      color: rgba(244, 244, 240, 0.78);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        0 16px 34px rgba(0, 0, 0, 0.32);
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-hint-layer {
        transition: none;
        transform: translate3d(var(--wp-hint-x, 0), var(--wp-hint-y, 0), 0);
      }
    }
  `;
}
