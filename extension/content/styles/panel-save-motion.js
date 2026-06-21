function panelSaveMotionStyles() {
  return `
    .wp-shell.is-static .wp-item.is-new,
    .wp-item.is-new {
      animation: wpNewCardShell 520ms cubic-bezier(.16, 1, .3, 1) both;
      overflow: visible;
    }

    .wp-shell.is-static .wp-item.is-shifted-right,
    .wp-item.is-shifted-right {
      animation: wpCardShiftRight 520ms 60ms cubic-bezier(.16, 1, .3, 1) both;
      transform-origin: center top;
    }

    .wp-new-card-skeleton {
      position: absolute;
      inset: 0;
      z-index: 6;
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 8px;
      pointer-events: none;
      animation: wpNewCardSkeletonLayer 940ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-new-card-skeleton-media,
    .wp-new-card-skeleton-line {
      display: block;
      overflow: hidden;
      background:
        linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0.58) 42%, transparent 72%),
        rgba(8, 11, 16, 0.075);
      background-size: 220% 100%, 100% 100%;
      animation: wpNewCardSkeletonSweep 940ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-new-card-skeleton-media {
      border-radius: 8px;
      background:
        linear-gradient(112deg, transparent 0%, rgba(255, 255, 255, 0.64) 44%, transparent 72%),
        rgba(8, 11, 16, 0.045);
      background-size: 220% 100%, 100% 100%;
    }

    .wp-new-card-skeleton-copy {
      display: grid;
      gap: 8px;
    }

    .wp-new-card-skeleton-line {
      height: 11px;
      border-radius: 999px;
    }

    .wp-new-card-skeleton-line.is-brand {
      width: 42%;
    }

    .wp-new-card-skeleton-line.is-title {
      width: 86%;
      height: 28px;
      border-radius: 8px;
    }

    .wp-new-card-skeleton-line.is-price {
      width: 34%;
      height: 12px;
    }

    .wp-shell.is-static .wp-item.is-new .wp-media,
    .wp-item.is-new .wp-media {
      opacity: 0;
      transform: translateY(10px) scale(.985);
      animation: wpNewCardMediaIn 540ms 360ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-shell.is-static .wp-item.is-new .wp-image-frame > img,
    .wp-shell.is-static .wp-item.is-new .wp-image-placeholder,
    .wp-item.is-new .wp-image-frame > img,
    .wp-item.is-new .wp-image-placeholder {
      opacity: 0;
      transform: scale(1.035);
      -webkit-clip-path: inset(8% round 8px);
      clip-path: inset(8% round 8px);
      animation: wpNewCardProductReveal 620ms 450ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-shell.is-static .wp-item.is-new .wp-brand-row,
    .wp-shell.is-static .wp-item.is-new .wp-title-row,
    .wp-shell.is-static .wp-item.is-new .wp-price-row,
    .wp-item.is-new .wp-brand-row,
    .wp-item.is-new .wp-title-row,
    .wp-item.is-new .wp-price-row {
      opacity: 0;
      transform: translateY(8px);
      filter: blur(5px);
      animation: wpNewCardCopyRise 420ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-shell.is-static .wp-item.is-new .wp-brand-row,
    .wp-item.is-new .wp-brand-row {
      animation-delay: 650ms;
    }

    .wp-shell.is-static .wp-item.is-new .wp-title-row,
    .wp-item.is-new .wp-title-row {
      animation-delay: 720ms;
    }

    .wp-shell.is-static .wp-item.is-new .wp-price-row,
    .wp-item.is-new .wp-price-row {
      animation-delay: 790ms;
    }

    .wp-shell.is-static .wp-item.is-new::before,
    .wp-item.is-new::before {
      animation: wpNewCardGlow 1180ms cubic-bezier(.16, 1, .3, 1) both;
    }

    @keyframes wpNewCardShell {
      0% {
        opacity: 0;
        transform: translateY(12px) scale(.982);
        filter: blur(8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpCardShiftRight {
      0% {
        opacity: .74;
        transform: translateX(calc(-100% - 16px)) scale(.992);
        filter: blur(4px);
      }
      100% {
        opacity: 1;
        transform: translateX(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpNewCardSkeletonLayer {
      0% {
        opacity: 0;
        transform: translateY(6px);
      }
      14%,
      58% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-4px);
      }
    }

    @keyframes wpNewCardSkeletonSweep {
      0% {
        background-position: 180% 0, 0 0;
      }
      100% {
        background-position: -80% 0, 0 0;
      }
    }

    @keyframes wpNewCardMediaIn {
      0% {
        opacity: 0;
        transform: translateY(10px) scale(.985);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes wpNewCardProductReveal {
      0% {
        opacity: 0;
        transform: scale(1.035);
        -webkit-clip-path: inset(8% round 8px);
        clip-path: inset(8% round 8px);
      }
      100% {
        opacity: 1;
        transform: scale(1);
        -webkit-clip-path: inset(0 round 8px);
        clip-path: inset(0 round 8px);
      }
    }

    @keyframes wpNewCardCopyRise {
      0% {
        opacity: 0;
        transform: translateY(8px);
        filter: blur(5px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
        filter: blur(0);
      }
    }

    @keyframes wpNewCardGlow {
      0%,
      100% {
        opacity: 0;
      }
      42% {
        opacity: .15;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-new-card-skeleton {
        display: none;
      }

      .wp-shell.is-static .wp-item.is-new,
      .wp-shell.is-static .wp-item.is-shifted-right,
      .wp-shell.is-static .wp-item.is-new .wp-media,
      .wp-shell.is-static .wp-item.is-new .wp-image-frame > img,
      .wp-shell.is-static .wp-item.is-new .wp-image-placeholder,
      .wp-shell.is-static .wp-item.is-new .wp-brand-row,
      .wp-shell.is-static .wp-item.is-new .wp-title-row,
      .wp-shell.is-static .wp-item.is-new .wp-price-row {
        opacity: 1;
        transform: none;
        filter: none;
        animation: none;
        transition: none;
      }
    }
  `;
}
