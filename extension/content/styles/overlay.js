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

function extensionFontUrl(path) {
  return String(extensionAssetUrl(path) || "").replace(/["'\\\n\r]/g, "");
}

function extensionFontFace(family, path, weight, unicodeRange) {
  const url = extensionFontUrl(path);
  if (!url) {
    return "";
  }
  return `
    @font-face {
      font-family: "${family}";
      src: url("${url}") format("woff2");
      font-weight: ${weight};
      font-style: normal;
      font-display: block;
      unicode-range: ${unicodeRange};
    }`;
}

function extensionFontFaceStyles() {
  const latin = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
  const latinExt = "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";
  const cyrillic = "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116";
  const cyrillicExt = "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F";
  const plexFaces = [400, 600, 700].flatMap((weight) => [
    extensionFontFace("IBM Plex Mono", `fonts/ibm-plex-mono-latin-${weight}.woff2`, weight, latin),
    extensionFontFace("IBM Plex Mono", `fonts/ibm-plex-mono-latin-ext-${weight}.woff2`, weight, latinExt),
    extensionFontFace("IBM Plex Mono", `fonts/ibm-plex-mono-cyrillic-${weight}.woff2`, weight, cyrillic),
    extensionFontFace("IBM Plex Mono", `fonts/ibm-plex-mono-cyrillic-ext-${weight}.woff2`, weight, cyrillicExt)
  ]).join("");

  return `
    ${extensionFontFace("Inter", "fonts/inter-latin-var.woff2", "100 900", latin)}
    ${extensionFontFace("Inter", "fonts/inter-latin-ext-var.woff2", "100 900", latinExt)}
    ${extensionFontFace("Inter", "fonts/inter-cyrillic-var.woff2", "100 900", cyrillic)}
    ${extensionFontFace("Inter", "fonts/inter-cyrillic-ext-var.woff2", "100 900", cyrillicExt)}
    ${plexFaces}
    .wp-phosphor {
      display: inline-block;
      flex: 0 0 auto;
      width: 1em;
      height: 1em;
      color: currentColor;
      background-color: currentColor;
      -webkit-mask: var(--wp-icon-url) center / contain no-repeat;
      mask: var(--wp-icon-url) center / contain no-repeat;
    }
  `;
}

function overlayStyles() {
  return `
    ${extensionFontFaceStyles()}

    :host {
      all: initial;
      color-scheme: light;
      --ui-font: "Inter", ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      font-family: var(--ui-font);
      --figure-font: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      --text-micro: 10px;
      --text-caption: 11px;
      --text-control: 12px;
      --text-body: 13px;
      --text-ui: 14px;
      --text-heading: 16px;
    }

    .wl-countdown {
      font-family: var(--figure-font) !important;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0;
    }

    .wl-site-price,
    .wl-compare-price,
    .wl-native-price {
      font-family: var(--figure-font) !important;
      font-variant-numeric: tabular-nums;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0;
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
      width: min(420px, calc(100vw - 32px), calc((100vh - 48px) * 9 / 16));
      height: min(746px, calc(100vh - 48px));
      max-height: calc(100vh - 48px);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 12px;
      padding: 18px;
      color: #101010;
      background: #fcfcfa;
      border: 1px solid rgba(10, 10, 10, 0.08);
      border-radius: 8px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.82),
        0 24px 70px rgba(0, 0, 0, 0.16);
      backdrop-filter: blur(30px) saturate(1.18);
      isolation: isolate;
      transform-origin: top right;
      animation: wlPanelIn 220ms cubic-bezier(.16, 1, .3, 1) both;
      overflow: hidden;
      pointer-events: auto;
    }

    .wl-panel {
      font-family: var(--ui-font);
    }

    .wl-panel::before,
    .wl-panel::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }

    .wl-panel::before {
      background:
        radial-gradient(circle at 12% 0%, rgba(150, 190, 255, 0.74), transparent 34%),
        radial-gradient(circle at 96% 14%, rgba(255, 190, 225, 0.68), transparent 30%),
        radial-gradient(circle at 48% 106%, rgba(170, 255, 226, 0.56), transparent 34%),
        linear-gradient(135deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0));
      opacity: 0.15;
    }

    .wl-panel::after {
      inset: -24% auto -24% -52%;
      width: 44%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.42),
        rgba(190, 224, 255, 0.28),
        transparent
      );
      filter: blur(12px);
      transform: translateX(-120%) rotate(13deg);
      animation: wlSurfaceShine 920ms 180ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-panel > * {
      position: relative;
      z-index: 1;
    }

    .wl-close {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 8px;
      color: rgba(8, 11, 16, 0.58);
      background: rgba(8, 11, 16, 0.04);
    }

    .wl-close:hover {
      color: #101010;
      background: rgba(8, 11, 16, 0.06);
    }

    .wl-close-icon {
      width: 17px;
      height: 17px;
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: 8px 14px;
      min-width: 0;
      padding: 0;
      text-align: left;
    }

    .wl-title-block {
      display: grid;
      gap: 6px;
      min-width: 0;
      padding-top: 1px;
    }

    .wl-timer-line {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
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
      color: rgba(8, 11, 16, 0.56);
      font-family: var(--figure-font);
      font-size: var(--text-caption);
      line-height: 1;
      font-weight: 680;
      white-space: nowrap;
    }

    .wl-controls {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }

    .wl-timer-track {
      grid-column: 1 / -1;
      height: 5px;
      overflow: hidden;
      border-radius: 999px;
      background: rgba(8, 11, 16, 0.1);
    }

    .wl-timer-track span {
      display: block;
      width: 100%;
      height: 100%;
      background: #050505;
      border-radius: inherit;
      transform-origin: left center;
      transition: transform 220ms linear;
    }

    .wl-panel.is-timer-paused .wl-timer-track span {
      opacity: 0.42;
    }

    .wl-timer-button {
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 0;
      border-radius: 8px;
      color: rgba(8, 11, 16, 0.76);
      background: rgba(8, 11, 16, 0.04);
      line-height: 1;
    }

    .wl-timer-button:hover {
      color: #101010;
      background: rgba(8, 11, 16, 0.05);
    }

    .wl-timer-icon {
      width: 12px;
      height: 12px;
      font-size: inherit;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-item {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 10px;
      min-width: 0;
      min-height: 0;
    }

    ${overlayImageStyles()}
    ${overlayFieldStyles()}
    ${overlayMotionStyles()}

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

    @keyframes wlSurfaceShine {
      0% {
        opacity: 0;
        transform: translateX(-120%) rotate(13deg);
      }
      24% {
        opacity: 0.68;
      }
      100% {
        opacity: 0;
        transform: translateX(410%) rotate(13deg);
      }
    }

    @media (max-width: 560px) {
      .wl-panel {
        top: 12px;
        right: 12px;
        left: auto;
        width: min(420px, calc(100vw - 24px), calc((100vh - 24px) * 9 / 16));
        height: min(746px, calc(100vh - 24px));
        max-height: calc(100vh - 24px);
        padding: 16px;
        border-radius: 8px;
      }

      .wl-header {
        gap: 8px 10px;
      }
    }

  `;
}
