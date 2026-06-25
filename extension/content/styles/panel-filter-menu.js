function panelFilterMenuStyles() {
  return `
    .wp-filters {
      gap: 8px;
    }

    .wp-filter-rail {
      justify-self: start;
      width: 100%;
      gap: 8px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 2px 0;
      margin: -2px 0;
      scroll-padding-inline: 0;
      scrollbar-width: none;
    }

    .wp-filter-rail::-webkit-scrollbar {
      display: none;
    }

    .wp-brand-chip,
    .wp-filter-rail > .wp-filter {
      height: var(--wp-pill-height);
      min-width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.54);
      color: rgba(8, 11, 16, 0.74);
      box-shadow: none;
      font-size: var(--text-control);
      font-weight: 720;
      line-height: 1;
      white-space: nowrap;
    }

    .wp-brand-chip {
      flex: 0 0 auto;
      min-width: 50px;
      gap: 6px;
      padding: 0 9px;
      border-color: rgba(8, 11, 16, 0.07);
      background: rgba(255, 255, 255, 0.38);
      color: rgba(8, 11, 16, 0.52);
      font-family: var(--figure-font);
      font-size: var(--text-control);
      font-weight: 680;
      transition:
        background 220ms cubic-bezier(.18, .84, .24, 1),
        border-color 220ms cubic-bezier(.18, .84, .24, 1),
        color 220ms cubic-bezier(.18, .84, .24, 1),
        transform 260ms cubic-bezier(.18, .84, .24, 1);
    }

    .wp-brand-chip:hover,
    .wp-brand-chip:focus-visible {
      outline: 0;
      border-color: rgba(8, 11, 16, 0.14);
      background: rgba(255, 255, 255, 0.62);
      color: rgba(8, 11, 16, 0.7);
      transform: translateY(-1px);
    }

    .wp-brand-chip.is-active,
    .wp-filter-rail > .wp-filter.is-active {
      color: var(--primary-foreground);
      border-color: rgba(8, 11, 16, 0.86);
      background: rgba(8, 11, 16, 0.86);
      font-weight: 780;
    }

    .wp-brand-chip.is-filtered {
      max-width: min(152px, 42vw);
      padding-right: 8px;
    }

    .wp-brand-chip.is-active .wp-brand-chip-count,
    .wp-brand-chip.is-active .wp-brand-chip-label,
    .wp-filter-rail > .wp-filter.is-active .wp-filter-trigger-label {
      color: var(--primary-foreground);
      opacity: 0.88;
    }

    .wp-theme-graphite .wp-brand-chip.is-active,
    .wp-theme-graphite .wp-filter-rail > .wp-filter.is-active {
      color: #080b10;
      border-color: rgba(255, 255, 255, 0.9);
      background: rgba(244, 244, 240, 0.9);
    }

    .wp-theme-graphite .wp-filter-trigger-label {
      color: rgba(244, 244, 240, 0.76);
    }

    .wp-theme-graphite .wp-brand-chip.is-active .wp-brand-chip-count,
    .wp-theme-graphite .wp-brand-chip.is-active .wp-brand-chip-label,
    .wp-theme-graphite .wp-filter-rail > .wp-filter.is-active .wp-filter-trigger-label {
      color: #080b10;
    }

    .wp-filter-rail > .wp-filter {
      padding: 0 10px;
    }

    .wp-filter-rail > .wp-filter-shortlist,
    .wp-filter-rail > .wp-filter-trigger {
      flex: 0 0 auto;
      min-width: 42px;
      max-width: 128px;
    }

    .wp-filter-rail > .wp-filter-shortlist {
      min-width: 50px; gap: 6px; padding: 0 9px;
      border-color: rgba(8, 11, 16, 0.07);
      background: rgba(255, 255, 255, 0.38);
      color: rgba(8, 11, 16, 0.52);
    }

    .wp-filter-rail > .wp-filter-archive {
      flex: 0 0 auto; min-width: 50px; gap: 6px; padding: 0 9px;
    }

    .wp-filters.is-filter-crowded .wp-brand-chip,
    .wp-filters.is-filter-crowded .wp-filter-rail > .wp-filter-shortlist,
    .wp-filters.is-filter-crowded .wp-filter-rail > .wp-filter-archive { min-width: var(--wp-pill-height); gap: 5px; padding: 0 7px; }

    .wp-filters.is-filter-crowded .wp-brand-chip.is-active,
    .wp-filters.is-filter-crowded .wp-filter-rail > .wp-filter-shortlist.is-active,
    .wp-filters.is-filter-crowded .wp-filter-rail > .wp-filter-archive.is-active { min-width: 44px; }

    .wp-brand-chip-icon,
    .wp-shortlist-chip-icon,
    .wp-archive-chip-icon {
      width: 14px; height: 14px; flex: 0 0 14px; font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.25;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.62;
    }

    .wp-shortlist-chip-icon {
      width: 16px; height: 16px; flex-basis: 16px; font-size: inherit;
    }

    .wp-brand-chip-icon {
      width: 20px; height: 20px; flex-basis: 20px; font-size: inherit;
      stroke-width: 1.9;
    }

    .wp-brand-chip-count,
    .wp-brand-chip-label,
    .wp-shortlist-chip-count {
      min-width: 1ch;
      font-family: var(--figure-font);
      font-variant-numeric: tabular-nums;
      opacity: 0.72;
    }

    .wp-brand-chip-label {
      max-width: 92px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: var(--ui-font);
      font-size: var(--text-control);
      font-weight: 760;
      letter-spacing: 0;
    }

    .wp-shortlist-chip-count {
      font-weight: 720;
    }

    .wp-filters.is-filter-crowded .wp-brand-chip-count, .wp-filters.is-filter-crowded .wp-shortlist-chip-count, .wp-filters.is-filter-crowded .wp-archive-count { display: none; }

    .wp-filters.is-filter-crowded .wp-brand-chip-label {
      max-width: 62px;
    }

    .wp-chip-clear {
      width: 14px; height: 14px; flex: 0 0 14px; display: grid; place-items: center;
      margin-left: 1px; opacity: 0.72;
      transform: scale(.96);
      transition:
        opacity 180ms ease,
        transform 220ms cubic-bezier(.18, .84, .24, 1);
    }

    .wp-chip-clear-icon {
      width: 12px; height: 12px; font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .wp-brand-chip:hover .wp-chip-clear,
    .wp-brand-chip:focus-visible .wp-chip-clear,
    .wp-filter-archive:hover .wp-chip-clear,
    .wp-filter-archive:focus-visible .wp-chip-clear,
    .wp-filter-trigger:hover .wp-chip-clear,
    .wp-filter-trigger:focus-visible .wp-chip-clear {
      opacity: 0.9;
      transform: scale(1);
    }

    .wp-filter-trigger-label {
      min-width: 0;
      max-width: 0;
      margin-left: 0;
      margin-right: 0;
      color: rgba(8, 11, 16, 0.64);
      font-family: var(--ui-font);
      font-size: var(--text-control);
      font-weight: 760;
      line-height: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transform: translate3d(-3px, 0, 0);
      transition:
        max-width 280ms cubic-bezier(.18, .84, .24, 1),
        margin-left 280ms cubic-bezier(.18, .84, .24, 1),
        margin-right 280ms cubic-bezier(.18, .84, .24, 1),
        opacity 210ms ease,
        transform 280ms cubic-bezier(.18, .84, .24, 1);
      will-change: max-width, opacity, transform;
    }

    .wp-filter-trigger {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 0;
      max-width: 128px;
      padding: 0 9px;
      overflow: hidden;
    }

    .wp-filter-trigger-icon {
      width: 15px; height: 15px; flex: 0 0 15px; font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.7;
    }

    .wp-filter-trigger-label {
      color: rgba(8, 11, 16, 0.64);
    }

    .wp-filter-trigger:hover .wp-filter-trigger-label,
    .wp-filter-trigger:focus-visible .wp-filter-trigger-label,
    .wp-filter-trigger.is-active .wp-filter-trigger-label,
    .wp-filter-trigger[aria-expanded="true"] .wp-filter-trigger-label {
      max-width: 86px;
      margin-left: 6px;
      margin-right: 5px;
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }

    .wp-filters.is-filter-crowded .wp-filter-trigger.is-active .wp-filter-trigger-label,
    .wp-filters.is-filter-crowded .wp-filter-trigger.is-active:hover .wp-filter-trigger-label,
    .wp-filters.is-filter-crowded .wp-filter-trigger.is-active:focus-visible .wp-filter-trigger-label,
    .wp-filters.is-filter-crowded .wp-filter-trigger[aria-expanded="true"] .wp-filter-trigger-label {
      max-width: 0;
      margin-left: 0;
      margin-right: 0;
      opacity: 0;
      transform: translate3d(-3px, 0, 0);
    }

    .wp-filter-chevron {
      width: 12px; height: 12px; font-size: inherit;
      stroke: currentColor;
      stroke-width: 2.35;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.62;
      transition: transform 220ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-filter-trigger[aria-expanded="true"] .wp-filter-chevron {
      transform: rotate(180deg);
    }

    ${panelFilterMenuPopoverStyles()}
  `;
}
