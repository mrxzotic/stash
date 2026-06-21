function panelImageStyles() {
  return `
    .wp-image-slider-tray {
      position: absolute;
      left: 50%;
      bottom: 22px;
      z-index: 4;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0;
      opacity: 0;
      pointer-events: none;
      transform: translateX(-50%);
      transition: opacity 140ms ease;
    }

    .wp-item:hover .wp-image-slider-tray,
    .wp-media:focus-within .wp-image-slider-tray {
      opacity: 1;
      pointer-events: auto;
    }

    .wp-image-slider {
      position: absolute;
      left: 50%;
      bottom: 8px;
      z-index: 4;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0;
      opacity: 0;
      pointer-events: none;
      transform: translateX(-50%);
      transition: opacity 140ms ease;
    }

    .wp-item:hover .wp-image-slider,
    .wp-media:focus-within .wp-image-slider {
      opacity: 0.5;
    }

    .wp-image-slider-button {
      position: absolute;
      top: 50%;
      z-index: 4;
      display: grid;
      place-items: center;
      width: 34px;
      height: 42px;
      padding: 0;
      border: 0;
      border-radius: 999px;
      color: rgba(16, 16, 16, 0.76);
      background: transparent;
      box-shadow: none;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transform: translateY(-50%);
      transition: opacity 140ms ease, color 140ms ease, transform 140ms ease;
      will-change: opacity, transform;
    }

    .wp-image-slider-button.is-prev {
      left: 8px;
    }

    .wp-image-slider-button.is-next {
      right: 8px;
    }

    .wp-item:hover .wp-image-slider-button,
    .wp-media:focus-within .wp-image-slider-button {
      opacity: 0.5;
      pointer-events: auto;
    }

    .wp-item .wp-image-slider-button:hover,
    .wp-item .wp-image-slider-button:focus-visible {
      opacity: 1;
      color: rgba(16, 16, 16, 0.96);
      transform: translateY(-50%) scale(1.08);
      outline: 0;
    }

    .wp-item .wp-image-slider-button:active {
      transform: translateY(-50%) scale(0.98);
      transition-duration: 80ms;
    }

    .wp-image-slider-icon {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-image-slider-dot {
      width: 14px;
      height: 2px;
      border-radius: 999px;
      background: rgba(16, 16, 16, 0.28);
      transition: background 120ms ease, width 120ms ease;
    }

    .wp-image-slider-dot.is-active {
      width: 18px;
      background: rgba(16, 16, 16, 0.82);
    }

    .wp-image-delete-button {
      width: 24px;
      height: 24px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 999px;
      color: rgba(16, 16, 16, 0.62);
      background: rgba(255, 255, 255, 0.58);
      box-shadow: 0 8px 24px rgba(16, 16, 16, 0.1);
      cursor: pointer;
      opacity: 0.5;
      backdrop-filter: blur(14px);
      transition: opacity 140ms ease, color 140ms ease, transform 140ms ease;
    }

    .wp-image-delete-button:hover,
    .wp-image-delete-button:focus-visible {
      outline: 0;
      opacity: 1;
      color: rgba(180, 24, 24, 0.96);
      background: rgba(255, 255, 255, 0.82);
      transform: translateY(-1px);
    }

    .wp-image-delete-icon {
      width: 16px;
      height: 16px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    @media (hover: none) {
      .wp-image-slider-tray,
      .wp-image-slider,
      .wp-image-slider-button {
        opacity: 1;
      }

      .wp-image-slider-tray,
      .wp-image-slider-button {
        pointer-events: auto;
      }
    }
  `;
}
