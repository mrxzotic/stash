function panelPromoStyles() {
  return `
    .wp-brand-wrap {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .wp-founder-peek {
      width: 0;
      height: 24px;
      display: inline-grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 999px;
      background: transparent;
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      transform: translateX(-5px) scale(0.86);
      transition:
        width 160ms cubic-bezier(.16, 1, .3, 1),
        opacity 130ms ease,
        transform 170ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-brand-wrap:hover .wp-founder-peek {
      width: 24px;
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0) scale(1);
    }

    .wp-founder-peek img {
      width: 24px;
      height: 24px;
      display: block;
      border-radius: 999px;
      object-fit: cover;
      box-shadow: 0 0 0 1px rgba(8, 11, 16, 0.08);
    }

    .wp-founder-screen {
      position: absolute;
      inset: 0;
      z-index: 8;
      padding: 0;
      border: 0;
      background: var(--background);
      cursor: default;
      animation: wpFounderScreenIn 120ms ease both;
    }

    .wp-founder-modal {
      position: absolute;
      top: 50%;
      left: 50%;
      z-index: 9;
      width: min(366px, calc(100% - 44px));
      display: grid;
      gap: 8px;
      padding: 0;
      border: 0;
      background: transparent;
      box-shadow: none;
      color: var(--foreground);
      text-align: left;
      transform: translate(-50%, -50%);
      animation: wpFounderModalIn 170ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-founder-close {
      position: absolute;
      top: -12px;
      right: -12px;
      z-index: 1;
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 1px solid rgba(8, 11, 16, 0.1);
      background: #fff;
      color: var(--muted);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(8, 11, 16, 0.1);
    }

    .wp-founder-close:hover,
    .wp-founder-close:focus-visible {
      color: var(--foreground);
      border-color: rgba(8, 11, 16, 0.18);
      background: #fff;
      outline: 0;
    }

    .wp-founder-close-icon {
      width: 15px;
      height: 15px;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-founder-profile {
      width: 100%;
      min-width: 0;
      display: grid;
      grid-template-columns: 72px minmax(0, 1fr);
      align-items: center;
      gap: 14px;
      padding: 14px;
      border: 1px solid rgba(8, 11, 16, 0.1);
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 18px 42px rgba(8, 11, 16, 0.1);
    }

    .wp-founder-photo {
      width: 72px;
      height: 72px;
      display: block;
      border-radius: 8px;
      object-fit: cover;
      box-shadow:
        0 0 0 1px rgba(8, 11, 16, 0.08),
        0 10px 24px rgba(8, 11, 16, 0.12);
    }

    .wp-founder-copy {
      display: grid;
      gap: 5px;
      min-width: 0;
    }

    .wp-founder-copy strong {
      font-size: 20px;
      line-height: 1.1;
      font-weight: 800;
    }

    .wp-founder-copy span {
      color: var(--muted);
      font-family: var(--figure-font);
      font-size: 12px;
      line-height: 1.2;
      font-weight: 680;
    }

    .wp-founder-copy .wp-founder-version {
      color: rgba(8, 11, 16, 0.42);
      font-size: 10px;
      font-weight: 760;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .wp-founder-links {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .wp-founder-link {
      min-width: 0;
      min-height: 86px;
      display: grid;
      align-content: space-between;
      gap: 12px;
      padding: 12px;
      border: 1px solid rgba(8, 11, 16, 0.1);
      border-radius: 8px;
      color: rgba(8, 11, 16, 0.72);
      background: #fff;
      text-decoration: none;
      text-align: left;
      font-family: inherit;
      font-size: 12px;
      line-height: 1;
      font-weight: 720;
      appearance: none;
    }

    .wp-founder-action {
      width: 100%;
      cursor: pointer;
    }

    .wp-founder-link:hover,
    .wp-founder-link:focus-visible {
      color: var(--foreground);
      border-color: rgba(8, 11, 16, 0.18);
      background: #fff;
      outline: 0;
      box-shadow: 0 12px 30px rgba(8, 11, 16, 0.1);
    }

    .wp-founder-link:disabled {
      cursor: default;
      opacity: 0.44;
    }

    .wp-founder-link:disabled:hover {
      color: rgba(8, 11, 16, 0.72);
      border-color: rgba(8, 11, 16, 0.1);
      background: #fff;
      box-shadow: none;
    }

    .wp-founder-link-mark {
      width: 22px;
      height: 22px;
      display: grid;
      place-items: center;
      color: currentColor;
    }

    .wp-founder-link-copy {
      min-width: 0;
      display: grid;
      gap: 3px;
    }

    .wp-founder-link-copy span {
      color: rgba(8, 11, 16, 0.48);
      font-size: 10px;
      line-height: 1;
      font-weight: 760;
      text-transform: uppercase;
    }

    .wp-founder-link-copy strong {
      min-width: 0;
      color: currentColor;
      font-size: 13px;
      line-height: 1.18;
      font-weight: 760;
      overflow-wrap: anywhere;
    }

    .wp-founder-link-icon {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      stroke: currentColor;
      stroke-width: 2.1;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-theme-graphite .wp-founder-peek img,
    .wp-theme-graphite .wp-founder-photo {
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.12),
        0 12px 30px rgba(0, 0, 0, 0.26);
    }

    .wp-theme-graphite .wp-founder-close,
    .wp-theme-graphite .wp-founder-profile {
      border-color: rgba(255, 255, 255, 0.1);
      background: #16171a;
      box-shadow: 0 18px 42px rgba(0, 0, 0, 0.24);
    }

    .wp-theme-graphite .wp-founder-link {
      border-color: rgba(255, 255, 255, 0.1);
      color: rgba(244, 244, 240, 0.7);
      background: #1d1f23;
    }

    .wp-theme-graphite .wp-founder-link:hover,
    .wp-theme-graphite .wp-founder-link:focus-visible {
      color: rgba(244, 244, 240, 0.94);
      border-color: rgba(255, 255, 255, 0.18);
      background: #24272c;
    }

    .wp-theme-graphite .wp-founder-link:disabled:hover {
      color: rgba(244, 244, 240, 0.7);
      border-color: rgba(255, 255, 255, 0.1);
      background: #1d1f23;
      box-shadow: none;
    }

    .wp-theme-graphite .wp-founder-link-copy span {
      color: rgba(244, 244, 240, 0.46);
    }

    .wp-theme-graphite .wp-founder-copy .wp-founder-version {
      color: rgba(244, 244, 240, 0.42);
    }

    @keyframes wpFounderScreenIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes wpFounderModalIn {
      0% {
        opacity: 0;
        transform: translate(-50%, calc(-50% + 8px)) scale(0.98);
        filter: blur(5px);
      }
      100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
        filter: blur(0);
      }
    }
  `;
}
