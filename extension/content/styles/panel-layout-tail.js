function panelLayoutTailStyles() {
  return `
    .wp-empty {
      position: absolute;
      top: var(--wp-items-padding-top, 112px);
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

    @keyframes wpPanelIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(.98);
        filter: blur(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
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
  `;
}
