function panelStylesChunk1() {
  return `
    :host {
      all: initial;
      color-scheme: light;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      --figure-font: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      --text-micro: 10px;
      --text-caption: 11px;
      --text-control: 12px;
      --text-body: 13px;
      --text-ui: 14px;
      --text-heading: 16px;
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
      top: 24px;
      right: 24px;
      width: min(420px, calc(100vw - 32px), calc((100vh - 48px) * 9 / 16));
      height: min(746px, calc(100vh - 48px));
      max-height: calc(100vh - 48px);
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
      contain: layout style paint;
      transform: translateZ(0);
      backface-visibility: hidden;
      scrollbar-width: none;
      animation: wpPanelIn 260ms cubic-bezier(.16, 1, .3, 1) both;
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
    }

    .wp-shell::before,
    .wp-shell::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      z-index: 2;
      pointer-events: none;
      background-repeat: repeat, no-repeat, no-repeat, no-repeat;
      background-size: 72px 72px, 110% 84%, 96% 78%, 100% 100%;
      background-blend-mode: soft-light, normal, normal, normal;
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
        url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='72'%20height='72'%20viewBox='0%200%2072%2072'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='.78'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3CfeColorMatrix%20type='saturate'%20values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type='table'%20tableValues='0%20.18'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width='72'%20height='72'%20filter='url(%23n)'%20opacity='.25'/%3E%3C/svg%3E"),
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
        url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='72'%20height='72'%20viewBox='0%200%2072%2072'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='.78'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3CfeColorMatrix%20type='saturate'%20values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type='table'%20tableValues='0%20.18'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width='72'%20height='72'%20filter='url(%23n)'%20opacity='.25'/%3E%3C/svg%3E"),
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
    input {
      font: inherit;
    }

    button {
      cursor: pointer;
    }

    .wp-topbar {
      position: relative;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
    }

    .wp-topbar.is-searching {
      display: block;
      animation: wpSearchIn 180ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-settings h2 {
      margin: 0;
    }

    .wp-actions {
      display: flex;
      align-items: center;`;
}
