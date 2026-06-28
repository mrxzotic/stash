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
      width: 52px;
      height: 52px;
      display: inline-grid;
      place-items: center;
      padding: 0;
      border: 1px solid rgba(60, 60, 67, 0.13);
      border-radius: var(--radius);
      color: rgba(8, 11, 16, 0.72);
      background: rgba(255, 255, 255, 0.52);
      -webkit-backdrop-filter: blur(22px) saturate(1.18);
      backdrop-filter: blur(22px) saturate(1.18);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.66), 0 10px 26px rgba(15, 23, 42, 0.1);
      font-size: var(--text-caption);
      font-weight: 780;
      line-height: 1;
      cursor: pointer;
      opacity: 0;
      overflow: hidden;
      touch-action: manipulation;
      transform: translateY(8px) scale(0.86);
      white-space: nowrap;
      transition: background 180ms cubic-bezier(.16, 1, .3, 1), border-color 180ms cubic-bezier(.16, 1, .3, 1), box-shadow 220ms cubic-bezier(.16, 1, .3, 1), color 180ms cubic-bezier(.16, 1, .3, 1), opacity 180ms ease, transform 260ms cubic-bezier(.18, .95, .24, 1.16);
      will-change: opacity, transform;
    }

    .wp-decision-pill-icon {
      width: 23px;
      height: 23px;
      font-size: inherit;
      stroke-width: 2;
      transition: transform 220ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-decision-pill-label {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      opacity: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .wp-decision-pill.is-bought {
      color: #14643d;
      border-color: rgba(20, 100, 61, 0.14);
      background: rgba(244, 253, 248, 0.58);
    }

    .wp-decision-pill.is-skipped {
      color: rgba(8, 11, 16, 0.58);
      border-color: rgba(60, 60, 67, 0.12);
      background: rgba(255, 255, 255, 0.5);
    }

    .wp-decision-pill.is-delete {
      color: #bd2c22;
      border-color: rgba(189, 44, 34, 0.14);
      background: rgba(255, 255, 255, 0.5);
    }

    .wp-decision-pill:hover,
    .wp-decision-pill:focus-visible {
      outline: 0;
      filter: none;
      background: rgba(255, 255, 255, 0.72);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82), 0 15px 34px rgba(15, 23, 42, 0.14);
      transform: translateY(-2px) scale(1.04);
    }

    .wp-decision-pill.is-bought:hover,
    .wp-decision-pill.is-bought:focus-visible {
      background: rgba(235, 251, 243, 0.78);
    }

    .wp-decision-pill.is-delete:hover,
    .wp-decision-pill.is-delete:focus-visible {
      background: rgba(255, 244, 243, 0.78);
    }

    .wp-decision-pill:active {
      transform: translateY(0) scale(0.94);
      transition-duration: 90ms;
    }

    .wp-decision-pill:hover .wp-decision-pill-icon,
    .wp-decision-pill:focus-visible .wp-decision-pill-icon {
      transform: scale(1.04);
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
      border-radius: var(--radius);
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
      background: rgba(8, 11, 16, 0.1);
      -webkit-backdrop-filter: blur(4px) saturate(0.98);
      backdrop-filter: blur(4px) saturate(0.98);
      opacity: 0;
      pointer-events: none;
      transition:
        opacity 220ms cubic-bezier(.22, 1, .36, 1),
        backdrop-filter 220ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-shell.is-decision-mode .wp-decision-scrim,
    .wp-shell.is-decision-dragging .wp-decision-scrim {
      opacity: 1;
      pointer-events: auto;
    }

    .wp-decision-drop-tray {
      position: absolute;
      top: clamp(236px, 46%, 420px);
      left: 50%;
      z-index: 12;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      max-width: calc(100% - 64px);
      padding: 8px;
      border: 1px solid rgba(60, 60, 67, 0.12);
      border-radius: var(--radius);
      background: rgba(255, 255, 255, 0.44);
      -webkit-backdrop-filter: blur(28px) saturate(1.2);
      backdrop-filter: blur(28px) saturate(1.2);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72), 0 18px 46px rgba(15, 23, 42, 0.14);
      opacity: 0;
      pointer-events: none;
      transform: translate3d(-50%, 14px, 0) scale(0.94);
      transform-origin: 50% 50%;
      transition: opacity 180ms ease, transform 320ms cubic-bezier(.18, .95, .24, 1.12);
      will-change: opacity, transform;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray {
      opacity: 1;
      pointer-events: auto;
      transform: translate3d(-50%, 0, 0) scale(1);
    }

    .wp-decision-drop-tray .wp-decision-pill {
      pointer-events: none;
    }

    .wp-shell.is-decision-mode .wp-decision-drop-tray .wp-decision-pill,
    .wp-shell.is-decision-dragging .wp-decision-drop-tray .wp-decision-pill {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
      transition-duration: 240ms;
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

    .wp-shell.is-decision-mode .wp-items,
    .wp-shell.is-decision-dragging .wp-items {
      z-index: 10;
      pointer-events: none;
    }

    .wp-shell.is-decision-mode .wp-item,
    .wp-shell.is-decision-dragging .wp-item {
      transition: opacity 220ms cubic-bezier(.16, 1, .3, 1), filter 220ms cubic-bezier(.16, 1, .3, 1), transform 280ms cubic-bezier(.18, .95, .24, 1.08);
    }

    .wp-shell.is-decision-mode .wp-item:not(.is-decision-target),
    .wp-shell.is-decision-dragging .wp-item:not(.is-decision-target) {
      opacity: 0.28;
      filter: blur(2.2px) saturate(0.78);
      transform: scale(0.992);
    }

    .wp-shell.is-decision-mode .wp-item.is-decision-target,
    .wp-shell.is-decision-dragging .wp-item.is-decision-target {
      z-index: 2;
      opacity: 1;
      filter: none;
      transform: translateY(-4px) scale(1.012);
    }

    .wp-shell.is-decision-mode .wp-item.is-decision-target::before,
    .wp-shell.is-decision-dragging .wp-item.is-decision-target::before {
      opacity: 0.1;
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
      color: rgba(244, 244, 240, 0.76);
      background: rgba(244, 244, 240, 0.1);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 14px 34px rgba(0, 0, 0, 0.3);
    }

    .wp-theme-graphite .wp-decision-pill.is-bought {
      color: #baf1cf;
      border-color: rgba(186, 241, 207, 0.14);
      background: rgba(74, 222, 128, 0.12);
    }

    .wp-theme-graphite .wp-decision-pill.is-skipped {
      color: rgba(244, 244, 240, 0.72);
      border-color: rgba(244, 244, 240, 0.14);
      background: rgba(244, 244, 240, 0.08);
    }

    .wp-theme-graphite .wp-decision-pill.is-delete {
      color: #fecaca;
      border-color: rgba(254, 202, 202, 0.14);
      background: rgba(244, 244, 240, 0.08);
    }

    .wp-theme-graphite .wp-decision-pill:hover,
    .wp-theme-graphite .wp-decision-pill:focus-visible {
      background: rgba(244, 244, 240, 0.16);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 18px 40px rgba(0, 0, 0, 0.36);
    }

    .wp-theme-graphite .wp-decision-pill.is-bought:hover,
    .wp-theme-graphite .wp-decision-pill.is-bought:focus-visible {
      background: rgba(74, 222, 128, 0.18);
    }

    .wp-theme-graphite .wp-decision-pill.is-delete:hover,
    .wp-theme-graphite .wp-decision-pill.is-delete:focus-visible {
      background: rgba(248, 113, 113, 0.14);
    }

    .wp-theme-graphite .wp-decision-scrim {
      background: rgba(8, 11, 16, 0.26);
      -webkit-backdrop-filter: blur(4px) saturate(0.98);
      backdrop-filter: blur(4px) saturate(0.98);
    }

    .wp-theme-graphite .wp-decision-drop-tray {
      border-color: rgba(244, 244, 240, 0.13);
      background: rgba(22, 23, 27, 0.62);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 48px rgba(0, 0, 0, 0.38);
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
