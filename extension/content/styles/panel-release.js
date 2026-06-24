function panelReleaseStyles() {
  return `
    .wp-icon-button:disabled {
      color: rgba(8, 11, 16, 0.24);
      cursor: default;
      pointer-events: none;
    }

    .wp-theme-graphite .wp-icon-button:disabled {
      color: rgba(244, 244, 240, 0.24);
    }

    .wp-filter-rail > .wp-filter-archive {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-style: solid;
      border-color: rgba(8, 11, 16, 0.07);
      background: rgba(255, 255, 255, 0.38);
      color: rgba(8, 11, 16, 0.52);
    }

    .wp-filter-rail > .wp-filter-archive.is-active {
      color: var(--primary-foreground);
      border-color: rgba(8, 11, 16, 0.86);
      border-style: solid;
      background: rgba(8, 11, 16, 0.86);
    }

    .wp-archive-count {
      min-width: 1ch;
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-weight: 720;
      opacity: 0.68;
    }

    .wp-theme-graphite .wp-filter-rail > .wp-filter-archive {
      border-color: rgba(244, 244, 240, 0.16);
      background: rgba(244, 244, 240, 0.06);
      color: rgba(244, 244, 240, 0.54);
    }

    .wp-theme-graphite .wp-filter-rail > .wp-filter-archive.is-active {
      color: #080b10;
      border-color: rgba(255, 255, 255, 0.9);
      background: rgba(244, 244, 240, 0.9);
    }

    .wp-media {
      --wp-card-action-inset: 8px;
      --wp-card-action-size: 32px;
    }

    .wp-shortlist,
    .wp-edit,
    .wp-restore,
    .wp-archive,
    .wp-remove {
      position: absolute;
      top: var(--wp-card-action-inset);
      z-index: 4;
      width: var(--wp-card-action-size);
      height: var(--wp-card-action-size);
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 0;
      color: rgba(16, 16, 16, 0.72);
      background: transparent;
      cursor: pointer;
      opacity: 0;
      pointer-events: auto;
      transform: translateY(0) scale(1);
      transition: opacity 140ms ease, color 140ms ease, transform 140ms ease;
      will-change: opacity, transform;
    }

    .wp-shortlist,
    .wp-restore {
      left: var(--wp-card-action-inset);
      right: auto;
    }

    .wp-edit {
      top: calc(var(--wp-card-action-inset) + var(--wp-card-action-size) + 2px);
      left: var(--wp-card-action-inset);
      right: auto;
    }

    .wp-archive,
    .wp-remove {
      right: var(--wp-card-action-inset);
      left: auto;
    }

    .wp-card-action-icon {
      width: 17px;
      height: 17px;
      font-size: 17px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-item[draggable="true"] {
      cursor: grab;
    }

    .wp-compact-item {
      grid-template-columns: 28px 78px minmax(0, 1fr) minmax(72px, max-content);
    }

    .wp-compact-actions .wp-restore,
    .wp-compact-actions .wp-shortlist,
    .wp-compact-actions .wp-edit,
    .wp-compact-actions .wp-archive,
    .wp-compact-actions .wp-remove {
      position: relative;
      top: auto;
      left: auto;
      right: auto;
      width: 28px;
      height: 28px;
    }

    .wp-shortlist {
      z-index: 8;
      opacity: 0;
      pointer-events: auto;
    }

    .wp-shortlist.is-active {
      opacity: 1;
      color: rgba(16, 16, 16, 0.92);
    }

    .wp-item.is-archived .wp-restore,
    .wp-item.is-archived .wp-edit {
      opacity: 0;
    }

    .wp-item:hover .wp-restore,
    .wp-item:focus-within .wp-restore,
    .wp-item:hover .wp-shortlist,
    .wp-item:focus-within .wp-shortlist,
    .wp-item:hover .wp-archive,
    .wp-item:focus-within .wp-archive,
    .wp-item:hover .wp-edit,
    .wp-item:focus-within .wp-edit,
    .wp-item:hover .wp-remove,
    .wp-item:focus-within .wp-remove {
      opacity: 0.5;
      pointer-events: auto;
    }

    .wp-item:hover .wp-shortlist.is-active,
    .wp-item:focus-within .wp-shortlist.is-active {
      opacity: 1;
    }

    .wp-item .wp-restore:hover,
    .wp-item .wp-restore:focus-visible,
    .wp-item .wp-shortlist:hover,
    .wp-item .wp-shortlist:focus-visible,
    .wp-item .wp-archive:hover,
    .wp-item .wp-archive:focus-visible,
    .wp-item .wp-edit:hover,
    .wp-item .wp-edit:focus-visible,
    .wp-item .wp-remove:hover,
    .wp-item .wp-remove:focus-visible {
      opacity: 1;
      pointer-events: auto;
      color: rgba(16, 16, 16, 0.92);
      transform: translateY(-1px) scale(1.08);
    }

    .wp-item .wp-restore:active,
    .wp-item .wp-shortlist:active,
    .wp-item .wp-archive:active,
    .wp-item .wp-edit:active,
    .wp-item .wp-remove:active {
      transform: translateY(0) scale(0.98);
      transition-duration: 80ms;
    }

    .wp-item .wp-restore:focus-visible,
    .wp-item .wp-shortlist:focus-visible,
    .wp-item .wp-archive:focus-visible,
    .wp-item .wp-edit:focus-visible,
    .wp-item .wp-remove:focus-visible {
      border-radius: 6px;
    }

    .wp-theme-graphite .wp-edit,
    .wp-theme-graphite .wp-shortlist,
    .wp-theme-graphite .wp-restore,
    .wp-theme-graphite .wp-archive,
    .wp-theme-graphite .wp-remove {
      color: rgba(244, 244, 240, 0.74);
    }

    .wp-theme-graphite .wp-item .wp-restore:hover,
    .wp-theme-graphite .wp-item .wp-restore:focus-visible,
    .wp-theme-graphite .wp-item .wp-shortlist:hover,
    .wp-theme-graphite .wp-item .wp-shortlist:focus-visible,
    .wp-theme-graphite .wp-item .wp-archive:hover,
    .wp-theme-graphite .wp-item .wp-archive:focus-visible,
    .wp-theme-graphite .wp-item .wp-edit:hover,
    .wp-theme-graphite .wp-item .wp-edit:focus-visible,
    .wp-theme-graphite .wp-item .wp-remove:hover,
    .wp-theme-graphite .wp-item .wp-remove:focus-visible {
      color: rgba(244, 244, 240, 0.94);
    }

  `;
}
