function extensionAssetUrl(path) {
  try {
    return chrome.runtime.getURL(path);
  } catch (error) {
    if (/extension context invalidated/i.test(String(error?.message || error))) {
      return "";
    }
    throw error;
  }
}

function overlayStyles() {
  return `
    :host {
      all: initial;
      color-scheme: light;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      --figure-font: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      --text-control: 12px;
      --text-body: 13px;
      --text-ui: 14px;
      --text-heading: 16px;
    }

    * {
      box-sizing: border-box;
    }

    button {
      font: inherit;
      cursor: pointer;
    }

    .wl-panel {
      position: fixed;
      top: 24px;
      right: 24px;
      width: min(286px, calc(100vw - 32px));
      display: grid;
      gap: 12px;
      padding: 16px;
      color: #101010;
      background: rgba(251, 251, 248, 0.88);
      border: 1px solid rgba(10, 10, 10, 0.08);
      border-radius: 8px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        0 20px 56px rgba(0, 0, 0, 0.14);
      backdrop-filter: blur(26px) saturate(1.2);
      transform-origin: top right;
      animation: wlPanelIn 220ms cubic-bezier(.16, 1, .3, 1) both;
      overflow: hidden;
      pointer-events: auto;
    }

    .wl-kicker {
      margin: 0;
      color: #101010;
      font-size: var(--text-ui);
      line-height: 1;
      font-weight: 760;
      text-align: center;
    }

    .wl-item {
      min-width: 0;
    }

    .wl-image {
      aspect-ratio: 4 / 5;
      display: grid;
      place-items: center;
      margin-bottom: 8px;
      background: transparent;
      border: 0;
      border-radius: 0;
      overflow: visible;
    }

    .wl-image img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: contain;
      object-position: center;
    }

    .wl-image-placeholder {
      width: 52px;
      height: 52px;
      color: rgba(16, 16, 16, 0.2);
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-item p {
      display: block;
      margin: 0 0 4px;
      color: rgba(16, 16, 16, 0.5);
      font-size: var(--text-body);
      line-height: 1.25;
      font-weight: 400;
    }

    .wl-item h2 {
      margin: 0;
      color: #101010;
      font-size: var(--text-ui);
      line-height: 1.16;
      font-weight: 720;
      letter-spacing: 0;
    }

    .wl-site-price,
    .wl-compare-price {
      display: inline-block;
      margin-top: 5px;
      color: rgba(8, 11, 16, 0.5);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-body);
      line-height: 1.2;
      font-weight: 680;
    }

    .wl-site-price.is-sale {
      color: #d92d20;
    }

    .wl-compare-price {
      margin-top: 4px;
      margin-left: 6px;
    }

    .wl-open-button {
      justify-self: center;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      padding: 0 12px;
      margin-top: 2px;
      border: 0;
      border-radius: 999px;
      color: #fff;
      background: #050505;
      font-size: var(--text-control);
      line-height: 1;
      font-weight: 760;
    }

    .wl-button-icon {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-error {
      position: fixed;
      left: 50%;
      bottom: 34px;
      transform: translateX(-50%);
      padding: 12px 16px;
      border-radius: 8px;
      color: #fff;
      background: #050505;
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
      font-size: var(--text-body);
      font-weight: 700;
      display: grid;
      gap: 4px;
      min-width: 260px;
      border-radius: 8px;
      animation: wlPanelIn 220ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-error span {
      color: rgba(255, 255, 255, 0.68);
      font-size: var(--text-control);
      font-weight: 520;
    }

    @keyframes wlPanelIn {
      0% {
        opacity: 0;
        transform: translateY(-8px) scale(.98);
        filter: blur(6px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @media (max-width: 560px) {
      .wl-panel {
        top: 12px;
        right: 12px;
        left: 12px;
        width: auto;
        padding: 16px;
        border-radius: 8px;
      }
    }
  `;
}
