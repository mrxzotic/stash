function panelContentStyles() {
  return `
    .wp-dialog-backdrop {
      position: absolute;
      inset: 0;
      z-index: 10;
      background: rgba(255, 255, 255, 0.46);
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
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: var(--radius);
      background: #fff;
      color: var(--foreground);
      box-shadow: 0 22px 54px rgba(0, 0, 0, 0.18);
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
      padding: 148px 24px 48px;
      margin-top: 0;
      overflow-y: auto;
      scroll-behavior: smooth;
      overscroll-behavior: contain;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      contain: layout style;
    }

    .wp-item-column {
      min-width: 0;
      display: grid;
      align-content: start;
      gap: 20px;
    }

    .wp-items.is-compact {
      grid-template-columns: 1fr;
      row-gap: 0;
      padding-top: 142px;
    }

    .wp-items.is-brand-cloud {
      grid-template-columns: 1fr;
      align-content: center;
      padding-top: 126px;
    }

    .wp-brand-cloud {
      position: relative;
      z-index: 0;
      min-height: min(460px, calc(100vh - 250px));
      display: flex;
      flex-wrap: wrap;
      align-content: center;
      align-items: baseline;
      justify-content: center;
      gap: 14px 18px;
      padding: 40px 6px 74px;
      text-align: center;
      isolation: isolate;
    }

    .wp-brand-cloud-item {
      display: inline-flex;
      align-items: baseline;
      gap: 5px;
      min-width: 0;
      color: rgba(8, 11, 16, 0.72);
      font-variant-numeric: tabular-nums;
      font-size: calc(14px * var(--wp-brand-cloud-scale, 1));
      font-weight: 760;
      line-height: 1.05;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .wp-brand-cloud-count {
      color: rgba(8, 11, 16, 0.38);
      font-size: 0.72em;
      font-weight: 650;
    }

    .wp-compact-list {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .wp-item {
      position: relative;
      z-index: 0;
      min-width: 0;
      isolation: isolate;
      transform: translateY(0);
      transition: transform 180ms cubic-bezier(.16, 1, .3, 1);
      animation: wpItemIn 240ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-compact-item {
      min-height: 64px;
      display: grid;
      grid-template-columns: 28px 54px minmax(0, 1fr) auto 28px;
      gap: 10px;
      align-items: start;
      padding: 5px 0;
    }

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

    .wp-compact-thumb {
      position: relative;
      width: 54px;
      height: 62px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      overflow: hidden;
      -webkit-clip-path: inset(0 round 8px);
      clip-path: inset(0 round 8px);
      -webkit-mask-image: -webkit-radial-gradient(white, black);
      contain: paint;
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
      object-fit: cover;
      object-position: center;
    }

    .wp-compact-thumb .wp-image-frame {
      max-width: 100%;
      max-height: 100%;
    }

    .wp-image-placeholder {
      width: 42px;
      height: 42px;
      color: rgba(16, 16, 16, 0.2);
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-item:hover .wp-image-frame > img {
      transform: none;
    }

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
      pointer-events: none;
      transform: none;
      transition: opacity 140ms ease, color 140ms ease;
    }

    .wp-remove::before,
    .wp-remove::after {
      width: 18px;
      height: 2px;
    }

    .wp-compact-item .wp-remove {
      position: relative;
      top: auto;
      right: auto;
      width: 28px;
      height: 28px;
      justify-self: end;
      align-self: start;
      transform: none;
    }

    .wp-item:hover .wp-remove,
    .wp-remove:focus-visible {
      opacity: 1;
      pointer-events: auto;
      transform: none;
      color: rgba(16, 16, 16, 0.92);
    }

    .wp-item-copy {
      display: grid;
      gap: 4px;
    }

    .wp-compact-copy {
      display: grid;
      gap: 3px;
      min-width: 0;
      align-self: start;
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
      gap: 6px;
      max-width: 100%;
    }

    .wp-compact-price {
      align-self: start;
      justify-self: end;
      justify-content: flex-end;
      text-align: right;
      white-space: nowrap;
    }
  `;
}
