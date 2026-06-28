function panelEditStyles() {
  return `
    .wp-edit-dialog {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 11;
      width: min(356px, calc(100% - 40px));
      max-height: min(640px, calc(100vh - 112px));
      min-width: 0;
      display: grid;
      gap: 13px;
      padding: 22px 20px 20px;
      border: 1px solid rgba(60, 60, 67, 0.12);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.9);
      color: var(--foreground);
      -webkit-backdrop-filter: blur(28px) saturate(1.16);
      backdrop-filter: blur(28px) saturate(1.16);
      box-shadow: none;
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
      background: rgba(22, 23, 26, 0.9);
      box-shadow: none;
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
      font-size: var(--text-heading);
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
      outline: 0;
      transition:
        background 150ms cubic-bezier(.22, 1, .36, 1),
        color 150ms cubic-bezier(.22, 1, .36, 1),
        transform 150ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-edit-close:hover,
    .wp-edit-close:focus-visible {
      background: rgba(8, 11, 16, 0.06);
      color: var(--foreground);
    }

    .wp-edit-close:active {
      transform: scale(0.94);
    }

    .wp-edit-close-icon {
      width: 18px;
      height: 18px;
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-edit-field {
      min-width: 0;
      display: grid;
      gap: 8px;
    }

    .wp-edit-field > span {
      color: var(--muted);
      font-size: var(--text-caption);
      line-height: 1;
      font-weight: 720;
    }

    .wp-edit-field input[type="text"],
    .wp-edit-field input[type="url"],
    .wp-edit-field select {
      width: 100%;
      min-width: 0;
      height: 44px;
      padding: 0 14px;
      border: 1px solid rgba(60, 60, 67, 0.13);
      border-radius: var(--radius);
      background: rgba(250, 250, 250, 0.76);
      color: var(--foreground);
      font-size: var(--text-body);
      font-weight: 680;
      outline: 0;
      box-shadow: none;
      transition:
        border-color 160ms cubic-bezier(.22, 1, .36, 1),
        background 160ms cubic-bezier(.22, 1, .36, 1),
        outline-color 160ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-edit-field input[type="text"]:hover,
    .wp-edit-field input[type="url"]:hover,
    .wp-edit-field select:hover {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(60, 60, 67, 0.18);
    }

    .wp-edit-field input[type="text"]:focus,
    .wp-edit-field input[type="url"]:focus,
    .wp-edit-field select:focus {
      border-color: rgba(10, 132, 255, 0.62);
      background: rgba(255, 255, 255, 0.96);
      outline: 2px solid rgba(10, 132, 255, 0.28);
      outline-offset: 1px;
    }

    .wp-edit-field select {
      appearance: none;
      padding-right: 30px;
      background-image:
        linear-gradient(45deg, transparent 50%, currentColor 50%),
        linear-gradient(135deg, currentColor 50%, transparent 50%);
      background-position:
        calc(100% - 18px) 19px,
        calc(100% - 13px) 19px;
      background-size: 5px 5px, 5px 5px;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    .wp-theme-graphite .wp-edit-field input[type="text"],
    .wp-theme-graphite .wp-edit-field input[type="url"],
    .wp-theme-graphite .wp-edit-field select {
      border-color: rgba(255, 255, 255, 0.1);
      background-color: rgba(255, 255, 255, 0.08);
      box-shadow: none;
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
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      outline: 0;
    }

    .wp-edit-category span {
      height: 32px;
      display: inline-flex;
      align-items: center;
      max-width: 132px;
      padding: 0 12px;
      border: 1px solid rgba(60, 60, 67, 0.13);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.42);
      color: rgba(8, 11, 16, 0.66);
      font-size: var(--text-control);
      font-weight: 720;
      line-height: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: none;
      transition:
        background 150ms cubic-bezier(.22, 1, .36, 1),
        border-color 150ms cubic-bezier(.22, 1, .36, 1),
        color 150ms cubic-bezier(.22, 1, .36, 1),
        transform 150ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-edit-category:hover span {
      background: rgba(255, 255, 255, 0.74);
      border-color: rgba(8, 11, 16, 0.18);
      color: rgba(8, 11, 16, 0.84);
      transform: translateY(-1px);
    }

    .wp-edit-category.is-selected span {
      color: var(--primary-foreground);
      border-color: rgba(8, 11, 16, 0.88);
      background: rgba(8, 11, 16, 0.88);
      box-shadow: none;
    }

    .wp-edit-category:focus-visible span {
      outline: 2px solid rgba(10, 132, 255, 0.72);
      outline-offset: 2px;
    }

    .wp-theme-graphite .wp-edit-category span {
      color: rgba(244, 244, 240, 0.74);
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.06);
      box-shadow: none;
    }

    .wp-theme-graphite .wp-edit-category.is-selected span {
      color: #080b10;
      border-color: rgba(255, 255, 255, 0.9);
      background: rgba(244, 244, 240, 0.9);
    }

    .wp-edit-actions {
      min-width: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding-top: 4px;
    }

    .wp-edit-actions .wp-confirm-cancel,
    .wp-edit-actions .wp-edit-save {
      height: 44px;
      border-radius: var(--radius);
      font-size: var(--text-body);
      font-weight: 780;
      transition:
        background 160ms cubic-bezier(.22, 1, .36, 1),
        outline-color 160ms cubic-bezier(.22, 1, .36, 1),
        transform 160ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-edit-actions .wp-confirm-cancel {
      background: rgba(8, 11, 16, 0.055);
      border: 1px solid rgba(8, 11, 16, 0.08);
      box-shadow: none;
    }

    .wp-edit-actions .wp-confirm-cancel:hover,
    .wp-edit-actions .wp-confirm-cancel:focus-visible {
      background: rgba(8, 11, 16, 0.08);
      box-shadow: none;
      outline: 2px solid rgba(10, 132, 255, 0.28);
      outline-offset: 1px;
    }

    .wp-edit-actions .wp-edit-save:hover,
    .wp-edit-actions .wp-edit-save:focus-visible {
      box-shadow: none;
      outline: 2px solid rgba(10, 132, 255, 0.28);
      outline-offset: 1px;
    }

    .wp-edit-actions .wp-confirm-cancel:active,
    .wp-edit-actions .wp-edit-save:active {
      transform: scale(0.98);
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
