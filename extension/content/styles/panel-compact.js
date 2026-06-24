function panelCompactStyles() {
  return `
    .wp-items.is-compact {
      grid-template-columns: 1fr;
      row-gap: 0;
      padding: var(--wp-items-padding-top, 96px) 14px 48px;
    }

    .wp-compact-list {
      display: grid;
      gap: 8px;
      min-width: 0;
      width: 100%;
    }

    .wp-compact-item {
      position: relative;
      min-height: 112px;
      display: grid;
      grid-template-columns: 28px 78px minmax(0, 1fr) minmax(72px, max-content);
      grid-template-rows: minmax(0, auto) 28px;
      column-gap: 12px;
      row-gap: 6px;
      align-items: center;
      padding: 6px 2px;
    }

    .wp-compact-item::before {
      inset: 0 -8px;
      border-radius: 8px;
      background:
        radial-gradient(circle at 18% 20%, rgba(115, 196, 255, 0.7), transparent 34%),
        radial-gradient(circle at 82% 18%, rgba(255, 144, 221, 0.62), transparent 36%),
        radial-gradient(circle at 54% 92%, rgba(174, 255, 196, 0.56), transparent 40%),
        conic-gradient(from 130deg at 50% 50%, rgba(255, 255, 255, 0), rgba(174, 209, 255, 0.8), rgba(255, 190, 235, 0.72), rgba(210, 255, 226, 0.66), rgba(255, 255, 255, 0));
    }

    .wp-compact-item:hover::before,
    .wp-compact-item:focus-within::before {
      opacity: 0.18;
    }

    .wp-theme-graphite .wp-compact-item::before {
      background:
        radial-gradient(circle at 18% 20%, rgba(115, 196, 255, 0.46), transparent 34%),
        radial-gradient(circle at 82% 18%, rgba(255, 144, 221, 0.38), transparent 36%),
        radial-gradient(circle at 54% 92%, rgba(174, 255, 196, 0.34), transparent 40%),
        conic-gradient(from 130deg at 50% 50%, rgba(255, 255, 255, 0), rgba(94, 134, 190, 0.46), rgba(170, 94, 150, 0.38), rgba(112, 172, 134, 0.34), rgba(255, 255, 255, 0));
    }

    .wp-compact-index {
      grid-column: 1;
      grid-row: 1 / span 2;
      align-self: center;
      justify-self: center;
      color: rgba(8, 11, 16, 0.28);
      font-family: var(--figure-font);
      font-size: var(--text-caption);
      font-weight: 720;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      white-space: nowrap;
    }

    .wp-compact-thumb {
      position: relative;
      grid-column: 2;
      grid-row: 1 / span 2;
      width: 78px;
      height: 98px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      overflow: hidden;
      -webkit-clip-path: inset(0 round 8px);
      clip-path: inset(0 round 8px);
      -webkit-mask-image: -webkit-radial-gradient(white, black);
      contain: paint;
    }

    .wp-compact-thumb .wp-image-frame {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 33 / 43;
      background: rgba(8, 11, 16, 0.025);
    }

    .wp-compact-thumb .wp-image-frame.is-wide,
    .wp-compact-thumb .wp-image-frame.is-tall {
      width: 100%;
      height: 100%;
    }

    .wp-compact-thumb .wp-image-frame > img {
      object-fit: contain;
      object-position: center bottom;
    }

    .wp-compact-thumb .wp-image-missing {
      min-height: 0;
      height: 100%;
      padding: 8px;
      gap: 4px;
    }

    .wp-compact-thumb .wp-image-missing-logo {
      width: 24px;
      height: 24px;
    }

    .wp-compact-thumb .wp-image-missing-text {
      max-width: 48px;
      font-size: var(--text-micro);
    }

    .wp-compact-thumb.is-object-bottom .wp-image-frame > img {
      object-fit: contain;
      object-position: center bottom;
    }

    .wp-theme-graphite .wp-compact-thumb .wp-image-frame {
      background: rgba(244, 244, 240, 0.045);
    }

    .wp-compact-copy {
      grid-column: 3;
      grid-row: 1;
      display: grid;
      gap: 4px;
      min-width: 0;
      align-self: end;
    }

    .wp-compact-meta .wp-brand {
      display: block;
      max-width: none;
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .wp-compact-item .wp-compact-copy .wp-item-title {
      display: block;
      max-width: none;
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
      overflow-wrap: anywhere;
      -webkit-line-clamp: unset;
    }

    .wp-compact-state {
      grid-column: 3;
      grid-row: 2;
      z-index: 5;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      justify-self: start;
      transition: opacity 140ms ease;
    }

    .wp-compact-state:empty {
      display: none;
    }

    .wp-compact-actions {
      position: relative;
      grid-column: 3;
      grid-row: 2;
      z-index: 6;
      display: inline-flex;
      align-items: center;
      align-self: center;
      justify-self: start;
      justify-content: flex-start;
      gap: 0;
      width: 88px;
      min-width: 88px;
      opacity: 1;
      pointer-events: none;
      transform: translate3d(0, 0, 0);
      transition: opacity 160ms ease, transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-compact-item:hover .wp-compact-actions,
    .wp-compact-item:focus-within .wp-compact-actions {
      opacity: 1;
      pointer-events: auto;
      transform: translate3d(0, 0, 0);
    }

    .wp-compact-item.is-archived:hover .wp-compact-state,
    .wp-compact-item.is-archived:focus-within .wp-compact-state {
      opacity: 0;
    }

    .wp-compact-actions .wp-restore,
    .wp-compact-actions .wp-archive,
    .wp-compact-actions .wp-shortlist,
    .wp-compact-actions .wp-edit,
    .wp-compact-actions .wp-remove {
      position: relative;
      top: auto;
      right: auto;
      width: 28px;
      height: 28px;
      transform: none;
    }

    .wp-compact-price {
      grid-column: 4;
      grid-row: 1 / span 2;
      width: auto;
      min-width: 0;
      align-self: center;
      justify-self: end;
      justify-content: flex-end;
      text-align: right;
      white-space: nowrap;
    }

    .wp-compact-price.is-empty {
      visibility: hidden;
    }

    .wp-compact-price .wp-price-stack {
      width: 100%;
      display: grid;
      justify-items: end;
      gap: 2px;
    }

    .wp-compact-price .wp-price-line {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: flex-end;
      gap: 2px 4px;
      overflow: visible;
    }

    .wp-compact-price .wp-native-price {
      flex-basis: 100%;
    }

    .wp-compact-price .wp-site-price,
    .wp-compact-price .wp-compare-price {
      color: rgba(8, 11, 16, 0.46);
      font-weight: 680;
    }

    .wp-compact-price .wp-price-line .wp-site-price {
      color: rgba(8, 11, 16, 0.78);
      font-weight: 760;
    }

    .wp-compact-price .wp-site-price.is-sale {
      color: #d92d20;
    }

    .wp-theme-graphite .wp-compact-price .wp-site-price,
    .wp-theme-graphite .wp-compact-price .wp-compare-price {
      color: rgba(244, 244, 240, 0.52);
    }

    .wp-theme-graphite .wp-compact-price .wp-price-line .wp-site-price {
      color: rgba(244, 244, 240, 0.88);
    }

    .wp-items.is-view-mode-switching .wp-compact-item,
    .wp-items.is-view-mode-switching .wp-item-column {
      animation: wpCompactViewSwitch 360ms cubic-bezier(.18, .9, .22, 1) both;
    }

    .wp-items.is-view-mode-switching .wp-compact-item:nth-child(2n),
    .wp-items.is-view-mode-switching .wp-item-column:nth-child(2n) {
      animation-delay: 24ms;
    }

    @keyframes wpCompactViewSwitch {
      0% {
        opacity: 0;
        transform: translate3d(0, 8px, 0) scale(.992);
        filter: blur(5px);
      }
      100% {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
        filter: blur(0);
      }
    }
  `;
}
