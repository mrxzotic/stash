function panelDialogStyles() {
  return `
    .wp-dialog-backdrop {
      position: absolute;
      inset: 0;
      z-index: 10;
      background: rgba(8, 11, 16, 0.16);
      -webkit-backdrop-filter: blur(12px) saturate(1.08);
      backdrop-filter: blur(12px) saturate(1.08);
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
      border: 1px solid var(--wp-popover-border);
      border-radius: var(--radius);
      background: var(--wp-popover-bg);
      color: var(--foreground);
      -webkit-backdrop-filter: var(--wp-popover-blur);
      backdrop-filter: var(--wp-popover-blur);
      box-shadow: var(--wp-popover-shadow);
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
  `;
}
