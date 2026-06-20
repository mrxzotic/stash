function panelCompactStyles() {
  return `
    .wp-items.is-compact {
      grid-template-columns: 1fr;
      row-gap: 0;
      padding-top: var(--wp-items-padding-top, 154px);
    }

    .wp-compact-list {
      display: grid;
      gap: 4px;
      min-width: 0;
    }

    .wp-compact-item {
      min-height: 64px;
      display: grid;
      grid-template-columns: 34px 54px minmax(0, 1fr) auto 58px;
      gap: 10px;
      align-items: start;
      padding: 5px 0;
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

    .wp-compact-thumb .wp-image-frame {
      max-width: 100%;
      max-height: 100%;
    }

    .wp-compact-copy {
      display: grid;
      gap: 3px;
      min-width: 0;
      align-self: start;
    }

    .wp-compact-index {
      align-self: start;
      padding-top: 5px;
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
      gap: 2px;
      justify-self: end;
      align-self: start;
      min-width: 58px;
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
      align-self: start;
      justify-self: end;
      justify-content: flex-end;
      text-align: right;
      white-space: nowrap;
    }
  `;
}
