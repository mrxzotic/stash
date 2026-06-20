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
      width: min(306px, calc(100vw - 32px));
      display: grid;
      gap: 13px;
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

    .wl-progress {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      overflow: hidden;
      background: rgba(8, 11, 16, 0.08);
    }

    .wl-progress span {
      display: block;
      width: 100%;
      height: 100%;
      background: rgba(8, 11, 16, 0.46);
      transform-origin: left center;
      animation: wlProgress var(--wl-dismiss-duration, 8000ms) linear forwards;
    }

    .wl-panel.is-timer-paused .wl-progress span {
      animation-play-state: paused;
    }

    .wl-close {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 8px;
      color: rgba(8, 11, 16, 0.58);
      background: transparent;
    }

    .wl-close:hover {
      color: #101010;
      background: rgba(8, 11, 16, 0.06);
    }

    .wl-close-icon {
      width: 17px;
      height: 17px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-header {
      display: grid;
      gap: 4px;
      min-width: 0;
      padding: 1px 30px 0;
      text-align: center;
    }

    .wl-kicker {
      margin: 0;
      color: #101010;
      font-size: var(--text-heading);
      line-height: 1.05;
      font-weight: 760;
      letter-spacing: 0;
    }

    .wl-countdown {
      margin: 0;
      color: rgba(8, 11, 16, 0.46);
      font-family: var(--figure-font);
      font-size: 11px;
      line-height: 1;
      font-weight: 620;
    }

    .wl-timer-row {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 0;
    }

    .wl-timer-button {
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 1px solid rgba(8, 11, 16, 0.12);
      border-radius: 6px;
      color: rgba(8, 11, 16, 0.76);
      background: rgba(255, 255, 255, 0.5);
      box-shadow: 0 1px 1px rgba(8, 11, 16, 0.04);
      line-height: 1;
    }

    .wl-timer-button:hover {
      color: #101010;
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(8, 11, 16, 0.2);
    }

    .wl-timer-icon {
      width: 13px;
      height: 13px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-item {
      min-width: 0;
    }

    .wl-image {
      aspect-ratio: 4 / 5;
      display: grid;
      place-items: center;
      margin-bottom: 10px;
      background: transparent;
      border: 0;
      border-radius: 8px;
      overflow: hidden;
      -webkit-clip-path: inset(0 round 8px);
      clip-path: inset(0 round 8px);
      contain: paint;
    }

    .wl-image img {
      display: block;
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 100%;
      border-radius: 8px;
      -webkit-clip-path: inset(0 round 8px);
      clip-path: inset(0 round 8px);
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

    ${overlayFieldStyles()}

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

    @keyframes wlProgress {
      0% {
        transform: scaleX(1);
      }
      100% {
        transform: scaleX(0);
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

      .wl-header {
        padding-right: 32px;
        padding-left: 32px;
      }
    }
  `;
}
