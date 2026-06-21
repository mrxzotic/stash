function panelPromoStyles() {
  return `
    .wp-brand-cluster {
      height: 40px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .wp-founder-modal {
      position: absolute;
      inset: 0;
      z-index: 9;
      width: auto;
      max-height: none;
      min-height: 100%;
      display: grid;
      align-content: start;
      gap: 0;
      padding: 64px 48px 40px;
      border: 0;
      border-radius: inherit;
      background: var(--background);
      box-shadow: none;
      color: var(--foreground);
      text-align: left;
      overflow: auto;
      scrollbar-width: none;
      transform: translateZ(0);
      animation: wpFounderViewIn 180ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-founder-close {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      background: transparent;
      color: rgba(8, 11, 16, 0.42);
      border-radius: 8px;
      box-shadow: none;
      transition:
        background 140ms ease,
        color 140ms ease,
        transform 160ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-founder-close:hover,
    .wp-founder-close:focus-visible {
      color: var(--foreground);
      background: rgba(8, 11, 16, 0.055);
      outline: 0;
    }

    .wp-founder-close:active {
      transform: scale(0.94);
    }

    .wp-founder-close-icon { width: 15px; height: 15px; font-size: 15px; }

    .wp-founder-app {
      width: 100%;
      min-width: 0;
      display: grid;
      grid-template-columns: 48px minmax(0, 1fr);
      align-items: center;
      gap: 16px;
      padding: 0 40px 22px 0;
    }

    .wp-founder-app-logo {
      width: 48px;
      height: 48px;
      display: block;
      object-fit: contain;
      filter: drop-shadow(0 10px 22px rgba(8, 11, 16, 0.1));
    }

    .wp-founder-app-copy {
      display: grid;
      gap: 6px;
      min-width: 0;
    }

    .wp-founder-app-copy strong {
      font-family: var(--ui-font);
      font-size: 24px;
      line-height: 1;
      font-weight: 680;
      letter-spacing: 0;
      opacity: 0.9;
    }

    .wp-founder-app-copy p { max-width: 220px; margin: 0; color: rgba(8, 11, 16, 0.56); font-size: 13px; line-height: 18px; font-weight: 560; }

    .wp-founder-photo {
      width: 40px;
      height: 40px;
      display: block;
      border-radius: 8px;
      object-fit: cover;
      box-shadow:
        0 0 0 1px rgba(8, 11, 16, 0.08),
        0 10px 24px rgba(8, 11, 16, 0.12);
    }

    .wp-founder-meta {
      min-width: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      color: rgba(8, 11, 16, 0.42);
      font-family: var(--ui-font);
      font-size: 11px;
      line-height: 1;
      font-weight: 560;
      letter-spacing: 0;
    }

    .wp-founder-version { color: rgba(8, 11, 16, 0.38); }

    .wp-founder-site {
      min-width: 0;
      color: rgba(8, 11, 16, 0.54);
      text-decoration: none;
      overflow-wrap: anywhere;
      transition: color 140ms ease;
    }

    .wp-founder-site:hover,
    .wp-founder-site:focus-visible {
      color: var(--foreground);
      outline: 0;
    }

    .wp-founder-section {
      min-width: 0;
      display: grid;
      gap: 10px;
      padding: 18px 0 0;
      border-top: 1px solid rgba(8, 11, 16, 0.075);
    }

    .wp-founder-private {
      gap: 12px;
      padding-top: 20px;
    }

    .wp-founder-section-title { color: rgba(8, 11, 16, 0.42); font-size: 11px; line-height: 1; font-weight: 650; text-transform: none; }

    .wp-founder-person {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .wp-founder-person-copy {
      min-width: 0;
      display: grid;
      gap: 3px;
    }

    .wp-founder-person strong { min-width: 0; color: var(--foreground); font-size: 15px; line-height: 19px; font-weight: 680; }

    .wp-founder-handle {
      min-width: 0;
      color: rgba(8, 11, 16, 0.44);
      font-size: 12px;
      line-height: 14px;
      font-weight: 590;
      overflow-wrap: anywhere;
    }

    .wp-founder-backup {
      min-width: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      align-items: start;
      column-gap: 16px;
      row-gap: 12px;
      padding: 20px 0 18px;
      border-top: 1px solid rgba(8, 11, 16, 0.075);
    }

    .wp-founder-backup-copy {
      min-width: 0;
      display: grid;
      gap: 6px;
    }

    .wp-founder-backup-copy span {
      color: rgba(8, 11, 16, 0.42);
      font-size: 11px;
      line-height: 1;
      font-weight: 650;
      text-transform: none;
    }

    .wp-founder-backup-copy strong {
      color: rgba(8, 11, 16, 0.78);
      font-size: 13px;
      line-height: 16px;
      font-weight: 640;
    }

    .wp-founder-backup-copy small {
      color: rgba(8, 11, 16, 0.46);
      font-size: 12px;
      line-height: 16px;
      font-weight: 520;
    }

    .wp-founder-backup-actions {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
    }

    .wp-founder-backup-action {
      min-height: 32px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0 10px;
      border: 0;
      border-radius: 8px;
      color: #0a84ff;
      background: transparent;
      font-size: 13px;
      line-height: 16px;
      font-weight: 650;
      appearance: none;
      transition:
        background 140ms ease,
        color 140ms ease,
        transform 160ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-founder-backup-action:hover,
    .wp-founder-backup-action:focus-visible {
      color: #0066cc;
      background: rgba(10, 132, 255, 0.08);
      outline: 0;
    }

    .wp-founder-backup-action:active {
      transform: scale(0.98);
    }

    .wp-founder-action-icon {
      width: 15px;
      height: 15px;
      font-size: 15px;
      stroke: currentColor;
      stroke-width: 2.1;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-founder-import-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

    .wp-founder-contact-icons {
      min-width: 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      padding-left: 52px;
    }

    .wp-founder-contact-icon {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border-radius: 8px;
      color: rgba(8, 11, 16, 0.58);
      background: transparent;
      text-decoration: none;
      transition:
        background 140ms ease,
        color 140ms ease,
        transform 160ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-founder-contact-icon:hover,
    .wp-founder-contact-icon:focus-visible {
      color: var(--foreground);
      background: rgba(8, 11, 16, 0.055);
      outline: 0;
    }

    .wp-founder-contact-icon:active {
      transform: scale(0.94);
    }

    .wp-founder-link-icon { width: 16px; height: 16px; flex: 0 0 auto; font-size: 16px; }

    .wp-theme-graphite .wp-founder-app-logo {
      filter: drop-shadow(0 12px 26px rgba(0, 0, 0, 0.3));
    }

    .wp-theme-graphite .wp-founder-photo {
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.12),
        0 12px 30px rgba(0, 0, 0, 0.26);
    }

    .wp-theme-graphite .wp-founder-modal {
      background: #16171a;
      box-shadow: none;
    }

    .wp-theme-graphite .wp-founder-section,
    .wp-theme-graphite .wp-founder-backup {
      border-top-color: rgba(255, 255, 255, 0.08);
    }

    .wp-theme-graphite .wp-founder-close {
      color: rgba(244, 244, 240, 0.44);
      background: transparent;
    }

    .wp-theme-graphite .wp-founder-close:hover,
    .wp-theme-graphite .wp-founder-close:focus-visible {
      color: rgba(244, 244, 240, 0.94);
      background: rgba(244, 244, 240, 0.08);
    }

    .wp-theme-graphite .wp-founder-app-copy p,
    .wp-theme-graphite .wp-founder-version,
    .wp-theme-graphite .wp-founder-handle,
    .wp-theme-graphite .wp-founder-section-title,
    .wp-theme-graphite .wp-founder-backup-copy span,
    .wp-theme-graphite .wp-founder-backup-copy small {
      color: rgba(244, 244, 240, 0.46);
    }

    .wp-theme-graphite .wp-founder-site {
      color: rgba(244, 244, 240, 0.62);
    }

    .wp-theme-graphite .wp-founder-site:hover,
    .wp-theme-graphite .wp-founder-site:focus-visible {
      color: rgba(244, 244, 240, 0.94);
    }

    .wp-theme-graphite .wp-founder-backup-copy strong {
      color: rgba(244, 244, 240, 0.7);
    }

    .wp-theme-graphite .wp-founder-backup-action {
      color: #66b3ff;
      background: transparent;
    }

    .wp-theme-graphite .wp-founder-backup-action:hover,
    .wp-theme-graphite .wp-founder-backup-action:focus-visible {
      color: #9dccff;
      background: rgba(102, 179, 255, 0.12);
    }

    .wp-theme-graphite .wp-founder-contact-icon {
      color: rgba(244, 244, 240, 0.7);
      background: transparent;
    }

    .wp-theme-graphite .wp-founder-contact-icon:hover,
    .wp-theme-graphite .wp-founder-contact-icon:focus-visible {
      color: rgba(244, 244, 240, 0.94);
      background: rgba(244, 244, 240, 0.08);
    }

    @keyframes wpFounderViewIn {
      0% {
        opacity: 0;
        transform: translateX(12px) translateZ(0);
      }
      100% {
        opacity: 1;
        transform: translateX(0) translateZ(0);
      }
    }
  `;
}
