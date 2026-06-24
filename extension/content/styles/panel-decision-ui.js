function panelDecisionUiStyles() {
  return `
    .wp-shortlist.is-active {
      width: var(--wp-card-action-size);
      height: var(--wp-card-action-size);
      color: transparent;
      background: transparent;
      box-shadow: none;
    }

    .wp-compact-actions .wp-shortlist.is-active {
      top: auto;
      left: auto;
      width: 28px;
      height: 28px;
    }

    .wp-shortlist.is-active .wp-card-action-icon {
      position: relative;
      width: 17px;
      height: 17px;
      font-size: 17px;
      -webkit-mask: none;
      mask: none;
      background: transparent;
      animation: none;
      filter: none;
    }

    .wp-shortlist.is-active .wp-card-action-icon::after,
    .wp-shortlist.is-active .wp-card-action-icon::before {
      content: "";
      position: absolute;
      -webkit-clip-path: polygon(50% 2%, 61% 35%, 96% 35%, 68% 56%, 79% 92%, 50% 71%, 21% 92%, 32% 56%, 4% 35%, 39% 35%);
      clip-path: polygon(50% 2%, 61% 35%, 96% 35%, 68% 56%, 79% 92%, 50% 71%, 21% 92%, 32% 56%, 4% 35%, 39% 35%);
    }

    .wp-shortlist.is-active .wp-card-action-icon::after {
      inset: -1px;
      z-index: 0;
      background: rgba(8, 11, 16, 0.76);
      transform: scale(1.12);
    }

    .wp-shortlist.is-active .wp-card-action-icon::before {
      inset: 1px;
      z-index: 1;
      background: #ffd84d;
      animation: none;
    }

    .wp-decision-pill {
      min-width: 0;
      height: 28px;
      display: inline-grid;
      grid-template-columns: 15px minmax(0, auto);
      place-content: center;
      align-items: center;
      gap: 5px;
      padding: 0 9px;
      border: 0;
      border-radius: 999px;
      color: rgba(8, 11, 16, 0.78);
      background: rgba(8, 11, 16, 0.06);
      font-size: var(--text-caption);
      font-weight: 780;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wp-decision-pill-icon {
      width: 15px;
      height: 15px;
      font-size: 15px;
    }

    .wp-decision-pill.is-bought {
      color: #17633a;
      background: rgba(31, 137, 78, 0.14);
    }

    .wp-decision-pill.is-skipped {
      color: rgba(8, 11, 16, 0.62);
      background: rgba(8, 11, 16, 0.08);
    }

    .wp-decision-pill.is-delete {
      color: #b42318;
      background: rgba(217, 45, 32, 0.12);
    }

    .wp-decision-pill:hover,
    .wp-decision-pill:focus-visible {
      outline: 0;
      filter: saturate(1.08);
      transform: translateY(-1px);
    }

    .wp-decision-status {
      min-width: 0;
      max-width: 100%;
      height: 20px;
      display: inline-grid;
      grid-template-columns: 13px minmax(0, auto);
      align-items: center;
      justify-content: start;
      gap: 4px;
      padding: 0 6px;
      border-radius: 999px;
      color: rgba(8, 11, 16, 0.62);
      background: rgba(8, 11, 16, 0.06);
      font-family: var(--ui-font);
      font-size: var(--text-micro);
      font-weight: 760;
      line-height: 1;
      white-space: nowrap;
    }

    .wp-decision-status .wp-decision-pill-icon {
      width: 13px;
      height: 13px;
      font-size: 13px;
    }

    .wp-decision-status > span {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .wp-decision-status.is-bought {
      color: #17633a;
      background: rgba(31, 137, 78, 0.12);
    }

    .wp-compact-meta {
      min-width: 0;
      display: block;
    }

    .wp-decision-scrim {
      position: absolute;
      inset: 0;
      z-index: 8;
      background:
        linear-gradient(to bottom, rgba(8, 11, 16, 0.14) 0%, rgba(8, 11, 16, 0.24) 42%, rgba(8, 11, 16, 0.4) 100%);
      -webkit-backdrop-filter: blur(2px) saturate(0.92);
      backdrop-filter: blur(2px) saturate(0.92);
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-shell.is-decision-mode .wp-decision-scrim,
    .wp-shell.is-decision-dragging .wp-decision-scrim {
      opacity: 1;
      pointer-events: auto;
    }

    .wp-decision-drop-tray {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      align-items: end;
      gap: 10px;
      min-height: 176px;
      padding: 88px 20px 22px;
      border: 0;
      border-radius: 0 0 var(--radius) var(--radius);
      background:
        linear-gradient(to top, rgba(255, 255, 255, 0.97) 0%, rgba(255, 255, 255, 0.94) 24%, rgba(255, 255, 255, 0.74) 45%, rgba(255, 255, 255, 0.38) 68%, rgba(255, 255, 255, 0.12) 84%, rgba(255, 255, 255, 0) 100%);
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
      box-shadow: none;
      opacity: 0;
      pointer-events: none;
      transform: translateY(28px);
      transition: opacity 180ms ease, transform 220ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill {
      height: 52px;
      border-radius: 18px;
      box-shadow:
        inset 0 0 0 1px rgba(8, 11, 16, 0.04),
        0 12px 28px rgba(8, 11, 16, 0.1);
      font-size: var(--text-body);
      font-weight: 820;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill-icon,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }

    .wp-item.is-decision-drag-source {
      opacity: 0.54;
      cursor: grabbing;
      transform: rotate(-1.5deg) scale(0.98);
      filter: saturate(1.04) blur(0.2px);
    }

    .wp-theme-graphite .wp-shortlist.is-active {
      color: rgba(244, 244, 240, 0.94);
    }

    .wp-theme-graphite .wp-shortlist.is-active .wp-card-action-icon::after {
      background: rgba(244, 244, 240, 0.88);
    }

    .wp-theme-graphite .wp-decision-drop-tray {
      background:
        linear-gradient(to top, rgba(18, 19, 25, 0.97) 0%, rgba(18, 19, 25, 0.94) 24%, rgba(18, 19, 25, 0.74) 45%, rgba(18, 19, 25, 0.38) 68%, rgba(18, 19, 25, 0.12) 84%, rgba(18, 19, 25, 0) 100%);
    }

    .wp-theme-graphite .wp-decision-pill.is-bought {
      color: #baf1cf;
      background: rgba(74, 222, 128, 0.16);
    }

    .wp-theme-graphite .wp-decision-pill.is-skipped {
      color: rgba(244, 244, 240, 0.72);
      background: rgba(244, 244, 240, 0.1);
    }

    .wp-theme-graphite .wp-decision-pill.is-delete {
      color: #fecaca;
      background: rgba(248, 113, 113, 0.16);
    }

    .wp-theme-graphite .wp-decision-status {
      color: rgba(244, 244, 240, 0.72);
      background: rgba(244, 244, 240, 0.1);
    }

    .wp-theme-graphite .wp-decision-status.is-bought {
      color: #baf1cf;
      background: rgba(74, 222, 128, 0.14);
    }
  `;
}
