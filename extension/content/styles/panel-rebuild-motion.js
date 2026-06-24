function panelRebuildMotionStyles() {
  return `
    .wp-shell {
      transition:
        background-color 260ms cubic-bezier(.16, 1, .3, 1),
        border-color 260ms cubic-bezier(.16, 1, .3, 1),
        box-shadow 260ms cubic-bezier(.16, 1, .3, 1),
        color 260ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-summary-capsule,
    .wp-total,
    .wp-icon-button,
    .wp-brand-chip,
    .wp-filter,
    .wp-popover {
      transition:
        background 340ms cubic-bezier(.16, 1, .3, 1),
        background-color 340ms cubic-bezier(.16, 1, .3, 1),
        border-color 340ms cubic-bezier(.16, 1, .3, 1),
        box-shadow 340ms cubic-bezier(.16, 1, .3, 1),
        color 340ms cubic-bezier(.16, 1, .3, 1);
    }

    .wp-shell.is-view-rebuild .wp-items {
      animation: wpPanelViewRebuild 500ms cubic-bezier(.16, 1, .3, 1) both;
    }

    .wp-shell.is-static.is-view-rebuild .wp-item,
    .wp-shell.is-view-rebuild .wp-item,
    .wp-shell.is-view-rebuild .wp-brand-cloud-item {
      animation: wpPanelItemRebuild 430ms cubic-bezier(.18, .9, .22, 1) both;
    }

    .wp-shell.is-view-rebuild .wp-items:not(.is-compact) > .wp-item:nth-child(2n),
    .wp-shell.is-view-rebuild .wp-compact-item:nth-child(2n),
    .wp-shell.is-view-rebuild .wp-brand-cloud-item:nth-child(2n) {
      animation-delay: 45ms;
    }

    .wp-shell.is-view-rebuild .wp-compact-item:nth-child(3n),
    .wp-shell.is-view-rebuild .wp-brand-cloud-item:nth-child(3n) {
      animation-delay: 80ms;
    }

    .wp-shell.is-view-rebuild .wp-brand-cloud {
      animation: wpPanelCloudReveal 520ms cubic-bezier(.18, .9, .22, 1) both;
    }

    .wp-items.is-reordering .wp-item,
    .wp-items.is-reordering .wp-brand-cloud-item {
      animation: none !important;
    }

    .wp-item.is-layout-moving,
    .wp-item.is-layout-settling,
    .wp-item.is-layout-positioned,
    .wp-item.is-layout-hover-muted,
    .wp-brand-cloud-item.is-layout-moving,
    .wp-brand-cloud-item.is-layout-settling,
    .wp-brand-cloud-item.is-layout-positioned,
    .wp-brand-cloud-item.is-layout-hover-muted {
      z-index: 2;
      transform: translate3d(var(--wp-layout-dx, 0), var(--wp-layout-dy, 0), 0);
      will-change: transform;
    }

    .wp-item.is-layout-moving,
    .wp-brand-cloud-item.is-layout-moving {
      animation: none !important;
      transition: none !important;
    }

    .wp-item.is-layout-settling,
    .wp-brand-cloud-item.is-layout-settling {
      animation: none !important;
      transition:
        transform 520ms cubic-bezier(.18, .9, .22, 1);
    }

    .wp-item.is-layout-positioned,
    .wp-brand-cloud-item.is-layout-positioned {
      animation: none !important;
    }

    .wp-item.is-layout-hover-muted,
    .wp-brand-cloud-item.is-layout-hover-muted {
      animation: none !important;
      transition: none !important;
    }

    .wp-item.is-layout-moving::before,
    .wp-item.is-layout-settling::before,
    .wp-item.is-layout-hover-muted::before {
      opacity: 0 !important;
      transition: none !important;
    }

    .wp-item:is(.is-layout-moving, .is-layout-settling, .is-layout-hover-muted):hover .wp-image-slider-tray,
    .wp-item:is(.is-layout-moving, .is-layout-settling, .is-layout-hover-muted):hover .wp-image-slider,
    .wp-item:is(.is-layout-moving, .is-layout-settling, .is-layout-hover-muted):hover .wp-image-slider-button,
    .wp-item:is(.is-layout-moving, .is-layout-settling, .is-layout-hover-muted):hover .wp-restore,
    .wp-item:is(.is-layout-moving, .is-layout-settling, .is-layout-hover-muted):hover .wp-archive,
    .wp-item:is(.is-layout-moving, .is-layout-settling, .is-layout-hover-muted):hover .wp-edit,
    .wp-item:is(.is-layout-moving, .is-layout-settling, .is-layout-hover-muted):hover .wp-remove {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: none !important;
    }

    @keyframes wpPanelViewRebuild {
      0% {
        opacity: 0;
        transform: translateY(12px) scale(.992);
        filter: blur(8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpPanelCloudReveal {
      0% {
        opacity: 0;
        transform: translateY(16px) scale(.986);
        filter: blur(8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes wpPanelItemRebuild {
      0% {
        opacity: 0;
        transform: translateY(12px) scale(.985);
        filter: blur(6px);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .wp-shell.is-rebuilding,
      .wp-shell.is-rebuilding::before,
      .wp-shell.is-rebuilding::after,
      .wp-shell.is-rebuilding .wp-items,
      .wp-shell.is-view-rebuild .wp-brand-cloud,
      .wp-shell.is-static.is-view-rebuild .wp-item,
      .wp-shell.is-view-rebuild .wp-item,
      .wp-shell.is-view-rebuild .wp-brand-cloud-item,
      .wp-item.is-layout-moving,
      .wp-item.is-layout-settling,
      .wp-item.is-layout-positioned,
      .wp-item.is-layout-hover-muted,
      .wp-brand-cloud-item.is-layout-moving,
      .wp-brand-cloud-item.is-layout-settling,
      .wp-brand-cloud-item.is-layout-positioned,
      .wp-brand-cloud-item.is-layout-hover-muted {
        opacity: 1;
        transform: none;
        filter: none;
        animation: none;
        transition: none;
      }
    }
  `;
}
