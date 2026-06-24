function panelDecisionMotionStyles() {
  return `
    @media (prefers-reduced-motion: reduce) {
      .wp-shortlist.is-active .wp-card-action-icon,
      .wp-shortlist.is-active .wp-card-action-icon::before {
        animation: none;
      }

      .wp-decision-drop-tray,
      .wp-decision-drop-tray .wp-decision-pill,
      .wp-decision-pill-icon,
      .wp-decision-pill-label {
        transition: none;
      }
    }
  `;
}
