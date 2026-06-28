function panelDecisionMotionStyles() {
  return `
    @media (prefers-reduced-motion: reduce) {
      .wp-shortlist.is-active .wp-card-action-icon,
      .wp-shortlist.is-active .wp-card-action-icon::before {
        animation: none;
      }

      .wp-decision-scrim,
      .wp-decision-drop-tray,
      .wp-decision-drop-tray .wp-decision-pill,
      .wp-shell.is-decision-mode .wp-item,
      .wp-shell.is-decision-dragging .wp-item,
      .wp-decision-pill-icon,
      .wp-decision-pill-label {
        transition: none;
      }
    }
  `;
}
