function renderSavedOverlaySkeleton() {
  return `
    <span class="wl-skeleton-layer" aria-hidden="true">
      <span class="wl-skeleton-head">
        <span class="wl-skeleton-line is-title"></span>
        <span class="wl-skeleton-line is-caption"></span>
        <span class="wl-skeleton-controls">
          <span></span>
          <span></span>
        </span>
        <span class="wl-skeleton-line is-timer"></span>
      </span>
      <span class="wl-skeleton-media"></span>
      <span class="wl-skeleton-fields">
        <span class="wl-skeleton-field"><span></span><span></span></span>
        <span class="wl-skeleton-field is-wide"><span></span><span></span></span>
        <span class="wl-skeleton-field"><span></span><span></span></span>
      </span>
      <span class="wl-skeleton-actions">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </span>
  `;
}
