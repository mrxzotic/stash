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
      font-size: inherit;
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
      position: relative;
      width: 76px;
      height: 76px;
      display: inline-grid;
      place-items: center;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.42);
      border-radius: var(--radius);
      color: rgba(8, 11, 16, 0.78);
      background: rgba(255, 255, 255, 0.58);
      -webkit-backdrop-filter: blur(16px) saturate(1.08);
      backdrop-filter: blur(16px) saturate(1.08);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.26),
        0 18px 40px rgba(8, 11, 16, 0.16);
      font-size: var(--text-caption);
      font-weight: 780;
      line-height: 1;
      cursor: pointer;
      opacity: 0;
      overflow: hidden;
      touch-action: manipulation;
      transform: translateY(10px) scale(0.94);
      white-space: nowrap;
      transition: background 140ms ease, border-color 140ms ease, box-shadow 160ms ease, color 140ms ease, opacity 140ms ease, transform 160ms cubic-bezier(.16, 1, .3, 1);
      will-change: opacity, transform;
    }

    .wp-decision-pill-icon {
      width: 28px;
      height: 28px;
      font-size: inherit;
      stroke-width: 1.9;
      transition: transform 160ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-decision-pill-label {
      position: absolute;
      bottom: 9px;
      left: 50%;
      max-width: calc(100% - 14px);
      opacity: 0;
      overflow: hidden;
      font-size: var(--text-caption);
      font-weight: 820;
      line-height: 1;
      text-align: center;
      text-overflow: ellipsis;
      transform: translate(-50%, 4px);
      transition: opacity 140ms ease, transform 160ms cubic-bezier(.16, 1, .3, 1);
      pointer-events: none;
    }

    .wp-decision-pill.is-bought {
      color: #17633a;
      border-color: rgba(23, 99, 58, 0.16);
      background: rgba(221, 244, 232, 0.84);
    }

    .wp-decision-pill.is-skipped {
      color: rgba(8, 11, 16, 0.62);
      border-color: rgba(8, 11, 16, 0.1);
      background: rgba(255, 255, 255, 0.64);
    }

    .wp-decision-pill.is-delete {
      color: #b42318;
      border-color: rgba(180, 35, 24, 0.16);
      background: rgba(253, 231, 230, 0.84);
    }

    .wp-decision-pill:hover,
    .wp-decision-pill:focus-visible {
      outline: 0;
      filter: none;
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.32),
        0 22px 46px rgba(8, 11, 16, 0.2);
      transform: translateY(-2px) scale(1);
    }

    .wp-decision-pill:hover .wp-decision-pill-icon,
    .wp-decision-pill:focus-visible .wp-decision-pill-icon {
      transform: translateY(-8px) scale(0.94);
    }

    .wp-decision-pill:hover .wp-decision-pill-label,
    .wp-decision-pill:focus-visible .wp-decision-pill-label {
      opacity: 1;
      transform: translate(-50%, 0);
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
      font-size: inherit;
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
      inset: 0;
      z-index: 9;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      padding: 112px 22px 84px;
      border: 0;
      border-radius: var(--radius);
      background: transparent;
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
      box-shadow: none;
      opacity: 0;
      pointer-events: none;
      transform: translateY(10px) scale(0.98);
      transition: opacity 180ms ease, transform 220ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    .wp-decision-drop-tray .wp-decision-pill {
      pointer-events: auto;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill {
      opacity: 1;
      transform: translateY(0) scale(1);
      transition-duration: 190ms;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill:nth-child(1),
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill:nth-child(1) {
      transition-delay: 20ms;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill:nth-child(2),
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill:nth-child(2) {
      transition-delay: 46ms;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill:nth-child(3),
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill:nth-child(3) {
      transition-delay: 72ms;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill:hover,
    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill:focus-visible,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill:hover,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill:focus-visible {
      transform: translateY(-2px) scale(1.02);
      transition-delay: 0ms;
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

    .wp-theme-graphite .wp-decision-pill {
      border-color: rgba(244, 244, 240, 0.14);
      background: rgba(244, 244, 240, 0.12);
      box-shadow:
        inset 0 0 0 1px rgba(244, 244, 240, 0.06),
        0 18px 40px rgba(0, 0, 0, 0.28);
    }

    .wp-theme-graphite .wp-decision-pill.is-bought {
      color: #baf1cf;
      border-color: rgba(186, 241, 207, 0.16);
      background: rgba(74, 222, 128, 0.16);
    }

    .wp-theme-graphite .wp-decision-pill.is-skipped {
      color: rgba(244, 244, 240, 0.72);
      border-color: rgba(244, 244, 240, 0.14);
      background: rgba(244, 244, 240, 0.1);
    }

    .wp-theme-graphite .wp-decision-pill.is-delete {
      color: #fecaca;
      border-color: rgba(254, 202, 202, 0.16);
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
