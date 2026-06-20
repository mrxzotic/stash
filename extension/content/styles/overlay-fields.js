function overlayFieldStyles() {
  return `
    .wl-fields {
      display: grid;
      gap: 8px;
      margin: 0;
      min-width: 0;
    }

    .wl-field {
      display: grid;
      grid-template-columns: 46px minmax(0, 1fr);
      gap: 10px;
      align-items: baseline;
      min-width: 0;
    }

    .wl-field dt {
      color: rgba(8, 11, 16, 0.46);
      font-size: 10px;
      line-height: 1.2;
      font-weight: 760;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .wl-field dd {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 10px;
      margin: 0;
      min-width: 0;
      align-items: baseline;
    }

    .wl-field-value {
      min-width: 0;
      color: #101010;
      font-size: var(--text-ui);
      line-height: 1.16;
      font-weight: 720;
      letter-spacing: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wl-field.is-name .wl-field-value {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      white-space: normal;
    }

    .wl-confidence {
      color: rgba(8, 11, 16, 0.42);
      font-family: var(--figure-font);
      font-size: 11px;
      line-height: 1.2;
      font-weight: 680;
      font-variant-numeric: tabular-nums;
    }

    .wl-alternates {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      min-width: 0;
    }

    .wl-alt-button {
      max-width: 100%;
      height: 24px;
      padding: 0 8px;
      border: 1px solid rgba(8, 11, 16, 0.12);
      border-radius: 8px;
      color: rgba(8, 11, 16, 0.72);
      background: rgba(255, 255, 255, 0.46);
      font-size: 11px;
      line-height: 1;
      font-weight: 700;
      letter-spacing: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wl-alt-button:hover {
      color: #101010;
      border-color: rgba(8, 11, 16, 0.28);
      background: rgba(255, 255, 255, 0.7);
    }

    .wl-missing {
      color: rgba(8, 11, 16, 0.42);
    }

    .wl-site-price,
    .wl-compare-price {
      display: inline-block;
      margin-top: 0;
      color: rgba(8, 11, 16, 0.5);
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      font-size: var(--text-body);
      line-height: 1.2;
      font-weight: 680;
      white-space: nowrap;
    }

    .wl-site-price.is-sale {
      color: #d92d20;
    }

    .wl-compare-price {
      margin-top: 0;
      margin-left: 6px;
    }

    .wl-actions {
      justify-self: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 0;
    }

    .wl-open-button,
    .wl-cancel-button {
      height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      font-size: var(--text-control);
      line-height: 1;
      font-weight: 760;
      letter-spacing: 0;
    }

    .wl-open-button {
      justify-self: center;
      gap: 7px;
      padding: 0 12px;
      margin-top: 2px;
      border: 0;
      color: #fff;
      background: #050505;
    }

    .wl-cancel-button {
      padding: 0 11px;
      margin-top: 2px;
      border: 1px solid rgba(8, 11, 16, 0.1);
      color: rgba(8, 11, 16, 0.7);
      background: transparent;
    }

    .wl-cancel-button:hover {
      color: #101010;
      background: rgba(8, 11, 16, 0.05);
      border-color: rgba(8, 11, 16, 0.16);
    }

    .wl-button-icon {
      width: 14px;
      height: 14px;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `;
}
