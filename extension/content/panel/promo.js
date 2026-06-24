function renderFounderPromoTrigger() {
  return `
    <span class="wp-brand-cluster">
      ${renderPanelSaveCurrentTrigger()}
      <button class="wp-topbar-info" type="button" aria-label="${escapeAttribute(t("About Tuckio"))}" aria-expanded="${panelState.founderPromoOpen}" title="${escapeAttribute(t("About Tuckio"))}" data-founder-promo-trigger>
        ${phosphorInfoIcon("wp-topbar-info-icon")}
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
    <section class="wp-founder-modal wp-popover" role="dialog" aria-modal="true" aria-labelledby="wp-founder-app-title" data-panel-modal data-founder-promo-dialog>
      <button class="wp-founder-close" type="button" aria-label="${escapeAttribute(t("Close"))}" title="${escapeAttribute(t("Close"))}" data-founder-promo-close>
        ${phosphorXIcon("wp-founder-close-icon")}
      </button>
      ${renderFounderAppIntro(version)}
      ${renderFounderBackupControls()}
      ${renderFounderPrivateContacts()}
      ${renderFounderDangerZone()}
    </section>
  `;
}

function renderFounderAppIntro(version) {
  return `
    <div class="wp-founder-app">
      <img class="wp-founder-app-logo" src="${escapeAttribute(tuckioLogoUrl())}" alt="Tuckio">
      <div class="wp-founder-app-copy">
        <strong id="wp-founder-app-title">Tuckio</strong>
        <p>${escapeHtml(t("Save products from any shop into a compact local wishlist."))}</p>
        <span class="wp-founder-meta">
          ${version ? `<span class="wp-founder-version">${escapeHtml(version)}</span>` : ""}
          <a class="wp-founder-site" href="https://tuckio.com" target="_blank" rel="noreferrer">tuckio.com</a>
        </span>
      </div>
    </div>
  `;
}

function renderFounderPrivateContacts() {
  return `
    <div class="wp-founder-section wp-founder-private" aria-label="${escapeAttribute(t("Author contacts"))}">
      <span class="wp-founder-section-title">${escapeHtml(t("Author"))}</span>
      <div class="wp-founder-person">
        <img class="wp-founder-photo" src="${escapeAttribute(founderPhotoUrl())}" alt="Alex Kornev">
        <span class="wp-founder-person-copy">
          <strong>Alex Kornev</strong>
        </span>
      </div>
      <div class="wp-founder-contact-icons" aria-label="${escapeAttribute(t("Author contact links"))}">
        ${renderFounderContactIcon("X", "@zoticx", "https://x.com/zoticx", phosphorXLogoIcon("wp-founder-link-icon"))}
        ${renderFounderContactIcon("Telegram", "t.me/zoticx", "https://t.me/zoticx", phosphorSendIcon("wp-founder-link-icon"))}
        ${renderFounderContactIcon("Email", "a.kornev@me.com", "mailto:a.kornev@me.com", phosphorMailIcon("wp-founder-link-icon"))}
        ${renderFounderContactIcon("GitHub", "github.com/mrxzotic", "https://github.com/mrxzotic", phosphorGithubLogoIcon("wp-founder-link-icon"))}
      </div>
    </div>
  `;
}

function renderFounderContactIcon(label, value, href, icon) {
  const description = `${label}: ${value}`;
  return `
    <a class="wp-founder-contact-icon" href="${escapeAttribute(href)}" target="${href.startsWith("mailto:") ? "_self" : "_blank"}" rel="noreferrer" aria-label="${escapeAttribute(description)}" title="${escapeAttribute(description)}">
      ${icon}
    </a>
  `;
}

function renderFounderBackupControls() {
  return `
    <div class="wp-founder-backup" aria-label="${escapeAttribute(t("Backup"))}">
      <span class="wp-founder-section-title">${escapeHtml(t("Backup"))}</span>
      <span class="wp-founder-backup-actions">
      ${panelHasExportableItems() ? `<button class="wp-founder-backup-action" type="button" aria-label="${escapeAttribute(t("Export backup"))}" title="${escapeAttribute(t("Export backup"))}" data-export-backup>
        ${phosphorDownloadIcon("wp-founder-action-icon")}
        <span>${escapeHtml(t("Export"))}</span>
      </button>` : ""}
      <button class="wp-founder-backup-action" type="button" aria-label="${escapeAttribute(t("Import backup"))}" title="${escapeAttribute(t("Import backup"))}" data-import-backup>
        ${phosphorUploadIcon("wp-founder-action-icon")}
        <span>${escapeHtml(t("Import"))}</span>
      </button>
      <input class="wp-founder-import-input" type="file" accept="application/json,.json" tabindex="-1" aria-hidden="true" data-import-backup-file>
      </span>
    </div>
  `;
}

function renderFounderDangerZone() {
  return `
    <div class="wp-founder-danger" aria-label="${escapeAttribute(t("Danger zone"))}" aria-expanded="false" data-reset-confirm-root>
      <div class="wp-founder-danger-head">
        <span class="wp-founder-danger-copy">
          <span>${escapeHtml(t("Danger zone"))}</span>
          <strong>${escapeHtml(t("Reset Tuckio"))}</strong>
          <small>${escapeHtml(t("Clear all local Tuckio data in this browser."))}</small>
        </span>
        <button class="wp-founder-reset-start" type="button" aria-label="${escapeAttribute(t("Reset Tuckio"))}" title="${escapeAttribute(t("Reset Tuckio"))}" aria-expanded="false" aria-controls="wp-founder-reset-confirm" data-reset-start>
          ${phosphorTrashIcon("wp-founder-reset-icon")}
          <span>${escapeHtml(t("Reset"))}</span>
        </button>
      </div>
      <div id="wp-founder-reset-confirm" class="wp-founder-reset-confirm" aria-hidden="true" data-reset-confirm-panel>
        <div class="wp-founder-reset-confirm-inner">
          <label class="wp-founder-reset-label" for="wp-founder-reset-input">${escapeHtml(t("Type delete to confirm."))}</label>
          <div class="wp-founder-reset-row">
            <input id="wp-founder-reset-input" class="wp-founder-reset-input" type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${escapeAttribute(TUCKIO_RESET_CONFIRM_WORD)}" disabled data-reset-confirm-input>
            <button class="wp-founder-reset-confirm-button" type="button" disabled data-reset-confirm>${escapeHtml(t("Delete all"))}</button>
          </div>
          <button class="wp-founder-reset-cancel" type="button" disabled data-reset-cancel>${escapeHtml(t("Cancel"))}</button>
        </div>
      </div>
    </div>
  `;
}

function bindPanelFounderPromoEvents(root) {
  root.querySelectorAll("[data-founder-promo-trigger]").forEach((button) => {
    bindPanelFounderPromoTrigger(button);
  });

  root.querySelectorAll("[data-founder-promo-close]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closePanelOverflowMenu(button.getRootNode());
      panelState.founderPromoOpen = false;
      syncPanelFounderPromoDialog(button.getRootNode());
    });
  });
}

function bindPanelFounderPromoTrigger(button) {
  if (!button || button.__tuckioFounderPromoBound) {
    return;
  }

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!panelState.founderPromoOpen) {
      rememberPanelFocus(button);
    }
    closePanelOverflowMenu(button.getRootNode());
    panelState.founderPromoOpen = !panelState.founderPromoOpen;
    syncPanelFounderPromoDialog(button.getRootNode());
  });
  button.__tuckioFounderPromoBound = true;
}

function syncPanelFounderPromoDialog(root = document.getElementById("tuckio-panel-root")?.shadowRoot) {
  const existing = root?.querySelector?.("[data-founder-promo-dialog]");
  if (!root || !panelState.founderPromoOpen) {
    existing?.remove();
    return;
  }
  if (existing) {
    return;
  }

  const template = document.createElement("template");
  template.innerHTML = renderFounderPromoDialog().trim();
  const dialog = template.content.firstElementChild;
  if (!dialog) {
    return;
  }

  root.querySelector(".wp-topbar")?.after(dialog);
  bindPanelFounderPromoEvents(root);
  bindPanelExportEvents(root);
}

function founderPhotoUrl() {
  try {
    return chrome.runtime.getURL("assets/alex-kornev.png");
  } catch {
    return "";
  }
}

function tuckioLogoUrl() {
  try {
    return chrome.runtime.getURL("assets/tuckio-app-open.png");
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
