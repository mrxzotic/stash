function panelCompactStyles() {
  return `
    .wp-items.is-compact {
      grid-template-columns: 1fr;
      row-gap: 0;
      padding-top: var(--wp-items-padding-top, 154px);
    }

    .wp-compact-list {
      display: grid;
      gap: 0;
      min-width: 0;
    }

    .wp-compact-item {
      min-height: 72px;
      display: grid;
      grid-template-columns: 32px 56px minmax(0, 1fr) minmax(72px, max-content) 56px;
      gap: 8px;
      align-items: center;
      padding: 8px 0;
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

    .wp-compact-thumb {
      position: relative;
      width: 56px;
      height: 56px;
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
      aspect-ratio: 1;
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
      display: grid;
      gap: 2px;
      min-width: 0;
      align-self: center;
    }

    .wp-compact-index {
      align-self: center;
      padding-top: 0;
      color: rgba(8, 11, 16, 0.34);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: 11px;
      line-height: 1;
      font-weight: 760;
      white-space: nowrap;
    }

    .wp-theme-graphite .wp-compact-index {
      color: rgba(244, 244, 240, 0.34);
    }

    .wp-compact-actions {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0;
      justify-self: end;
      align-self: center;
      min-width: 56px;
    }

    .wp-compact-actions .wp-archive,
    .wp-compact-actions .wp-remove {
      position: relative;
      top: auto;
      right: auto;
      width: 28px;
      height: 28px;
      transform: none;
    }

    .wp-compact-price {
      align-self: center;
      justify-self: end;
      justify-content: flex-end;
      text-align: right;
      white-space: nowrap;
    }

    .wp-compact-price .wp-site-price,
    .wp-compact-price .wp-compare-price {
      color: rgba(8, 11, 16, 0.46);
      font-weight: 680;
    }

    .wp-compact-price .wp-site-price.is-sale {
      color: #d92d20;
    }

    .wp-theme-graphite .wp-compact-price .wp-site-price,
    .wp-theme-graphite .wp-compact-price .wp-compare-price {
      color: rgba(244, 244, 240, 0.52);
    }
  `;
}
