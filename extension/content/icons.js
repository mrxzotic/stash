function lucideSearchIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m21 21-4.34-4.34"/>
      <circle cx="11" cy="11" r="8"/>
    </svg>
  `;
}

function lucideSettingsIcon() {
  return `
    <svg class="wp-lucide" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.32-1.915"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `;
}

function lucideChevronDownIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  `;
}

function lucideCheckIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  `;
}

function lucideXIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18"/>
      <path d="m6 6 12 12"/>
    </svg>
  `;
}

function lucidePlusIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14"/>
      <path d="M5 12h14"/>
    </svg>
  `;
}

function lucideLinkIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43"/>
      <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07l1.33-1.33"/>
    </svg>
  `;
}

function lucidePercentIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="19" y1="5" x2="5" y2="19"/>
      <circle cx="6.5" cy="6.5" r="2.5"/>
      <circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  `;
}

function lucideImageIcon(className = "wp-lucide") {
  return `
    <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/>
      <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>
    </svg>
  `;
}

function contourTshirtIcon() {
  return `
    <svg class="wp-empty-tee" viewBox="0 0 140 140" fill="none" aria-hidden="true">
      <path d="M50 26 34 31 18 54l22 14 8-12v56h44V56l8 12 22-14-16-23-16-5c-4 9-11 14-20 14s-16-5-20-14Z"/>
      <path d="M48 112h44"/>
      <path d="M48 57c7 4 14 6 22 6s15-2 22-6"/>
      <path d="M57 31c3 7 7 10 13 10s10-3 13-10"/>
    </svg>
  `;
}
