function renderFounderPromoTrigger() {
  return `
    <span class="wp-brand-wrap">
      <button class="wp-brand-mark" type="button" aria-label="About Alex Kornev" aria-expanded="${panelState.founderPromoOpen}" title="About Alex Kornev" data-founder-promo-trigger>Stash</button>
      <button class="wp-founder-peek" type="button" aria-label="About Alex Kornev" title="About Alex Kornev" data-founder-promo-trigger>
        <img src="${escapeAttribute(founderPhotoUrl())}" alt="">
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
    <button class="wp-founder-screen" type="button" aria-label="Close Alex Kornev contact card" data-founder-promo-close></button>
    <section class="wp-founder-modal wp-popover" role="dialog" aria-modal="true" aria-label="About Alex Kornev">
      <button class="wp-founder-close" type="button" aria-label="Close" title="Close" data-founder-promo-close>
        ${lucideXIcon("wp-founder-close-icon")}
      </button>
      <div class="wp-founder-profile">
        <img class="wp-founder-photo" src="${escapeAttribute(founderPhotoUrl())}" alt="">
        <div class="wp-founder-copy">
          <strong>Alex Kornev</strong>
          <span>@zoticx</span>
          ${version ? `<span class="wp-founder-version">${escapeHtml(version)}</span>` : ""}
        </div>
      </div>
      <div class="wp-founder-links" aria-label="Links and backup">
        ${renderFounderContact("X", "@zoticx", "https://x.com/zoticx", lucideAtSignIcon("wp-founder-link-icon"))}
        ${renderFounderContact("Telegram", "t.me/zoticx", "https://t.me/zoticx", lucideSendIcon("wp-founder-link-icon"))}
        ${renderFounderContact("Email", "a.kornev@me.com", "mailto:a.kornev@me.com", lucideMailIcon("wp-founder-link-icon"))}
        ${renderFounderContact("GitHub", "github.com/mrxzotic", "https://github.com/mrxzotic", lucideGithubIcon("wp-founder-link-icon"))}
        ${renderFounderContact("Site", "getstash.app", "https://getstash.app", lucideGlobeIcon("wp-founder-link-icon"))}
        ${renderFounderBackupAction()}
      </div>
    </section>
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

function renderFounderBackupAction() {
  return `
    <button class="wp-founder-link wp-founder-action" type="button" data-export-backup ${panelState.items.length ? "" : "disabled"}>
      <span class="wp-founder-link-mark">${lucideDownloadIcon("wp-founder-link-icon")}</span>
      <span class="wp-founder-link-copy">
        <span>Backup</span>
        <strong>Download JSON</strong>
      </span>
    </button>
  `;
}

function bindPanelFounderPromoEvents(root) {
  root.querySelectorAll("[data-founder-promo-trigger]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
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

function founderVersionLabel() {
  try {
    const version = chrome.runtime?.getManifest?.().version;
    return version ? `v ${version}` : "";
  } catch {
    return "";
  }
}
