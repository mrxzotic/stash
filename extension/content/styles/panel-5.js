function panelStylesChunk5() {
  return `

    .wp-brand,
    .wp-brand:link,
    .wp-brand:visited,
    .wp-brand:hover,
    .wp-brand:focus-visible {
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

    .wp-item-title,
    .wp-item-title:link,
    .wp-item-title:visited,
    .wp-item-title:hover,
    .wp-item-title:focus-visible {
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

    .wp-summary-brand-filter {
      display: inline-flex;
      align-items: center;
      min-width: 0;
      max-width: 100%;
    }

    .wp-summary-brand-pill {
      height: 28px;
      min-width: 0;
      max-width: min(190px, 42vw);
      display: inline-grid;
      grid-template-columns: minmax(0, 1fr) 18px;
      align-items: center;
      gap: 6px;
      padding: 0 6px 0 12px;
      border: 1px solid rgba(8, 11, 16, 0.84);
      border-radius: 999px;
      background: rgba(8, 11, 16, 0.84);
      color: var(--primary-foreground);
      font-size: var(--text-control);
      font-weight: 720;
      line-height: 1;
    }

    .wp-summary-brand-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-summary-brand-clear {
      width: 18px;
      height: 18px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: currentColor;
      opacity: 0.74;
      cursor: pointer;
    }

    .wp-summary-brand-clear:hover,
    .wp-summary-brand-clear:focus-visible {
      outline: 0;
      opacity: 1;
    }

    .wp-brand-cloud-item {
      position: relative;
      min-height: 28px;
      padding: 0 5px 5px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      text-align: inherit;
      appearance: none;
      cursor: pointer;
      overflow: visible;
      isolation: isolate;
      transition:
        color 160ms ease,
        opacity 160ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-cloud::before {
      content: "";
      position: absolute;
      inset: 20% -4% 14%;
      z-index: -1;
      border-radius: 8px;
      background:
        linear-gradient(105deg, transparent 4%, rgba(116, 196, 255, 0.18) 28%, rgba(255, 151, 218, 0.16) 52%, rgba(179, 255, 207, 0.14) 76%, transparent 96%),
        linear-gradient(22deg, transparent 16%, rgba(255, 255, 255, 0.5) 48%, transparent 82%);
      filter: blur(32px);
      opacity: 0.64;
      pointer-events: none;
    }

    .wp-brand-cloud-item::before {
      content: "";
      position: absolute;
      inset: -3px -8px 0;
      z-index: -1;
      border-radius: inherit;
      background:
        radial-gradient(circle at 18% 18%, rgba(115, 196, 255, 0.72), transparent 38%),
        radial-gradient(circle at 82% 16%, rgba(255, 144, 221, 0.64), transparent 42%),
        radial-gradient(circle at 52% 100%, rgba(174, 255, 196, 0.54), transparent 42%),
        rgba(255, 255, 255, 0.5);
      opacity: 0;
      transform: scaleX(0.74);
      transform-origin: left center;
      transition:
        opacity 180ms ease,
        transform 240ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-cloud-item::after {
      content: "";
      position: absolute;
      left: 10px;
      right: 10px;
      bottom: 5px;
      height: 1px;
      background: currentColor;
      opacity: 0.5;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-cloud-item:hover,
    .wp-brand-cloud-item:focus-visible {
      outline: 0;
      color: var(--foreground);
      transform: translateY(-2px);
    }

    .wp-brand-cloud-item:hover::before,
    .wp-brand-cloud-item:focus-visible::before {
      opacity: 0.72;
      transform: scaleX(1);
    }

    .wp-brand-cloud-item:hover::after,
    .wp-brand-cloud-item:focus-visible::after {
      transform: scaleX(1);
    }

    .wp-brand-cloud-name {
      transition: font-weight 160ms ease;
    }

    .wp-brand-cloud-item:hover .wp-brand-cloud-name,
    .wp-brand-cloud-item:focus-visible .wp-brand-cloud-name {
      font-weight: 820;
    }

    .wp-compact-copy .wp-item-title {
      font-size: var(--text-control);
      line-height: 1.18;
      font-weight: 670;
      -webkit-line-clamp: 2;
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
