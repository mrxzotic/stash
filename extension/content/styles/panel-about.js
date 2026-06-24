function panelAboutStyles() {
  return `
    .wp-founder-modal {
      grid-template-rows: auto;
      align-content: start;
      padding: 56px 48px 32px;
    }

    .wp-founder-app {
      grid-template-columns: 56px minmax(0, 1fr);
      gap: 18px;
      padding: 0 40px 28px 0;
    }

    .wp-founder-app-logo { width: 56px; height: 56px; }

    .wp-founder-app-copy { gap: 7px; }

    .wp-founder-app-copy strong {
      font-size: var(--text-heading);
      line-height: 20px;
      font-weight: 720;
      color: rgba(8, 11, 16, 0.9);
    }

    .wp-founder-app-copy p {
      max-width: 300px;
      color: rgba(8, 11, 16, 0.58);
      font-size: var(--text-ui);
      line-height: 20px;
      font-weight: 620;
    }

    .wp-founder-backup {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 12px;
      padding: 20px 0;
    }

    .wp-founder-backup-actions { display: flex; justify-content: flex-end; gap: 8px; }

    .wp-founder-backup-action {
      height: 34px;
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 0 11px;
      border-radius: 8px;
      color: #0a84ff;
      background: rgba(10, 132, 255, 0.065);
    }

    .wp-founder-backup-action:hover,
    .wp-founder-backup-action:focus-visible {
      color: #0066cc;
      background: rgba(10, 132, 255, 0.1);
    }

    .wp-founder-action-icon { width: 15px; height: 15px; font-size: inherit; }

    .wp-founder-private {
      grid-template-columns: minmax(0, 1fr);
      align-items: start;
      gap: 10px;
      padding-top: 22px;
    }

    .wp-founder-private .wp-founder-section-title { grid-column: 1 / -1; }

    .wp-founder-contact-icons {
      justify-content: flex-start;
      gap: 8px;
      padding-left: 52px;
    }

    .wp-founder-danger {
      align-self: start;
      min-width: 0;
      display: grid;
      margin-top: 28px;
      padding-top: 22px;
      border-top: 1px solid rgba(220, 38, 38, 0.16);
    }

    .wp-founder-danger-head {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 16px;
    }

    .wp-founder-danger-copy {
      min-width: 0;
      display: grid;
      gap: 5px;
    }

    .wp-founder-danger-copy span {
      color: rgba(220, 38, 38, 0.68);
      font-size: var(--text-caption);
      line-height: 1;
      font-weight: 700;
    }

    .wp-founder-danger-copy strong {
      color: rgba(8, 11, 16, 0.82);
      font-size: var(--text-ui);
      line-height: 18px;
      font-weight: 690;
    }

    .wp-founder-danger-copy small {
      max-width: 260px;
      color: rgba(8, 11, 16, 0.46);
      font-size: var(--text-control);
      line-height: 16px;
      font-weight: 540;
    }

    .wp-founder-reset-start,
    .wp-founder-reset-confirm-button,
    .wp-founder-reset-cancel {
      height: 36px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 0 12px;
      border-radius: 8px;
      font-family: var(--ui-font);
      font-size: var(--text-body);
      line-height: 1;
      font-weight: 720;
      appearance: none;
      transition:
        background 160ms ease,
        border-color 160ms ease,
        color 160ms ease,
        opacity 160ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-founder-reset-start {
      border: 1px solid rgba(220, 38, 38, 0.22);
      background: rgba(220, 38, 38, 0.045);
      color: #d1242f;
    }

    .wp-founder-reset-start:hover,
    .wp-founder-reset-start:focus-visible {
      border-color: rgba(220, 38, 38, 0.36);
      background: rgba(220, 38, 38, 0.09);
      outline: 0;
    }

    .wp-founder-reset-start:active,
    .wp-founder-reset-confirm-button:active,
    .wp-founder-reset-cancel:active {
      transform: scale(0.97);
    }

    .wp-founder-reset-icon { width: 15px; height: 15px; font-size: inherit; }

    .wp-founder-reset-confirm {
      display: grid;
      grid-template-rows: 0fr;
      margin-top: 0;
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transform: translateY(-6px);
      transition:
        grid-template-rows 240ms cubic-bezier(.16, 1, .3, 1),
        margin-top 240ms cubic-bezier(.16, 1, .3, 1),
        opacity 180ms ease,
        transform 240ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-founder-danger.is-confirming .wp-founder-reset-confirm {
      grid-template-rows: 1fr;
      margin-top: 12px;
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .wp-founder-reset-confirm-inner {
      min-height: 0;
      display: grid;
      gap: 8px;
      overflow: hidden;
    }

    .wp-founder-reset-label {
      color: rgba(8, 11, 16, 0.52);
      font-size: var(--text-control);
      line-height: 16px;
      font-weight: 620;
    }

    .wp-founder-reset-row {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(104px, 0.88fr) minmax(116px, 1fr);
      gap: 8px;
    }

    .wp-founder-reset-input {
      width: 100%;
      height: 36px;
      min-width: 0;
      padding: 0 10px;
      border: 1px solid rgba(8, 11, 16, 0.12);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.66);
      color: var(--foreground);
      font-family: var(--ui-font);
      font-size: var(--text-body);
      font-weight: 650;
      outline: 0 !important;
      box-sizing: border-box;
      -webkit-appearance: none;
      appearance: none;
      transition:
        background 160ms ease,
        border-color 160ms ease,
        box-shadow 160ms ease;
    }

    .wp-founder-reset-input:focus {
      border-color: rgba(220, 38, 38, 0.34);
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.12);
      outline: 0 !important;
    }

    .wp-founder-reset-input:focus-visible { outline: 0 !important; }

    .wp-founder-reset-confirm-button {
      border: 0;
      background: rgba(8, 11, 16, 0.055);
      color: rgba(8, 11, 16, 0.34);
      white-space: nowrap;
    }

    .wp-founder-reset-confirm-button:disabled { cursor: default; opacity: 1; }

    .wp-founder-reset-confirm-button:not(:disabled) {
      background: #d1242f;
      color: #fff;
    }

    .wp-founder-reset-confirm-button:not(:disabled):hover,
    .wp-founder-reset-confirm-button:not(:disabled):focus-visible {
      background: #b4232d;
      outline: 0;
    }

    .wp-founder-reset-cancel {
      justify-self: start;
      height: 28px;
      padding: 0;
      border: 0;
      background: transparent;
      color: rgba(8, 11, 16, 0.48);
      font-size: var(--text-control);
      font-weight: 680;
    }

    .wp-founder-reset-cancel:hover,
    .wp-founder-reset-cancel:focus-visible {
      color: var(--foreground);
      outline: 0;
    }

    .wp-founder-danger.is-resetting { opacity: 0.72; pointer-events: none; }

    .wp-theme-graphite .wp-founder-app-copy strong,
    .wp-theme-graphite .wp-founder-danger-copy strong {
      color: rgba(244, 244, 240, 0.9);
    }

    .wp-theme-graphite .wp-founder-danger {
      border-top-color: rgba(255, 95, 95, 0.18);
    }

    .wp-theme-graphite .wp-founder-danger-copy span {
      color: rgba(255, 123, 123, 0.72);
    }

    .wp-theme-graphite .wp-founder-danger-copy small,
    .wp-theme-graphite .wp-founder-reset-label {
      color: rgba(244, 244, 240, 0.46);
    }

    .wp-theme-graphite .wp-founder-backup-action {
      color: #66b3ff;
      background: rgba(102, 179, 255, 0.1);
    }

    .wp-theme-graphite .wp-founder-backup-action:hover,
    .wp-theme-graphite .wp-founder-backup-action:focus-visible {
      color: #9dccff;
      background: rgba(102, 179, 255, 0.15);
    }

    .wp-theme-graphite .wp-founder-reset-start {
      border-color: rgba(255, 95, 95, 0.24);
      background: rgba(255, 95, 95, 0.08);
      color: #ff8585;
    }

    .wp-theme-graphite .wp-founder-reset-start:hover,
    .wp-theme-graphite .wp-founder-reset-start:focus-visible {
      border-color: rgba(255, 95, 95, 0.38);
      background: rgba(255, 95, 95, 0.14);
    }

    .wp-theme-graphite .wp-founder-reset-input {
      border-color: rgba(255, 255, 255, 0.13);
      background: rgba(255, 255, 255, 0.08);
      color: rgba(244, 244, 240, 0.94);
    }

    .wp-theme-graphite .wp-founder-reset-input:focus {
      border-color: rgba(255, 123, 123, 0.42);
      box-shadow: 0 0 0 3px rgba(255, 95, 95, 0.13);
    }

    .wp-theme-graphite .wp-founder-reset-confirm-button {
      background: rgba(244, 244, 240, 0.08);
      color: rgba(244, 244, 240, 0.36);
    }

    .wp-theme-graphite .wp-founder-reset-confirm-button:not(:disabled) {
      background: #e5484d;
      color: #fff;
    }

    .wp-theme-graphite .wp-founder-reset-cancel {
      color: rgba(244, 244, 240, 0.52);
    }

    .wp-theme-graphite .wp-founder-reset-cancel:hover,
    .wp-theme-graphite .wp-founder-reset-cancel:focus-visible {
      color: rgba(244, 244, 240, 0.94);
    }

    @media (max-width: 460px) {
      .wp-founder-modal {
        padding: 56px 32px 28px;
      }

      .wp-founder-backup,
      .wp-founder-private,
      .wp-founder-danger-head,
      .wp-founder-reset-row {
        grid-template-columns: minmax(0, 1fr);
      }

      .wp-founder-backup-actions,
      .wp-founder-contact-icons {
        justify-content: flex-start;
      }

      .wp-founder-reset-start,
      .wp-founder-reset-confirm-button {
        width: 100%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-founder-reset-confirm,
      .wp-founder-reset-start,
      .wp-founder-reset-confirm-button,
      .wp-founder-reset-cancel {
        transition: none;
      }
    }
  `;
}
