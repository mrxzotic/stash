function panelContentStyles() {
  return `
    .wp-dialog-backdrop {
      position: absolute;
      inset: 0;
      z-index: 10;
      background: rgba(8, 11, 16, 0.16);
      -webkit-backdrop-filter: blur(12px) saturate(1.08);
      backdrop-filter: blur(12px) saturate(1.08);
    }

    .wp-confirm-dialog {
      position: absolute;
      top: 50%;
      left: 24px;
      right: 24px;
      z-index: 11;
      width: auto;
      max-width: 300px;
      min-width: 0;
      margin-inline: auto;
      display: grid;
      gap: 8px;
      padding: 18px;
      border: 1px solid var(--wp-popover-border);
      border-radius: var(--radius);
      background: var(--wp-popover-bg);
      color: var(--foreground);
      -webkit-backdrop-filter: var(--wp-popover-blur);
      backdrop-filter: var(--wp-popover-blur);
      box-shadow: var(--wp-popover-shadow);
      overflow: hidden;
      transform: translateY(-50%);
      animation: wpPanelIn 140ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-confirm-dialog h3,
    .wp-confirm-dialog p {
      margin: 0;
    }

    .wp-confirm-dialog h3 {
      font-size: var(--text-heading);
      line-height: 1.15;
      font-weight: 780;
      overflow-wrap: anywhere;
    }

    .wp-confirm-dialog p {
      color: var(--muted);
      font-size: var(--text-body);
      line-height: 1.3;
      font-weight: 620;
      overflow-wrap: anywhere;
    }

    .wp-confirm-actions {
      min-width: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding-top: 8px;
    }

    .wp-confirm-cancel,
    .wp-confirm-delete {
      height: 36px;
      min-width: 0;
      border: 0;
      border-radius: var(--radius);
      font-size: var(--text-body);
      font-weight: 760;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-confirm-cancel {
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-confirm-delete {
      background: #d92d20;
      color: #fff;
    }

    .wp-items {
      position: absolute;
      inset: 0;
      z-index: 1;
      min-height: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-content: start;
      column-gap: 16px;
      row-gap: 0;
      padding: var(--wp-items-padding-top, 112px) 24px 48px;
      margin-top: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
      overscroll-behavior: contain;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      contain: layout style;
    }

    .wp-items.is-brand-cloud {
      display: flex;
      flex-direction: column;
      justify-content: safe center;
      padding: var(--wp-items-padding-top, 112px) 24px 48px;
    }

    .wp-item-column {
      min-width: 0;
      display: grid;
      align-content: start;
      gap: 16px;
    }

    .wp-brand-cloud {
      position: relative;
      z-index: 0;
      display: flex;
      flex-wrap: wrap;
      align-content: flex-start;
      align-items: baseline;
      justify-content: center;
      gap: 16px;
      padding: 8px;
      text-align: center;
      isolation: isolate;
    }

    .wp-brand-cloud.is-sort-list {
      min-height: min(540px, calc(100vh - 250px));
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: center;
      gap: 22px;
      padding: 28px 8px 72px;
    }

    .wp-brand-cloud-item {
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: 8px;
      min-width: 0;
      color: rgba(8, 11, 16, 0.72);
      font-variant-numeric: tabular-nums;
      font-size: calc(var(--text-ui) * var(--wp-brand-cloud-scale, 1));
      font-weight: 760;
      line-height: 1.05;
      text-transform: uppercase;
      white-space: nowrap;
      transform: translate3d(0, 0, 0);
    }

    .wp-brand-cloud-count {
      color: rgba(8, 11, 16, 0.38);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: calc(var(--text-ui) * 0.72 * var(--wp-brand-cloud-scale, 1));
      font-weight: 650;
    }

    .wp-item {
      position: relative;
      z-index: 0;
      min-width: 0;
      isolation: isolate;
      transform: translateY(0);
      transition: transform 220ms cubic-bezier(.18, .9, .22, 1);
      animation: wpItemIn 360ms cubic-bezier(.18, .9, .22, 1) both;
    }

    .wp-item-column .wp-item:nth-child(2) { animation-delay: 34ms; }
    .wp-item-column .wp-item:nth-child(3) { animation-delay: 68ms; }
    .wp-item-column .wp-item:nth-child(4) { animation-delay: 102ms; }
    .wp-item-column .wp-item:nth-child(5) { animation-delay: 136ms; }
    .wp-item-column .wp-item:nth-child(n + 6) { animation-delay: 170ms; }

    .wp-item::before {
      content: "";
      position: absolute;
      inset: -4px;
      z-index: -1;
      border-radius: 8px;
      background:
        radial-gradient(circle at 18% 20%, rgba(115, 196, 255, 0.7), transparent 34%),
        radial-gradient(circle at 82% 18%, rgba(255, 144, 221, 0.62), transparent 36%),
        radial-gradient(circle at 54% 92%, rgba(174, 255, 196, 0.56), transparent 40%),
        conic-gradient(from 130deg at 50% 50%, rgba(255, 255, 255, 0), rgba(174, 209, 255, 0.8), rgba(255, 190, 235, 0.72), rgba(210, 255, 226, 0.66), rgba(255, 255, 255, 0));
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease;
    }

    .wp-item:hover,
    .wp-item:focus-within {
      transform: translateY(-3px);
    }

    .wp-item:hover::before,
    .wp-item:focus-within::before {
      opacity: 0.15;
    }

    .wp-item:active {
      transform: translateY(-1px);
      transition-duration: 80ms;
    }

    .wp-compact-item:hover,
    .wp-compact-item:focus-within,
    .wp-compact-item:active {
      transform: none;
    }

    .wp-item.is-new .wp-media {
      box-shadow: none;
    }

    .wp-item.is-new .wp-item-title {
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 3px;
    }

    .wp-media {
      position: relative;
      display: grid;
      place-items: center;
      aspect-ratio: var(--wp-media-ratio, 4 / 5);
      margin-bottom: 8px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      overflow: hidden;
      -webkit-clip-path: inset(0 round 8px);
      clip-path: inset(0 round 8px);
      -webkit-mask-image: -webkit-radial-gradient(white, black);
      contain: paint;
    }

    .wp-media-link,
    .wp-media-link:link,
    .wp-media-link:visited,
    .wp-media-link:hover,
    .wp-media-link:focus-visible {
      position: absolute;
      inset: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      color: inherit;
      text-decoration: none;
    }

    .wp-image-frame {
      display: grid;
      place-items: center;
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: var(--wp-image-ratio, var(--wp-media-ratio, 4 / 5));
      border-radius: 8px;
      overflow: hidden;
      -webkit-clip-path: inset(0 round 8px);
      clip-path: inset(0 round 8px);
      -webkit-mask-image: -webkit-radial-gradient(white, black);
      contain: paint;
    }

    .wp-image-frame.is-wide {
      width: 100%;
      height: auto;
    }

    .wp-image-frame.is-tall {
      width: auto;
      height: 100%;
    }

    .wp-image-frame > img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      color: transparent;
      font-size: 0;
      object-fit: cover;
      object-position: center;
    }

    .wp-image-placeholder {
      width: 42px;
      height: 42px;
      color: rgba(16, 16, 16, 0.2);
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-image-missing {
      display: grid;
      place-items: center;
      gap: 8px;
      width: 100%;
      min-height: 120px;
      padding: 24px;
      color: rgba(16, 16, 16, 0.42);
      text-align: center;
    }

    .wp-image-missing-icon {
      width: 42px;
      height: 42px;
      opacity: 0.34;
    }

    .wp-image-missing-text {
      max-width: 120px;
      font-size: var(--text-caption);
      line-height: 1.2;
      font-weight: 720;
      text-transform: uppercase;
    }

    .wp-item:hover .wp-image-frame > img {
      transform: none;
    }

    .wp-archive,
    .wp-remove {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 0;
      color: rgba(16, 16, 16, 0.72);
      background: transparent;
      cursor: pointer;
      opacity: 0;
      pointer-events: auto;
      transform: none;
      transition: opacity 140ms ease, color 140ms ease;
    }

    .wp-item.is-archived .wp-remove,
    .wp-item.is-archived .wp-archive {
      opacity: 1;
      pointer-events: auto;
    }

    .wp-item:hover .wp-archive,
    .wp-archive:focus-visible,
    .wp-item:hover .wp-remove,
    .wp-remove:focus-visible {
      opacity: 1;
      pointer-events: auto;
      transform: none;
      color: rgba(16, 16, 16, 0.92);
    }

    .wp-item-copy {
      display: grid;
      gap: 8px;
    }

    .wp-brand-row,
    .wp-title-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }

    .wp-price-row {
      min-width: 0;
      display: inline-flex;
      align-items: baseline;
      justify-content: flex-start;
      gap: 8px;
      max-width: 100%;
    }

  `;
}
