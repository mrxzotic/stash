function panelEditStyles() {
  return `
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
