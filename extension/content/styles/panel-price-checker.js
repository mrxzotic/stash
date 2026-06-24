function panelPriceCheckerStyles() {
  return `
    .wp-price-checker {
      position: absolute;
      right: 20px;
      bottom: 20px;
      z-index: 6;
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: rgba(8, 11, 16, 0.58);
      opacity: 0;
      cursor: pointer;
      transform: translateY(5px) scale(.96);
      transition:
        opacity 150ms ease,
        color 150ms ease,
        transform 180ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-shell:hover .wp-price-checker,
    .wp-shell:focus-within .wp-price-checker,
    .wp-price-checker.is-running {
      opacity: 0.52;
      transform: translateY(0) scale(1);
    }

    .wp-price-checker:hover,
    .wp-price-checker:focus-visible {
      outline: 0;
      color: rgba(8, 11, 16, 0.9);
      opacity: 1;
      transform: translateY(-1px) scale(1.06);
    }

    .wp-price-checker:active {
      transform: translateY(0) scale(.98);
      transition-duration: 80ms;
    }

    .wp-price-checker:disabled {
      cursor: default;
      pointer-events: none;
    }

    .wp-price-checker-icon {
      width: 20px;
      height: 20px;
    }

    .wp-price-checker.is-running .wp-price-checker-icon {
      animation: wpPriceCheckSpin 880ms linear infinite;
    }

    .wp-price-check-status {
      position: absolute;
      right: 2px;
      bottom: 2px;
      z-index: 5;
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      color: rgba(8, 11, 16, 0.68);
      pointer-events: none;
      transform-origin: center;
      animation: wpPriceCheckStatus 8000ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-price-check-status.is-down {
      color: #0f9f6e;
    }

    .wp-price-check-status.is-up {
      color: #d92d20;
    }

    .wp-price-check-status.is-missed {
      color: rgba(8, 11, 16, 0.34);
    }

    .wp-price-check-status-icon {
      width: 18px;
      height: 18px;
    }

    .wp-summary-capsule .wp-total {
      position: relative;
    }

    .wp-price-check-summary {
      position: absolute;
      left: 13px;
      top: 50%;
      width: 16px;
      height: 16px;
      display: grid;
      place-items: center;
      color: rgba(8, 11, 16, 0.56);
      pointer-events: none;
      transform-origin: center;
      animation: wpPriceCheckSummaryStatus 8000ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-price-check-summary[hidden] {
      display: none !important;
    }

    .wp-price-check-summary.is-down {
      color: #0f9f6e;
    }

    .wp-price-check-summary.is-up {
      color: #d92d20;
    }

    .wp-price-check-summary.is-missed {
      color: rgba(8, 11, 16, 0.34);
    }

    .wp-price-check-summary-icon {
      width: 16px;
      height: 16px;
    }

    .wp-item.is-price-check-updated .wp-price-row .wp-site-price,
    .wp-item.is-price-check-updated .wp-price-row .wp-compare-price,
    .wp-item.is-price-check-updated .wp-price-row .wp-native-price,
    .wp-item.is-price-check-up .wp-price-row .wp-site-price,
    .wp-item.is-price-check-up .wp-price-row .wp-compare-price,
    .wp-item.is-price-check-up .wp-price-row .wp-native-price,
    .wp-item.is-price-check-down .wp-price-row .wp-site-price,
    .wp-item.is-price-check-down .wp-price-row .wp-compare-price,
    .wp-item.is-price-check-down .wp-price-row .wp-native-price {
      animation: wpCardPriceCount 720ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-theme-graphite .wp-price-checker {
      color: rgba(244, 244, 240, 0.72);
    }

    .wp-theme-graphite .wp-price-checker:hover,
    .wp-theme-graphite .wp-price-checker:focus-visible {
      color: rgba(244, 244, 240, 0.94);
    }

    .wp-theme-graphite .wp-price-check-status {
      color: rgba(244, 244, 240, 0.72);
    }

    .wp-theme-graphite .wp-price-check-summary {
      color: rgba(244, 244, 240, 0.68);
    }

    .wp-theme-graphite .wp-price-check-status.is-down {
      color: #53d29f;
    }

    .wp-theme-graphite .wp-price-check-summary.is-down {
      color: #53d29f;
    }

    .wp-theme-graphite .wp-price-check-status.is-up {
      color: #ff6b62;
    }

    .wp-theme-graphite .wp-price-check-summary.is-up {
      color: #ff6b62;
    }

    .wp-theme-graphite .wp-price-check-status.is-missed {
      color: rgba(244, 244, 240, 0.34);
    }

    .wp-theme-graphite .wp-price-check-summary.is-missed {
      color: rgba(244, 244, 240, 0.34);
    }

    @keyframes wpPriceCheckSpin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes wpPriceCheckStatus {
      0% {
        opacity: 0;
        transform: translateY(4px) scale(.82) rotate(-18deg);
        filter: blur(3px);
      }

      16% {
        opacity: 1;
        transform: translateY(0) scale(1.08) rotate(0deg);
        filter: blur(0);
      }

      72% {
        opacity: 0.82;
        transform: scale(1);
        filter: blur(0);
      }

      100% {
        opacity: 0;
        transform: translateY(-3px) scale(.92);
        filter: blur(2px);
      }
    }

    @keyframes wpPriceCheckSummaryStatus {
      0% {
        opacity: 0;
        transform: translateY(-50%) translateX(-2px) scale(.82);
        filter: blur(3px);
      }

      14% {
        opacity: 1;
        transform: translateY(-50%) translateX(0) scale(1.08);
        filter: blur(0);
      }

      74% {
        opacity: 0.82;
        transform: translateY(-50%) scale(1);
        filter: blur(0);
      }

      100% {
        opacity: 0;
        transform: translateY(-50%) translateX(2px) scale(.92);
        filter: blur(2px);
      }
    }
  `;
}
