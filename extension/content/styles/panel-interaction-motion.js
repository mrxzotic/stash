function panelInteractionMotionStyles() {
  return `
    .wp-theme-graphite .wp-inline-search {
      border-color: rgba(132, 164, 255, 0.2);
      background:
        radial-gradient(circle at 12% 18%, rgba(78, 188, 255, 0.2), transparent 34%),
        radial-gradient(circle at 74% 0%, rgba(158, 116, 255, 0.18), transparent 38%),
        radial-gradient(circle at 92% 96%, rgba(255, 94, 182, 0.13), transparent 42%),
        linear-gradient(135deg, rgba(70, 142, 255, 0.1), rgba(142, 92, 255, 0.09) 48%, rgba(255, 114, 191, 0.08)),
        rgba(17, 18, 23, 0.94);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.08),
        0 14px 34px rgba(0, 0, 0, 0.34);
    }

    .wp-theme-graphite .wp-inline-search:focus-within {
      border-color: rgba(152, 184, 255, 0.34);
      background:
        radial-gradient(circle at 12% 18%, rgba(90, 202, 255, 0.25), transparent 36%),
        radial-gradient(circle at 74% 0%, rgba(170, 128, 255, 0.22), transparent 40%),
        radial-gradient(circle at 92% 96%, rgba(255, 104, 190, 0.16), transparent 44%),
        linear-gradient(135deg, rgba(82, 156, 255, 0.13), rgba(150, 98, 255, 0.11) 48%, rgba(255, 122, 198, 0.1)),
        rgba(18, 19, 25, 0.97);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 16px 38px rgba(0, 0, 0, 0.38);
    }

    .wp-theme-graphite .wp-inline-search-icon {
      color: rgba(194, 225, 255, 0.78);
    }

    .wp-theme-graphite .wp-inline-search:focus-within .wp-inline-search-icon {
      color: rgba(238, 244, 255, 0.96);
    }

    .wp-theme-graphite .wp-inline-search input::placeholder {
      color: rgba(226, 232, 246, 0.42);
    }

    .wp-theme-graphite .wp-inline-search:focus-within input::placeholder {
      color: rgba(210, 225, 255, 0.34);
    }

    .wp-shell,
    .wp-topbar,
    .wp-filters,
    .wp-items,
    .wp-item,
    .wp-media,
    .wp-image-frame,
    .wp-item::before {
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    }

    .wp-item:not(.is-layout-moving):not(.is-layout-settling):not(.is-layout-hover-muted) {
      transform: translate3d(0, 0, 0);
    }

    .wp-item:not(.is-layout-moving):not(.is-layout-settling):not(.is-layout-hover-muted):hover,
    .wp-item:not(.is-layout-moving):not(.is-layout-settling):not(.is-layout-hover-muted):focus-within {
      transform: translate3d(0, -3px, 0);
    }

    .wp-item:not(.is-layout-moving):not(.is-layout-settling):not(.is-layout-hover-muted):active {
      transform: translate3d(0, -1px, 0);
    }

    .wp-compact-item:not(.is-layout-moving):not(.is-layout-settling):not(.is-layout-hover-muted):hover,
    .wp-compact-item:not(.is-layout-moving):not(.is-layout-settling):not(.is-layout-hover-muted):focus-within,
    .wp-compact-item:not(.is-layout-moving):not(.is-layout-settling):not(.is-layout-hover-muted):active {
      transform: translate3d(0, 0, 0);
    }

    .wp-item::before,
    .wp-image-frame > img,
    .wp-image-placeholder {
      will-change: opacity, transform;
    }

    .wp-count,
    .wp-filter,
    .wp-icon-button,
    .wp-brand-save,
    .wp-topbar-info,
    .wp-total,
    .wp-sort-trigger,
    .wp-sort-option,
    .wp-clear-search {
      transition-timing-function: cubic-bezier(.22, 1, .36, 1);
      will-change: transform;
    }

    .wp-count {
      transition:
        color 220ms cubic-bezier(.22, 1, .36, 1),
        background 220ms cubic-bezier(.22, 1, .36, 1),
        border-color 220ms cubic-bezier(.22, 1, .36, 1),
        box-shadow 220ms cubic-bezier(.22, 1, .36, 1),
        transform 260ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-count::before {
      transition:
        opacity 260ms cubic-bezier(.22, 1, .36, 1),
        transform 340ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-filter {
      transition:
        background 220ms cubic-bezier(.22, 1, .36, 1),
        color 220ms cubic-bezier(.22, 1, .36, 1),
        border-color 220ms cubic-bezier(.22, 1, .36, 1),
        box-shadow 220ms cubic-bezier(.22, 1, .36, 1),
        opacity 220ms cubic-bezier(.22, 1, .36, 1),
        padding 260ms cubic-bezier(.22, 1, .36, 1),
        transform 260ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-filter:hover,
    .wp-filter:focus-visible {
      transform: translate3d(0, -1px, 0);
    }

    .wp-filter-shell {
      transition:
        width 300ms cubic-bezier(.22, 1, .36, 1),
        transform 300ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-filter-remove {
      transition:
        opacity 240ms cubic-bezier(.22, 1, .36, 1),
        color 180ms cubic-bezier(.22, 1, .36, 1),
        transform 300ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-filter-add {
      transition:
        opacity 240ms cubic-bezier(.22, 1, .36, 1),
        transform 300ms cubic-bezier(.22, 1, .36, 1),
        background 220ms cubic-bezier(.22, 1, .36, 1),
        border-color 220ms cubic-bezier(.22, 1, .36, 1),
        visibility 0s linear 240ms;
    }

    .wp-sort-controls,
    .wp-sort-menu {
      transition:
        opacity 240ms cubic-bezier(.22, 1, .36, 1),
        transform 300ms cubic-bezier(.22, 1, .36, 1),
        visibility 0s linear 240ms;
    }

    .wp-sort-trigger,
    .wp-sort-option,
    .wp-icon-button,
    .wp-brand-save,
    .wp-topbar-info,
    .wp-total,
    .wp-clear-search {
      transition:
        background 220ms cubic-bezier(.22, 1, .36, 1),
        color 220ms cubic-bezier(.22, 1, .36, 1),
        border-color 220ms cubic-bezier(.22, 1, .36, 1),
        box-shadow 220ms cubic-bezier(.22, 1, .36, 1),
        opacity 220ms cubic-bezier(.22, 1, .36, 1),
        filter 260ms cubic-bezier(.22, 1, .36, 1),
        transform 260ms cubic-bezier(.22, 1, .36, 1);
    }

    .wp-brand-save:hover,
    .wp-brand-save:focus-visible,
    .wp-topbar-info:hover,
    .wp-topbar-info:focus-visible,
    .wp-topbar-info[aria-expanded="true"] {
      transform: translate3d(0, -1px, 0) scale(1.012);
    }

    .wp-brand-save:active,
    .wp-topbar-info:active,
    .wp-icon-button:active,
    .wp-filter:active,
    .wp-count:active {
      transform: scale(0.96);
      transition-duration: 120ms;
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-count,
      .wp-count::before,
      .wp-filter,
      .wp-filter-shell,
      .wp-filter-remove,
      .wp-filter-add,
      .wp-sort-controls,
      .wp-sort-menu,
      .wp-sort-trigger,
      .wp-sort-option,
      .wp-icon-button,
      .wp-brand-save,
      .wp-topbar-info,
      .wp-total,
      .wp-clear-search {
        transition: none;
        transform: none;
      }
    }
  `;
}
