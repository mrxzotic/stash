function panelStylesChunk1() {
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
      --wp-pill-height: 28px;
      --wp-pill-icon-size: 12px;
      --background: #fbfbf8;
      --foreground: #080b10;
      --muted: #737373;
      --muted-foreground: #8a8a8a;
      --border: rgba(10, 10, 10, 0.08);
      --input: rgba(236, 233, 227, 0.78);
      --card: rgba(255, 255, 255, 0.62);
      --hover: rgba(245, 244, 240, 0.84);
      --shell-bg: rgba(251, 251, 248, 0.86);
      --shell-edge-strong: rgba(251, 251, 248, 0.64);
      --shell-edge-mid: rgba(251, 251, 248, 0.38);
      --shell-edge-clear: rgba(251, 251, 248, 0);
      --shell-edge-mesh-a: rgba(255, 255, 255, 0.54);
      --shell-edge-mesh-b: rgba(232, 226, 214, 0.22);
      --shell-shadow: rgba(0, 0, 0, 0.2);
      --wp-chrome-bg: rgba(255, 255, 255, 0.82);
      --wp-chrome-bg-hover: rgba(255, 255, 255, 0.92);
      --wp-chrome-border: rgba(60, 60, 67, 0.14);
      --wp-chrome-shadow: 0 1px 0 rgba(255, 255, 255, 0.72) inset, 0 8px 24px rgba(15, 23, 42, 0.06);
      --wp-chrome-blur: blur(24px) saturate(1.22);
      --wp-chrome-iridescent: linear-gradient(135deg, rgba(110, 194, 255, 0.14), rgba(255, 139, 222, 0.13) 52%, rgba(160, 255, 208, 0.12));
      --wp-card-bg: var(--card);
      --wp-card-blur: blur(14px) saturate(1.08);
      --wp-popover-bg: rgba(255, 255, 255, 0.96);
      --wp-popover-border: rgba(60, 60, 67, 0.16);
      --wp-popover-shadow: 0 1px 0 rgba(255, 255, 255, 0.86) inset, 0 22px 54px rgba(15, 23, 42, 0.16);
      --wp-popover-blur: blur(28px) saturate(1.18);
      --panel-top: 44px;
      --panel-right: 24px;
      --panel-vertical-space: 68px;
      --primary: #050505;
      --primary-foreground: #ffffff;
      --radius: 8px;
    }

    * {
      box-sizing: border-box;
    }

    *::-webkit-scrollbar {
      width: 0;
      height: 0;
    }

    .wp-shell {
      position: fixed;
      top: var(--panel-top);
      right: var(--panel-right);
      width: min(420px, calc(100vw - 32px), calc((100vh - var(--panel-vertical-space)) * 9 / 16));
      height: min(746px, calc(100vh - var(--panel-vertical-space)));
      max-height: calc(100vh - var(--panel-vertical-space));
      display: flex;
      flex-direction: column;
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--shell-bg);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        0 28px 80px var(--shell-shadow);
      backdrop-filter: blur(30px) saturate(1.22);
      color: var(--foreground);
      pointer-events: auto;
      overflow: hidden;
      isolation: isolate;
      contain: layout style;
      transform: translateZ(0);
      backface-visibility: hidden;
      scrollbar-width: none;
      animation: wpPanelIn 260ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-shell {
      font-family: var(--ui-font);
    }

    .wp-theme-white {
      --background: #ffffff;
      --muted: #747474;
      --muted-foreground: #8c8c8c;
      --border: rgba(10, 10, 10, 0.08);
      --input: rgba(230, 230, 230, 0.72);
      --card: rgba(255, 255, 255, 0.68);
      --hover: rgba(241, 241, 241, 0.82);
      --shell-bg: rgba(255, 255, 255, 0.84);
      --shell-edge-strong: rgba(255, 255, 255, 0.64);
      --shell-edge-mid: rgba(255, 255, 255, 0.36);
      --shell-edge-clear: rgba(255, 255, 255, 0);
      --shell-edge-mesh-a: rgba(255, 255, 255, 0.58);
      --shell-edge-mesh-b: rgba(236, 236, 236, 0.22);
      --shell-shadow: rgba(0, 0, 0, 0.18);
      --wp-chrome-bg: rgba(255, 255, 255, 0.86);
      --wp-chrome-bg-hover: rgba(255, 255, 255, 0.96);
      --wp-popover-bg: rgba(255, 255, 255, 0.97);
    }

    .wp-theme-ice {
      --background: #f6fbff;
      --muted: #687586;
      --muted-foreground: #8b98a8;
      --border: rgba(128, 150, 173, 0.24);
      --input: rgba(215, 226, 239, 0.64);
      --card: rgba(255, 255, 255, 0.58);
      --hover: rgba(232, 240, 249, 0.78);
      --shell-bg: rgba(244, 249, 255, 0.76);
      --shell-edge-strong: rgba(244, 249, 255, 0.62);
      --shell-edge-mid: rgba(244, 249, 255, 0.36);
      --shell-edge-clear: rgba(244, 249, 255, 0);
      --shell-edge-mesh-a: rgba(255, 255, 255, 0.5);
      --shell-edge-mesh-b: rgba(210, 231, 250, 0.2);
      --shell-shadow: rgba(20, 34, 52, 0.2);
      --wp-chrome-bg: rgba(250, 253, 255, 0.82);
      --wp-chrome-bg-hover: rgba(255, 255, 255, 0.94);
      --wp-chrome-border: rgba(128, 150, 173, 0.24);
      --wp-chrome-iridescent: linear-gradient(135deg, rgba(103, 191, 255, 0.16), rgba(171, 147, 255, 0.12) 52%, rgba(147, 255, 218, 0.12));
      --wp-popover-bg: rgba(250, 253, 255, 0.96);
    }

    .wp-theme-graphite {
      color-scheme: dark;
      --background: #151619;
      --foreground: #f4f4f0;
      --muted: #a4a7ad;
      --muted-foreground: #7f858b;
      --border: rgba(255, 255, 255, 0.12);
      --input: rgba(255, 255, 255, 0.12);
      --card: rgba(255, 255, 255, 0.06);
      --hover: rgba(255, 255, 255, 0.08);
      --shell-bg: rgba(18, 19, 22, 0.86);
      --shell-edge-strong: rgba(18, 19, 22, 0.84);
      --shell-edge-mid: rgba(18, 19, 22, 0.5);
      --shell-edge-clear: rgba(18, 19, 22, 0);
      --shell-edge-mesh-a: rgba(255, 255, 255, 0.12);
      --shell-edge-mesh-b: rgba(134, 148, 166, 0.16);
      --shell-shadow: rgba(0, 0, 0, 0.44);
      --primary: #f4f4f0;
      --primary-foreground: #080b10;
      --wp-chrome-bg: rgba(31, 32, 37, 0.9);
      --wp-chrome-bg-hover: rgba(39, 41, 47, 0.94);
      --wp-chrome-border: rgba(255, 255, 255, 0.13);
      --wp-chrome-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 12px 30px rgba(0, 0, 0, 0.26);
      --wp-chrome-blur: blur(26px) saturate(1.18);
      --wp-chrome-iridescent:
        radial-gradient(circle at 12% 18%, rgba(78, 188, 255, 0.2), transparent 34%),
        radial-gradient(circle at 74% 0%, rgba(158, 116, 255, 0.18), transparent 38%),
        radial-gradient(circle at 92% 96%, rgba(255, 94, 182, 0.13), transparent 42%),
        linear-gradient(135deg, rgba(70, 142, 255, 0.1), rgba(142, 92, 255, 0.09) 48%, rgba(255, 114, 191, 0.08));
      --wp-card-bg: rgba(255, 255, 255, 0.06);
      --wp-popover-bg: rgba(20, 21, 25, 0.97);
      --wp-popover-border: rgba(255, 255, 255, 0.14);
      --wp-popover-shadow: 0 1px 0 rgba(255, 255, 255, 0.08) inset, 0 24px 58px rgba(0, 0, 0, 0.44);
      --wp-popover-blur: blur(30px) saturate(1.16);
    }

    .wp-shell::before,
    .wp-shell::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      z-index: 2;
      pointer-events: none;
      background-repeat: no-repeat, no-repeat, no-repeat;
      background-size: 110% 84%, 96% 78%, 100% 100%;
      background-blend-mode: normal, normal, normal;
      -webkit-backdrop-filter: blur(16px) saturate(1.08);
      backdrop-filter: blur(16px) saturate(1.08);
      transform: translateZ(0);
      backface-visibility: hidden;
      will-change: opacity;
      contain: paint;
    }

    .wp-shell::before {
      top: 0;
      height: 228px;
      background-image:
        radial-gradient(ellipse at 26% 0%, var(--shell-edge-mesh-a) 0%, color-mix(in srgb, var(--shell-edge-mesh-a) 42%, transparent) 42%, transparent 72%),
        radial-gradient(ellipse at 82% 18%, var(--shell-edge-mesh-b) 0%, transparent 66%),
        linear-gradient(
          to bottom,
          var(--shell-edge-strong) 0%,
          color-mix(in srgb, var(--shell-edge-strong) 74%, transparent) 32%,
          var(--shell-edge-mid) 58%,
          color-mix(in srgb, var(--shell-edge-mid) 24%, transparent) 78%,
          var(--shell-edge-clear) 100%
        );
      -webkit-mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.86) 0%,
        rgba(0, 0, 0, 0.78) 30%,
        rgba(0, 0, 0, 0.5) 68%,
        transparent 100%
      );
      mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.86) 0%,
        rgba(0, 0, 0, 0.78) 30%,
        rgba(0, 0, 0, 0.5) 68%,
        transparent 100%
      );
    }

    .wp-shell::after {
      bottom: 0;
      height: 112px;
      background-image:
        radial-gradient(ellipse at 70% 100%, var(--shell-edge-mesh-a) 0%, color-mix(in srgb, var(--shell-edge-mesh-a) 38%, transparent) 40%, transparent 72%),
        radial-gradient(ellipse at 18% 84%, var(--shell-edge-mesh-b) 0%, transparent 64%),
        linear-gradient(
          to top,
          var(--shell-edge-strong) 0%,
          color-mix(in srgb, var(--shell-edge-strong) 66%, transparent) 34%,
          var(--shell-edge-mid) 56%,
          color-mix(in srgb, var(--shell-edge-mid) 20%, transparent) 76%,
          var(--shell-edge-clear) 100%
        );
      -webkit-mask-image: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.82) 0%,
        rgba(0, 0, 0, 0.64) 42%,
        rgba(0, 0, 0, 0.36) 72%,
        transparent 100%
      );
      mask-image: linear-gradient(
        to top,
        rgba(0, 0, 0, 0.82) 0%,
        rgba(0, 0, 0, 0.64) 42%,
        rgba(0, 0, 0, 0.36) 72%,
        transparent 100%
      );
    }

    .wp-shell.is-static,
    .wp-shell.is-static .wp-item {
      animation: none;
    }

    button,
    a,
    input,
    select {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible {
      outline: 2px solid rgba(10, 132, 255, 0.72);
      outline-offset: 2px;
    }

    .wp-topbar {
      position: relative;
      z-index: 8;
      height: 40px;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      margin-bottom: 16px;
      font-size: var(--text-ui);
    }

    .wp-topbar.is-searching {
      display: flex;
    }

    .wp-settings h2 {
      margin: 0;
    }

    .wp-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      margin-left: auto;
    }`;
}
