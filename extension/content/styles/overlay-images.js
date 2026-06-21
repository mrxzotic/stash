function overlayImageStyles() {
  return `
    .wl-image {
      position: relative;
      display: grid;
      place-items: center;
      width: 100%;
      min-height: 0;
      margin-bottom: 0;
      background: transparent;
      border: 0;
      border-radius: 8px;
      overflow: hidden;
      -webkit-clip-path: inset(0 round 8px);
      clip-path: inset(0 round 8px);
      contain: paint;
    }

    .wl-image-frame {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
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
      font-size: 52px;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-image-missing {
      display: grid;
      place-items: center;
      gap: 10px;
      width: 100%;
      min-height: 180px;
      padding: 28px;
      color: rgba(16, 16, 16, 0.42);
      text-align: center;
    }

    .wl-image-missing-logo {
      width: 56px;
      height: 56px;
      object-fit: contain;
      opacity: 0.36;
    }

    .wl-image-missing-text {
      max-width: 150px;
      font-size: var(--text-caption);
      line-height: 1.2;
      font-weight: 740;
      text-transform: uppercase;
    }

    .wl-image-slider-button {
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
      opacity: 0;
      pointer-events: none;
      transform: translateY(-50%);
      transition: opacity 140ms ease, color 140ms ease, transform 140ms ease;
    }

    .wl-image-slider-button.is-prev {
      left: 8px;
    }

    .wl-image-slider-button.is-next {
      right: 8px;
    }

    .wl-image.has-slider:hover .wl-image-slider-button,
    .wl-image.has-slider:focus-within .wl-image-slider-button {
      opacity: 0.5;
      pointer-events: auto;
    }

    .wl-image.has-slider .wl-image-slider-button:hover,
    .wl-image.has-slider .wl-image-slider-button:focus-visible {
      outline: 0;
      opacity: 1;
      color: rgba(16, 16, 16, 0.96);
      transform: translateY(-50%) scale(1.08);
    }

    .wl-image.has-slider .wl-image-slider-button:active {
      transform: translateY(-50%) scale(0.98);
      transition-duration: 80ms;
    }

    .wl-image-slider-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-image-slider-tray {
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

    .wl-image.has-slider:hover .wl-image-slider-tray,
    .wl-image.has-slider:focus-within .wl-image-slider-tray {
      opacity: 1;
      pointer-events: auto;
    }

    .wl-image-delete-button {
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
      opacity: 0.5;
      backdrop-filter: blur(14px);
      transition: opacity 140ms ease, color 140ms ease, transform 140ms ease;
    }

    .wl-image-delete-button:hover,
    .wl-image-delete-button:focus-visible {
      outline: 0;
      opacity: 1;
      color: rgba(180, 24, 24, 0.96);
      background: rgba(255, 255, 255, 0.82);
      transform: translateY(-1px);
    }

    .wl-image-delete-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wl-image-slider {
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

    .wl-image.has-slider:hover .wl-image-slider,
    .wl-image.has-slider:focus-within .wl-image-slider {
      opacity: 0.5;
    }

    .wl-image-slider-dot {
      width: 14px;
      height: 2px;
      border-radius: 999px;
      background: rgba(16, 16, 16, 0.28);
      transition: background 120ms ease, width 120ms ease;
    }

    .wl-image-slider-dot.is-active {
      width: 18px;
      background: rgba(16, 16, 16, 0.82);
    }

    @media (hover: none) {
      .wl-image-slider-tray,
      .wl-image-slider,
      .wl-image-slider-button {
        opacity: 1;
      }

      .wl-image-slider-tray,
      .wl-image-slider-button {
        pointer-events: auto;
      }
    }
  `;
}
