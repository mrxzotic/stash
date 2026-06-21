function overlayMotionStyles() {
  return `
    .wl-skeleton-layer {
      position: absolute;
      inset: 18px;
      z-index: 5;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto auto;
      gap: 12px;
      pointer-events: none;
      animation: wlSkeletonLayer 980ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-skeleton-head {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px 14px;
      align-items: start;
    }

    .wl-skeleton-line,
    .wl-skeleton-media,
    .wl-skeleton-field span,
    .wl-skeleton-actions span,
    .wl-skeleton-controls span {
      display: block;
      overflow: hidden;
      border-radius: 999px;
      background:
        linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.58) 42%, transparent 72%),
        rgba(8, 11, 16, 0.075);
      background-size: 220% 100%, 100% 100%;
      animation: wlSkeletonSweep 980ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-skeleton-line.is-title {
      width: 72px;
      height: 18px;
    }

    .wl-skeleton-line.is-caption {
      width: 126px;
      height: 11px;
      grid-column: 1;
    }

    .wl-skeleton-line.is-timer {
      height: 5px;
      grid-column: 1 / -1;
    }

    .wl-skeleton-controls {
      grid-column: 2;
      grid-row: 1 / span 2;
      display: inline-flex;
      gap: 6px;
    }

    .wl-skeleton-controls span {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }

    .wl-skeleton-media {
      border-radius: 8px;
      background:
        linear-gradient(112deg, transparent 0%, rgba(255, 255, 255, 0.64) 44%, transparent 72%),
        rgba(8, 11, 16, 0.045);
    }

    .wl-skeleton-fields {
      display: grid;
      gap: 8px;
    }

    .wl-skeleton-field {
      display: grid;
      grid-template-columns: 58px minmax(0, 1fr);
      gap: 12px;
      align-items: center;
    }

    .wl-skeleton-field span:first-child {
      height: 10px;
      opacity: 0.82;
    }

    .wl-skeleton-field span:last-child {
      width: 48%;
      height: 14px;
    }

    .wl-skeleton-field.is-wide span:last-child {
      width: 86%;
      height: 30px;
      border-radius: 8px;
    }

    .wl-skeleton-actions {
      display: grid;
      grid-template-columns: 62px minmax(78px, 1fr) minmax(128px, 1.35fr);
      gap: 8px;
      align-items: center;
    }

    .wl-skeleton-actions span {
      height: 34px;
    }

    .wl-panel.is-motion-reveal {
      animation: wlPanelMotionIn 360ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-panel.is-motion-reveal .wl-header,
    .wl-panel.is-motion-reveal .wl-actions {
      opacity: 0;
      transform: translateY(8px);
      filter: blur(6px);
      animation: wlContentRise 460ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-panel.is-motion-reveal .wl-header {
      animation-delay: 260ms;
    }

    .wl-panel.is-motion-reveal .wl-image {
      opacity: 0;
      transform: translateY(12px) scale(.985);
      animation: wlMediaShellIn 560ms 410ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-panel.is-motion-reveal .wl-image-frame > img,
    .wl-panel.is-motion-reveal .wl-image-placeholder {
      opacity: 0;
      transform: scale(1.035);
      -webkit-clip-path: inset(10% round 8px);
      clip-path: inset(10% round 8px);
      animation: wlProductReveal 640ms 520ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-panel.is-motion-reveal .wl-field {
      opacity: 0;
      transform: translateY(8px);
      filter: blur(5px);
      animation: wlContentRise 430ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wl-panel.is-motion-reveal .wl-field:nth-child(1) {
      animation-delay: 680ms;
    }

    .wl-panel.is-motion-reveal .wl-field:nth-child(2) {
      animation-delay: 750ms;
    }

    .wl-panel.is-motion-reveal .wl-field:nth-child(3) {
      animation-delay: 820ms;
    }

    .wl-panel.is-motion-reveal .wl-actions {
      animation-delay: 910ms;
    }

    .wl-panel.is-motion-reveal .wl-action-group > button {
      transform: translateY(0) scale(.98);
      animation: wlButtonSettle 360ms 980ms cubic-bezier(.16, 1, .3, 1) both;
    }

    @keyframes wlPanelMotionIn {
      0% {
        opacity: 0;
        transform: translateY(-12px) scale(.982);
        filter: blur(10px) saturate(.96);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0) saturate(1);
      }
    }

    @keyframes wlSkeletonLayer {
      0% {
        opacity: 0;
        transform: translateY(6px);
      }
      14%,
      56% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-4px);
      }
    }

    @keyframes wlSkeletonSweep {
      0% {
        background-position: 180% 0, 0 0;
      }
      100% {
        background-position: -80% 0, 0 0;
      }
    }

    @keyframes wlContentRise {
      0% {
        opacity: 0;
        transform: translateY(8px);
        filter: blur(6px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }
    }

    @keyframes wlMediaShellIn {
      0% {
        opacity: 0;
        transform: translateY(12px) scale(.985);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes wlProductReveal {
      0% {
        opacity: 0;
        transform: scale(1.035);
        -webkit-clip-path: inset(10% round 8px);
        clip-path: inset(10% round 8px);
      }
      100% {
        opacity: 1;
        transform: scale(1);
        -webkit-clip-path: inset(0 round 8px);
        clip-path: inset(0 round 8px);
      }
    }

    @keyframes wlButtonSettle {
      0% {
        transform: translateY(4px) scale(.98);
      }
      100% {
        transform: translateY(0) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wl-skeleton-layer {
        display: none;
      }

      .wl-panel.is-motion-reveal,
      .wl-panel.is-motion-reveal .wl-header,
      .wl-panel.is-motion-reveal .wl-image,
      .wl-panel.is-motion-reveal .wl-image-frame > img,
      .wl-panel.is-motion-reveal .wl-image-placeholder,
      .wl-panel.is-motion-reveal .wl-field,
      .wl-panel.is-motion-reveal .wl-actions,
      .wl-panel.is-motion-reveal .wl-action-group > button {
        opacity: 1;
        transform: none;
        filter: none;
        animation: none;
      }
    }
  `;
}
