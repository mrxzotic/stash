function panelLayoutTailStyles() {
  return `
    .wp-empty {
      position: absolute;
      top: var(--wp-items-padding-top, 104px);
      bottom: 48px;
      left: 50%;
      width: min(calc(100% - 48px), 340px);
      min-height: 0;
      display: grid;
      place-items: center;
      color: var(--muted);
      text-align: center;
      font-size: var(--text-body);
      line-height: 1.4;
      pointer-events: none;
      transform: translateX(-50%);
    }

    .wp-empty > div {
      display: grid;
      justify-items: center;
      gap: 8px;
      width: 100%;
    }

    .wp-empty-logo { width: 56px; height: 56px; margin-bottom: 2px; display: block; object-fit: contain; }

    .wp-empty-line-icon {
      display: none;
      width: 36px;
      height: 36px;
      margin-bottom: 6px;
      color: rgba(244, 244, 240, 0.68);
    }

    .wp-empty-state-icon { width: 44px; height: 44px; margin-bottom: 10px; color: rgba(8, 11, 16, 0.34); }

    .wp-theme-graphite .wp-empty-logo {
      display: none;
    }

    .wp-theme-graphite .wp-empty-line-icon {
      display: inline-block;
    }

    .wp-theme-graphite .wp-empty-state-icon {
      color: rgba(244, 244, 240, 0.58);
    }

    .wp-empty strong {
      display: block;
      color: var(--foreground);
      font-size: var(--text-heading);
    }

    .wp-empty-action {
      margin-top: 2px;
      padding: 0;
      border: 0;
      background: transparent;
      color: rgba(8, 11, 16, 0.68);
      font: inherit;
      font-size: var(--text-body);
      font-weight: 760;
      line-height: 1.2;
      text-decoration: underline;
      text-underline-offset: 3px;
      cursor: pointer;
      pointer-events: auto;
    }

    .wp-empty-action:hover,
    .wp-empty-action:focus-visible {
      outline: 0;
      color: var(--foreground);
    }

    @media (max-width: 560px) {
      :host {
        --panel-top: 48px;
        --panel-right: 12px;
        --panel-vertical-space: 60px;
      }

      .wp-shell {
        top: var(--panel-top);
        right: var(--panel-right);
        left: var(--panel-right);
        width: auto;
        height: calc(100vh - var(--panel-vertical-space));
        max-height: calc(100vh - var(--panel-vertical-space));
        border-radius: var(--radius);
      }
    }

    .wp-shell:not(.is-static) .wp-topbar,
    .wp-shell:not(.is-static) .wp-filters,
    .wp-shell:not(.is-static) .wp-items {
      opacity: 0;
      transform: translate3d(0, 8px, 0);
      filter: blur(6px);
      animation: wpPanelChromeIn 360ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-shell:not(.is-static) .wp-topbar {
      animation-delay: 70ms;
    }

    .wp-shell:not(.is-static) .wp-filters {
      animation-delay: 110ms;
    }

    .wp-shell:not(.is-static) .wp-items {
      animation-name: wpPanelItemsIn;
      animation-delay: 150ms;
    }

    .wp-shell:not(.is-static) .wp-item-column .wp-item:nth-child(1),
    .wp-shell:not(.is-static) .wp-compact-item:nth-child(1),
    .wp-shell:not(.is-static) .wp-brand-cloud-item:nth-child(1) {
      animation-delay: 180ms;
    }

    .wp-shell:not(.is-static) .wp-item-column .wp-item:nth-child(2),
    .wp-shell:not(.is-static) .wp-compact-item:nth-child(2),
    .wp-shell:not(.is-static) .wp-brand-cloud-item:nth-child(2) {
      animation-delay: 215ms;
    }

    .wp-shell:not(.is-static) .wp-item-column .wp-item:nth-child(3),
    .wp-shell:not(.is-static) .wp-compact-item:nth-child(3),
    .wp-shell:not(.is-static) .wp-brand-cloud-item:nth-child(3) {
      animation-delay: 250ms;
    }

    .wp-shell:not(.is-static) .wp-item-column .wp-item:nth-child(4),
    .wp-shell:not(.is-static) .wp-compact-item:nth-child(4),
    .wp-shell:not(.is-static) .wp-brand-cloud-item:nth-child(4) {
      animation-delay: 285ms;
    }

    .wp-shell:not(.is-static) .wp-item-column .wp-item:nth-child(n + 5),
    .wp-shell:not(.is-static) .wp-compact-item:nth-child(n + 5),
    .wp-shell:not(.is-static) .wp-brand-cloud-item:nth-child(n + 5) {
      animation-delay: 320ms;
    }

    .wp-shell.is-closing .wp-topbar,
    .wp-shell.is-closing .wp-filters,
    .wp-shell.is-closing .wp-items,
    .wp-shell.is-closing .wp-item {
      pointer-events: none;
    }

    @keyframes wpPanelIn {
      from {
        opacity: 0;
        transform: translateY(-12px) scale(.982);
        filter: blur(10px) saturate(.96);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0) saturate(1);
      }
    }

    @keyframes wpPanelOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0) saturate(1);
      }

      to {
        opacity: 0;
        transform: translateY(-8px) scale(.986);
        filter: blur(7px) saturate(.96);
      }
    }

    @keyframes wpPanelChromeIn {
      from {
        opacity: 0;
        transform: translate3d(0, 8px, 0);
        filter: blur(6px);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        filter: blur(0);
      }
    }

    @keyframes wpPanelItemsIn {
      from {
        opacity: 0;
        transform: translate3d(0, 10px, 0) scale(.992);
        filter: blur(7px);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpItemIn {
      from {
        opacity: 0;
        transform: translate3d(0, 10px, 0) scale(.992);
        filter: blur(4px);
      }

      to {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpSearchIn {
      from {
        opacity: 0;
        transform: translateX(14px) scaleX(.965);
        filter: blur(5px);
      }

      to {
        opacity: 1;
        transform: translateX(0) scaleX(1);
        filter: blur(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-shell,
      .wp-shell:not(.is-static) .wp-topbar,
      .wp-shell:not(.is-static) .wp-filters,
      .wp-shell:not(.is-static) .wp-items,
      .wp-shell:not(.is-static) .wp-item,
      .wp-shell:not(.is-static) .wp-compact-item,
      .wp-shell:not(.is-static) .wp-brand-cloud-item {
        opacity: 1;
        transform: none;
        filter: none;
        animation: none;
      }
    }
  `;
}
