function panelDecisionMotionStyles() {
  return `
    @media (prefers-reduced-motion: reduce) {
      .wp-shortlist.is-active .wp-card-action-icon,
      .wp-shortlist.is-active .wp-card-action-icon::before {
        animation: none;
      }
    }
  `;
}
