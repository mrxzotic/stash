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

    .wp-filter-archive {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-style: dotted;
      border-color: rgba(8, 11, 16, 0.48);
      background: transparent;
      color: rgba(8, 11, 16, 0.68);
    }

    .wp-filter-archive.is-active {
      color: rgba(8, 11, 16, 0.86);
      border-color: rgba(8, 11, 16, 0.56);
      border-style: dotted;
      background: rgba(8, 11, 16, 0.08);
    }

    .wp-archive-count {
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-weight: 720;
      opacity: 0.56;
    }

    .wp-theme-graphite .wp-filter-archive {
      border-color: rgba(244, 244, 240, 0.48);
      color: rgba(244, 244, 240, 0.72);
    }

    .wp-theme-graphite .wp-filter-archive.is-active {
      color: rgba(244, 244, 240, 0.94);
      border-color: rgba(244, 244, 240, 0.62);
      background: rgba(244, 244, 240, 0.12);
    }

    .wp-media {
      --wp-card-action-inset: 8px;
      --wp-card-action-size: 32px;
    }

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
      pointer-events: none;
      transform: translateY(0) scale(1);
      transition: opacity 140ms ease, color 140ms ease, transform 140ms ease;
      will-change: opacity, transform;
    }

    .wp-edit,
    .wp-restore {
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
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-compact-item {
      grid-template-columns: 32px 56px minmax(0, 1fr) minmax(72px, max-content) 56px;
    }

    .wp-compact-actions .wp-restore,
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

    .wp-item.is-archived .wp-restore,
    .wp-item.is-archived .wp-edit {
      opacity: 0;
      pointer-events: none;
    }

    .wp-item:hover .wp-restore,
    .wp-item:focus-within .wp-restore,
    .wp-item:hover .wp-archive,
    .wp-item:focus-within .wp-archive,
    .wp-item:hover .wp-edit,
    .wp-item:focus-within .wp-edit,
    .wp-item:hover .wp-remove,
    .wp-item:focus-within .wp-remove {
      opacity: 0.5;
      pointer-events: auto;
    }

    .wp-item .wp-restore:hover,
    .wp-item .wp-restore:focus-visible,
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
    .wp-item .wp-archive:active,
    .wp-item .wp-edit:active,
    .wp-item .wp-remove:active {
      transform: translateY(0) scale(0.98);
      transition-duration: 80ms;
    }

    .wp-item .wp-restore:focus-visible,
    .wp-item .wp-archive:focus-visible,
    .wp-item .wp-edit:focus-visible,
    .wp-item .wp-remove:focus-visible {
      border-radius: 6px;
    }

    .wp-theme-graphite .wp-edit,
    .wp-theme-graphite .wp-restore,
    .wp-theme-graphite .wp-archive,
    .wp-theme-graphite .wp-remove {
      color: rgba(244, 244, 240, 0.74);
    }

    .wp-theme-graphite .wp-item .wp-restore:hover,
    .wp-theme-graphite .wp-item .wp-restore:focus-visible,
    .wp-theme-graphite .wp-item .wp-archive:hover,
    .wp-theme-graphite .wp-item .wp-archive:focus-visible,
    .wp-theme-graphite .wp-item .wp-edit:hover,
    .wp-theme-graphite .wp-item .wp-edit:focus-visible,
    .wp-theme-graphite .wp-item .wp-remove:hover,
    .wp-theme-graphite .wp-item .wp-remove:focus-visible {
      color: rgba(244, 244, 240, 0.94);
    }

    .wp-edit-dialog {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 11;
      width: min(348px, calc(100% - 40px));
      max-height: min(628px, calc(100vh - 112px));
      min-width: 0;
      display: grid;
      gap: 14px;
      padding: 20px;
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: var(--radius);
      background: #fff;
      color: var(--foreground);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.92) inset,
        0 26px 64px rgba(0, 0, 0, 0.2);
      overflow-y: auto;
      scrollbar-width: none;
      transform: translate(-50%, -50%);
      animation: wpModalIn 160ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-edit-dialog::-webkit-scrollbar {
      display: none;
    }

    .wp-theme-graphite .wp-edit-dialog {
      border-color: rgba(255, 255, 255, 0.1);
      background: #16171a;
      box-shadow: 0 22px 54px rgba(0, 0, 0, 0.36);
    }

    .wp-edit-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-width: 0;
    }

    .wp-edit-head h3 {
      margin: 0;
      font-size: 17px;
      line-height: 1.15;
      font-weight: 780;
    }

    .wp-edit-close {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 0;
      background: transparent;
      color: var(--muted);
      border-radius: var(--radius);
    }

    .wp-edit-close-icon {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-edit-field {
      min-width: 0;
      display: grid;
      gap: 7px;
    }

    .wp-edit-field > span {
      color: var(--muted);
      font-size: var(--text-caption);
      line-height: 1;
      font-weight: 680;
    }

    .wp-edit-field input[type="text"],
    .wp-edit-field input[type="url"],
    .wp-edit-field select {
      width: 100%;
      min-width: 0;
      height: 40px;
      padding: 0 12px;
      border: 1px solid rgba(60, 60, 67, 0.12);
      border-radius: var(--radius);
      background: rgba(248, 248, 248, 0.92);
      color: var(--foreground);
      font-size: var(--text-body);
      font-weight: 650;
      outline: 0;
    }

    .wp-edit-field select {
      appearance: none;
      padding-right: 30px;
      background-image:
        linear-gradient(45deg, transparent 50%, currentColor 50%),
        linear-gradient(135deg, currentColor 50%, transparent 50%);
      background-position:
        calc(100% - 17px) 17px,
        calc(100% - 12px) 17px;
      background-size: 5px 5px, 5px 5px;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .wp-theme-graphite .wp-edit-field input[type="text"],
    .wp-theme-graphite .wp-edit-field input[type="url"],
    .wp-theme-graphite .wp-edit-field select {
      border-color: rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.08);
    }

    .wp-edit-price-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 92px;
      gap: 8px;
      min-width: 0;
    }

    .wp-edit-category-list {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      min-width: 0;
    }

    .wp-edit-category {
      min-width: 0;
    }

    .wp-edit-category input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .wp-edit-category span {
      height: 28px;
      display: inline-flex;
      align-items: center;
      max-width: 132px;
      padding: 0 10px;
      border: 1px solid rgba(60, 60, 67, 0.14);
      border-radius: 999px;
      background: transparent;
      color: rgba(8, 11, 16, 0.72);
      font-size: var(--text-control);
      font-weight: 680;
      line-height: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }

    .wp-edit-category.is-selected span,
    .wp-edit-category input:checked + span {
      color: var(--primary-foreground);
      border-color: rgba(8, 11, 16, 0.84);
      background: rgba(8, 11, 16, 0.84);
    }

    .wp-edit-category input:focus-visible + span {
      outline: 2px solid rgba(10, 132, 255, 0.72);
      outline-offset: 2px;
    }

    .wp-theme-graphite .wp-edit-category span {
      color: rgba(244, 244, 240, 0.74);
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.06);
    }

    .wp-theme-graphite .wp-edit-category.is-selected span,
    .wp-theme-graphite .wp-edit-category input:checked + span {
      color: #080b10;
      border-color: rgba(255, 255, 255, 0.9);
      background: rgba(244, 244, 240, 0.9);
    }

    .wp-edit-actions {
      min-width: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding-top: 2px;
    }

    .wp-edit-save {
      background: var(--foreground);
      color: var(--primary-foreground);
    }

    @media (max-width: 560px) {
      .wp-edit-dialog {
        width: min(348px, calc(100% - 36px));
      }
    }

    @keyframes wpModalIn {
      from {
        opacity: 0;
        transform: translate(-50%, calc(-50% - 8px)) scale(.98);
        filter: blur(6px);
      }

      to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
        filter: blur(0);
      }
    }
  `;
}
