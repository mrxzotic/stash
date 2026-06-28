function panelDialogStyles() {
  return `
    .wp-dialog-backdrop {
      position: absolute;
      inset: 0;
      z-index: 10;
      background: rgba(8, 11, 16, 0.18);
      -webkit-backdrop-filter: blur(14px) saturate(0.98);
      backdrop-filter: blur(14px) saturate(0.98);
    }

    .wp-confirm-dialog {
      position: absolute;
      top: 50%;
      left: 24px;
      right: 24px;
      z-index: 11;
      width: auto;
      max-width: 320px;
      min-width: 0;
      margin-inline: auto;
      display: grid;
      gap: 10px;
      padding: 18px;
      border: 1px solid var(--wp-popover-border);
      border-radius: 8px;
      background: var(--wp-popover-bg);
      color: var(--foreground);
      -webkit-backdrop-filter: var(--wp-popover-blur);
      backdrop-filter: var(--wp-popover-blur);
      box-shadow:
        0 18px 46px rgba(8, 11, 16, 0.18),
        0 2px 10px rgba(8, 11, 16, 0.08);
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
      overflow-wrap: normal;
    }

    .wp-confirm-dialog p {
      color: var(--muted);
      font-size: var(--text-body);
      line-height: 1.3;
      font-weight: 620;
      display: -webkit-box;
      overflow: hidden;
      overflow-wrap: anywhere;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
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
      height: 34px;
      min-width: 0;
      border: 0;
      border-radius: 8px;
      font-size: var(--text-body);
      font-weight: 760;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      outline: none;
    }

    .wp-confirm-cancel {
      background: rgba(8, 11, 16, 0.06);
      box-shadow: inset 0 0 0 1px rgba(8, 11, 16, 0.08);
      color: var(--foreground);
    }

    .wp-confirm-delete {
      background: #d92d20;
      color: #fff;
    }

    .wp-confirm-cancel:hover,
    .wp-confirm-cancel:focus-visible {
      background: rgba(8, 11, 16, 0.08);
    }

    .wp-confirm-delete:hover,
    .wp-confirm-delete:focus-visible {
      background: #c9251b;
    }

    .wp-confirm-cancel:focus-visible,
    .wp-confirm-delete:focus-visible {
      box-shadow:
        0 0 0 2px rgba(74, 156, 255, 0.72),
        inset 0 0 0 1px rgba(8, 11, 16, 0.08);
    }
  `;
}
