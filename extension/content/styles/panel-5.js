function panelStylesChunk5() {
  return `    }

    .wp-brand {
      min-width: 0;
      color: rgba(8, 11, 16, 0.5);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-caption);
      line-height: 1.1;
      font-weight: 650;
      text-decoration: none;
      text-transform: uppercase;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-item-title {
      display: -webkit-box;
      min-width: 0;
      color: var(--foreground);
      font-size: var(--text-ui);
      line-height: 1.16;
      font-weight: 760;
      letter-spacing: 0;
      text-decoration: none;
      overflow: hidden;
      overflow-wrap: anywhere;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .wp-source-icon {
      position: relative;
      width: 20px;
      height: 20px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: rgba(16, 16, 16, 0.48);
      text-decoration: none;
      overflow: hidden;
    }

    .wp-source-fallback {
      font-family: var(--figure-font);
      font-size: var(--text-micro);
      line-height: 1;
      font-weight: 700;
      transition: opacity 160ms ease;
    }

    .wp-source-icon.has-favicon .wp-source-fallback {
      opacity: 0;
    }

    .wp-source-favicon {
      position: absolute;
      inset: 2px;
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      display: block;
      object-fit: contain;
      object-position: center;
      z-index: 1;
    }

    .wp-site-price,
    .wp-compare-price {
      color: rgba(8, 11, 16, 0.5);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-control);
      line-height: 1.2;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wp-site-price.is-sale {
      color: #d92d20;
    }

    .wp-compare-price {
      font-weight: 650;
      min-width: 0;
    }

    .wp-empty {
      grid-column: 1 / -1;
      min-height: 430px;
      display: grid;
      place-items: center;
      color: rgba(16, 16, 16, 0.46);
      text-align: center;
      font-size: var(--text-body);
      line-height: 1.4;
    }

    .wp-empty > div {
      display: grid;
      justify-items: center;
      gap: 8px;
    }

    .wp-empty-tee {
      width: 96px;
      height: 96px;
      margin-bottom: 4px;
      stroke: rgba(16, 16, 16, 0.2);
      stroke-width: 4;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-empty strong {
      display: block;
      color: var(--foreground);
      font-size: var(--text-heading);
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

    @keyframes wpPanelCloseIn {
      from {
        opacity: 0;
        transform: translateY(4px) scale(.92);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes wpItemIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes wpSearchIn {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(.985);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

  `;
}
