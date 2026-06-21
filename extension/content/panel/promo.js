function renderFounderPromoTrigger() {
  return `
    <span class="wp-brand-cluster">
      ${renderPanelSaveCurrentTrigger()}
      <button class="wp-topbar-info" type="button" aria-label="About Stashed" aria-expanded="${panelState.founderPromoOpen}" title="About Stashed" data-founder-promo-trigger>
        ${lucideInfoIcon("wp-topbar-info-icon")}
      </button>
    </span>
  `;
}

function renderFounderPromoDialog() {
  if (!panelState.founderPromoOpen) {
    return "";
  }

  const version = founderVersionLabel();
  return `
    <section class="wp-founder-modal wp-popover" role="dialog" aria-modal="true" aria-labelledby="wp-founder-app-title" data-panel-modal>
      <button class="wp-founder-close" type="button" aria-label="Close" title="Close" data-founder-promo-close>
        ${lucideXIcon("wp-founder-close-icon")}
      </button>
      ${renderFounderAppIntro(version)}
      ${renderFounderBackupActions()}
      ${renderFounderStashLinks()}
      ${renderFounderPrivateContacts()}
    </section>
  `;
}

function renderFounderAppIntro(version) {
  return `
    <div class="wp-founder-app">
      <img class="wp-founder-app-logo" src="${escapeAttribute(stashLogoUrl())}" alt="Stashed">
      <div class="wp-founder-app-copy">
        <strong id="wp-founder-app-title">Stashed</strong>
        <p>Save products from any shop into a compact local wishlist.</p>
        ${version ? `<span class="wp-founder-version">${escapeHtml(version)}</span>` : ""}
      </div>
    </div>
  `;
}

function renderFounderStashLinks() {
  return `
    <div class="wp-founder-section" aria-label="Product links">
      <span class="wp-founder-section-title">Product</span>
      <div class="wp-founder-links">
        ${renderFounderContact("Site", "getstash.app", "https://getstash.app", lucideGlobeIcon("wp-founder-link-icon"))}
      </div>
    </div>
  `;
}

function renderFounderPrivateContacts() {
  return `
    <div class="wp-founder-section wp-founder-private" aria-label="Founder contacts">
      <span class="wp-founder-section-title">Founder</span>
      <div class="wp-founder-person">
        <img class="wp-founder-photo" src="${escapeAttribute(founderPhotoUrl())}" alt="Alex Kornev">
        <strong>Alex Kornev</strong>
      </div>
      <div class="wp-founder-links">
        ${renderFounderContact("X", "@zoticx", "https://x.com/zoticx", xSocialIcon("wp-founder-x-icon"))}
        ${renderFounderContact("Telegram", "t.me/zoticx", "https://t.me/zoticx", lucideSendIcon("wp-founder-link-icon"))}
        ${renderFounderContact("Email", "a.kornev@me.com", "mailto:a.kornev@me.com", lucideMailIcon("wp-founder-link-icon"))}
        ${renderFounderContact("GitHub", "github.com/mrxzotic", "https://github.com/mrxzotic", lucideGithubIcon("wp-founder-link-icon"))}
      </div>
    </div>
  `;
}

function renderFounderContact(label, value, href, icon) {
  return `
    <a class="wp-founder-link" href="${escapeAttribute(href)}" target="${href.startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer">
      <span class="wp-founder-link-mark">${icon}</span>
      <span class="wp-founder-link-copy">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </span>
    </a>
  `;
}

function renderFounderBackupActions() {
  return `
    <div class="wp-founder-backup" aria-label="JSON backup">
      <div class="wp-founder-backup-copy">
        <span>Backup</span>
        <strong>Local JSON backup</strong>
        <small>Import merges with saved items.</small>
      </div>
      <div class="wp-founder-backup-actions">
        <button class="wp-founder-backup-action" type="button" aria-label="Export Stashed JSON" title="Export Stashed JSON" data-export-backup>
          ${lucideDownloadIcon("wp-founder-action-icon")}
          <span>Export JSON</span>
        </button>
        <button class="wp-founder-backup-action" type="button" aria-label="Import Stashed JSON" title="Import Stashed JSON" data-import-backup>
          ${lucideUploadIcon("wp-founder-action-icon")}
          <span>Import JSON</span>
        </button>
      </div>
      <input class="wp-founder-import-input" type="file" accept="application/json,.json" tabindex="-1" aria-hidden="true" data-import-backup-file>
    </div>
  `;
}

function bindPanelFounderPromoEvents(root) {
  root.querySelectorAll("[data-founder-promo-trigger]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!panelState.founderPromoOpen) {
        rememberPanelFocus(button);
      }
      panelState.founderPromoOpen = !panelState.founderPromoOpen;
      panelState.categoryComposerOpen = false;
      panelState.deleteCategoryId = "";
      panelState.deleteItemId = "";
      panelState.editItemId = "";
      renderStashPanel();
    });
  });

  root.querySelectorAll("[data-founder-promo-close]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      panelState.founderPromoOpen = false;
      renderStashPanel();
    });
  });
}

function founderPhotoUrl() {
  try {
    return chrome.runtime.getURL("assets/alex-kornev.png");
  } catch {
    return "";
  }
}

function stashLogoUrl() {
  try {
    return chrome.runtime.getURL("icons/stash-cart-48.png");
  } catch {
    return "";
  }
}

function founderVersionLabel() {
  try {
    const version = chrome.runtime?.getManifest?.().version;
    return version ? `v ${version}` : "";
  } catch {
    return "";
  }
}
